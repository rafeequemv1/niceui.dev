import { type ReactNode, useState } from 'react';
import { Check, Copy, Layers } from 'lucide-react';
import { cn } from '@/lib/cn';

export function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mx-auto w-full max-w-7xl px-6 lg:px-8', className)}>{children}</div>;
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span className="relative grid h-7 w-7 place-items-center rounded-md border border-teal-300/30 bg-teal-300/10">
        <Layers className="h-4 w-4 text-teal-200" strokeWidth={1.75} />
        <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-amber-300" />
      </span>
      <span className="font-serif text-2xl leading-none tracking-tight text-white">Corpus</span>
    </span>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-teal-200/90', className)}>
      <span className="h-px w-6 bg-teal-300/50" />
      {children}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  sub,
  align = 'left',
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  sub?: ReactNode;
  align?: 'left' | 'center';
  className?: string;
}) {
  return (
    <div className={cn('max-w-3xl', align === 'center' && 'mx-auto text-center', className)}>
      <Eyebrow className={align === 'center' ? 'justify-center' : undefined}>{eyebrow}</Eyebrow>
      <h2 className="mt-5 font-serif text-4xl leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">{title}</h2>
      {sub && <p className="mt-5 text-base leading-relaxed text-zinc-400 sm:text-lg">{sub}</p>}
    </div>
  );
}

type BtnProps = { children: ReactNode; onClick?: () => void; className?: string; variant?: 'primary' | 'ghost' | 'outline'; type?: 'button' | 'submit'; disabled?: boolean };

export function Button({ children, onClick, className, variant = 'primary', type = 'button', disabled }: BtnProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'group inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 ease-smooth focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300/60 disabled:cursor-not-allowed disabled:opacity-60',
        variant === 'primary' && 'bg-teal-200 text-[#04110e] shadow-[0_0_0_1px_rgba(94,234,212,0.4),0_8px_32px_-8px_rgba(94,234,212,0.55)] hover:bg-teal-100 hover:shadow-[0_0_0_1px_rgba(94,234,212,0.6),0_12px_40px_-8px_rgba(94,234,212,0.7)] active:scale-[0.98]',
        variant === 'outline' && 'border border-white/15 bg-white/[0.03] text-zinc-100 hover:border-white/30 hover:bg-white/[0.07] active:scale-[0.98]',
        variant === 'ghost' && 'text-zinc-300 hover:bg-white/5 hover:text-white',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Chip({ children, tone = 'neutral', className }: { children: ReactNode; tone?: 'neutral' | 'teal' | 'amber'; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10.5px] uppercase tracking-wider',
        tone === 'neutral' && 'border-white/10 bg-white/[0.03] text-zinc-300',
        tone === 'teal' && 'border-teal-300/25 bg-teal-300/10 text-teal-200',
        tone === 'amber' && 'border-amber-300/25 bg-amber-300/10 text-amber-200',
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-white/[0.01] shadow-[0_24px_64px_-24px_rgba(0,0,0,0.8)]', className)}>
      {children}
    </div>
  );
}

export function WindowBar({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2.5">
      <div className="flex items-center gap-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
        </div>
        <span className="font-mono text-[11px] text-zinc-400">{title}</span>
      </div>
      {right}
    </div>
  );
}

export function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    void navigator.clipboard?.writeText(text).catch(() => undefined);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };
  return (
    <button
      type="button"
      onClick={copy}
      aria-label="Copy code"
      className={cn('inline-flex items-center gap-1.5 rounded-md border border-white/10 px-2 py-1 font-mono text-[11px] text-zinc-300 transition hover:border-white/25 hover:text-white', className)}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-teal-300" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

export function Grain() {
  return <div aria-hidden className="dither-noise pointer-events-none absolute inset-0 opacity-60" />;
}

export function formatCompact(n: number, digits = 1) {
  if (n >= 1e12) return `${(n / 1e12).toFixed(digits)}T`;
  if (n >= 1e9) return `${(n / 1e9).toFixed(digits)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(digits)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(digits)}K`;
  return n.toFixed(0);
}
