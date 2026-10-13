import { useEffect, useState } from 'react';
import { BadgeCheck, CheckCircle2, CloudUpload, Copy, FileSignature, Globe, ScanEye, ShieldCheck, Tags, UserRound } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Reveal, useInView } from '@/pages/landing/shared/motion';
import { Container, Panel, SectionHeading } from './ui';

function useArm(delay = 80) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setOn(true), delay);
    return () => window.clearTimeout(t);
  }, [delay]);
  return on;
}

function SourcingVis() {
  const on = useArm();
  const srcs = ['Publishers', 'Repos', 'Studios', 'Annotators', 'Archives', 'Creators'];
  return (
    <div className="relative grid h-full grid-cols-[1fr_auto] items-center gap-6">
      <div className="space-y-2">
        {srcs.map((s, i) => (
          <div key={s} className={cn('flex items-center gap-3 transition-all duration-700 ease-smooth', on ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0')} style={{ transitionDelay: `${i * 90}ms` }}>
            <span className="w-24 font-mono text-[11px] text-zinc-400">{s}</span>
            <span className="relative h-px flex-1 overflow-hidden bg-white/10">
              <span className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-teal-300 to-transparent bg-[length:200%_100%]" style={{ animationDelay: `${i * 0.3}s` }} />
            </span>
          </div>
        ))}
      </div>
      <div className={cn('grid h-24 w-24 place-items-center rounded-2xl border border-teal-300/30 bg-teal-300/10 transition-all duration-700 ease-spring', on ? 'scale-100' : 'scale-75')}>
        <Globe className="h-8 w-8 text-teal-200" strokeWidth={1.25} />
      </div>
    </div>
  );
}

function LicensingVis() {
  const on = useArm();
  const rows = ['Rights holder verified', 'Commercial use granted', 'Subject consent on file', 'Opt-out honoured'];
  return (
    <div className="mx-auto w-full max-w-sm rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] text-zinc-400">rcpt_4b1e9a</span>
        <FileSignature className="h-4 w-4 text-amber-200" />
      </div>
      <div className="mt-4 space-y-2.5">
        {rows.map((r, i) => (
          <div key={r} className={cn('flex items-center gap-2.5 text-sm transition-all duration-500', on ? 'text-zinc-200 opacity-100' : 'text-zinc-500 opacity-40')} style={{ transitionDelay: `${300 + i * 350}ms` }}>
            <CheckCircle2 className={cn('h-4 w-4 transition-colors duration-500', on ? 'text-teal-300' : 'text-zinc-600')} style={{ transitionDelay: `${300 + i * 350}ms` }} />
            {r}
          </div>
        ))}
      </div>
      <div className={cn('mt-5 inline-flex rotate-[-6deg] rounded border-2 border-amber-300/70 px-3 py-1 font-mono text-xs uppercase tracking-widest text-amber-200 transition-all duration-500 ease-spring', on ? 'scale-100 opacity-100' : 'scale-150 opacity-0')} style={{ transitionDelay: '1800ms' }}>
        Licensed
      </div>
    </div>
  );
}

function DedupeVis() {
  const on = useArm(300);
  const recs = ['The quick brown fox jumps…', 'The quick brown fox jumps…', 'the quick brown fox jumps!', 'The quick brown fox jumped…', 'A lazy dog sleeps in sun…'];
  return (
    <div className="relative mx-auto h-56 w-full max-w-sm">
      {recs.map((r, i) => {
        const dup = i < 4;
        return (
          <div
            key={i}
            className={cn('absolute left-0 right-0 flex items-center justify-between rounded-lg border px-3 py-2 font-mono text-[11px] transition-all duration-1000 ease-smooth', dup ? 'border-white/10 bg-white/[0.03] text-zinc-300' : 'border-teal-300/30 bg-teal-300/[0.06] text-teal-100', on && dup && i > 0 && 'opacity-0')}
            style={{ top: on && dup ? '30%' : `${i * 20}%`, transitionDelay: `${i * 120}ms` }}
          >
            <span className="truncate">{r}</span>
            <span className="ml-2 shrink-0 text-zinc-500">{dup ? `sim ${(0.99 - i * 0.03).toFixed(2)}` : 'unique'}</span>
          </div>
        );
      })}
      <div className={cn('absolute bottom-0 left-0 flex items-center gap-2 font-mono text-[11px] text-teal-200 transition-opacity duration-500', on ? 'opacity-100' : 'opacity-0')} style={{ transitionDelay: '1200ms' }}>
        <Copy className="h-3.5 w-3.5" /> 3 near-duplicates collapsed · MinHash + embedding
      </div>
    </div>
  );
}

function PiiVis() {
  const on = useArm(300);
  const parts: [string, boolean][] = [['Hi, I\'m ', false], ['Maria Okafor', true], [', reach me at ', false], ['maria.o@mail.com', true], [' or ', false], ['+1 415 555 0182', true], ['. My order shipped to ', false], ['221 Elm St', true], [' last week.', false]];
  let k = 0;
  return (
    <div className="mx-auto max-w-md rounded-xl border border-white/10 bg-white/[0.03] p-5 text-[15px] leading-loose text-zinc-300">
      {parts.map(([t, pii], i) => {
        if (!pii) return <span key={i}>{t}</span>;
        const d = 200 + k++ * 300;
        return (
          <span key={i} className="relative inline-block">
            <span className={cn('transition-opacity duration-300', on ? 'opacity-0' : 'opacity-100')} style={{ transitionDelay: `${d + 300}ms` }}>{t}</span>
            <span className={cn('absolute inset-y-1 left-0 origin-left rounded-sm bg-zinc-200 transition-transform duration-500 ease-smooth', on ? 'scale-x-100' : 'scale-x-0')} style={{ right: 0, transitionDelay: `${d}ms` }} />
          </span>
        );
      })}
      <div className="mt-4 flex flex-wrap gap-2 font-mono text-[10.5px] text-amber-200">
        {['PERSON', 'EMAIL', 'PHONE', 'ADDRESS'].map((l) => <span key={l} className="rounded border border-amber-300/25 px-1.5 py-0.5">{l}</span>)}
      </div>
    </div>
  );
}

function LabelVis() {
  const on = useArm();
  const people = [['Dr. A. Rao', 'Cardiology', 'diagnosis: correct'], ['J. Lindqvist', 'Rust engineer', 'bug: off-by-one'], ['M. Tanaka', 'Translator · JA', 'fluency: 5/5']];
  return (
    <div className="mx-auto w-full max-w-md space-y-3">
      {people.map(([n, role, label], i) => (
        <div key={n} className={cn('flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 transition-all duration-700 ease-smooth', on ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0')} style={{ transitionDelay: `${i * 200}ms` }}>
          <span className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.04]"><UserRound className="h-4 w-4 text-zinc-300" /></span>
          <div className="min-w-0 flex-1">
            <div className="text-sm text-white">{n}</div>
            <div className="font-mono text-[10.5px] text-zinc-500">{role}</div>
          </div>
          <span className={cn('rounded-full border border-teal-300/30 bg-teal-300/10 px-2.5 py-1 font-mono text-[10.5px] text-teal-200 transition-all duration-500 ease-spring', on ? 'scale-100 opacity-100' : 'scale-75 opacity-0')} style={{ transitionDelay: `${600 + i * 250}ms` }}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

function QaVis() {
  const on = useArm(200);
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
      <div className="relative h-36 w-36">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
          <circle cx="60" cy="60" r={r} fill="none" stroke="rgb(94 234 212)" strokeWidth="6" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={on ? c * 0.003 : c} className="transition-[stroke-dashoffset] duration-[1800ms] ease-smooth" />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div><div className="font-serif text-3xl text-white">99.7%</div><div className="font-mono text-[10px] text-zinc-500">agreement</div></div>
        </div>
      </div>
      <ul className="space-y-2 text-sm text-zinc-300">
        {['Gold-set injection 5%', 'Triple adjudication', 'Blind audit by 2nd vendor', 'Drift monitoring'].map((x, i) => (
          <li key={x} className={cn('flex items-center gap-2 transition-all duration-500', on ? 'opacity-100' : 'opacity-0')} style={{ transitionDelay: `${400 + i * 200}ms` }}>
            <BadgeCheck className="h-4 w-4 text-teal-300" />{x}
          </li>
        ))}
      </ul>
    </div>
  );
}

function DeliveryVis() {
  const on = useArm(200);
  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      {[['s3://lab-bucket/corpus/', '2.4 TB'], ['gs://train-data/polyglot/', '880 GB'], ['hf://org/private-mirror', '120 GB']].map(([d, s], i) => (
        <div key={d}>
          <div className="flex justify-between font-mono text-[11px] text-zinc-400"><span>{d}</span><span>{s}</span></div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full rounded-full bg-gradient-to-r from-teal-300 to-amber-200 transition-[width] duration-[2200ms] ease-smooth" style={{ width: on ? '100%' : '0%', transitionDelay: `${i * 300}ms` }} />
          </div>
        </div>
      ))}
      <div className={cn('flex items-center gap-2 font-mono text-[11px] text-teal-200 transition-opacity duration-500', on ? 'opacity-100' : 'opacity-0')} style={{ transitionDelay: '2400ms' }}>
        <CheckCircle2 className="h-4 w-4" /> Checksums verified · manifest signed
      </div>
    </div>
  );
}

const STEPS = [
  { title: 'Sourcing', icon: Globe, body: 'Direct agreements with 1,400+ publishers, studios, repositories and contributor networks.', Vis: SourcingVis },
  { title: 'Licensing & consent', icon: FileSignature, body: 'Every record is bound to a rights receipt and, where people are involved, explicit consent.', Vis: LicensingVis },
  { title: 'Deduplication', icon: Copy, body: 'Exact, near-duplicate and semantic dedupe across your existing corpora, not just ours.', Vis: DedupeVis },
  { title: 'PII scrubbing', icon: ScanEye, body: 'Multi-pass detection across 40 entity types with human review on ambiguous spans.', Vis: PiiVis },
  { title: 'Expert labeling', icon: Tags, body: '38,000 vetted specialists — physicians, engineers, lawyers, linguists — not crowd clicks.', Vis: LabelVis },
  { title: 'QA', icon: ShieldCheck, body: 'Gold sets, triple adjudication and independent audits before anything leaves the building.', Vis: QaVis },
  { title: 'Delivery', icon: CloudUpload, body: 'Sharded, checksummed and streamed to your bucket with a signed manifest.', Vis: DeliveryVis },
];

const STEP_MS = 4200;

export function CorpusPipeline() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  useEffect(() => {
    if (!inView || paused) return;
    const t = window.setTimeout(() => setActive((a) => (a + 1) % STEPS.length), STEP_MS);
    return () => window.clearTimeout(t);
  }, [active, inView, paused]);
  const Vis = STEPS[active].Vis;
  return (
    <section id="pipeline" className="relative scroll-mt-20 border-t border-white/[0.06] py-24 sm:py-32">
      <Container>
        <Reveal>
          <SectionHeading eyebrow="03 — Pipeline" title={<>Seven gates between the world and <em className="italic text-teal-100">your weights.</em></>} sub="Every dataset passes the same audited pipeline. Nothing is scraped, nothing is skipped." />
        </Reveal>
        <div ref={ref} className="mt-14 grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <ol className="space-y-1">
            {STEPS.map(({ title, icon: Icon, body }, i) => {
              const on = i === active;
              return (
                <li key={title}>
                  <button type="button" onClick={() => setActive(i)} className={cn('relative w-full overflow-hidden rounded-xl border px-4 py-3.5 text-left transition-all duration-500 ease-smooth', on ? 'border-white/10 bg-white/[0.04]' : 'border-transparent hover:bg-white/[0.02]')}>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[11px] text-zinc-500">0{i + 1}</span>
                      <Icon className={cn('h-4 w-4 transition-colors', on ? 'text-teal-200' : i < active ? 'text-teal-300/60' : 'text-zinc-500')} />
                      <span className={cn('text-[15px] transition-colors', on ? 'text-white' : 'text-zinc-400')}>{title}</span>
                    </div>
                    <div className={cn('grid transition-all duration-500 ease-smooth', on ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
                      <p className="min-h-0 overflow-hidden pl-[3.4rem] pt-2 text-sm leading-relaxed text-zinc-400">{body}</p>
                    </div>
                    {on && (
                      <span className="absolute inset-x-0 bottom-0 h-px bg-white/[0.06]">
                        <span key={`${active}-${paused}`} className="block h-full bg-teal-300" style={{ animation: paused || !inView ? 'none' : `cx-progress ${STEP_MS}ms linear both`, width: paused ? '100%' : undefined }} />
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ol>
          <Panel className="min-h-[420px]">
            <div className="dither-grid absolute inset-0 opacity-60" />
            <div className="relative flex items-center justify-between border-b border-white/[0.06] px-5 py-3 font-mono text-[11px] text-zinc-400">
              <span>stage {active + 1}/{STEPS.length} · {STEPS[active].title.toLowerCase()}</span>
              <span className="flex gap-1">{STEPS.map((_, i) => <span key={i} className={cn('h-1 w-4 rounded-full transition-colors duration-500', i <= active ? 'bg-teal-300' : 'bg-white/10')} />)}</span>
            </div>
            <div key={active} className="relative flex min-h-[360px] animate-fade-in items-center p-6 sm:p-10">
              <div className="w-full"><Vis /></div>
            </div>
          </Panel>
        </div>
      </Container>
      <style>{`@keyframes cx-progress{from{width:0}to{width:100%}}`}</style>
    </section>
  );
}
