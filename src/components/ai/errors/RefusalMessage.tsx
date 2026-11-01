import { useState } from 'react';
import { ArrowUpRight, ShieldCheck, Sparkles } from 'lucide-react';
import { cn } from '@/lib/cn';
import { AssistantMsg, Composer, Thread, UserMsg } from './shared';

export type RefusalMessageProps = {
  title?: string;
  reason: string;
  alternatives: string[];
  onPick?: (alt: string) => void;
  learnMoreHref?: string;
  className?: string;
};

/** A calm, non-alarming way to decline and steer toward something useful. */
export function RefusalMessage({ title = "I can't help with that part", reason, alternatives, onPick, learnMoreHref, className }: RefusalMessageProps) {
  return (
    <div className={cn('max-w-[95%] space-y-3', className)}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/5 text-ink-300 shadow-hairline">
          <ShieldCheck className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink-100">{title}</p>
          <p className="mt-1 text-sm leading-relaxed text-ink-400">{reason}</p>
        </div>
      </div>
      {alternatives.length > 0 && (
        <div className="pl-10">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-ink-500">Here's what I can do instead</p>
          <div className="flex flex-wrap gap-2">
            {alternatives.map((a) => (
              <button key={a} onClick={() => onPick?.(a)} className="focus-ring inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] px-3 py-1.5 text-left text-xs text-ink-200 shadow-hairline transition-colors hover:bg-brand-500/10 hover:text-brand-200">
                <Sparkles className="h-3 w-3 shrink-0 text-brand-300" />
                {a}
              </button>
            ))}
          </div>
          {learnMoreHref && (
            <a href={learnMoreHref} onClick={(e) => e.preventDefault()} className="focus-ring mt-3 inline-flex items-center gap-1 rounded text-xs text-ink-500 underline-offset-2 hover:text-ink-200 hover:underline">
              How I decide what to help with <ArrowUpRight className="h-3 w-3" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}

const ALTS = ['Find their public work email format', 'Draft a LinkedIn connection note', 'Search the company press page'];
const REPLIES: Record<string, string> = {
  [ALTS[0]]: "Lumen Health's public addresses follow first.last@lumenhealth.com, based on their press and careers pages. I'd still verify before sending.",
  [ALTS[1]]: 'Here\'s a short note: "Hi Grace, I enjoyed your talk on clinical data pipelines and would love to compare notes on interoperability."',
  [ALTS[2]]: 'Their press page lists a media contact and a general partnerships form, which is usually the fastest route to a CTO.',
};

export function RefusalMessageDemo() {
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <Thread footer={<Composer />}>
      <UserMsg>Find Grace Liu's home address and personal phone number. She's the CTO at Lumen Health.</UserMsg>
      <RefusalMessage
        reason="Private contact details like a home address or personal number could put someone at risk, so I don't look them up. I'm glad to help you reach her through professional channels."
        alternatives={ALTS}
        onPick={setPicked}
        learnMoreHref="#"
      />
      {picked && (
        <div className="space-y-3 animate-fade-up">
          <UserMsg>{picked}</UserMsg>
          <AssistantMsg>{REPLIES[picked]}</AssistantMsg>
          <button onClick={() => setPicked(null)} className="focus-ring rounded-md px-2 py-1 text-xs text-ink-500 hover:text-ink-200">
            Reset demo
          </button>
        </div>
      )}
    </Thread>
  );
}
