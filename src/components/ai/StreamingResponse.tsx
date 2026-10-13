import { Bot, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Markdown, useStream } from './stream';

export type StreamingResponseProps = {
  text: string;
  speed?: number;
  className?: string;
  showReplay?: boolean;
};

export const RELEASE_NOTES = `## Migrating to Postgres 16
The upgrade is low-risk for your workload. Here is the plan I recommend:
- Take a **logical backup** with \`pg_dump\` before the window
- Spin up a replica on 16 and let it sync for 24 hours
- Flip the connection string during the Sunday maintenance window
## What you gain
Queries with large \`IN\` lists run about **30% faster**, and logical replication from standbys means you can drop the extra reporting instance.`;

export function StreamingResponse({ text, speed = 30, className, showReplay = true }: StreamingResponseProps) {
  const { output, done, restart, progress } = useStream(text, { speed });

  return (
    <div className={cn('w-full rounded-2xl bg-ink-900 p-5 shadow-card', className)}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 to-brand-700 text-white">
            <Bot className="h-4 w-4" />
          </span>
          <span className="text-sm font-medium text-ink-100">NiceUI</span>
          <span className={cn('text-xs transition-colors', done ? 'text-ink-500' : 'shimmer-text')}>{done ? 'Finished' : 'Writing…'}</span>
        </div>
        {showReplay && (
          <button
            onClick={restart}
            disabled={!done}
            className="focus-ring group flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs text-ink-400 transition-all hover:bg-white/5 hover:text-ink-100 disabled:pointer-events-none disabled:opacity-0"
          >
            <RefreshCw className="h-3.5 w-3.5 transition-transform duration-500 group-hover:-rotate-180" />
            Replay
          </button>
        )}
      </div>
      <Markdown text={output} caret={!done} />
      <div className="mt-5 h-px w-full overflow-hidden bg-white/5">
        <div className="h-full bg-gradient-to-r from-brand-500 to-sky-300 transition-[width] duration-200 ease-out" style={{ width: `${progress * 100}%` }} />
      </div>
    </div>
  );
}

export function StreamingResponseDemo() {
  return (
    <div className="mx-auto w-full max-w-xl">
      <StreamingResponse text={RELEASE_NOTES} />
    </div>
  );
}
