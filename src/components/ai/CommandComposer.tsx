import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { ArrowUp, AtSign, BookOpen, CornerDownLeft, FileCode2, FlaskConical, Languages, Lightbulb, Mail, ScrollText, SearchCode, Slash, User, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useClickOutside, usePresence } from '@/components/ui/motion/hooks';

export type ComposerItem = { id: string; label: string; hint: string; kind: 'command' | 'file' | 'person' | 'doc' };
export type ComposerMessage = { command?: ComposerItem; mentions: ComposerItem[]; text: string };

export const COMMANDS: ComposerItem[] = [
  { id: 'summarize', label: '/summarize', hint: 'Summarize a thread or document', kind: 'command' },
  { id: 'translate', label: '/translate', hint: 'Translate into another language', kind: 'command' },
  { id: 'explain', label: '/explain', hint: 'Explain code or a concept', kind: 'command' },
  { id: 'test', label: '/test', hint: 'Write tests for a file', kind: 'command' },
  { id: 'review', label: '/review', hint: 'Review a pull request', kind: 'command' },
  { id: 'draft', label: '/draft', hint: 'Draft an email or message', kind: 'command' },
];

export const MENTIONS: ComposerItem[] = [
  { id: 'checkout', label: 'checkout.tsx', hint: 'src/app/checkout.tsx', kind: 'file' },
  { id: 'stripe', label: 'stripe.ts', hint: 'src/lib/stripe.ts', kind: 'file' },
  { id: 'readme', label: 'README.md', hint: 'Repository root', kind: 'file' },
  { id: 'maya', label: 'Maya Chen', hint: 'Design', kind: 'person' },
  { id: 'leo', label: 'Leo Park', hint: 'Engineering', kind: 'person' },
  { id: 'ana', label: 'Ana Ruiz', hint: 'Product', kind: 'person' },
  { id: 'roadmap', label: 'Q3 roadmap', hint: 'Notion · edited 2d ago', kind: 'doc' },
  { id: 'brand', label: 'Brand guidelines', hint: 'PDF · 24 pages', kind: 'doc' },
  { id: 'webhooks', label: 'Stripe webhooks', hint: 'Docs · API reference', kind: 'doc' },
];

const COMMAND_ICON: Record<string, typeof Slash> = { summarize: ScrollText, translate: Languages, explain: Lightbulb, test: FlaskConical, review: SearchCode, draft: Mail };
const KIND_ICON = { command: Slash, file: FileCode2, person: User, doc: BookOpen } as const;
const GROUP_LABEL = { command: 'Commands', file: 'Files', person: 'People', doc: 'Docs' } as const;

/** The trigger being typed at the end of the input: "/te" at the very start, or "@str" after a space. */
function trigger(text: string, hasCommand: boolean) {
  const slash = /^\/(\w*)$/.exec(text);
  if (slash && !hasCommand) return { kind: 'command' as const, query: slash[1] };
  const at = /(?:^|\s)@([\w.-]*)$/.exec(text);
  if (at) return { kind: 'mention' as const, query: at[1] };
  return null;
}

function Chip({ item, onRemove }: { item: ComposerItem; onRemove?: () => void }) {
  const Icon = item.kind === 'command' ? COMMAND_ICON[item.id] ?? Slash : KIND_ICON[item.kind];
  return (
    <span
      className={cn(
        'flex max-w-full animate-scale-in items-center gap-1 rounded-md py-0.5 pl-1.5 pr-1 text-xs font-medium',
        item.kind === 'command' ? 'bg-brand-500/15 text-brand-200 shadow-[0_0_0_1px_rgba(56,189,248,0.3)]' : 'bg-white/[0.06] text-ink-100 shadow-hairline',
      )}
    >
      <Icon className="h-3 w-3 shrink-0 opacity-80" />
      <span className="truncate">{item.kind === 'command' ? item.label : `@${item.label}`}</span>
      {onRemove && (
        <button type="button" onClick={onRemove} aria-label={`Remove ${item.label}`} className="focus-ring ml-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded text-current opacity-60 hover:bg-white/10 hover:opacity-100">
          <X className="h-2.5 w-2.5" />
        </button>
      )}
    </span>
  );
}

export type CommandComposerProps = {
  onSend: (message: ComposerMessage) => void;
  commands?: ComposerItem[];
  mentions?: ComposerItem[];
  placeholder?: string;
  /** Drive the composer from outside (used by the auto-playing demo). */
  value?: { text: string; chips: ComposerItem[] };
  className?: string;
};

