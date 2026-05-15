import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Plus, FolderKanban, Users, Calendar, Loader2, X, Palette } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

const PROJECT_COLORS = ['#6172f5','#8b5cf6','#ec4899','#f97316','#eab308','#22c55e','#14b8a6','#3b82f6'];

const statusBadge = {
  active: 'text-green-400 bg-green-400/10',
  completed: 'text-blue-400 bg-blue-400/10',
  'on-hold': 'text-yellow-400 bg-yellow-400/10',
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', color: '#6172f5', dueDate: '' });
  const [creating, setCreating] = useState(false);

  const fetchProjects = () => {
    api.get('/projects').then(res => setProjects(res.data.projects))
      .catch(() => toast.error('Failed to load projects'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Project name is required');
    setCreating(true);
    try {
      const res = await api.post('/projects', form);
      setProjects(p => [res.data.project, ...p]);
      setShowModal(false);
      setForm({ name: '', description: '', color: '#6172f5', dueDate: '' });
      toast.success('Project created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Projects</h1>
          <p className="text-slate-400 mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''} total</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <div className="card p-16 text-center">
          <FolderKanban className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <h3 className="text-slate-200 font-display font-bold text-xl mb-2">No projects yet</h3>
          <p className="text-slate-400 mb-6">Create your first project to get started</p>
          <button onClick={() => setShowModal(true)} className="btn-primary inline-flex items-center gap-2 mx-auto">
            <Plus className="w-4 h-4" /> Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(project => (
            <Link key={project._id} to={`/projects/${project._id}`} className="card p-6 hover:border-slate-700 transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 group block">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: project.color + '20', border: `1px solid ${project.color}40` }}>
                  <FolderKanban className="w-5 h-5" style={{ color: project.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-white truncate group-hover:text-brand-300 transition-colors">{project.name}</h3>
                  <span className={`badge text-xs ${statusBadge[project.status]}`}>{project.status}</span>
                </div>
              </div>

              {project.description && (
                <p className="text-sm text-slate-400 mb-4 line-clamp-2">{project.description}</p>
              )}

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  {project.members?.length || 0} member{project.members?.length !== 1 ? 's' : ''}
                </span>
                {project.dueDate && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {format(parseISO(project.dueDate), 'MMM d, yyyy')}
                  </span>
                )}
              </div>

              {/* Member avatars */}
              <div className="flex -space-x-2 mt-3">
                {project.members?.slice(0, 4).map(m => (
                  <div key={m.user?._id} title={m.user?.name}
                    className="w-7 h-7 rounded-full bg-brand-700 border-2 border-slate-900 flex items-center justify-center text-xs font-bold text-white">
                    {m.user?.name?.charAt(0).toUpperCase()}
                  </div>
                ))}
                {project.members?.length > 4 && (
                  <div className="w-7 h-7 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-xs text-slate-300">
                    +{project.members.length - 4}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-white">New Project</h2>
              <button onClick={() => setShowModal(false)} className="btn-ghost p-2">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Name *</label>
                <input className="input" placeholder="Project name" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea className="input resize-none" rows={3} placeholder="Optional description..."
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {PROJECT_COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
                      className={`w-8 h-8 rounded-full transition-all ${form.color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : 'hover:scale-105'}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Due Date</label>
                <input type="date" className="input" value={form.dueDate}
                  onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={creating} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
