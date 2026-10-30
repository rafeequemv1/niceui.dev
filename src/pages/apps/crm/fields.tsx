import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Briefcase, Building2, CalendarDays, Check, CircleDot, DollarSign, Globe, Mail, MapPin, Percent, Phone, ShieldCheck, Star, Target as TargetIcon, UserRound, Users, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { INDUSTRIES, LIFECYCLES, MEMBERS, STAGES } from './data';
import { useCrm } from './store';
import { Avatar, Logo, MemberChip, Pill, Stars, fmtDate, money } from './ui';

export type FieldType = 'text' | 'email' | 'phone' | 'company' | 'person' | 'member' | 'select' | 'currency' | 'number' | 'date' | 'rating' | 'link' | 'boolean' | 'percent';
export type Field = { key: string; label: string; icon: LucideIcon; type: FieldType; w: number; options?: readonly string[] };

export const PEOPLE_FIELDS: Field[] = [
  { key: 'email', label: 'Email', icon: Mail, type: 'email', w: 236 },
  { key: 'companyId', label: 'Company', icon: Building2, type: 'company', w: 190 },
  { key: 'title', label: 'Job title', icon: Briefcase, type: 'text', w: 176 },
  { key: 'phone', label: 'Phone', icon: Phone, type: 'phone', w: 164 },
  { key: 'lifecycle', label: 'Lifecycle', icon: CircleDot, type: 'select', w: 116, options: LIFECYCLES },
  { key: 'intent', label: 'Intent', icon: Star, type: 'rating', w: 108 },
  { key: 'lastContact', label: 'Last contact', icon: CalendarDays, type: 'date', w: 128 },
  { key: 'owner', label: 'Owner', icon: UserRound, type: 'member', w: 150 },
  { key: 'city', label: 'City', icon: MapPin, type: 'text', w: 120 },
];

export const COMPANY_FIELDS: Field[] = [
  { key: 'domain', label: 'Domain', icon: Globe, type: 'link', w: 172 },
  { key: 'industry', label: 'Industry', icon: CircleDot, type: 'select', w: 116, options: INDUSTRIES },
  { key: 'employees', label: 'Employees', icon: Users, type: 'number', w: 112 },
  { key: 'arr', label: 'ARR', icon: DollarSign, type: 'currency', w: 104 },
  { key: 'owner', label: 'Account owner', icon: UserRound, type: 'member', w: 152 },
  { key: 'icp', label: 'Ideal customer', icon: ShieldCheck, type: 'boolean', w: 128 },
  { key: 'rating', label: 'Fit', icon: Star, type: 'rating', w: 108 },
  { key: 'city', label: 'City', icon: MapPin, type: 'text', w: 118 },
  { key: 'created', label: 'Created', icon: CalendarDays, type: 'date', w: 126 },
];

export const OPP_FIELDS: Field[] = [
  { key: 'amount', label: 'Amount', icon: DollarSign, type: 'currency', w: 108 },
  { key: 'stage', label: 'Stage', icon: TargetIcon, type: 'select', w: 116, options: STAGES },
  { key: 'close', label: 'Close date', icon: CalendarDays, type: 'date', w: 126 },
  { key: 'companyId', label: 'Company', icon: Building2, type: 'company', w: 190 },
  { key: 'poc', label: 'Point of contact', icon: UserRound, type: 'person', w: 176 },
  { key: 'owner', label: 'Owner', icon: UserRound, type: 'member', w: 150 },
  { key: 'probability', label: 'Probability', icon: Percent, type: 'percent', w: 120 },
];

export const NUMERIC: FieldType[] = ['currency', 'number', 'percent', 'rating'];
export const DIRECT: FieldType[] = ['rating', 'boolean'];

export function Empty() {
  return <span className="text-[var(--faint)]">Empty</span>;
}

