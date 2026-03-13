import type { Status } from '../types';

const COLORS: Record<Status, string> = {
  backlog: 'text-status-backlog',
  todo: 'text-status-todo',
  in_progress: 'text-status-in-progress',
  done: 'text-status-done',
  cancelled: 'text-status-cancelled',
};

export function StatusIcon({ status }: { status: Status }) {
  const color = COLORS[status];

  if (status === 'done') {
    return (
      <svg className={`w-3.5 h-3.5 shrink-0 ${color}`} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2}>
        <circle cx="8" cy="8" r="6" />
        <path d="M5.5 8l2 2 3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (status === 'cancelled') {
    return (
      <svg className={`w-3.5 h-3.5 shrink-0 ${color}`} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2}>
        <circle cx="8" cy="8" r="6" />
        <path d="M6 6l4 4M10 6l-4 4" strokeLinecap="round" />
      </svg>
    );
  }
  if (status === 'in_progress') {
    return (
      <svg className={`w-3.5 h-3.5 shrink-0 ${color}`} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2}>
        <circle cx="8" cy="8" r="6" />
        <path d="M8 4v4l2.5 2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  // backlog = dashed circle, todo = solid circle
  return (
    <svg className={`w-3.5 h-3.5 shrink-0 ${color}`} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="8" cy="8" r="6" strokeDasharray={status === 'backlog' ? '3 3' : undefined} />
    </svg>
  );
}
