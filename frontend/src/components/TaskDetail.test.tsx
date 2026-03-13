import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaskDetail } from './TaskDetail';
import { makeTask, makeComment } from '../test/helpers';

// Mock the API module
vi.mock('../api/tasks', () => ({
  fetchComments: vi.fn().mockResolvedValue([]),
  createComment: vi.fn().mockResolvedValue({
    id: 'newcmt01',
    author: 'testuser',
    text: 'New comment',
    timestamp: '2026-03-13T16:00:00Z',
  }),
}));

import { fetchComments, createComment } from '../api/tasks';

const mockedFetchComments = vi.mocked(fetchComments);
const mockedCreateComment = vi.mocked(createComment);

describe('TaskDetail', () => {
  const defaultProps = {
    onUpdate: vi.fn().mockResolvedValue(makeTask()),
    onDelete: vi.fn().mockResolvedValue(undefined),
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockedFetchComments.mockResolvedValue([]);
    mockedCreateComment.mockResolvedValue({
      id: 'newcmt01',
      author: 'testuser',
      text: 'New comment',
      timestamp: '2026-03-13T16:00:00Z',
    });
  });

  it('renders task title and id', () => {
    const task = makeTask({ id: 'abcd1234', title: 'Detail task' });
    render(<TaskDetail task={task} {...defaultProps} />);
    expect(screen.getByText('Detail task')).toBeInTheDocument();
    expect(screen.getByText('abcd1234')).toBeInTheDocument();
  });

  it('renders assignee or Unassigned', () => {
    const task = makeTask({ assignee: null });
    render(<TaskDetail task={task} {...defaultProps} />);
    expect(screen.getByText('Unassigned')).toBeInTheDocument();
  });

  it('renders labels or None', () => {
    const task = makeTask({ labels: [] });
    render(<TaskDetail task={task} {...defaultProps} />);
    expect(screen.getByText('None')).toBeInTheDocument();
  });

  it('renders body content', () => {
    const task = makeTask({ body: 'This is the description' });
    render(<TaskDetail task={task} {...defaultProps} />);
    expect(screen.getByText('This is the description')).toBeInTheDocument();
  });

  it('shows "No description." when body is empty', () => {
    const task = makeTask({ body: '' });
    render(<TaskDetail task={task} {...defaultProps} />);
    expect(screen.getByText('No description.')).toBeInTheDocument();
  });

  it('enters edit mode when Edit is clicked', async () => {
    const user = userEvent.setup();
    const task = makeTask({ title: 'Editable' });
    render(<TaskDetail task={task} {...defaultProps} />);

    await user.click(screen.getByText('Edit'));
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('calls onClose when close button (X icon) is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const task = makeTask();
    render(<TaskDetail task={task} {...defaultProps} onClose={onClose} />);

    // Find close button by its SVG content - it's in the header area
    const headerButtons = screen.getAllByRole('button');
    // Close button is the one with the SVG X icon, after Edit and Delete
    const closeButton = headerButtons.find(
      (btn) => btn.querySelector('svg') !== null
    )!;
    await user.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onDelete when Delete is clicked', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    const task = makeTask({ id: 'del123' });
    render(<TaskDetail task={task} onUpdate={defaultProps.onUpdate} onDelete={onDelete} onClose={onClose} />);

    await user.click(screen.getByText('Delete'));
    expect(onDelete).toHaveBeenCalledWith('del123');
  });
});

describe('TaskDetail inline status change', () => {
  const defaultProps = {
    onUpdate: vi.fn().mockResolvedValue(makeTask()),
    onDelete: vi.fn().mockResolvedValue(undefined),
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockedFetchComments.mockResolvedValue([]);
  });

  it('renders status as a dropdown (select) outside edit mode', () => {
    const task = makeTask({ status: 'todo' });
    render(<TaskDetail task={task} {...defaultProps} />);
    const statusSelect = screen.getAllByRole('combobox')[0];
    expect(statusSelect).toBeInTheDocument();
    expect(statusSelect).toHaveValue('todo');
  });

  it('renders priority as a dropdown (select) outside edit mode', () => {
    const task = makeTask({ priority: 'high' });
    render(<TaskDetail task={task} {...defaultProps} />);
    const selects = screen.getAllByRole('combobox');
    const prioritySelect = selects[1];
    expect(prioritySelect).toHaveValue('high');
  });

  it('calls onUpdate with new status when status is changed', async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn().mockResolvedValue(makeTask({ status: 'done' }));
    const task = makeTask({ status: 'todo' });
    render(<TaskDetail task={task} {...defaultProps} onUpdate={onUpdate} />);

    const statusSelect = screen.getAllByRole('combobox')[0];
    await user.selectOptions(statusSelect, 'done');
    expect(onUpdate).toHaveBeenCalledWith(task.id, { status: 'done' });
  });

  it('calls onUpdate with new priority when priority is changed', async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn().mockResolvedValue(makeTask({ priority: 'urgent' }));
    const task = makeTask({ priority: 'medium' });
    render(<TaskDetail task={task} {...defaultProps} onUpdate={onUpdate} />);

    const selects = screen.getAllByRole('combobox');
    const prioritySelect = selects[1];
    await user.selectOptions(prioritySelect, 'urgent');
    expect(onUpdate).toHaveBeenCalledWith(task.id, { priority: 'urgent' });
  });

  it('status dropdown contains all status options', () => {
    const task = makeTask();
    render(<TaskDetail task={task} {...defaultProps} />);
    const statusSelect = screen.getAllByRole('combobox')[0];
    const options = statusSelect.querySelectorAll('option');
    expect(options.length).toBe(5); // backlog, todo, in_progress, done, cancelled
  });
});

