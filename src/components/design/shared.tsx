import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** A light surface for demos, since the doc stage itself is dark. */
export function LightFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('w-full rounded-2xl bg-[#fafafa] p-4 font-sans text-[13px] text-zinc-800 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_30px_60px_-30px_rgba(0,0,0,0.5)] ring-1 ring-zinc-200 sm:p-6', className)}>
      {children}
    </div>
  );
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]', className)}>{children}</div>;
}

export function SectionHead({ title, meta }: { title: string; meta?: string }) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h4 className="text-[13px] font-semibold text-zinc-900">{title}</h4>
      {meta && <span className="truncate text-[12px] text-zinc-500">{meta}</span>}
    </div>
  );
}

export const focusRing = 'outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20 focus-visible:ring-offset-1';
