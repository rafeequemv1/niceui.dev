import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Building2, Calendar, Check, CircleDollarSign, Globe, LoaderCircle, MapPin, Sparkles, Users } from 'lucide-react';
import { cn } from '@/lib/cn';

export type CompanyFieldKey = 'employees' | 'arr' | 'hq' | 'founded';
export type CompanyDeal = { name: string; stage: string; amount: string; tone: 'sky' | 'amber' | 'emerald' | 'violet' };
export type CompanyPerson = { name: string; initials: string; color: string };

export type Company = {
  name: string;
  domain: string;
  industry: string;
  monogram: string;
  /** Firmographics; empty fields can be filled by Enrich. */
  fields: Partial<Record<CompanyFieldKey, string>>;
  icp: number;
  people: CompanyPerson[];
  deals: CompanyDeal[];
};

export type CompanyCardProps = {
  company: Company;
  /** Values Enrich fills in for empty fields, in order. */
  enrichment?: Partial<Record<CompanyFieldKey, string>>;
  sources?: string[];
  /** Start enriching automatically after this many ms. */
  autoEnrich?: number;
  className?: string;
};

const FIELD_META: { key: CompanyFieldKey; label: string; icon: typeof Users }[] = [
  { key: 'employees', label: 'Employees', icon: Users },
  { key: 'arr', label: 'Annual revenue', icon: CircleDollarSign },
  { key: 'hq', label: 'Headquarters', icon: MapPin },
  { key: 'founded', label: 'Founded', icon: Calendar },
];

const TONE: Record<CompanyDeal['tone'], string> = {
  sky: 'bg-sky-500/10 text-sky-300',
  amber: 'bg-amber-500/10 text-amber-300',
  emerald: 'bg-emerald-500/10 text-emerald-300',
  violet: 'bg-violet-500/10 text-violet-300',
};

function FitRing({ value }: { value: number }) {
  const r = 17;
  const c = 2 * Math.PI * r;
  const tone = value >= 75 ? '#34d399' : value >= 50 ? '#fbbf24' : '#fb7185';
  return (
    <span className="relative grid h-11 w-11 shrink-0 place-items-center">
      <svg viewBox="0 0 40 40" className="absolute inset-0 -rotate-90">
        <circle cx="20" cy="20" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
        <circle cx="20" cy="20" r={r} fill="none" stroke={tone} strokeWidth="4" strokeLinecap="round" strokeDasharray={`${(value / 100) * c} ${c}`} className="transition-[stroke-dasharray] duration-1000 ease-smooth" />
      </svg>
      <span className="font-mono text-xs font-semibold tabular-nums text-ink-50">{value}</span>
    </span>
  );
}

