import { useState } from 'react';
import { Bot, Check, FileText, Terminal } from 'lucide-react';
import { CodeBlock } from '@/components/ui/CodeBlock';
import { cn } from '@/lib/cn';

export type CodeFile = { name: string; code: string; highlight?: number[] };

export function CodeTabs({ files, className }: { files: CodeFile[]; className?: string }) {
  const [active, setActive] = useState(0);
  const file = files[active];

  return (
    <div className={cn('overflow-hidden rounded-xl bg-ink-950 shadow-card', className)}>
      <div className="flex items-center gap-1 overflow-x-auto border-b border-white/5 bg-ink-900/60 px-2 pt-2">
        {files.map((f, i) => (
          <button
            key={f.name}
            onClick={() => setActive(i)}
            className={cn(
              'focus-ring relative flex shrink-0 items-center gap-1.5 rounded-t-lg px-3 py-2 font-mono text-xs transition-colors',
              i === active ? 'bg-ink-950 text-ink-50' : 'text-ink-500 hover:text-ink-200',
            )}
          >
            {f.name.endsWith('.sh') ? <Terminal className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
            {f.name}
            <span
              className={cn(
                'absolute inset-x-2 top-0 h-px origin-center bg-brand-400 transition-transform duration-300 ease-spring',
                i === active ? 'scale-x-100' : 'scale-x-0',
              )}
            />
          </button>
        ))}
      </div>
      <div key={file.name} className="animate-fade-in">
        <CodeBlock code={file.code} filename={file.name} highlightLines={file.highlight} className="rounded-none shadow-none" maxHeight={300} />
      </div>
    </div>
  );
}

const RATE_LIMIT = `import { Ratelimit } from '@upstash/ratelimit';
import { redis } from '@/lib/redis';

const limiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '10 s'),
});

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? 'anon';
  const { success } = await limiter.limit(ip);
  if (!success) return new Response('Too many requests', { status: 429 });
  return handleChat(req);
}`;

export function CodeHighlightDemo() {
  const [applied, setApplied] = useState(false);
  return (
    <div className="mx-auto flex w-full max-w-2xl gap-3">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 to-brand-700 text-white">
        <Bot className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1 space-y-3">
        <p className="text-sm leading-relaxed text-ink-300">
          Add a sliding-window limiter before the handler. The <span className="text-brand-300">highlighted lines</span> are the only changes to <code className="font-mono text-ink-100">route.ts</code>:
        </p>
        <CodeBlock code={RATE_LIMIT} filename="app/api/chat/route.ts" highlightLines={[4, 5, 6, 7, 11, 12]} maxHeight={320} />
        <div className="flex items-center gap-2">
          <button
            onClick={() => setApplied((a) => !a)}
            className={cn(
              'focus-ring flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition-all duration-300 ease-spring active:scale-95',
              applied ? 'bg-emerald-500/15 text-emerald-300' : 'bg-ink-50 text-ink-950 hover:bg-white',
            )}
          >
            {applied && <Check className="h-3.5 w-3.5 animate-scale-in" />}
            {applied ? 'Applied to route.ts' : 'Apply change'}
          </button>
          <span className="text-xs text-ink-500">+6 lines</span>
        </div>
      </div>
    </div>
  );
}

const FILES: CodeFile[] = [
  {
    name: 'useChat.ts',
    highlight: [6],
    code: `import { useState } from 'react';

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const send = async (text: string) => {
    const res = await fetch('/api/chat', { method: 'POST', body: text });
    setMessages((m) => [...m, await res.json()]);
  };
  return { messages, send };
}`,
  },
  {
    name: 'Chat.tsx',
    highlight: [4, 5],
    code: `import { useChat } from './useChat';

export function Chat() {
  const { messages, send } = useChat();
  return <Thread messages={messages} onSend={send} />;
}`,
  },
  {
    name: 'setup.sh',
    code: `# install and run locally
npm install @upstash/ratelimit
cp .env.example .env.local
npm run dev`,
  },
];

export function CodeTabsDemo() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <CodeTabs files={FILES} />
    </div>
  );
}
