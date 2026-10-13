import { useCallback, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useClickOutside, useEscape, usePresence } from '@/components/ui/motion/hooks';

export type ComboboxOption = { value: string; label: string; meta?: string };

export type ComboboxProps = {
  options: ComboboxOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  label?: string;
  emptyText?: string;
};

export function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  const i = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1;
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded-[3px] bg-brand-500/20 px-px text-brand-200">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

export function Combobox({ options, value, onChange, placeholder = 'Search…', label, emptyText = 'No results' }: ComboboxProps) {
  const selected = options.find((o) => o.value === value) ?? null;
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const id = useId();
  const { mounted, visible } = usePresence(open, 160);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
  }, []);
  useEscape(open, close);
  useClickOutside([root], open, close);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter((o) => o.label.toLowerCase().includes(q) || o.meta?.toLowerCase().includes(q)) : options;
  }, [options, query]);

  const pick = (o: ComboboxOption) => {
    onChange(o.value);
    close();
    input.current?.blur();
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) return setOpen(true);
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter' && open && filtered[active]) {
      e.preventDefault();
      pick(filtered[active]);
    }
  };

  return (
    <div ref={root} className="relative w-full">
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-200">
          {label}
        </label>
      )}
      <div
        className={cn(
          'flex h-10 items-center gap-2 rounded-lg bg-ink-900 px-3 ring-1 ring-inset transition-all',
          open ? 'ring-brand-500 shadow-[0_0_0_4px_rgba(51,150,255,0.15)]' : 'ring-white/10 hover:ring-white/20',
        )}
      >
        <Search className={cn('h-4 w-4 shrink-0 transition-colors', open ? 'text-brand-300' : 'text-ink-500')} />
        <input
          ref={input}
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          autoComplete="off"
          value={open ? query : selected?.label ?? ''}
          placeholder={open && selected ? selected.label : placeholder}
          onFocus={() => setOpen(true)}
          onBlur={close}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onKeyDown={onKey}
          className="h-full min-w-0 flex-1 bg-transparent text-sm text-ink-50 outline-none placeholder:text-ink-500"
        />
        {selected && !open ? (
          <button
            type="button"
            aria-label="Clear"
            onClick={() => onChange(null)}
            className="focus-ring flex h-6 w-6 animate-scale-in items-center justify-center rounded-md text-ink-400 hover:bg-white/5 hover:text-ink-100"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <ChevronDown className={cn('h-4 w-4 text-ink-400 transition-transform duration-300 ease-spring', open && 'rotate-180')} />
        )}
      </div>
      {mounted && (
        <div
          onPointerDown={(e) => e.preventDefault()}
          className={cn(
            'absolute left-0 right-0 top-full z-40 mt-2 origin-top overflow-hidden rounded-xl bg-ink-850 shadow-pop',
            visible ? 'scale-100 opacity-100 transition-all duration-300 ease-spring' : 'scale-95 opacity-0 transition-all duration-150',
          )}
        >
          <ul role="listbox" className="max-h-60 overflow-auto p-1">
            {filtered.map((o, i) => (
              <li
                key={o.value}
                role="option"
                aria-selected={o.value === value}
                onPointerDown={(e) => e.preventDefault()}
                onPointerMove={() => setActive(i)}
                onClick={() => pick(o)}
                className={cn(
                  'flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors',
                  i === active ? 'bg-white/[0.06] text-ink-50' : 'text-ink-300',
                )}
              >
                <span className="flex-1 truncate">
                  <Highlight text={o.label} query={query} />
                </span>
                {o.meta && (
                  <span className="font-mono text-xs text-ink-500">
                    <Highlight text={o.meta} query={query} />
                  </span>
                )}
                <Check className={cn('h-4 w-4 text-brand-300 transition-all', o.value === value ? 'scale-100 opacity-100' : 'scale-50 opacity-0')} />
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="animate-fade-in px-3 py-6 text-center text-sm text-ink-400">
                {emptyText} for “<span className="text-ink-200">{query}</span>”
              </li>
            )}
          </ul>
          <div className="flex items-center justify-between border-t border-white/5 px-3 py-2 text-[11px] text-ink-500">
            <span>{filtered.length} results</span>
            <span>↑↓ navigate · ↵ select</span>
          </div>
        </div>
      )}
    </div>
  );
}

const PACKAGES: ComboboxOption[] = [
  { value: 'react', label: 'React', meta: '18.3.1' },
  { value: 'next', label: 'Next.js', meta: '14.2.5' },
  { value: 'remix', label: 'Remix', meta: '2.11.0' },
  { value: 'astro', label: 'Astro', meta: '4.13.1' },
  { value: 'svelte', label: 'SvelteKit', meta: '2.5.20' },
  { value: 'nuxt', label: 'Nuxt', meta: '3.12.4' },
  { value: 'solid', label: 'SolidStart', meta: '1.0.6' },
  { value: 'qwik', label: 'Qwik City', meta: '1.7.3' },
  { value: 'vite', label: 'Vite', meta: '5.4.0' },
  { value: 'gatsby', label: 'Gatsby', meta: '5.13.7' },
];

export function ComboboxDemo() {
  const [value, setValue] = useState<string | null>(null);
  return (
    <div className="mx-auto w-full max-w-xs self-start">
      <Combobox label="Framework" options={PACKAGES} value={value} onChange={setValue} placeholder="Search frameworks…" />
      <p className="mt-3 text-xs text-ink-500">Try typing “st” or “1.7”.</p>
    </div>
  );
}
