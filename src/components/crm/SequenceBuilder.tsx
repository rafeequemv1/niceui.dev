import { useEffect, useRef, useState } from 'react';
import { CalendarDays, Hourglass, Linkedin, Mail, Pause, Phone, Play, Plus, Trash2, Users } from 'lucide-react';
import { cn } from '@/lib/cn';

export type StepKind = 'email' | 'linkedin' | 'call' | 'wait';
export type SequenceStep = { id: string; kind: StepKind; day: number; title: string; detail: string; sent: number; opened?: number; replied: number };

const KIND = {
  email: { icon: Mail, label: 'Email', tone: 'bg-sky-500/15 text-sky-300' },
  linkedin: { icon: Linkedin, label: 'LinkedIn', tone: 'bg-indigo-500/15 text-indigo-300' },
  call: { icon: Phone, label: 'Call', tone: 'bg-emerald-500/15 text-emerald-300' },
  wait: { icon: Hourglass, label: 'Wait', tone: 'bg-white/[0.06] text-ink-400' },
} as const;

const NEW_STEP: Record<StepKind, { title: string; detail: string }> = {
  email: { title: 'Follow-up email', detail: 'Re: {{company}} and your pipeline' },
  linkedin: { title: 'Connect on LinkedIn', detail: 'Personal note, under 300 characters' },
  call: { title: 'Call', detail: 'Ask about timing and decision makers' },
  wait: { title: 'Wait 2 days', detail: 'Skip if they reply' },
};

const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);

function Rate({ label, value, of, tone }: { label: string; value: number; of: number; tone: string }) {
  const p = pct(value, of);
  return (
    <div className="min-w-0">
      <div className="flex items-baseline justify-between gap-2 text-[10.5px]">
        <span className="text-ink-500">{label}</span>
        <span className="font-mono tabular-nums text-ink-300">{p}%</span>
      </div>
      <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/[0.06]">
        <div className={cn('h-full rounded-full transition-[width] duration-700 ease-smooth', tone)} style={{ width: `${p}%` }} />
      </div>
    </div>
  );
}

export type SequenceBuilderProps = { name: string; enrolled: number; steps: SequenceStep[]; className?: string };

