import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Briefcase, Building2, Calendar, Check, ChevronDown, Copy, Linkedin, Mail, MapPin, MoreHorizontal, Phone, PhoneOff, Plus, Star, Tag, UserRound, X } from 'lucide-react';
import { cn } from '@/lib/cn';

export type Owner = { name: string; initials: string; color: string };

export type Person = {
  name: string;
  initials: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  city: string;
  linkedin: string;
  tags: string[];
  owner: Owner;
  created: string;
};

type TextKey = 'email' | 'phone' | 'city' | 'linkedin' | 'title';

export type PersonProfileProps = {
  person: Person;
  owners?: Owner[];
  onChange?: (person: Person) => void;
  /** Types a value into a field and saves it, as if a teammate edited it live. */
  autoType?: { field: TextKey; text: string } | null;
  className?: string;
};

const FIELDS: { key: TextKey; label: string; icon: typeof Mail }[] = [
  { key: 'email', label: 'Email', icon: Mail },
  { key: 'phone', label: 'Phone', icon: Phone },
  { key: 'title', label: 'Job title', icon: Briefcase },
  { key: 'city', label: 'City', icon: MapPin },
  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin },
];

function Avatar({ owner, size = 20 }: { owner: Owner; size?: number }) {
  return (
    <span className="grid shrink-0 place-items-center rounded-full font-semibold text-white" style={{ width: size, height: size, background: owner.color, fontSize: size * 0.4 }}>
      {owner.initials}
    </span>
  );
}

function Row({ icon: Icon, label, children }: { icon: typeof Mail; label: string; children: ReactNode }) {
  return (
    <div className="grid min-h-[36px] grid-cols-[104px_minmax(0,1fr)] items-center gap-2 sm:grid-cols-[124px_minmax(0,1fr)]">
      <span className="flex items-center gap-2 text-xs text-ink-500">
        <Icon className="h-3.5 w-3.5 shrink-0" />
        {label}
      </span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function EditableText({ value, field, autoType, onSave }: { value: string; field: TextKey; autoType?: string; onSave: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saved, setSaved] = useState(false);
  const [auto, setAuto] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const save = useRef(onSave);
  save.current = onSave;

  useEffect(() => {
    if (!autoType) return;
    setAuto(true);
    setEditing(true);
    setDraft('');
    let i = 0;
    let done = 0;
    const id = window.setInterval(() => {
      i += 1;
      setDraft(autoType.slice(0, i));
      if (i >= autoType.length) {
        clearInterval(id);
        done = window.setTimeout(() => {
          setEditing(false);
          setAuto(false);
          save.current(autoType);
          setSaved(true);
        }, 350);
      }
    }, 45);
    return () => {
      clearInterval(id);
      clearTimeout(done);
    };
  }, [autoType]);
  useEffect(() => {
    if (editing && !auto) input.current?.focus({ preventScroll: true });
  }, [editing, auto]);
  useEffect(() => {
    if (!saved) return;
    const id = window.setTimeout(() => setSaved(false), 1400);
    return () => clearTimeout(id);
  }, [saved]);

  const commit = () => {
    setEditing(false);
    if (draft.trim() && draft !== value) {
      onSave(draft.trim());
      setSaved(true);
    } else setDraft(value);
  };

  if (editing)
    return (
      <input
        ref={input}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => !auto && commit()}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') {
            setDraft(value);
            setEditing(false);
          }
        }}
        aria-label={field}
        className="h-8 w-full rounded-lg bg-ink-950 px-2 text-sm text-ink-50 outline-none ring-1 ring-brand-400/60 transition-shadow focus:ring-2"
      />
    );

  const link = field === 'email' || field === 'linkedin';
  return (
    <button
      onClick={() => {
        setDraft(value);
        setEditing(true);
      }}
      className="focus-ring group flex h-8 w-full min-w-0 items-center gap-2 rounded-lg px-2 text-left text-sm transition-colors hover:bg-white/[0.04]"
    >
      <span className={cn('truncate', link ? 'text-brand-300' : 'text-ink-100')}>{value}</span>
      {saved ? (
        <span className="ml-auto flex shrink-0 items-center gap-1 text-[11px] text-emerald-400 animate-fade-in">
          <Check className="h-3 w-3" /> Saved
        </span>
      ) : (
        <span className="ml-auto shrink-0 text-[11px] text-ink-500 opacity-0 transition-opacity group-hover:opacity-100">Edit</span>
      )}
    </button>
  );
}

