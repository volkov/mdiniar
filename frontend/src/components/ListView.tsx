import { useState } from 'react';
import type { Task, UpdateTaskInput } from '../types';
import { TaskRow } from './TaskRow';

interface ListViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onUpdateTask: (id: string, input: UpdateTaskInput) => Promise<Task>;
}

type SortField = 'title' | 'status' | 'priority' | 'assignee' | 'created';

export function ListView({ tasks, onTaskClick, onUpdateTask }: ListViewProps) {
  const [sortField, setSortField] = useState<SortField>('created');
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sorted = [...tasks].sort((a, b) => {
    const av = a[sortField] ?? '';
    const bv = b[sortField] ?? '';
    const cmp = String(av).localeCompare(String(bv));
    return sortAsc ? cmp : -cmp;
  });

  const sortIndicator = (field: SortField) =>
    sortField === field ? (sortAsc ? ' ^' : ' v') : '';

  const headerClass = 'py-2 px-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider cursor-pointer hover:text-text-secondary select-none';

  return (
    <div className="flex-1 overflow-auto p-4">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border-primary">
            <th className={headerClass} style={{ width: 100 }}>ID</th>
            <th className={headerClass} onClick={() => handleSort('title')}>
              Title{sortIndicator('title')}
            </th>
            <th className={headerClass} onClick={() => handleSort('status')} style={{ width: 120 }}>
              Status{sortIndicator('status')}
            </th>
            <th className={headerClass} onClick={() => handleSort('priority')} style={{ width: 100 }}>
              Priority{sortIndicator('priority')}
            </th>
            <th className={headerClass} onClick={() => handleSort('assignee')} style={{ width: 120 }}>
              Assignee{sortIndicator('assignee')}
            </th>
            <th className={headerClass} style={{ width: 140 }}>Labels</th>
            <th className={headerClass} onClick={() => handleSort('created')} style={{ width: 110 }}>
              Created{sortIndicator('created')}
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((task) => (
            <TaskRow key={task.id} task={task} onClick={onTaskClick} onUpdateTask={onUpdateTask} />
          ))}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={7} className="py-12 text-center text-text-tertiary text-sm">
                No tasks yet. Create one to get started.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
