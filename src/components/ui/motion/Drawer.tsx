import { useCallback, useState, type ReactNode } from 'react';
import { Bell, Globe, Mail, Settings, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Portal, useEscape, usePresence } from './hooks';

export type DrawerProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  side?: 'right' | 'left';
  width?: number;
  footer?: ReactNode;
  children: ReactNode;
};

export function Drawer({ open, onClose, title, description, side = 'right', width = 400, footer, children }: DrawerProps) {
  const { mounted, visible } = usePresence(open, 420);
  useEscape(open, onClose);
  if (!mounted) return null;
  const hidden = side === 'right' ? 'translate-x-[105%]' : '-translate-x-[105%]';

  return (
    <Portal>
    <div className="fixed inset-0 z-[100]">
      <div
        onClick={onClose}
        className={cn('absolute inset-0 bg-ink-950/50 backdrop-blur-[6px] transition-all duration-500', visible ? 'opacity-100' : 'opacity-0')}
      />
      <aside
        role="dialog"
        aria-modal
        aria-label={title}
        style={{ width: `min(${width}px, calc(100vw - 24px))` }}
        className={cn(
          'absolute inset-y-3 flex flex-col rounded-2xl bg-ink-900 shadow-pop transition-transform duration-[420ms] ease-[cubic-bezier(0.32,0.72,0,1)]',
          side === 'right' ? 'right-3' : 'left-3',
          visible ? 'translate-x-0' : hidden,
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-white/5 p-5">
          <div>
            <h2 className="text-base font-medium text-ink-50">{title}</h2>
            {description && <p className="mt-0.5 text-sm text-ink-400">{description}</p>}
          </div>
          <button onClick={onClose} aria-label="Close" className="focus-ring -mr-1.5 flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 transition hover:bg-white/5 hover:text-ink-100 active:scale-90">
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && <footer className="border-t border-white/5 p-4">{footer}</footer>}
      </aside>
    </div>
    </Portal>
  );
}

function Switch({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={cn('focus-ring relative h-5 w-9 shrink-0 rounded-full transition-colors duration-300', on ? 'bg-brand-500' : 'bg-ink-700')}
    >
      <span className={cn('absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-300 ease-spring', on && 'translate-x-4')} />
    </button>
  );
}

const PREFS = [
  { id: 'email', icon: Mail, label: 'Email digest', hint: 'A weekly summary every Monday' },
  { id: 'push', icon: Bell, label: 'Push notifications', hint: 'Mentions and direct messages' },
  { id: 'public', icon: Globe, label: 'Public profile', hint: 'Visible to anyone with the link' },
];

export function DrawerDemo() {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<Record<string, boolean>>({ email: true, push: true, public: false });
  const [tz, setTz] = useState('Europe/Berlin');
  const close = useCallback(() => setOpen(false), []);

  return (
    <div className="flex justify-center">
      <button
        onClick={() => setOpen(true)}
        className="focus-ring flex items-center gap-2 rounded-xl bg-ink-850 px-4 py-2 text-sm font-medium text-ink-100 shadow-hairline transition hover:bg-ink-800 active:scale-[0.97]"
      >
        <Settings className="h-4 w-4" /> Open settings
      </button>
      <Drawer
        open={open}
        onClose={close}
        title="Preferences"
        description="Manage how NiceUI keeps you in the loop."
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={close} className="focus-ring rounded-lg px-3 py-2 text-sm text-ink-300 transition hover:bg-white/5 hover:text-ink-50">Cancel</button>
            <button onClick={close} className="focus-ring rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-400 active:scale-[0.97]">Save changes</button>
          </div>
        }
      >
        <div className="flex items-center gap-3 rounded-xl bg-ink-850 p-3 shadow-hairline">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-teal-400 text-sm font-semibold text-ink-950">MK</span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink-50">Maya Kowalski</p>
            <p className="truncate text-xs text-ink-400">maya@acme.design</p>
          </div>
        </div>
        <p className="mb-2 mt-6 text-xs font-medium uppercase tracking-wide text-ink-500">Notifications</p>
        <div className="space-y-1">
          {PREFS.map((p, i) => (
            <label
              key={p.id}
              style={{ animationDelay: `${150 + i * 60}ms` }}
              className="flex animate-fade-up cursor-pointer items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-white/[0.03]"
            >
              <p.icon className="h-4 w-4 text-ink-400" />
              <span className="flex-1">
                <span className="block text-sm text-ink-100">{p.label}</span>
                <span className="block text-xs text-ink-400">{p.hint}</span>
              </span>
              <Switch on={prefs[p.id]} onChange={(v) => setPrefs((s) => ({ ...s, [p.id]: v }))} />
            </label>
          ))}
        </div>
        <p className="mb-2 mt-6 text-xs font-medium uppercase tracking-wide text-ink-500">Region</p>
        <select
          value={tz}
          onChange={(e) => setTz(e.target.value)}
          className="w-full rounded-lg bg-ink-950 px-3 py-2 text-sm text-ink-100 shadow-hairline outline-none focus:shadow-glow"
        >
          {['America/New_York', 'Europe/London', 'Europe/Berlin', 'Asia/Tokyo'].map((z) => (
            <option key={z}>{z}</option>
          ))}
        </select>
      </Drawer>
    </div>
  );
}
