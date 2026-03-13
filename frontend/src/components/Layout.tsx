import type { ReactNode } from 'react';
import type { ViewMode } from '../types';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onNewTask: () => void;
  children: ReactNode;
}

export function Layout({ view, onViewChange, onNewTask, children }: LayoutProps) {
  return (
    <div className="flex h-full">
      <Sidebar view={view} onViewChange={onViewChange} onNewTask={onNewTask} />
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}
