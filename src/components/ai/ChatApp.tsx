import { useEffect, useRef, useState } from 'react';
import { MessageSquare, PanelLeft, Search, Sparkles, SquarePen } from 'lucide-react';
import { cn } from '@/lib/cn';
import { MessageBubble } from './MessageBubble';
import { PromptInput } from './PromptInput';
import { TypingIndicator } from './AgentLoading';
import { Markdown, useStream } from './stream';

export type Msg = { id: string; role: 'user' | 'assistant'; text: string; time: string; live?: boolean };
export type Convo = { id: string; title: string; group: 'Today' | 'Previous 7 days'; messages: Msg[] };

const now = () => new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

const SEED: Convo[] = [
  {
    id: 'c1',
    title: 'Trip plan for Lisbon',
    group: 'Today',
    messages: [
      { id: 'm1', role: 'user', text: 'Plan 3 days in Lisbon for a first-timer who loves food.', time: '9:12 AM' },
      { id: 'm2', role: 'assistant', text: '## Day 1 — Alfama & Baixa\n- Breakfast **pastéis de nata** at Manteigaria\n- Ride tram 28 up to Miradouro de Santa Luzia\n- Dinner with fado at Tasca do Chico\n## Day 2 — Belém\n- Jerónimos Monastery, then the original **Pastéis de Belém**', time: '9:12 AM' },
    ],
  },
  { id: 'c2', title: 'Refactor auth middleware', group: 'Today', messages: [{ id: 'm3', role: 'user', text: 'Why does my Next.js middleware run twice?', time: '8:03 AM' }, { id: 'm4', role: 'assistant', text: 'It usually runs once per request **and** once per prefetch. Add a `matcher` to exclude `/_next/static` and image routes.', time: '8:03 AM' }] },
  { id: 'c3', title: 'Quarterly OKR draft', group: 'Previous 7 days', messages: [{ id: 'm5', role: 'user', text: 'Draft 3 OKRs for a growth team.', time: 'Mon' }, { id: 'm6', role: 'assistant', text: '1. Grow weekly active teams from 1,200 to 1,800\n2. Lift trial-to-paid conversion from 9% to 13%\n3. Cut onboarding time to first value below 5 minutes', time: 'Mon' }] },
  { id: 'c4', title: 'SQL window functions', group: 'Previous 7 days', messages: [{ id: 'm7', role: 'user', text: 'Explain ROW_NUMBER vs RANK.', time: 'Sun' }, { id: 'm8', role: 'assistant', text: '`ROW_NUMBER` always gives unique numbers. `RANK` gives ties the same number and **skips** the next ones.', time: 'Sun' }] },
];

const REPLIES = [
  'Great question. Here is a quick breakdown:\n- **Start small** — ship the smallest version that proves the idea\n- **Measure** one metric that actually reflects value\n- **Iterate weekly** and cut anything nobody uses\nWant me to turn this into a checklist?',
  '## Short answer\nYes, and it is simpler than it looks.\n- Cache the response for 60 seconds with `stale-while-revalidate`\n- Invalidate on write using a tag per resource\nThis typically cuts p95 latency by **40–60%**.',
];

function LiveMessage({ text, active, onFinish, onTick }: { text: string; active: boolean; onFinish: (t: string) => void; onTick: () => void }) {
  const [thinking, setThinking] = useState(true);
  const { output, done } = useStream(text, { speed: 26, enabled: active && !thinking });
  useEffect(() => {
    const t = window.setTimeout(() => setThinking(false), 900);
    return () => window.clearTimeout(t);
  }, []);
  useEffect(onTick, [output, onTick]);
  useEffect(() => {
    if (done || !active) onFinish(done ? text : output || 'Stopped.');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, active]);
  if (thinking) return <TypingIndicator className="!rounded-tl-md !bg-transparent !p-0 !shadow-none" />;
  return <Markdown text={output} caret={!done} className="text-ink-200" />;
}

export type ChatAppProps = { conversations?: Convo[]; replies?: string[]; defaultSidebarOpen?: boolean; className?: string };

