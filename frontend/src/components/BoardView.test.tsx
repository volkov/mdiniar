import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { BoardView } from './BoardView';
import { makeTask } from '../test/helpers';

const defaultProps = {
  onTaskClick: vi.fn(),
  onUpdateTask: vi.fn().mockResolvedValue(makeTask()),
};

describe('BoardView', () => {
  it('renders status columns (excluding cancelled)', () => {
    render(<BoardView tasks={[]} {...defaultProps} />);
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
    render(<BoardView tasks={tasks} {...defaultProps} />);
    expect(screen.getByText('Todo task')).toBeInTheDocument();
    expect(screen.getByText('Done task')).toBeInTheDocument();
    expect(screen.getByText('Another todo')).toBeInTheDocument();
  });

  it('shows task count per column', () => {
    const tasks = [
      makeTask({ id: 'aa000001', status: 'todo' }),
      makeTask({ id: 'aa000003', status: 'todo' }),
    ];
    render(<BoardView tasks={tasks} {...defaultProps} />);
    const counts = screen.getAllByText('0');
    expect(counts.length).toBe(3); // backlog, in_progress, done
    const twos = screen.getAllByText('2');
    expect(twos.length).toBeGreaterThanOrEqual(1);
  });

  it('calls onTaskClick when a card is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const task = makeTask({ id: '1', title: 'Click me' });
    render(<BoardView tasks={[task]} onTaskClick={onClick} onUpdateTask={defaultProps.onUpdateTask} />);

    await user.click(screen.getByText('Click me'));
    expect(onClick).toHaveBeenCalledWith(task);
  });
});

describe('BoardView drag-and-drop', () => {
  it('task cards are draggable', () => {
    const task = makeTask({ id: 'drag01', title: 'Draggable' });
    render(<BoardView tasks={[task]} {...defaultProps} />);
    const card = screen.getByText('Draggable').closest('button');
    expect(card).toHaveAttribute('draggable', 'true');
  });

  it('sets task id in dataTransfer on dragStart', () => {
    const task = makeTask({ id: 'drag02', title: 'Drag me' });
    render(<BoardView tasks={[task]} {...defaultProps} />);
    const card = screen.getByText('Drag me').closest('button')!;

    const dataTransfer = { setData: vi.fn(), effectAllowed: '' };
    fireEvent.dragStart(card, { dataTransfer });
    expect(dataTransfer.setData).toHaveBeenCalledWith('text/plain', 'drag02');
  });

  it('calls onUpdateTask with new status on drop', () => {
    const onUpdateTask = vi.fn().mockResolvedValue(makeTask());
    const task = makeTask({ id: 'drop01', title: 'Drop task', status: 'todo' });
    const { container } = render(
      <BoardView tasks={[task]} onTaskClick={vi.fn()} onUpdateTask={onUpdateTask} />
    );

    // Find the "Done" column by locating its header text and getting the parent column div
    const doneHeader = screen.getByText('Done');
    const doneColumn = doneHeader.closest('.flex-1.min-w-\\[260px\\]') || doneHeader.parentElement!.parentElement!;

    const dataTransfer = { getData: vi.fn().mockReturnValue('drop01'), dropEffect: '' };
    fireEvent.dragOver(doneColumn, { dataTransfer });
    fireEvent.drop(doneColumn, { dataTransfer });

    expect(dataTransfer.getData).toHaveBeenCalledWith('text/plain');
    expect(onUpdateTask).toHaveBeenCalledWith('drop01', { status: 'done' });
  });

  it('does not call onUpdateTask when dropped on same status column', () => {
    const onUpdateTask = vi.fn().mockResolvedValue(makeTask());
    const task = makeTask({ id: 'same01', title: 'Same col', status: 'todo' });
    render(
      <BoardView tasks={[task]} onTaskClick={vi.fn()} onUpdateTask={onUpdateTask} />
    );

    const todoHeader = screen.getByText('Todo');
    const todoColumn = todoHeader.parentElement!.parentElement!;

    const dataTransfer = { getData: vi.fn().mockReturnValue('same01'), dropEffect: '' };
    fireEvent.drop(todoColumn, { dataTransfer });

    expect(onUpdateTask).not.toHaveBeenCalled();
  });
});
