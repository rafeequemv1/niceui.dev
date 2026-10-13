import { useEffect, useRef, useState, type ReactNode } from 'react';
import { CheckCircle2, ChevronDown, ExternalLink, Globe, Loader2, Terminal, XCircle } from 'lucide-react';
import { cn } from '@/lib/cn';

export type ToolStatus = 'running' | 'success' | 'error';

export type ToolResultProps = {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  status: ToolStatus;
  /** Final duration in ms; while running an elapsed timer is shown. */
  duration?: number;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
};

function useElapsed(running: boolean) {
  const [ms, setMs] = useState(0);
  const start = useRef(0);
  useEffect(() => {
    if (!running) return;
    start.current = performance.now();
    const id = window.setInterval(() => setMs(performance.now() - start.current), 100);
    return () => window.clearInterval(id);
  }, [running]);
  return ms;
}

export function ToolResult({ icon, title, subtitle, status, duration, defaultOpen = false, children, className }: ToolResultProps) {
  const [open, setOpen] = useState(defaultOpen);
  const elapsed = useElapsed(status === 'running');
  const shown = status === 'running' ? elapsed : duration ?? elapsed;

  return (
    <div className={cn('w-full overflow-hidden rounded-xl bg-ink-900 shadow-card', className)}>
      <button onClick={() => setOpen((o) => !o)} className="focus-ring flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors hover:bg-white/[0.02]">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-ink-300">{icon}</span>
        <span className="min-w-0 flex-1">
          <span className={cn('block truncate text-sm', status === 'running' ? 'shimmer-text font-medium' : 'text-ink-100')}>{title}</span>
          {subtitle && <span className="block truncate text-xs text-ink-500">{subtitle}</span>}
        </span>
        <span className="font-mono text-[11px] tabular-nums text-ink-500">{(shown / 1000).toFixed(1)}s</span>
        <span className="relative flex h-4 w-4 items-center justify-center">
          {status === 'running' && <Loader2 className="h-4 w-4 animate-spin text-brand-400" />}
          {status === 'success' && <CheckCircle2 className="h-4 w-4 animate-scale-in text-emerald-400" />}
          {status === 'error' && <XCircle className="h-4 w-4 animate-scale-in text-rose-400" />}
        </span>
        <ChevronDown className={cn('h-4 w-4 text-ink-500 transition-transform duration-300 ease-spring', open && 'rotate-180')} />
      </button>
      <div className={cn('grid transition-[grid-template-rows] duration-300 ease-smooth', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
        <div className="overflow-hidden">
          <div className={cn('border-t border-white/5 transition-opacity duration-300', open ? 'opacity-100' : 'opacity-0')}>{children}</div>
        </div>
      </div>
    </div>
  );
}

const RESULTS = [
  { site: 'vercel.com', title: 'Edge Middleware rate limiting', snippet: 'Use a sliding window counter keyed on IP to throttle requests at the edge before they reach…', color: 'bg-ink-50 text-ink-950' },
  { site: 'upstash.com', title: '@upstash/ratelimit — Serverless rate limiting', snippet: 'Connectionless HTTP-based rate limiting for serverless and edge runtimes with Redis.', color: 'bg-emerald-500 text-ink-950' },
  { site: 'developer.mozilla.org', title: '429 Too Many Requests — HTTP | MDN', snippet: 'The HTTP 429 response status code indicates the user has sent too many requests in a given…', color: 'bg-sky-500 text-ink-950' },
];

const TERMINAL = [
  { t: '$ pnpm test --filter billing', c: 'text-ink-200' },
  { t: ' ✓ invoices.test.ts (12 tests) 214ms', c: 'text-emerald-300' },
  { t: ' ✓ refunds.test.ts (7 tests) 98ms', c: 'text-emerald-300' },
  { t: ' ✗ webhooks.test.ts > rejects bad signature', c: 'text-rose-300' },
  { t: '   Expected 401, received 500', c: 'text-rose-300/70' },
  { t: '', c: '' },
  { t: ' Tests  1 failed | 19 passed (20)', c: 'text-ink-300' },
];

export function ToolResultDemo() {
  const [search, setSearch] = useState<ToolStatus>('running');
  const [term, setTerm] = useState<ToolStatus>('running');

  useEffect(() => {
    const a = window.setTimeout(() => setSearch('success'), 1600);
    const b = window.setTimeout(() => setTerm('error'), 2600);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-3">
      <ToolResult
        icon={<Globe className="h-4 w-4" />}
        title={search === 'running' ? 'Searching the web…' : 'Searched the web'}
        subtitle="rate limiting serverless edge functions"
        status={search}
        duration={1600}
        defaultOpen
      >
        <ul className="divide-y divide-white/5">
          {(search === 'running' ? [] : RESULTS).map((r, i) => (
            <li key={r.site} className="animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
              <a href="#" onClick={(e) => e.preventDefault()} className="group flex gap-3 px-3.5 py-3 transition-colors hover:bg-white/[0.02]">
                <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-semibold uppercase', r.color)}>{r.site[0]}</span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1 text-xs text-ink-500">
                    {r.site} <ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                  </span>
                  <span className="block truncate text-sm text-ink-100 group-hover:text-brand-300">{r.title}</span>
                  <span className="line-clamp-1 text-xs text-ink-400">{r.snippet}</span>
                </span>
              </a>
            </li>
          ))}
          {search === 'running' && <li className="px-3.5 py-4 text-xs text-ink-500">Fetching results…</li>}
        </ul>
      </ToolResult>
      <ToolResult icon={<Terminal className="h-4 w-4" />} title="Ran pnpm test" subtitle="~/apps/billing" status={term} duration={2600}>
        <pre className="bg-ink-950 px-4 py-3 font-mono text-[12px] leading-5">
          {TERMINAL.map((l, i) => (
            <div key={i} className={l.c}>
              {l.t || '\u00a0'}
            </div>
          ))}
        </pre>
      </ToolResult>
    </div>
  );
}
