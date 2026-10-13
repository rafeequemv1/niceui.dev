import { useState } from 'react';
import { ArrowUp, Bold, Check, Italic, List, PanelRight, Sparkles, Wand2, X } from 'lucide-react';
import { cn } from '@/lib/cn';

type Block = { id: string; text: string; kind?: 'p' | 'tldr' | 'list' };
type Suggestion = { id: string; title: string; target: string; before?: string; after: string; apply: (b: Block[]) => Block[] };

const DOC: Block[] = [
  { id: 'intro', text: 'This quarter was a quarter in which the team worked on a lot of different things across many different areas of the product, and we made progress on most of them.' },
  { id: 'growth', text: 'Weekly active teams grew 38% to 1,640, driven mostly by the new onboarding checklist and the Slack integration launch in August.' },
  { id: 'perf', text: 'Mistakes were made in the September billing migration, and some customers were double-charged for about four hours.' },
];

const SUGGESTIONS: Suggestion[] = [
  {
    id: 's1', title: 'Tighten the intro', target: 'intro',
    before: 'This quarter was a quarter in which the team worked on a lot…',
    after: 'Q3 was about focus: we shipped onboarding, Slack and faster billing.',
    apply: (b) => b.map((x) => (x.id === 'intro' ? { ...x, text: 'Q3 was about focus: we shipped a new onboarding flow, the Slack integration and a faster billing system.' } : x)),
  },
  {
    id: 's2', title: 'Own the billing incident', target: 'perf',
    before: 'Mistakes were made in the September billing migration…',
    after: 'We double-charged some customers for four hours. All were refunded within a day.',
    apply: (b) => b.map((x) => (x.id === 'perf' ? { ...x, text: 'Our September billing migration double-charged 212 customers for about four hours. Every affected customer was refunded within 24 hours, and we added a dry-run step to future migrations.' } : x)),
  },
  {
    id: 's3', title: 'Add a TL;DR', target: 'top',
    after: 'Teams +38%, Slack launched, billing incident resolved.',
    apply: (b) => [{ id: 'tldr', kind: 'tldr', text: 'TL;DR — Weekly active teams up 38%, Slack integration launched, billing incident fully refunded.' }, ...b],
  },
  {
    id: 's4', title: 'Add next steps', target: 'end',
    after: 'Q4 priorities: SSO, usage-based pricing, mobile beta.',
    apply: (b) => [...b, { id: 'next', kind: 'list', text: 'Ship SSO for Enterprise|Launch usage-based pricing|Open the mobile beta to 500 teams' }],
  },
];

export type AISidebarProps = { title?: string; defaultOpen?: boolean; onApply?: (suggestionId: string) => void; className?: string };

