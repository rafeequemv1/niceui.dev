import { useEffect, useState } from 'react';
import { CalendarDays, Check, CircleCheck, Clock3, Mail, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/cn';

export type DealStage = 'Lead' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Won';
const STEPS: { id: DealStage; prob: number }[] = [
  { id: 'Lead', prob: 10 },
  { id: 'Qualified', prob: 30 },
  { id: 'Proposal', prob: 55 },
  { id: 'Negotiation', prob: 75 },
  { id: 'Won', prob: 100 },
];
export type DealContact = { name: string; role: string; title: string };
export type DealCardProps = {
  name: string;
  company: string;
  amount: number;
  closeDate: string;
  owner: string;
  initialStage?: DealStage;
  /** Days since the last logged activity; drives the health indicator. */
  lastActivityDays: number;
  nextStep: string;
  contacts: DealContact[];
  suggestion?: string;
  className?: string;
};

function health(days: number) {
  if (days <= 3) return { label: 'Healthy', dot: 'bg-emerald-400', text: 'text-emerald-300' };
  if (days <= 10) return { label: 'At risk', dot: 'bg-amber-400', text: 'text-amber-300' };
  return { label: 'Stalled', dot: 'bg-rose-400', text: 'text-rose-300' };
}

function Ring({ value, won }: { value: number; won: boolean }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid h-16 w-16 shrink-0 place-items-center">
      <svg viewBox="0 0 64 64" className="absolute inset-0 -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
        <circle cx="32" cy="32" r={r} fill="none" stroke={won ? '#34d399' : '#38bdf8'} strokeWidth="5" strokeLinecap="round" strokeDasharray={`${(value / 100) * c} ${c}`} className="transition-[stroke-dasharray] duration-700 ease-smooth" />
      </svg>
      <span className="text-center leading-none">
        <span className="block font-mono text-[15px] font-medium tabular-nums text-ink-50">{value}%</span>
        <span className="mt-0.5 block text-[9px] uppercase tracking-wider text-ink-500">win</span>
      </span>
    </div>
  );
}

