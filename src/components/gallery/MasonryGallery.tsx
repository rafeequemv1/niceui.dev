import { useMemo, useState } from 'react';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/cn';
import { ARTWORKS, artwork, type Artwork } from './art';

const RATIOS = [4 / 5, 3 / 2, 1, 2 / 3, 4 / 3, 3 / 4];
const TONES: { id: 'all' | Artwork['tone']; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'warm', label: 'Warm' },
  { id: 'cool', label: 'Cool' },
  { id: 'dusk', label: 'Dusk' },
  { id: 'mono', label: 'Mono' },
];

export type MasonryGalleryProps = { items?: Artwork[]; columns?: number; className?: string };

/** CSS-column masonry with mixed ratios, tone filters and staggered reveals. */
export function MasonryGallery({ items = ARTWORKS, className }: MasonryGalleryProps) {
  const [tone, setTone] = useState<(typeof TONES)[number]['id']>('all');
  const shown = useMemo(() => items.filter((a) => tone === 'all' || a.tone === tone), [items, tone]);

  return (
    <div className={cn('w-full', className)}>
      <div className="mb-4 flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Filter by tone">
        {TONES.map((t) => {
          const n = t.id === 'all' ? items.length : items.filter((a) => a.tone === t.id).length;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={tone === t.id}
              onClick={() => setTone(t.id)}
              className={cn(
                'focus-ring flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                tone === t.id ? 'bg-ink-50 text-ink-950' : 'bg-white/5 text-ink-400 hover:bg-white/10 hover:text-ink-100',
              )}
            >
              {t.label}
              <span className={cn('font-mono text-[10px] tabular-nums', tone === t.id ? 'text-ink-500' : 'text-ink-600')}>{n}</span>
            </button>
          );
        })}
      </div>
      <div key={tone} className="columns-2 gap-3 sm:columns-3 [&>*]:mb-3">
        {shown.map((a, i) => {
          const r = RATIOS[a.id % RATIOS.length];
          return (
            <figure
              key={a.id}
              tabIndex={0}
              className="group relative break-inside-avoid overflow-hidden rounded-xl bg-ink-900 shadow-card outline-none animate-fade-up focus-visible:ring-2 focus-visible:ring-brand-400/60"
              style={{ animationDelay: `${i * 55}ms` }}
            >
              <img
                src={artwork(a.id, 480, Math.round(480 / r))}
                alt={`${a.title} by ${a.artist}`}
                className="block w-full transition-transform duration-700 ease-smooth group-hover:scale-[1.04] group-focus-visible:scale-[1.04]"
                style={{ aspectRatio: String(r) }}
              />
              <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-3 pt-10 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                <p className="truncate text-[13px] font-medium text-white">{a.title}</p>
                <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-white/70">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {a.place} · {a.artist}
                </p>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </div>
  );
}

export function MasonryGalleryDemo() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <MasonryGallery />
    </div>
  );
}
