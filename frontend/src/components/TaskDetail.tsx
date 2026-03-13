import { useState, useEffect } from 'react';
import type { Task, Status, Priority, UpdateTaskInput, Comment } from '../types';
import { STATUS_ORDER, STATUS_LABELS, PRIORITY_ORDER, PRIORITY_LABELS } from '../types';
import { StatusIcon } from './StatusIcon';
import { PriorityIcon } from './PriorityIcon';
import { fetchComments, createComment } from '../api/tasks';

interface TaskDetailProps {
  task: Task;
  onUpdate: (id: string, input: UpdateTaskInput) => Promise<Task>;
  onDelete: (id: string) => Promise<void>;
  onClose: () => void;
}

export function TaskDetail({ task, onUpdate, onDelete, onClose }: TaskDetailProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [body, setBody] = useState(task.body);
  const [assignee, setAssignee] = useState(task.assignee || '');
  const [labelsStr, setLabelsStr] = useState(task.labels.join(', '));
  const [saving, setSaving] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetchComments(task.id).then(setComments).catch(() => {});
  }, [task.id]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !commentAuthor.trim()) return;
    setSubmittingComment(true);
    try {
      const comment = await createComment(task.id, { author: commentAuthor.trim(), body: newComment.trim() });
      setComments((prev) => [...prev, comment]);
      setNewComment('');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate(task.id, {
        title,
        body,
        assignee: assignee || null,
        labels: labelsStr.split(',').map((s) => s.trim()).filter(Boolean),
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: Status) => {
    await onUpdate(task.id, { status: newStatus });
  };

  const handlePriorityChange = async (newPriority: Priority) => {
    await onUpdate(task.id, { priority: newPriority });
  };

  const handleDelete = async () => {
    await onDelete(task.id);
    onClose();
  };

  const selectClass = 'bg-bg-tertiary border border-border-primary rounded px-2 py-1 text-sm text-text-primary focus:outline-none focus:border-accent cursor-pointer';

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative w-full max-w-xl bg-bg-secondary border-l border-border-primary h-full overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-primary">
          <span className="text-xs text-text-tertiary font-mono">{task.id}</span>
          <div className="flex gap-2">
            {editing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-3 py-1 text-xs bg-accent text-white rounded hover:bg-accent-hover transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-3 py-1 text-xs text-text-secondary border border-border-primary rounded hover:bg-bg-hover transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="px-3 py-1 text-xs text-text-secondary border border-border-primary rounded hover:bg-bg-hover transition-colors"
              >
                Edit
              </button>
            )}
            <button
              onClick={handleDelete}
              className="px-3 py-1 text-xs text-red-400 border border-border-primary rounded hover:bg-red-400/10 transition-colors"
            >
              Delete
            </button>
            <button
              onClick={onClose}
              className="px-2 py-1 text-text-tertiary hover:text-text-primary transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Title */}
          {editing ? (
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-bg-tertiary border border-border-primary rounded px-3 py-2 text-lg text-text-primary focus:outline-none focus:border-accent"
            />
          ) : (
            <h2 className="text-lg font-medium text-text-primary">{task.title}</h2>
          )}

          {/* Properties */}
          <div className="grid grid-cols-[100px_1fr] gap-y-3 gap-x-4 text-sm">
            <span className="text-text-tertiary">Status</span>
            <select
              value={task.status}
              onChange={(e) => handleStatusChange(e.target.value as Status)}
              className={selectClass}
            >
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>

            <span className="text-text-tertiary">Priority</span>
            <select
              value={task.priority}
              onChange={(e) => handlePriorityChange(e.target.value as Priority)}
              className={selectClass}
            >
              {PRIORITY_ORDER.map((p) => (
                <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
              ))}
            </select>

            <span className="text-text-tertiary">Assignee</span>
            {editing ? (
              <input
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                placeholder="Unassigned"
                className="bg-bg-tertiary border border-border-primary rounded px-2 py-1 text-sm text-text-primary focus:outline-none focus:border-accent"
              />
            ) : (
              <span className="text-text-primary">{task.assignee || 'Unassigned'}</span>
            )}

            <span className="text-text-tertiary">Labels</span>
            {editing ? (
              <input
                value={labelsStr}
                onChange={(e) => setLabelsStr(e.target.value)}
                placeholder="Comma-separated labels"
                className="bg-bg-tertiary border border-border-primary rounded px-2 py-1 text-sm text-text-primary focus:outline-none focus:border-accent"
              />
            ) : (
              <div className="flex gap-1 flex-wrap">
                {task.labels.length > 0 ? task.labels.map((l) => (
                  <span key={l} className="text-xs text-accent bg-accent/10 px-1.5 py-0.5 rounded">{l}</span>
                )) : <span className="text-text-tertiary">None</span>}
              </div>
            )}

            <span className="text-text-tertiary">Created</span>
            <span className="text-text-secondary">{new Date(task.created).toLocaleString()}</span>

            <span className="text-text-tertiary">Updated</span>
            <span className="text-text-secondary">{new Date(task.updated).toLocaleString()}</span>
          </div>

          {/* Body */}
          <div className="border-t border-border-primary pt-4">
            <h3 className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-2">Description</h3>
            {editing ? (
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={12}
                className="w-full bg-bg-tertiary border border-border-primary rounded px-3 py-2 text-sm text-text-primary font-mono focus:outline-none focus:border-accent resize-y"
                placeholder="Markdown description..."
              />
            ) : (
              <div className="text-sm text-text-secondary whitespace-pre-wrap leading-relaxed">
                {task.body || 'No description.'}
              </div>
            )}
          </div>

          {/* Comments */}
          <div className="border-t border-border-primary pt-4">
            <h3 className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-3">
              Comments ({comments.length})
            </h3>

            {comments.length > 0 && (
              <div className="space-y-3 mb-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-bg-tertiary rounded-md p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-text-primary">{comment.author}</span>
                      <span className="text-xs text-text-tertiary">
                        {new Date(comment.created).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary whitespace-pre-wrap">{comment.body}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <input
                value={commentAuthor}
                onChange={(e) => setCommentAuthor(e.target.value)}
                placeholder="Your name"
                className="w-full bg-bg-tertiary border border-border-primary rounded px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:border-accent"
              />
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                rows={3}
                className="w-full bg-bg-tertiary border border-border-primary rounded px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent resize-y"
              />
              <button
                onClick={handleAddComment}
                disabled={submittingComment || !newComment.trim() || !commentAuthor.trim()}
                className="px-3 py-1.5 text-xs bg-accent text-white rounded hover:bg-accent-hover transition-colors disabled:opacity-50"
              >
                {submittingComment ? 'Posting...' : 'Add Comment'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
