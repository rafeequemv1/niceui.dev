import { useCallback, useEffect, useRef, useState, type ReactNode, type PointerEvent as ReactPointerEvent } from 'react';
import { cn } from '@/lib/cn';

type Axis = 'y' | 'x';

export type ScrollAreaProps = {
  children: ReactNode;
  /** Which directions can scroll. */
  orientation?: 'vertical' | 'horizontal' | 'both';
  /** Show soft fade edges where more content is hidden. */
  fades?: boolean;
  /** Hide the bars after this many ms without scrolling (0 keeps them visible). */
  hideDelay?: number;
  className?: string;
  /** Classes for the scrolling viewport (set height or max-height here). */
  viewportClassName?: string;
  'aria-label'?: string;
};

type Metrics = { size: number; offset: number; visible: boolean };

function measure(el: HTMLElement, axis: Axis): Metrics {
  const client = axis === 'y' ? el.clientHeight : el.clientWidth;
  const total = axis === 'y' ? el.scrollHeight : el.scrollWidth;
  const pos = axis === 'y' ? el.scrollTop : el.scrollLeft;
  if (total <= client + 1) return { size: 0, offset: 0, visible: false };
  const size = Math.max(24, (client / total) * client);
  const offset = (pos / (total - client)) * (client - size);
  return { size, offset, visible: true };
}

/**
 * A custom scrollbar for React: thin bars that grow on hover, fade when idle,
 * can be dragged or clicked to jump, with optional fade edges. Native wheel,
 * touch and keyboard scrolling all keep working.
 */
