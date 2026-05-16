import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import {
  Plus, Users, ArrowLeft, Loader2, X, Trash2,
  CheckCircle, Clock, Eye, Circle, UserPlus, Crown
} from 'lucide-react';
import toast from 'react-hot-toast';

const COLUMNS = [
  { id: 'todo', label: 'To Do', icon: Circle, color: '#94a3b8', dotGlow: 'rgba(148, 163, 184, 0.4)' },
  { id: 'in-progress', label: 'In Progress', icon: Clock, color: '#22d3ee', dotGlow: 'rgba(34, 211, 238, 0.4)' },
  { id: 'review', label: 'Review', icon: Eye, color: '#c084fc', dotGlow: 'rgba(192, 132, 252, 0.4)' },
  { id: 'done', label: 'Done', icon: CheckCircle, color: '#34d399', dotGlow: 'rgba(52, 211, 153, 0.4)' },
];

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taskModal, setTaskModal] = useState({ open: false, task: null });
  const [activeTab, setActiveTab] = useState('board');
  const [memberModal, setMemberModal] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('Member');
  const [addingMember, setAddingMember] = useState(false);

  const isAdmin = project?.members?.find(m => m.user?._id === user?._id)?.role === 'Admin';

  const fetchData = async () => {
    try {
      const [projRes, taskRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks?project=${id}`)
      ]);
      setProject(projRes.data.project);
      setTasks(taskRes.data.tasks);
    } catch (err) {
      toast.error('Failed to load project');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleSaveTask = async (data, taskId) => {
    try {
      if (taskId) {
        const res = await api.put(`/tasks/${taskId}`, data);
        setTasks(t => t.map(task => task._id === taskId ? res.data.task : task));
        toast.success('Task updated');
      } else {
        const res = await api.post('/tasks', data);
        setTasks(t => [res.data.task, ...t]);
        toast.success('Task created');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task');
      throw err;
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(t => t.filter(task => task._id !== taskId));
      toast.success('Task deleted');
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setAddingMember(true);
    try {
      const res = await api.post(`/projects/${id}/members`, { email: memberEmail, role: memberRole });
      setProject(res.data.project);
      setMemberEmail('');
      setMemberRole('Member');
      toast.success('Member added!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this member?')) return;
    try {
      await api.delete(`/projects/${id}/members/${userId}`);
      setProject(p => ({ ...p, members: p.members.filter(m => m.user?._id !== userId) }));
      toast.success('Member removed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm('Delete this project and all its tasks? This cannot be undone.')) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Project deleted');
      navigate('/projects');
    } catch (err) {
      toast.error('Failed to delete project');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-10 h-10 rounded-full animate-spin"
        style={{ border: '3px solid transparent', borderTopColor: '#818cf8', borderRightColor: '#a855f7' }} />
    </div>
  );

  const tasksByStatus = (status) => tasks.filter(t => t.status === status);

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Header */}
      <div className="border-b border-white/[0.06] bg-white/[0.02] backdrop-blur-sm px-8 py-5">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => navigate('/projects')} className="btn-ghost p-2 -ml-2">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${project?.color}30, ${project?.color}10)`, border: `1px solid ${project?.color}40` }}>
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: project?.color, boxShadow: `0 0 10px ${project?.color}60` }} />
          </div>
          <div className="flex-1">
            <h1 className="font-display text-xl font-bold text-white">{project?.name}</h1>
            {project?.description && <p className="text-sm text-slate-400">{project.description}</p>}
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <>
                <button onClick={() => setMemberModal(true)} className="btn-secondary flex items-center gap-2 text-sm">
                  <UserPlus className="w-4 h-4" /> Members
                </button>
                <button onClick={handleDeleteProject} className="btn-ghost p-2 text-rose-400 hover:text-rose-300">
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            <button onClick={() => setTaskModal({ open: true, task: null })} className="btn-primary flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" /> Add Task
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1">
          {['board', 'members'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 capitalize ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-indigo-500/15 to-purple-500/15 text-indigo-300 border border-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'board' && (
          <div className="grid grid-cols-4 gap-4 h-full min-w-max">
            {COLUMNS.map(col => (
              <div key={col.id} className="flex flex-col bg-white/[0.02] rounded-2xl border border-white/[0.05]" style={{ minWidth: 280, maxWidth: 320 }}>
                <div className="flex items-center justify-between p-4 border-b border-white/[0.05]">
                  <div className="flex items-center gap-2">
                    <div className="col-dot" style={{ color: col.color, backgroundColor: col.color, boxShadow: `0 0 8px ${col.dotGlow}` }} />
                    <span className="text-sm font-medium text-slate-300">{col.label}</span>
                    <span className="text-xs bg-white/[0.06] text-slate-400 rounded-full px-2 py-0.5 font-mono border border-white/[0.06]">
                      {tasksByStatus(col.id).length}
                    </span>
                  </div>
                  <button onClick={() => setTaskModal({ open: true, task: null })}
                    className="text-slate-500 hover:text-slate-300 transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 p-3 space-y-2 overflow-y-auto">
                  {tasksByStatus(col.id).map(task => (
                    <TaskCard key={task._id} task={task} isAdmin={isAdmin}
                      onEdit={(t) => setTaskModal({ open: true, task: t })}
                      onDelete={handleDeleteTask} />
                  ))}
                  {tasksByStatus(col.id).length === 0 && (
                    <div className="text-center py-8 text-slate-600 text-sm">
                      No tasks yet
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'members' && (
          <div className="max-w-2xl">
            <div className="card divide-y divide-white/[0.04]">
              {project?.members?.map(m => (
                <div key={m.user?._id} className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
                      {m.user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-slate-200">{m.user?.name}</p>
                        {m.role === 'Admin' && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                      </div>
                      <p className="text-xs text-slate-500">{m.user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge text-xs ${m.role === 'Admin' ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20' : 'bg-white/[0.06] text-slate-400 border border-white/[0.06]'}`}>
                      {m.role}
                    </span>
                    {isAdmin && m.user?._id !== project?.owner?._id && m.user?._id !== user?._id && (
                      <button onClick={() => handleRemoveMember(m.user?._id)}
                        className="text-slate-500 hover:text-rose-400 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Task Modal */}
      {taskModal.open && (
        <TaskModal
          task={taskModal.task}
          members={project?.members}
          projectId={id}
          onSave={handleSaveTask}
          onClose={() => setTaskModal({ open: false, task: null })}
        />
      )}

      {/* Add Member Modal */}
      {memberModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold gradient-text">Add Member</h2>
              <button onClick={() => setMemberModal(false)} className="btn-ghost p-2"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                <input type="email" className="input" placeholder="colleague@example.com"
                  value={memberEmail} onChange={e => setMemberEmail(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Role</label>
                <select className="input" value={memberRole} onChange={e => setMemberRole(e.target.value)}>
                  <option value="Member">Member</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setMemberModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={addingMember} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {addingMember ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
