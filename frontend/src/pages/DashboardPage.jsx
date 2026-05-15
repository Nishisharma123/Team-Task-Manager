import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { FolderKanban, CheckCircle2, Clock, AlertTriangle, TrendingUp, ArrowRight, Calendar } from 'lucide-react';
import { format, isAfter, parseISO } from 'date-fns';

const priorityColors = {
  urgent: 'text-red-400 bg-red-400/10 border-red-400/20',
  high: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  low: 'text-green-400 bg-green-400/10 border-green-400/20',
};

const statusColors = {
  todo: 'text-slate-400 bg-slate-400/10',
  'in-progress': 'text-blue-400 bg-blue-400/10',
  review: 'text-purple-400 bg-purple-400/10',
  done: 'text-green-400 bg-green-400/10',
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
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const statCards = [
    { label: 'Total Projects', value: stats?.totalProjects || 0, icon: FolderKanban, color: 'text-brand-400', bg: 'bg-brand-400/10' },
    { label: 'My Tasks', value: stats?.myTasks || 0, icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-400/10' },
    { label: 'In Progress', value: stats?.inProgress || 0, icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Overdue', value: stats?.overdue || 0, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-400/10' },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white">
          {getGreeting()}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-400 mt-1">Here's what's happening with your projects today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(card => (
          <div key={card.label} className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-xl ${card.bg}`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
            <p className="text-2xl font-display font-bold text-white">{card.value}</p>
            <p className="text-sm text-slate-400 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* My Tasks */}
      <div className="card">
        <div className="flex items-center justify-between p-6 border-b border-slate-800/60">
          <div>
            <h2 className="font-display text-lg font-bold text-white">My Assigned Tasks</h2>
            <p className="text-sm text-slate-400 mt-0.5">Tasks assigned to you across all projects</p>
          </div>
          <Link to="/projects" className="btn-ghost text-sm flex items-center gap-1.5">
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
          <div className="divide-y divide-slate-800/60">
            {recentTasks.map(task => (
              <div key={task._id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-800/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-slate-200 truncate">{task.title}</p>
                    <span className={`badge border ${priorityColors[task.priority]}`}>{task.priority}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: task.project?.color || '#6172f5' }} />
                      {task.project?.name}
                    </span>
                    {task.dueDate && (
                      <span className={`flex items-center gap-1 ${isAfter(new Date(), parseISO(task.dueDate)) && task.status !== 'done' ? 'text-red-400' : ''}`}>
                        <Calendar className="w-3 h-3" />
                        {format(parseISO(task.dueDate), 'MMM d')}
                      </span>
                    )}
                  </div>
                </div>
                <span className={`badge ${statusColors[task.status]}`}>
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
