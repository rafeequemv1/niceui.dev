import { useState } from 'react';
import { BadgeCheck, Database, FileCheck2, Fingerprint, Globe2, Lock, Receipt, Scale, ShieldCheck, Sparkles } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Reveal, useInView } from '@/pages/landing/shared/motion';
import { Chip, Container, Panel, SectionHeading } from './ui';

const LINEAGE = [
  { icon: Globe2, label: 'Source', meta: 'Revista Ciência Hoje' },
  { icon: Receipt, label: 'Receipt', meta: 'rcpt_4b1e9a' },
  { icon: Fingerprint, label: 'Transform', meta: 'dedupe · pii · v4.2' },
  { icon: Database, label: 'Shard', meta: 'train-00041' },
  { icon: Sparkles, label: 'Your model', meta: 'run 2291-b' },
];

function Lineage() {
  const { ref, inView } = useInView<HTMLDivElement>(0.4);
  return (
    <Panel className="p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-400">Lineage · pw4-88120931</span>
        <Chip tone="teal">Verifiable</Chip>
      </div>
      <div ref={ref} className="relative mt-8 grid grid-cols-1 gap-4 sm:grid-cols-5 sm:gap-2">
        <div className="absolute left-[10%] right-[10%] top-6 hidden h-px bg-white/10 sm:block">
          <div className={cn('h-full bg-gradient-to-r from-teal-300 via-emerald-200 to-amber-200 transition-[width] duration-[2000ms] ease-smooth', inView ? 'w-full' : 'w-0')} />
        </div>
        {LINEAGE.map(({ icon: Icon, label, meta }, i) => (
          <div key={label} className={cn('relative flex items-center gap-4 transition-all duration-700 ease-smooth sm:flex-col sm:text-center', inView ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0')} style={{ transitionDelay: `${i * 300}ms` }}>
            <span className={cn('relative grid h-12 w-12 shrink-0 place-items-center rounded-xl border bg-[#0A0D0E]', i === LINEAGE.length - 1 ? 'border-amber-300/40 text-amber-200' : 'border-teal-300/30 text-teal-200')}>
              <Icon className="h-5 w-5" strokeWidth={1.5} />
            </span>
            <div>
              <div className="text-sm text-white">{label}</div>
              <div className="mt-0.5 font-mono text-[10.5px] text-zinc-500">{meta}</div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

const CERTS = [
  { name: 'SOC 2', sub: 'Type II', icon: ShieldCheck },
  { name: 'ISO', sub: '27001', icon: BadgeCheck },
  { name: 'GDPR', sub: 'EU · UK', icon: Scale },
  { name: 'CCPA', sub: 'CPRA ready', icon: Lock },
];

const REGIONS = [
  { name: 'US East', code: 'us-east-1', x: 27, y: 38 },
  { name: 'US West', code: 'us-west-2', x: 15, y: 36 },
  { name: 'Frankfurt', code: 'eu-central-1', x: 51, y: 30 },
  { name: 'London', code: 'eu-west-2', x: 47, y: 28 },
  { name: 'Tokyo', code: 'ap-northeast-1', x: 85, y: 38 },
  { name: 'Singapore', code: 'ap-southeast-1', x: 77, y: 58 },
];

function Residency() {
  const [sel, setSel] = useState(2);
  return (
    <Panel className="p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-400">Data residency</span>
        <span className="font-mono text-[11px] text-teal-200">{REGIONS[sel].code}</span>
      </div>
      <div className="relative mt-6 aspect-[2/1] overflow-hidden rounded-xl border border-white/[0.06]">
        <div className="dot-bg absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />
        <svg viewBox="0 0 200 100" className="absolute inset-0 h-full w-full opacity-30" preserveAspectRatio="none">
          <path d="M18 30 Q30 18 52 26 T70 44 Q60 60 48 52 T22 48 Z M90 22 Q110 14 128 24 T160 26 Q178 34 170 52 Q150 70 128 56 T96 46 Z M150 62 Q164 64 170 74 Q160 84 150 76 Z M40 62 Q54 64 58 80 Q48 92 42 80 Z" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.4" />
        </svg>
        {REGIONS.map((r, i) => (
          <button key={r.code} type="button" onClick={() => setSel(i)} aria-label={r.name} className="group absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${r.x}%`, top: `${r.y}%` }}>
            <span className="relative flex h-3 w-3 items-center justify-center">
              {sel === i && <span className="absolute inset-0 animate-pulse-ring rounded-full bg-teal-300" />}
              <span className={cn('relative h-2 w-2 rounded-full transition-all', sel === i ? 'scale-125 bg-teal-300' : 'bg-zinc-400 group-hover:bg-white')} />
            </span>
            <span className={cn('absolute left-1/2 top-4 -translate-x-1/2 whitespace-nowrap rounded border border-white/10 bg-[#07090A]/90 px-1.5 py-0.5 font-mono text-[10px] transition-opacity', sel === i ? 'text-white opacity-100' : 'text-zinc-400 opacity-0 group-hover:opacity-100')}>
              {r.name}
            </span>
          </button>
        ))}
      </div>
      <p className="mt-5 text-sm leading-relaxed text-zinc-400">
        Pin storage, processing and annotation to a single jurisdiction. Data never transits outside <span className="text-white">{REGIONS[sel].name}</span> without written approval.
      </p>
    </Panel>
  );
}

export function CorpusTrust() {
  return (
    <section id="trust" className="relative scroll-mt-20 border-t border-white/[0.06] py-24 sm:py-32">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[900px] -translate-x-1/2 bg-[radial-gradient(closest-side,rgba(252,211,77,0.06),transparent)]" />
      <Container className="relative">
        <Reveal>
          <SectionHeading eyebrow="04 — Trust & compliance" title={<>Provenance you can <em className="italic text-amber-100">put in a filing.</em></>} sub="Regulators, auditors and your general counsel will ask where the data came from. With Corpus, the answer is a link." />
        </Reveal>
        <Reveal delay={100} className="mt-14">
          <Lineage />
        </Reveal>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Reveal delay={150}>
            <Panel className="h-full p-6 sm:p-8">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-400">License receipts</span>
              <h3 className="mt-4 font-serif text-3xl leading-tight text-white">Every record has a receipt.</h3>
              <p className="mt-3 leading-relaxed text-zinc-400">
                A signed, immutable document that names the rights holder, the grant, the consent basis and every transformation applied. Query it by record id, export it for audits, or revoke downstream on opt-out.
              </p>
              <div className="mt-6 rounded-xl border border-dashed border-white/15 bg-black/30 p-4 font-mono text-[11.5px] leading-relaxed">
                <div className="flex items-center gap-2 text-teal-200"><FileCheck2 className="h-3.5 w-3.5" /> receipt rcpt_4b1e9a</div>
                <div className="mt-2 grid grid-cols-[110px_1fr] gap-y-1 text-zinc-400">
                  <span>holder</span><span className="text-zinc-200">Revista Ciência Hoje Ltda.</span>
                  <span>grant</span><span className="text-zinc-200">commercial · training · perpetual</span>
                  <span>consent</span><span className="text-zinc-200">n/a (non-personal)</span>
                  <span>signature</span><span className="truncate text-amber-200">ed25519:9f2a…c41e</span>
                </div>
              </div>
            </Panel>
          </Reveal>
          <Reveal delay={200}>
            <Residency />
          </Reveal>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {CERTS.map(({ name, sub, icon: Icon }, i) => (
            <Reveal key={name} delay={250 + i * 60}>
              <div className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 text-center transition-all duration-500 hover:-translate-y-0.5 hover:border-teal-300/30">
                <div className="dither-cross pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative mx-auto grid h-14 w-14 place-items-center rounded-full border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent">
                  <Icon className="h-6 w-6 text-teal-200" strokeWidth={1.25} />
                </div>
                <div className="relative mt-4 font-serif text-2xl text-white">{name}</div>
                <div className="relative font-mono text-[11px] uppercase tracking-wider text-zinc-400">{sub}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
