import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ListView } from './ListView';
import { makeTask } from '../test/helpers';

describe('ListView', () => {
  it('renders table headers', () => {
    render(<ListView tasks={[]} onTaskClick={() => {}} />);
    expect(screen.getByText(/ID/)).toBeInTheDocument();
    expect(screen.getByText(/Title/)).toBeInTheDocument();
    expect(screen.getByText(/Status/)).toBeInTheDocument();
    expect(screen.getByText(/Priority/)).toBeInTheDocument();
    expect(screen.getByText(/Assignee/)).toBeInTheDocument();
    expect(screen.getByText(/Labels/)).toBeInTheDocument();
    expect(screen.getByText(/Created/)).toBeInTheDocument();
  });

  it('renders empty state message when no tasks', () => {
    render(<ListView tasks={[]} onTaskClick={() => {}} />);
    expect(screen.getByText(/No tasks yet/)).toBeInTheDocument();
  });

  it('renders task rows', () => {
    const tasks = [
      makeTask({ id: 'abc12345', title: 'First' }),
      makeTask({ id: 'def67890', title: 'Second' }),
    ];
    render(<ListView tasks={tasks} onTaskClick={() => {}} />);
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  it('calls onTaskClick when a row is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const task = makeTask({ id: '1', title: 'Clickable' });
    render(<ListView tasks={[task]} onTaskClick={onClick} />);

    await user.click(screen.getByText('Clickable'));
    expect(onClick).toHaveBeenCalledWith(task);
  });
});
