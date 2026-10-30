import { useState, type ReactNode } from 'react';
import { FolderPlus, RefreshCw, Search, Upload } from 'lucide-react';
import { cn } from '@/lib/cn';

type Kind = 'projects' | 'search' | 'inbox' | 'error';

function Art({ kind }: { kind: Kind }) {
  const stroke = 'rgba(255,255,255,0.14)';
  return (
    <svg viewBox="0 0 200 120" className="h-28 w-48" aria-hidden>
      <defs>
        <radialGradient id={`es-glow-${kind}`} cx="50%" cy="55%" r="50%">
          <stop offset="0%" stopColor={kind === 'error' ? '#fb7185' : '#38bdf8'} stopOpacity="0.22" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="66" rx="90" ry="50" fill={`url(#es-glow-${kind})`} />
      {kind === 'projects' && (
        <g className="animate-float">
          <rect x="52" y="34" width="96" height="62" rx="10" fill="#121316" stroke={stroke} />
          <path d="M52 48h96" stroke={stroke} />
          <rect x="64" y="58" width="34" height="26" rx="5" fill="none" stroke="#38bdf8" strokeOpacity=".6" strokeDasharray="4 3" />
          <rect x="104" y="58" width="32" height="6" rx="3" fill="rgba(255,255,255,.08)" />
          <rect x="104" y="70" width="22" height="6" rx="3" fill="rgba(255,255,255,.06)" />
          <circle cx="62" cy="41" r="2.5" fill="rgba(255,255,255,.2)" />
          <circle cx="70" cy="41" r="2.5" fill="rgba(255,255,255,.2)" />
        </g>
      )}
      {kind === 'search' && (
        <g>
          {[0, 1, 2].map((i) => (
            <rect key={i} x="46" y={30 + i * 22} width="108" height="16" rx="6" fill="#121316" stroke={stroke} opacity={1 - i * 0.28} />
          ))}
          <g className="animate-float">
            <circle cx="128" cy="58" r="16" fill="#0b0c0e" stroke="#7dd3fc" strokeWidth="2.5" />
            <path d="m140 70 12 12" stroke="#7dd3fc" strokeWidth="3" strokeLinecap="round" />
            <path d="M122 58h12" stroke="#7dd3fc" strokeOpacity=".6" strokeWidth="2" strokeLinecap="round" />
          </g>
        </g>
      )}
      {kind === 'inbox' && (
        <g>
          <path d="M56 70 70 40h60l14 30v22a6 6 0 0 1-6 6H62a6 6 0 0 1-6-6z" fill="#121316" stroke={stroke} />
          <path d="M56 70h26l6 10h24l6-10h26" fill="none" stroke={stroke} />
          <g className="animate-float">
            <path d="m88 52 8 8 16-18" fill="none" stroke="#34d399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          {[[40, 30], [158, 36], [150, 92]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="2" fill="#7dd3fc" opacity=".6" className="animate-pulse" style={{ animationDelay: `${i * 300}ms` }} />
          ))}
        </g>
      )}
      {kind === 'error' && (
        <g>
          <path d="M100 26 148 96H52z" fill="#121316" stroke="rgba(251,113,133,.45)" strokeLinejoin="round" />
          <path d="M100 52v20" stroke="#fb7185" strokeWidth="4" strokeLinecap="round" className="animate-pulse" />
          <circle cx="100" cy="83" r="2.6" fill="#fb7185" />
        </g>
      )}
    </svg>
  );
}

const COPY: Record<Kind, { title: string; body: string; action: string; icon: typeof Search; secondary?: string }> = {
  projects: { title: 'No projects yet', body: 'Projects keep your tasks, docs and files together. Start one from scratch or import from a file.', action: 'New project', icon: FolderPlus, secondary: 'Import' },
  search: { title: 'No results for “quarterly roadmap”', body: 'Try a shorter search, check the spelling, or search all workspaces.', action: 'Clear search', icon: Search, secondary: 'Search everywhere' },
  inbox: { title: 'Inbox zero', body: 'You are all caught up. New mentions and assignments will land here.', action: 'View archive', icon: Upload },
  error: { title: 'Something went wrong', body: 'We could not load this page. Your work is safe. Try again in a moment.', action: 'Try again', icon: RefreshCw, secondary: 'Contact support' },
};

export function EmptyState({ kind, onAction, children, className }: { kind: Kind; onAction?: () => void; children?: ReactNode; className?: string }) {
  const c = COPY[kind];
  return (
    <div className={cn('flex flex-col items-center px-6 py-10 text-center', className)}>
      <Art kind={kind} />
      <h3 className="mt-4 text-base font-semibold text-ink-50">{c.title}</h3>
      <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-ink-400">{c.body}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <button onClick={onAction} className={cn('focus-ring inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors', kind === 'error' ? 'bg-rose-500/90 text-white hover:bg-rose-500' : 'bg-brand-500 text-white hover:bg-brand-400')}>
          <c.icon className="h-4 w-4" />
          {c.action}
        </button>
        {c.secondary && <button className="focus-ring rounded-lg border border-white/10 px-3.5 py-2 text-sm text-ink-200 transition-colors hover:bg-white/5">{c.secondary}</button>}
      </div>
      {children}
    </div>
  );
}

const TABS: { id: Kind; label: string }[] = [
  { id: 'projects', label: 'No projects' },
  { id: 'search', label: 'No results' },
  { id: 'inbox', label: 'Inbox zero' },
  { id: 'error', label: 'Error' },
];

export function EmptyStatesDemo() {
  const [kind, setKind] = useState<Kind>('projects');
  const [spin, setSpin] = useState(false);
  return (
    <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-ink-900 shadow-card">
      <div role="tablist" aria-label="Empty state" className="flex gap-1 overflow-x-auto border-b border-white/5 p-2 [scrollbar-width:none]">
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={kind === t.id} onClick={() => setKind(t.id)} className={cn('focus-ring shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors', kind === t.id ? 'bg-white/[0.07] text-ink-50' : 'text-ink-400 hover:text-ink-100')}>
            {t.label}
          </button>
        ))}
      </div>
      <div key={kind} className={cn('animate-fade-up', spin && 'opacity-60')}>
        <EmptyState
          kind={kind}
          onAction={() => {
            if (kind !== 'error') return;
            setSpin(true);
            window.setTimeout(() => {
              setSpin(false);
              setKind('inbox');
            }, 900);
          }}
        />
      </div>
    </div>
  );
}
