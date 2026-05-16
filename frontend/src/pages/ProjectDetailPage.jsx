import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import {
  Plus, Users, ArrowLeft, Loader2, X, Trash2,
  CheckCircle, Clock, Eye, Circle, UserPlus, Crown, MoreVertical, Search, Settings
} from 'lucide-react';
import toast from 'react-hot-toast';

const COLUMNS = [
  { id: 'todo', label: 'To Do', icon: Circle, color: '#94a3b8' },
  { id: 'in-progress', label: 'In Progress', icon: Clock, color: '#3b82f6' },
  { id: 'review', label: 'Review', icon: Eye, color: '#a855f7' },
  { id: 'done', label: 'Done', icon: CheckCircle, color: '#10b981' },
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

  const isAdmin = user?.role === 'admin';
  const isProjectAdmin = project?.members?.find(m => m.user?._id === user?._id)?.role === 'Admin';
  const canManageTasks = isAdmin || isProjectAdmin;

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
    <div className="flex items-center justify-center h-full py-20">
      <div className="w-10 h-10 rounded-full animate-spin border-t-indigo-500 border-2 border-white/10" />
    </div>
  );

  const tasksByStatus = (status) => tasks.filter(t => t.status === status);

  return (
    <div className="flex flex-col h-full animate-fade-in space-y-6">
      {/* Premium Sub-Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/[0.06]">
        <div className="flex items-center gap-5">
           <button onClick={() => navigate('/projects')} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.08] transition-all">
             <ArrowLeft className="w-4 h-4 text-slate-400" />
           </button>
           <div>
             <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-white tracking-tight">{project?.name}</h1>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: project?.color, boxShadow: `0 0 10px ${project?.color}60` }} />
             </div>
             <p className="text-sm text-slate-500 max-w-lg truncate">{project?.description || 'No description provided.'}</p>
           </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex -space-x-2 mr-4">
             {project?.members?.slice(0, 5).map(m => (
               <div key={m.user?._id} title={m.user?.name} className="w-8 h-8 rounded-full border-2 border-[#0a0a0f] bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white">
                 {m.user?.name?.charAt(0).toUpperCase()}
               </div>
             ))}
             {project?.members?.length > 5 && (
               <div className="w-8 h-8 rounded-full bg-white/5 border-2 border-[#0a0a0f] flex items-center justify-center text-[10px] text-slate-400 font-bold">
                 +{project.members.length - 5}
               </div>
             )}
          </div>
          {canManageTasks && (
            <button onClick={() => setMemberModal(true)} className="btn-secondary py-2 text-xs">
              <UserPlus className="w-3.5 h-3.5" />
            </button>
          )}
          {canManageTasks && (
            <button onClick={() => setTaskModal({ open: true, task: null })} className="btn-primary py-2 text-xs px-6">
              <Plus className="w-4 h-4" /> Add Task
            </button>
          )}
          <button className="btn-secondary py-2 text-xs">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 p-1 bg-white/[0.03] border border-white/[0.06] rounded-xl">
           {['board', 'members', 'timeline'].map(tab => (
             <button key={tab} onClick={() => setActiveTab(tab)}
               className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all capitalize ${
                 activeTab === tab ? 'bg-white/[0.08] text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
               }`}>
               {tab}
             </button>
           ))}
        </div>
        <div className="relative group">
           <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
           <input type="text" placeholder="Filter tasks..." className="input py-1.5 pl-9 text-[11px] w-48" />
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto pb-4">
        {activeTab === 'board' && (
          <div className="flex gap-6 h-full min-w-max pb-2">
            {COLUMNS.map(col => (
              <div key={col.id} className="w-[300px] flex flex-col group/col">
                <div className="flex items-center justify-between mb-4 px-2">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{col.label}</span>
                      <span className="text-[10px] bg-white/5 text-slate-500 px-1.5 py-0.5 rounded-md font-mono border border-white/5">
                        {tasksByStatus(col.id).length}
                      </span>
                   </div>
                   {canManageTasks && (
                     <button onClick={() => setTaskModal({ open: true, task: null })} className="opacity-0 group-hover/col:opacity-100 transition-opacity p-1 hover:bg-white/5 rounded">
                       <Plus className="w-3.5 h-3.5 text-slate-500" />
                     </button>
                   )}
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto min-h-[500px]">
                  {tasksByStatus(col.id).map(task => (
                    <TaskCard key={task._id} task={task} isAdmin={canManageTasks}
                      onEdit={(t) => canManageTasks && setTaskModal({ open: true, task: t })}
                      onDelete={handleDeleteTask} />
                  ))}
                  {canManageTasks && (
                    <button onClick={() => setTaskModal({ open: true, task: null })}
                      className="w-full py-4 border border-dashed border-white/[0.05] rounded-xl text-slate-600 hover:text-slate-400 hover:border-white/[0.1] hover:bg-white/[0.01] transition-all text-xs font-medium">
                      + Create new task
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'members' && (
          <div className="max-w-3xl">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project?.members?.map(m => (
                  <div key={m.user?._id} className="card p-5 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-sm font-bold text-white shadow-inner">
                        {m.user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-white">{m.user?.name}</p>
                          {m.role === 'Admin' && <Crown className="w-3 h-3 text-amber-400" />}
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">{m.user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${m.role === 'Admin' ? 'border-amber-500/20 text-amber-400 bg-amber-500/5' : 'border-white/10 text-slate-500 bg-white/5'}`}>
                        {m.role}
                      </span>
                      {canManageTasks && m.user?._id !== project?.owner?._id && m.user?._id !== user?._id && (
                        <button onClick={() => handleRemoveMember(m.user?._id)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-rose-400 transition-all">
                          <Trash2 className="w-4 h-4" />
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

      {/* Member Modal */}
      {memberModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="card w-full max-w-md p-8 animate-fade-in">
             <div className="flex items-center justify-between mb-8">
               <h2 className="text-2xl font-bold text-white tracking-tight">Add Collaborator</h2>
               <button onClick={() => setMemberModal(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                 <X className="w-5 h-5 text-slate-500" />
               </button>
             </div>
             <form onSubmit={handleAddMember} className="space-y-6">
               <div>
                 <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
                 <input type="email" className="input" placeholder="colleague@example.com"
                   value={memberEmail} onChange={e => setMemberEmail(e.target.value)} required />
               </div>
               <div>
                 <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Access Level</label>
                 <select className="input" value={memberRole} onChange={e => setMemberRole(e.target.value)}>
                   <option value="Member">Member (View & Status Only)</option>
                   <option value="Admin">Admin (Full Control)</option>
                 </select>
               </div>
               <div className="flex gap-3 pt-4">
                 <button type="button" onClick={() => setMemberModal(false)} className="btn-secondary flex-1 py-3">Cancel</button>
                 <button type="submit" disabled={addingMember} className="btn-primary flex-1 py-3 group">
                   {addingMember ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                     <>
                       <span>Add to Project</span>
                       <UserPlus className="w-4 h-4" />
                     </>
                   )}
                 </button>
               </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
