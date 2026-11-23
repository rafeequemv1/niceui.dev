import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Reveal } from '@/pages/landing/shared/motion';

/** Palette: warm near-black, bone white, stone grey, one sage accent. */
export const Q = {
  bg: '#0e0e0d',
  panel: '#151514',
  line: 'rgba(255,255,255,0.07)',
  bone: '#f2efe9',
  stone: '#8b8880',
  sage: '#c8d5b9',
};

export function QuarryMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden>
      <path d="M4 19.5 10.5 14l6 4.5-6 5z" fill="currentColor" opacity=".45" />
      <path d="M11 12.5 17.5 7l6.5 5-6.5 5.2z" fill="currentColor" opacity=".75" />
      <path d="M12.5 21.2 18.5 16.6l5.5 4.2-6 4.7z" fill="currentColor" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <span className="flex items-center gap-2 text-[#f2efe9]">
      <QuarryMark className="h-7 w-7" />
      <span className="text-[19px] font-medium tracking-[-0.03em]">quarry</span>
    </span>
  );
}

/** Small mono label in a hairline box. */
export function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2 rounded-md border border-white/[.07] bg-white/[.025] px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-[#8b8880]', className)}>
      {children}
    </span>
  );
}

/** Two-tone heading: the first line bone, the second stone. */
export function Heading({ tag, a, b, body, center, className }: { tag?: string; a: ReactNode; b?: ReactNode; body?: ReactNode; center?: boolean; className?: string }) {
  return (
    <Reveal className={cn(center && 'text-center', className)}>
      {tag && <Tag>{tag}</Tag>}
      <h2 className={cn('text-[34px] font-medium leading-[1.08] tracking-[-0.035em] md:text-[48px]', tag && 'mt-5')}>
        <span className="text-[#f2efe9]">{a}</span>
        {b && (
          <>
            <br />
            <span className="text-[#8b8880]">{b}</span>
          </>
        )}
      </h2>
      {body && <p className={cn('mt-5 max-w-lg text-[15px] leading-relaxed text-[#8b8880]', center && 'mx-auto')}>{body}</p>}
    </Reveal>
  );
}

export function QButton({ children, variant = 'light', className, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: 'light' | 'dark' | 'ghost' }) {
  return (
    <a
      href="#"
      {...rest}
      className={cn(
        'group inline-flex h-12 items-center justify-center gap-2 rounded-xl px-6 text-[15px] font-medium transition-all duration-200 active:scale-[.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c8d5b9]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0e0e0d]',
        variant === 'light' && 'bg-[#f2efe9] text-[#141413] hover:bg-white',
        variant === 'dark' && 'bg-[#141413] text-[#f2efe9] hover:bg-black',
        variant === 'ghost' && 'text-[#f2efe9] hover:bg-white/[.05]',
        className,
      )}
    >
      {children}
    </a>
  );
}
