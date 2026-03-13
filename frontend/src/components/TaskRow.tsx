import type { Task, Status, Priority, UpdateTaskInput } from '../types';
import { STATUS_ORDER, STATUS_LABELS, PRIORITY_ORDER, PRIORITY_LABELS } from '../types';
import { StatusIcon } from './StatusIcon';
import { PriorityIcon } from './PriorityIcon';

interface TaskRowProps {
  task: Task;
  onClick: (task: Task) => void;
  onUpdateTask: (id: string, input: UpdateTaskInput) => Promise<Task>;
}

export function TaskRow({ task, onClick, onUpdateTask }: TaskRowProps) {
  const selectClass = 'bg-transparent text-xs text-text-secondary cursor-pointer focus:outline-none focus:text-text-primary';

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
      <td className="py-2 px-3" onClick={(e) => e.stopPropagation()}>
        <select
          value={task.status}
          onChange={(e) => onUpdateTask(task.id, { status: e.target.value as Status })}
          className={selectClass}
        >
          {STATUS_ORDER.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </td>
      <td className="py-2 px-3" onClick={(e) => e.stopPropagation()}>
        <select
          value={task.priority}
          onChange={(e) => onUpdateTask(task.id, { priority: e.target.value as Priority })}
          className={selectClass}
        >
          {PRIORITY_ORDER.map((p) => (
            <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
          ))}
        </select>
      </td>
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
