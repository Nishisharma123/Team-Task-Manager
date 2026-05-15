const express = require('express');
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

const router = express.Router();

const checkProjectAccess = async (req, res, next) => {
  const projectId = req.body.project || req.query.project || req.params.projectId;
  if (!projectId) return res.status(400).json({ success: false, message: 'Project ID required' });
  const project = await Project.findById(projectId);
  if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
  const member = project.members.find(m => m.user.toString() === req.user._id.toString());
  if (!member) return res.status(403).json({ success: false, message: 'Not a member of this project' });
  req.project = project;
  req.memberRole = member.role;
  next();
};

// GET /api/tasks?project=:projectId
router.get('/', protect, async (req, res) => {
  try {
    const { project, status, assignee, priority } = req.query;
    if (!project) return res.status(400).json({ success: false, message: 'Project ID required' });

    const proj = await Project.findById(project);
    if (!proj) return res.status(404).json({ success: false, message: 'Project not found' });
    const isMember = proj.members.some(m => m.user.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ success: false, message: 'Access denied' });

    const filter = { project };
    if (status) filter.status = status;
    if (assignee) filter.assignee = assignee;
    if (priority) filter.priority = priority;

    const tasks = await Task.find(filter)
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort('-createdAt');
    res.json({ success: true, tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/tasks
router.post('/', protect, [
  body('title').trim().notEmpty().withMessage('Task title required'),
  body('project').notEmpty().withMessage('Project ID required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const proj = await Project.findById(req.body.project);
    if (!proj) return res.status(404).json({ success: false, message: 'Project not found' });
    const isMember = proj.members.some(m => m.user.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ success: false, message: 'Access denied' });

    const { title, description, status, priority, assignee, dueDate, tags } = req.body;
    const task = await Task.create({
      title, description, status, priority, assignee: assignee || null,
      dueDate, tags, project: req.body.project, createdBy: req.user._id
    });
    await task.populate('assignee', 'name email avatar');
    await task.populate('createdBy', 'name email avatar');
    res.status(201).json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/tasks/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('project', 'name');
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const proj = await Project.findById(task.project._id || task.project);
    const isMember = proj.members.some(m => m.user.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ success: false, message: 'Access denied' });

    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/tasks/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const proj = await Project.findById(task.project);
    const member = proj.members.find(m => m.user.toString() === req.user._id.toString());
    if (!member) return res.status(403).json({ success: false, message: 'Access denied' });

    const { title, description, status, priority, assignee, dueDate, tags } = req.body;
    Object.assign(task, { title, description, status, priority, dueDate, tags });
    if (assignee !== undefined) task.assignee = assignee || null;
    await task.save();
    await task.populate('assignee', 'name email avatar');
    await task.populate('createdBy', 'name email avatar');
    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const proj = await Project.findById(task.project);
    const member = proj.members.find(m => m.user.toString() === req.user._id.toString());
    if (!member) return res.status(403).json({ success: false, message: 'Access denied' });
    if (member.role !== 'Admin' && task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only admins or task creator can delete' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/tasks/dashboard/overview - Dashboard stats for user
router.get('/dashboard/overview', protect, async (req, res) => {
  try {
    const projects = await Project.find({ 'members.user': req.user._id }).select('_id');
    const projectIds = projects.map(p => p._id);

    const allTasks = await Task.find({ project: { $in: projectIds } });
    const myTasks = await Task.find({ assignee: req.user._id })
      .populate('project', 'name color')
      .populate('assignee', 'name email avatar')
      .sort('dueDate')
      .limit(10);

    const now = new Date();
    const stats = {
      totalProjects: projects.length,
      totalTasks: allTasks.length,
      myTasks: allTasks.filter(t => t.assignee?.toString() === req.user._id.toString()).length,
      overdue: allTasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done').length,
      completed: allTasks.filter(t => t.status === 'done').length,
      inProgress: allTasks.filter(t => t.status === 'in-progress').length,
    };

    res.json({ success: true, stats, recentTasks: myTasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
