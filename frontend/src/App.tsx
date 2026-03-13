import { useState } from 'react';
import type { Task, ViewMode } from './types';
import { useTasks } from './hooks/useTasks';
import { Layout } from './components/Layout';
import { BoardView } from './components/BoardView';
import { ListView } from './components/ListView';
import { TaskDetail } from './components/TaskDetail';
import { TaskForm } from './components/TaskForm';

function App() {
  const { tasks, loading, error, create, update, remove } = useTasks();
  const [view, setView] = useState<ViewMode>('board');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleUpdate = async (id: string, input: Parameters<typeof update>[1]) => {
    const updated = await update(id, input);
    setSelectedTask(updated);
    return updated;
  };

  return (
    <Layout view={view} onViewChange={setView} onNewTask={() => setShowForm(true)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-primary">
        <h2 className="text-sm font-medium text-text-primary">
          {view === 'board' ? 'Board' : 'All Tasks'}
        </h2>
        <span className="text-xs text-text-tertiary">
          {tasks.length} task{tasks.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center text-text-tertiary text-sm">
          Loading tasks...
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center text-red-400 text-sm">
          {error}
        </div>
      ) : view === 'board' ? (
        <BoardView tasks={tasks} onTaskClick={handleTaskClick} />
      ) : (
        <ListView tasks={tasks} onTaskClick={handleTaskClick} />
      )}

      {/* Task Detail Panel */}
      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          onUpdate={handleUpdate}
          onDelete={remove}
          onClose={() => setSelectedTask(null)}
        />
      )}

      {/* New Task Form */}
      {showForm && (
        <TaskForm
          onSubmit={async (input) => {
            await create(input);
          }}
          onClose={() => setShowForm(false)}
        />
      )}
    </Layout>
  );
}

export default App;
