import { useRef, useState, type ReactNode } from 'react';
import { Archive, RefreshCw, Trash2 } from 'lucide-react';
import { cn } from '@/lib/cn';

const REVEAL = 80;

export type SwipeRowProps = {
  children: ReactNode;
  onArchive: () => void;
  onDelete: () => void;
};

export function SwipeRow({ children, onArchive, onDelete }: SwipeRowProps) {
  const [x, setX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [gone, setGone] = useState<null | 'left' | 'right'>(null);
  const start = useRef({ px: 0, x: 0, w: 1 });

  const commit = (side: 'left' | 'right') => {
    setGone(side);
    setX(side === 'right' ? start.current.w : -start.current.w);
    window.setTimeout(side === 'right' ? onArchive : onDelete, 540);
  };

  const onUp = () => {
    if (!dragging) return;
    setDragging(false);
    const w = start.current.w;
    if (x > w * 0.45) return commit('right');
    if (x < -w * 0.45) return commit('left');
    if (x > REVEAL * 0.6) return setX(REVEAL);
    if (x < -REVEAL * 0.6) return setX(-REVEAL);
    setX(0);
  };

  const progress = Math.min(1, Math.abs(x) / (start.current.w * 0.45));
  return (
    <div className={cn('grid transition-all duration-300 ease-smooth', gone ? 'grid-rows-[0fr] opacity-0 delay-200' : 'grid-rows-[1fr]')}>
      <div className="overflow-hidden">
        <div className="relative overflow-hidden rounded-xl">
          <div className={cn('absolute inset-0 flex items-center justify-between transition-colors', x > 0 ? 'bg-emerald-500' : x < 0 ? 'bg-rose-500' : 'bg-transparent')}>
            <button onClick={() => commit('right')} tabIndex={-1} className="flex h-full items-center gap-2 pl-5 text-sm font-medium text-ink-950" style={{ opacity: x > 0 ? 1 : 0 }}>
              <Archive className="h-4 w-4 transition-transform duration-200" style={{ transform: `scale(${0.7 + progress * 0.5})` }} /> Archive
            </button>
            <button onClick={() => commit('left')} tabIndex={-1} className="flex h-full items-center gap-2 pr-5 text-sm font-medium text-white" style={{ opacity: x < 0 ? 1 : 0 }}>
              Delete <Trash2 className="h-4 w-4 transition-transform duration-200" style={{ transform: `scale(${0.7 + progress * 0.5})` }} />
            </button>
          </div>
          <div
            onPointerDown={(e) => {
              if (gone) return;
              e.currentTarget.setPointerCapture(e.pointerId);
              start.current = { px: e.clientX, x, w: e.currentTarget.offsetWidth };
              setDragging(true);
            }}
            onPointerMove={(e) => {
              if (!dragging) return;
              const raw = start.current.x + e.clientX - start.current.px;
              const max = start.current.w * 0.7;
              setX(Math.abs(raw) > max ? Math.sign(raw) * (max + (Math.abs(raw) - max) * 0.25) : raw);
            }}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            className={cn('relative touch-pan-y select-none bg-ink-850', dragging ? 'cursor-grabbing' : 'cursor-grab transition-transform duration-500 ease-spring')}
            style={{ transform: `translateX(${x}px)` }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export type MailItem = { id: number; from: string; subject: string; preview: string; time: string; color: string };

const MAIL: MailItem[] = [
  { id: 1, from: 'Mira Chen', subject: 'Onboarding v2 is ready', preview: 'I tightened the copy on step two and…', time: '9:41', color: 'from-amber-300 to-rose-400' },
  { id: 2, from: 'Vercel', subject: 'Deployment ready', preview: 'lumen-ui-docs deployed to production', time: '9:12', color: 'from-ink-200 to-ink-500' },
  { id: 3, from: 'Daniel Okafor', subject: 'Re: perf budget', preview: 'Bundle is down 18% after the split…', time: '8:57', color: 'from-brand-300 to-brand-600' },
  { id: 4, from: 'Linear', subject: '3 issues assigned to you', preview: 'LUM-212 Command palette arrow nav…', time: 'Yesterday', color: 'from-sky-300 to-teal-500' },
  { id: 5, from: 'Stripe', subject: 'Payout sent', preview: '$12,480.00 is on its way to your bank', time: 'Mon', color: 'from-emerald-300 to-teal-600' },
];

export function SwipeableListDemo() {
  const [items, setItems] = useState(MAIL);
  const [log, setLog] = useState<string | null>(null);
  const remove = (id: number, verb: string) => {
    const m = items.find((x) => x.id === id);
    setItems((xs) => xs.filter((x) => x.id !== id));
    setLog(`${verb} “${m?.subject}”`);
  };
  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="space-y-1.5 rounded-2xl bg-ink-900 p-1.5 shadow-card">
        {items.map((m) => (
          <SwipeRow key={m.id} onArchive={() => remove(m.id, 'Archived')} onDelete={() => remove(m.id, 'Deleted')}>
            <div className="flex items-center gap-3 px-3 py-3">
              <span className={cn('h-9 w-9 shrink-0 rounded-full bg-gradient-to-br', m.color)} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate text-sm font-medium text-ink-50">{m.from}</p>
                  <span className="shrink-0 text-[11px] text-ink-500">{m.time}</span>
                </div>
                <p className="truncate text-xs text-ink-200">{m.subject}</p>
                <p className="truncate text-xs text-ink-500">{m.preview}</p>
              </div>
            </div>
          </SwipeRow>
        ))}
        {items.length === 0 && (
          <div className="flex animate-scale-in flex-col items-center gap-3 py-10 text-sm text-ink-400">
            Inbox zero ✦
            <button onClick={() => setItems(MAIL)} className="flex items-center gap-1.5 rounded-full bg-ink-850 px-3 py-1.5 text-xs text-ink-200 shadow-hairline hover:text-ink-50">
              <RefreshCw className="h-3 w-3" /> Reset
            </button>
          </div>
        )}
      </div>
      <p className="mt-3 h-4 text-center text-xs text-ink-500">{log ? <span key={log} className="animate-fade-in">{log}</span> : 'Drag a row left to delete, right to archive'}</p>
    </div>
  );
}