export function CommandComposer({ onSend, commands = COMMANDS, mentions = MENTIONS, placeholder = 'Type / for commands, @ to mention', value, className }: CommandComposerProps) {
  const [text, setText] = useState('');
  const [chips, setChips] = useState<ComposerItem[]>([]);
  const [active, setActive] = useState(0);
  const [dismissed, setDismissed] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!value) return;
    setText(value.text);
    setChips(value.chips);
  }, [value]);

  const command = chips.find((c) => c.kind === 'command');
  const t = trigger(text, !!command);
  const open = !!t && dismissed !== text;
  const pool = t?.kind === 'command' ? commands : mentions.filter((m) => !chips.some((c) => c.id === m.id));
  const results = t ? pool.filter((i) => (i.label + ' ' + i.hint).toLowerCase().includes(t.query.toLowerCase())) : [];
  const { mounted, visible } = usePresence(open, 140);
  const close = useCallback(() => setDismissed(text), [text]);
  useClickOutside([root], open, close);

  useEffect(() => setActive(0), [t?.kind, t?.query]);

  const pick = (item: ComposerItem) => {
    const next = item.kind === 'command' ? text.replace(/^\/\w*$/, '') : text.replace(/@[\w.-]*$/, '').replace(/\s$/, '');
    setText(next ? `${next} ` : '');
    setChips((c) => (item.kind === 'command' ? [item, ...c.filter((x) => x.kind !== 'command')] : [...c, item]));
    input.current?.focus({ preventScroll: true });
  };

  const send = () => {
    if (!text.trim() && !chips.length) return;
    onSend({ command, mentions: chips.filter((c) => c.kind !== 'command'), text: text.trim() });
    setText('');
    setChips([]);
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (open && results.length) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setActive((a) => (a + (e.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        pick(results[active]);
        return;
      }
    }
    if (open && e.key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }
    if (e.key === 'Backspace' && !text && chips.length) {
      e.preventDefault();
      setChips((c) => c.slice(0, -1));
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      send();
    }
  };

  const groups = (['command', 'file', 'person', 'doc'] as const).map((k) => ({ k, items: results.filter((r) => r.kind === k) })).filter((g) => g.items.length);

  return (
    <div ref={root} className={cn('relative w-full', className)}>
      {mounted && (
        <div
          id="composer-menu"
          role="listbox"
          className={cn(
            'absolute bottom-full left-0 z-20 mb-2 w-full max-w-sm origin-bottom-left overflow-hidden rounded-xl bg-ink-850 p-1 shadow-pop transition-all',
            visible ? 'scale-100 opacity-100 duration-300 ease-spring' : 'translate-y-1 scale-95 opacity-0 duration-150',
          )}
        >
          {groups.length === 0 && <p className="px-3 py-3 text-xs text-ink-500">No matches for “{t?.query}”</p>}
          {groups.map((g) => (
            <div key={g.k}>
              <p className="px-2.5 pb-1 pt-2 text-[10px] font-medium uppercase tracking-[0.12em] text-ink-500">{GROUP_LABEL[g.k]}</p>
              {g.items.map((item) => {
                const i = results.indexOf(item);
                const Icon = item.kind === 'command' ? COMMAND_ICON[item.id] ?? Slash : KIND_ICON[item.kind];
                return (
                  <button
                    key={item.id}
                    id={`composer-opt-${item.id}`}
                    type="button"
                    role="option"
                    aria-selected={i === active}
                    onMouseEnter={() => setActive(i)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pick(item)}
                    className={cn('flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left transition-colors', i === active ? 'bg-white/[0.06]' : '')}
                  >
                    <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-md', item.kind === 'command' ? 'bg-brand-500/15 text-brand-300' : 'bg-white/5 text-ink-300')}>
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-ink-100">{item.label}</span>
                      <span className="block truncate text-[11px] text-ink-500">{item.hint}</span>
                    </span>
                    {i === active && (
                      <kbd className="flex shrink-0 items-center rounded bg-white/5 px-1 py-px text-ink-400">
                        <CornerDownLeft className="h-3 w-3" />
                      </kbd>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}

      <div className="rounded-2xl bg-ink-900 shadow-card transition-shadow duration-300 focus-within:shadow-[0_0_0_1px_rgba(56,189,248,0.35),0_8px_32px_-8px_rgba(56,189,248,0.25)]">
        <div className="flex flex-wrap items-center gap-1.5 px-3 pb-1 pt-3" onClick={() => input.current?.focus()}>
          {chips.map((c) => (
            <Chip key={c.id} item={c} onRemove={() => setChips((all) => all.filter((x) => x.id !== c.id))} />
          ))}
          <input
            ref={input}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setDismissed(null);
            }}
            onKeyDown={onKey}
            placeholder={chips.length ? 'Add details…' : placeholder}
            aria-label="Message"
            role="combobox"
            aria-expanded={open}
            aria-controls="composer-menu"
            aria-activedescendant={open && results[active] ? `composer-opt-${results[active].id}` : undefined}
            className="h-7 min-w-[140px] flex-1 bg-transparent text-sm text-ink-50 outline-none placeholder:text-ink-500"
          />
        </div>
        <div className="flex items-center justify-between gap-2 p-2 pl-3">
          <div className="flex items-center gap-1 text-[11px] text-ink-500">
            <button type="button" onClick={() => { setText('/'); setDismissed(null); input.current?.focus(); }} aria-label="Insert command" className="focus-ring flex h-7 w-7 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-white/5 hover:text-ink-100">
              <Slash className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={() => { setText((v) => (v && !v.endsWith(' ') ? `${v} @` : `${v}@`)); setDismissed(null); input.current?.focus(); }} aria-label="Mention" className="focus-ring flex h-7 w-7 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-white/5 hover:text-ink-100">
              <AtSign className="h-3.5 w-3.5" />
            </button>
            <span className="ml-1 hidden sm:inline">↑↓ to move · ↵ to pick · esc to close</span>
          </div>
          <button
            type="button"
            onClick={send}
            disabled={!text.trim() && !chips.length}
            aria-label="Send"
            className="focus-ring flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-white shadow-glow transition-all hover:bg-brand-400 active:scale-90 disabled:bg-ink-800 disabled:text-ink-500 disabled:shadow-none"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function SentMessage({ m }: { m: ComposerMessage }) {
  return (
    <div className="ml-auto w-fit max-w-[92%] animate-fade-up space-y-1.5">
      <div className="flex flex-wrap items-center justify-end gap-1.5 rounded-2xl rounded-br-md bg-ink-800 px-3 py-2 text-sm text-ink-100 shadow-hairline">
        {m.command && <Chip item={m.command} />}
        {m.mentions.map((x) => (
          <Chip key={x.id} item={x} />
        ))}
        {m.text && <span>{m.text}</span>}
      </div>
      <p className="truncate text-right font-mono text-[10.5px] text-ink-500">
        {[m.command ? `command: ${m.command.label}` : 'no command', m.mentions.length ? `context: ${m.mentions.length} item${m.mentions.length > 1 ? 's' : ''}` : '', m.text ? `ask: “${m.text}”` : ''].filter(Boolean).join(' · ')}
      </p>
    </div>
  );
}

const byId = (id: string) => [...COMMANDS, ...MENTIONS].find((x) => x.id === id)!;

export function CommandComposerDemo() {
  const [sent, setSent] = useState<ComposerMessage[]>([{ command: byId('summarize'), mentions: [byId('roadmap')], text: 'for the leadership sync' }]);
  const [driven, setDriven] = useState<{ text: string; chips: ComposerItem[] } | undefined>(undefined);
  const stopped = useRef(false);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setDriven({ text: 'cover the refund edge cases', chips: [byId('test'), byId('checkout'), byId('stripe')] });
      return;
    }
    const steps: [number, string, string[]][] = [
      [300, '/', []],
      [500, '/te', []],
      [1000, '', ['test']],
      [1300, '@', ['test']],
      [1500, '@chec', ['test']],
      [1900, '', ['test', 'checkout']],
      [2150, '@', ['test', 'checkout']],
      [2350, '@str', ['test', 'checkout']],
      [3600, '', ['test', 'checkout', 'stripe']],
      [3900, 'cover the refund edge cases', ['test', 'checkout', 'stripe']],
    ];
    const ids = steps.map(([ms, text, chips]) => window.setTimeout(() => !stopped.current && setDriven({ text, chips: chips.map(byId) }), ms));
    return () => ids.forEach(clearTimeout);
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4" onPointerDown={() => (stopped.current = true)} onKeyDown={() => (stopped.current = true)}>
      <div className="flex min-h-[120px] flex-col justify-end gap-3">
        {sent.map((m, i) => (
          <SentMessage key={i} m={m} />
        ))}
      </div>
      <CommandComposer value={driven} onSend={(m) => setSent((s) => [...s.slice(-1), m])} />
    </div>
  );
}
