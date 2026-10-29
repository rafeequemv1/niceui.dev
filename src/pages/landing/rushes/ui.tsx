import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Reveal } from '@/pages/landing/shared/motion';

export function scrollToRushes(id: string) {
  document.getElementById(`rushes-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/** 24 fps timecode: HH:MM:SS:FF */
export function tc(t: number) {
  const f = Math.floor(t * 24);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(Math.floor(f / 86400))}:${p(Math.floor(f / 1440) % 60)}:${p(Math.floor(f / 24) % 60)}:${p(f % 24)}`;
}

export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden="true">
      <rect width="28" height="28" rx="8" fill="currentColor" />
      <path d="M10 7.5 21 14H10z" fill="#fff" />
      <path d="M8.6 14H19.6L8.6 20.5z" fill="#ff4f1f" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('flex items-center gap-2 text-zinc-950', className)}>
      <Mark className="h-7 w-7" />
      <span className="text-[19px] font-semibold tracking-[-0.04em]">rushes</span>
    </span>
  );
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'dark' | 'light' | 'ghost' | 'white' };

export function RButton({ variant = 'dark', className, children, ...rest }: BtnProps) {
  return (
    <button
      {...rest}
      className={cn(
        'inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium transition-all duration-200 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4f1f]/50 focus-visible:ring-offset-2',
        variant === 'dark' && 'bg-zinc-950 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_1px_2px_rgba(0,0,0,0.25),0_8px_20px_-8px_rgba(0,0,0,0.5)] hover:bg-zinc-800',
        variant === 'light' && 'bg-white text-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.06)] ring-1 ring-zinc-200 hover:bg-zinc-50 hover:ring-zinc-300',
        variant === 'ghost' && 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950',
        variant === 'white' && 'bg-white text-zinc-950 hover:bg-zinc-100',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500', className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-[#ff4f1f]" />
      {children}
    </span>
  );
}

export function SectionHead({ tag, title, body, center, className }: { tag: string; title: ReactNode; body?: ReactNode; center?: boolean; className?: string }) {
  return (
    <Reveal className={cn('max-w-3xl', center && 'mx-auto text-center', className)}>
      <Eyebrow>{tag}</Eyebrow>
      <h2 className="mt-5 text-[40px] font-semibold leading-[1.02] tracking-[-0.045em] text-zinc-950 md:text-[60px]">{title}</h2>
      {body && <p className={cn('mt-5 max-w-xl text-[17px] leading-relaxed text-zinc-600', center && 'mx-auto')}>{body}</p>}
    </Reveal>
  );
}

export function Serif({ children }: { children: ReactNode }) {
  return <em className="font-serif font-normal italic tracking-[-0.02em]">{children}</em>;
}

/** Viewfinder corner brackets. */
export function Corners({ className, size = 18 }: { className?: string; size?: number }) {
  const s = { width: size, height: size };
  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-0', className)}>
      <span className="absolute left-0 top-0 border-l border-t border-current" style={s} />
      <span className="absolute right-0 top-0 border-r border-t border-current" style={s} />
      <span className="absolute bottom-0 left-0 border-b border-l border-current" style={s} />
      <span className="absolute bottom-0 right-0 border-b border-r border-current" style={s} />
    </div>
  );
}
