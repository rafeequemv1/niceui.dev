import { useCallback, useMemo, useRef, useState } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

export type MasonryItem = { id: number; title: string; author: string; height: number; gradient: string; likes: number };

const GRADIENTS = [
  'from-brand-400 via-sky-500 to-teal-400',
  'from-amber-300 via-orange-400 to-rose-500',
  'from-emerald-300 via-teal-400 to-sky-500',
  'from-rose-400 via-pink-500 to-amber-300',
  'from-sky-300 via-brand-500 to-brand-800',
  'from-teal-300 via-emerald-500 to-ink-800',
  'from-amber-200 via-amber-400 to-emerald-500',
  'from-ink-300 via-ink-500 to-ink-800',
];
const TITLES = ['Aurora study', 'Low tide', 'Neon dusk', 'Glass forms', 'Quiet fields', 'Solar drift', 'Coastline', 'Monolith', 'Haze', 'Prism walk', 'After rain', 'Ember'];
const AUTHORS = ['Mira', 'Daniel', 'Sana', 'Leo', 'Ana', 'Kenji'];

export function makeItems(start: number, count: number): MasonryItem[] {
  return Array.from({ length: count }, (_, k) => {
    const id = start + k;
    const seed = (id * 9301 + 49297) % 233280;
    return {
      id,
      title: TITLES[id % TITLES.length],
      author: AUTHORS[(id * 7) % AUTHORS.length],
      height: 120 + (seed % 140),
      gradient: GRADIENTS[(id * 5) % GRADIENTS.length],
      likes: 20 + (seed % 900),
    };
  });
}

export type InfiniteMasonryProps = {
  columns?: number;
  pageSize?: number;
  maxItems?: number;
  threshold?: number;
  height?: number;
};

export function InfiniteMasonry({ columns = 3, pageSize = 9, maxItems = 54, threshold = 160, height = 440 }: InfiniteMasonryProps) {
  const [items, setItems] = useState(() => makeItems(0, pageSize * 2));
  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState<Set<number>>(new Set());
  const loadingRef = useRef(false);
  const done = items.length >= maxItems;

  const loadMore = useCallback(() => {
    if (loadingRef.current || done) return;
    loadingRef.current = true;
    setLoading(true);
    window.setTimeout(() => {
      setItems((xs) => [...xs, ...makeItems(xs.length, pageSize)]);
      setLoading(false);
      loadingRef.current = false;
    }, 1100);
  }, [done, pageSize]);

  const cols = useMemo(() => {
    const out: Array<Array<MasonryItem | { skeleton: number; height: number }>> = Array.from({ length: columns }, () => []);
    const heights = new Array(columns).fill(0);
    const place = (it: MasonryItem | { skeleton: number; height: number }) => {
      const c = heights.indexOf(Math.min(...heights));
      out[c].push(it);
      heights[c] += it.height;
    };
    items.forEach(place);
    if (loading) Array.from({ length: columns * 2 }, (_, i) => place({ skeleton: i, height: 130 + (i % 3) * 40 }));
    return out;
  }, [items, loading, columns]);

  return (
    <div
      onScroll={(e) => {
        const el = e.currentTarget;
        if (el.scrollHeight - el.scrollTop - el.clientHeight < threshold) loadMore();
      }}
      className="relative w-full overflow-y-auto rounded-2xl bg-ink-950/60 p-3 shadow-card"
      style={{ height }}
    >
      <div className="flex gap-3">
        {cols.map((col, ci) => (
          <div key={ci} className="flex min-w-0 flex-1 flex-col gap-3">
            {col.map((it) =>
              'skeleton' in it ? (
                <div key={`s${it.skeleton}`} className="relative overflow-hidden rounded-xl bg-ink-850 shadow-hairline" style={{ height: it.height }}>
                  <div className="absolute inset-0 animate-pulse bg-white/[0.03]" />
                  <div className="absolute bottom-3 left-3 space-y-1.5">
                    <div className="h-2.5 w-20 rounded-full bg-white/[0.06]" />
                    <div className="h-2 w-12 rounded-full bg-white/[0.04]" />
                  </div>
                </div>
              ) : (
                <article
                  key={it.id}
                  className={cn('group relative animate-fade-up overflow-hidden rounded-xl bg-gradient-to-br shadow-card', it.gradient)}
                  style={{ height: it.height, animationDelay: `${(it.id % pageSize) * 40}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-ink-950/0 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="absolute inset-0 scale-110 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_55%)] transition-transform duration-700 ease-smooth group-hover:scale-100" />
                  <button
                    aria-label="Like"
                    onClick={() => setLiked((s) => { const n = new Set(s); n.has(it.id) ? n.delete(it.id) : n.add(it.id); return n; })}
                    className="absolute right-2 top-2 flex h-7 w-7 translate-y-1 items-center justify-center rounded-full bg-ink-950/50 text-white opacity-0 backdrop-blur transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 active:scale-90"
                  >
                    <Heart className={cn('h-3.5 w-3.5 transition-colors', liked.has(it.id) && 'fill-rose-400 text-rose-400')} />
                  </button>
                  <div className="absolute inset-x-3 bottom-2.5 text-white">
                    <p className="truncate text-sm font-medium">{it.title}</p>
                    <p className="text-[11px] text-white/70">@{it.author.toLowerCase()} · {it.likes + (liked.has(it.id) ? 1 : 0)} likes</p>
                  </div>
                </article>
              ),
            )}
          </div>
        ))}
      </div>
      <div className="flex h-14 items-center justify-center text-xs text-ink-500">
        {loading ? (
          <span className="flex items-center gap-2"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading more</span>
        ) : done ? (
          'You’ve reached the end ✦'
        ) : (
          'Scroll for more'
        )}
      </div>
    </div>
  );
}

export function InfiniteMasonryDemo() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <InfiniteMasonry />
    </div>
  );
}
