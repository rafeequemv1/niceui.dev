import { useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/cn';

export type SortableListProps<T> = {
  items: T[];
  getId: (item: T) => string;
  onReorder: (items: T[]) => void;
  renderItem: (item: T, dragging: boolean) => ReactNode;
  rowHeight?: number;
  gap?: number;
};

type Drag = { id: string; from: number; to: number; dy: number; startY: number; dropping: boolean };

export function SortableList<T>({ items, getId, onReorder, renderItem, rowHeight = 56, gap = 8 }: SortableListProps<T>) {
  const [drag, setDrag] = useState<Drag | null>(null);
  const [instant, setInstant] = useState(false);
  const step = rowHeight + gap;
  const dragRef = useRef<Drag | null>(null);
  dragRef.current = drag;

  const onDown = (e: PointerEvent, id: string, index: number) => {
    if (drag) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDrag({ id, from: index, to: index, dy: 0, startY: e.clientY, dropping: false });
  };
  const onMove = (e: PointerEvent) => {
    const d = dragRef.current;
    if (!d || d.dropping) return;
    const min = -d.from * step - 12;
    const max = (items.length - 1 - d.from) * step + 12;
    const dy = Math.max(min, Math.min(max, e.clientY - d.startY));
    const to = Math.max(0, Math.min(items.length - 1, d.from + Math.round(dy / step)));
    setDrag({ ...d, dy, to });
  };
  const onUp = () => {
    const d = dragRef.current;
    if (!d || d.dropping) return;
    setDrag({ ...d, dy: (d.to - d.from) * step, dropping: true });
    window.setTimeout(() => {
      const next = [...items];
      const [moved] = next.splice(d.from, 1);
      next.splice(d.to, 0, moved);
      setInstant(true);
      onReorder(next);
      setDrag(null);
      requestAnimationFrame(() => requestAnimationFrame(() => setInstant(false)));
    }, 260);
  };

  const offsetFor = (i: number) => {
    if (!drag) return 0;
    if (i === drag.from) return drag.dy;
    if (drag.from < drag.to && i > drag.from && i <= drag.to) return -step;
    if (drag.from > drag.to && i < drag.from && i >= drag.to) return step;
    return 0;
  };

  return (
    <ul className="relative flex flex-col" style={{ gap }}>
      {items.map((item, i) => {
        const id = getId(item);
        const active = drag?.id === id;
        const live = active && !drag?.dropping;
        return (
          <li
            key={id}
            style={{
              height: rowHeight,
              transform: `translateY(${offsetFor(i)}px) scale(${live ? 1.03 : 1})`,
              transition: instant ? 'none' : live ? 'box-shadow 200ms' : 'transform 260ms cubic-bezier(0.32,0.72,0,1), box-shadow 200ms',
              zIndex: active ? 10 : 1,
            }}
            className={cn(
              'relative flex items-center gap-3 rounded-xl bg-ink-900 pl-1.5 pr-4',
              active ? 'shadow-pop ring-1 ring-brand-500/40' : 'shadow-hairline',
            )}
          >
            <button
              aria-label="Drag to reorder"
              onPointerDown={(e) => onDown(e, id, i)}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
              className={cn(
                'flex h-9 w-7 touch-none items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-white/5 hover:text-ink-200',
                live ? 'cursor-grabbing text-ink-100' : 'cursor-grab',
              )}
            >
              <GripVertical className="h-4 w-4" />
            </button>
            {renderItem(item, active)}
          </li>
        );
      })}
    </ul>
  );
}

type Task = { id: string; title: string; tag: string; tint: string; due: string };

const TASKS: Task[] = [
  { id: 't1', title: 'Finalize Q3 pricing page', tag: 'Marketing', tint: 'bg-amber-500/10 text-amber-300', due: 'Today' },
  { id: 't2', title: 'Migrate auth to passkeys', tag: 'Engineering', tint: 'bg-brand-500/10 text-brand-300', due: 'Tue' },
  { id: 't3', title: 'Interview: senior designer', tag: 'Hiring', tint: 'bg-emerald-500/10 text-emerald-300', due: 'Wed' },
  { id: 't4', title: 'Fix flaky checkout e2e test', tag: 'Engineering', tint: 'bg-brand-500/10 text-brand-300', due: 'Thu' },
  { id: 't5', title: 'Customer advisory board prep', tag: 'Sales', tint: 'bg-rose-500/10 text-rose-300', due: 'Fri' },
];

export function SortableListDemo() {
  const [tasks, setTasks] = useState(TASKS);
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-3 flex items-baseline justify-between px-1">
        <p className="text-sm font-medium text-ink-100">Priorities this week</p>
        <p className="text-xs text-ink-500">Drag the handle</p>
      </div>
      <SortableList
        items={tasks}
        getId={(t) => t.id}
        onReorder={setTasks}
        renderItem={(t) => (
          <>
            <span className="w-4 font-mono text-xs text-ink-500">{tasks.indexOf(t) + 1}</span>
            <span className="min-w-0 flex-1 truncate text-sm text-ink-100">{t.title}</span>
            <span className={cn('hidden rounded-md px-1.5 py-0.5 text-[11px] font-medium sm:inline', t.tint)}>{t.tag}</span>
            <span className="w-9 text-right text-xs text-ink-500">{t.due}</span>
          </>
        )}
      />
    </div>
  );
}
