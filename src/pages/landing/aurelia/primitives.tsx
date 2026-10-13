import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function Eyebrow({ children, tone = 'dark' }: { children: ReactNode; tone?: 'dark' | 'light' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em]',
        tone === 'dark' ? 'text-stone-500' : 'text-stone-400',
      )}
    >
      <span className="h-px w-6 bg-current" />
      {children}
    </span>
  );
}

type PillProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'ink' | 'paper' | 'clay' };

export function Pill({ variant = 'ink', className, children, ...rest }: PillProps) {
  return (
    <button
      {...rest}
      className={cn(
        'group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-full px-6 text-sm font-medium transition-all duration-300 ease-smooth active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f1ea]',
        variant === 'ink' && 'bg-stone-900 text-[#f5f1ea] hover:bg-stone-800',
        variant === 'paper' && 'bg-white/70 text-stone-900 ring-1 ring-stone-900/10 backdrop-blur hover:bg-white',
        variant === 'clay' && 'bg-orange-700 text-white hover:bg-orange-600',
        className,
      )}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
    </button>
  );
}

export const paperGrain = {
  backgroundImage: 'radial-gradient(rgba(41,37,36,0.06) 0.6px, transparent 0.6px)',
  backgroundSize: '5px 5px',
};

export function scrollToId(id: string) {
  document.getElementById(`aurelia-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
