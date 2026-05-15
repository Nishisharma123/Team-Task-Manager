const express = require('express');
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Middleware: check if user is project member
const isMember = async (req, res, next) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
  const member = project.members.find(m => m.user.toString() === req.user._id.toString());
  if (!member) return res.status(403).json({ success: false, message: 'Not a member of this project' });
  req.project = project;
  req.memberRole = member.role;
  next();
};

const isAdmin = async (req, res, next) => {
  await isMember(req, res, async () => {
    if (req.memberRole !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    next();
  });
};

// GET /api/projects - Get all projects for user
router.get('/', protect, async (req, res) => {
  try {
    const projects = await Project.find({ 'members.user': req.user._id })
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .sort('-createdAt');
    res.json({ success: true, projects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/projects - Create project
router.post('/', protect, [
  body('name').trim().notEmpty().withMessage('Project name is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  try {
    const { name, description, color, dueDate } = req.body;
    const project = await Project.create({
      name, description, color, dueDate,
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'Admin' }]
    });
    await project.populate('owner', 'name email avatar');
    await project.populate('members.user', 'name email avatar');
    res.status(201).json({ success: true, project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/projects/:id
router.get('/:id', protect, isMember, async (req, res) => {
  await req.project.populate('owner', 'name email avatar');
  await req.project.populate('members.user', 'name email avatar');
  res.json({ success: true, project: req.project });
});

// PUT /api/projects/:id
router.put('/:id', protect, isAdmin, async (req, res) => {
  try {
    const { name, description, color, status, dueDate } = req.body;
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { name, description, color, status, dueDate },
      { new: true, runValidators: true }
    ).populate('owner', 'name email avatar').populate('members.user', 'name email avatar');
    res.json({ success: true, project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/projects/:id
router.delete('/:id', protect, isAdmin, async (req, res) => {
  try {
    await Task.deleteMany({ project: req.params.id });
    await Project.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/projects/:id/members - Add member
router.post('/:id/members', protect, isAdmin, async (req, res) => {
  try {
    const { email, role } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const project = req.project;
    const exists = project.members.find(m => m.user.toString() === user._id.toString());
    if (exists) return res.status(400).json({ success: false, message: 'User already a member' });
    project.members.push({ user: user._id, role: role || 'Member' });
    await project.save();
    await project.populate('members.user', 'name email avatar');
    res.json({ success: true, project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/projects/:id/members/:userId - Remove member
router.delete('/:id/members/:userId', protect, isAdmin, async (req, res) => {
  try {
    const project = req.project;
    if (req.params.userId === project.owner.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot remove project owner' });
    }
    project.members = project.members.filter(m => m.user.toString() !== req.params.userId);
    await project.save();
    res.json({ success: true, message: 'Member removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/projects/:id/stats
router.get('/:id/stats', protect, isMember, async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.id });
    const stats = {
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'todo').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      review: tasks.filter(t => t.status === 'review').length,
      done: tasks.filter(t => t.status === 'done').length,
      overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length
    };
    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