export function ScrollArea({ children, orientation = 'vertical', fades = true, hideDelay = 900, className, viewportClassName, ...rest }: ScrollAreaProps) {
  const viewport = useRef<HTMLDivElement>(null);
  const [y, setY] = useState<Metrics>({ size: 0, offset: 0, visible: false });
  const [x, setX] = useState<Metrics>({ size: 0, offset: 0, visible: false });
  const [edges, setEdges] = useState({ top: false, bottom: false, left: false, right: false });
  const [active, setActive] = useState(false);
  const [dragging, setDragging] = useState<Axis | null>(null);
  const idle = useRef<number>(0);
  const showY = orientation !== 'horizontal';
  const showX = orientation !== 'vertical';

  const update = useCallback(() => {
    const el = viewport.current;
    if (!el) return;
    if (showY) setY(measure(el, 'y'));
    if (showX) setX(measure(el, 'x'));
    setEdges({
      top: el.scrollTop > 2,
      bottom: el.scrollTop + el.clientHeight < el.scrollHeight - 2,
      left: el.scrollLeft > 2,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 2,
    });
  }, [showX, showY]);

  const wake = useCallback(() => {
    setActive(true);
    window.clearTimeout(idle.current);
    if (hideDelay > 0) idle.current = window.setTimeout(() => setActive(false), hideDelay);
  }, [hideDelay]);

  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => {
      ro.disconnect();
      window.clearTimeout(idle.current);
    };
  }, [update]);

  const onScroll = () => {
    update();
    wake();
  };

  /* drag the thumb */
  const startDrag = (axis: Axis) => (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = viewport.current;
    if (!el) return;
    e.preventDefault();
    e.stopPropagation();
    const startPointer = axis === 'y' ? e.clientY : e.clientX;
    const startScroll = axis === 'y' ? el.scrollTop : el.scrollLeft;
    const m = axis === 'y' ? y : x;
    const client = axis === 'y' ? el.clientHeight : el.clientWidth;
    const total = axis === 'y' ? el.scrollHeight : el.scrollWidth;
    const ratio = (total - client) / Math.max(1, client - m.size);
    setDragging(axis);
    const move = (ev: PointerEvent) => {
      const d = (axis === 'y' ? ev.clientY : ev.clientX) - startPointer;
      if (axis === 'y') el.scrollTop = startScroll + d * ratio;
      else el.scrollLeft = startScroll + d * ratio;
    };
    const up = () => {
      setDragging(null);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  /* click the track to jump there */
  const jump = (axis: Axis) => (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = viewport.current;
    if (!el || e.target !== e.currentTarget) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const m = axis === 'y' ? y : x;
    const client = axis === 'y' ? el.clientHeight : el.clientWidth;
    const total = axis === 'y' ? el.scrollHeight : el.scrollWidth;
    const p = (axis === 'y' ? e.clientY - rect.top : e.clientX - rect.left) - m.size / 2;
    const target = (p / Math.max(1, client - m.size)) * (total - client);
    el.scrollTo({ [axis === 'y' ? 'top' : 'left']: target, behavior: 'smooth' });
  };

  const shown = active || dragging !== null;

  return (
    <div className={cn('group/sa relative flex flex-col overflow-hidden', className)} onPointerEnter={wake} onPointerMove={wake}>
      <div
        ref={viewport}
        onScroll={onScroll}
        tabIndex={0}
        role="region"
        aria-label={rest['aria-label'] ?? 'Scrollable content'}
        className={cn(
          'focus-ring min-h-0 w-full flex-1 rounded-[inherit] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          showY ? 'overflow-y-auto' : 'overflow-y-hidden',
          showX ? 'overflow-x-auto' : 'overflow-x-hidden',
          viewportClassName,
        )}
      >
        <div className={cn(showX && 'w-max min-w-full')}>{children}</div>
      </div>

      {fades && (
        <>
          <div aria-hidden className={cn('pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-ink-950 to-transparent transition-opacity duration-300', edges.top ? 'opacity-100' : 'opacity-0')} />
          <div aria-hidden className={cn('pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-ink-950 to-transparent transition-opacity duration-300', showY && edges.bottom ? 'opacity-100' : 'opacity-0')} />
          {showX && (
            <>
              <div aria-hidden className={cn('pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-ink-950 to-transparent transition-opacity duration-300', edges.left ? 'opacity-100' : 'opacity-0')} />
              <div aria-hidden className={cn('pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-ink-950 to-transparent transition-opacity duration-300', edges.right ? 'opacity-100' : 'opacity-0')} />
            </>
          )}
        </>
      )}

      {showY && y.visible && (
        <div
          aria-hidden
          onPointerDown={jump('y')}
          className={cn('group/track absolute bottom-1 right-0.5 top-1 w-2.5 cursor-pointer transition-opacity duration-300', shown ? 'opacity-100' : 'opacity-0 group-hover/sa:opacity-100')}
        >
          <div
            onPointerDown={startDrag('y')}
            className={cn(
              'absolute right-0.5 w-1.5 rounded-full bg-ink-400/50 transition-[width,background-color] duration-200 group-hover/track:w-2 group-hover/track:bg-ink-300/70',
              dragging === 'y' && 'w-2 bg-brand-300',
            )}
            style={{ height: y.size - 8, transform: `translateY(${y.offset}px)` }}
          />
        </div>
      )}
      {showX && x.visible && (
        <div
          aria-hidden
          onPointerDown={jump('x')}
          className={cn('group/trackx absolute bottom-0.5 left-1 right-1 h-2.5 cursor-pointer transition-opacity duration-300', shown ? 'opacity-100' : 'opacity-0 group-hover/sa:opacity-100')}
        >
          <div
            onPointerDown={startDrag('x')}
            className={cn(
              'absolute bottom-0.5 h-1.5 rounded-full bg-ink-400/50 transition-[height,background-color] duration-200 group-hover/trackx:h-2 group-hover/trackx:bg-ink-300/70',
              dragging === 'x' && 'h-2 bg-brand-300',
            )}
            style={{ width: x.size - 8, transform: `translateX(${x.offset}px)` }}
          />
        </div>
      )}
    </div>
  );
}

const RELEASES = [
  ['v4.2.0', 'Command palette gets fuzzy search and recent items.'],
  ['v4.1.3', 'Fixed focus trapping in nested dialogs.'],
  ['v4.1.0', 'New bottom sheet with snap points and drag to dismiss.'],
  ['v4.0.2', 'Charts render 40% faster on large data sets.'],
  ['v4.0.0', 'Light theme for every component, rebuilt tokens.'],
  ['v3.9.4', 'Toast stack respects reduced motion.'],
  ['v3.9.0', 'Data table: column pinning and resizable columns.'],
  ['v3.8.1', 'Select keeps focus after choosing with Enter.'],
  ['v3.8.0', 'Date range picker with presets.'],
  ['v3.7.2', 'Tooltip collision handling near the viewport edge.'],
  ['v3.7.0', 'Kanban board with keyboard drag and drop.'],
  ['v3.6.0', 'Initial release of the AI chat kit.'],
];

const TAGS = ['Design', 'Engineering', 'Research', 'Marketing', 'Sales', 'Support', 'Finance', 'Legal', 'Ops', 'People', 'Data', 'Security'];

export function ScrollAreaDemo() {
  return (
    <div className="mx-auto grid w-full max-w-3xl gap-5 md:grid-cols-[1fr_1.1fr]">
      <div className="rounded-2xl bg-ink-900 shadow-card">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
          <p className="text-sm font-medium text-ink-100">Changelog</p>
          <span className="text-xs text-ink-400">{RELEASES.length} releases</span>
        </div>
        <ScrollArea className="rounded-b-2xl" viewportClassName="h-72" aria-label="Changelog">
          <ul className="divide-y divide-white/[0.05]">
            {RELEASES.map(([v, t]) => (
              <li key={v} className="flex gap-3 px-4 py-3">
                <span className="shrink-0 font-mono text-xs text-brand-300">{v}</span>
                <span className="text-sm leading-relaxed text-ink-300">{t}</span>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </div>

      <div className="min-w-0 space-y-5">
        <div className="rounded-2xl bg-ink-900 p-4 shadow-card">
          <p className="mb-3 text-sm font-medium text-ink-100">Teams</p>
          <ScrollArea orientation="horizontal" viewportClassName="pb-3" aria-label="Teams">
            <div className="flex gap-2">
              {TAGS.map((t) => (
                <span key={t} className="shrink-0 rounded-full border border-white/[0.08] bg-ink-850 px-3 py-1.5 text-xs text-ink-200">
                  {t}
                </span>
              ))}
            </div>
          </ScrollArea>
        </div>
        <div className="rounded-2xl bg-ink-900 shadow-card">
          <p className="px-4 pt-4 text-sm font-medium text-ink-100">Both directions</p>
          <ScrollArea orientation="both" className="m-4 mt-3 rounded-xl border border-white/[0.06]" viewportClassName="h-40" aria-label="Grid">
            <div className="grid w-[560px] grid-cols-6 gap-2 p-3">
              {Array.from({ length: 48 }, (_, i) => (
                <div key={i} className="grid h-12 place-items-center rounded-lg bg-ink-850 font-mono text-[11px] text-ink-400">
                  {String(i + 1).padStart(2, '0')}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
        <p className="text-xs text-ink-500">Drag a thumb, click the track to jump, or focus an area and use the arrow keys.</p>
      </div>
    </div>
  );
}