/** Read-only rendering of a field value. Ratings and booleans are edited in place via `onChange`. */
export function FieldValue({ field, value, onChange }: { field: Field; value: unknown; onChange?: (v: unknown) => void }) {
  const crm = useCrm();
  switch (field.type) {
    case 'company': {
      const c = crm.companies.find((x) => x.id === value);
      if (!c) return <Empty />;
      return (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            crm.openRecord({ kind: 'company', id: c.id });
          }}
          className="inline-flex max-w-full items-center gap-1.5 rounded-[4px] bg-[var(--sub)] py-px pl-1 pr-1.5 hover:bg-[var(--hover)]"
        >
          <Logo company={c} size={14} />
          <span className="truncate">{c.name}</span>
        </button>
      );
    }
    case 'person': {
      const p = crm.people.find((x) => x.id === value);
      if (!p) return <Empty />;
      return (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            crm.openRecord({ kind: 'person', id: p.id });
          }}
          className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-[var(--sub)] py-px pl-px pr-2 hover:bg-[var(--hover)]"
        >
          <Avatar name={p.name} size={16} />
          <span className="truncate">{p.name}</span>
        </button>
      );
    }
    case 'member':
      return <MemberChip member={MEMBERS.find((m) => m.id === value) ?? MEMBERS[0]} />;
    case 'select':
      return value ? <Pill value={String(value)} /> : <Empty />;
    case 'currency':
      return <span className="tabular-nums">{money(Number(value) || 0)}</span>;
    case 'number':
      return <span className="tabular-nums">{(Number(value) || 0).toLocaleString('en-US')}</span>;
    case 'percent': {
      const n = Number(value) || 0;
      return (
        <span className="flex w-full items-center gap-2">
          <span className="w-8 shrink-0 tabular-nums">{n}%</span>
          <span className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--sub)]">
            <span className="block h-full rounded-full bg-[var(--accent)]" style={{ width: `${n}%` }} />
          </span>
        </span>
      );
    }
    case 'date':
      return value ? <span className="tabular-nums text-[var(--fg)]">{fmtDate(String(value))}</span> : <Empty />;
    case 'rating':
      return <Stars value={Number(value) || 0} onChange={onChange} />;
    case 'link':
      return value ? (
        <span className="inline-flex max-w-full items-center gap-1 rounded-[4px] bg-[var(--sub)] px-1.5 py-px text-[12px]">
          <Globe className="h-3 w-3 shrink-0 text-[var(--mute)]" />
          <span className="truncate">{String(value)}</span>
        </span>
      ) : (
        <Empty />
      );
    case 'boolean': {
      const on = Boolean(value);
      return (
        <button
          type="button"
          role="checkbox"
          aria-checked={on}
          onClick={(e) => {
            e.stopPropagation();
            onChange?.(!on);
          }}
          className="inline-flex items-center gap-1.5"
        >
          <span className={cn('grid h-3.5 w-3.5 place-items-center rounded-[4px] border transition-colors', on ? 'border-[var(--accent)] bg-[var(--accent)] text-white' : 'border-[var(--line2)]')}>
            {on && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
          </span>
          {on ? 'Yes' : 'No'}
        </button>
      );
    }
    default:
      return value ? <span className="truncate">{String(value)}</span> : <Empty />;
  }
}

/** Inline editor overlay. Commits on Enter or blur, cancels on Escape. */
export function FieldEditor({ field, value, onCommit, onCancel }: { field: Field; value: unknown; onCommit: (v: unknown) => void; onCancel: () => void }) {
  const crm = useCrm();
  const list =
    field.type === 'select'
      ? (field.options ?? []).map((o) => ({ id: o, label: o, node: <Pill value={o} /> }))
      : field.type === 'company'
        ? crm.companies.map((c) => ({ id: c.id, label: c.name, node: <span className="flex min-w-0 items-center gap-2"><Logo company={c} size={16} /><span className="truncate">{c.name}</span></span> }))
        : field.type === 'person'
          ? crm.people.map((p) => ({ id: p.id, label: p.name, node: <span className="flex min-w-0 items-center gap-2"><Avatar name={p.name} size={16} /><span className="truncate">{p.name}</span></span> }))
          : field.type === 'member'
            ? MEMBERS.map((m) => ({ id: m.id, label: m.name, node: <MemberChip member={m} /> }))
            : null;

  if (list) return <ListEditor items={list} current={String(value ?? '')} searchable={field.type !== 'select'} onPick={onCommit} onCancel={onCancel} />;

  const numeric = field.type === 'currency' || field.type === 'number' || field.type === 'percent';
  return (
    <TextEditor
      type={field.type === 'date' ? 'date' : numeric ? 'number' : field.type === 'email' ? 'email' : 'text'}
      initial={value == null ? '' : String(value)}
      onCommit={(s) => onCommit(numeric ? Math.max(0, Number(s) || 0) : s)}
      onCancel={onCancel}
    />
  );
}

