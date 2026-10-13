import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Reveal } from '@/pages/landing/shared/motion';

export const selectionBlue = '#0d99ff';

export function scrollToSection(id: string) {
  document.getElementById(`lattice-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'dark' | 'light' | 'blue' | 'ghost' };

export function LButton({ variant = 'dark', className, children, ...rest }: BtnProps) {
  return (
    <button
      {...rest}
      className={cn(
        'inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-medium transition-all duration-200 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d99ff]/50 focus-visible:ring-offset-2',
        variant === 'dark' && 'bg-zinc-950 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_1px_2px_rgba(0,0,0,0.2)] hover:bg-zinc-800',
        variant === 'light' && 'bg-white text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-50 hover:ring-zinc-300',
        variant === 'blue' && 'bg-[#0d99ff] text-white hover:bg-[#0b87e0]',
        variant === 'ghost' && 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function SelectionBox({ children, label, color = selectionBlue, className }: { children: ReactNode; label?: string; color?: string; className?: string }) {
  return (
    <span className={cn('relative inline-block px-2', className)}>
      <span className="pointer-events-none absolute inset-0 border-[1.5px]" style={{ borderColor: color, background: `${color}10` }}>
        {['-left-[5px] -top-[5px]', '-right-[5px] -top-[5px]', '-left-[5px] -bottom-[5px]', '-right-[5px] -bottom-[5px]'].map((p) => (
          <span key={p} className={cn('absolute h-2 w-2 border-[1.5px] bg-white', p)} style={{ borderColor: color }} />
        ))}
      </span>
      {label && (
        <span className="absolute -top-7 left-0 rounded px-1.5 py-0.5 font-mono text-[10px] font-medium tracking-normal text-white" style={{ background: color }}>{label}</span>
      )}
      <span className="relative">{children}</span>
    </span>
  );
}

export function SectionHead({ tag, color, title, body, center }: { tag: string; color: string; title: ReactNode; body?: string; center?: boolean }) {
  return (
    <Reveal className={cn('max-w-3xl', center && 'mx-auto text-center')}>
      <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-zinc-600">
        <span className="h-2 w-2 rounded-[2px]" style={{ background: color }} />
        {tag}
      </span>
      <h2 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-[-0.035em] text-zinc-950 md:text-6xl">{title}</h2>
      {body && <p className={cn('mt-5 max-w-xl text-lg leading-relaxed text-zinc-600', center && 'mx-auto')}>{body}</p>}
    </Reveal>
  );
}
