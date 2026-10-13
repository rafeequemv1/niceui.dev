import { Atom, Bird, Compass, Dna, Orbit, Rows3, Waves, Wind } from 'lucide-react';
import { useCountUp, useInView } from '@/pages/landing/shared/motion';
import { Container } from './ui';

const LABS = [
  { name: 'Helix Labs', icon: Dna, style: 'font-serif text-2xl italic' },
  { name: 'NORTHWIND AI', icon: Wind, style: 'font-mono text-sm tracking-[0.25em]' },
  { name: 'Parallel', icon: Rows3, style: 'font-sans text-xl font-semibold tracking-tight' },
  { name: 'orbital', icon: Orbit, style: 'font-sans text-xl lowercase tracking-wide' },
  { name: 'Fathom', icon: Waves, style: 'font-serif text-2xl' },
  { name: 'KESTREL', icon: Bird, style: 'font-sans text-base font-semibold tracking-[0.3em]' },
  { name: 'Meridian Research', icon: Compass, style: 'font-serif text-xl italic' },
  { name: 'Quanta', icon: Atom, style: 'font-mono text-lg' },
];

function Stat({ value, decimals, suffix, label, note, active, delay }: { value: number; decimals: number; suffix: string; label: string; note: string; active: boolean; delay: number }) {
  const v = useCountUp(value, active, 2000);
  return (
    <div className="group relative bg-[#07090A] p-6 transition-colors duration-500 hover:bg-white/[0.02] sm:p-8" style={{ transitionDelay: `${delay}ms` }}>
      <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">{label}</div>
      <div className="mt-4 font-serif text-5xl leading-none tracking-tight text-white tabular-nums sm:text-6xl">
        {v.toFixed(decimals)}
        <span className="text-teal-200">{suffix}</span>
      </div>
      <div className="mt-4 text-sm leading-relaxed text-zinc-400">{note}</div>
      <div className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-gradient-to-r from-teal-300/70 to-transparent transition-transform duration-700 ease-smooth group-hover:scale-x-100" />
    </div>
  );
}

export function CorpusProof() {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  return (
    <section className="relative border-y border-white/[0.06] bg-[#07090A]">
      <div className="py-12">
        <Container>
          <p className="text-center font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500">Trusted by research teams training at the frontier</p>
        </Container>
        <div className="mask-fade-x relative mt-8 overflow-hidden">
          <div className="flex w-max animate-marquee items-center hover:[animation-play-state:paused]">
            {[...LABS, ...LABS].map(({ name, icon: Icon, style }, i) => (
              <div key={i} className="flex items-center gap-2.5 px-10 text-zinc-400 transition-colors duration-300 hover:text-white">
                <Icon className="h-5 w-5" strokeWidth={1.5} />
                <span className={style}>{name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Container>
        <div ref={ref} className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.06] sm:grid-cols-2 lg:grid-cols-4">
          <Stat active={inView} delay={0} value={4.2} decimals={1} suffix="T" label="Licensed tokens" note="Across 212 languages and 61 programming languages." />
          <Stat active={inView} delay={80} value={180} decimals={0} suffix="M" label="Annotated images" note="Boxes, masks, captions and dense region descriptions." />
          <Stat active={inView} delay={160} value={2.1} decimals={1} suffix="M hrs" label="Consented audio" note="Studio and in-the-wild speech, 94 locales." />
          <Stat active={inView} delay={240} value={99.7} decimals={1} suffix="%" label="Label accuracy" note="Measured on blind, triple-adjudicated audits." />
        </div>
      </Container>
      <div className="h-24" />
    </section>
  );
}
