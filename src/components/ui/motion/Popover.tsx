import { useCallback, useRef, useState, type ReactNode } from 'react';
import { Check, Link, UserPlus } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useClickOutside, useEscape, usePresence } from './hooks';

type Align = 'start' | 'center' | 'end';

const ALIGN: Record<Align, string> = {
  start: 'left-0 origin-top-left',
  center: 'left-1/2 -translate-x-1/2 origin-top',
  end: 'right-0 origin-top-right',
};

export type PopoverProps = {
  trigger: (props: { open: boolean; toggle: () => void }) => ReactNode;
  children: (close: () => void) => ReactNode;
  align?: Align;
  width?: number;
  className?: string;
};

export function Popover({ trigger, children, align = 'start', width = 320, className }: PopoverProps) {
  const [open, setOpen] = useState(false);
  const { mounted, visible } = usePresence(open, 180);
  const root = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useEscape(open, close);
  useClickOutside([root], open, close);

  return (
    <div ref={root} className="relative inline-block">
      {trigger({ open, toggle: () => setOpen((o) => !o) })}
      {mounted && (
        <div
          role="dialog"
          style={{ width }}
          className={cn(
            'absolute top-full z-50 mt-2 rounded-2xl bg-ink-900 p-4 shadow-pop',
            ALIGN[align],
            visible
              ? 'scale-100 opacity-100 blur-0 transition-all duration-300 ease-spring'
              : 'scale-[0.92] -translate-y-1 opacity-0 blur-[2px] transition-all duration-150 ease-out',
            className,
          )}
        >
          {children(close)}
        </div>
      )}
    </div>
  );
}

const ROLES = ['Viewer', 'Editor', 'Admin'] as const;

export function PopoverDemo() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<(typeof ROLES)[number]>('Editor');
  const [sent, setSent] = useState<string | null>(null);
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <div className="flex min-h-[300px] w-full items-start justify-center pt-4">
      <Popover
        align="center"
        trigger={({ open, toggle }) => (
          <button
            onClick={toggle}
            className={cn(
              'focus-ring flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all active:scale-[0.97]',
              open ? 'bg-ink-800 text-ink-50 shadow-hairline' : 'bg-ink-50 text-ink-950 hover:bg-white',
            )}
          >
            <UserPlus className="h-4 w-4" /> Invite teammate
          </button>
        )}
      >
        {(close) => (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!valid) return;
              setSent(email);
              setEmail('');
              window.setTimeout(close, 900);
              window.setTimeout(() => setSent(null), 1200);
            }}
            className="space-y-3"
          >
            <div>
              <p className="text-sm font-medium text-ink-50">Invite to Acme Design</p>
              <p className="mt-0.5 text-xs text-ink-400">They’ll get an email with a link to join.</p>
            </div>
            <input
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full rounded-lg bg-ink-950 px-3 py-2 text-sm text-ink-50 shadow-hairline outline-none transition placeholder:text-ink-500 focus:shadow-glow"
            />
            <div className="relative grid grid-cols-3 rounded-lg bg-ink-950 p-0.5 shadow-hairline">
              <span
                className="absolute inset-y-0.5 left-0.5 w-[calc((100%-4px)/3)] rounded-md bg-ink-800 shadow-hairline transition-transform duration-300 ease-spring"
                style={{ transform: `translateX(${ROLES.indexOf(role) * 100}%)` }}
              />
              {ROLES.map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRole(r)}
                  className={cn('relative z-10 py-1.5 text-xs font-medium transition-colors', role === r ? 'text-ink-50' : 'text-ink-400 hover:text-ink-200')}
                >
                  {r}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => navigator.clipboard?.writeText('https://lumen.app/join/acme-7f3k')}
                className="focus-ring flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium text-ink-300 transition hover:bg-white/5 hover:text-ink-50"
              >
                <Link className="h-3.5 w-3.5" /> Copy link
              </button>
              <button
                type="submit"
                disabled={!valid && !sent}
                className="focus-ring ml-auto flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-2 text-xs font-medium text-white transition hover:bg-brand-400 active:scale-[0.97] disabled:opacity-40"
              >
                {sent && !email ? (
                  <span key="ok" className="flex animate-scale-in items-center gap-1.5"><Check className="h-3.5 w-3.5" /> Sent</span>
                ) : (
                  <span key="send" className="animate-fade-in">Send invite</span>
                )}
              </button>
            </div>
          </form>
        )}
      </Popover>
    </div>
  );
}
