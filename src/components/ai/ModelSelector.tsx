import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Brain, Check, ChevronDown, Eye, HardDrive, Search, Sparkles, Star, Wrench, Zap } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useClickOutside, usePresence } from '@/components/ui/motion/hooks';

export type ModelCapability = 'vision' | 'tools' | 'reasoning' | 'fast';

export type ModelOption = {
  id: string;
  name: string;
  provider: string;
  /** One or two letters for the monogram. */
  glyph: string;
  /** Tailwind classes for the monogram tile. */
  tint: string;
  /** Context window in tokens. */
  context: number;
  /** Input price in dollars per million tokens. 0 means free or local. */
  price: number;
  /** 1 (slow) to 5 (fastest). */
  speed: number;
  caps: ModelCapability[];
  description: string;
  local?: boolean;
};

export const AUTO_MODEL = 'auto';

const CAPS: Record<ModelCapability, { label: string; icon: typeof Eye; tone: string }> = {
  vision: { label: 'Vision', icon: Eye, tone: 'text-sky-300' },
  tools: { label: 'Tools', icon: Wrench, tone: 'text-violet-300' },
  reasoning: { label: 'Reasoning', icon: Brain, tone: 'text-amber-300' },
  fast: { label: 'Fast', icon: Zap, tone: 'text-emerald-300' },
};

const SPEED = ['', 'Slow', 'Steady', 'Quick', 'Fast', 'Instant'];

export const formatContext = (n: number) => (n >= 1_000_000 ? `${n / 1_000_000}M` : `${Math.round(n / 1000)}K`);
const formatPrice = (p: number) => (p === 0 ? 'Free' : `$${p < 1 ? p.toFixed(2) : p.toFixed(p % 1 ? 2 : 0)}`);

export const DEMO_MODELS: ModelOption[] = [
  { id: 'nova-pro', name: 'Nova Pro', provider: 'Nova', glyph: 'N', tint: 'bg-sky-500/15 text-sky-300', context: 400_000, price: 3, speed: 3, caps: ['vision', 'tools', 'reasoning'], description: 'The all-rounder. Strong at writing, analysis and multi-step tool use.' },
  { id: 'nova-mini', name: 'Nova Mini', provider: 'Nova', glyph: 'N', tint: 'bg-sky-500/15 text-sky-300', context: 128_000, price: 0.15, speed: 5, caps: ['vision', 'tools', 'fast'], description: 'Small and quick. Ideal for autocomplete, routing and short answers.' },
  { id: 'atlas-reasoner', name: 'Atlas Reasoner', provider: 'Atlas', glyph: 'A', tint: 'bg-amber-500/15 text-amber-300', context: 200_000, price: 8, speed: 2, caps: ['reasoning', 'tools'], description: 'Thinks before it answers. Best for math, planning and gnarly bugs.' },
  { id: 'atlas-code', name: 'Atlas Code', provider: 'Atlas', glyph: 'A', tint: 'bg-amber-500/15 text-amber-300', context: 256_000, price: 2.5, speed: 4, caps: ['tools', 'reasoning'], description: 'Tuned for repositories: edits files, runs tests and reads diffs.' },
  { id: 'lumen-vision', name: 'Lumen Vision', provider: 'Lumen', glyph: 'L', tint: 'bg-violet-500/15 text-violet-300', context: 1_000_000, price: 0.6, speed: 4, caps: ['vision', 'fast'], description: 'Reads screenshots, charts and hour-long videos in a single pass.' },
  { id: 'open-70b', name: 'Open 70B', provider: 'Open weights', glyph: 'O', tint: 'bg-emerald-500/15 text-emerald-300', context: 32_000, price: 0, speed: 3, caps: ['tools'], description: 'Runs on your own GPU. Nothing leaves the machine.', local: true },
  { id: 'open-8b', name: 'Open 8B', provider: 'Open weights', glyph: 'O', tint: 'bg-emerald-500/15 text-emerald-300', context: 32_000, price: 0, speed: 5, caps: ['fast'], description: 'Tiny local model for drafts, tagging and offline work.', local: true },
];

