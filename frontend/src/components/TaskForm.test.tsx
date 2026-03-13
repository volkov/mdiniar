import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TaskForm } from './TaskForm';

describe('TaskForm', () => {
  it('renders the form with all fields', () => {
    render(<TaskForm onSubmit={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByText('New Task')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Task title')).toBeInTheDocument();
    expect(screen.getByText('Create Task')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('submit button is disabled when title is empty', () => {
    render(<TaskForm onSubmit={vi.fn()} onClose={vi.fn()} />);
    const submitBtn = screen.getByText('Create Task');
    expect(submitBtn).toBeDisabled();
  });

  it('submit button is enabled when title is filled', async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={vi.fn().mockResolvedValue(undefined)} onClose={vi.fn()} />);

    await user.type(screen.getByPlaceholderText('Task title'), 'My new task');
    expect(screen.getByText('Create Task')).not.toBeDisabled();
  });

  it('calls onSubmit with the input when form is submitted', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    render(<TaskForm onSubmit={onSubmit} onClose={onClose} />);

    await user.type(screen.getByPlaceholderText('Task title'), 'New task');
    await user.click(screen.getByText('Create Task'));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'New task' })
    );
  });

  it('calls onClose when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<TaskForm onSubmit={vi.fn()} onClose={onClose} />);

    await user.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });
});
