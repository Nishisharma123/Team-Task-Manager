import { Calendar, User, Trash2 } from 'lucide-react';
import { format, parseISO, isAfter } from 'date-fns';

const priorityClasses = {
  urgent: 'priority-urgent',
  high: 'priority-high',
  medium: 'priority-medium',
  low: 'priority-low',
};

export default function TaskCard({ task, onEdit, onDelete, isAdmin }) {
  const isOverdue = task.dueDate && isAfter(new Date(), parseISO(task.dueDate)) && task.status !== 'done';

  return (
    <div className={`bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 hover:border-white/[0.12] hover:bg-white/[0.05] transition-all duration-300 group ${isAdmin ? 'cursor-pointer' : 'cursor-default'} hover:shadow-lg hover:shadow-indigo-500/[0.03]`}
      onClick={() => isAdmin && onEdit(task)}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-medium text-slate-200 leading-snug flex-1">{task.title}</p>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          {isAdmin && (
            <button onClick={e => { e.stopPropagation(); onDelete(task._id); }}
              className="p-1 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {task.description && (
        <p className="text-xs text-slate-500 mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center justify-between">
        <span className={`badge text-xs ${priorityClasses[task.priority]}`}>{task.priority}</span>
        <div className="flex items-center gap-2">
          {task.dueDate && (
            <span className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-rose-400' : 'text-slate-500'}`}>
              <Calendar className="w-3 h-3" />
              {format(parseISO(task.dueDate), 'MMM d')}
            </span>
          )}
          {task.assignee && (
            <div title={task.assignee.name}
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
              {task.assignee.name?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {task.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {task.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-400 border border-white/[0.06]">{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}
