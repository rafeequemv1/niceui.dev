import { useMemo, useState, type FormEvent } from 'react';
import { Folder, Globe, Plus, ShieldAlert, ShieldCheck, X } from 'lucide-react';
import { cn } from '@/lib/cn';

export type SandboxAllowlistProps = {
  folders: string[];
  domains: string[];
  onChange: (next: { folders: string[]; domains: string[] }) => void;
  className?: string;
};

/** `**` matches across folders, `*` within one segment (or one subdomain label). */
export function globToRegExp(glob: string, sep: '/' | '.') {
  const esc = glob.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  const seg = sep === '/' ? '[^/]*' : '[^.]*';
  const body = esc.replace(/\*\*/g, '\u0000').replace(/\*/g, seg).replace(/\u0000/g, '.*').replace(/\?/g, '.');
  return new RegExp('^' + body + '$', 'i');
}

const FOLDER_RE = /^(~|\/)[\w./*~-]*$/;
const DOMAIN_RE = /^(\*\.)?([a-z0-9-]+\.)+[a-z]{2,}$/i;

export function validate(kind: 'folders' | 'domains', v: string) {
  if (!v) return 'Enter a value';
  if (kind === 'folders') return FOLDER_RE.test(v) ? '' : 'Start with / or ~, e.g. ~/projects/app/**';
  return DOMAIN_RE.test(v) ? '' : 'Use a host like api.acme.dev or *.acme.dev';
}

export function checkTarget(target: string, folders: string[], domains: string[]) {
  const t = target.trim();
  if (!t) return null;
  if (/^https?:\/\//i.test(t) || /^[\w-]+(\.[\w-]+)+(\/|$)/.test(t)) {
    let host = '';
    try {
      host = new URL(/^https?:/i.test(t) ? t : 'https://' + t).hostname;
    } catch {
      return { kind: 'domain' as const, ok: false, rule: null, label: t };
    }
    const rule = domains.find((d) => globToRegExp(d, '.').test(host) || (d.startsWith('*.') && host === d.slice(2)));
    return { kind: 'domain' as const, ok: !!rule, rule: rule ?? null, label: host };
  }
  const rule = folders.find((f) => globToRegExp(f, '/').test(t));
  return { kind: 'path' as const, ok: !!rule, rule: rule ?? null, label: t };
}

export function SandboxAllowlist({ folders, domains, onChange, className }: SandboxAllowlistProps) {
  const [probe, setProbe] = useState('https://api.github.com/repos');
  const result = useMemo(() => checkTarget(probe, folders, domains), [probe, folders, domains]);

  return (
    <div className={cn('w-full overflow-hidden rounded-2xl bg-ink-900 shadow-card', className)}>
      <div className="grid gap-px bg-white/5 md:grid-cols-2">
        <List kind="folders" title="Folders" icon={Folder} items={folders} placeholder="~/projects/app/**" onChange={(f) => onChange({ folders: f, domains })} />
        <List kind="domains" title="Domains" icon={Globe} items={domains} placeholder="*.acme.dev" onChange={(d) => onChange({ folders, domains: d })} />
      </div>
      <div className="border-t border-white/5 p-4">
        <label htmlFor="sbx-probe" className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-500">
          Test a path or URL
        </label>
        <input
          id="sbx-probe"
          value={probe}
          onChange={(e) => setProbe(e.target.value)}
          spellCheck={false}
          className="mt-2 h-10 w-full rounded-lg bg-ink-950/60 px-3 font-mono text-[13px] text-ink-100 outline-none ring-1 ring-white/5 focus:ring-brand-400/40"
        />
        {result && (
          <div
            key={String(result.ok) + result.rule}
            role="status"
            className={cn('mt-3 flex items-start gap-2.5 rounded-xl px-3 py-2.5 text-[13px] animate-fade-in', result.ok ? 'bg-emerald-500/10 text-emerald-200' : 'bg-rose-500/10 text-rose-200')}
          >
            {result.ok ? <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" /> : <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />}
            <span className="min-w-0">
              <b className="font-medium">{result.ok ? 'Allowed' : 'Blocked'}</b>
              <span className="text-current/80">
                {' '}
                · {result.kind === 'domain' ? 'host' : 'path'} <code className="break-all font-mono text-[12px]">{result.label}</code>
              </span>
              <span className="mt-0.5 block text-xs opacity-75">
                {result.ok ? (
                  <>
                    matched <code className="font-mono">{result.rule}</code>
                  </>
                ) : (
                  'No rule matches. The agent will ask before touching it.'
                )}
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function List({ kind, title, icon: Icon, items, placeholder, onChange }: { kind: 'folders' | 'domains'; title: string; icon: typeof Folder; items: string[]; placeholder: string; onChange: (v: string[]) => void }) {
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const add = (e: FormEvent) => {
    e.preventDefault();
    const v = draft.trim();
    const err = validate(kind, v) || (items.includes(v) ? 'Already in the list' : '');
    setError(err);
    if (err) return;
    onChange([...items, v]);
    setDraft('');
  };
  return (
    <div className="bg-ink-900 p-4">
      <p className="mb-3 flex items-center gap-2 text-sm font-medium text-ink-100">
        <Icon className="h-4 w-4 text-brand-300" /> {title}
        <span className="ml-auto font-mono text-[11px] tabular-nums text-ink-500">{items.length}</span>
      </p>
      <ul className="space-y-1.5">
        {items.map((it) => (
          <li key={it} className="group flex items-center gap-2 rounded-lg bg-white/[0.03] py-1.5 pl-3 pr-1.5 ring-1 ring-white/5 animate-fade-in">
            <code className="min-w-0 flex-1 truncate font-mono text-[12.5px] text-ink-200">{it}</code>
            <button onClick={() => onChange(items.filter((x) => x !== it))} aria-label={`Remove ${it}`} className="focus-ring grid h-6 w-6 place-items-center rounded-md text-ink-500 transition-colors hover:bg-rose-500/10 hover:text-rose-300">
              <X className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={add} className="mt-2">
        <div className={cn('flex items-center gap-1.5 rounded-lg bg-ink-950/60 pl-3 pr-1 ring-1 transition', error ? 'ring-rose-400/40' : 'ring-white/5 focus-within:ring-brand-400/40')}>
          <input
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              setError('');
            }}
            placeholder={placeholder}
            aria-label={`Add to ${title.toLowerCase()}`}
            aria-invalid={!!error}
            spellCheck={false}
            className="h-9 min-w-0 flex-1 bg-transparent font-mono text-[12.5px] text-ink-100 outline-none placeholder:text-ink-600"
          />
          <button type="submit" aria-label={`Add ${kind === 'folders' ? 'folder' : 'domain'}`} className="focus-ring grid h-7 w-7 place-items-center rounded-md bg-white/5 text-ink-300 hover:bg-white/10 hover:text-ink-50">
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        {error && <p className="mt-1.5 text-xs text-rose-300">{error}</p>}
      </form>
    </div>
  );
}

export function SandboxAllowlistDemo() {
  const [state, setState] = useState({
    folders: ['~/projects/acme-web/**', '/tmp/**'],
    domains: ['*.github.com', 'registry.npmjs.org', 'api.acme.dev'],
  });
  return (
    <div className="mx-auto w-full max-w-2xl">
      <SandboxAllowlist folders={state.folders} domains={state.domains} onChange={setState} />
    </div>
  );
}