export function AISidebar({ title = 'Q3 Product Update', defaultOpen = true, onApply, className }: AISidebarProps) {
  const [blocks, setBlocks] = useState(DOC);
  const [open, setOpen] = useState(defaultOpen);
  const [applied, setApplied] = useState<string[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [flash, setFlash] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);

  const apply = (s: Suggestion) => {
    setBlocks((b) => s.apply(b));
    setApplied((a) => [...a, s.id]);
    onApply?.(s.id);
    const id = s.target === 'top' ? 'tldr' : s.target === 'end' ? 'next' : s.target;
    setFlash(id);
    window.setTimeout(() => setFlash((f) => (f === id ? null : f)), 1400);
  };
  const reset = () => {
    setBlocks(DOC);
    setApplied([]);
    setDismissed([]);
  };
  const remaining = SUGGESTIONS.filter((s) => !applied.includes(s.id) && !dismissed.includes(s.id)).length;

  return (
    <div className={cn('relative flex h-[480px] w-full overflow-hidden rounded-2xl bg-ink-900 shadow-card', className)}>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-1 border-b border-white/5 px-3 py-2">
          {[Bold, Italic, List].map((Icon, i) => (
            <button key={i} className="focus-ring flex h-7 w-7 items-center justify-center rounded-md text-ink-400 transition-colors hover:bg-white/5 hover:text-ink-100" aria-label="Format">
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}
          <span className="ml-2 text-xs text-ink-500">Saved</span>
          <button
            onClick={() => setOpen((o) => !o)}
            className={cn('focus-ring ml-auto flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors', open ? 'bg-brand-500/15 text-brand-200' : 'text-ink-300 hover:bg-white/5')}
          >
            <PanelRight className="h-3.5 w-3.5" /> Copilot
            {remaining > 0 && !open && <span className="flex h-4 min-w-[16px] animate-scale-in items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] text-white">{remaining}</span>}
          </button>
        </div>
        <article className="flex-1 overflow-y-auto px-6 py-6 sm:px-10">
          <p className="text-xs text-ink-500">Product · Updated just now</p>
          <h2 className="mt-1 text-2xl font-medium text-ink-50">{title}</h2>
          <div className="mt-5 space-y-3">
            {blocks.map((b) => {
              const target = !!hover && SUGGESTIONS.find((s) => s.id === hover)?.target === b.id;
              const cls = cn(
                '-mx-2 rounded-lg px-2 py-1 text-sm leading-relaxed transition-all duration-700',
                flash === b.id ? 'bg-brand-500/15 text-ink-50' : 'text-ink-300',
                target && 'bg-amber-500/10 shadow-[inset_2px_0_0_theme(colors.amber.400)]',
              );
              if (b.kind === 'list')
                return (
                  <ul key={b.id} className={cn(cls, 'animate-fade-up space-y-1')}>
                    {b.text.split('|').map((t) => <li key={t} className="flex gap-2"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand-400" />{t}</li>)}
                  </ul>
                );
              return (
                <p key={b.id + b.text.length} className={cn(cls, 'animate-fade-in', b.kind === 'tldr' && 'animate-fade-up border-l-2 border-brand-400 bg-brand-500/[0.06] font-medium')}>
                  {b.text}
                </p>
              );
            })}
          </div>
        </article>
      </div>
      <aside className={cn('absolute inset-y-0 right-0 z-10 flex flex-col overflow-hidden border-l border-white/5 bg-ink-950/95 backdrop-blur transition-[width] duration-500 ease-smooth sm:relative', open ? 'w-72' : 'w-0')}>
        <div className="flex w-72 items-center justify-between px-4 py-3">
          <span className="flex items-center gap-2 text-sm font-medium text-ink-50"><Sparkles className="h-4 w-4 text-brand-300" /> Suggestions</span>
          <button onClick={reset} className="focus-ring rounded-md px-1.5 py-0.5 text-[11px] text-ink-500 transition-colors hover:text-ink-200">Reset</button>
        </div>
        <div className="w-72 flex-1 space-y-2 overflow-y-auto px-3 pb-3">
          {SUGGESTIONS.filter((s) => !dismissed.includes(s.id)).map((s, i) => {
            const done = applied.includes(s.id);
            return (
              <div
                key={s.id}
                onPointerEnter={() => !done && setHover(s.id)}
                onPointerLeave={() => setHover(null)}
                className={cn('animate-fade-up rounded-xl bg-ink-900 p-3 shadow-hairline transition-all duration-300', done ? 'opacity-60' : 'hover:bg-ink-850')}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <p className="flex items-center gap-1.5 text-xs font-medium text-ink-100"><Wand2 className="h-3.5 w-3.5 text-brand-300" />{s.title}</p>
                <div className={cn('grid transition-all duration-300 ease-smooth', done ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr]')}>
                  <div className="overflow-hidden">
                    {s.before && <p className="mt-2 text-xs text-rose-300/70 line-through decoration-rose-400/50">{s.before}</p>}
                    <p className="mt-1.5 text-xs text-emerald-300">{s.after}</p>
                    <div className="mt-2.5 flex gap-1.5">
                      <button onClick={() => { apply(s); setHover(null); }} className="focus-ring flex h-7 items-center gap-1 rounded-md bg-ink-50 px-2.5 text-xs font-medium text-ink-950 transition-all hover:bg-white active:scale-95"><Check className="h-3 w-3" /> Apply</button>
                      <button onClick={() => setDismissed((d) => [...d, s.id])} className="focus-ring flex h-7 items-center gap-1 rounded-md px-2 text-xs text-ink-400 transition-colors hover:bg-white/5 hover:text-ink-100"><X className="h-3 w-3" /> Dismiss</button>
                    </div>
                  </div>
                </div>
                {done && <p className="mt-1 flex animate-fade-in items-center gap-1 text-[11px] text-emerald-400"><Check className="h-3 w-3" /> Applied to document</p>}
              </div>
            );
          })}
          {remaining === 0 && <p className="animate-fade-in px-2 py-4 text-center text-xs text-ink-500">All caught up — your update reads great.</p>}
        </div>
        <div className="w-72 p-3">
          <div className="flex items-center gap-2 rounded-xl bg-ink-900 py-1.5 pl-3 pr-1.5 shadow-hairline focus-within:shadow-glow">
            <input placeholder="Ask Copilot to edit…" className="min-w-0 flex-1 bg-transparent text-xs text-ink-100 outline-none placeholder:text-ink-500" />
            <button className="focus-ring flex h-6 w-6 items-center justify-center rounded-md bg-brand-500 text-white transition-transform active:scale-90" aria-label="Send"><ArrowUp className="h-3.5 w-3.5" /></button>
          </div>
        </div>
      </aside>
    </div>
  );
}

export function AISidebarDemo() {
  return <AISidebar />;
}
