import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Eye, MousePointer2, Play, Send, Smartphone, Sparkles } from 'lucide-react';
import { cn } from '@/lib/cn';
import { CodeBlock } from '@/components/ui/CodeBlock';
import { Reveal } from '@/pages/landing/shared/motion';
import { SectionHead, selectionBlue } from './ui';

const people = [
  { name: 'Mira Chen', role: 'Product design', color: '#f97316', path: [[58, 22], [70, 55], [42, 60], [60, 30]] },
  { name: 'Theo Park', role: 'Engineering', color: '#10b981', path: [[22, 70], [35, 35], [20, 48], [30, 78]] },
  { name: 'Ava Rossi', role: 'Brand', color: '#f43f5e', path: [[80, 75], [62, 82], [84, 40], [74, 66]] },
];

type Thread = { id: number; x: number; y: number; author: string; color: string; messages: string[] };

const initialThreads: Thread[] = [
  { id: 1, x: 30, y: 26, author: 'Mira', color: '#f97316', messages: ['Can we try the headline at 56px? Feels a touch small on desktop.'] },
  { id: 2, x: 68, y: 64, author: 'Theo', color: '#10b981', messages: ['This chart maps to <Sparkline />, already in the library.'] },
];

function Cursor({ color, name, path }: { color: string; name: string; path: number[][] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % path.length), 2600 + name.length * 120);
    return () => clearInterval(id);
  }, [path.length, name.length]);
  return (
    <div className="pointer-events-none absolute z-20 transition-all duration-[2400ms] ease-smooth" style={{ left: `${path[i][0]}%`, top: `${path[i][1]}%` }}>
      <MousePointer2 className="h-5 w-5 -rotate-12" style={{ color, fill: color }} />
      <span className="ml-4 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium text-white" style={{ background: color }}>{name.split(' ')[0]}</span>
    </div>
  );
}

