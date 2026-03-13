import { useState } from 'react';
import type { CreateTaskInput, Status, Priority } from '../types';
import { STATUS_ORDER, STATUS_LABELS, PRIORITY_ORDER, PRIORITY_LABELS } from '../types';

interface TaskFormProps {
  onSubmit: (input: CreateTaskInput) => Promise<void>;
  onClose: () => void;
}

export function TaskForm({ onSubmit, onClose }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<Status>('todo');
  const [priority, setPriority] = useState<Priority>('medium');
  const [assignee, setAssignee] = useState('');
  const [labelsStr, setLabelsStr] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        status,
        priority,
        assignee: assignee.trim() || undefined,
        labels: labelsStr.split(',').map((s) => s.trim()).filter(Boolean),
        body: body.trim(),
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = 'w-full bg-bg-tertiary border border-border-primary rounded px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent';
  const labelClass = 'text-xs font-medium text-text-tertiary uppercase tracking-wider';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative bg-bg-secondary border border-border-primary rounded-lg w-full max-w-lg p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-medium text-text-primary mb-4">New Task</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Title *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`${inputClass} mt-1`}
              placeholder="Task title"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as Status)} className={`${inputClass} mt-1`}>
                {STATUS_ORDER.map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className={`${inputClass} mt-1`}>
                {PRIORITY_ORDER.map((p) => (
                  <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Assignee</label>
              <input value={assignee} onChange={(e) => setAssignee(e.target.value)} className={`${inputClass} mt-1`} placeholder="Unassigned" />
            </div>
            <div>
              <label className={labelClass}>Labels</label>
              <input value={labelsStr} onChange={(e) => setLabelsStr(e.target.value)} className={`${inputClass} mt-1`} placeholder="Comma-separated" />
            </div>
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              className={`${inputClass} mt-1 font-mono resize-y`}
              placeholder="Markdown description..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-text-secondary border border-border-primary rounded hover:bg-bg-hover transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !title.trim()}
              className="px-4 py-2 text-sm bg-accent text-white rounded hover:bg-accent-hover transition-colors disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
