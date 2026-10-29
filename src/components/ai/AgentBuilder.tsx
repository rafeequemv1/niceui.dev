import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowUp, Bot, Calculator, CalendarDays, Check, FileText, Globe, Headphones, Leaf, Library, Loader2, Plus, Rocket, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/cn';

const AVATARS = [
  { icon: Sparkles, className: 'bg-brand-500/15 text-brand-300 ring-brand-400/40' },
  { icon: Bot, className: 'bg-violet-500/15 text-violet-300 ring-violet-400/40' },
  { icon: Rocket, className: 'bg-amber-500/15 text-amber-300 ring-amber-400/40' },
  { icon: Leaf, className: 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/40' },
  { icon: Headphones, className: 'bg-rose-500/15 text-rose-300 ring-rose-400/40' },
];
const MODELS = ['Nova Pro', 'Nova Mini', 'Atlas Reasoner'];
const TOOLS = [
  { id: 'web', label: 'Web search', hint: 'Fresh answers from the web', icon: Globe },
  { id: 'calendar', label: 'Calendar', hint: 'Find and book times', icon: CalendarDays },
  { id: 'code', label: 'Code interpreter', hint: 'Run quick calculations', icon: Calculator },
  { id: 'knowledge', label: 'Knowledge', hint: 'Answer from your files', icon: Library },
] as const;
type ToolId = (typeof TOOLS)[number]['id'];
const SPARE_FILES = ['benefits-2026.pdf', 'office-map.png', 'security-policy.md'];

export type AgentConfig = {
  name: string;
  avatar: number;
  instructions: string;
  model: string;
  tools: Record<ToolId, boolean>;
  files: string[];
  creativity: number;
};
type Msg = { id: number; role: 'user' | 'agent'; text: string; used?: string[] };

const tone = (c: number) => (c < 34 ? 'Precise' : c < 67 ? 'Balanced' : 'Playful');

function list(items: string[]) {
  if (items.length <= 1) return items[0] ?? 'answer questions';
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

/** The first message the agent sends, derived from its settings. */
export function greeting(c: AgentConfig) {
  const can = list(
    [c.tools.knowledge && c.files.length ? `answer from ${c.files.length} file${c.files.length > 1 ? 's' : ''}` : '', c.tools.calendar ? 'book time on calendars' : '', c.tools.web ? 'search the web' : '', c.tools.code ? 'run quick calculations' : ''].filter(Boolean),
  );
  const name = c.name.trim() || 'Your agent';
  if (c.creativity < 34) return `${name}. I can ${can}. What do you need?`;
  if (c.creativity < 67) return `Hi, I'm ${name}. I can ${can}. How can I help today?`;
  return `Hey there, ${name} here and ready to go. I can ${can}, so throw anything at me.`;
}

function Toggle({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} onClick={onClick} className={cn('focus-ring relative h-5 w-9 shrink-0 rounded-full transition-colors duration-300', on ? 'bg-brand-500' : 'bg-white/10')}>
      <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all duration-300 ease-spring', on ? 'left-[18px]' : 'left-0.5')} />
    </button>
  );
}

function Field({ label, aside, children }: { label: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium uppercase tracking-wider text-ink-500">{label}</span>
        {aside}
      </div>
      {children}
    </div>
  );
}

export type AgentBuilderProps = { initial: AgentConfig; className?: string };

/** A no-code agent builder: settings on the left, a live test chat on the right that reflects every change. */
export function AgentBuilder({ initial, className }: AgentBuilderProps) {
  const [c, setC] = useState(initial);
  const [publish, setPublish] = useState<'idle' | 'busy' | 'done'>('done');
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: 1, role: 'user', text: 'When is my laptop pickup?' },
    { id: 2, role: 'agent', text: 'Tuesday at 10:00 at the IT desk on the 3rd floor. I added it to your calendar.', used: ['it-setup.md', 'Calendar'] },
  ]);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const timers = useRef<number[]>([]);
  const list$ = useRef<HTMLDivElement>(null);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => {
    const el = list$.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [msgs, typing]);

  const set = (patch: Partial<AgentConfig>) => {
    setC((x) => ({ ...x, ...patch }));
    setPublish('idle');
  };
  const Avatar = AVATARS[c.avatar];
  const tokens = Math.ceil(c.instructions.length / 4);

  const send = (e: FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || typing) return;
    setDraft('');
    setMsgs((m) => [...m, { id: Date.now(), role: 'user', text }]);
    setTyping(true);
    const used = [c.tools.knowledge && c.files[0], c.tools.web && /news|latest|today|weather/i.test(text) ? 'Web search' : ''].filter(Boolean) as string[];
    const reply =
      c.creativity < 34
        ? `Short answer: check ${c.files[0] ?? 'the handbook'}, section 2. I can book a follow-up if you need it.`
        : c.creativity < 67
          ? `Good question. According to ${c.files[0] ?? 'our docs'}, you can sort that out in your first week. Want me to set a reminder?`
          : `Love this one! ${c.files[0] ?? 'The docs'} has the details, and I can turn it into a tiny checklist for you.`;
    timers.current.push(
      window.setTimeout(() => {
        setTyping(false);
        setMsgs((m) => [...m, { id: Date.now(), role: 'agent', text: reply, used }]);
      }, 900),
    );
  };

  const doPublish = () => {
    setPublish('busy');
    timers.current.push(window.setTimeout(() => setPublish('done'), 1200));
  };

  return (
    <div className={cn('grid w-full grid-cols-[minmax(0,1fr)] overflow-hidden rounded-2xl bg-ink-900 shadow-card md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]', className)}>
      <section className="space-y-4 border-white/5 p-4 md:max-h-[560px] md:overflow-y-auto md:border-r [scrollbar-width:thin]">
        <Field label="Identity">
          <div className="flex items-center gap-2">
            <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1 transition-all', Avatar.className)}>
              <Avatar.icon className="h-5 w-5" />
            </span>
            <input value={c.name} onChange={(e) => set({ name: e.target.value })} aria-label="Agent name" className="h-10 min-w-0 flex-1 rounded-xl bg-ink-950/60 px-3 text-sm text-ink-50 outline-none ring-1 ring-white/10 focus:ring-brand-400/50" />
          </div>
          <div className="mt-2 flex gap-1.5" role="radiogroup" aria-label="Avatar">
            {AVATARS.map((a, i) => (
              <button key={i} role="radio" aria-checked={c.avatar === i} aria-label={`Avatar ${i + 1}`} onClick={() => set({ avatar: i })} className={cn('focus-ring grid h-7 w-7 place-items-center rounded-lg ring-1 transition-all', a.className, c.avatar === i ? 'scale-110' : 'opacity-50 ring-transparent hover:opacity-90')}>
                <a.icon className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>
        </Field>

        <Field label="Instructions" aside={<span className="font-mono text-[10.5px] tabular-nums text-ink-500">~{tokens} tokens</span>}>
          <textarea value={c.instructions} onChange={(e) => set({ instructions: e.target.value })} rows={3} aria-label="Instructions" className="w-full resize-none rounded-xl bg-ink-950/60 px-3 py-2 text-[13px] leading-relaxed text-ink-200 outline-none ring-1 ring-white/10 focus:ring-brand-400/50" />
        </Field>

        <Field label="Model">
          <div className="flex flex-wrap gap-1 rounded-xl bg-ink-950/60 p-1 ring-1 ring-white/10">
            {MODELS.map((m) => (
              <button key={m} onClick={() => set({ model: m })} aria-pressed={c.model === m} className={cn('focus-ring flex-1 whitespace-nowrap rounded-lg px-2 py-1.5 text-xs transition-all', c.model === m ? 'bg-white/10 text-ink-50 shadow-hairline' : 'text-ink-400 hover:text-ink-200')}>
                {m}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Tools">
          <div className="divide-y divide-white/5 rounded-xl ring-1 ring-white/10">
            {TOOLS.map((t) => (
              <div key={t.id} className="flex items-center gap-2.5 px-3 py-2">
                <t.icon className="h-4 w-4 shrink-0 text-ink-400" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] text-ink-100">{t.label}</span>
                  <span className="block truncate text-[11px] text-ink-500">{t.hint}</span>
                </span>
                <Toggle label={t.label} on={c.tools[t.id]} onClick={() => set({ tools: { ...c.tools, [t.id]: !c.tools[t.id] } })} />
              </div>
            ))}
          </div>
        </Field>

        <Field label="Knowledge">
          <div className="flex flex-wrap gap-1.5">
            {c.files.map((f) => (
              <span key={f} className="flex items-center gap-1 rounded-lg bg-white/[0.05] py-1 pl-2 pr-1 text-xs text-ink-200 animate-scale-in">
                <FileText className="h-3 w-3 text-ink-400" />
                {f}
                <button onClick={() => set({ files: c.files.filter((x) => x !== f) })} aria-label={`Remove ${f}`} className="focus-ring grid h-4 w-4 place-items-center rounded text-ink-500 hover:bg-white/10 hover:text-ink-100">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {SPARE_FILES.some((f) => !c.files.includes(f)) && (
              <button onClick={() => set({ files: [...c.files, SPARE_FILES.find((f) => !c.files.includes(f))!] })} className="focus-ring flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-ink-400 ring-1 ring-dashed ring-white/15 hover:text-ink-100">
                <Plus className="h-3 w-3" /> Add file
              </button>
            )}
          </div>
        </Field>

        <Field label="Creativity" aside={<span className="text-[11px] text-brand-300">{tone(c.creativity)}</span>}>
          <input type="range" min={0} max={100} value={c.creativity} onChange={(e) => set({ creativity: Number(e.target.value) })} aria-label="Creativity" className="w-full accent-brand-400" />
          <div className="flex justify-between text-[10.5px] text-ink-500">
            <span>Precise</span>
            <span>Playful</span>
          </div>
        </Field>
      </section>

      <section className="flex min-h-[420px] min-w-0 flex-col border-t border-white/5 md:max-h-[560px] md:border-t-0">
        <header className="flex items-center gap-2.5 border-b border-white/5 px-4 py-3">
          <span className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-lg ring-1', Avatar.className)}>
            <Avatar.icon className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-ink-50">{c.name || 'Untitled agent'}</span>
            <span className="block truncate font-mono text-[10.5px] text-ink-500">
              {c.model} · {tone(c.creativity).toLowerCase()}
            </span>
          </span>
          <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10.5px] font-medium text-amber-300">Test</span>
        </header>
        <div ref={list$} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4 [scrollbar-width:thin]" aria-live="polite">
          <p key={greeting(c)} className="max-w-[90%] rounded-2xl rounded-bl-md bg-white/[0.04] px-3.5 py-2 text-sm leading-relaxed text-ink-200 ring-1 ring-white/5 animate-fade-in">
            {greeting(c)}
          </p>
          {msgs.map((m) =>
            m.role === 'user' ? (
              <p key={m.id} className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-brand-500/15 px-3.5 py-2 text-sm text-ink-50 animate-fade-up">
                {m.text}
              </p>
            ) : (
              <div key={m.id} className="max-w-[90%] animate-fade-up">
                <p className="rounded-2xl rounded-bl-md bg-white/[0.04] px-3.5 py-2 text-sm leading-relaxed text-ink-200 ring-1 ring-white/5">{m.text}</p>
                {!!m.used?.length && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {m.used.map((u) => (
                      <span key={u} className="flex items-center gap-1 rounded-md bg-white/[0.03] px-1.5 py-0.5 font-mono text-[10px] text-ink-500">
                        <Check className="h-2.5 w-2.5 text-emerald-400" /> {u}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ),
          )}
          {typing && <p className="shimmer-text text-xs font-medium">{c.name || 'Agent'} is typing…</p>}
        </div>
        <form onSubmit={send} className="mx-3 mb-3 flex items-center gap-2 rounded-xl bg-ink-950/60 py-1 pl-3 pr-1 ring-1 ring-white/10 focus-within:ring-brand-400/50">
          <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={`Message ${c.name || 'your agent'}…`} aria-label="Test message" className="h-8 min-w-0 flex-1 bg-transparent text-sm text-ink-100 outline-none placeholder:text-ink-600" />
          <button type="submit" disabled={!draft.trim() || typing} aria-label="Send" className="focus-ring grid h-8 w-8 place-items-center rounded-lg bg-brand-500 text-white transition-all disabled:bg-white/10 disabled:text-ink-500 active:scale-95">
            <ArrowUp className="h-4 w-4" />
          </button>
        </form>
        <footer className="flex items-center gap-2 border-t border-white/5 px-4 py-3">
          <span className="min-w-0 flex-1 truncate text-xs text-ink-500">
            {publish === 'done' ? (
              <span className="flex items-center gap-1.5 text-emerald-300">
                <Check className="h-3.5 w-3.5" /> Live at agents.acme.dev/{(c.name || 'agent').toLowerCase().replace(/[^a-z0-9]+/g, '-')}
              </span>
            ) : (
              'Unpublished changes'
            )}
          </span>
          <button onClick={doPublish} disabled={publish !== 'idle'} className="focus-ring flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-white px-3 text-xs font-medium text-ink-950 transition-all hover:bg-ink-100 active:scale-[0.97] disabled:bg-white/10 disabled:text-ink-400">
            {publish === 'busy' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {publish === 'done' ? 'Published' : publish === 'busy' ? 'Publishing' : 'Publish'}
          </button>
        </footer>
      </section>
    </div>
  );
}

/* ——— demo ——— */

export function AgentBuilderDemo() {
  return (
    <AgentBuilder
      initial={{
        name: 'Onboarding Buddy',
        avatar: 0,
        instructions: 'You help new hires through their first two weeks. Be warm and brief, cite the handbook, and offer to book meetings.',
        model: 'Nova Pro',
        tools: { web: false, calendar: true, code: false, knowledge: true },
        files: ['it-setup.md', 'handbook.pdf'],
        creativity: 45,
      }}
    />
  );
}
