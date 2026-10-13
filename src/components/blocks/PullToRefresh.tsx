import { useRef, useState, type ReactNode } from 'react';
import { ArrowDown, Battery, RefreshCw, Wifi } from 'lucide-react';
import { cn } from '@/lib/cn';

const THRESHOLD = 72;
const HOLD = 56;

export type PullToRefreshProps = { onRefresh: () => Promise<void>; children: ReactNode; className?: string };

export function PullToRefresh({ onRefresh, children, className }: PullToRefreshProps) {
  const [pull, setPull] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const start = useRef<number | null>(null);

  const rubber = (d: number) => (d <= 0 ? 0 : 140 * (1 - Math.exp(-d / 160)));

  const end = async () => {
    if (start.current === null) return;
    start.current = null;
    setDragging(false);
    if (pull >= THRESHOLD && !refreshing) {
      setRefreshing(true);
      setPull(HOLD);
      await onRefresh();
      setRefreshing(false);
    }
    setPull(0);
  };

  const progress = Math.min(1, pull / THRESHOLD);
  const ready = pull >= THRESHOLD;

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center" style={{ height: HOLD, transform: `translateY(${pull - HOLD}px)`, transition: dragging ? 'none' : 'transform 500ms cubic-bezier(0.34,1.4,0.64,1)' }}>
        <span
          className={cn('mt-3 flex h-8 w-8 items-center justify-center rounded-full bg-ink-800 shadow-pop transition-colors duration-200', ready || refreshing ? 'text-brand-400' : 'text-ink-400')}
          style={{ opacity: refreshing ? 1 : progress, transform: `scale(${0.6 + progress * 0.4})` }}
        >
          {refreshing ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowDown className="h-4 w-4 transition-transform duration-300 ease-spring" style={{ transform: `rotate(${ready ? 180 : progress * 120}deg)` }} />
          )}
        </span>
      </div>
      <div
        ref={scroller}
        onPointerDown={(e) => {
          if (refreshing || (scroller.current?.scrollTop ?? 0) > 0 || e.button !== 0) return;
          start.current = e.clientY;
          e.currentTarget.setPointerCapture(e.pointerId);
          setDragging(true);
        }}
        onPointerMove={(e) => start.current !== null && setPull(rubber(e.clientY - start.current))}
        onPointerUp={end}
        onPointerCancel={end}
        className={cn('h-full touch-pan-x select-none overflow-y-auto', dragging ? 'cursor-grabbing' : 'cursor-grab')}
        style={{ transform: `translateY(${pull}px)`, transition: dragging ? 'none' : 'transform 500ms cubic-bezier(0.34,1.4,0.64,1)' }}
      >
        {children}
      </div>
    </div>
  );
}

type Post = { id: number; name: string; text: string; time: string; color: string; fresh?: boolean };

const NAMES = ['Mira Chen', 'Daniel Okafor', 'Sana Patel', 'Leo Martins', 'Ana Ruiz', 'Kenji Mori'];
const TEXTS = ['Shipped the new onboarding flow 🚀', 'Anyone up for a design crit at 3?', 'Bundle size down 18% after code-splitting.', 'The new motion tokens feel so good.', 'Reminder: retro moved to Thursday.', 'Dark mode contrast pass is done ✦', 'Who broke staging? (it was me)'];
const COLORS = ['from-amber-300 to-rose-400', 'from-brand-300 to-brand-600', 'from-emerald-300 to-teal-600', 'from-sky-300 to-sky-600', 'from-rose-300 to-amber-500'];

const make = (id: number, time: string, fresh = false): Post => ({ id, name: NAMES[id % NAMES.length], text: TEXTS[id % TEXTS.length], time, color: COLORS[id % COLORS.length], fresh });

export function PullToRefreshDemo() {
  const [posts, setPosts] = useState(() => [3, 4, 5, 6, 7, 8].map((i, k) => make(i, `${(k + 1) * 7}m`)));
  const nextId = useRef(20);

  const refresh = () =>
    new Promise<void>((resolve) => {
      window.setTimeout(() => {
        const n = 1 + Math.floor(Math.random() * 2);
        const fresh = Array.from({ length: n }, () => make(nextId.current++, 'now', true));
        setPosts((p) => [...fresh, ...p.map((x) => ({ ...x, fresh: false }))]);
        resolve();
      }, 1400);
    });

  return (
    <div className="flex justify-center">
      <div className="relative h-[460px] w-[260px] overflow-hidden rounded-[40px] bg-ink-950 p-2 shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_0_0_6px_#131316,0_24px_60px_-12px_rgba(0,0,0,0.8)]">
        <div className="relative flex h-full flex-col overflow-hidden rounded-[32px] bg-ink-900">
          <div className="flex items-center justify-between px-6 pb-1 pt-3 text-[11px] font-medium text-ink-100">
            <span>9:41</span>
            <span className="absolute left-1/2 top-2 h-5 w-20 -translate-x-1/2 rounded-full bg-black" />
            <span className="flex items-center gap-1"><Wifi className="h-3 w-3" /><Battery className="h-3.5 w-3.5" /></span>
          </div>
          <div className="relative z-10 border-b border-white/5 bg-ink-900 px-4 pb-2 pt-2">
            <p className="text-lg font-semibold text-ink-50">Feed</p>
          </div>
          <PullToRefresh onRefresh={refresh} className="flex-1">
            <div className="divide-y divide-white/5">
              {posts.map((p) => (
                <div key={p.id} className={cn('flex gap-2.5 px-4 py-3', p.fresh && 'animate-fade-down bg-brand-500/[0.06]')}>
                  <span className={cn('h-8 w-8 shrink-0 rounded-full bg-gradient-to-br', p.color)} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between">
                      <p className="truncate text-xs font-medium text-ink-100">{p.name}</p>
                      <span className={cn('text-[10px]', p.fresh ? 'text-brand-300' : 'text-ink-500')}>{p.time}</span>
                    </div>
                    <p className="mt-0.5 text-xs leading-snug text-ink-300">{p.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </PullToRefresh>
          <p className="pointer-events-none absolute inset-x-0 bottom-2 text-center text-[10px] text-ink-500">Drag down to refresh</p>
        </div>
      </div>
    </div>
  );
}
