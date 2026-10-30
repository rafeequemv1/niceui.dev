import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Building2, Check, CircleDollarSign, Plus, Search, UserRound, X } from 'lucide-react';
import { cn } from '@/lib/cn';

export type RelationKind = 'person' | 'company' | 'deal';
export type RelationOption = { id: string; kind: RelationKind; label: string; sub?: string; color?: string };

export type RelationPickerProps = {
  options: RelationOption[];
  value: string[];
  onChange: (ids: string[]) => void;
  /** Creates a record from the typed text; omit to hide "Create". */
  onCreate?: (label: string, kind: RelationKind) => RelationOption;
  label?: string;
  defaultOpen?: boolean;
  className?: string;
};

const GROUP: { kind: RelationKind; label: string; icon: typeof UserRound }[] = [
  { kind: 'person', label: 'People', icon: UserRound },
  { kind: 'company', label: 'Companies', icon: Building2 },
  { kind: 'deal', label: 'Deals', icon: CircleDollarSign },
];

function Glyph({ o, size = 20 }: { o: RelationOption; size?: number }) {
  if (o.kind === 'deal')
    return (
      <span className="grid shrink-0 place-items-center rounded-md bg-emerald-500/15 text-emerald-300" style={{ width: size, height: size }}>
        <CircleDollarSign className="h-3 w-3" />
      </span>
    );
  const initials = o.label
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('');
  return (
    <span className={cn('grid shrink-0 place-items-center font-semibold text-white', o.kind === 'person' ? 'rounded-full' : 'rounded-md')} style={{ width: size, height: size, background: o.color ?? '#475569', fontSize: size * 0.4 }}>
      {initials}
    </span>
  );
}

