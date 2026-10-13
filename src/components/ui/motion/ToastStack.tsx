import { useEffect, useState, useSyncExternalStore } from 'react';
import { AlertTriangle, CheckCircle2, Info, Loader2, X, XCircle } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Portal } from './hooks';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';
export type ToastData = { id: number; type: ToastType; title: string; description?: string; duration: number; leaving?: boolean };
type Options = { description?: string; duration?: number };

let toasts: ToastData[] = [];
let seq = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

function add(type: ToastType, title: string, opts: Options = {}) {
  const id = ++seq;
  toasts = [{ id, type, title, description: opts.description, duration: opts.duration ?? 4000 }, ...toasts];
  emit();
  return id;
}
function update(id: number, patch: Partial<Omit<ToastData, 'id'>>) {
  toasts = toasts.map((t) => (t.id === id ? { ...t, ...patch } : t));
  emit();
}
function dismiss(id: number) {
  update(id, { leaving: true });
  window.setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
  }, 320);
}

/** Hook-free imperative API. Render <Toaster /> once. */
export const toast = Object.assign((title: string, o?: Options) => add('info', title, o), {
  success: (title: string, o?: Options) => add('success', title, o),
  error: (title: string, o?: Options) => add('error', title, o),
  warning: (title: string, o?: Options) => add('warning', title, o),
  info: (title: string, o?: Options) => add('info', title, o),
  loading: (title: string, o?: Options) => add('loading', title, o),
  update,
  dismiss,
  promise<T>(p: Promise<T>, msg: { loading: string; success: string; error: string }) {
    const id = add('loading', msg.loading);
    p.then(() => update(id, { type: 'success', title: msg.success })).catch(() => update(id, { type: 'error', title: msg.error }));
    return p;
  },
});

const ICONS = {
  success: <CheckCircle2 className="h-[18px] w-[18px] text-emerald-400" />,
  error: <XCircle className="h-[18px] w-[18px] text-rose-400" />,
  warning: <AlertTriangle className="h-[18px] w-[18px] text-amber-400" />,
  info: <Info className="h-[18px] w-[18px] text-brand-400" />,
  loading: <Loader2 className="h-[18px] w-[18px] animate-spin text-ink-300" />,
};
const BAR = { success: 'bg-emerald-400', error: 'bg-rose-400', warning: 'bg-amber-400', info: 'bg-brand-400', loading: 'bg-ink-500' };

const H = 68;
const GAP = 10;
const VISIBLE = 3;

function ToastItem({ t, index, expanded }: { t: ToastData; index: number; expanded: boolean }) {
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setEntered(true)));
    return () => cancelAnimationFrame(id);
  }, []);

  const hidden = index >= VISIBLE;
  let transform = expanded ? `translateY(${-index * (H + GAP)}px)` : `translateY(${-index * 12}px) scale(${1 - index * 0.05})`;
  if (!entered) transform = 'translateY(110%) scale(0.96)';
  if (t.leaving) transform = `translateY(${expanded ? -index * (H + GAP) : 0}px) translateX(24px) scale(0.96)`;

  return (
    <li
      role="status"
      style={{ transform, height: H, zIndex: 100 - index, opacity: !entered || t.leaving || (hidden && !expanded) ? 0 : 1 }}
      className="group absolute inset-x-0 bottom-0 origin-bottom overflow-hidden rounded-2xl bg-ink-850 shadow-pop transition-all duration-[420ms] ease-[cubic-bezier(0.32,0.72,0,1)]"
    >
      <div className={cn('flex h-full items-center gap-3 px-4 transition-opacity duration-300', !expanded && index > 0 && 'opacity-0')}>
        <span key={t.type} className="animate-scale-in">{ICONS[t.type]}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink-50">{t.title}</p>
          {t.description && <p className="truncate text-xs text-ink-400">{t.description}</p>}
        </div>
        <button onClick={() => dismiss(t.id)} aria-label="Dismiss" className="flex h-6 w-6 items-center justify-center rounded-md text-ink-500 opacity-0 transition hover:bg-white/5 hover:text-ink-100 group-hover:opacity-100">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      {t.type !== 'loading' && !t.leaving && (
        <span
          key={t.type}
          onAnimationEnd={() => dismiss(t.id)}
          className={cn('absolute bottom-0 left-0 h-0.5 w-full origin-left opacity-60', BAR[t.type])}
          style={{ animation: `toast-progress ${t.duration}ms linear forwards`, animationPlayState: expanded ? 'paused' : 'running' }}
        />
      )}
    </li>
  );
}

export function Toaster({ className }: { className?: string }) {
  const list = useSyncExternalStore(subscribe, () => toasts);
  const [expanded, setExpanded] = useState(false);
  const live = list.filter((t) => !t.leaving).length;
  useEffect(() => {
    if (live === 0) setExpanded(false);
  }, [live]);

  return (
    <Portal>
    <ol
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      style={{ height: expanded ? Math.min(list.length, 6) * (H + GAP) : H + 24 }}
      className={cn('fixed bottom-5 right-5 z-[110] w-[min(356px,calc(100vw-40px))]', list.length === 0 && 'pointer-events-none', className)}
    >
      <style>{'@keyframes toast-progress{from{transform:scaleX(1)}to{transform:scaleX(0)}}'}</style>
      {list.map((t, i) => (
        <ToastItem key={t.id} t={t} index={i} expanded={expanded} />
      ))}
    </ol>
    </Portal>
  );
}

const SAMPLES: Array<{ type: Exclude<ToastType, 'loading'>; title: string; description: string }> = [
  { type: 'success', title: 'Changes deployed', description: 'Production is now running build #482.' },
  { type: 'info', title: 'New comment on “Pricing v3”', description: 'Jonas: Let’s ship the annual toggle first.' },
  { type: 'warning', title: 'API key expires in 3 days', description: 'Rotate it from Settings → Tokens.' },
  { type: 'error', title: 'Upload failed', description: 'hero-video.mp4 exceeds the 200 MB limit.' },
];

/** Self-contained demo: buttons trigger toasts into a stacked Toaster. */
export function ToastStack() {
  const btn = 'focus-ring rounded-lg bg-ink-850 px-3 py-2 text-xs font-medium capitalize text-ink-200 shadow-hairline transition hover:bg-ink-800 hover:text-ink-50 active:scale-[0.97]';
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap justify-center gap-2">
        {SAMPLES.map((s) => (
          <button key={s.type} className={btn} onClick={() => toast[s.type](s.title, { description: s.description })}>
            {s.type}
          </button>
        ))}
        <button
          className={btn}
          onClick={() =>
            toast.promise(new Promise((r) => setTimeout(r, 1800)), { loading: 'Generating invoice…', success: 'Invoice INV-2048 sent', error: 'Could not generate invoice' })
          }
        >
          Promise
        </button>
      </div>
      <p className="text-xs text-ink-500">Hover the stack to fan it out and pause timers.</p>
      <Toaster />
    </div>
  );
}
