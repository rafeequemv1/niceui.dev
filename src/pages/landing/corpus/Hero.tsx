import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, AudioLines, Code2, FileText, Image as ImageIcon, ListChecks, Menu, ThumbsUp, Video, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button, Chip, Container, Logo, Panel, WindowBar, scrollToId } from './ui';

const NAV = [
  { id: 'catalog', label: 'Catalog' },
  { id: 'explorer', label: 'Explorer' },
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'trust', label: 'Trust' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'pricing', label: 'Pricing' },
];

export function CorpusNav() {
  const [open, setOpen] = useState(false);
  const go = (id: string) => {
    setOpen(false);
    scrollToId(id);
  };
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#07090A]/75 backdrop-blur-xl">
      <Container className="flex h-16 items-center justify-between">
        <button type="button" onClick={() => go('top')} aria-label="Corpus home">
          <Logo />
        </button>
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => go(n.id)}
              className="rounded-full px-3.5 py-1.5 text-sm text-zinc-400 transition-colors hover:bg-white/[0.05] hover:text-white"
            >
              {n.label}
            </button>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" onClick={() => go('explorer')} className="px-4">
            Browse samples
          </Button>
          <Button onClick={() => go('contact')} className="px-4 py-2">
            Talk to sales <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>
        <button
          type="button"
          className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-zinc-200 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </Container>
      <div className={cn('grid overflow-hidden border-white/[0.06] transition-all duration-500 ease-smooth md:hidden', open ? 'grid-rows-[1fr] border-t' : 'grid-rows-[0fr]')}>
        <div className="min-h-0">
          <Container className="flex flex-col gap-1 py-4">
            {NAV.map((n) => (
              <button key={n.id} type="button" onClick={() => go(n.id)} className="rounded-lg px-3 py-2.5 text-left text-sm text-zinc-300 hover:bg-white/5 hover:text-white">
                {n.label}
              </button>
            ))}
            <Button onClick={() => go('contact')} className="mt-2 w-full">
              Talk to sales
            </Button>
          </Container>
        </div>
      </div>
    </header>
  );
}

const MODALITIES = [
  { icon: FileText, label: 'Text' },
  { icon: Code2, label: 'Code' },
  { icon: ImageIcon, label: 'Image' },
  { icon: AudioLines, label: 'Audio' },
  { icon: Video, label: 'Video' },
  { icon: ThumbsUp, label: 'RLHF' },
  { icon: ListChecks, label: 'Eval' },
];

const TOKENS = [
  'the', '▁model', 'def', '(', 'λ', 'Σ', 'proof', '→', 'élan', '数据', 'return', '{', 'img_0x3f', 'wav:16k', '0.982', 'chosen', 'rejected', '</s>', 'tensor', 'ℝⁿ', 'licensed', 'consent', '▁frontier', 'αβ', 'import', 'bbox', 'frame_24', 'SPDX', 'MIT', 'tok', 'ja', 'sw', 'pt-BR', '∂L', 'quorum', 'eval@k',
];