export function PersonProfile({ person, owners = [], onChange, autoType, className }: PersonProfileProps) {
  const [fav, setFav] = useState(true);
  const [copied, setCopied] = useState(false);
  const [call, setCall] = useState<number | null>(null);
  const [menu, setMenu] = useState(false);
  const [ownerOpen, setOwnerOpen] = useState(false);
  const [tagDraft, setTagDraft] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (call === null) return;
    const t0 = performance.now() - call * 1000;
    const id = window.setInterval(() => setCall(Math.floor((performance.now() - t0) / 1000)), 500);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [call === null]);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 1400);
    return () => clearTimeout(id);
  }, [copied]);

  useEffect(() => {
    if (!menu && !ownerOpen) return;
    const close = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) {
        setMenu(false);
        setOwnerOpen(false);
      }
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [menu, ownerOpen]);

  const set = (patch: Partial<Person>) => onChange?.({ ...person, ...patch });
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(person.email);
    } catch {
      /* clipboard can be unavailable in iframes */
    }
    setCopied(true);
  };
  const addTag = () => {
    const t = tagDraft?.trim();
    if (t && !person.tags.includes(t)) set({ tags: [...person.tags, t] });
    setTagDraft(null);
  };

  return (
    <div ref={root} className={cn('w-full max-w-xl overflow-hidden rounded-2xl bg-ink-900 shadow-card', className)}>
      <div className="relative h-20 overflow-hidden border-b border-white/5" style={{ background: 'radial-gradient(120% 140% at 0% 0%, rgba(56,189,248,0.22), transparent 60%), radial-gradient(90% 120% at 100% 0%, rgba(129,140,248,0.16), transparent 60%)' }}>
        <div className="absolute inset-0 dot-bg opacity-60" />
      </div>
      <div className="px-4 pb-4 sm:px-5">
        <div className="-mt-9 flex items-end justify-between gap-3">
          <span className="relative grid h-[72px] w-[72px] shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-300 to-brand-700 text-2xl font-semibold text-white ring-4 ring-ink-900">
            {person.initials}
            <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-400 ring-[3px] ring-ink-900" title="Replied this week" />
          </span>
          <div className="relative flex flex-wrap justify-end gap-1.5">
            <button onClick={copy} className="focus-ring flex h-8 items-center gap-1.5 rounded-lg bg-white/[0.06] px-2.5 text-xs font-medium text-ink-100 transition-colors hover:bg-white/10" aria-label="Copy email address">
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Mail className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Email'}</span>
            </button>
            <button
              onClick={() => setCall((c) => (c === null ? 0 : null))}
              className={cn('focus-ring flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-colors', call === null ? 'bg-white/[0.06] text-ink-100 hover:bg-white/10' : 'bg-rose-500/15 text-rose-300 hover:bg-rose-500/25')}
              aria-label={call === null ? 'Call' : 'End call'}
            >
              {call === null ? <Phone className="h-3.5 w-3.5" /> : <PhoneOff className="h-3.5 w-3.5" />}
              {call === null ? <span className="hidden sm:inline">Call</span> : <span className="font-mono tabular-nums">{`${Math.floor(call / 60)}:${String(call % 60).padStart(2, '0')}`}</span>}
            </button>
            <button onClick={() => setMenu((m) => !m)} aria-label="More actions" aria-expanded={menu} className="focus-ring grid h-8 w-8 place-items-center rounded-lg bg-white/[0.06] text-ink-300 transition-colors hover:bg-white/10 hover:text-ink-100">
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {menu && (
              <div role="menu" className="absolute right-0 top-10 z-20 w-44 rounded-xl bg-ink-850 p-1 shadow-pop animate-scale-in">
                {['Merge duplicate', 'Export as vCard', 'Add to sequence', 'Delete'].map((m) => (
                  <button key={m} role="menuitem" onClick={() => setMenu(false)} className={cn('focus-ring flex w-full rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-white/5', m === 'Delete' ? 'text-rose-300' : 'text-ink-200')}>
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-semibold tracking-tight text-ink-50">{person.name}</h3>
            <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-sm text-ink-400">
              <span className="truncate">{person.title}</span>
              <span className="text-ink-600">@</span>
              <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.06] px-1.5 py-0.5 text-xs text-ink-200">
                <Building2 className="h-3 w-3 text-brand-300" /> {person.company}
              </span>
            </p>
          </div>
          <button onClick={() => setFav((f) => !f)} aria-label={fav ? 'Remove from favorites' : 'Add to favorites'} aria-pressed={fav} className="focus-ring grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-white/5">
            <Star className={cn('h-4 w-4 transition-all duration-300 ease-spring', fav ? 'scale-110 fill-amber-300 text-amber-300' : 'scale-100')} />
          </button>
        </div>

        <div className="mt-4 space-y-0.5 border-t border-white/5 pt-3">
          {FIELDS.map((f) => (
            <Row key={f.key} icon={f.icon} label={f.label}>
              <EditableText field={f.key} value={person[f.key]} autoType={autoType?.field === f.key ? autoType.text : undefined} onSave={(v) => set({ [f.key]: v } as Partial<Person>)} />
            </Row>
          ))}
          <Row icon={Tag} label="Tags">
            <div className="flex flex-wrap items-center gap-1 px-2 py-1">
              {person.tags.map((t) => (
                <span key={t} className="group inline-flex items-center gap-1 rounded-md bg-brand-500/10 py-0.5 pl-1.5 pr-1 text-xs text-brand-200 animate-scale-in">
                  {t}
                  <button onClick={() => set({ tags: person.tags.filter((x) => x !== t) })} aria-label={`Remove tag ${t}`} className="rounded text-brand-300/60 transition-colors hover:text-brand-100">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {tagDraft === null ? (
                <button onClick={() => setTagDraft('')} className="focus-ring inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs text-ink-500 transition-colors hover:bg-white/5 hover:text-ink-200">
                  <Plus className="h-3 w-3" /> Add
                </button>
              ) : (
                <input
                  autoFocus
                  value={tagDraft}
                  onChange={(e) => setTagDraft(e.target.value)}
                  onBlur={addTag}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addTag();
                    if (e.key === 'Escape') setTagDraft(null);
                  }}
                  placeholder="New tag"
                  aria-label="New tag"
                  className="h-6 w-24 rounded-md bg-ink-950 px-1.5 text-xs text-ink-50 outline-none ring-1 ring-brand-400/60"
                />
              )}
            </div>
          </Row>
          <Row icon={UserRound} label="Owner">
            <div className="relative">
              <button onClick={() => setOwnerOpen((o) => !o)} aria-haspopup="listbox" aria-expanded={ownerOpen} className="focus-ring flex h-8 items-center gap-2 rounded-lg px-2 text-sm text-ink-100 transition-colors hover:bg-white/[0.04]">
                <Avatar owner={person.owner} />
                <span className="truncate">{person.owner.name}</span>
                <ChevronDown className="h-3.5 w-3.5 text-ink-500" />
              </button>
              {ownerOpen && (
                <div role="listbox" aria-label="Owner" className="absolute left-0 top-9 z-20 w-48 rounded-xl bg-ink-850 p-1 shadow-pop animate-scale-in">
                  {owners.map((o) => (
                    <button
                      key={o.name}
                      role="option"
                      aria-selected={o.name === person.owner.name}
                      onClick={() => {
                        set({ owner: o });
                        setOwnerOpen(false);
                      }}
                      className="focus-ring flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs text-ink-200 transition-colors hover:bg-white/5"
                    >
                      <Avatar owner={o} size={18} />
                      <span className="flex-1 truncate">{o.name}</span>
                      {o.name === person.owner.name && <Check className="h-3.5 w-3.5 text-brand-300" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Row>
          <Row icon={Calendar} label="Created">
            <span className="block truncate px-2 text-sm text-ink-400">{person.created}</span>
          </Row>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/5 pt-3 text-[11px] text-ink-500">
          <span className="truncate">Last reply 2h ago · synced from email</span>
          <button onClick={copy} className="focus-ring flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 transition-colors hover:bg-white/5 hover:text-ink-200">
            <Copy className="h-3 w-3" /> Copy email
          </button>
        </div>
      </div>
    </div>
  );
}

const OWNERS: Owner[] = [
  { name: 'Lena Brooks', initials: 'LB', color: '#0ea5e9' },
  { name: 'Marcus Webb', initials: 'MW', color: '#8b5cf6' },
  { name: 'Priya Raman', initials: 'PR', color: '#10b981' },
];

const SAMPLE: Person = {
  name: 'Sofia Andersen',
  initials: 'SA',
  title: 'VP of Operations',
  company: 'Halcyon Freight',
  email: 'sofia@halcyonfreight.io',
  phone: '+1 (415) 555-0142',
  city: 'Oakland, CA',
  linkedin: 'in/sofia-andersen',
  tags: ['Decision maker', 'Q4 pilot'],
  owner: OWNERS[0],
  created: 'Mar 14, 2026 · via web form',
};

export function PersonProfileDemo() {
  const [person, setPerson] = useState(SAMPLE);
  const [autoType, setAutoType] = useState<PersonProfileProps['autoType']>(null);

  // Auto-play once: type a new city and save it, as if a teammate edited the record live.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setTimeout(() => setAutoType({ field: 'city', text: 'Lisbon, Portugal' }), 800);
    return () => clearTimeout(id);
  }, []);

  return <PersonProfile person={person} owners={OWNERS} onChange={setPerson} autoType={autoType} />;
}
