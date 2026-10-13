import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, AudioLines, CalendarClock, Check, Code2, FileText, Globe2, Image as ImageIcon, ListChecks, Loader2, Search, ThumbsUp, Video, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Reveal } from '@/pages/landing/shared/motion';
import { DATASETS, TABS, type Dataset, type Modality } from './catalogData';
import { Button, Chip, Container, SectionHeading } from './ui';

const ICONS: Record<Modality, typeof FileText> = { Text: FileText, Code: Code2, Image: ImageIcon, Audio: AudioLines, Video: Video, RLHF: ThumbsUp, Eval: ListChecks };

function Sparkline({ data, className }: { data: number[]; className?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${28 - ((v - min) / (max - min || 1)) * 24}`).join(' ');
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className={cn('h-8 w-full', className)}>
      <defs>
        <linearGradient id="cx-spark" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgb(94 234 212)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="rgb(94 234 212)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,30 ${pts} 100,30`} fill="url(#cx-spark)" />
      <polyline points={pts} fill="none" stroke="rgb(94 234 212)" strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function DatasetCard({ d, index, onOpen }: { d: Dataset; index: number; onOpen: () => void }) {
  const Icon = ICONS[d.modality];
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative flex animate-scale-in flex-col rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 text-left transition-all duration-500 ease-smooth hover:-translate-y-1 hover:border-teal-300/30 hover:bg-white/[0.04] hover:shadow-[0_24px_60px_-20px_rgba(94,234,212,0.2)]"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start justify-between">
        <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-zinc-200 transition-colors group-hover:border-teal-300/30 group-hover:text-teal-200">
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
        </span>
        <Chip tone={d.license === 'Commercial' ? 'teal' : 'amber'}>{d.license}</Chip>
      </div>
      <h3 className="mt-5 text-lg font-medium text-white">{d.name}</h3>
      <p className="mt-1 font-mono text-xs text-zinc-400">
        {d.size} · {d.records}
      </p>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-400">
        <span className="inline-flex items-center gap-1.5"><Globe2 className="h-3.5 w-3.5" />{d.languages}</span>
        <span className="inline-flex items-center gap-1.5"><CalendarClock className="h-3.5 w-3.5" />{d.freshness}</span>
      </div>
      <Sparkline data={d.spark} className="mt-5 opacity-70 transition-opacity group-hover:opacity-100" />
      <div className="mt-4">
        <div className="flex items-center justify-between font-mono text-[10.5px] uppercase tracking-wider text-zinc-500">
          <span>Quality index</span>
          <span className="text-zinc-300">{d.quality}</span>
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.06]">
          <div className="h-full rounded-full bg-gradient-to-r from-teal-300 to-emerald-200 transition-all duration-1000 ease-smooth" style={{ width: `${d.quality}%` }} />
        </div>
      </div>
      <ArrowUpRight className="absolute right-6 top-[4.5rem] h-4 w-4 text-zinc-500 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-teal-200 group-hover:opacity-100" />
    </button>
  );
}