export function ChatApp({ conversations = SEED, replies = REPLIES, defaultSidebarOpen = true, className }: ChatAppProps) {
  const [convos, setConvos] = useState(conversations);
  const [activeId, setActiveId] = useState(conversations[0]?.id ?? '');
  const [generating, setGenerating] = useState<string | null>(null);
  const [sidebar, setSidebar] = useState(defaultSidebarOpen);
  const scroller = useRef<HTMLDivElement>(null);
  const replyIdx = useRef(0);
  const convo = convos.find((c) => c.id === activeId) ?? convos[0];

  const scrollDown = useRef(() => {
    const el = scroller.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }).current;
  useEffect(scrollDown, [activeId, convo.messages.length, scrollDown]);

  const update = (id: string, fn: (m: Msg[]) => Msg[]) => setConvos((cs) => cs.map((c) => (c.id === id ? { ...c, messages: fn(c.messages) } : c)));
  const finalizeAll = () => setConvos((cs) => cs.map((c) => ({ ...c, messages: c.messages.map((m) => ({ ...m, live: false })) })));

  const send = (text: string) => {
    const reply = replies[replyIdx.current++ % replies.length];
    const aid = `a${Date.now()}`;
    update(convo.id, (m) => [...m, { id: `u${Date.now()}`, role: 'user', text: text || 'Sent an attachment', time: now() }, { id: aid, role: 'assistant', text: reply, time: now(), live: true }]);
    setGenerating(aid);
  };
  const newChat = () => {
    finalizeAll();
    setGenerating(null);
    const id = `c${Date.now()}`;
    setConvos((cs) => [{ id, title: 'New chat', group: 'Today', messages: [] }, ...cs]);
    setActiveId(id);
  };

  return (
    <div className={cn('flex h-[560px] w-full overflow-hidden rounded-2xl bg-ink-950 shadow-card', className)}>
      <aside className={cn('hidden shrink-0 flex-col overflow-hidden border-r border-white/5 bg-ink-900/60 transition-[width] duration-500 ease-smooth md:flex', sidebar ? 'w-60' : 'w-0')}>
        <div className="flex w-60 items-center justify-between px-3 py-3">
          <span className="flex items-center gap-2 text-sm font-medium text-ink-50">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-brand-400 to-brand-700"><Sparkles className="h-3.5 w-3.5 text-white" /></span>
            NiceUI
          </span>
          <button onClick={newChat} className="focus-ring flex h-7 w-7 items-center justify-center rounded-md text-ink-400 transition-colors hover:bg-white/5 hover:text-ink-50" aria-label="New chat">
            <SquarePen className="h-4 w-4" />
          </button>
        </div>
        <div className="mx-3 mb-2 flex w-[216px] shrink-0 items-center gap-2 rounded-lg bg-white/[0.04] px-2.5 py-1.5 text-xs text-ink-500">
          <Search className="h-3.5 w-3.5" /> Search chats
        </div>
        <nav className="w-60 flex-1 overflow-y-auto px-2 pb-3">
          {(['Today', 'Previous 7 days'] as const).map((g) => (
            <div key={g} className="mt-3">
              <p className="px-2 pb-1 text-[11px] font-medium text-ink-500">{g}</p>
              {convos.filter((c) => c.group === g).map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    finalizeAll();
                    setGenerating(null);
                    setActiveId(c.id);
                  }}
                  className={cn('focus-ring flex w-full animate-fade-in items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors', c.id === convo.id ? 'bg-white/[0.07] text-ink-50' : 'text-ink-400 hover:bg-white/[0.04] hover:text-ink-200')}
                >
                  <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-60" />
                  <span className="truncate">{c.title}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="flex w-60 items-center gap-2 border-t border-white/5 px-3 py-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/20 text-xs font-medium text-amber-200">MR</span>
          <span className="text-xs"><span className="block text-ink-100">Maya Reyes</span><span className="block text-ink-500">Pro plan</span></span>
        </div>
      </aside>
      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-2 border-b border-white/5 px-3 py-2.5">
          <button onClick={() => setSidebar((s) => !s)} className="focus-ring hidden h-7 w-7 items-center justify-center rounded-md text-ink-400 transition-colors hover:bg-white/5 hover:text-ink-50 md:flex" aria-label="Toggle sidebar">
            <PanelLeft className="h-4 w-4" />
          </button>
          <h3 key={convo.id} className="animate-fade-in truncate text-sm font-medium text-ink-100">{convo.title}</h3>
        </header>
        <div ref={scroller} className="flex-1 overflow-y-auto px-4 py-5">
          <div key={convo.id} className="mx-auto flex max-w-2xl flex-col gap-2">
            {convo.messages.length === 0 && (
              <div className="flex animate-fade-up flex-col items-center pt-24 text-center">
                <Sparkles className="h-6 w-6 text-brand-300" />
                <p className="mt-3 text-lg font-medium text-ink-50">How can I help today?</p>
                <p className="mt-1 text-sm text-ink-500">Ask a question, paste code or attach a file.</p>
              </div>
            )}
            {convo.messages.map((m) => (
              <div key={m.id} className="animate-fade-up">
                <MessageBubble role={m.role} time={m.time} status={m.role === 'user' ? 'read' : undefined} copyText={m.text} actions={!m.live}>
                  {m.live ? (
                    <LiveMessage
                      text={m.text}
                      active={generating === m.id}
                      onTick={scrollDown}
                      onFinish={(t) => {
                        update(convo.id, (ms) => ms.map((x) => (x.id === m.id ? { ...x, text: t, live: false } : x)));
                        setGenerating((g) => (g === m.id ? null : g));
                      }}
                    />
                  ) : m.role === 'assistant' ? (
                    <Markdown text={m.text} className="text-ink-200" />
                  ) : (
                    m.text
                  )}
                </MessageBubble>
              </div>
            ))}
          </div>
        </div>
        <div className="mx-auto w-full max-w-2xl px-4 pb-4">
          <PromptInput onSubmit={send} generating={!!generating} onStop={() => setGenerating(null)} placeholder="Message NiceUI…" maxRows={5} />
        </div>
      </section>
    </div>
  );
}

export function ChatAppDemo() {
  return <ChatApp />;
}
