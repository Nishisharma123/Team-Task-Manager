import { Calendar, User, Trash2, AlignLeft, Hash } from 'lucide-react';
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
    <div className={`card p-4 group ${isAdmin ? 'cursor-pointer' : 'cursor-default'}`}
      onClick={() => isAdmin && onEdit(task)}>
      
      <div className="flex items-start justify-between gap-3 mb-3">
        <h4 className="text-sm font-semibold text-white leading-relaxed flex-1 group-hover:text-indigo-300 transition-colors">
          {task.title}
        </h4>
        {isAdmin && (
          <button onClick={e => { e.stopPropagation(); onDelete(task._id); }}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-600 hover:text-rose-400 transition-all">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {task.description && (
        <div className="flex items-start gap-1.5 text-slate-500 mb-4">
          <AlignLeft className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <p className="text-[11px] line-clamp-2 leading-relaxed">{task.description}</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
        <div className="flex items-center gap-3">
          <span className={`badge ${priorityClasses[task.priority]}`}>{task.priority}</span>
          {task.dueDate && (
            <div className={`flex items-center gap-1 text-[10px] font-medium ${isOverdue ? 'text-rose-400' : 'text-slate-500'}`}>
              <Calendar className="w-3 h-3" />
              {format(parseISO(task.dueDate), 'MMM d')}
            </div>
          )}
        </div>
        
        {task.assignee ? (
          <div title={`Assigned to ${task.assignee.name}`}
            className="w-6 h-6 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-300">
            {task.assignee.name?.charAt(0).toUpperCase()}
          </div>
        ) : (
          <div className="w-6 h-6 rounded-lg border border-dashed border-white/10 flex items-center justify-center">
            <User className="w-3 h-3 text-slate-700" />
          </div>
        )}
      </div>

      {task.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {task.tags.slice(0, 2).map(tag => (
            <span key={tag} className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-slate-600 bg-white/5 px-1.5 py-0.5 rounded">
              <Hash className="w-2 h-2" />
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
