import { useEffect, useRef, useState } from 'react';
import { ArrowUp, ArrowUpRight, BarChart3, Bot, Code2, CornerDownRight, GraduationCap, PenLine, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Markdown, useStream } from './stream';

export type Suggestion = { title: string; prompt: string };
export type SuggestionCategory = { id: string; label: string; icon: LucideIcon; items: Suggestion[] };

export type PromptSuggestionsProps = {
  categories: SuggestionCategory[];
  onSelect: (prompt: string) => void;
  className?: string;
};

/** Category tabs with starter cards for an empty chat. */
export function PromptSuggestions({ categories, onSelect, className }: PromptSuggestionsProps) {
  const [tab, setTab] = useState(0);
  const cat = categories[tab];
  return (
    <div className={cn('w-full', className)}>
      <div role="tablist" aria-label="Suggestion categories" className="relative mx-auto grid w-full max-w-sm grid-cols-4 rounded-xl bg-ink-950/60 p-1 shadow-hairline">
        <span
          className="absolute inset-y-1 left-1 rounded-lg bg-ink-800 shadow-hairline transition-transform duration-300 ease-smooth"
          style={{ width: `calc((100% - 8px) / ${categories.length})`, transform: `translateX(${tab * 100}%)` }}
        />
        {categories.map((c, i) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={tab === i}
            onClick={() => setTab(i)}
            className={cn('focus-ring relative z-10 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition-colors', tab === i ? 'text-ink-50' : 'text-ink-400 hover:text-ink-200')}
          >
            <c.icon className="hidden h-3.5 w-3.5 sm:block" />
            {c.label}
          </button>
        ))}
      </div>
      <div key={cat.id} role="tabpanel" className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {cat.items.map((s, i) => (
          <button
            key={s.title}
            type="button"
            onClick={() => onSelect(s.prompt)}
            className="focus-ring group relative flex min-w-0 animate-fade-up gap-3 rounded-xl bg-ink-850/70 p-3 text-left shadow-hairline transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:bg-ink-800 hover:shadow-[0_0_0_1px_rgba(125,211,252,0.25),0_12px_28px_-14px_rgba(56,189,248,0.45)]"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5 text-brand-300 transition-colors group-hover:bg-brand-500/15">
              <cat.icon className="h-3.5 w-3.5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-medium text-ink-100">{s.title}</span>
              <span className="mt-0.5 line-clamp-2 block text-xs leading-snug text-ink-500">{s.prompt}</span>
            </span>
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-ink-600 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-300" />
          </button>
        ))}
      </div>
    </div>
  );
}

export type FollowUpsProps = { items: string[]; show: boolean; onSelect: (text: string) => void; className?: string };

/** Follow-up chips that cascade in after a reply finishes. */
export function FollowUps({ items, show, onSelect, className }: FollowUpsProps) {
  return (
    <div className={cn('flex flex-wrap gap-1.5', className)} aria-hidden={!show}>
      {items.map((t, i) => (
        <button
          key={t}
          type="button"
          tabIndex={show ? 0 : -1}
          onClick={() => onSelect(t)}
          className={cn(
            'focus-ring group flex items-center gap-1.5 rounded-full bg-ink-850 py-1.5 pl-2.5 pr-3 text-xs text-ink-200 shadow-hairline transition-all duration-500 ease-spring hover:bg-ink-800 hover:text-ink-50 active:scale-95',
            show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0',
          )}
          style={{ transitionDelay: show ? `${i * 70}ms` : '0ms' }}
        >
          <CornerDownRight className="h-3 w-3 text-brand-300 transition-transform group-hover:translate-x-0.5" />
          {t}
        </button>
      ))}
    </div>
  );
}

const CATEGORIES: SuggestionCategory[] = [
  {
    id: 'write',
    label: 'Write',
    icon: PenLine,
    items: [
      { title: 'Launch announcement', prompt: 'Draft a launch post for our new offline mode. Upbeat, under 120 words, with a clear call to action.' },
      { title: 'Polite follow-up', prompt: 'Write a friendly follow-up to a client who hasn’t replied in two weeks.' },
      { title: 'Rewrite for clarity', prompt: 'Rewrite this paragraph so a new hire understands it on first read.' },
      { title: 'Release notes', prompt: 'Turn these merged pull request titles into customer-facing release notes.' },
    ],
  },
  {
    id: 'code',
    label: 'Code',
    icon: Code2,
    items: [
      { title: 'Explain this hook', prompt: 'Explain what this useEffect does and whether it can loop forever.' },
      { title: 'Write the tests', prompt: 'Write unit tests for a debounce function, including the edge cases.' },
      { title: 'Fix a type error', prompt: 'Why does TypeScript say “string is not assignable to never” here?' },
      { title: 'SQL from English', prompt: 'Write a query for weekly active users by plan over the last 12 weeks.' },
    ],
  },
  {
    id: 'analyze',
    label: 'Analyze',
    icon: BarChart3,
    items: [
      { title: 'Find the churn signal', prompt: 'Look at this export of cancellations and tell me what predicts churn.' },
      { title: 'Summarize feedback', prompt: 'Group these 200 survey answers into themes, with counts and quotes.' },
      { title: 'Compare pricing', prompt: 'Compare our pricing page with three competitors in a table.' },
      { title: 'Check a forecast', prompt: 'Review this revenue forecast and flag any unrealistic assumptions.' },
    ],
  },
  {
    id: 'learn',
    label: 'Learn',
    icon: GraduationCap,
    items: [
      { title: 'Explain like I’m new', prompt: 'Explain vector databases to a product designer, with one everyday analogy.' },
      { title: 'Make a study plan', prompt: 'Build a four-week plan to learn Rust in five hours a week.' },
      { title: 'Quiz me', prompt: 'Quiz me on the CAP theorem with five questions, one at a time.' },
      { title: 'Compare concepts', prompt: 'What’s the difference between SSR, SSG and ISR? Use one example for all three.' },
    ],
  },
];

const prefersReduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function PromptSuggestionsDemo() {
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const timer = useRef<number>();
  useEffect(() => () => window.clearInterval(timer.current), []);

  const fill = (prompt: string) => {
    window.clearInterval(timer.current);
    if (prefersReduced()) {
      setText(prompt);
      return;
    }
    let i = 0;
    setTyping(true);
    timer.current = window.setInterval(() => {
      i += 2;
      setText(prompt.slice(0, i));
      if (i >= prompt.length) {
        window.clearInterval(timer.current);
        setTyping(false);
      }
    }, 18);
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="flex flex-col items-center text-center">
        <span className="relative flex h-11 w-11 items-center justify-center">
          <span className="absolute inset-0 animate-spin-slow rounded-full bg-[conic-gradient(from_0deg,#38bdf8,#a78bfa,#2dd4bf,#38bdf8)] opacity-80 blur-[6px]" />
          <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-ink-900 ring-1 ring-white/10">
            <Bot className="h-5 w-5 text-brand-300" />
          </span>
        </span>
        <h3 className="mt-3 text-xl font-medium tracking-[-0.02em] text-ink-50">{greeting}, Maya</h3>
        <p className="mt-1 text-sm text-ink-400">What are we working on today?</p>
      </div>
      <PromptSuggestions categories={CATEGORIES} onSelect={fill} className="mt-5" />
      <div className="mt-4 flex items-end gap-2 rounded-2xl bg-ink-900 p-2 pl-4 shadow-card transition-shadow duration-300 focus-within:shadow-[0_0_0_1px_rgba(56,189,248,0.35),0_8px_32px_-8px_rgba(56,189,248,0.25)]">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          readOnly={typing}
          rows={2}
          aria-label="Message"
          placeholder="Pick a suggestion or ask anything…"
          className="min-w-0 flex-1 resize-none bg-transparent py-1.5 text-sm leading-relaxed text-ink-50 outline-none placeholder:text-ink-500"
        />
        <button
          type="button"
          disabled={!text.trim() || typing}
          onClick={() => setText('')}
          aria-label="Send message"
          className={cn('focus-ring flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 ease-spring active:scale-90', text.trim() && !typing ? 'bg-brand-500 text-white shadow-glow hover:bg-brand-400' : 'bg-ink-800 text-ink-500')}
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

const EXCHANGES: { q: string; a: string; next: string[] }[] = [
  {
    q: 'How should I cache API responses in my app?',
    a: 'Start with **stale-while-revalidate**: serve the cached response instantly, then refresh it in the background.\n- Cache **GET** requests only, keyed by URL and user\n- Set a short max age, around `60s`, for data that changes often\n- Invalidate on writes instead of waiting for expiry',
    next: ['Show me the code', 'When should I not cache?', 'Compare with a CDN'],
  },
  {
    q: 'Show me the code',
    a: 'Here’s the core of it, wrapped in a tiny helper:\n- Read from the cache with `cache.get(key)`\n- If it exists, return it and call `refresh(key)` without awaiting\n- Otherwise await `fetch()`, store the result and return it',
    next: ['Add a max age', 'Make it work offline', 'Start over'],
  },
  {
    q: 'When should I not cache?',
    a: 'Skip the cache when freshness **is** the feature:\n- Balances, inventory and anything you can buy against\n- Responses that differ per permission level\n- Endpoints with side effects, even if they use GET',
    next: ['Show me the code', 'Compare with a CDN', 'Start over'],
  },
  {
    q: 'Compare with a CDN',
    a: 'A CDN caches **between** users at the edge, while an app cache lives **inside** one client.\n- Use a CDN for public, identical responses\n- Use an app cache for per-user data and instant back-navigation\n- Most apps want both, with different max ages',
    next: ['When should I not cache?', 'Show me the code', 'Start over'],
  },
];

export function FollowUpsDemo() {
  const [i, setI] = useState(0);
  const ex = EXCHANGES[i];
  const [reduced] = useState(prefersReduced);
  const stream = useStream(ex.a, { speed: 24, enabled: !reduced });
  const done = reduced || stream.done;

  const ask = (t: string) => {
    const j = t === 'Start over' ? 0 : EXCHANGES.findIndex((e) => e.q === t);
    setI(j >= 0 ? j : (i + 1) % EXCHANGES.length);
    stream.restart();
  };

  return (
    <div className="mx-auto w-full max-w-xl space-y-4">
      <div className="flex justify-end">
        <p key={ex.q} className="max-w-[85%] animate-fade-up rounded-2xl rounded-br-md bg-brand-600 px-3.5 py-2 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
          {ex.q}
        </p>
      </div>
      <div className="flex gap-3">
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 to-brand-700 text-white shadow-glow">
          <Bot className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1 space-y-4">
          <div className="min-h-[124px]">
            <Markdown text={reduced ? ex.a : stream.output} caret={!done} />
          </div>
          <div>
            <p className={cn('mb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-ink-500 transition-opacity duration-500', done ? 'opacity-100' : 'opacity-0')}>Ask next</p>
            <FollowUps key={i} items={ex.next} show={done} onSelect={ask} />
          </div>
        </div>
      </div>
    </div>
  );
}
