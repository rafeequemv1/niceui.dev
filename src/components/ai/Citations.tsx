import { useRef, useState } from 'react';
import { BookOpen, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/cn';
import { usePresence } from '@/components/ui/motion/hooks';

export type Source = { id: number; title: string; site: string; snippet: string; date?: string };

export type CitationProps = { source: Source; active?: boolean; onHover?: (id: number | null) => void };

export function Citation({ source, active, onHover }: CitationProps) {
  const [open, setOpen] = useState(false);
  const timer = useRef<number>();
  const { mounted, visible } = usePresence(open, 150);

  const show = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(true), 120);
    onHover?.(source.id);
  };
  const hide = () => {
    window.clearTimeout(timer.current);
    setOpen(false);
    onHover?.(null);
  };

  return (
    <span className="relative inline-block align-baseline" onPointerEnter={show} onPointerLeave={hide} onFocus={show} onBlur={hide}>
      <button
        type="button"
        className={cn(
          'focus-ring mx-0.5 inline-flex h-[18px] min-w-[18px] -translate-y-px items-center justify-center rounded-md px-1 font-mono text-[10px] font-medium transition-all duration-200',
          active || open ? 'bg-brand-500 text-white' : 'bg-white/10 text-ink-300 hover:bg-white/15',
        )}
        aria-label={`Source ${source.id}: ${source.title}`}
      >
        {source.id}
      </button>
      {mounted && (
        <span
          className={cn(
            'absolute bottom-full left-1/2 z-30 mb-2 block w-72 -translate-x-1/2 origin-bottom rounded-xl bg-ink-850 p-3 text-left shadow-pop transition-all',
            visible ? 'scale-100 opacity-100 duration-300 ease-spring' : 'translate-y-1 scale-95 opacity-0 duration-150',
          )}
        >
          <span className="flex items-center gap-2 text-xs text-ink-400">
            <span className="flex h-4 w-4 items-center justify-center rounded bg-ink-50 text-[9px] font-semibold uppercase text-ink-950">{source.site[0]}</span>
            {source.site}
            {source.date && <span className="text-ink-600">· {source.date}</span>}
          </span>
          <span className="mt-1.5 block text-sm font-medium leading-snug text-ink-50">{source.title}</span>
          <span className="mt-1 line-clamp-3 block text-xs leading-relaxed text-ink-400">{source.snippet}</span>
        </span>
      )}
    </span>
  );
}

export function SourceList({ sources, active }: { sources: Source[]; active: number | null }) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {sources.map((s, i) => (
        <a
          key={s.id}
          href="#"
          onClick={(e) => e.preventDefault()}
          className={cn(
            'focus-ring group flex animate-fade-up flex-col gap-1.5 rounded-xl bg-ink-850 p-3 shadow-hairline transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:bg-ink-800',
            active === s.id && '-translate-y-0.5 bg-ink-800 shadow-glow',
          )}
          style={{ animationDelay: `${i * 70}ms` }}
        >
          <span className="flex items-center justify-between text-[11px] text-ink-500">
            <span className="flex items-center gap-1.5">
              <span className="flex h-4 w-4 items-center justify-center rounded bg-white/10 font-mono text-[9px] text-ink-200">{s.id}</span>
              {s.site}
            </span>
            <ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
          </span>
          <span className="line-clamp-2 text-xs leading-snug text-ink-200">{s.title}</span>
        </a>
      ))}
    </div>
  );
}

const SOURCES: Source[] = [
  { id: 1, site: 'nature.com', date: 'Mar 2024', title: 'Global ocean heat content reached a record high in 2023', snippet: 'The upper 2,000 m of the ocean absorbed roughly 15 zettajoules more heat than the previous year, the largest annual increase on record.' },
  { id: 2, site: 'noaa.gov', date: 'Jan 2024', title: 'Coral Reef Watch: fourth global bleaching event confirmed', snippet: 'Bleaching-level heat stress has been recorded across more than 54% of the world’s reef areas since February 2023.' },
  { id: 3, site: 'ipcc.ch', date: 'AR6', title: 'Ocean, Cryosphere and Sea Level Change', snippet: 'It is virtually certain that the global ocean has warmed unabated since 1970 and has taken up more than 90% of the excess heat.' },
];

export function CitationsDemo() {
  const [active, setActive] = useState<number | null>(null);
  const cite = (id: number) => <Citation source={SOURCES[id - 1]} active={active === id} onHover={setActive} />;

  return (
    <div className="mx-auto w-full max-w-xl pt-16">
      <div className="rounded-2xl bg-ink-900 p-5 shadow-card">
        <p className="text-sm leading-7 text-ink-300">
          Oceans absorbed a record amount of heat in 2023 — about 15 zettajoules more than the year before{cite(1)}. That warmth has pushed reefs into the
          fourth global bleaching event, affecting more than half of all reef areas{cite(2)}. Since 1970 the ocean has taken up over 90% of the excess heat
          trapped by greenhouse gases{cite(3)}, which is why marine heatwaves are becoming longer and more frequent{cite(1)}{cite(3)}.
        </p>
        <div className="mt-5 flex items-center gap-1.5 text-xs font-medium text-ink-400">
          <BookOpen className="h-3.5 w-3.5" /> Sources
        </div>
        <div className="mt-2">
          <SourceList sources={SOURCES} active={active} />
        </div>
      </div>
    </div>
  );
}
