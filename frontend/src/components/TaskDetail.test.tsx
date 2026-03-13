import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TaskDetail } from './TaskDetail';
import { makeTask } from '../test/helpers';

describe('TaskDetail', () => {
  const defaultProps = {
    onUpdate: vi.fn().mockResolvedValue(makeTask()),
    onDelete: vi.fn().mockResolvedValue(undefined),
    onClose: vi.fn(),
  };

  it('renders task title and id', () => {
    const task = makeTask({ id: 'abcd1234', title: 'Detail task' });
    render(<TaskDetail task={task} {...defaultProps} />);
    expect(screen.getByText('Detail task')).toBeInTheDocument();
    expect(screen.getByText('abcd1234')).toBeInTheDocument();
  });

  it('renders status and priority labels', () => {
    const task = makeTask({ status: 'in_progress', priority: 'high' });
    render(<TaskDetail task={task} {...defaultProps} />);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
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
    // Should show Save and Cancel buttons
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const task = makeTask();
    render(<TaskDetail task={task} {...defaultProps} onClose={onClose} />);

    // The close button is the last button with an SVG icon
    const buttons = screen.getAllByRole('button');
    const closeButton = buttons[buttons.length - 1];
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