function StreamColumn({ seed, duration, hot }: { seed: number; duration: number; hot: number }) {
  const items = useMemo(() => Array.from({ length: 22 }, (_, i) => TOKENS[(seed * 7 + i * 5) % TOKENS.length]), [seed]);
  return (
    <div className="relative h-full overflow-hidden">
      <div className="animate-marquee-y flex flex-col gap-2" style={{ animationDuration: `${duration}s` }}>
        {[...items, ...items].map((t, i) => (
          <span
            key={i}
            className={cn(
              'block truncate rounded border px-1.5 py-1 text-center font-mono text-[10.5px] leading-none',
              i % hot === 0 ? 'border-teal-300/30 bg-teal-300/10 text-teal-200' : i % (hot + 3) === 0 ? 'border-amber-300/25 bg-amber-300/[0.07] text-amber-200' : 'border-white/[0.06] bg-white/[0.02] text-zinc-500',
            )}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function DataStream() {
  const [count, setCount] = useState(4_213_887_402_118);
  useEffect(() => {
    const id = window.setInterval(() => setCount((c) => c + Math.floor(120_000 + Math.random() * 260_000)), 80);
    return () => window.clearInterval(id);
  }, []);
  const cols = [
    { d: 26, h: 5 }, { d: 34, h: 7 }, { d: 22, h: 4 }, { d: 30, h: 6 }, { d: 38, h: 5 }, { d: 24, h: 8 }, { d: 32, h: 4 }, { d: 28, h: 6 },
  ];
  return (
    <Panel className="h-full">
      <WindowBar
        title="stream://corpus/global"
        right={
          <span className="inline-flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-wider text-teal-200">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 animate-pulse-ring rounded-full bg-teal-300" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-teal-300" />
            </span>
            Live
          </span>
        }
      />
      <div className="relative h-[320px] sm:h-[360px]">
        <div className="dither-grid absolute inset-0 opacity-70" />
        <div className="mask-fade-y absolute inset-0 grid grid-cols-5 gap-2 px-4 py-2 sm:grid-cols-8">
          {cols.map((c, i) => (
            <div key={i} className={cn(i >= 5 && 'hidden sm:block')}>
              <StreamColumn seed={i + 1} duration={c.d} hot={c.h} />
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-16 -translate-y-1/2 border-y border-teal-300/25 bg-gradient-to-r from-transparent via-teal-300/[0.08] to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-center">
          <div className="rounded-xl border border-white/10 bg-[#07090A]/90 px-5 py-3 text-center shadow-[0_20px_60px_-10px_rgba(0,0,0,0.9)] backdrop-blur">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">Tokens delivered</div>
            <div className="mt-1 font-mono text-xl tabular-nums text-white sm:text-2xl">{count.toLocaleString('en-US')}</div>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 border-t border-white/[0.06] px-4 py-3">
        {MODALITIES.map(({ icon: Icon, label }, i) => (
          <span
            key={label}
            className="inline-flex animate-fade-up items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-[10.5px] text-zinc-300 transition hover:border-teal-300/40 hover:text-teal-100"
            style={{ animationDelay: `${600 + i * 80}ms` }}
          >
            <Icon className="h-3 w-3" /> {label}
          </span>
        ))}
      </div>
    </Panel>
  );
}

const JSONL = [
  '{"id":"cx-00041","lang":"en","tokens":2048,"license":"CC-BY-4.0","receipt":"rcpt_9f2a"}',
  '{"id":"cx-00042","lang":"ja","tokens":1771,"license":"commercial","receipt":"rcpt_9f2b"}',
  '{"id":"cx-00043","lang":"py","tokens":3302,"license":"MIT","receipt":"rcpt_9f2c"}',
  '{"id":"cx-00044","lang":"sw","tokens":1288,"license":"commercial","receipt":"rcpt_9f2d"}',
  '{"id":"cx-00045","lang":"de","tokens":2610,"license":"commercial","receipt":"rcpt_9f2e"}',
  '{"id":"cx-00046","lang":"rs","tokens":1954,"license":"Apache-2.0","receipt":"rcpt_9f2f"}',
];

function JsonLine({ line }: { line: string }) {
  const parts = line.split(/("[^"]*"|\d+)/g).filter(Boolean);
  let keyNext = true;
  return (
    <span>
      {parts.map((p, i) => {
        if (p.startsWith('"')) {
          const isKey = keyNext;
          keyNext = !keyNext;
          return <span key={i} className={isKey ? 'text-zinc-400' : 'text-teal-200'}>{p}</span>;
        }
        if (/^\d+$/.test(p)) {
          keyNext = true;
          return <span key={i} className="text-amber-200">{p}</span>;
        }
        if (p.includes(',')) keyNext = true;
        return <span key={i} className="text-zinc-600">{p}</span>;
      })}
    </span>
  );
}

function Terminal() {
  const [n, setN] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setN((v) => (v >= JSONL.length + 3 ? 0 : v + 1)), 650);
    return () => window.clearInterval(id);
  }, []);
  const shown = JSONL.slice(0, Math.min(n, JSONL.length));
  return (
    <Panel className="h-full">
      <WindowBar title="python — corpus" right={<Chip tone="teal">200 OK</Chip>} />
      <div className="space-y-3 p-4 font-mono text-[11.5px] leading-relaxed">
        <div className="text-zinc-300">
          <span className="text-teal-300">›</span> ds = corpus.datasets.get(<span className="text-amber-200">"polyglot-web-v4"</span>)
        </div>
        <div className="text-zinc-300">
          <span className="text-teal-300">›</span> for row in ds.stream(split=<span className="text-amber-200">"train"</span>):
        </div>
        <div className="min-h-[188px] space-y-1.5 rounded-lg border border-white/[0.06] bg-black/40 p-3">
          {shown.map((l, i) => (
            <div key={`${l}-${i}`} className="animate-fade-up truncate">
              <JsonLine line={l} />
            </div>
          ))}
          <span className="inline-block h-3.5 w-1.5 animate-blink bg-teal-300 align-middle" />
        </div>
        <div className="flex items-center justify-between text-[10.5px] text-zinc-500">
          <span>{shown.length * 1024} rows · verified</span>
          <span>p50 38ms</span>
        </div>
      </div>
    </Panel>
  );
}

export function CorpusHero() {
  return (
    <section id="top" className="relative scroll-mt-20 overflow-hidden pb-24 pt-20 sm:pt-28">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-20%] h-[640px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(94,234,212,0.16),transparent)] blur-2xl" />
        <div className="absolute right-[-10%] top-[30%] h-[420px] w-[520px] rounded-full bg-[radial-gradient(closest-side,rgba(252,211,77,0.07),transparent)] blur-2xl" />
        <div className="dither-dots absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      </div>
      <Container className="relative">
        <div className="animate-fade-down">
          <button
            type="button"
            onClick={() => scrollToId('catalog')}
            className="group inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] py-1 pl-1 pr-4 text-xs text-zinc-300 transition hover:border-teal-300/30"
          >
            <span className="rounded-full bg-teal-300/15 px-2.5 py-0.5 font-mono text-[10.5px] uppercase tracking-wider text-teal-200">New</span>
            Preference Atlas v3 — 14M expert-ranked pairs
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
        <h1 className="mt-8 max-w-5xl animate-fade-up font-serif text-[3.25rem] leading-[1.02] tracking-tight text-white sm:text-7xl lg:text-[6.5rem]" style={{ animationDelay: '80ms' }}>
          The data behind <em className="bg-gradient-to-r from-teal-200 via-emerald-200 to-amber-200 bg-clip-text italic text-transparent">frontier</em> models.
        </h1>
        <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-end">
          <p className="max-w-xl animate-fade-up text-lg leading-relaxed text-zinc-400 lg:col-span-7" style={{ animationDelay: '160ms' }}>
            Corpus licenses, curates and delivers training data for the world's leading AI labs — text, code, vision, speech and human preference data, with a consent trail
            for every single record.
          </p>
          <div className="flex animate-fade-up flex-wrap gap-3 lg:col-span-5 lg:justify-end" style={{ animationDelay: '240ms' }}>
            <Button onClick={() => scrollToId('catalog')} className="px-6 py-3">
              Explore the catalog <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
            <Button variant="outline" onClick={() => scrollToId('contact')} className="px-6 py-3">
              Commission a dataset
            </Button>
          </div>
        </div>
        <div className="mt-16 grid animate-fade-up gap-4 lg:grid-cols-12" style={{ animationDelay: '360ms' }}>
          <div className="lg:col-span-7">
            <DataStream />
          </div>
          <div className="lg:col-span-5">
            <Terminal />
          </div>
        </div>
      </Container>
    </section>
  );
}
