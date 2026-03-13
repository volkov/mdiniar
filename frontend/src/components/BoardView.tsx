import { useState } from 'react';
import type { Task, Status, UpdateTaskInput } from '../types';
import { STATUS_ORDER, STATUS_LABELS } from '../types';
import { TaskCard } from './TaskCard';
import { StatusIcon } from './StatusIcon';

interface BoardViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onUpdateTask: (id: string, input: UpdateTaskInput) => Promise<Task>;
}

export function BoardView({ tasks, onTaskClick, onUpdateTask }: BoardViewProps) {
  const [dragOverStatus, setDragOverStatus] = useState<Status | null>(null);
  const columns = STATUS_ORDER.filter((s) => s !== 'cancelled');
  const grouped = columns.reduce<Record<Status, Task[]>>((acc, status) => {
    acc[status] = tasks.filter((t) => t.status === status);
    return acc;
  }, {} as Record<Status, Task[]>);

  const handleDragOver = (e: React.DragEvent, status: Status) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStatus(status);
  };

  const handleDragLeave = () => {
    setDragOverStatus(null);
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: Status) => {
    e.preventDefault();
    setDragOverStatus(null);
    const taskId = e.dataTransfer.getData('text/plain');
    const task = tasks.find((t) => t.id === taskId);
    if (task && task.status !== targetStatus) {
      await onUpdateTask(taskId, { status: targetStatus });
    }
  };

  return (
    <div className="flex-1 flex gap-4 p-4 overflow-x-auto">
      {columns.map((status) => (
        <div
          key={status}
          className={`flex-1 min-w-[260px] max-w-[340px] flex flex-col rounded-lg transition-colors ${
            dragOverStatus === status ? 'bg-bg-hover/50 ring-1 ring-accent/30' : ''
          }`}
          onDragOver={(e) => handleDragOver(e, status)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, status)}
        >
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
