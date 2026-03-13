import type { Priority } from '../types';

const COLORS: Record<Priority, string> = {
  urgent: 'text-priority-urgent',
  high: 'text-priority-high',
  medium: 'text-priority-medium',
  low: 'text-priority-low',
  none: 'text-priority-none',
};

const BARS: Record<Priority, number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
  none: 0,
};

export function PriorityIcon({ priority }: { priority: Priority }) {
  const active = BARS[priority];
  return (
    <svg className={`w-4 h-4 shrink-0 mt-0.5 ${COLORS[priority]}`} viewBox="0 0 16 16" fill="none">
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={1 + i * 4}
          y={12 - (i + 1) * 2.5}
          width="3"
          height={(i + 1) * 2.5}
          rx="0.5"
          fill={i < active ? 'currentColor' : 'currentColor'}
          opacity={i < active ? 1 : 0.2}
        />
      ))}
    </svg>
  );
}
