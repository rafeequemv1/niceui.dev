import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/cn';
import { TODAY, type Company, type Member } from './data';

/* Theme: every colour is a CSS variable so light and dark share one set of classes. */
export const THEMES: Record<'light' | 'dark', CSSProperties> = {
  light: {
    '--bg': '#ffffff',
    '--side': '#fafafa',
    '--sub': '#f4f4f5',
    '--hover': 'rgba(0,0,0,0.045)',
    '--line': '#ebebeb',
    '--line2': '#dcdcdc',
    '--fg': '#3a3a3a',
    '--strong': '#141414',
    '--mute': '#828282',
    '--faint': '#b4b4b4',
    '--accent': '#3e63dd',
    '--accent-soft': 'rgba(62,99,221,0.1)',
    '--panel': '#ffffff',
    '--pop': '0 12px 32px -8px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)',
  } as CSSProperties,
  dark: {
    '--bg': '#151515',
    '--side': '#111111',
    '--sub': '#1d1d1d',
    '--hover': 'rgba(255,255,255,0.06)',
    '--line': '#262626',
    '--line2': '#333333',
    '--fg': '#d0d0d0',
    '--strong': '#f5f5f5',
    '--mute': '#8b8b8b',
    '--faint': '#575757',
    '--accent': '#7c95ff',
    '--accent-soft': 'rgba(124,149,255,0.15)',
    '--panel': '#191919',
    '--pop': '0 16px 40px -8px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.07)',
  } as CSSProperties,
};

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('') || '?';

const PALETTE = ['#3e63dd', '#12a594', '#d6409f', '#c77d00', '#8e4ec6', '#2b9a66', '#dc3e42', '#0d9b8a'];
export const colorFor = (s: string) => PALETTE[[...s].reduce((a, ch) => a + ch.charCodeAt(0), 0) % PALETTE.length];

export function Avatar({ name, color, size = 18, className }: { name: string; color?: string; size?: number; className?: string }) {
  return (
    <span
      className={cn('inline-grid shrink-0 place-items-center rounded-full font-medium text-white', className)}
      style={{ width: size, height: size, fontSize: Math.max(8, size * 0.42), background: color ?? colorFor(name) }}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}

export function Logo({ company, size = 18 }: { company: Pick<Company, 'name' | 'color'>; size?: number }) {
  return (
    <span className="inline-grid shrink-0 place-items-center rounded-[5px] font-semibold text-white" style={{ width: size, height: size, fontSize: size * 0.5, background: company.color }} aria-hidden>
      {company.name[0]}
    </span>
  );
}

export function MemberChip({ member, size = 16 }: { member: Member; size?: number }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      <Avatar name={member.name} color={member.color} size={size} />
      <span className="truncate">{member.name}</span>
    </span>
  );
}

export const TONE: Record<string, string> = {
  Lead: '', MQL: '#b5730a', SQL: '#8e4ec6', Customer: '#2b9a66', Churned: '#dc3e42',
  New: '', Screening: '#8e4ec6', Meeting: '#b5730a', Proposal: '#3e63dd',
  SaaS: '#3e63dd', Fintech: '#2b9a66', Health: '#cf3897', Logistics: '#b5730a', Energy: '#0d9b8a', Retail: '#dc3e42', Robotics: '#8e4ec6', Media: '#c77d00',
};

export function Pill({ value, className }: { value: string; className?: string }) {
  const c = TONE[value];
  return (
    <span
      className={cn('inline-flex h-[20px] max-w-full items-center truncate rounded-[4px] px-1.5 text-[12px] font-medium', !c && 'bg-[var(--hover)] text-[var(--fg)]', className)}
      style={c ? { color: c, background: `${c}1f` } : undefined}
    >
      {value}
    </span>
  );
}

export function Stars({ value, onChange, size = 13 }: { value: number; onChange?: (v: number) => void; size?: number }) {
  return (
    <span className="inline-flex items-center gap-[2px]" role={onChange ? 'radiogroup' : undefined} aria-label={`Rating ${value} of 5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const on = i <= value;
        const star = <Star className={cn(on ? 'fill-[#e8a400] text-[#e8a400]' : 'text-[var(--faint)]')} style={{ width: size, height: size }} />;
        return onChange ? (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={i === value}
            aria-label={`${i} star${i > 1 ? 's' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onChange(i === value ? i - 1 : i);
            }}
            className="rounded-sm transition-transform hover:scale-110"
          >
            {star}
          </button>
        ) : (
          <span key={i}>{star}</span>
        );
      })}
    </span>
  );
}

export const money = (n: number, full = false) => {
  if (full) return '$' + n.toLocaleString('en-US');
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return '$' + (n / 1_000).toFixed(n >= 100_000 ? 0 : 1).replace(/\.0$/, '') + 'k';
  return '$' + n;
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const fmtDate = (iso: string) => {
  const d = new Date(iso + 'T12:00:00');
  if (Number.isNaN(d.getTime())) return iso;
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};
export const daysFromToday = (iso: string) => Math.round((new Date(iso + 'T12:00:00').getTime() - new Date(TODAY.toISOString().slice(0, 10) + 'T12:00:00').getTime()) / 86_400_000);
export const relDay = (iso: string) => {
  const d = daysFromToday(iso);
  if (d === 0) return 'Today';
  if (d === 1) return 'Tomorrow';
  if (d === -1) return 'Yesterday';
  if (d < 0 && d > -7) return `${-d} days ago`;
  if (d > 0 && d < 7) return `In ${d} days`;
  return fmtDate(iso);
};

/** Popover menu anchored to its parent (parent must be `relative`). Closes on outside click and Escape. */
export function Menu({ open, onClose, children, align = 'left', className }: { open: boolean; onClose: () => void; children: ReactNode; align?: 'left' | 'right'; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const key = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    const id = window.setTimeout(() => document.addEventListener('pointerdown', down), 0);
    document.addEventListener('keydown', key);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener('pointerdown', down);
      document.removeEventListener('keydown', key);
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      ref={ref}
      role="menu"
      className={cn('absolute top-[calc(100%+4px)] z-40 min-w-[200px] rounded-lg border border-[var(--line)] bg-[var(--panel)] p-1 text-[13px] text-[var(--fg)] animate-scale-in', align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left', className)}
      style={{ boxShadow: 'var(--pop)' }}
    >
      {children}
    </div>
  );
}

export function MenuItem({ children, onClick, active, danger, icon: Icon, hint }: { children: ReactNode; onClick?: () => void; active?: boolean; danger?: boolean; icon?: typeof Star; hint?: ReactNode }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn('flex h-8 w-full items-center gap-2 rounded-md px-2 text-left transition-colors hover:bg-[var(--hover)]', active && 'bg-[var(--hover)] text-[var(--strong)]', danger && 'text-[#dc3e42]')}
    >
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0 text-[var(--mute)]" />}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {hint && <span className="shrink-0 text-[11px] text-[var(--mute)]">{hint}</span>}
    </button>
  );
}

export const btn = 'inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-[13px] text-[var(--fg)] transition-colors hover:bg-[var(--hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]';
export const btnPrimary = 'inline-flex h-7 items-center gap-1.5 rounded-md bg-[var(--accent)] px-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]';
