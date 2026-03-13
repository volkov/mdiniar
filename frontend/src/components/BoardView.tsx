import type { Task, Status } from '../types';
import { STATUS_ORDER, STATUS_LABELS } from '../types';
import { TaskCard } from './TaskCard';
import { StatusIcon } from './StatusIcon';

interface BoardViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export function BoardView({ tasks, onTaskClick }: BoardViewProps) {
  const columns = STATUS_ORDER.filter((s) => s !== 'cancelled');
  const grouped = columns.reduce<Record<Status, Task[]>>((acc, status) => {
    acc[status] = tasks.filter((t) => t.status === status);
    return acc;
  }, {} as Record<Status, Task[]>);

  return (
    <div className="flex-1 flex gap-4 p-4 overflow-x-auto">
      {columns.map((status) => (
        <div key={status} className="flex-1 min-w-[260px] max-w-[340px] flex flex-col">
          <div className="flex items-center gap-2 px-1 mb-3">
            <StatusIcon status={status} />
            <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
              {STATUS_LABELS[status]}
            </span>
            <span className="text-xs text-text-tertiary ml-auto">
              {grouped[status].length}
            </span>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto">
            {grouped[status].map((task) => (
              <TaskCard key={task.id} task={task} onClick={onTaskClick} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
