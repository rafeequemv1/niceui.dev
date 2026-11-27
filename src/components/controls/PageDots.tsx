import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { cn } from '@/lib/cn';

export type PageDotsProps = {
  count: number;
  index: number;
  onChange: (index: number) => void;
  /** pill: the active dot stretches into a pill. progress: the pill fills over `duration`. numbered: dots carry page numbers. */
  variant?: 'pill' | 'progress' | 'numbered';
  /** Autoplay length per page in ms (progress variant). */
  duration?: number;
  /** Pause the progress fill. */
  paused?: boolean;
  label?: string;
  className?: string;
};

/**
 * Pagination dots / page indicator dots with a morphing active pill.
 * Arrow keys, Home and End move between pages; every dot is clickable.
 */
export function PageDots({ count, index, onChange, variant = 'pill', duration = 4000, paused, label = 'Pages', className }: PageDotsProps) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const [focusMoved, setFocusMoved] = useState(false);

  // autoplay for the progress variant
  useEffect(() => {
    if (variant !== 'progress' || paused) return;
    const id = window.setTimeout(() => onChange((index + 1) % count), duration);
    return () => window.clearTimeout(id);
  }, [variant, paused, index, count, duration, onChange]);

  useEffect(() => {
    if (focusMoved) refs.current[index]?.focus();
  }, [index, focusMoved]);

  const onKey = (e: KeyboardEvent) => {
    const map: Record<string, number> = { ArrowRight: index + 1, ArrowDown: index + 1, ArrowLeft: index - 1, ArrowUp: index - 1, Home: 0, End: count - 1 };
    if (!(e.key in map)) return;
    e.preventDefault();
    setFocusMoved(true);
    onChange((map[e.key] + count) % count);
  };

  const big = variant === 'numbered';
  return (
    <div role="tablist" aria-label={label} onKeyDown={onKey} className={cn('inline-flex items-center gap-1.5 rounded-full bg-ink-900/80 p-1.5 shadow-hairline backdrop-blur', className)}>
      <style>{`@keyframes pd-fill{from{transform:scaleX(0)}to{transform:scaleX(1)}}@media (prefers-reduced-motion:reduce){.pd-dot{transition:none!important}.pd-fill{animation:none!important;transform:scaleX(1)}}`}</style>
      {Array.from({ length: count }, (_, i) => {
        const on = i === index;
        return (
          <button
            key={i}
            ref={(el) => (refs.current[i] = el)}
            role="tab"
            aria-selected={on}
            aria-label={`Page ${i + 1} of ${count}`}
            tabIndex={on ? 0 : -1}
            onClick={() => onChange(i)}
            onBlur={() => setFocusMoved(false)}
            className="group grid h-6 place-items-center rounded-full px-0.5 outline-none focus-visible:ring-2 focus-visible:ring-brand-400/70"
          >
            <span
              className={cn(
                'pd-dot relative block overflow-hidden rounded-full transition-all duration-500 ease-spring',
                big ? 'h-5 text-[10px] font-medium leading-5' : 'h-2',
                on ? (big ? 'w-9 bg-brand-400 text-ink-950' : variant === 'progress' ? 'w-8 bg-white/15' : 'w-6 bg-brand-400') : cn(big ? 'w-5 bg-white/10 text-ink-400 group-hover:bg-white/20 group-hover:text-ink-100' : 'w-2 bg-white/25 group-hover:bg-white/50'),
              )}
            >
              {variant === 'progress' && on && (
                <span key={`${index}-${paused}`} className="pd-fill absolute inset-0 origin-left rounded-full bg-brand-400" style={{ animation: paused ? 'none' : `pd-fill ${duration}ms linear both`, transform: paused ? 'scaleX(0.5)' : undefined }} />
              )}
              {big && <span className="relative">{i + 1}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}

const SLIDES = [
  { title: 'Plan the week', body: 'Drag tasks into the days that suit them.', tone: 'from-sky-500/30 to-indigo-500/10' },
  { title: 'Focus blocks', body: 'Quiet hours that protect deep work.', tone: 'from-emerald-500/25 to-sky-500/10' },
  { title: 'Gentle nudges', body: 'Reminders that arrive when they help.', tone: 'from-fuchsia-500/25 to-sky-500/10' },
  { title: 'Weekly review', body: 'See what moved and what to drop.', tone: 'from-amber-500/25 to-sky-500/10' },
  { title: 'Share with the team', body: 'One link, everyone in sync.', tone: 'from-sky-400/30 to-cyan-500/10' },
];

export function PageDotsDemo() {
  const [a, setA] = useState(0);
  const [b, setB] = useState(1);
  const [c, setC] = useState(2);
  const [paused, setPaused] = useState(false);
  const s = SLIDES[b];
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-8">
      <div className="w-full">
        <div className={cn('relative h-36 overflow-hidden rounded-2xl border border-white/[.07] bg-gradient-to-br p-5 transition-colors duration-500', s.tone)}>
          <p key={b} className="animate-fade-up text-lg font-medium text-ink-50">{s.title}</p>
          <p key={`b${b}`} className="mt-1 animate-fade-up text-sm text-ink-300">{s.body}</p>
          <span className="absolute bottom-4 right-5 font-mono text-[11px] text-ink-400">0{b + 1} / 0{SLIDES.length}</span>
        </div>
        <div className="mt-4 flex items-center justify-center gap-3">
          <PageDots variant="progress" count={SLIDES.length} index={b} onChange={setB} paused={paused} label="Onboarding slides" />
          <button onClick={() => setPaused((p) => !p)} aria-label={paused ? 'Play' : 'Pause'} className="focus-ring grid h-9 w-9 place-items-center rounded-full bg-ink-900 text-ink-300 shadow-hairline hover:text-ink-50">
            {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={() => setA((a + 5) % 6)} aria-label="Previous" className="focus-ring grid h-8 w-8 place-items-center rounded-full text-ink-400 hover:text-ink-50">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <PageDots count={6} index={a} onChange={setA} label="Gallery pages" />
        <button onClick={() => setA((a + 1) % 6)} aria-label="Next" className="focus-ring grid h-8 w-8 place-items-center rounded-full text-ink-400 hover:text-ink-50">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <PageDots variant="numbered" count={5} index={c} onChange={setC} label="Result pages" />
    </div>
  );
}