export function SequenceBuilder({ name, enrolled, steps: initial, className }: SequenceBuilderProps) {
  const [steps, setSteps] = useState(initial);
  const [running, setRunning] = useState(true);
  const [adding, setAdding] = useState(false);
  const [fresh, setFresh] = useState<string | null>(null);
  const timer = useRef<number>();

  // Simulated sends: people flow from step to step while the sequence is live.
  useEffect(() => {
    if (!running || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    timer.current = window.setInterval(() => {
      setSteps((ss) =>
        ss.map((s, i) => {
          if (s.kind === 'wait') return s;
          const cap = i === 0 ? enrolled : Math.round(enrolled * Math.pow(0.82, i));
          if (s.sent >= cap) return s;
          const sent = s.sent + 1;
          return { ...s, sent, opened: s.opened === undefined ? undefined : s.opened + (Math.random() < 0.6 ? 1 : 0), replied: s.replied + (Math.random() < 0.12 ? 1 : 0) };
        }),
      );
    }, 900);
    return () => window.clearInterval(timer.current);
  }, [running, enrolled]);

  const totals = steps.reduce((a, s) => ({ sent: a.sent + s.sent, opened: a.opened + (s.opened ?? 0), replied: a.replied + s.replied }), { sent: 0, opened: 0, replied: 0 });
  const emails = steps.filter((s) => s.kind === 'email').reduce((a, s) => a + s.sent, 0);

  const add = (kind: StepKind) => {
    const id = `s${Date.now()}`;
    const day = (steps[steps.length - 1]?.day ?? 0) + (kind === 'wait' ? 2 : 1);
    setSteps((ss) => [...ss, { id, kind, day, ...NEW_STEP[kind], sent: 0, opened: kind === 'email' ? 0 : undefined, replied: 0 }]);
    setFresh(id);
    setAdding(false);
  };

  return (
    <div className={cn('w-full rounded-2xl bg-ink-900 shadow-card', className)}>
      <header className="flex flex-wrap items-center gap-3 border-b border-white/5 px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink-50">{name}</p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[11.5px] text-ink-500">
            <span className="flex items-center gap-1 whitespace-nowrap">
              <Users className="h-3 w-3" /> {enrolled} enrolled
            </span>
            <span className="text-ink-700">·</span>
            <span className="flex items-center gap-1 whitespace-nowrap">
              <CalendarDays className="h-3 w-3" /> {steps[steps.length - 1]?.day ?? 0} days
            </span>
          </p>
        </div>
        <span className={cn('flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium', running ? 'bg-emerald-500/10 text-emerald-300' : 'bg-amber-500/10 text-amber-300')}>
          <span className={cn('h-1.5 w-1.5 rounded-full', running ? 'animate-pulse bg-emerald-400' : 'bg-amber-400')} />
          {running ? 'Active' : 'Paused'}
        </span>
        <button onClick={() => setRunning((r) => !r)} className="focus-ring flex h-8 items-center gap-1.5 rounded-lg bg-white/5 px-3 text-[12px] text-ink-100 transition-colors hover:bg-white/10">
          {running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {running ? 'Pause' : 'Resume'}
        </button>
      </header>

      <div className="grid grid-cols-3 divide-x divide-white/5 border-b border-white/5">
        {[
          ['Sent', totals.sent, ''],
          ['Open rate', pct(totals.opened, emails), '%'],
          ['Reply rate', pct(totals.replied, totals.sent), '%'],
        ].map(([k, v, u]) => (
          <div key={k as string} className="px-4 py-2.5">
            <p className="text-[10.5px] uppercase tracking-wider text-ink-500">{k}</p>
            <p className="font-mono text-[18px] tabular-nums text-ink-50">
              {v}
              <span className="text-[12px] text-ink-500">{u}</span>
            </p>
          </div>
        ))}
      </div>

      <div className="relative px-4 py-4">
        <span aria-hidden className="absolute bottom-10 left-[83.5px] top-7 w-px bg-white/[0.07]">
          {running && <span className="absolute left-1/2 top-0 h-6 w-[3px] -translate-x-1/2 rounded-full bg-gradient-to-b from-transparent via-brand-400 to-transparent [animation:seq-flow_2.4s_linear_infinite]" />}
        </span>
        <style>{'@keyframes seq-flow{from{top:0;opacity:0}15%{opacity:1}85%{opacity:1}to{top:calc(100% - 24px);opacity:0}}'}</style>
        <ol>
        {steps.map((s) => {
          const K = KIND[s.kind];
          return (
            <li key={s.id} className={cn('group relative flex gap-3 py-1.5', fresh === s.id && 'animate-fade-up')}>
              <span className="w-[42px] shrink-0 pt-2 text-right font-mono text-[10px] text-ink-500">Day {s.day}</span>
              <span className={cn('relative z-10 mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-lg ring-4 ring-ink-900', K.tone)}>
                <K.icon className="h-3.5 w-3.5" />
              </span>
              <div className={cn('min-w-0 flex-1 rounded-xl px-3 py-2 transition-colors', s.kind === 'wait' ? 'py-1.5' : 'bg-white/[0.03] ring-1 ring-white/[0.05] group-hover:bg-white/[0.05]')}>
                <div className="flex items-center gap-2">
                  <p className={cn('min-w-0 flex-1 text-[12.5px] leading-snug [overflow-wrap:anywhere]', s.kind === 'wait' ? 'text-ink-400' : 'font-medium text-ink-100')}>{s.title}</p>
                  {s.kind !== 'wait' && <span className="shrink-0 font-mono text-[10.5px] tabular-nums text-ink-400">{s.sent} sent</span>}
                  <button onClick={() => setSteps((ss) => ss.filter((x) => x.id !== s.id))} aria-label={`Remove ${s.title}`} className="focus-ring grid h-6 w-6 shrink-0 place-items-center rounded-md text-ink-600 opacity-0 transition-opacity hover:bg-white/5 hover:text-rose-300 focus:opacity-100 group-hover:opacity-100">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
                <p className="truncate text-[11.5px] text-ink-500">{s.detail}</p>
                {s.kind !== 'wait' && (
                  <div className={cn('mt-2 grid gap-3', s.opened !== undefined ? 'grid-cols-2' : 'grid-cols-1')}>
                    {s.opened !== undefined && <Rate label="Opened" value={s.opened} of={s.sent} tone="bg-sky-400" />}
                    <Rate label="Replied" value={s.replied} of={s.sent} tone="bg-emerald-400" />
                  </div>
                )}
              </div>
            </li>
          );
        })}
        <li className="relative flex gap-3 pt-2">
          <span className="w-[42px] shrink-0" />
          <div className="relative">
            <button onClick={() => setAdding((a) => !a)} aria-expanded={adding} className="focus-ring relative z-10 flex h-7 items-center gap-1.5 rounded-lg border border-dashed border-white/15 px-2.5 text-[12px] text-ink-300 transition-colors hover:border-brand-400/50 hover:text-ink-50">
              <Plus className="h-3.5 w-3.5" /> Add step
            </button>
            {adding && (
              <div className="absolute left-0 top-[calc(100%+6px)] z-20 flex gap-1 rounded-xl bg-ink-850 p-1 shadow-pop animate-scale-in" role="menu">
                {(Object.keys(KIND) as StepKind[]).map((k) => {
                  const K = KIND[k];
                  return (
                    <button key={k} role="menuitem" onClick={() => add(k)} className="focus-ring flex flex-col items-center gap-1 rounded-lg px-2.5 py-2 text-[11px] text-ink-300 transition-colors hover:bg-white/5 hover:text-ink-50">
                      <span className={cn('grid h-7 w-7 place-items-center rounded-lg', K.tone)}>
                        <K.icon className="h-3.5 w-3.5" />
                      </span>
                      {K.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </li>
        </ol>
      </div>
    </div>
  );
}

/* ——— demo ——— */

const DEMO_STEPS: SequenceStep[] = [
  { id: '1', kind: 'email', day: 1, title: 'Intro email', detail: 'Quick idea for {{company}}’s pipeline reviews', sent: 128, opened: 79, replied: 11 },
  { id: '2', kind: 'linkedin', day: 2, title: 'Connect on LinkedIn', detail: 'Short note mentioning the intro email', sent: 104, replied: 9 },
  { id: '3', kind: 'wait', day: 4, title: 'Wait 2 days', detail: 'Skip if they reply', sent: 0, replied: 0 },
  { id: '4', kind: 'email', day: 5, title: 'Case study follow-up', detail: 'How Brightfold cut forecast prep by 6 hours', sent: 76, opened: 41, replied: 7 },
  { id: '5', kind: 'call', day: 7, title: 'Call', detail: 'Ask about timing and who else is involved', sent: 52, replied: 6 },
];

export function SequenceBuilderDemo() {
  return (
    <div className="mx-auto w-full max-w-lg">
      <SequenceBuilder name="Q4 outbound · Heads of RevOps" enrolled={160} steps={DEMO_STEPS} />
    </div>
  );
}
