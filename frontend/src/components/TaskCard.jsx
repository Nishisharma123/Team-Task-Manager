import { Calendar, User, Trash2, Edit2 } from 'lucide-react';
import { format, parseISO, isAfter } from 'date-fns';

const priorityColors = {
  urgent: 'text-red-400 bg-red-400/10 border-red-400/20',
  high: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  low: 'text-green-400 bg-green-400/10 border-green-400/20',
};

export default function TaskCard({ task, onEdit, onDelete, isAdmin }) {
  const isOverdue = task.dueDate && isAfter(new Date(), parseISO(task.dueDate)) && task.status !== 'done';

  return (
    <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-4 hover:border-slate-600 transition-all duration-200 group cursor-pointer"
      onClick={() => onEdit(task)}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-medium text-slate-200 leading-snug flex-1">{task.title}</p>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          {(isAdmin || true) && (
            <button onClick={e => { e.stopPropagation(); onDelete(task._id); }}
              className="p-1 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {task.description && (
        <p className="text-xs text-slate-500 mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center justify-between">
        <span className={`badge border text-xs ${priorityColors[task.priority]}`}>{task.priority}</span>
        <div className="flex items-center gap-2">
          {task.dueDate && (
            <span className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-400' : 'text-slate-500'}`}>
              <Calendar className="w-3 h-3" />
              {format(parseISO(task.dueDate), 'MMM d')}
            </span>
          )}
          {task.assignee && (
            <div title={task.assignee.name}
              className="w-6 h-6 rounded-full bg-brand-700 flex items-center justify-center text-xs font-bold text-white">
              {task.assignee.name?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {task.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {task.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-400">{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}