export function CompanyCard({ company, enrichment = {}, sources = [], autoEnrich, className }: CompanyCardProps) {
  const [fields, setFields] = useState(company.fields);
  const [enriched, setEnriched] = useState<Set<CompanyFieldKey>>(new Set());
  const [pending, setPending] = useState<CompanyFieldKey | null>(null);
  const [state, setState] = useState<'idle' | 'running' | 'done'>('idle');
  const [icp, setIcp] = useState(company.icp);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const missing = FIELD_META.filter((f) => !fields[f.key] && enrichment[f.key]).map((f) => f.key);

  const enrich = () => {
    if (state !== 'idle' || !missing.length) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setFields((f) => ({ ...f, ...enrichment }));
      setEnriched(new Set(missing));
      setIcp((v) => Math.min(99, v + 9));
      setState('done');
      return;
    }
    setState('running');
    missing.forEach((key, i) => {
      timers.current.push(window.setTimeout(() => setPending(key), i * 520));
      timers.current.push(
        window.setTimeout(() => {
          setFields((f) => ({ ...f, [key]: enrichment[key] }));
          setEnriched((s) => new Set(s).add(key));
          setPending(null);
        }, i * 520 + 440),
      );
    });
    timers.current.push(
      window.setTimeout(() => {
        setIcp((v) => Math.min(99, v + 9));
        setState('done');
      }, missing.length * 520 + 120),
    );
  };

  const enrichRef = useRef(enrich);
  enrichRef.current = enrich;
  useEffect(() => {
    if (autoEnrich === undefined) return;
    const id = window.setTimeout(() => enrichRef.current(), autoEnrich);
    return () => clearTimeout(id);
  }, [autoEnrich]);

  const pipeline = company.deals.reduce((s, d) => s + Number(d.amount.replace(/[^0-9.]/g, '')), 0);

  return (
    <div className={cn('w-full max-w-xl rounded-2xl bg-ink-900 p-4 shadow-card sm:p-5', className)}>
      <div className="flex items-start gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-400 to-indigo-700 text-lg font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">{company.monogram}</span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold tracking-tight text-ink-50">{company.name}</h3>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-400">
            <a href="#" onClick={(e) => e.preventDefault()} className="focus-ring inline-flex items-center gap-1 rounded text-brand-300 hover:text-brand-200">
              <Globe className="h-3 w-3" /> {company.domain}
            </a>
            <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.06] px-1.5 py-0.5 text-ink-300">
              <Building2 className="h-3 w-3" /> {company.industry}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2" title="Ideal customer profile fit">
          <FitRing value={icp} />
          <span className="hidden text-[11px] leading-tight text-ink-500 sm:block">
            ICP fit
            <br />
            <span className={cn(icp >= 75 ? 'text-emerald-300' : 'text-amber-300')}>{icp >= 75 ? 'Strong' : 'Medium'}</span>
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {FIELD_META.map(({ key, label, icon: Icon }) => {
          const value = fields[key];
          const loading = pending === key;
          return (
            <div key={key} className={cn('relative min-w-0 overflow-hidden rounded-xl border px-3 py-2.5 transition-colors duration-500', enriched.has(key) ? 'border-brand-400/30 bg-brand-500/[0.06]' : 'border-white/5 bg-white/[0.02]')}>
              <p className="flex items-center gap-1.5 text-[11px] text-ink-500">
                <Icon className="h-3 w-3" /> {label}
              </p>
              <p className="mt-1 flex min-w-0 items-center gap-1.5 text-sm">
                {loading ? (
                  <span className="shimmer-text truncate font-medium">Looking up…</span>
                ) : value ? (
                  <span key={value} className="truncate font-medium text-ink-50 animate-fade-in">
                    {value}
                  </span>
                ) : (
                  <span className="text-ink-600">Empty</span>
                )}
                {enriched.has(key) && (
                  <span className="ml-auto inline-flex shrink-0 items-center gap-0.5 rounded bg-brand-500/15 px-1 py-px text-[9.5px] font-medium text-brand-200 animate-scale-in">
                    <Sparkles className="h-2.5 w-2.5" /> AI
                  </span>
                )}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          onClick={enrich}
          disabled={state !== 'idle' || !missing.length}
          className={cn(
            'focus-ring inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition-all active:scale-95',
            state === 'done' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-brand-500 text-white hover:bg-brand-400 disabled:opacity-80',
          )}
        >
          {state === 'running' ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : state === 'done' ? <Check className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
          {state === 'running' ? 'Enriching…' : state === 'done' ? `Enriched ${enriched.size} fields` : `Enrich ${missing.length} empty fields`}
        </button>
        {state === 'done' && sources.length > 0 && (
          <span className="flex min-w-0 flex-wrap items-center gap-1 text-[11px] text-ink-500 animate-fade-in">
            from
            {sources.map((s) => (
              <span key={s} className="rounded-md bg-white/[0.05] px-1.5 py-0.5 text-ink-300">
                {s}
              </span>
            ))}
          </span>
        )}
      </div>

      <div className="mt-4 grid gap-4 border-t border-white/5 pt-4 sm:grid-cols-[auto_minmax(0,1fr)]">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-ink-500">People</p>
          <div className="mt-2 flex items-center">
            {company.people.slice(0, 4).map((p, i) => (
              <span key={p.name} title={p.name} className="grid h-8 w-8 place-items-center rounded-full text-[11px] font-semibold text-white ring-2 ring-ink-900" style={{ background: p.color, marginLeft: i ? -8 : 0 }}>
                {p.initials}
              </span>
            ))}
            {company.people.length > 4 && <span className="-ml-2 grid h-8 w-8 place-items-center rounded-full bg-ink-800 text-[11px] text-ink-300 ring-2 ring-ink-900">+{company.people.length - 4}</span>}
          </div>
        </div>
        <div className="min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium uppercase tracking-wider text-ink-500">Open deals</p>
            <span className="font-mono text-[11px] tabular-nums text-ink-400">${pipeline.toLocaleString()}k pipeline</span>
          </div>
          <ul className="mt-2 space-y-1">
            {company.deals.map((d) => (
              <li key={d.name}>
                <a href="#" onClick={(e) => e.preventDefault()} className="focus-ring group flex min-w-0 items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-white/[0.04]">
                  <span className="min-w-0 flex-1 truncate text-ink-100">{d.name}</span>
                  <span className={cn('shrink-0 rounded-md px-1.5 py-0.5 text-[10.5px] font-medium', TONE[d.tone])}>{d.stage}</span>
                  <span className="w-12 shrink-0 text-right font-mono text-xs tabular-nums text-ink-300">{d.amount}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-ink-600 transition-colors group-hover:text-ink-300" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

const DEMO: Company = {
  name: 'Lumenfield Analytics',
  domain: 'lumenfield.io',
  industry: 'Data infrastructure',
  monogram: 'L',
  fields: { employees: '180–250', arr: undefined, hq: undefined, founded: undefined },
  icp: 74,
  people: [
    { name: 'Aiden Park', initials: 'AP', color: '#0ea5e9' },
    { name: 'Noor Haddad', initials: 'NH', color: '#8b5cf6' },
    { name: 'Tomás Reyes', initials: 'TR', color: '#f59e0b' },
    { name: 'Wren Calloway', initials: 'WC', color: '#10b981' },
    { name: 'Iris Moreau', initials: 'IM', color: '#ef4444' },
    { name: 'Dev Patel', initials: 'DP', color: '#64748b' },
  ],
  deals: [
    { name: 'Platform expansion', stage: 'Proposal', amount: '$84k', tone: 'amber' },
    { name: 'Analytics add-on', stage: 'Discovery', amount: '$22k', tone: 'sky' },
    { name: 'EU data residency', stage: 'Negotiation', amount: '$36k', tone: 'violet' },
  ],
};

export function CompanyCardDemo() {
  return (
    <CompanyCard
      company={DEMO}
      enrichment={{ arr: '$38M', hq: 'Austin, TX', founded: '2017' }}
      sources={['Company site', 'Public filings', 'Press']}
      autoEnrich={900}
    />
  );
}
