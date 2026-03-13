import type { Task } from '../types';
import { PRIORITY_LABELS } from '../types';
import { PriorityIcon } from './PriorityIcon';

interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  return (
    <button
      onClick={() => onClick(task)}
      className="w-full text-left p-3 rounded-md bg-bg-secondary border border-border-primary hover:border-border-secondary transition-colors cursor-pointer"
    >
      <div className="flex items-start gap-2">
        <PriorityIcon priority={task.priority} />
        <span className="text-sm text-text-primary leading-snug flex-1 min-w-0 truncate">
          {task.title}
        </span>
      </div>

      <div className="mt-2 flex items-center gap-2 flex-wrap">
        {task.assignee && (
          <span className="text-xs text-text-tertiary bg-bg-hover px-1.5 py-0.5 rounded">
            {task.assignee}
          </span>
        )}
        {task.labels.map((label) => (
          <span
            key={label}
            className="text-xs text-accent bg-accent/10 px-1.5 py-0.5 rounded"
          >
            {label}
          </span>
        ))}
      </div>

      <div className="mt-1.5 text-xs text-text-tertiary" title={PRIORITY_LABELS[task.priority]}>
        {task.id.slice(0, 6)}
      </div>
    </button>
  );
}
