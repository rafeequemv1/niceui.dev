import { useEffect, useMemo, useRef, useState } from 'react';
import { AudioLines, Braces, Check, Eye, EyeOff, Image as ImageIcon, Pause, Play, RotateCcw, ThumbsDown, ThumbsUp } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Reveal } from '@/pages/landing/shared/motion';
import { Chip, Container, Panel, SectionHeading, WindowBar } from './ui';

const RECORD = {
  id: 'pw4-88120931',
  source: { publisher: 'Revista Ciência Hoje', license: 'commercial', receipt: 'rcpt_4b1e9a' },
  lang: 'por',
  tokens: 1874,
  quality: 0.942,
  toxicity: 0.003,
  pii_scrubbed: true,
  dedup_cluster: null,
  text: 'A fotossíntese converte energia luminosa em energia química…',
};

function HighlightedJson({ value }: { value: unknown }) {
  const lines = JSON.stringify(value, null, 2).split('\n');
  return (
    <pre className="overflow-x-auto p-5 font-mono text-[12.5px] leading-[1.7]">
      {lines.map((line, i) => {
        const m = line.match(/^(\s*)("[^"]+":\s)?(.*)$/);
        const [, indent = '', key = '', rest = ''] = m ?? [];
        const val = rest.replace(/,$/, '');
        const comma = rest.endsWith(',') ? ',' : '';
        const cls = val.startsWith('"') ? 'text-teal-200' : /^-?\d/.test(val) ? 'text-amber-200' : /^(true|false|null)$/.test(val) ? 'text-emerald-300' : 'text-zinc-500';
        return (
          <div key={i} className="group flex hover:bg-white/[0.03]">
            <span className="mr-5 w-6 select-none text-right text-zinc-600">{i + 1}</span>
            <span className="whitespace-pre">
              {indent}
              {key && <span className="text-zinc-300">{key.replace(/:\s$/, '')}</span>}
              {key && <span className="text-zinc-500">: </span>}
              <span className={cls}>{val}</span>
              <span className="text-zinc-500">{comma}</span>
            </span>
          </div>
        );
      })}
    </pre>
  );
}

function PreferencePair() {
  const [show, setShow] = useState(true);
  return (
    <div className="space-y-4 p-5">
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
        <div className="font-mono text-[10.5px] uppercase tracking-wider text-zinc-500">Prompt</div>
        <p className="mt-2 text-sm leading-relaxed text-zinc-200">My sourdough is dense and gummy inside. What's most likely going wrong?</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-teal-300/30 bg-teal-300/[0.04] p-4">
          <div className="flex items-center justify-between">
            <Chip tone="teal"><ThumbsUp className="h-3 w-3" /> Chosen</Chip>
            <span className="font-mono text-[11px] text-teal-200">score 6.4</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-zinc-300">
            Most often it's under-proofing. Check that the dough has grown ~50–75% and passes the poke test. Also let the loaf cool fully — slicing early makes the crumb seem gummy.
          </p>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
          <div className="flex items-center justify-between">
            <Chip><ThumbsDown className="h-3 w-3" /> Rejected</Chip>
            <span className="font-mono text-[11px] text-zinc-400">score 3.1</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            Your starter is probably dead. Throw it out and buy commercial yeast instead, which is much more reliable for home bakers.
          </p>
        </div>
      </div>
      <button type="button" onClick={() => setShow((s) => !s)} className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-zinc-400 transition hover:text-white">
        {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />} {show ? 'Hide' : 'Show'} annotator rationale
      </button>
      <div className={cn('grid transition-all duration-500 ease-smooth', show ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
        <div className="min-h-0 overflow-hidden">
          <div className="rounded-xl border border-amber-300/20 bg-amber-300/[0.04] p-4">
            <div className="flex flex-wrap items-center gap-2 font-mono text-[10.5px] uppercase tracking-wider text-amber-200">
              Annotator #A-2291 · Professional baker · κ 0.91
            </div>
            <p className="mt-2 text-sm leading-relaxed text-zinc-300">
              "A diagnoses the common cause with an actionable test. B makes an unsupported leap and gives advice that discards a working starter."
            </p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[['Helpfulness', 92], ['Accuracy', 96], ['Harmlessness', 99]].map(([k, v]) => (
                <div key={k}>
                  <div className="flex justify-between font-mono text-[10px] text-zinc-400"><span>{k}</span><span>{v}</span></div>
                  <div className="mt-1.5 h-1 rounded-full bg-white/[0.06]"><div className="h-full rounded-full bg-amber-200" style={{ width: `${v}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const BOXES = [
  { label: 'pedestrian', conf: 0.98, x: 22, y: 30, w: 8, h: 20 },
  { label: 'pedestrian', conf: 0.96, x: 46, y: 46, w: 8, h: 21 },
  { label: 'crosswalk', conf: 0.99, x: 8, y: 62, w: 84, h: 22 },
  { label: 'pedestrian', conf: 0.93, x: 68, y: 22, w: 8, h: 19 },
];

function ImageSample() {
  const [show, setShow] = useState(true);
  const [hover, setHover] = useState<number | null>(null);
  return (
    <div className="grid gap-5 p-5 md:grid-cols-[1fr_200px]">
      <div className="relative overflow-hidden rounded-xl border border-white/[0.06]">
        <img src="https://images.pexels.com/photos/10121600/pexels-photo-10121600.jpeg?auto=compress&cs=tinysrgb&h=650&w=940" alt="Aerial view of pedestrians crossing a city street" className="aspect-[3/2] w-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        {BOXES.map((b, i) => (
          <div
            key={i}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            className={cn('absolute rounded-[3px] border-[1.5px] transition-all duration-500 ease-smooth', b.label === 'crosswalk' ? 'border-amber-300' : 'border-teal-300', show ? 'scale-100 opacity-100' : 'scale-95 opacity-0', hover !== null && hover !== i && 'opacity-30', hover === i && 'bg-teal-300/10')}
            style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%`, height: `${b.h}%`, transitionDelay: show ? `${i * 90}ms` : '0ms' }}
          >
            <span className={cn('absolute -top-5 left-0 whitespace-nowrap rounded-sm px-1 font-mono text-[9.5px] text-black', b.label === 'crosswalk' ? 'bg-amber-300' : 'bg-teal-300')}>
              {b.label} {b.conf.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
      <div className="space-y-3">
        <button type="button" onClick={() => setShow((s) => !s)} className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 font-mono text-[11px] text-zinc-300 transition hover:border-white/25 hover:text-white">
          {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />} {show ? 'Hide' : 'Show'} labels
        </button>
        <ul className="space-y-1.5">
          {BOXES.map((b, i) => (
            <li key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} className={cn('flex cursor-default items-center justify-between rounded-lg border px-3 py-2 font-mono text-[11px] transition', hover === i ? 'border-teal-300/40 bg-teal-300/10 text-white' : 'border-white/[0.06] text-zinc-400')}>
              <span className="flex items-center gap-2"><span className={cn('h-2 w-2 rounded-sm', b.label === 'crosswalk' ? 'bg-amber-300' : 'bg-teal-300')} />{b.label}</span>
              <span>{b.conf.toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs leading-relaxed text-zinc-400">Caption: "Aerial view of commuters crossing a striped intersection at midday."</p>
      </div>
    </div>
  );
}

const WORDS = '¿Podrías revisar el informe trimestral antes del viernes? Necesito enviarlo a la junta.'.split(' ');
const DURATION = 6.4;

function AudioSample() {
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const last = useRef(0);
  const bars = useMemo(() => Array.from({ length: 96 }, (_, i) => 0.18 + 0.82 * Math.abs(Math.sin(i * 0.37) * Math.cos(i * 0.11 + 1.3))), []);
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    last.current = performance.now();
    const loop = (now: number) => {
      const dt = (now - last.current) / 1000;
      last.current = now;
      setT((v) => {
        const nv = v + dt;
        if (nv >= DURATION) {
          setPlaying(false);
          return DURATION;
        }
        return nv;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing]);
  const p = t / DURATION;
  const toggle = () => {
    if (t >= DURATION) setT(0);
    setPlaying((v) => !v);
  };
  return (
    <div className="space-y-5 p-5">
      <div className="flex items-center gap-4">
        <button type="button" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'} className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-teal-200 text-[#04110e] shadow-[0_8px_30px_-8px_rgba(94,234,212,0.6)] transition hover:scale-105 active:scale-95">
          {playing ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex h-16 items-center gap-[2px]">
            {bars.map((h, i) => (
              <span key={i} className={cn('flex-1 rounded-full transition-colors duration-150', i / bars.length <= p ? 'bg-teal-300' : 'bg-white/15')} style={{ height: `${h * 100}%` }} />
            ))}
          </div>
          <div className="mt-2 flex justify-between font-mono text-[10.5px] text-zinc-500">
            <span>{t.toFixed(2)}s</span>
            <span>es-MX · 48kHz · speaker F/34</span>
            <span>{DURATION.toFixed(2)}s</span>
          </div>
        </div>
        <button type="button" onClick={() => { setT(0); setPlaying(false); }} aria-label="Restart" className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-zinc-400 transition hover:text-white">
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-lg leading-relaxed">
        {WORDS.map((w, i) => {
          const start = (i / WORDS.length) * DURATION;
          const active = t >= start && t < start + DURATION / WORDS.length;
          return (
            <span key={i} className={cn('mr-1.5 inline-block rounded px-0.5 transition-colors duration-200', active ? 'bg-teal-300/20 text-white' : t > start ? 'text-zinc-200' : 'text-zinc-500')}>
              {w}
            </span>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-2">
        <Chip tone="teal"><Check className="h-3 w-3" /> Consent cns_2290</Chip>
        <Chip>WER-verified 0.6%</Chip>
        <Chip>Word-aligned</Chip>
      </div>
    </div>
  );
}

const TABS = [
  { id: 'json', label: 'Text record', icon: Braces, file: 'polyglot-web-v4/train-00041.jsonl' },
  { id: 'pref', label: 'Preference pair', icon: ThumbsUp, file: 'preference-atlas-v3/pairs-0193.jsonl' },
  { id: 'image', label: 'Image + boxes', icon: ImageIcon, file: 'lumen-captions/0x91f2.json' },
  { id: 'audio', label: 'Audio + transcript', icon: AudioLines, file: 'chorus-speech/es-MX/71af.flac' },
] as const;

export function CorpusExplorer() {
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('json');
  const current = TABS.find((x) => x.id === tab) ?? TABS[0];
  return (
    <section id="explorer" className="relative scroll-mt-20 border-t border-white/[0.06] py-24 sm:py-32">
      <div aria-hidden className="dither-diagonal pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <Container className="relative">
        <Reveal>
          <SectionHeading align="center" eyebrow="02 — Sample explorer" title={<>Inspect the data <em className="italic text-teal-100">before</em> you buy it.</>} sub="Real record structures from our catalog. Every field, label and rationale exactly as it ships." />
        </Reveal>
        <Reveal delay={120} className="mt-12">
          <div className="mx-auto flex max-w-max flex-wrap justify-center gap-2">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} type="button" onClick={() => setTab(id)} className={cn('inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all duration-300', tab === id ? 'border-teal-300/40 bg-teal-300/10 text-white' : 'border-white/10 text-zinc-400 hover:border-white/20 hover:text-white')}>
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
          </div>
          <Panel className="mx-auto mt-8 max-w-4xl">
            <WindowBar title={current.file} right={<Chip tone="teal">license verified</Chip>} />
            <div key={tab} className="animate-fade-up">
              {tab === 'json' && <HighlightedJson value={RECORD} />}
              {tab === 'pref' && <PreferencePair />}
              {tab === 'image' && <ImageSample />}
              {tab === 'audio' && <AudioSample />}
            </div>
          </Panel>
        </Reveal>
      </Container>
    </section>
  );
}
