import { useMemo, useState } from 'react';
import { FileText, Globe, Plug, Search, ShieldCheck, Terminal } from 'lucide-react';
import { cn } from '@/lib/cn';

export type Permission = 'always' | 'ask' | 'never';
export type ToolDef = { id: string; name: string; desc: string; group: string; risk: 'low' | 'medium' | 'high' };

export type ToolPermissionsProps = {
  tools: ToolDef[];
  value: Record<string, Permission>;
  onChange: (next: Record<string, Permission>) => void;
  className?: string;
};

const GROUP_ICON: Record<string, typeof FileText> = { Files: FileText, Web: Globe, Shell: Terminal, 'MCP servers': Plug };
const OPTS: { id: Permission; label: string }[] = [
  { id: 'always', label: 'Always' },
  { id: 'ask', label: 'Ask' },
  { id: 'never', label: 'Never' },
];

export const PRESETS: Record<'Cautious' | 'Balanced' | 'Autonomous', (t: ToolDef) => Permission> = {
  Cautious: (t) => (t.risk === 'low' ? 'ask' : t.risk === 'medium' ? 'ask' : 'never'),
  Balanced: (t) => (t.risk === 'low' ? 'always' : t.risk === 'medium' ? 'ask' : 'ask'),
  Autonomous: (t) => (t.risk === 'high' ? 'ask' : 'always'),
};

export function ToolPermissions({ tools, value, onChange, className }: ToolPermissionsProps) {
  const [q, setQ] = useState('');
  const groups = useMemo(() => {
    const f = q.trim().toLowerCase();
    const list = tools.filter((t) => !f || (t.name + ' ' + t.desc + ' ' + t.group).toLowerCase().includes(f));
    return [...new Set(list.map((t) => t.group))].map((g) => ({ g, items: list.filter((t) => t.group === g) }));
  }, [tools, q]);

  const counts = OPTS.map((o) => ({ ...o, n: tools.filter((t) => value[t.id] === o.id).length }));
  const preset = (Object.keys(PRESETS) as (keyof typeof PRESETS)[]).find((p) => tools.every((t) => value[t.id] === PRESETS[p](t)));

  return (
    <div className={cn('w-full overflow-hidden rounded-2xl bg-ink-900 shadow-card', className)}>
      <div className="flex flex-wrap items-center gap-3 border-b border-white/5 p-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/10 text-brand-300">
          <ShieldCheck className="h-[18px] w-[18px]" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-ink-50">Tool permissions</p>
          <p className="text-xs text-ink-500">
            {counts.map((c, i) => (
              <span key={c.id}>
                {i > 0 && ' · '}
                <span className="tabular-nums text-ink-300">{c.n}</span> {c.label.toLowerCase()}
              </span>
            ))}
          </p>
        </div>
        <div className="flex w-full gap-1 rounded-xl bg-ink-950/60 p-1 sm:w-auto" role="group" aria-label="Presets">
          {(Object.keys(PRESETS) as (keyof typeof PRESETS)[]).map((p) => (
            <button
              key={p}
              onClick={() => onChange(Object.fromEntries(tools.map((t) => [t.id, PRESETS[p](t)])))}
              aria-pressed={preset === p}
              className={cn('focus-ring flex-1 rounded-lg px-2.5 py-1.5 text-xs transition-colors sm:flex-none', preset === p ? 'bg-ink-800 text-ink-50 shadow-hairline' : 'text-ink-400 hover:text-ink-100')}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      <div className="border-b border-white/5 px-4 py-2.5">
        <label className="flex items-center gap-2 rounded-lg bg-ink-950/50 px-3 ring-1 ring-white/5 focus-within:ring-brand-400/40">
          <Search className="h-3.5 w-3.5 text-ink-500" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tools" aria-label="Search tools" className="h-9 min-w-0 flex-1 bg-transparent text-sm text-ink-100 outline-none placeholder:text-ink-600" />
        </label>
      </div>
      <div className="max-h-[360px] overflow-y-auto">
        {groups.length === 0 && <p className="px-4 py-8 text-center text-sm text-ink-500">No tools match “{q}”.</p>}
        {groups.map(({ g, items }) => {
          const Icon = GROUP_ICON[g] ?? Plug;
          return (
            <div key={g}>
              <p className="sticky top-0 z-[1] flex items-center gap-2 bg-ink-900/95 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.12em] text-ink-500 backdrop-blur">
                <Icon className="h-3.5 w-3.5" /> {g}
              </p>
              {items.map((t) => (
                <div key={t.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-white/[0.04] px-4 py-2.5 sm:flex-nowrap">
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 font-mono text-[12.5px] text-ink-100">
                      {t.name}
                      {t.risk === 'high' && <span className="rounded bg-rose-500/10 px-1.5 py-px font-sans text-[10px] text-rose-300">high risk</span>}
                    </p>
                    <p className="truncate text-xs text-ink-500">{t.desc}</p>
                  </div>
                  <div role="radiogroup" aria-label={`${t.name} permission`} className="flex shrink-0 rounded-lg bg-ink-950/60 p-0.5">
                    {OPTS.map((o) => {
                      const on = value[t.id] === o.id;
                      return (
                        <button
                          key={o.id}
                          role="radio"
                          aria-checked={on}
                          onClick={() => onChange({ ...value, [t.id]: o.id })}
                          className={cn(
                            'focus-ring w-[58px] rounded-md py-1 text-[11.5px] transition-all duration-200',
                            on && o.id === 'always' && 'bg-emerald-500/15 text-emerald-300',
                            on && o.id === 'ask' && 'bg-amber-500/15 text-amber-300',
                            on && o.id === 'never' && 'bg-rose-500/15 text-rose-300',
                            !on && 'text-ink-500 hover:text-ink-200',
                          )}
                        >
                          {o.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const DEMO_TOOLS: ToolDef[] = [
  { id: 'read', name: 'read_file', desc: 'Read files inside the workspace', group: 'Files', risk: 'low' },
  { id: 'write', name: 'write_file', desc: 'Create or overwrite files', group: 'Files', risk: 'medium' },
  { id: 'delete', name: 'delete_file', desc: 'Delete files and folders', group: 'Files', risk: 'high' },
  { id: 'search', name: 'web_search', desc: 'Search the public web', group: 'Web', risk: 'low' },
  { id: 'fetch', name: 'fetch_url', desc: 'Download a page or API response', group: 'Web', risk: 'medium' },
  { id: 'shell', name: 'run_command', desc: 'Run shell commands in the sandbox', group: 'Shell', risk: 'high' },
  { id: 'tests', name: 'run_tests', desc: 'Run the project test suite', group: 'Shell', risk: 'low' },
  { id: 'issues', name: 'tracker.create_issue', desc: 'Open issues in your tracker', group: 'MCP servers', risk: 'medium' },
  { id: 'deploy', name: 'cloud.deploy', desc: 'Deploy to production', group: 'MCP servers', risk: 'high' },
];

export function ToolPermissionsDemo() {
  const [value, setValue] = useState<Record<string, Permission>>(() => Object.fromEntries(DEMO_TOOLS.map((t) => [t.id, PRESETS.Balanced(t)])));
  return (
    <div className="mx-auto w-full max-w-2xl">
      <ToolPermissions tools={DEMO_TOOLS} value={value} onChange={setValue} />
    </div>
  );
}
