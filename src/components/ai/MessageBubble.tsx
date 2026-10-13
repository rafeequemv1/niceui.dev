import { useEffect, useState, type ReactNode } from 'react';
import { Bot, Check, Copy, RefreshCw, ThumbsDown, ThumbsUp } from 'lucide-react';
import { cn } from '@/lib/cn';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

export type MessageBubbleProps = {
  role: 'user' | 'assistant';
  children: ReactNode;
  time?: string;
  status?: MessageStatus;
  copyText?: string;
  onRegenerate?: () => void;
  actions?: boolean;
  className?: string;
};

function Receipt({ status }: { status: MessageStatus }) {
  const read = status === 'read';
  return (
    <span className={cn('relative inline-flex h-3 w-4 transition-colors duration-500', read ? 'text-brand-300' : 'text-ink-500')} aria-label={status}>
      <Check className={cn('absolute left-0 h-3 w-3 transition-all duration-300', status === 'sending' && 'opacity-30')} strokeWidth={2.5} />
      <Check
        className={cn(
          'absolute left-[5px] h-3 w-3 transition-all duration-300 ease-spring',
          status === 'delivered' || read ? 'scale-100 opacity-100' : 'scale-50 opacity-0',
        )}
        strokeWidth={2.5}
      />
    </span>
  );
}

const actionBtn =
  'focus-ring flex h-7 w-7 items-center justify-center rounded-md text-ink-400 transition-all hover:bg-white/5 hover:text-ink-100 active:scale-90';

export function MessageBubble({ role, children, time, status, copyText, onRegenerate, actions = true, className }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [vote, setVote] = useState<'up' | 'down' | null>(null);
  const isUser = role === 'user';

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(copyText ?? '');
    } catch {
      /* clipboard unavailable */
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={cn('group flex w-full gap-3', isUser ? 'justify-end' : 'justify-start', className)}>
      {!isUser && (
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 to-brand-700 text-white shadow-glow">
          <Bot className="h-4 w-4" />
        </div>
      )}
      <div className={cn('flex min-w-0 max-w-[85%] flex-col', isUser ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'text-sm leading-relaxed',
            isUser
              ? 'rounded-2xl rounded-br-md bg-brand-600 px-3.5 py-2 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]'
              : 'rounded-2xl rounded-tl-md bg-ink-850 px-3.5 py-2.5 text-ink-200 shadow-hairline',
          )}
        >
          {children}
        </div>
        <div className={cn('mt-1 flex h-7 items-center gap-1.5', isUser ? 'flex-row-reverse' : 'flex-row')}>
          {(time || status) && (
            <span className="flex items-center gap-1 px-1 text-[11px] text-ink-500">
              {time}
              {isUser && status && <Receipt status={status} />}
            </span>
          )}
          {actions && (
            <div className="flex translate-y-1 items-center opacity-0 transition-all duration-200 ease-smooth group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
              <button onClick={copy} className={actionBtn} aria-label="Copy message">
                <span className="relative h-3.5 w-3.5">
                  <Copy className={cn('absolute inset-0 h-3.5 w-3.5 transition-all duration-200', copied ? 'scale-50 opacity-0' : 'opacity-100')} />
                  <Check className={cn('absolute inset-0 h-3.5 w-3.5 text-emerald-400 transition-all duration-300 ease-spring', copied ? 'scale-100 opacity-100' : 'scale-50 opacity-0')} />
                </span>
              </button>
              {!isUser && (
                <>
                  <button onClick={() => setVote(vote === 'up' ? null : 'up')} className={cn(actionBtn, vote === 'up' && 'text-emerald-400')} aria-label="Good response">
                    <ThumbsUp className={cn('h-3.5 w-3.5 transition-transform duration-300 ease-spring', vote === 'up' && '-rotate-12 scale-110')} />
                  </button>
                  <button onClick={() => setVote(vote === 'down' ? null : 'down')} className={cn(actionBtn, vote === 'down' && 'text-rose-400')} aria-label="Bad response">
                    <ThumbsDown className={cn('h-3.5 w-3.5 transition-transform duration-300 ease-spring', vote === 'down' && 'rotate-12 scale-110')} />
                  </button>
                  {onRegenerate && (
                    <button onClick={onRegenerate} className={cn(actionBtn, 'group/re')} aria-label="Regenerate">
                      <RefreshCw className="h-3.5 w-3.5 transition-transform duration-500 group-hover/re:rotate-180" />
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const REPLIES = [
  'Yes — move the standup to 10:30 and I’ll shift the design review to 2pm so nobody double-books.',
  'Done. Standup is now 10:30 and the design review moved to 2:00pm. Invites were updated for all 6 attendees.',
  'I’d keep standup at 10:30 but shorten the review to 30 min — Maya has a hard stop at 2:45.',
];

export function MessageBubbleDemo() {
  const [status, setStatus] = useState<MessageStatus>('sending');
  const [reply, setReply] = useState(0);

  useEffect(() => {
    const a = window.setTimeout(() => setStatus('sent'), 500);
    const b = window.setTimeout(() => setStatus('delivered'), 1200);
    const c = window.setTimeout(() => setStatus('read'), 2200);
    return () => [a, b, c].forEach((t) => window.clearTimeout(t));
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-1">
      <div className="animate-fade-up">
        <MessageBubble role="user" time="9:41" status="read" copyText="Can you move tomorrow’s standup later?">
          Can you move tomorrow’s standup later? I have a dentist appointment at 9.
        </MessageBubble>
      </div>
      <div className="animate-fade-up" style={{ animationDelay: '120ms' }}>
        <MessageBubble role="assistant" time="9:41" copyText={REPLIES[reply]} onRegenerate={() => setReply((r) => (r + 1) % REPLIES.length)}>
          <span key={reply} className="block animate-fade-in">{REPLIES[reply]}</span>
        </MessageBubble>
      </div>
      <div className="animate-fade-up" style={{ animationDelay: '240ms' }}>
        <MessageBubble role="user" time="9:42" status={status} copyText="Perfect, thanks!">
          Perfect, thanks! 🙏
        </MessageBubble>
      </div>
      <p className="mt-2 text-center text-xs text-ink-500">Hover a message to copy, rate or regenerate.</p>
    </div>
  );
}
