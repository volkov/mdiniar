import type { Task } from '../types';

export function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'abcd1234',
    title: 'Test Task',
    status: 'todo',
    priority: 'medium',
    assignee: null,
    labels: [],
    created: '2026-03-13T10:00:00Z',
    updated: '2026-03-13T14:00:00Z',
    body: '',
    ...overrides,
  };
}
