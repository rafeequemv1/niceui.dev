import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, FileText, Folder, Search, User, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useClickOutside, useEscape, usePresence } from '@/components/ui/motion/hooks';

export type SearchItem = { id: string; label: string; meta: string; kind: 'doc' | 'project' | 'person' };

const ICONS = { doc: FileText, project: Folder, person: User };

const ITEMS: SearchItem[] = [
  { id: '1', label: 'Q3 Roadmap', meta: 'Doc · edited 2h ago', kind: 'doc' },
  { id: '2', label: 'Design System', meta: 'Project · 24 files', kind: 'project' },
  { id: '3', label: 'Mira Chen', meta: 'Product Designer', kind: 'person' },
  { id: '4', label: 'Pricing experiments', meta: 'Doc · edited yesterday', kind: 'doc' },
  { id: '5', label: 'Marketing site', meta: 'Project · 112 files', kind: 'project' },
  { id: '6', label: 'Daniel Okafor', meta: 'Staff Engineer', kind: 'person' },
  { id: '7', label: 'Launch checklist', meta: 'Doc · edited 3d ago', kind: 'doc' },
];

export type MorphingSearchProps = {
  items?: SearchItem[];
  width?: number;
  placeholder?: string;
  onSelect?: (item: SearchItem) => void;
};

export function MorphingSearch({ items = ITEMS, width = 340, placeholder = 'Search docs, projects, people…', onSelect }: MorphingSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (q ? items.filter((i) => i.label.toLowerCase().includes(q) || i.meta.toLowerCase().includes(q)) : items).slice(0, 5);
  }, [items, query]);
  const showResults = open;
  const { mounted, visible } = usePresence(showResults, 200);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
  }, []);
  useEscape(open, close);
  useClickOutside([root], open, close);

  useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => input.current?.focus(), 120);
      return () => window.clearTimeout(t);
    }
  }, [open]);
  useEffect(() => setActive(0), [query]);

  const choose = (item: SearchItem) => {
    onSelect?.(item);
    close();
  };

  return (
    <div ref={root} className="relative" style={{ width: open ? width : 44, transition: 'width 520ms cubic-bezier(0.34,1.36,0.64,1)' }}>
      <div
        className={cn(
          'flex h-11 items-center overflow-hidden rounded-full bg-ink-850 shadow-hairline transition-shadow duration-300',
          open && 'shadow-glow',
        )}
      >
        <button
          aria-label="Open search"
          onClick={() => setOpen(true)}
          className="focus-ring flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-300 transition-colors hover:text-ink-50 active:scale-95"
        >
          <Search className="h-4 w-4" />
        </button>
        <input
          ref={input}
          value={query}
          tabIndex={open ? 0 : -1}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(results.length - 1, a + 1)); }
            if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
            if (e.key === 'Enter' && results[active]) choose(results[active]);
          }}
          placeholder={placeholder}
          className={cn(
            'min-w-0 flex-1 bg-transparent text-sm text-ink-50 placeholder:text-ink-500 outline-none transition-opacity duration-300',
            open ? 'opacity-100 delay-150' : 'pointer-events-none opacity-0',
          )}
        />
        <button
          aria-label="Close search"
          onClick={close}
          className={cn(
            'focus-ring mr-1.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-400 transition-all duration-300 hover:bg-white/5 hover:text-ink-100',
            open ? 'scale-100 opacity-100 delay-200' : 'pointer-events-none scale-50 opacity-0',
          )}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      {mounted && (
        <div
          className={cn(
            'absolute inset-x-0 top-full z-20 mt-2 origin-top overflow-hidden rounded-2xl bg-ink-900 p-1.5 shadow-pop transition-all duration-200 ease-smooth',
            visible ? 'translate-y-0 scale-100 opacity-100' : '-translate-y-1 scale-[0.98] opacity-0',
          )}
        >
          <p className="px-2.5 pb-1 pt-1.5 text-[11px] font-medium uppercase tracking-wider text-ink-500">
            {query ? `${results.length} results` : 'Recent'}
          </p>
          {results.length === 0 && <p className="px-2.5 py-6 text-center text-sm text-ink-400">No matches for “{query}”</p>}
          {results.map((item, i) => {
            const Icon = ICONS[item.kind];
            return (
              <button
                key={item.id}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(item)}
                style={{ animationDelay: `${i * 35}ms` }}
                className={cn(
                  'group flex w-full animate-fade-up items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors',
                  active === i ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]',
                )}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-800 text-ink-300 shadow-hairline">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink-100">{item.label}</span>
                  <span className="block truncate text-xs text-ink-400">{item.meta}</span>
                </span>
                <ArrowRight className={cn('h-4 w-4 text-ink-400 transition-all duration-200', active === i ? 'translate-x-0 opacity-100' : '-translate-x-1 opacity-0')} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function MorphingSearchDemo() {
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-start gap-4 pt-4">
      <MorphingSearch onSelect={(i) => setPicked(i.label)} />
      <p className="h-5 text-xs text-ink-500">{picked ? <span key={picked} className="animate-fade-in">Opened <span className="text-ink-200">{picked}</span></span> : 'Click the icon to search'}</p>
    </div>
  );
}
