import type { ViewMode } from '../types';

interface SidebarProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onNewTask: () => void;
}

export function Sidebar({ view, onViewChange, onNewTask }: SidebarProps) {
  return (
    <aside className="w-56 shrink-0 bg-bg-secondary border-r border-border-primary flex flex-col h-full">
      <div className="p-4 border-b border-border-primary">
        <h1 className="text-sm font-semibold text-text-primary tracking-wide">md-linear</h1>
      </div>

      <nav className="flex-1 p-2 space-y-0.5">
        <button
          onClick={() => onViewChange('board')}
          className={`w-full text-left px-3 py-1.5 rounded text-sm flex items-center gap-2 transition-colors ${
            view === 'board'
              ? 'bg-bg-active text-text-primary'
              : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125z" />
          </svg>
          Board
        </button>
        <button
          onClick={() => onViewChange('list')}
          className={`w-full text-left px-3 py-1.5 rounded text-sm flex items-center gap-2 transition-colors ${
            view === 'list'
              ? 'bg-bg-active text-text-primary'
              : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          List
        </button>
      </nav>

      <div className="p-2 border-t border-border-primary">
        <button
          onClick={onNewTask}
          className="w-full px-3 py-1.5 rounded text-sm text-text-secondary hover:bg-bg-hover hover:text-text-primary flex items-center gap-2 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Task
        </button>
      </div>
    </aside>
  );
}
