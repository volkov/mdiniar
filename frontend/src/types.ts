export type Status = 'backlog' | 'todo' | 'in_progress' | 'done' | 'cancelled';
export type Priority = 'urgent' | 'high' | 'medium' | 'low' | 'none';

export interface Task {
  id: string;
  title: string;
  status: Status;
  priority: Priority;
  assignee: string | null;
  labels: string[];
  created: string;
  updated: string;
  body: string;
}

export interface CreateTaskInput {
  title: string;
  status?: Status;
  priority?: Priority;
  assignee?: string | null;
  labels?: string[];
  body?: string;
}

export interface UpdateTaskInput {
  title?: string;
  status?: Status;
  priority?: Priority;
  assignee?: string | null;
  labels?: string[];
  body?: string;
}

export type ViewMode = 'board' | 'list';

export const STATUS_ORDER: Status[] = ['backlog', 'todo', 'in_progress', 'done', 'cancelled'];

export const STATUS_LABELS: Record<Status, string> = {
  backlog: 'Backlog',
  todo: 'Todo',
  in_progress: 'In Progress',
  done: 'Done',
  cancelled: 'Cancelled',
};

export const PRIORITY_ORDER: Priority[] = ['urgent', 'high', 'medium', 'low', 'none'];

export const PRIORITY_LABELS: Record<Priority, string> = {
  urgent: 'Urgent',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  none: 'No priority',
};