export type ModelSelectorProps = {
  models: ModelOption[];
  value: string;
  onChange: (id: string) => void;
  favorites?: string[];
  onToggleFavorite?: (id: string) => void;
  /** Adds an “Auto” option that routes each message to a suitable model. */
  allowAuto?: boolean;
  defaultOpen?: boolean;
  className?: string;
};

type Row = { key: string; group: string; model: ModelOption | null };

function Glyph({ model, size = 'sm' }: { model: ModelOption | null; size?: 'sm' | 'lg' }) {
  const box = size === 'lg' ? 'h-10 w-10 rounded-xl text-base' : 'h-7 w-7 rounded-lg text-[12px]';
  if (!model)
    return (
      <span className={cn('flex shrink-0 items-center justify-center bg-gradient-to-br from-brand-400/25 to-violet-500/20 text-brand-200 ring-1 ring-inset ring-white/10', box)}>
        <Sparkles className={size === 'lg' ? 'h-5 w-5' : 'h-3.5 w-3.5'} />
      </span>
    );
  return <span className={cn('flex shrink-0 items-center justify-center font-semibold ring-1 ring-inset ring-white/10', box, model.tint)}>{model.glyph}</span>;
}

function SpeedMeter({ speed, className }: { speed: number; className?: string }) {
  return (
    <span className={cn('flex items-end gap-[2px]', className)} aria-label={`Speed ${speed} of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={cn('w-[3px] rounded-full transition-colors', i <= speed ? 'bg-brand-300' : 'bg-white/10')} style={{ height: 4 + i * 2 }} />
      ))}
    </span>
  );
}

/** A command-menu model picker with search, favorites, capabilities and a detail pane. */
export function ModelSelector({ models, value, onChange, favorites = [], onToggleFavorite, allowAuto = true, defaultOpen = false, className }: ModelSelectorProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const wrap = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const listId = useId();
  const { mounted, visible } = usePresence(open, 160);
  const close = useCallback(() => setOpen(false), []);
  useClickOutside([wrap], open, close);

  const current = models.find((m) => m.id === value) ?? null;

  const rows = useMemo<Row[]>(() => {
    const q = query.trim().toLowerCase();
    const hit = (m: ModelOption) => !q || [m.name, m.provider, ...m.caps, m.local ? 'local' : ''].join(' ').toLowerCase().includes(q);
    const out: Row[] = [];
    if (allowAuto && (!q || 'auto'.includes(q))) out.push({ key: 'auto', group: '', model: null });
    if (!q) models.filter((m) => favorites.includes(m.id)).forEach((m) => out.push({ key: `fav-${m.id}`, group: 'Favorites', model: m }));
    models.filter(hit).forEach((m) => out.push({ key: m.id, group: m.provider, model: m }));
    return out;
  }, [models, favorites, query, allowAuto]);

  useEffect(() => setActive(0), [query]);
  useEffect(() => {
    if (!open) return;
    setQuery('');
    const i = rows.findIndex((r) => (r.model?.id ?? AUTO_MODEL) === value);
    setActive(Math.max(0, i));
    // Focus the search field only when opened by the visitor, never on page load.
    if (!defaultOpen || document.activeElement === trigger.current) input.current?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    const box = list.current;
    const el = box?.querySelector<HTMLElement>(`[data-row="${active}"]`);
    if (!box || !el) return;
    if (el.offsetTop < box.scrollTop) box.scrollTop = el.offsetTop - 28;
    else if (el.offsetTop + el.offsetHeight > box.scrollTop + box.clientHeight) box.scrollTop = el.offsetTop + el.offsetHeight - box.clientHeight + 6;
  }, [active]);

  const pick = (row: Row | undefined) => {
    if (!row) return;
    onChange(row.model?.id ?? AUTO_MODEL);
    setOpen(false);
    trigger.current?.focus({ preventScroll: true });
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!rows.length) return;
      setActive((a) => (a + (e.key === 'ArrowDown' ? 1 : -1) + rows.length) % rows.length);
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      setActive(e.key === 'Home' ? 0 : rows.length - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      pick(rows[active]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      trigger.current?.focus({ preventScroll: true });
    } else if (e.altKey && e.code === 'KeyF') {
      e.preventDefault();
      const m = rows[active]?.model;
      if (m) onToggleFavorite?.(m.id);
    }
  };

  const focused = rows[active];
  const detail = focused ? focused.model : current;
  let lastGroup = '';

  return (
    <div ref={wrap} className={cn('relative inline-block', className)}>
      <button
        ref={trigger}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="focus-ring flex h-10 items-center gap-2.5 rounded-xl bg-ink-850 py-1.5 pl-1.5 pr-3 text-left shadow-hairline transition-colors hover:bg-ink-800"
      >
        <Glyph model={value === AUTO_MODEL ? null : current} />
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium text-ink-50">{value === AUTO_MODEL ? 'Auto' : current?.name}</span>
        </span>
        <ChevronDown className={cn('h-4 w-4 text-ink-500 transition-transform duration-300 ease-spring', open && 'rotate-180')} />
      </button>

      {mounted && (
        <div
          className={cn(
            'absolute left-0 top-full z-30 mt-2 w-[min(600px,calc(100vw-3rem))] origin-top-left overflow-hidden rounded-2xl bg-ink-850 shadow-pop transition-all',
            visible ? 'translate-y-0 scale-100 opacity-100 duration-300 ease-spring' : '-translate-y-1 scale-[0.97] opacity-0 duration-150',
          )}
        >
          <div className="flex items-center gap-2.5 border-b border-white/[0.06] px-3.5">
            <Search className="h-4 w-4 shrink-0 text-ink-500" />
            <input
              ref={input}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKey}
              placeholder="Search models, providers or capabilities…"
              role="combobox"
              aria-expanded
              aria-controls={listId}
              aria-activedescendant={focused ? `${listId}-${focused.key}` : undefined}
              aria-label="Search models"
              className="h-11 min-w-0 flex-1 bg-transparent text-sm text-ink-50 outline-none placeholder:text-ink-500"
            />
            <kbd className="rounded-md bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-ink-500">esc</kbd>
          </div>

          <div className="grid sm:grid-cols-[minmax(0,1fr)_236px]">
            <div ref={list} id={listId} role="listbox" aria-label="Models" className="relative max-h-[300px] overflow-y-auto p-1.5 [scrollbar-width:thin]">
              {rows.length === 0 && <p className="px-3 py-8 text-center text-sm text-ink-500">No models match “{query}”</p>}
              {rows.map((row, i) => {
                const header = row.group && row.group !== lastGroup ? row.group : null;
                lastGroup = row.group || lastGroup;
                const m = row.model;
                const selected = (m?.id ?? AUTO_MODEL) === value;
                const fav = !!m && favorites.includes(m.id);
                return (
                  <div key={row.key}>
                    {header && <p className="px-2.5 pb-1 pt-2.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-500">{header}</p>}
                    <div
                      id={`${listId}-${row.key}`}
                      data-row={i}
                      role="option"
                      aria-selected={selected}
                      onMouseMove={() => active !== i && setActive(i)}
                      onClick={() => pick(row)}
                      className={cn('group/row flex cursor-pointer items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors duration-150', i === active ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]')}
                    >
                      <Glyph model={m} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5">
                          <span className="truncate text-sm text-ink-100">{m ? m.name : 'Auto'}</span>
                          {!m && <span className="rounded-full bg-brand-500/15 px-1.5 py-px text-[10px] font-medium text-brand-200">Recommended</span>}
                          {m?.local && <HardDrive className="h-3 w-3 shrink-0 text-emerald-300" aria-label="Runs locally" />}
                        </span>
                        <span className="mt-0.5 flex items-center gap-1.5">
                          {m ? (
                            m.caps.map((c) => {
                              const C = CAPS[c];
                              return <C.icon key={c} className={cn('h-3 w-3', C.tone)} aria-label={C.label} />;
                            })
                          ) : (
                            <span className="truncate text-[11px] text-ink-500">Routes each message to the best fit</span>
                          )}
                        </span>
                      </span>
                      {m && (
                        <span className="hidden shrink-0 items-center gap-3 text-right sm:flex">
                          <span className="font-mono text-[11px] tabular-nums text-ink-500">{formatContext(m.context)}</span>
                          <SpeedMeter speed={m.speed} />
                        </span>
                      )}
                      {m && onToggleFavorite && (
                        <button
                          type="button"
                          tabIndex={-1}
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(m.id);
                          }}
                          aria-label={fav ? `Remove ${m.name} from favorites` : `Add ${m.name} to favorites`}
                          className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-all hover:bg-white/10', fav ? 'text-amber-300' : 'text-ink-500 opacity-0 group-hover/row:opacity-100', i === active && 'opacity-100')}
                        >
                          <Star className={cn('h-3.5 w-3.5 transition-transform duration-300 ease-spring', fav && 'scale-110 fill-current')} />
                        </button>
                      )}
                      <Check className={cn('h-4 w-4 shrink-0 text-brand-300 transition-all duration-300 ease-spring', selected ? 'scale-100 opacity-100' : 'scale-50 opacity-0')} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="hidden border-l border-white/[0.06] p-4 sm:block">
              <div key={detail?.id ?? 'auto'} className="animate-fade-in">
                <Glyph model={detail ?? null} size="lg" />
                <p className="mt-3 text-[15px] font-medium text-ink-50">{detail ? detail.name : 'Auto'}</p>
                <p className="text-xs text-ink-500">{detail ? (detail.local ? 'Open weights · runs locally' : detail.provider) : 'Smart routing'}</p>
                <p className="mt-2.5 text-[13px] leading-relaxed text-ink-300">
                  {detail ? detail.description : 'Quick questions go to a fast model, hard ones to a reasoning model. You only pay for what each message needs.'}
                </p>
                {detail && (
                  <>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {detail.caps.map((c) => {
                        const C = CAPS[c];
                        return (
                          <span key={c} className="flex items-center gap-1 rounded-full bg-white/[0.04] px-2 py-0.5 text-[11px] text-ink-300 ring-1 ring-inset ring-white/[0.06]">
                            <C.icon className={cn('h-3 w-3', C.tone)} />
                            {C.label}
                          </span>
                        );
                      })}
                    </div>
                    <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2.5 text-[11px]">
                      {[
                        ['Context', `${formatContext(detail.context)} tokens`],
                        ['Input', detail.price ? `${formatPrice(detail.price)} / 1M` : 'Free'],
                        ['Output', detail.price ? `${formatPrice(detail.price * 4)} / 1M` : 'Free'],
                      ].map(([k, v]) => (
                        <div key={k}>
                          <dt className="text-ink-500">{k}</dt>
                          <dd className="mt-0.5 font-mono tabular-nums text-ink-100">{v}</dd>
                        </div>
                      ))}
                      <div>
                        <dt className="text-ink-500">Speed</dt>
                        <dd className="mt-1 flex items-center gap-1.5">
                          <SpeedMeter speed={detail.speed} />
                          <span className="text-ink-300">{SPEED[detail.speed]}</span>
                        </dd>
                      </div>
                    </dl>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 border-t border-white/[0.06] px-3.5 py-2 text-[11px] text-ink-500">
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-white/5 px-1 font-mono">↑↓</kbd> navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-white/5 px-1 font-mono">↵</kbd> select
            </span>
            {onToggleFavorite && (
              <span className="hidden items-center gap-1 sm:flex">
                <kbd className="rounded bg-white/5 px-1 font-mono">⌥F</kbd> favorite
              </span>
            )}
            <span className="ml-auto font-mono tabular-nums">{models.length} models</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function ModelSelectorDemo() {
  const [value, setValue] = useState('nova-pro');
  const [favorites, setFavorites] = useState(['nova-pro', 'atlas-code']);
  const toggle = (id: string) => setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));
  const current = DEMO_MODELS.find((m) => m.id === value);

  return (
    <div className="mx-auto flex h-[470px] w-full max-w-[600px] flex-col">
      <div className="flex items-center justify-between gap-3">
        <ModelSelector models={DEMO_MODELS} value={value} onChange={setValue} favorites={favorites} onToggleFavorite={toggle} defaultOpen />
        <span className="hidden truncate text-xs text-ink-500 sm:block">
          {value === AUTO_MODEL ? 'Auto routing on' : `${current?.name} · ${formatContext(current?.context ?? 0)} context`}
        </span>
      </div>
    </div>
  );
}