describe('TaskDetail comments UI', () => {
  const defaultProps = {
    onUpdate: vi.fn().mockResolvedValue(makeTask()),
    onDelete: vi.fn().mockResolvedValue(undefined),
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockedFetchComments.mockResolvedValue([]);
    mockedCreateComment.mockResolvedValue({
      id: 'newcmt01',
      author: 'testuser',
      text: 'New comment',
      timestamp: '2026-03-13T16:00:00Z',
    });
  });

  it('shows comments section header', async () => {
    const task = makeTask();
    render(<TaskDetail task={task} {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText(/Comments/)).toBeInTheDocument();
    });
  });

  it('fetches comments on mount', async () => {
    const task = makeTask({ id: 'fetch01' });
    render(<TaskDetail task={task} {...defaultProps} />);
    await waitFor(() => {
      expect(mockedFetchComments).toHaveBeenCalledWith('fetch01');
    });
  });

  it('displays fetched comments', async () => {
    // Note: The UI code uses comment.body and comment.created (matching backend model),
    // even though the frontend Comment type defines text/timestamp.
    mockedFetchComments.mockResolvedValue([
      { id: 'c1', author: 'alice', body: 'First comment', created: '2026-03-13T15:00:00Z' },
      { id: 'c2', author: 'bob', body: 'Second comment', created: '2026-03-13T15:30:00Z' },
    ] as any);

    const task = makeTask();
    render(<TaskDetail task={task} {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('alice')).toBeInTheDocument();
    });
    expect(screen.getByText('bob')).toBeInTheDocument();
    expect(screen.getByText('First comment')).toBeInTheDocument();
    expect(screen.getByText('Second comment')).toBeInTheDocument();
  });

  it('has author input and comment textarea', () => {
    const task = makeTask();
    render(<TaskDetail task={task} {...defaultProps} />);
    expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Write a comment...')).toBeInTheDocument();
  });

  it('has Add Comment button', () => {
    const task = makeTask();
    render(<TaskDetail task={task} {...defaultProps} />);
    expect(screen.getByText('Add Comment')).toBeInTheDocument();
  });

  it('Add Comment button is disabled when fields are empty', () => {
    const task = makeTask();
    render(<TaskDetail task={task} {...defaultProps} />);
    const addButton = screen.getByText('Add Comment');
    expect(addButton).toBeDisabled();
  });

  it('calls createComment with correct payload when adding a comment', async () => {
    const user = userEvent.setup();
    const task = makeTask({ id: 'addcmt01' });
    render(<TaskDetail task={task} {...defaultProps} />);

    const authorInput = screen.getByPlaceholderText('Your name');
    const commentInput = screen.getByPlaceholderText('Write a comment...');

    await user.type(authorInput, 'testuser');
    await user.type(commentInput, 'New comment');
    await user.click(screen.getByText('Add Comment'));

    await waitFor(() => {
      // The actual code sends { author, body } matching the backend CommentCreate model
      expect(mockedCreateComment).toHaveBeenCalledWith('addcmt01', {
        author: 'testuser',
        body: 'New comment',
      });
    });
  });

  it('clears comment input after successful submission', async () => {
    const user = userEvent.setup();
    const task = makeTask();
    render(<TaskDetail task={task} {...defaultProps} />);

    const authorInput = screen.getByPlaceholderText('Your name');
    const commentInput = screen.getByPlaceholderText('Write a comment...');

    await user.type(authorInput, 'testuser');
    await user.type(commentInput, 'Clear me');
    await user.click(screen.getByText('Add Comment'));

    await waitFor(() => {
      expect(commentInput).toHaveValue('');
    });
  });
});