export function TextEditor({ initial, type = 'text', onCommit, onCancel, className }: { initial: string; type?: string; onCommit: (s: string) => void; onCancel: () => void; className?: string }) {
  const [v, setV] = useState(initial);
  const done = useRef(false);
  const finish = (commit: boolean) => {
    if (done.current) return;
    done.current = true;
    if (commit) onCommit(v.trim());
    else onCancel();
  };
  return (
    <input
      autoFocus
      type={type}
      value={v}
      onChange={(e) => setV(e.target.value)}
      onFocus={(e) => e.currentTarget.select()}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === 'Enter') finish(true);
        if (e.key === 'Escape') finish(false);
      }}
      onBlur={() => finish(true)}
      className={cn('h-8 w-full min-w-[160px] rounded-md border border-[var(--accent)] bg-[var(--panel)] px-2 text-[13px] text-[var(--strong)] outline-none', className)}
      style={{ boxShadow: 'var(--pop)' }}
    />
  );
}

function ListEditor({ items, current, searchable, onPick, onCancel }: { items: { id: string; label: string; node: JSX.Element }[]; current: string; searchable: boolean; onPick: (id: string) => void; onCancel: () => void }) {
  const [q, setQ] = useState('');
  const shown = useMemo(() => items.filter((i) => i.label.toLowerCase().includes(q.toLowerCase())), [items, q]);
  const [hi, setHi] = useState(() => Math.max(0, items.findIndex((i) => i.id === current)));
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const down = (e: PointerEvent) => box.current && !box.current.contains(e.target as Node) && onCancel();
    const id = window.setTimeout(() => document.addEventListener('pointerdown', down), 0);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener('pointerdown', down);
    };
  }, [onCancel]);
  useEffect(() => setHi(0), [q]);
  const key = (e: KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHi((h) => Math.min(shown.length - 1, h + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHi((h) => Math.max(0, h - 1));
    } else if (e.key === 'Enter' && shown[hi]) onPick(shown[hi].id);
    else if (e.key === 'Escape') onCancel();
  };
  return (
    <div ref={box} onKeyDown={key} className="w-[220px] rounded-lg border border-[var(--line)] bg-[var(--panel)] p-1 animate-scale-in" style={{ boxShadow: 'var(--pop)' }}>
      {searchable ? (
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" aria-label="Search" className="mb-1 h-7 w-full rounded-md bg-[var(--sub)] px-2 text-[13px] text-[var(--strong)] outline-none placeholder:text-[var(--faint)]" />
      ) : (
        <button autoFocus className="sr-only" aria-label="Options" />
      )}
      <div role="listbox" className="max-h-52 overflow-y-auto">
        {shown.map((i, n) => (
          <button
            key={i.id}
            type="button"
            role="option"
            aria-selected={i.id === current}
            onMouseEnter={() => setHi(n)}
            onClick={() => onPick(i.id)}
            className={cn('flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-[13px]', n === hi && 'bg-[var(--hover)]')}
          >
            <span className="min-w-0 flex-1">{i.node}</span>
            {i.id === current && <Check className="h-3.5 w-3.5 text-[var(--accent)]" />}
          </button>
        ))}
        {!shown.length && <p className="px-2 py-2 text-[12px] text-[var(--mute)]">No matches</p>}
      </div>
    </div>
  );
}

