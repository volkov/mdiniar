import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { BoardView } from './BoardView';
import { makeTask } from '../test/helpers';

describe('BoardView', () => {
  it('renders status columns (excluding cancelled)', () => {
    render(<BoardView tasks={[]} onTaskClick={() => {}} />);
    expect(screen.getByText('Backlog')).toBeInTheDocument();
    expect(screen.getByText('Todo')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
    expect(screen.queryByText('Cancelled')).not.toBeInTheDocument();
  });

  it('groups tasks by status', () => {
    const tasks = [
      makeTask({ id: '1', title: 'Todo task', status: 'todo' }),
      makeTask({ id: '2', title: 'Done task', status: 'done' }),
      makeTask({ id: '3', title: 'Another todo', status: 'todo' }),
    ];
    render(<BoardView tasks={tasks} onTaskClick={() => {}} />);
    expect(screen.getByText('Todo task')).toBeInTheDocument();
    expect(screen.getByText('Done task')).toBeInTheDocument();
    expect(screen.getByText('Another todo')).toBeInTheDocument();
  });

  it('shows task count per column', () => {
    const tasks = [
      makeTask({ id: 'aa000001', status: 'todo' }),
      makeTask({ id: 'aa000003', status: 'todo' }),
    ];
    render(<BoardView tasks={tasks} onTaskClick={() => {}} />);
    // The todo column header should contain count "2" and others "0"
    const counts = screen.getAllByText('0');
    expect(counts.length).toBe(3); // backlog, in_progress, done
    // Use getAllByText since the id abbreviation may also match
    const twos = screen.getAllByText('2');
    expect(twos.length).toBeGreaterThanOrEqual(1);
  });

  it('calls onTaskClick when a card is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const task = makeTask({ id: '1', title: 'Click me' });
    render(<BoardView tasks={[task]} onTaskClick={onClick} />);

    await user.click(screen.getByText('Click me'));
    expect(onClick).toHaveBeenCalledWith(task);
  });
});
