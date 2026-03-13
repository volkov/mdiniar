import type { Task } from '../types';
import { STATUS_LABELS, PRIORITY_LABELS } from '../types';
import { StatusIcon } from './StatusIcon';
import { PriorityIcon } from './PriorityIcon';

interface TaskRowProps {
  task: Task;
  onClick: (task: Task) => void;
}

export function TaskRow({ task, onClick }: TaskRowProps) {
  return (
    <tr
      onClick={() => onClick(task)}
      className="border-b border-border-primary hover:bg-bg-hover cursor-pointer transition-colors group"
    >
      <td className="py-2 px-3">
        <div className="flex items-center gap-2">
          <PriorityIcon priority={task.priority} />
          <span className="text-xs text-text-tertiary font-mono">{task.id.slice(0, 6)}</span>
        </div>
      </td>
      <td className="py-2 px-3">
        <div className="flex items-center gap-2">
          <StatusIcon status={task.status} />
          <span className="text-sm text-text-primary truncate max-w-md">{task.title}</span>
        </div>
      </td>
      <td className="py-2 px-3 text-xs text-text-secondary">{STATUS_LABELS[task.status]}</td>
      <td className="py-2 px-3 text-xs text-text-secondary">{PRIORITY_LABELS[task.priority]}</td>
      <td className="py-2 px-3 text-xs text-text-secondary">{task.assignee || '--'}</td>
      <td className="py-2 px-3">
        <div className="flex gap-1 flex-wrap">
          {task.labels.map((l) => (
            <span key={l} className="text-xs text-accent bg-accent/10 px-1.5 py-0.5 rounded">{l}</span>
          ))}
        </div>
      </td>
      <td className="py-2 px-3 text-xs text-text-tertiary">
        {new Date(task.created).toLocaleDateString()}
      </td>
    </tr>
  );
}
