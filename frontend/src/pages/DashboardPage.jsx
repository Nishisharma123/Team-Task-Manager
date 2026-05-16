import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { FolderKanban, CheckCircle2, Clock, AlertTriangle, TrendingUp, ArrowRight, Calendar, Sparkles } from 'lucide-react';
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
      <div className="w-10 h-10 rounded-full animate-spin"
        style={{ border: '3px solid transparent', borderTopColor: '#818cf8', borderRightColor: '#a855f7' }} />
    </div>
  );

  const statCards = [
    { label: 'Total Projects', value: stats?.totalProjects || 0, icon: FolderKanban, gradient: 'from-indigo-500 to-purple-500', glow: '99, 102, 241' },
    { label: 'My Tasks', value: stats?.myTasks || 0, icon: CheckCircle2, gradient: 'from-emerald-500 to-teal-500', glow: '16, 185, 129' },
    { label: 'In Progress', value: stats?.inProgress || 0, icon: TrendingUp, gradient: 'from-cyan-500 to-blue-500', glow: '6, 182, 212' },
    { label: 'Overdue', value: stats?.overdue || 0, icon: AlertTriangle, gradient: 'from-rose-500 to-pink-500', glow: '244, 63, 94' },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">
          <span className="gradient-text">{getGreeting()}</span>, {user?.name?.split(' ')[0]}
          <Sparkles className="inline w-6 h-6 text-amber-400 ml-2 mb-1" />
        </h1>
        <p className="text-slate-400 mt-1">Here's what's happening with your projects today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(card => (
          <div key={card.label} className="stat-card" style={{ '--stat-glow': card.glow }}>
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${card.gradient} bg-opacity-20`}
                style={{ background: `linear-gradient(135deg, rgba(${card.glow}, 0.15), rgba(${card.glow}, 0.05))` }}>
                <card.icon className="w-5 h-5" style={{ color: `rgb(${card.glow})` }} />
              </div>
            </div>
            <p className="text-3xl font-display font-bold text-white">{card.value}</p>
            <p className="text-sm text-slate-400 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* My Tasks */}
      <div className="card">
        <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
          <div>
            <h2 className="font-display text-lg font-bold gradient-text">My Assigned Tasks</h2>
            <p className="text-sm text-slate-400 mt-0.5">Tasks assigned to you across all projects</p>
          </div>
          <Link to="/projects" className="btn-ghost text-sm flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {recentTasks.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No tasks assigned to you yet</p>
            <p className="text-slate-500 text-sm mt-1">Tasks assigned to you will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {recentTasks.map(task => (
              <div key={task._id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-all duration-200">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-slate-200 truncate">{task.title}</p>
                    <span className={`badge ${priorityClasses[task.priority]}`}>{task.priority}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: task.project?.color || '#6366f1', boxShadow: `0 0 6px ${task.project?.color || '#6366f1'}` }} />
                      {task.project?.name}
                    </span>
                    {task.dueDate && (
                      <span className={`flex items-center gap-1 ${isAfter(new Date(), parseISO(task.dueDate)) && task.status !== 'done' ? 'text-rose-400' : ''}`}>
                        <Calendar className="w-3 h-3" />
                        {format(parseISO(task.dueDate), 'MMM d')}
                      </span>
                    )}
                  </div>
                </div>
                <span className={`badge ${statusClasses[task.status]}`}>
                  {task.status === 'in-progress' ? 'In Progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
