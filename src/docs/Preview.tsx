import { useState } from 'react';
import { Code2, Eye, RotateCcw } from 'lucide-react';
import { CodeBlock } from '@/components/ui/CodeBlock';
import { cn } from '@/lib/cn';
import type { Demo } from './types';

export function Preview({ demo }: { demo: Demo }) {
  const [tab, setTab] = useState<'preview' | 'code'>('preview');
  const [key, setKey] = useState(0);
  const Component = demo.component;

  return (
    <div className="space-y-3">
      {(demo.title || demo.description) && (
        <div>
          {demo.title && <h3 className="text-base font-medium text-ink-100">{demo.title}</h3>}
          {demo.description && <p className="mt-1 text-sm text-ink-400">{demo.description}</p>}
        </div>
      )}
      <div className="overflow-hidden rounded-2xl bg-ink-900 shadow-card">
        <div className="flex items-center justify-between border-b border-white/5 px-2 py-2">
          <div className="relative flex rounded-lg bg-ink-950/60 p-0.5">
            <span
              className={cn(
                'absolute inset-y-0.5 w-[calc(50%-2px)] rounded-md bg-ink-800 shadow-hairline transition-transform duration-300 ease-smooth',
                tab === 'code' ? 'translate-x-full' : 'translate-x-0',
              )}
            />
            {(['preview', 'code'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                disabled={t === 'code' && !demo.code}
                className={cn(
                  'focus-ring relative z-10 flex w-24 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium capitalize transition-colors disabled:cursor-not-allowed disabled:opacity-40',
                  tab === t ? 'text-ink-50' : 'text-ink-400 hover:text-ink-200',
                )}
              >
                {t === 'preview' ? <Eye className="h-3.5 w-3.5" /> : <Code2 className="h-3.5 w-3.5" />}
                {t}
              </button>
            ))}
          </div>
          <button
            onClick={() => setKey((k) => k + 1)}
            className="focus-ring group flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-white/5 hover:text-ink-100"
            aria-label="Replay demo"
            title="Replay"
          >
            <RotateCcw className="h-4 w-4 transition-transform duration-500 group-hover:-rotate-180" />
          </button>
        </div>
        {tab === 'preview' ? (
          <div
            className="dot-bg relative flex items-center justify-center overflow-hidden p-6 sm:p-10"
            style={{ minHeight: demo.height ?? 360 }}
          >
            <div key={key} className="w-full animate-fade-in">
              <Component />
            </div>
          </div>
        ) : (
          <div className="p-3">
            <CodeBlock code={demo.code ?? ''} className="shadow-none" maxHeight={560} />
          </div>
        )}
      </div>
    </div>
  );
}
