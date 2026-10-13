import { useEffect, useState, type ComponentType, type ReactNode } from 'react';
import { Bell, Search } from 'lucide-react';
import { cn } from '@/lib/cn';

export type NavItem = { id: string; label: string; icon: ComponentType<{ className?: string }>; badge?: number };

export const avatarColors: Record<string, string> = {
  azure: 'from-brand-400 to-brand-700',
  emerald: 'from-emerald-400 to-teal-600',
  amber: 'from-amber-400 to-orange-600',
  rose: 'from-rose-400 to-rose-700',
  sky: 'from-sky-400 to-sky-700',
  teal: 'from-teal-400 to-emerald-600',
};

export function Avatar({ initials, color = 'azure', size = 'md', ring }: { initials: string; color?: keyof typeof avatarColors | string; size?: 'sm' | 'md' | 'lg'; ring?: boolean }) {
  const s = size === 'lg' ? 'h-11 w-11 text-base' : size === 'sm' ? 'h-7 w-7 text-[11px]' : 'h-9 w-9 text-xs';
  return (
    <span
      className={cn('inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white', avatarColors[color] ?? avatarColors.azure, s, ring && 'ring-2 ring-ink-950')}
    >
      {initials}
    </span>
  );
}

export function AppShell({
  brand,
  nav,
  active,
  onNav,
  topbar,
  children,
  tools,
}: {
  brand: ReactNode;
  nav: NavItem[];
  active: string;
  onNav: (id: string) => void;
  topbar: ReactNode;
  tools?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-full">
      {/* sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-white/5 bg-ink-950/60 p-3 backdrop-blur lg:flex">
        <div className="flex h-12 items-center gap-2.5 px-2">{brand}</div>
        <div className="mt-2 flex items-center gap-2 rounded-xl bg-ink-900 px-3 py-2 text-ink-500 ring-1 ring-white/5">
          <Search className="h-4 w-4" />
          <span className="text-xs">Search…</span>
          <kbd className="ml-auto rounded bg-white/10 px-1.5 py-px font-mono text-[10px] text-ink-400">⌘K</kbd>
        </div>
        <nav className="mt-3 flex-1 space-y-0.5 overflow-y-auto">
          {nav.map((n) => {
            const on = n.id === active;
            const Icon = n.icon;
            return (
              <button
                key={n.id}
                onClick={() => onNav(n.id)}
                className={cn(
                  'focus-ring group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  on ? 'bg-white/[0.06] font-medium text-ink-50' : 'text-ink-400 hover:bg-white/[0.03] hover:text-ink-100',
                )}
              >
                <Icon className={cn('h-4 w-4 shrink-0 transition-colors', on ? 'text-brand-400' : 'text-ink-500 group-hover:text-ink-300')} />
                {n.label}
                {n.badge ? <span className="ml-auto rounded-full bg-brand-500/15 px-1.5 text-[10px] font-semibold text-brand-300">{n.badge}</span> : null}
                {on && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-400" />}
              </button>
            );
          })}
        </nav>
        {tools}
      </aside>

      {/* mobile top nav scroll */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-white/5 bg-ink-950/80 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-2 lg:hidden">{brand}</div>
          <div className="relative hidden flex-1 sm:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
            <input
              placeholder="Search…"
              className="focus-ring h-9 w-full max-w-xs rounded-lg bg-ink-900 pl-9 pr-3 text-sm text-ink-100 placeholder:text-ink-500 ring-1 ring-white/5 transition focus:ring-brand-500/40"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">{topbar}</div>
        </header>

        {/* mobile icon rail */}
        <div className="flex gap-1 overflow-x-auto border-b border-white/5 bg-ink-950/60 px-3 py-2 lg:hidden">
          {nav.map((n) => {
            const Icon = n.icon;
            const on = n.id === active;
            return (
              <button
                key={n.id}
                onClick={() => onNav(n.id)}
                className={cn('flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-colors', on ? 'bg-white/[0.06] text-ink-50' : 'text-ink-400')}
              >
                <Icon className="h-3.5 w-3.5" />
                {n.label}
              </button>
            );
          })}
        </div>

        <main className="min-w-0 flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

export function TopBar({ dateLabel, onDate, notif = 3, initials = 'MK', color = 'azure' }: { dateLabel: string; onDate?: () => void; notif?: number; initials?: string; color?: keyof typeof avatarColors | string }) {
  return (
    <>
      <button onClick={onDate} className="focus-ring hidden h-9 items-center gap-2 rounded-lg bg-ink-900 px-3 text-sm text-ink-300 ring-1 ring-white/5 transition hover:bg-ink-850 hover:text-ink-50 active:scale-95 sm:flex">
        <span className="text-ink-500">Range</span>
        <span className="font-medium text-ink-100">{dateLabel}</span>
      </button>
      <button className="focus-ring relative flex h-9 w-9 items-center justify-center rounded-lg text-ink-300 ring-1 ring-white/5 transition hover:bg-ink-900 hover:text-ink-50 active:scale-90">
        <Bell className="h-4 w-4" />
        {notif > 0 && (
          <>
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 animate-pulse-ring rounded-full bg-rose-500/70" />
          </>
        )}
      </button>
      <Avatar initials={initials} color={color} />
    </>
  );
}

export function Delta({ value, className }: { value: number; className?: string }) {
  const up = value >= 0;
  return (
    <span className={cn('inline-flex items-center gap-0.5 text-xs font-medium', up ? 'text-emerald-400' : 'text-rose-400', className)}>
      {up ? '▲' : '▼'} {Math.abs(value).toFixed(1)}%
    </span>
  );
}

export function Badge({ tone = 'neutral', children, className }: { tone?: 'neutral' | 'success' | 'warning' | 'error' | 'brand' | 'sky'; children: ReactNode; className?: string }) {
  const tones: Record<string, string> = {
    neutral: 'bg-white/5 text-ink-300 ring-white/10',
    success: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/30',
    warning: 'bg-amber-500/10 text-amber-300 ring-amber-500/30',
    error: 'bg-rose-500/10 text-rose-300 ring-rose-500/30',
    brand: 'bg-brand-500/10 text-brand-300 ring-brand-500/30',
    sky: 'bg-sky-500/10 text-sky-300 ring-sky-500/30',
  };
  return <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1', tones[tone], className)}>{children}</span>;
}

export function Card({ className, children, style, delay }: { className?: string; children: ReactNode; style?: React.CSSProperties; delay?: number }) {
  return (
    <div className={cn('surface animate-fade-up p-5', className)} style={{ animationDelay: delay != null ? `${delay}ms` : undefined, ...style }}>
      {children}
    </div>
  );
}

export function ProgressBar({ value, color = '#3396ff', className }: { value: number; color?: string; className?: string }) {
  const [w, setW] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => requestAnimationFrame(() => setW(true)));
    return () => cancelAnimationFrame(t);
  }, [value]);
  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-white/5', className)}>
      <div className="h-full rounded-full transition-[width] duration-700 ease-smooth" style={{ width: w ? `${value}%` : 0, background: color }} />
    </div>
  );
}

export function SectionTitle({ title, action, sub }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        <h3 className="text-sm font-semibold text-ink-50">{title}</h3>
        {sub && <p className="text-xs text-ink-500">{sub}</p>}
      </div>
      {action}
    </div>
  );
}