export function DealCard({ name, company, amount, closeDate, owner, initialStage = 'Proposal', lastActivityDays, nextStep, contacts, suggestion, className }: DealCardProps) {
  const [stage, setStage] = useState<DealStage>(initialStage);
  const [stepDone, setStepDone] = useState(false);
  const [ai, setAi] = useState<'idle' | 'drafting' | 'ready' | 'dismissed'>('idle');
  const idx = STEPS.findIndex((s) => s.id === stage);
  const prob = STEPS[idx].prob;
  const won = stage === 'Won';
  const h = health(lastActivityDays);

  useEffect(() => {
    if (ai !== 'drafting') return;
    const id = window.setTimeout(() => setAi('ready'), 1400);
    return () => clearTimeout(id);
  }, [ai]);

  return (
    <div className={cn('w-full overflow-hidden rounded-2xl bg-ink-900 shadow-card', className)}>
      <div className="flex items-start gap-4 p-5">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-400/30 to-violet-500/20 text-[15px] font-bold text-brand-100 ring-1 ring-white/10">{company[0]}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12.5px] text-ink-400">{company}</p>
          <h3 className="truncate text-[17px] font-semibold tracking-[-0.02em] text-ink-50">{name}</h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ink-400">
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" /> Closes {closeDate}
            </span>
            <span className={cn('flex items-center gap-1.5', h.text)}>
              <span className={cn('h-1.5 w-1.5 rounded-full', h.dot, h.label !== 'Healthy' && 'animate-pulse')} />
              {h.label}
              <span className="text-ink-500">· {lastActivityDays}d since activity</span>
            </span>
          </div>
        </div>
        <div className="hidden text-right sm:block">
          <p className="font-mono text-[22px] font-medium tabular-nums tracking-[-0.03em] text-ink-50">${amount.toLocaleString('en-US')}</p>
          <p className="text-[11.5px] text-ink-500">Owner · {owner}</p>
        </div>
      </div>

      <div className="px-5">
        <div className="flex items-center gap-4 rounded-xl bg-white/[0.02] p-3 ring-1 ring-white/[0.05]">
          <Ring value={prob} won={won} />
          <div className="min-w-0 flex-1">
            <div className="flex gap-1" role="radiogroup" aria-label="Deal stage">
              {STEPS.map((s, i) => (
                <button
                  key={s.id}
                  role="radio"
                  aria-checked={stage === s.id}
                  onClick={() => setStage(s.id)}
                  title={s.id}
                  className={cn(
                    'focus-ring h-2 flex-1 rounded-full transition-colors duration-300',
                    i < idx ? (won ? 'bg-emerald-400/70' : 'bg-brand-400/60') : i === idx ? (won ? 'bg-emerald-400' : 'bg-brand-400') : 'bg-white/[0.08] hover:bg-white/15',
                  )}
                />
              ))}
            </div>
            <div className="mt-2 flex items-center justify-between text-[11.5px]">
              <span className="text-ink-500">
                Stage <span className={cn('font-medium', won ? 'text-emerald-300' : 'text-ink-100')}>{stage}</span>
                <span className="hidden sm:inline"> · click a segment to move</span>
              </span>
              <span className="font-mono tabular-nums text-ink-400 sm:hidden">${Math.round(amount / 1000)}k</span>
              <span className="hidden font-mono tabular-nums text-ink-400 sm:inline">
                weighted ${Math.round((amount * prob) / 100).toLocaleString('en-US')}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-5 sm:grid-cols-2">
        <div className="rounded-xl bg-white/[0.02] p-3 ring-1 ring-white/[0.05]">
          <p className="text-[10.5px] font-medium uppercase tracking-wider text-ink-500">Next step</p>
          <button onClick={() => setStepDone((d) => !d)} aria-pressed={stepDone} className="focus-ring mt-2 flex w-full items-start gap-2 rounded-lg text-left">
            <span className={cn('mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full ring-1 transition-colors', stepDone ? 'bg-emerald-500 ring-emerald-400 text-ink-950' : 'ring-white/20')}>
              {stepDone && <Check className="h-3 w-3" strokeWidth={3} />}
            </span>
            <span className={cn('text-[13px] leading-snug transition-colors', stepDone ? 'text-ink-500 line-through' : 'text-ink-100')}>{nextStep}</span>
          </button>
          <p className="mt-2 flex items-center gap-1 pl-6 text-[11px] text-ink-500">
            <Clock3 className="h-3 w-3" /> Thu, 2:00 PM
          </p>
        </div>
        <div className="rounded-xl bg-white/[0.02] p-3 ring-1 ring-white/[0.05]">
          <p className="text-[10.5px] font-medium uppercase tracking-wider text-ink-500">Buying group</p>
          <ul className="mt-2 space-y-1.5">
            {contacts.map((c) => (
              <li key={c.name} className="flex items-center gap-2">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/[0.07] text-[9.5px] font-semibold text-ink-200">
                  {c.name
                    .split(' ')
                    .map((w) => w[0])
                    .join('')}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] text-ink-100">{c.name}</span>
                  <span className="block truncate text-[11px] text-ink-500">{c.title}</span>
                </span>
                <span className={cn('shrink-0 rounded-full px-1.5 py-px text-[10px] font-medium ring-1', c.role === 'Champion' ? 'bg-emerald-500/10 text-emerald-300 ring-emerald-400/20' : c.role === 'Economic buyer' ? 'bg-brand-500/10 text-brand-200 ring-brand-400/20' : 'bg-white/[0.04] text-ink-300 ring-white/10')}>
                  {c.role}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {suggestion && ai !== 'dismissed' && (
        <div className="mx-5 mb-5 rounded-xl bg-gradient-to-br from-brand-500/[0.09] to-violet-500/[0.06] p-3.5 ring-1 ring-brand-400/20">
          <div className="flex items-start gap-2.5">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-brand-500/20 text-brand-200">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium uppercase tracking-wider text-brand-300">Next best action</p>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-100">{suggestion}</p>
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                {ai === 'ready' ? (
                  <span className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-[12px] text-emerald-300 ring-1 ring-emerald-400/20 animate-scale-in">
                    <CircleCheck className="h-3.5 w-3.5" /> Draft ready in Outbox
                  </span>
                ) : (
                  <button onClick={() => setAi('drafting')} disabled={ai === 'drafting'} className="focus-ring flex items-center gap-1.5 rounded-lg bg-brand-500 px-2.5 py-1 text-[12px] font-medium text-white transition-colors hover:bg-brand-400 disabled:opacity-80">
                    <Mail className="h-3.5 w-3.5" /> {ai === 'drafting' ? <span className="shimmer-text">Drafting email…</span> : 'Draft email'}
                  </button>
                )}
                <button onClick={() => setAi('dismissed')} className="focus-ring flex items-center gap-1 rounded-lg px-2 py-1 text-[12px] text-ink-400 transition-colors hover:bg-white/5 hover:text-ink-100">
                  <X className="h-3.5 w-3.5" /> Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function DealCardDemo() {
  return (
    <div className="mx-auto w-full max-w-[620px]">
      <DealCard
        name="Platform rollout"
        company="Sorabase"
        amount={120000}
        closeDate="Nov 12"
        owner="Leo Park"
        initialStage="Negotiation"
        lastActivityDays={6}
        nextStep="Security review call with their IT lead"
        contacts={[
          { name: 'Hana Kobayashi', role: 'Champion', title: 'Head of Operations' },
          { name: 'Daichi Mori', role: 'Economic buyer', title: 'CFO' },
          { name: 'Emi Sato', role: 'Legal', title: 'Counsel' },
        ]}
        suggestion="Send the security questionnaire before Thursday's call. Deals at this stage close twice as fast when legal sees it early."
      />
    </div>
  );
}