export function RelationPicker({ options, value, onChange, onCreate, label = 'Linked records', defaultOpen = false, className }: RelationPickerProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const uid = useId();

  const selected = value.map((id) => options.find((o) => o.id === id)).filter(Boolean) as RelationOption[];
  const q = query.trim().toLowerCase();
  const matches = useMemo(() => options.filter((o) => !q || `${o.label} ${o.sub ?? ''}`.toLowerCase().includes(q)), [options, q]);
  const ordered = GROUP.flatMap((g) => matches.filter((o) => o.kind === g.kind));
  const canCreate = !!onCreate && q.length > 1 && !options.some((o) => o.label.toLowerCase() === q);
  const total = ordered.length + (canCreate ? 1 : 0);

  useEffect(() => setActive(0), [q]);
  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);
  useEffect(() => {
    const el = list.current?.querySelector<HTMLElement>(`[data-i="${active}"]`);
    const box = list.current;
    if (!el || !box) return;
    if (el.offsetTop < box.scrollTop) box.scrollTop = el.offsetTop - 4;
    else if (el.offsetTop + el.offsetHeight > box.scrollTop + box.clientHeight) box.scrollTop = el.offsetTop + el.offsetHeight - box.clientHeight + 4;
  }, [active]);

  const toggle = (id: string) => onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  const create = () => {
    if (!onCreate) return;
    const kind: RelationKind = /\b(inc|llc|ltd|labs|group|co)\b/i.test(query) ? 'company' : 'person';
    const o = onCreate(query.trim(), kind);
    onChange([...value, o.id]);
    setQuery('');
  };
  const choose = (i: number) => {
    if (i < ordered.length) toggle(ordered[i].id);
    else if (canCreate) create();
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((a) => (total ? (a + 1) % total : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => (total ? (a - 1 + total) % total : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (open && total) choose(active);
      else setOpen(true);
    } else if (e.key === 'Escape') {
      setOpen(false);
    } else if (e.key === 'Backspace' && !query && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  let i = -1;
  return (
    <div ref={root} className={cn('relative h-fit w-full max-w-md self-start', className)}>
      <p id={`${uid}-label`} className="mb-1.5 text-xs font-medium text-ink-400">
        {label}
      </p>
      <div
        onClick={() => {
          setOpen(true);
          input.current?.focus();
        }}
        className={cn('flex min-h-[44px] w-full flex-wrap items-center gap-1.5 rounded-xl bg-ink-900 px-2 py-1.5 shadow-card transition-shadow', open && 'ring-1 ring-brand-400/50')}
      >
        {selected.map((o) => (
          <span key={o.id} className="inline-flex max-w-full items-center gap-1.5 rounded-lg bg-white/[0.06] py-1 pl-1 pr-1.5 text-xs text-ink-100 animate-scale-in">
            <Glyph o={o} size={18} />
            <span className="truncate">{o.label}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggle(o.id);
              }}
              aria-label={`Unlink ${o.label}`}
              className="focus-ring rounded text-ink-500 transition-colors hover:text-ink-100"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <span className="flex min-w-[120px] flex-1 items-center gap-1.5">
          <Search className="h-3.5 w-3.5 shrink-0 text-ink-500" />
          <input
            ref={input}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKey}
            placeholder={selected.length ? 'Link another…' : 'Search people, companies, deals'}
            role="combobox"
            aria-expanded={open}
            aria-controls={`${uid}-list`}
            aria-labelledby={`${uid}-label`}
            aria-activedescendant={open && total ? `${uid}-opt-${active}` : undefined}
            className="h-7 min-w-0 flex-1 bg-transparent text-sm text-ink-50 outline-none placeholder:text-ink-500"
          />
        </span>
      </div>

      {open && (
        <ul ref={list} id={`${uid}-list`} role="listbox" aria-multiselectable="true" className="absolute inset-x-0 top-full z-20 mt-2 max-h-[264px] overflow-y-auto rounded-xl bg-ink-850 p-1 shadow-pop animate-scale-in [scrollbar-width:thin]">
          {GROUP.map((g) => {
            const items = ordered.filter((o) => o.kind === g.kind);
            if (!items.length) return null;
            return (
              <li key={g.kind} role="presentation">
                <p className="flex items-center gap-1.5 px-2 pb-1 pt-2 text-[10.5px] font-medium uppercase tracking-wider text-ink-500">
                  <g.icon className="h-3 w-3" /> {g.label}
                </p>
                <ul role="presentation">
                  {items.map((o) => {
                    i += 1;
                    const idx = i;
                    const on = value.includes(o.id);
                    return (
                      <li
                        key={o.id}
                        id={`${uid}-opt-${idx}`}
                        data-i={idx}
                        role="option"
                        aria-selected={on}
                        onPointerMove={() => setActive(idx)}
                        onClick={() => toggle(o.id)}
                        className={cn('flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors', active === idx ? 'bg-white/[0.07]' : '')}
                      >
                        <Glyph o={o} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-ink-100">{o.label}</span>
                          {o.sub && <span className="block truncate text-[11px] text-ink-500">{o.sub}</span>}
                        </span>
                        <span className={cn('grid h-4 w-4 shrink-0 place-items-center rounded border transition-all', on ? 'border-brand-400 bg-brand-500 text-white' : 'border-ink-600 text-transparent')}>
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
          {canCreate && (
            <li
              id={`${uid}-opt-${ordered.length}`}
              data-i={ordered.length}
              role="option"
              aria-selected={false}
              onPointerMove={() => setActive(ordered.length)}
              onClick={create}
              className={cn('mt-1 flex cursor-pointer items-center gap-2 rounded-lg border-t border-white/5 px-2 py-2 text-sm text-brand-300', active === ordered.length && 'bg-white/[0.07]')}
            >
              <Plus className="h-4 w-4" /> Create “{query.trim()}”
            </li>
          )}
          {!total && <li className="px-2 py-6 text-center text-xs text-ink-500">No matches</li>}
          <li role="presentation" className="mt-1 flex items-center gap-3 border-t border-white/5 px-2 pt-1.5 text-[10.5px] text-ink-500">
            <span>↑↓ move</span>
            <span>↵ link</span>
            <span>⌫ remove last</span>
            <span className="ml-auto">esc close</span>
          </li>
        </ul>
      )}
    </div>
  );
}

const SEED: RelationOption[] = [
  { id: 'p1', kind: 'person', label: 'Sofia Andersen', sub: 'VP Operations · Halcyon Freight', color: '#0ea5e9' },
  { id: 'p2', kind: 'person', label: 'Marcus Webb', sub: 'Procurement · Halcyon Freight', color: '#8b5cf6' },
  { id: 'p3', kind: 'person', label: 'Noor Haddad', sub: 'CTO · Lumenfield', color: '#f59e0b' },
  { id: 'p4', kind: 'person', label: 'Ana Ruiz', sub: 'Head of Finance · Northpine Health', color: '#10b981' },
  { id: 'c1', kind: 'company', label: 'Halcyon Freight', sub: 'halcyonfreight.io · 1,200 people', color: '#2563eb' },
  { id: 'c2', kind: 'company', label: 'Lumenfield Analytics', sub: 'lumenfield.io · 220 people', color: '#7c3aed' },
  { id: 'c3', kind: 'company', label: 'Northpine Health', sub: 'northpine.health · 640 people', color: '#059669' },
  { id: 'd1', kind: 'deal', label: 'Halcyon pilot', sub: 'Proposal · $72,000' },
  { id: 'd2', kind: 'deal', label: 'Lumenfield expansion', sub: 'Negotiation · $84,000' },
];

export function RelationPickerDemo() {
  const [options, setOptions] = useState(SEED);
  const [value, setValue] = useState(['p1', 'c1']);
  return (
    <div className="flex min-h-[380px] w-full items-start justify-center">
      <RelationPicker
        options={options}
        value={value}
        onChange={setValue}
        defaultOpen
        onCreate={(label, kind) => {
          const o: RelationOption = { id: `n${Date.now()}`, kind, label, sub: 'New record', color: '#475569' };
          setOptions((list) => [...list, o]);
          return o;
        }}
      />
    </div>
  );
}
