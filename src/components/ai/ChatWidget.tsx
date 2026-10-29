import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowUp, Headphones, MessageCircle, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/cn';

type Msg = { id: number; from: 'bot' | 'user' | 'human' | 'system'; text: string };

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const ANSWERS: Record<string, string> = {
  Pricing: 'Plans start free. Pro is $12 per seat a month with unlimited projects, and annual billing saves 20%. Want me to compare plans for your team size?',
  'Reset my password': 'Head to Settings → Security → Reset password. I just emailed you a secure link too; it expires in 15 minutes.',
  'Export my data': 'You can export everything as CSV or JSON from Settings → Data. Large workspaces are zipped and emailed to you.',
};

export type ChatWidgetProps = { title?: string; defaultOpen?: boolean; className?: string };

/** A support assistant: launcher with unread badge, quick replies, streamed answers and a human handoff. */
export function ChatWidget({ title = 'Aria', defaultOpen = false, className }: ChatWidgetProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [msgs, setMsgs] = useState<Msg[]>([{ id: 1, from: 'bot', text: 'Hi there 👋 I’m Aria, the AI assistant. Ask me anything, or pick a topic below.' }]);
  const [typing, setTyping] = useState(false);
  const [stream, setStream] = useState<{ id: number; full: string; n: number } | null>(null);
  const [handoff, setHandoff] = useState<'none' | 'queue' | 'live'>('none');
  const [draft, setDraft] = useState('');
  const timers = useRef<number[]>([]);
  const list = useRef<HTMLDivElement>(null);
  const busy = typing || !!stream || handoff === 'queue';

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => {
    const el = list.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [msgs, typing, stream]);

  useEffect(() => {
    if (!stream) return;
    const words = stream.full.split(' ');
    if (stream.n >= words.length) {
      setMsgs((m) => [...m, { id: stream.id, from: 'bot', text: stream.full }]);
      setStream(null);
      return;
    }
    const id = window.setTimeout(() => setStream((s) => (s ? { ...s, n: s.n + 1 } : s)), 45);
    return () => clearTimeout(id);
  }, [stream]);

  const later = (ms: number, f: () => void) => timers.current.push(window.setTimeout(f, ms));

  const ask = (text: string) => {
    if (busy || !text.trim()) return;
    const id = Date.now();
    setMsgs((m) => [...m, { id, from: 'user', text }]);
    if (/human|agent|person/i.test(text)) {
      setHandoff('queue');
      setMsgs((m) => [...m, { id: id + 1, from: 'system', text: 'Connecting you to the support team…' }]);
      later(2200, () => {
        setHandoff('live');
        setMsgs((m) => [...m, { id: id + 2, from: 'system', text: 'Sam joined the conversation' }, { id: id + 3, from: 'human', text: 'Hey, Sam here. I can see your chat with Aria. How can I help?' }]);
      });
      return;
    }
    const answer = ANSWERS[text] ?? 'Good question. I found two help articles about that and summarized them: you can change it from Settings, and changes apply to your whole workspace instantly.';
    setTyping(true);
    later(reduced() ? 0 : 900, () => {
      setTyping(false);
      if (reduced()) setMsgs((m) => [...m, { id: id + 1, from: 'bot', text: answer }]);
      else setStream({ id: id + 1, full: answer, n: 0 });
    });
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    ask(draft);
    setDraft('');
  };

  const agent = handoff === 'live' ? 'Sam · Support' : `${title} · AI assistant`;

  return (
    <div className={cn('pointer-events-none absolute inset-0', className)}>
      <div
        role="dialog"
        aria-label="Support chat"
        aria-hidden={!open}
        className={cn(
          'pointer-events-auto absolute bottom-[84px] right-4 flex h-[min(420px,calc(100%-104px))] w-[calc(100%-32px)] max-w-[360px] origin-bottom-right flex-col overflow-hidden rounded-2xl bg-ink-900 shadow-pop ring-1 ring-white/10 transition-all duration-300 ease-smooth',
          open ? 'scale-100 opacity-100' : 'pointer-events-none scale-90 opacity-0',
        )}
      >
        <div className="flex items-center gap-3 border-b border-white/5 bg-gradient-to-b from-brand-500/10 to-transparent px-4 py-3">
          <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-300 to-brand-600 text-white">
            {handoff === 'live' ? <Headphones className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-ink-900" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink-50">{agent}</p>
            <p className="text-[11px] text-ink-500">{handoff === 'live' ? 'Human support · replies in ~1 min' : 'Replies instantly'}</p>
          </div>
          <button onClick={() => setOpen(false)} aria-label="Close chat" className="focus-ring grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-white/5 hover:text-ink-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div ref={list} className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-4 py-3 [scrollbar-width:none]">
          {msgs.map((m) =>
            m.from === 'system' ? (
              <p key={m.id} className="flex items-center justify-center gap-2 py-1 text-[11px] text-ink-500 animate-fade-in">
                {handoff === 'queue' && m.text.startsWith('Connecting') && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />}
                {m.text}
              </p>
            ) : (
              <div key={m.id} className={cn('flex animate-fade-up', m.from === 'user' ? 'justify-end' : 'justify-start')}>
                <p className={cn('max-w-[85%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed', m.from === 'user' ? 'rounded-br-md bg-brand-500 text-white' : m.from === 'human' ? 'rounded-bl-md bg-emerald-500/10 text-ink-100 ring-1 ring-emerald-400/20' : 'rounded-bl-md bg-white/[0.05] text-ink-200')}>{m.text}</p>
              </div>
            ),
          )}
          {stream && (
            <div className="flex">
              <p className="max-w-[85%] rounded-2xl rounded-bl-md bg-white/[0.05] px-3 py-2 text-[13px] leading-relaxed text-ink-200">
                {stream.full.split(' ').slice(0, stream.n).join(' ')}
                <span aria-hidden className="ml-0.5 inline-block h-[1em] w-[6px] translate-y-[2px] animate-blink rounded-[2px] bg-brand-400" />
              </p>
            </div>
          )}
          {typing && (
            <div className="flex w-fit items-center gap-1 rounded-2xl rounded-bl-md bg-white/[0.05] px-3 py-3" aria-label="Aria is typing">
              {[0, 1, 2].map((i) => (
                <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-400" style={{ animationDelay: `${i * 140}ms` }} />
              ))}
            </div>
          )}
          {msgs.length === 1 && !busy && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[...Object.keys(ANSWERS), 'Talk to a human'].map((q) => (
                <button key={q} onClick={() => ask(q)} className="focus-ring rounded-full bg-white/[0.03] px-2.5 py-1 text-xs text-brand-200 ring-1 ring-brand-400/25 transition-colors hover:bg-brand-500/10">
                  {q}
                </button>
              ))}
            </div>
          )}
        </div>
        <form onSubmit={submit} className="flex items-center gap-2 border-t border-white/5 p-2.5">
          <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={handoff === 'live' ? 'Message Sam…' : 'Ask Aria…'} aria-label="Message" className="h-9 min-w-0 flex-1 rounded-xl bg-white/[0.04] px-3 text-sm text-ink-100 outline-none ring-1 ring-white/5 placeholder:text-ink-500 focus:ring-brand-400/40" />
          <button type="submit" disabled={!draft.trim() || busy} aria-label="Send" className="focus-ring grid h-9 w-9 place-items-center rounded-xl bg-brand-500 text-white transition-all active:scale-95 disabled:bg-white/[0.06] disabled:text-ink-500">
            <ArrowUp className="h-4 w-4" />
          </button>
        </form>
      </div>

      {!open && (
        <p className="pointer-events-auto absolute bottom-6 right-[84px] max-w-[210px] rounded-2xl rounded-br-md bg-ink-900 px-3 py-2 text-[13px] text-ink-200 shadow-pop ring-1 ring-white/10 animate-fade-up">Questions about pricing? I can help.</p>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close chat' : 'Open chat'}
        aria-expanded={open}
        className="focus-ring pointer-events-auto absolute bottom-4 right-4 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-glow transition-transform duration-300 ease-spring hover:scale-105 active:scale-95"
      >
        <span className={cn('absolute transition-all duration-300 ease-spring', open ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-50 opacity-0')}>
          <X className="h-6 w-6" />
        </span>
        <span className={cn('absolute transition-all duration-300 ease-spring', open ? 'rotate-90 scale-50 opacity-0' : 'rotate-0 scale-100 opacity-100')}>
          <MessageCircle className="h-6 w-6" />
        </span>
        {!open && <span className="absolute -right-0.5 -top-0.5 grid h-5 w-5 place-items-center rounded-full bg-rose-500 text-[10px] font-semibold ring-2 ring-ink-950">1</span>}
      </button>
    </div>
  );
}

export function ChatWidgetDemo() {
  return (
    <div className="relative mx-auto h-[520px] w-full max-w-3xl overflow-hidden rounded-2xl bg-ink-950 ring-1 ring-white/5">
      <div aria-hidden className="space-y-4 p-6 opacity-60">
        <div className="flex items-center justify-between">
          <div className="h-3 w-24 rounded-full bg-white/10" />
          <div className="flex gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-2.5 w-12 rounded-full bg-white/[0.06]" />
            ))}
          </div>
        </div>
        <div className="space-y-2 pt-8">
          <div className="h-6 w-2/3 rounded-lg bg-white/[0.08]" />
          <div className="h-6 w-1/2 rounded-lg bg-white/[0.06]" />
        </div>
        <div className="grid grid-cols-3 gap-3 pt-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-white/[0.03] ring-1 ring-white/5" />
          ))}
        </div>
      </div>
      <ChatWidget defaultOpen />
    </div>
  );
}
