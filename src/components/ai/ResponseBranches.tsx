import { useEffect, useRef, useState } from 'react';
import { Bot, Check, ChevronLeft, ChevronRight, Copy, RefreshCw, Share2, ThumbsDown, ThumbsUp, Volume2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useClickOutside, useEscape, usePresence } from '@/components/ui/motion/hooks';
import { Markdown, useStream } from './stream';

const KEYFRAMES =
  '@keyframes rb-in-r{from{opacity:0;transform:translateX(16px);filter:blur(3px)}to{opacity:1;transform:none;filter:none}}' +
  '@keyframes rb-in-l{from{opacity:0;transform:translateX(-16px);filter:blur(3px)}to{opacity:1;transform:none;filter:none}}' +
  '@keyframes rb-eq{0%,100%{transform:scaleY(.35)}50%{transform:scaleY(1)}}';

const btn = 'focus-ring flex h-7 w-7 items-center justify-center rounded-md text-ink-400 transition-all hover:bg-white/5 hover:text-ink-100 active:scale-90 disabled:pointer-events-none disabled:opacity-40';

export type BranchPickerProps = { index: number; count: number; onChange: (index: number) => void; className?: string };

/** “‹ 2 / 3 ›” navigation between regenerated versions of a reply. */
export function BranchPicker({ index, count, onChange, className }: BranchPickerProps) {
  return (
    <div className={cn('flex items-center', className)}>
      <button type="button" onClick={() => onChange(index - 1)} disabled={index === 0} className={btn} aria-label="Previous version">
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="min-w-[38px] text-center font-mono text-[11px] tabular-nums text-ink-400" aria-live="polite">
        {index + 1} / {count}
      </span>
      <button type="button" onClick={() => onChange(index + 1)} disabled={index >= count - 1} className={btn} aria-label="Next version">
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

export type Feedback = { vote: 'up' | 'down'; reasons?: string[]; comment?: string };

export type ResponseActionsProps = {
  /** Text copied by the copy action. */
  text: string;
  onRegenerate?: () => void;
  regenerating?: boolean;
  onFeedback?: (feedback: Feedback | null) => void;
  /** Link copied by the share action. */
  shareUrl?: string;
  /** Small trailing label, e.g. model and latency. */
  meta?: string;
  className?: string;
};

const REASONS = ['Inaccurate', 'Too long', 'Off-topic', 'Ignored instructions', 'Outdated', 'Unsafe'];

/** Copy, regenerate, rate, share and read-aloud actions for an assistant reply. */
export function ResponseActions({ text, onRegenerate, regenerating, onFeedback, shareUrl = 'https://chat.example/s/7f3a9c', meta, className }: ResponseActionsProps) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [vote, setVote] = useState<'up' | 'down' | null>(null);
  const [panel, setPanel] = useState<'closed' | 'open' | 'sent'>('closed');
  const [reasons, setReasons] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [reading, setReading] = useState(false);
  const pop = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const { mounted, visible } = usePresence(panel !== 'closed', 160);
  const later = (ms: number, f: () => void) => void timers.current.push(window.setTimeout(f, ms));
  const closePanel = () => setPanel('closed');
  useClickOutside([pop], panel === 'open', closePanel);
  useEscape(panel === 'open', closePanel);
  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  useEffect(() => {
    if (!reading) return;
    const t = window.setTimeout(() => setReading(false), 6000);
    return () => window.clearTimeout(t);
  }, [reading]);

  const write = async (s: string) => {
    try {
      await navigator.clipboard.writeText(s);
    } catch {
      /* clipboard unavailable */
    }
  };
  const copy = () => {
    write(text);
    setCopied(true);
    later(1500, () => setCopied(false));
  };
  const share = () => {
    write(shareUrl);
    setShared(true);
    later(1600, () => setShared(false));
  };
  const rate = (v: 'up' | 'down') => {
    if (vote === v) {
      setVote(null);
      setPanel('closed');
      onFeedback?.(null);
      return;
    }
    setVote(v);
    if (v === 'up') {
      setPanel('closed');
      onFeedback?.({ vote: 'up' });
    } else setPanel('open');
  };
  const submit = () => {
    onFeedback?.({ vote: 'down', reasons, comment: comment.trim() || undefined });
    setPanel('sent');
    later(1300, () => setPanel('closed'));
  };

  return (
    <div className={cn('relative flex flex-wrap items-center gap-0.5', className)}>
      <style>{KEYFRAMES}</style>
      <button type="button" onClick={copy} className={btn} aria-label="Copy reply">
        <span className="relative h-3.5 w-3.5">
          <Copy className={cn('absolute inset-0 h-3.5 w-3.5 transition-all duration-200', copied ? 'scale-50 opacity-0' : 'opacity-100')} />
          <Check className={cn('absolute inset-0 h-3.5 w-3.5 text-emerald-400 transition-all duration-300 ease-spring', copied ? 'scale-100 opacity-100' : 'scale-50 opacity-0')} />
        </span>
      </button>
      {onRegenerate && (
        <button type="button" onClick={onRegenerate} disabled={regenerating} className={cn(btn, 'group/re')} aria-label="Regenerate reply">
          <RefreshCw className={cn('h-3.5 w-3.5 transition-transform duration-500 group-hover/re:rotate-180', regenerating && 'animate-spin')} />
        </button>
      )}
      <button type="button" onClick={() => rate('up')} aria-pressed={vote === 'up'} className={cn(btn, vote === 'up' && 'text-emerald-400 hover:text-emerald-300')} aria-label="Good reply">
        <ThumbsUp className={cn('h-3.5 w-3.5 transition-transform duration-300 ease-spring', vote === 'up' && '-rotate-12 scale-110 fill-emerald-400/20')} />
      </button>
      <div ref={pop} className="relative">
        <button type="button" onClick={() => rate('down')} aria-pressed={vote === 'down'} aria-expanded={panel === 'open'} className={cn(btn, vote === 'down' && 'text-rose-400 hover:text-rose-300')} aria-label="Bad reply">
          <ThumbsDown className={cn('h-3.5 w-3.5 transition-transform duration-300 ease-spring', vote === 'down' && 'rotate-12 scale-110 fill-rose-400/20')} />
        </button>
        {mounted && (
          <div
            role="dialog"
            aria-label="Feedback"
            className={cn(
              'absolute left-0 top-full z-20 mt-2 w-[min(18rem,calc(100vw-4rem))] origin-top-left rounded-xl bg-ink-850 p-3 shadow-pop transition-all',
              visible ? 'scale-100 opacity-100 duration-300 ease-spring' : 'scale-95 opacity-0 duration-150',
            )}
          >
            {panel === 'sent' ? (
              <p className="flex animate-fade-in items-center gap-2 py-2 text-sm text-ink-100">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15">
                  <Check className="h-3 w-3 text-emerald-400" />
                </span>
                Thanks, this helps us improve.
              </p>
            ) : (
              <>
                <p className="text-[13px] font-medium text-ink-100">What went wrong?</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {REASONS.map((r) => {
                    const on = reasons.includes(r);
                    return (
                      <button
                        key={r}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setReasons((all) => (on ? all.filter((x) => x !== r) : [...all, r]))}
                        className={cn('focus-ring rounded-full px-2.5 py-1 text-[11px] transition-all active:scale-95', on ? 'bg-rose-500/15 text-rose-200 ring-1 ring-inset ring-rose-400/30' : 'bg-white/5 text-ink-300 hover:bg-white/10')}
                      >
                        {r}
                      </button>
                    );
                  })}
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={2}
                  placeholder="Tell us more (optional)"
                  className="mt-2.5 block w-full resize-none rounded-lg bg-ink-900 px-2.5 py-2 text-xs text-ink-100 shadow-hairline outline-none placeholder:text-ink-500 focus:shadow-[0_0_0_1px_rgba(56,189,248,0.35)]"
                />
                <div className="mt-2.5 flex justify-end gap-1.5">
                  <button type="button" onClick={closePanel} className="focus-ring h-7 rounded-lg px-2.5 text-xs text-ink-400 hover:bg-white/5 hover:text-ink-100">
                    Cancel
                  </button>
                  <button type="button" onClick={submit} className="focus-ring h-7 rounded-lg bg-ink-50 px-3 text-xs font-medium text-ink-950 transition-all hover:bg-white active:scale-95">
                    Send feedback
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      <button type="button" onClick={share} className={btn} aria-label="Copy share link">
        {shared ? <Check className="h-3.5 w-3.5 animate-scale-in text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
      </button>
      <button type="button" onClick={() => setReading((r) => !r)} aria-pressed={reading} className={cn(btn, reading && 'text-brand-300')} aria-label={reading ? 'Stop reading aloud' : 'Read aloud'}>
        {reading ? (
          <span className="flex h-3.5 items-center gap-[2px]">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="h-full w-[2px] rounded-full bg-current" style={{ animation: `rb-eq 0.9s ease-in-out ${i * 120}ms infinite` }} />
            ))}
          </span>
        ) : (
          <Volume2 className="h-3.5 w-3.5" />
        )}
      </button>
      {(shared || meta) && (
        <span className="ml-1.5 truncate text-[11px] text-ink-500">
          {shared ? <span className="animate-fade-in text-emerald-300">Link copied</span> : meta}
        </span>
      )}
    </div>
  );
}

const REPLIES = [
  '**“Write freely. Nobody’s reading.”**\nIt sounds human and makes privacy a feeling rather than a feature. Back it with one line underneath: “End-to-end encrypted. No ads. No training on your notes.”',
  '**“Your notes. Your keys. Your business.”**\nThree beats that build from ownership to attitude. It works on a billboard and fits an app store subtitle.',
  '**“The notebook that forgets you exist.”**\nA little cheeky, and it turns “we track nothing” into a promise. Best for a younger, design-led audience.',
  '**“Private by default. Beautiful by design.”**\nSafe and broad. Pick it if the app competes on craft as much as on privacy.',
  '**“Think out loud, quietly.”**\nThe shortest option, with a nice tension in it. Let the visuals carry the privacy story.',
];

export function ResponseBranchesDemo() {
  const [branches, setBranches] = useState([0, 1]);
  const [index, setIndex] = useState(1);
  const [dir, setDir] = useState<1 | -1>(1);
  const [streaming, setStreaming] = useState(false);
  const live = REPLIES[branches[index]];
  const stream = useStream(live, { speed: 26, enabled: streaming });

  useEffect(() => {
    if (streaming && stream.done) setStreaming(false);
  }, [streaming, stream.done]);

  const go = (i: number) => {
    setDir(i > index ? 1 : -1);
    setIndex(i);
    setStreaming(false);
  };
  const regenerate = () => {
    const next = branches.length % REPLIES.length;
    setBranches((b) => [...b, next]);
    setDir(1);
    setIndex(branches.length);
    setStreaming(!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    stream.restart();
  };

  return (
    <div className="mx-auto w-full max-w-xl space-y-5">
      <div className="flex justify-end">
        <p className="max-w-[85%] rounded-2xl rounded-br-md bg-brand-600 px-3.5 py-2 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
          Give me a tagline for a privacy-first notes app.
        </p>
      </div>
      <div className="flex gap-3">
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 to-brand-700 text-white shadow-glow">
          <Bot className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="min-h-[104px] overflow-hidden">
            <div key={index} style={{ animation: `${dir === 1 ? 'rb-in-r' : 'rb-in-l'} 380ms cubic-bezier(0.16,1,0.3,1) both` }}>
              <Markdown text={streaming ? stream.output : live} caret={streaming} className="[&_strong]:text-[15px]" />
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1 border-t border-white/5 pt-2">
            <BranchPicker index={index} count={branches.length} onChange={go} />
            <span className="mx-1 hidden h-4 w-px bg-white/10 sm:block" />
            <ResponseActions text={live.replace(/\*\*/g, '')} onRegenerate={regenerate} regenerating={streaming} meta="Nova Pro · 1.4s" />
          </div>
        </div>
      </div>
    </div>
  );
}
