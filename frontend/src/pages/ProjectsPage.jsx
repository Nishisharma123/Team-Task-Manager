import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Plus, FolderKanban, Users, Calendar, Loader2, X, Sparkles, LayoutGrid, List, Search } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

const PROJECT_COLORS = ['#6366f1','#a855f7','#ec4899','#f97316','#eab308','#10b981','#06b6d4','#3b82f6'];

const statusBadge = {
  active: 'status-in-progress',
  completed: 'status-done',
  'on-hold': 'priority-medium',
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', color: '#6366f1', dueDate: '' });
  const [creating, setCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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
      setForm({ name: '', description: '', color: '#6366f1', dueDate: '' });
      toast.success('Project created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const filteredProjects = projects.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="max-w-6xl mx-auto animate-fade-in space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            Projects Library
            <span className="text-xs bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/20">
              {projects.length} Total
            </span>
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-medium tracking-wide">Manage and organize your team's initiatives.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative group flex-1 md:flex-none">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Search projects..." 
                className="input py-2 pl-10 text-xs w-full md:w-64"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
           </div>
           <button onClick={() => setShowModal(true)} className="btn-primary py-2 text-xs">
             <Plus className="w-4 h-4" /> New Project
           </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-10 h-10 rounded-full animate-spin border-t-indigo-500 border-2 border-white/10" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="card p-20 text-center border-dashed border-white/10">
          <div className="w-16 h-16 bg-white/[0.03] rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-inner">
            <FolderKanban className="w-8 h-8 text-slate-700" />
          </div>
          <h3 className="text-white font-bold text-xl mb-2">No projects found</h3>
          <p className="text-slate-500 mb-8 max-w-xs mx-auto">Either you haven't created any projects yet or your search query didn't match anything.</p>
          <button onClick={() => setShowModal(true)} className="btn-primary mx-auto py-2.5 px-8">
            Start Your First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <Link key={project._id} to={`/projects/${project._id}`} className="card p-0 group flex flex-col overflow-hidden">
              {/* Card Header with Color Accent */}
              <div className="h-2 w-full" style={{ backgroundColor: project.color }} />
              
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors truncate tracking-tight">{project.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`badge ${statusBadge[project.status]}`}>{project.status}</span>
                      <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">v1.0</span>
                    </div>
                  </div>
                </div>

                {project.description && (
                  <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed min-h-[40px]">{project.description}</p>
                )}

                <div className="pt-4 border-t border-white/[0.04] flex items-center justify-between">
                   <div className="flex items-center gap-4 text-[11px] text-slate-400 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        {project.members?.length || 0}
                      </span>
                      {project.dueDate && (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {format(parseISO(project.dueDate), 'MMM d')}
                        </span>
                      )}
                   </div>
                   <div className="flex -space-x-2">
                      {project.members?.slice(0, 3).map(m => (
                        <div key={m.user?._id} className="w-6 h-6 rounded-full border-2 border-[#0a0a0f] bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                          {m.user?.name?.charAt(0).toUpperCase()}
                        </div>
                      ))}
                      {project.members?.length > 3 && (
                        <div className="w-6 h-6 rounded-full bg-white/5 border-2 border-[#0a0a0f] flex items-center justify-center text-[8px] text-slate-400 font-bold">
                          +{project.members.length - 3}
                        </div>
                      )}
                   </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Modal Overhaul */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="card w-full max-w-lg p-8 animate-fade-in shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-white tracking-tight">Initiate Project</h2>
                <p className="text-xs text-slate-500 font-medium">Define your team's next major goal.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-6">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Project Name</label>
                <input className="input" placeholder="e.g. Q4 Marketing Campaign" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Description</label>
                <textarea className="input resize-none" rows={3} placeholder="Briefly describe the objective..."
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Theme Color</label>
                  <div className="flex gap-2 flex-wrap mt-1">
                    {PROJECT_COLORS.map(c => (
                      <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
                        className={`w-6 h-6 rounded-md transition-all duration-200 border-2 ${form.color === c ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`}
                        style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Target Date</label>
                  <input type="date" className="input py-2 text-xs" value={form.dueDate}
                    onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 py-3">Cancel</button>
                <button type="submit" disabled={creating} className="btn-primary flex-1 py-3 group">
                  {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      <span>Deploy Project</span>
                      <Sparkles className="w-4 h-4 transition-transform group-hover:rotate-12" />
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
