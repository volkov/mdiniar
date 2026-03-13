import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TaskCard } from './TaskCard';
import { makeTask } from '../test/helpers';

describe('TaskCard', () => {
  it('renders task title', () => {
    const task = makeTask({ title: 'My task title' });
    render(<TaskCard task={task} onClick={() => {}} />);
    expect(screen.getByText('My task title')).toBeInTheDocument();
  });

  it('renders assignee when present', () => {
    const task = makeTask({ assignee: 'alice' });
    render(<TaskCard task={task} onClick={() => {}} />);
    expect(screen.getByText('alice')).toBeInTheDocument();
  });

  it('does not render assignee when null', () => {
    const task = makeTask({ assignee: null });
    render(<TaskCard task={task} onClick={() => {}} />);
    expect(screen.queryByText('Unassigned')).not.toBeInTheDocument();
  });

  it('renders labels', () => {
    const task = makeTask({ labels: ['bug', 'urgent'] });
    render(<TaskCard task={task} onClick={() => {}} />);
    expect(screen.getByText('bug')).toBeInTheDocument();
    expect(screen.getByText('urgent')).toBeInTheDocument();
  });

  it('shows abbreviated task id', () => {
    const task = makeTask({ id: 'abcdef12' });
    render(<TaskCard task={task} onClick={() => {}} />);
    expect(screen.getByText('abcdef')).toBeInTheDocument();
  });

  it('calls onClick with the task when clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const task = makeTask({ title: 'Click target' });
    render(<TaskCard task={task} onClick={onClick} />);

    await user.click(screen.getByText('Click target'));
    expect(onClick).toHaveBeenCalledWith(task);
  });
});