function Drawer({ d, onClose }: { d: Dataset; onClose: () => void }) {
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle');
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  useEffect(() => {
    if (state !== 'loading') return;
    const t = window.setTimeout(() => setState('done'), 1400);
    return () => window.clearTimeout(t);
  }, [state]);
  const Icon = ICONS[d.modality];
  return (
    <div className="fixed inset-0 z-[100] flex justify-end" role="dialog" aria-modal="true" aria-label={d.name}>
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 animate-fade-in bg-black/70 backdrop-blur-sm" />
      <aside className="relative flex h-full w-full max-w-xl animate-slide-in-right flex-col overflow-y-auto border-l border-white/10 bg-[#0A0D0E] shadow-2xl">
        <div className="dither-dots pointer-events-none absolute inset-x-0 top-0 h-48 [mask-image:linear-gradient(black,transparent)]" />
        <div className="relative flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
          <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-zinc-400">
            <Icon className="h-3.5 w-3.5" /> {d.modality} · {d.id}
          </span>
          <button type="button" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-zinc-300 transition hover:border-white/25 hover:text-white" aria-label="Close drawer">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="relative space-y-8 p-6">
          <div>
            <div className="flex flex-wrap gap-2">
              <Chip tone={d.license === 'Commercial' ? 'teal' : 'amber'}>{d.license} license</Chip>
              <Chip>{d.languages}</Chip>
              <Chip>{d.freshness}</Chip>
            </div>
            <h3 className="mt-4 font-serif text-4xl leading-tight text-white">{d.name}</h3>
            <p className="mt-3 leading-relaxed text-zinc-400">{d.description}</p>
          </div>
          <div className="grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.06]">
            {[['Volume', d.size], ['Records', d.records], ['Quality', `${d.quality}/100`]].map(([k, v]) => (
              <div key={k} className="bg-[#0A0D0E] p-4">
                <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">{k}</div>
                <div className="mt-1 text-sm text-white">{v}</div>
              </div>
            ))}
          </div>
          <div>
            <h4 className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-400">Schema</h4>
            <div className="mt-3 overflow-hidden rounded-xl border border-white/[0.06]">
              <table className="w-full text-left text-sm">
                <tbody>
                  {d.schema.map(([f, t, desc]) => (
                    <tr key={f} className="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02]">
                      <td className="px-4 py-2.5 font-mono text-xs text-teal-200">{f}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-amber-200/90">{t}</td>
                      <td className="px-4 py-2.5 text-xs text-zinc-400">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <h4 className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-400">Sample record</h4>
            <pre className="mt-3 overflow-x-auto rounded-xl border border-white/[0.06] bg-black/40 p-4 font-mono text-[11.5px] leading-relaxed text-zinc-300">
              {JSON.stringify(d.sample, null, 2)}
            </pre>
          </div>
          <div className="flex flex-col gap-4 rounded-xl border border-teal-300/20 bg-teal-300/[0.05] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="font-mono text-[10.5px] uppercase tracking-wider text-teal-200/80">Indicative pricing</div>
              <div className="mt-1 text-white">{d.price}</div>
            </div>
            <Button onClick={() => state === 'idle' && setState('loading')} disabled={state === 'loading'} className={cn(state === 'done' && 'bg-emerald-200')}>
              {state === 'idle' && 'Request sample'}
              {state === 'loading' && (<><Loader2 className="h-4 w-4 animate-spin" /> Preparing…</>)}
              {state === 'done' && (<><Check className="h-4 w-4" /> Sample link sent</>)}
            </Button>
          </div>
          {state === 'done' && (
            <p className="animate-fade-up text-sm leading-relaxed text-zinc-400">
              A signed 1,000-record sample with its license receipts will arrive in your inbox within minutes. Link expires in 72 hours.
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}

export function CorpusCatalog() {
  const [tab, setTab] = useState<(typeof TABS)[number]>('All');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<Dataset | null>(null);
  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return DATASETS.filter((d) => (tab === 'All' || d.modality === tab) && (!term || `${d.name} ${d.description} ${d.languages}`.toLowerCase().includes(term)));
  }, [tab, q]);
  return (
    <section id="catalog" className="relative scroll-mt-20 py-24 sm:py-32">
      <Container>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <Reveal>
            <SectionHeading
              eyebrow="01 — Catalog"
              title={<>A licensed library, <em className="italic text-teal-100">ready to ship.</em></>}
              sub="Over 340 production datasets with clean provenance. Filter by modality, inspect schemas, and pull a signed sample in minutes."
            />
          </Reveal>
          <Reveal delay={100} className="w-full lg:w-80">
            <label className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 transition focus-within:border-teal-300/40 focus-within:bg-white/[0.05]">
              <Search className="h-4 w-4 text-zinc-500" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search datasets, languages…" className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none" />
              {q && (
                <button type="button" onClick={() => setQ('')} aria-label="Clear search" className="text-zinc-500 hover:text-white">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </label>
          </Reveal>
        </div>
        <div className="mt-10 flex gap-1 overflow-x-auto rounded-full border border-white/[0.07] bg-white/[0.02] p-1 [scrollbar-width:none] sm:inline-flex">
          {TABS.map((t) => {
            const count = t === 'All' ? DATASETS.length : DATASETS.filter((d) => d.modality === t).length;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={cn('relative shrink-0 rounded-full px-4 py-1.5 text-sm transition-all duration-300 ease-smooth', tab === t ? 'bg-white text-[#07090A]' : 'text-zinc-400 hover:text-white')}
              >
                {t}
                <span className={cn('ml-1.5 font-mono text-[10px]', tab === t ? 'text-zinc-600' : 'text-zinc-500')}>{count}</span>
              </button>
            );
          })}
        </div>
        <div key={`${tab}-${q}`} className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((d, i) => (
            <DatasetCard key={d.id} d={d} index={i} onOpen={() => setOpen(d)} />
          ))}
          {list.length === 0 && (
            <div className="col-span-full animate-fade-in rounded-2xl border border-dashed border-white/10 p-12 text-center text-zinc-400">
              No datasets match "{q}". We can collect it for you —{' '}
              <button type="button" className="text-teal-200 underline-offset-4 hover:underline" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
                request a custom collection
              </button>
              .
            </div>
          )}
        </div>
      </Container>
      {open && <Drawer d={open} onClose={() => setOpen(null)} />}
    </section>
  );
}
