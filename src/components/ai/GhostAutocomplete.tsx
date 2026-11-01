import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/cn';

export type GhostAutocompleteProps = {
  /** Returns the suggested continuation for the current text, or '' for none. */
  suggest: (text: string) => string;
  defaultValue?: string;
  /** Delay before a suggestion appears, in ms. */
  delay?: number;
  placeholder?: string;
  /** Types this text on mount to show the effect. */
  autoType?: string;
  className?: string;
};

const reduce = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function GhostAutocomplete({ suggest, defaultValue = '', delay = 450, placeholder = 'Start writing…', autoType, className }: GhostAutocompleteProps) {
  const [value, setValue] = useState(defaultValue);
  const [ghost, setGhost] = useState('');
  const [accepted, setAccepted] = useState(0);
  const area = useRef<HTMLTextAreaElement>(null);
  const timer = useRef(0);
  const typing = useRef<number[]>([]);

  const schedule = (text: string) => {
    window.clearTimeout(timer.current);
    setGhost('');
    timer.current = window.setTimeout(() => setGhost(suggest(text)), delay);
  };

  useEffect(() => {
    if (!autoType) return;
    if (reduce()) {
      setValue(autoType);
      setGhost(suggest(autoType));
      return;
    }
    [...autoType].forEach((_, i) =>
      typing.current.push(
        window.setTimeout(() => {
          const t = autoType.slice(0, i + 1);
          setValue(t);
          if (i === autoType.length - 1) schedule(t);
        }, 400 + i * 32),
      ),
    );
    return () => typing.current.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const stopDemo = () => {
    typing.current.forEach(clearTimeout);
    typing.current = [];
  };

  const atEnd = () => {
    const el = area.current;
    return !el || el.selectionStart === value.length;
  };

  const take = (part: string) => {
    const next = value + part;
    setValue(next);
    setAccepted((n) => n + 1);
    const rest = ghost.slice(part.length);
    setGhost(rest);
    requestAnimationFrame(() => {
      const el = area.current;
      if (el) el.selectionStart = el.selectionEnd = next.length;
    });
    if (!rest) schedule(next);
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    stopDemo();
    if (!ghost) return;
    if (e.key === 'Tab' && !e.shiftKey && atEnd()) {
      e.preventDefault();
      take(ghost);
    } else if (e.key === 'ArrowRight' && atEnd()) {
      e.preventDefault();
      const m = ghost.match(/^\s*\S+/);
      take(m ? m[0] : ghost);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setGhost('');
    }
  };

  return (
    <div className={cn('w-full rounded-2xl bg-ink-900 p-1.5 shadow-card', className)}>
      <div className="relative rounded-xl bg-ink-950/60 ring-1 ring-white/5 transition focus-within:ring-brand-400/40">
        {/* Mirror renders the same text invisibly, followed by the visible ghost suggestion. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre-wrap break-words px-4 py-3.5 text-[15px] leading-7">
          <span className="text-transparent">{value}</span>
          <span className="text-ink-500">{ghost}</span>
          {ghost && (
            <kbd className="ml-1.5 inline-flex translate-y-[-1px] items-center rounded border border-white/10 bg-white/5 px-1 align-middle font-mono text-[10px] leading-4 text-ink-400">Tab</kbd>
          )}
        </div>
        <textarea
          ref={area}
          value={value}
          rows={5}
          spellCheck={false}
          placeholder={placeholder}
          aria-label="Text with AI suggestions. Tab accepts, right arrow accepts a word, Escape dismisses."
          onChange={(e) => {
            stopDemo();
            setValue(e.target.value);
            schedule(e.target.value);
          }}
          onKeyDown={onKey}
          onClick={stopDemo}
          className="relative block w-full resize-none bg-transparent px-4 py-3.5 text-[15px] leading-7 text-ink-50 caret-brand-300 outline-none placeholder:text-ink-600"
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 px-2.5 pb-1 pt-2.5 text-[11.5px] text-ink-500">
        <span className="flex items-center gap-1.5">
          <Sparkles className={cn('h-3.5 w-3.5', ghost ? 'text-brand-300' : 'text-ink-600')} />
          {ghost ? 'Suggestion ready' : 'Keep typing for a suggestion'}
        </span>
        <span className="flex items-center gap-2">
          <span><kbd className="font-mono text-ink-400">Tab</kbd> accept</span>
          <span><kbd className="font-mono text-ink-400">→</kbd> word</span>
          <span><kbd className="font-mono text-ink-400">Esc</kbd> dismiss</span>
          {accepted > 0 && <span className="tabular-nums text-emerald-400/80">{accepted} accepted</span>}
        </span>
      </div>
    </div>
  );
}

const COMPLETIONS: [RegExp, string][] = [
  [/as discussed,?\s*$/i, " I'll send over the revised proposal by Friday, with the pricing options we talked through."],
  [/by friday, with the pricing options we talked through\.\s*$/i, ' Let me know if anyone else on your side should be looped in.'],
  [/looped in\.\s*$/i, '\n\nBest,\nMaya'],
  [/thanks for\s*$/i, ' the call today.'],
  [/\b(hi|hey|hello)\s+\w+,?\s*$/i, ' thanks for making time this afternoon.'],
  [/\bi think\s*$/i, ' the second option is the safer bet for the launch.'],
  [/\.\s*$/, ' Happy to jump on a quick call if that helps.'],
];

export function ghostSuggest(text: string) {
  if (!text.trim()) return '';
  for (const [re, s] of COMPLETIONS) if (re.test(text)) return s;
  return '';
}

export function GhostAutocompleteDemo() {
  return (
    <div className="mx-auto w-full max-w-xl">
      <GhostAutocomplete suggest={ghostSuggest} autoType="Hi Jonah, thanks for the call today. As discussed," />
    </div>
  );
}
