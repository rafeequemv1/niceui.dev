import { useCallback, useRef, useState, type ReactNode } from 'react';
import { Check, Plus, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Portal, useEscape } from './hooks';

type Rect = { left: number; top: number; width: number; height: number };

export type CenterMorphModalProps = {
  label: ReactNode;
  width?: number;
  height?: number;
  duration?: number;
  children: (close: () => void) => ReactNode;
};

/** A pill button that morphs (size, position, radius) into a centered dialog. */
export function CenterMorphModal({ label, width = 420, height = 410, duration = 560, children }: CenterMorphModalProps) {
  const btn = useRef<HTMLButtonElement>(null);
  const [rect, setRect] = useState<Rect | null>(null);
  const [open, setOpen] = useState(false);

  const measure = () => {
    const r = btn.current?.getBoundingClientRect();
    return r ? { left: r.left, top: r.top, width: r.width, height: r.height } : null;
  };

  const show = () => {
    setRect(measure());
    requestAnimationFrame(() => requestAnimationFrame(() => setOpen(true)));
  };
  const close = useCallback(() => {
    const r = btn.current?.getBoundingClientRect();
    if (r) setRect({ left: r.left, top: r.top, width: r.width, height: r.height });
    setOpen(false);
    window.setTimeout(() => setRect(null), duration);
  }, [duration]);
  useEscape(open, close);

  const w = Math.min(width, typeof window === 'undefined' ? width : window.innerWidth - 32);
  const target: Rect = rect
    ? { width: w, height, left: (window.innerWidth - w) / 2, top: (window.innerHeight - height) / 2 }
    : { width: 0, height: 0, left: 0, top: 0 };
  const ease = `${duration}ms cubic-bezier(0.32, 0.72, 0, 1)`;

  return (
    <>
      <button
        ref={btn}
        onClick={show}
        className={cn(
          'focus-ring flex h-11 items-center gap-2 rounded-full bg-ink-50 px-5 text-sm font-medium text-ink-950 transition-all hover:bg-white active:scale-[0.97]',
          rect && 'opacity-0',
        )}
      >
        {label}
      </button>
      {rect && (
        <Portal>
        <div className="fixed inset-0 z-[100]">
          <div
            onClick={close}
            className={cn('absolute inset-0 bg-ink-950/60 backdrop-blur-sm transition-opacity duration-500', open ? 'opacity-100' : 'opacity-0')}
          />
          <div
            role="dialog"
            aria-modal
            className="absolute overflow-hidden shadow-pop"
            style={{
              ...(open ? target : rect),
              borderRadius: open ? 22 : rect.height / 2,
              backgroundColor: open ? '#131316' : '#f7f7f8',
              transition: ['left', 'top', 'width', 'height', 'border-radius', 'background-color'].map((p) => `${p} ${ease}`).join(', '),
            }}
          >
            <div
              className={cn(
                'absolute inset-0 flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium text-ink-950 transition-opacity',
                open ? 'opacity-0 duration-150' : 'opacity-100 delay-200 duration-300',
              )}
            >
              {label}
            </div>
            <div
              className={cn(
                'absolute inset-0 transition-all',
                open ? 'translate-y-0 scale-100 opacity-100 blur-0 delay-200 duration-500 ease-smooth' : 'translate-y-2 scale-[0.98] opacity-0 blur-sm duration-150',
              )}
              style={{ width: w, height }}
            >
              {children(close)}
            </div>
          </div>
        </div>
        </Portal>
      )}
    </>
  );
}

const PLANS = [
  { id: 'hobby', name: 'Hobby', price: 'Free', note: '1 member' },
  { id: 'pro', name: 'Pro', price: '$20/mo', note: 'Up to 10 members' },
  { id: 'team', name: 'Team', price: '$60/mo', note: 'Unlimited + SSO' },
];

export function CenterMorphModalDemo() {
  const [plan, setPlan] = useState('pro');
  const [name, setName] = useState('Acme Studio');
  return (
    <div className="flex justify-center">
      <CenterMorphModal label={<><Plus className="h-4 w-4" /> New workspace</>}>
        {(close) => (
          <div className="flex h-full flex-col p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium text-ink-50">Create workspace</h3>
                <p className="mt-0.5 text-sm text-ink-400">Workspaces hold your projects and members.</p>
              </div>
              <button onClick={close} aria-label="Close" className="focus-ring -mr-2 -mt-1 flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 transition hover:bg-white/5 hover:text-ink-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <label className="mt-5 text-xs font-medium text-ink-300">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 rounded-lg bg-ink-950 px-3 py-2 text-sm text-ink-50 shadow-hairline outline-none transition focus:shadow-glow"
            />
            <div className="mt-4 space-y-2">
              {PLANS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlan(p.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-300 ease-spring active:scale-[0.99]',
                    plan === p.id ? 'bg-brand-500/10 shadow-[inset_0_0_0_1px_rgba(51,150,255,0.5)]' : 'bg-ink-850 shadow-hairline hover:bg-ink-800',
                  )}
                >
                  <span className={cn('flex h-4 w-4 items-center justify-center rounded-full transition-all duration-300 ease-spring', plan === p.id ? 'scale-100 bg-brand-500' : 'scale-90 shadow-[inset_0_0_0_1.5px_#4f4f59]')}>
                    {plan === p.id && <Check className="h-2.5 w-2.5 animate-scale-in text-white" />}
                  </span>
                  <span className="flex-1 text-sm font-medium text-ink-100">{p.name}<span className="ml-2 text-xs font-normal text-ink-400">{p.note}</span></span>
                  <span className="text-xs text-ink-300">{p.price}</span>
                </button>
              ))}
            </div>
            <button
              onClick={close}
              disabled={!name.trim()}
              className="focus-ring mt-auto rounded-xl bg-brand-500 py-2.5 text-sm font-medium text-white transition hover:bg-brand-400 active:scale-[0.98] disabled:opacity-40"
            >
              Create {name.trim() || 'workspace'}
            </button>
          </div>
        )}
      </CenterMorphModal>
    </div>
  );
}
