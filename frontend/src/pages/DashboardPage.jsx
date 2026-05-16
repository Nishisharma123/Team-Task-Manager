import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { FolderKanban, CheckCircle2, Clock, AlertTriangle, TrendingUp, ArrowRight, Calendar, Sparkles, Filter } from 'lucide-react';
import { format, isAfter, parseISO } from 'date-fns';

const priorityClasses = {
  urgent: 'priority-urgent',
  high: 'priority-high',
  medium: 'priority-medium',
  low: 'priority-low',
};

const statusClasses = {
  todo: 'status-todo',
  'in-progress': 'status-in-progress',
  review: 'status-review',
  done: 'status-done',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tasks/dashboard/overview').then(res => {
      setStats(res.data.stats);
      setRecentTasks(res.data.recentTasks);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-10 h-10 rounded-full animate-spin border-t-indigo-500 border-2 border-white/10" />
    </div>
  );

  const statCards = [
    { label: 'Active Projects', value: stats?.totalProjects || 0, icon: FolderKanban, color: '#6366f1' },
    { label: 'Tasks Assigned', value: stats?.myTasks || 0, icon: CheckCircle2, color: '#10b981' },
    { label: 'In Progress', value: stats?.inProgress || 0, icon: TrendingUp, color: '#06b6d4' },
    { label: 'Overdue', value: stats?.overdue || 0, icon: AlertTriangle, color: '#f43f5e' },
  ];

  return (
    <div className="max-w-6xl mx-auto animate-fade-in space-y-10">
      {/* Welcome Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2 text-indigo-400 font-semibold text-xs uppercase tracking-[0.2em]">
            <Sparkles className="w-3 h-3" />
            <span>Dashboard Overview</span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            {getGreeting()}, <span className="text-slate-400 font-normal">{user?.name?.split(' ')[0]}</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
           <button className="btn-secondary text-xs py-2 flex items-center gap-2">
             <Calendar className="w-3.5 h-3.5" />
             {format(new Date(), 'MMMM d, yyyy')}
           </button>
           <button className="btn-primary text-xs py-2">Create New Task</button>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map(card => (
          <div key={card.label} className="stat-card group">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{card.label}</p>
              <card.icon className="w-4 h-4 transition-transform group-hover:scale-110" style={{ color: card.color }} />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white">{card.value}</span>
              <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">+12%</span>
            </div>
          </div>
        ))}
      </section>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Tasks Feed */}
        <section className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              My Current Tasks
              <span className="px-2 py-0.5 bg-white/5 text-slate-500 text-[10px] rounded-full border border-white/10 font-mono">
                {recentTasks.length}
              </span>
            </h2>
            <div className="flex items-center gap-2">
               <button className="p-2 hover:bg-white/5 rounded-lg text-slate-500 transition-colors">
                 <Filter className="w-4 h-4" />
               </button>
               <Link to="/projects" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                 View Board
               </Link>
            </div>
          </div>

          <div className="space-y-3">
            {recentTasks.length === 0 ? (
              <div className="card p-12 text-center border-dashed border-white/10">
                <CheckCircle2 className="w-10 h-10 text-slate-800 mx-auto mb-4" />
                <p className="text-slate-500 font-medium text-sm">All clear! No pending tasks assigned.</p>
              </div>
            ) : (
              recentTasks.map(task => (
                <div key={task._id} className="card p-5 group flex items-center gap-4">
                  <div className={`w-1.5 h-10 rounded-full ${statusClasses[task.status]} opacity-50 group-hover:opacity-100 transition-opacity`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">#{task._id.slice(-4)}</span>
                      <h3 className="text-sm font-semibold text-white truncate">{task.title}</h3>
                    </div>
                    <div className="flex items-center gap-4 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <FolderKanban className="w-3 h-3" style={{ color: task.project?.color }} />
                        {task.project?.name}
                      </span>
                      {task.dueDate && (
                        <span className={`flex items-center gap-1.5 ${isAfter(new Date(), parseISO(task.dueDate)) && task.status !== 'done' ? 'text-rose-400' : ''}`}>
                          <Calendar className="w-3 h-3" />
                          {format(parseISO(task.dueDate), 'MMM d')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`badge ${priorityClasses[task.priority]}`}>{task.priority}</span>
                    <button className="p-1 text-slate-600 hover:text-white transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Sidebar Activity/Tips */}
        <aside className="space-y-6">
           <div className="card p-6 bg-gradient-to-br from-indigo-500/10 to-transparent border-indigo-500/20">
              <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                Performance
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                You've completed 80% of your tasks this week. Keep going to stay ahead of schedule!
              </p>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full w-[80%]" />
              </div>
           </div>

           <div className="card p-6">
              <h3 className="text-white font-bold mb-4 text-sm">Upcoming Deadlines</h3>
              <div className="space-y-4">
                {recentTasks.slice(0, 3).map(task => (
                  <div key={task._id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-slate-400">
                      {format(parseISO(task.dueDate), 'dd')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-200 truncate">{task.title}</p>
                      <p className="text-[10px] text-slate-500">{task.project?.name}</p>
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </aside>
      </div>
    </div>
  );
}