export function Multiplayer() {
  const [threads, setThreads] = useState(initialThreads);
  const [open, setOpen] = useState<number | null>(1);
  const [draft, setDraft] = useState('');

  const reply = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || open === null) return;
    setThreads((ts) => ts.map((t) => (t.id === open ? { ...t, messages: [...t.messages, draft.trim()] } : t)));
    setDraft('');
  };

  return (
    <section id="lattice-multiplayer" className="scroll-mt-16 bg-zinc-950 py-28 text-white">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 lg:grid-cols-[1fr_1.3fr]">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-zinc-300">
            <span className="h-2 w-2 rounded-[2px] bg-orange-500" /> Multiplayer
          </span>
          <h2 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-[-0.035em] md:text-6xl">One file. <span className="text-zinc-500">Everyone in it.</span></h2>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-zinc-400">Live cursors, threaded comments and follow mode. Feedback happens on the work, not in another tab.</p>
          <div className="mt-10 space-y-2">
            {people.map((p) => (
              <div key={p.name} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3 transition-colors hover:bg-white/[0.06]">
                <span className="relative grid h-9 w-9 place-items-center rounded-full text-sm font-semibold" style={{ background: p.color }}>
                  {p.name[0]}
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-zinc-950 bg-emerald-400" />
                </span>
                <div>
                  <div className="text-sm font-medium">{p.name}</div>
                  <div className="text-xs text-zinc-500">{p.role}</div>
                </div>
                <button className="ml-auto flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"><Eye className="h-3.5 w-3.5" /> Follow</button>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={150}>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10 bg-zinc-900" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)', backgroundSize: '18px 18px' }}>
            <div className="absolute left-[12%] top-[14%] w-[52%] rounded-2xl bg-white p-5 text-zinc-900 shadow-2xl">
              <div className="h-3 w-16 rounded bg-orange-500" />
              <div className="mt-4 h-5 w-4/5 rounded bg-zinc-900" />
              <div className="mt-2 h-2.5 w-full rounded bg-zinc-200" />
              <div className="mt-1.5 h-2.5 w-2/3 rounded bg-zinc-200" />
              <div className="mt-5 flex gap-2"><div className="h-8 w-24 rounded-lg bg-zinc-900" /><div className="h-8 w-20 rounded-lg ring-1 ring-zinc-300" /></div>
            </div>
            <div className="absolute bottom-[12%] right-[10%] w-[42%] rounded-2xl border border-white/10 bg-zinc-800 p-4">
              <div className="flex h-20 items-end gap-1.5">
                {[30, 55, 40, 70, 50, 85, 65].map((h, i) => <div key={i} className="flex-1 rounded-t bg-emerald-400/80 animate-bar-bounce" style={{ height: `${h}%`, animationDelay: `${i * 120}ms` }} />)}
              </div>
            </div>
            {people.map((p) => <Cursor key={p.name} {...p} />)}
            {threads.map((t) => (
              <div key={t.id} className="absolute z-30" style={{ left: `${t.x}%`, top: `${t.y}%` }}>
                <button
                  onClick={() => setOpen(open === t.id ? null : t.id)}
                  aria-label={`Comment by ${t.author}`}
                  className={cn('grid h-8 w-8 place-items-center rounded-full rounded-bl-none text-xs font-semibold text-white shadow-lg ring-2 ring-white transition-transform hover:scale-110', open === t.id && 'scale-110')}
                  style={{ background: t.color }}
                >
                  {t.messages.length > 1 ? t.messages.length : t.author[0]}
                </button>
                {open === t.id && (
                  <div className={cn('absolute top-10 w-64 rounded-xl bg-white p-3 text-zinc-900 shadow-2xl animate-scale-in', t.x > 50 ? 'right-0 origin-top-right' : 'left-0 origin-top-left')}>
                    <div className="max-h-32 space-y-2 overflow-y-auto">
                      {t.messages.map((m, i) => (
                        <div key={i} className="text-xs leading-relaxed">
                          <span className="font-semibold">{i === 0 ? t.author : 'You'}</span>
                          <p className="text-zinc-600">{m}</p>
                        </div>
                      ))}
                    </div>
                    <form onSubmit={reply} className="mt-3 flex items-center gap-1.5 rounded-lg bg-zinc-100 p-1 pl-2.5">
                      <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Reply..." aria-label="Reply" className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-zinc-400" />
                      <button aria-label="Send reply" className="grid h-6 w-6 place-items-center rounded-md bg-[#0d99ff] text-white disabled:opacity-40" disabled={!draft.trim()}><Send className="h-3 w-3" /></button>
                    </form>
                  </div>
                )}
              </div>
            ))}
            <div className="absolute inset-x-0 top-0 flex items-center justify-center gap-2 bg-orange-500 py-1.5 text-xs font-medium text-white">
              <Eye className="h-3.5 w-3.5" /> Following Mira Chen
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const screens = [
  { title: 'Welcome', tint: 'from-sky-100 to-white', accent: 'bg-[#0d99ff]' },
  { title: 'Choose plan', tint: 'from-orange-100 to-white', accent: 'bg-orange-500' },
  { title: 'All set', tint: 'from-emerald-100 to-white', accent: 'bg-emerald-500' },
];

export function Prototyping() {
  const [step, setStep] = useState(-1);
  const timer = useRef<number>();
  useEffect(() => () => clearTimeout(timer.current), []);

  const play = () => {
    clearTimeout(timer.current);
    const tick = (n: number) => {
      setStep(n);
      if (n < screens.length - 1) timer.current = window.setTimeout(() => tick(n + 1), 1100);
      else timer.current = window.setTimeout(() => setStep(-1), 1600);
    };
    tick(0);
  };

  return (
    <section id="lattice-prototype" className="scroll-mt-16 py-28">
      <style>{`@keyframes lattice-dash{to{stroke-dashoffset:-24}}`}</style>
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <SectionHead tag="Prototyping" color="#10b981" title={<>Wire it up. <span className="text-zinc-400">Watch it move.</span></>} body="Connect frames with a drag, add smart animate, and share a link that feels like the real app." />
          <button onClick={play} className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-medium text-white transition-all hover:bg-emerald-500 active:scale-[0.97]">
            <Play className="h-4 w-4 fill-current" /> Play prototype
          </button>
        </div>
        <Reveal className="relative mt-16">
          <svg className="pointer-events-none absolute inset-0 hidden h-full w-full md:block" viewBox="0 0 100 100" preserveAspectRatio="none">
            {['M 23 45 C 30 22, 35 22, 41 45', 'M 59 45 C 66 22, 71 22, 77 45'].map((d) => (
              <path key={d} d={d} fill="none" stroke={selectionBlue} strokeWidth={2} strokeDasharray="6 6" vectorEffect="non-scaling-stroke" style={{ animation: 'lattice-dash 1.2s linear infinite' }} />
            ))}
          </svg>
          <div className="relative grid gap-8 md:grid-cols-3 md:gap-16">
            {screens.map((s, i) => (
              <div key={s.title} className="flex flex-col items-center">
                <span className={cn('mb-3 font-mono text-[11px] transition-colors', step === i ? 'text-[#0d99ff]' : 'text-zinc-400')}>0{i + 1} / {s.title}</span>
                <div className={cn('relative w-full max-w-[220px] rounded-[28px] border-[6px] border-zinc-900 bg-gradient-to-b p-4 transition-all duration-500 ease-spring', s.tint, step === i ? 'scale-105 shadow-[0_30px_60px_-20px_rgba(13,153,255,0.5)]' : 'shadow-xl', step !== -1 && step !== i && 'opacity-50')}>
                  <div className="mx-auto h-1.5 w-10 rounded-full bg-zinc-300" />
                  <div className={cn('mx-auto mt-8 grid h-14 w-14 place-items-center rounded-2xl text-white', s.accent)}><Smartphone className="h-6 w-6" /></div>
                  <div className="mx-auto mt-5 h-3 w-3/4 rounded bg-zinc-900" />
                  <div className="mx-auto mt-2 h-2 w-2/3 rounded bg-zinc-300" />
                  <div className="mx-auto mt-1.5 h-2 w-1/2 rounded bg-zinc-300" />
                  <div className={cn('mt-10 h-9 rounded-xl', s.accent, step === i && 'animate-pulse')} />
                </div>
                {i < screens.length - 1 && (
                  <span className="mt-4 rounded-md bg-white px-2 py-1 font-mono text-[10px] text-zinc-500 ring-1 ring-zinc-200">On tap → Smart animate · 300ms</span>
                )}
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const code: Record<string, { lang: string; src: string }> = {
  React: { lang: 'tsx', src: `export function PrimaryButton({ children }) {\n  return (\n    <button className="btn btn-primary">\n      <Sparkles size={16} />\n      {children}\n    </button>\n  );\n}` },
  Tailwind: { lang: 'html', src: `<button class="inline-flex h-11 items-center gap-2\n  rounded-xl bg-zinc-950 px-5 text-sm\n  font-medium text-white shadow-sm">\n  Generate\n</button>` },
  CSS: { lang: 'css', src: `.btn-primary {\n  display: inline-flex;\n  gap: 8px;\n  height: 44px;\n  padding: 0 20px;\n  border-radius: 12px;\n  background: var(--zinc-950);\n  font: 500 14px/1 'Geist';\n}` },
};

export function DevMode() {
  const [tab, setTab] = useState('React');
  return (
    <section id="lattice-dev" className="scroll-mt-16 bg-zinc-50 py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHead tag="Dev Mode" color="#f43f5e" title={<>From pixels to <span className="text-zinc-400">production code.</span></>} body="Engineers get specs, measurements and code that actually match your design system. No more redline PDFs." />
        <Reveal className="mt-14 grid overflow-hidden rounded-3xl border border-zinc-200 bg-white lg:grid-cols-2">
          <div className="relative grid min-h-[320px] place-items-center p-10" style={{ backgroundImage: 'radial-gradient(#e4e4e7 1px, transparent 1px)', backgroundSize: '16px 16px' }}>
            <div className="relative">
              <span className="absolute -top-8 left-0 right-0 flex items-center justify-center">
                <span className="absolute inset-x-0 top-1/2 h-px bg-rose-500" />
                <span className="relative rounded bg-rose-500 px-1.5 font-mono text-[10px] text-white">148</span>
              </span>
              <span className="absolute -left-10 bottom-0 top-0 flex items-center">
                <span className="absolute inset-y-0 left-1/2 w-px bg-rose-500" />
                <span className="relative rounded bg-rose-500 px-1 font-mono text-[10px] text-white">44</span>
              </span>
              <button className="inline-flex h-11 items-center gap-2 rounded-xl bg-zinc-950 px-5 text-sm font-medium text-white outline outline-[1.5px] outline-offset-4 outline-[#0d99ff]">
                <Sparkles className="h-4 w-4" /> Generate
              </button>
            </div>
          </div>
          <div className="border-t border-zinc-200 bg-zinc-950 p-4 lg:border-l lg:border-t-0">
            <div className="mb-3 flex gap-1">
              {Object.keys(code).map((k) => (
                <button key={k} onClick={() => setTab(k)} className={cn('rounded-lg px-3 py-1.5 text-xs font-medium transition-colors', tab === k ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-200')}>{k}</button>
              ))}
            </div>
            <div key={tab} className="animate-fade-in">
              <CodeBlock code={code[tab].src} language={code[tab].lang} />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
