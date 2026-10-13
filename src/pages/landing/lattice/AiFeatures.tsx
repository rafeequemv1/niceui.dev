import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowRight, Bell, LayoutGrid, Palette, RotateCcw, Sparkles, Wand2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { SectionHead } from './ui';

const PROMPT = 'A mobile onboarding screen for a meditation app, warm and calm';

function PromptToUI() {
  const [typed, setTyped] = useState(0);
  const [run, setRun] = useState(0);
  useEffect(() => {
    setTyped(0);
    const id = setInterval(() => setTyped((n) => (n >= PROMPT.length ? n : n + 1)), 28);
    return () => clearInterval(id);
  }, [run]);
  const done = typed >= PROMPT.length;

  const blocks = [
    { cls: 'h-40 rounded-2xl bg-gradient-to-br from-orange-300 to-amber-200', label: 'Illustration' },
    { cls: 'h-6 w-3/4 rounded-md bg-zinc-900', label: 'Heading' },
    { cls: 'h-3 w-full rounded bg-zinc-300', label: 'Body' },
    { cls: 'h-3 w-2/3 rounded bg-zinc-300', label: 'Body' },
    { cls: 'mt-4 h-11 rounded-xl bg-zinc-900', label: 'Button' },
  ];

  return (
    <div className="grid h-full gap-8 lg:grid-cols-2">
      <div className="flex flex-col">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-500"><Sparkles className="h-3.5 w-3.5 text-[#0d99ff]" /> Prompt</div>
          <p className="mt-3 min-h-[56px] text-lg leading-snug text-zinc-900">
            {PROMPT.slice(0, typed)}
            {!done && <span className="ml-0.5 inline-block h-5 w-0.5 translate-y-1 animate-blink bg-[#0d99ff]" />}
          </p>
        </div>
        <div className="mt-4 space-y-2">
          {['Reading brand tokens', 'Composing layout', 'Applying auto layout', 'Writing copy'].map((s, i) => {
            const on = done && i < 4;
            return (
              <div key={s} className={cn('flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-500', on ? 'bg-emerald-50 text-emerald-800' : 'text-zinc-400')} style={{ transitionDelay: `${i * 180}ms` }}>
                <span className={cn('h-1.5 w-1.5 rounded-full transition-colors', on ? 'bg-emerald-500' : 'bg-zinc-300')} style={{ transitionDelay: `${i * 180}ms` }} />
                {s}
              </div>
            );
          })}
        </div>
        <button onClick={() => setRun((r) => r + 1)} className="mt-auto inline-flex w-fit items-center gap-2 pt-6 text-sm font-medium text-zinc-600 hover:text-zinc-950">
          <RotateCcw className="h-4 w-4" /> Replay
        </button>
      </div>
      <div className="grid place-items-center rounded-2xl bg-zinc-100 p-6" style={{ backgroundImage: 'radial-gradient(#d4d4d8 1px, transparent 1px)', backgroundSize: '14px 14px' }}>
        <div className="w-60 rounded-[28px] border-[6px] border-zinc-900 bg-[#fffaf3] p-4 shadow-2xl">
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-zinc-200" />
          <div className="space-y-2.5">
            {blocks.map((b, i) => (
              <div
                key={`${run}-${i}`}
                className={cn(b.cls, 'transition-all duration-700 ease-spring', done ? 'scale-100 opacity-100' : 'scale-95 opacity-0')}
                style={{ transitionDelay: done ? `${700 + i * 120}ms` : '0ms' }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AutoLayout() {
  const [gap, setGap] = useState(12);
  const [pad, setPad] = useState(16);
  const [dir, setDir] = useState<'row' | 'col'>('col');
  const items = [Bell, LayoutGrid, Palette];
  return (
    <div className="grid h-full gap-8 lg:grid-cols-[1fr_1.3fr]">
      <div className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div>
          <span className="text-xs font-medium text-zinc-500">Direction</span>
          <div className="mt-2 flex gap-1 rounded-lg bg-zinc-100 p-1">
            {(['col', 'row'] as const).map((d) => (
              <button key={d} onClick={() => setDir(d)} aria-label={d === 'col' ? 'Vertical' : 'Horizontal'} className={cn('grid h-8 flex-1 place-items-center rounded-md transition-all', dir === d ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-400 hover:text-zinc-700')}>
                {d === 'col' ? <ArrowDown className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </div>
        {[
          { label: 'Gap', v: gap, set: setGap, max: 40 },
          { label: 'Padding', v: pad, set: setPad, max: 40 },
        ].map((c) => (
          <div key={c.label}>
            <div className="flex justify-between text-xs"><span className="font-medium text-zinc-500">{c.label}</span><span className="font-mono text-zinc-900">{c.v}px</span></div>
            <input type="range" min={0} max={c.max} value={c.v} onChange={(e) => c.set(Number(e.target.value))} className="mt-2 w-full accent-[#0d99ff]" />
          </div>
        ))}
        <p className="text-sm leading-relaxed text-zinc-600">Layouts that behave like code. Resize anything and Lattice reflows it, exactly as CSS flexbox would.</p>
      </div>
      <div className="grid min-h-[320px] place-items-center rounded-2xl bg-zinc-100 p-6">
        <div className="relative rounded-xl border-[1.5px] border-[#0d99ff] bg-white transition-all duration-300 ease-smooth" style={{ padding: pad }}>
          <span className="absolute -top-6 left-0 rounded bg-[#0d99ff] px-1.5 py-0.5 font-mono text-[10px] text-white">Auto layout</span>
          <span className="pointer-events-none absolute inset-x-0 top-0 bg-rose-400/20 transition-all duration-300" style={{ height: pad }} />
          <div className={cn('flex transition-all duration-300', dir === 'col' ? 'flex-col' : 'flex-row')} style={{ gap }}>
            {items.map((Icon, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 transition-all duration-300">
                <Icon className="h-4 w-4 text-zinc-700" />
                <span className="whitespace-nowrap text-sm text-zinc-800">Item {i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const themes = [
  { name: 'Azure', primary: '#0d99ff', surface: '#f0f8ff', text: '#0b2540', radius: 14 },
  { name: 'Ember', primary: '#ea580c', surface: '#fff7ed', text: '#431407', radius: 6 },
  { name: 'Forest', primary: '#059669', surface: '#ecfdf5', text: '#022c22', radius: 22 },
  { name: 'Graphite', primary: '#18181b', surface: '#fafafa', text: '#09090b', radius: 2 },
];

function Tokens() {
  const [t, setT] = useState(themes[0]);
  return (
    <div className="grid h-full gap-8 lg:grid-cols-[1fr_1.3fr]">
      <div className="space-y-2">
        {themes.map((th) => (
          <button key={th.name} onClick={() => setT(th)} className={cn('flex w-full items-center gap-4 rounded-xl border p-3 text-left transition-all', t.name === th.name ? 'border-zinc-900 bg-white shadow-sm' : 'border-zinc-200 bg-white/60 hover:border-zinc-300')}>
            <span className="flex -space-x-1">
              {[th.primary, th.surface, th.text].map((c) => <span key={c} className="h-6 w-6 rounded-full ring-2 ring-white" style={{ background: c }} />)}
            </span>
            <span className="text-sm font-medium text-zinc-900">{th.name}</span>
            <span className="ml-auto font-mono text-xs text-zinc-400">{th.primary}</span>
          </button>
        ))}
      </div>
      <div className="grid min-h-[320px] place-items-center rounded-2xl p-6 transition-colors duration-500" style={{ background: t.surface }}>
        <div className="w-full max-w-xs bg-white p-6 shadow-xl transition-all duration-500" style={{ borderRadius: t.radius, color: t.text }}>
          <div className="grid h-10 w-10 place-items-center text-white transition-all duration-500" style={{ background: t.primary, borderRadius: t.radius * 0.6 }}><Wand2 className="h-5 w-5" /></div>
          <h4 className="mt-5 text-xl font-semibold tracking-tight">Weekly digest</h4>
          <p className="mt-1 text-sm opacity-70">Every token updates across 1,240 components instantly.</p>
          <button className="mt-6 h-10 w-full text-sm font-medium text-white transition-all duration-500" style={{ background: t.primary, borderRadius: t.radius * 0.7 }}>Subscribe</button>
        </div>
      </div>
    </div>
  );
}

const tabs = [
  { id: 'prompt', label: 'Prompt to UI', icon: Sparkles, el: PromptToUI },
  { id: 'layout', label: 'Auto layout', icon: LayoutGrid, el: AutoLayout },
  { id: 'tokens', label: 'Design tokens', icon: Palette, el: Tokens },
];

export function AiFeatures() {
  const [active, setActive] = useState(0);
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const [pill, setPill] = useState({ left: 0, width: 0 });
  useLayoutEffect(() => {
    const el = refs.current[active];
    if (el) setPill({ left: el.offsetLeft, width: el.offsetWidth });
  }, [active]);
  const Active = tabs[active].el;

  return (
    <section id="lattice-ai" className="scroll-mt-16 bg-zinc-50 py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHead
          center tag="Lattice AI" color="#0d99ff"
          title={<>Your newest teammate <span className="text-zinc-400">never sleeps.</span></>}
          body="AI that understands your design system. It drafts, rearranges and tidies, then hands the pen right back."
        />
        <div className="mt-12 flex justify-center">
          <div className="relative flex rounded-xl border border-zinc-200 bg-white p-1 shadow-sm">
            <span className="absolute inset-y-1 rounded-lg bg-zinc-950 transition-all duration-500 ease-spring" style={pill} />
            {tabs.map((t, i) => (
              <button key={t.id} ref={(el) => { refs.current[i] = el; }} onClick={() => setActive(i)} className={cn('relative z-10 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-300', active === i ? 'text-white' : 'text-zinc-600 hover:text-zinc-950')}>
                <t.icon className="h-4 w-4" /><span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div key={active} className="mt-10 rounded-3xl border border-zinc-200 bg-white/60 p-4 animate-fade-up md:p-8">
          <Active />
        </div>
      </div>
    </section>
  );
}
