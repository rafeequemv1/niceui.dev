import { useEffect, useRef, useState } from 'react';
import { Check, Copy, CreditCard, Eye, EyeOff, KeyRound, Plus, Trash2, User, Users } from 'lucide-react';
import { cn } from '@/lib/cn';

type Tab = 'profile' | 'team' | 'billing' | 'keys';
type Member = { id: number; name: string; email: string; role: 'Owner' | 'Admin' | 'Member'; pending?: boolean };
type ApiKey = { id: number; name: string; secret: string; created: string; shown: boolean };

const TABS: { id: Tab; label: string; icon: typeof User }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'keys', label: 'API keys', icon: KeyRound },
];

const PROFILE = { name: 'Maya Okafor', email: 'maya@northbeam.dev', title: 'Head of Product', timezone: 'Europe/Lisbon' };

const MEMBERS: Member[] = [
  { id: 1, name: 'Maya Okafor', email: 'maya@northbeam.dev', role: 'Owner' },
  { id: 2, name: 'Jonas Weber', email: 'jonas@northbeam.dev', role: 'Admin' },
  { id: 3, name: 'Priya Raman', email: 'priya@northbeam.dev', role: 'Member' },
];

const INVOICES = [
  { id: 'INV-2041', date: 'Oct 1, 2026', amount: '$240.00' },
  { id: 'INV-1987', date: 'Sep 1, 2026', amount: '$240.00' },
  { id: 'INV-1932', date: 'Aug 1, 2026', amount: '$180.00' },
];

const randomKey = () => 'nui_live_' + Array.from({ length: 24 }, () => 'abcdefghijkmnpqrstuvwxyz23456789'[Math.floor(Math.random() * 32)]).join('');

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block min-w-0">
      <span className="text-xs font-medium text-ink-400">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="focus-ring mt-1.5 h-10 w-full rounded-lg border border-white/10 bg-ink-950/60 px-3 text-sm text-ink-50 outline-none transition-colors placeholder:text-ink-500 focus:border-brand-400/60"
      />
    </label>
  );
}

function Initials({ name, className }: { name: string; className?: string }) {
  const hue = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <span className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-full text-[11px] font-semibold text-white', className)} style={{ background: `hsl(${hue} 55% 38%)` }}>
      {name.split(' ').map((p) => p[0]).join('').slice(0, 2)}
    </span>
  );
}

export function SettingsPage({ className }: { className?: string }) {
  const [tab, setTab] = useState<Tab>('profile');
  const [saved, setSaved] = useState(PROFILE);
  const [draft, setDraft] = useState(PROFILE);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [members, setMembers] = useState(MEMBERS);
  const [invite, setInvite] = useState('');
  const [keys, setKeys] = useState<ApiKey[]>([{ id: 1, name: 'Production', secret: 'nui_live_7k2m9xq4p8r3t6w1v5z0abcd', created: 'Sep 12', shown: false }]);
  const [copied, setCopied] = useState<number | null>(null);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (ms: number, f: () => void) => timers.current.push(window.setTimeout(f, ms));

  const dirty = JSON.stringify(saved) !== JSON.stringify(draft);
  const flash = (msg: string) => {
    setToast(msg);
    later(2200, () => setToast(''));
  };
  const save = () => {
    setSaving(true);
    later(700, () => {
      setSaved(draft);
      setSaving(false);
      flash('Profile saved');
    });
  };

  const sendInvite = () => {
    const email = invite.trim();
    if (!/^\S+@\S+\.\S+$/.test(email)) return;
    setMembers((m) => [...m, { id: Date.now(), name: email.split('@')[0], email, role: 'Member', pending: true }]);
    setInvite('');
    flash(`Invite sent to ${email}`);
  };

  const copy = async (k: ApiKey) => {
    try {
      await navigator.clipboard.writeText(k.secret);
    } catch {}
    setCopied(k.id);
    later(1400, () => setCopied(null));
  };

  return (
    <div className={cn('relative w-full max-w-3xl overflow-hidden rounded-2xl bg-ink-900 shadow-card', className)}>
      <div className="grid md:grid-cols-[180px_minmax(0,1fr)]">
        <nav aria-label="Settings sections" className="flex gap-1 overflow-x-auto border-b border-white/5 p-2 [scrollbar-width:none] md:flex-col md:border-b-0 md:border-r md:p-3">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              aria-current={tab === t.id ? 'page' : undefined}
              className={cn(
                'focus-ring flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                tab === t.id ? 'bg-white/[0.06] text-ink-50' : 'text-ink-400 hover:bg-white/[0.03] hover:text-ink-100',
              )}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </nav>

        <div className="min-h-[400px] min-w-0 p-5 sm:p-6">
          {tab === 'profile' && (
            <div key="profile" className="animate-fade-in">
              <h3 className="text-base font-semibold text-ink-50">Profile</h3>
              <p className="mt-1 text-sm text-ink-400">How you appear to your team.</p>
              <div className="mt-5 flex items-center gap-3">
                <Initials name={draft.name || '?'} className="h-12 w-12 text-sm" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink-100">{draft.name || 'Your name'}</p>
                  <p className="truncate text-xs text-ink-500">{draft.title}</p>
                </div>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label="Full name" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} />
                <Field label="Email" type="email" value={draft.email} onChange={(v) => setDraft({ ...draft, email: v })} />
                <Field label="Job title" value={draft.title} onChange={(v) => setDraft({ ...draft, title: v })} />
                <Field label="Time zone" value={draft.timezone} onChange={(v) => setDraft({ ...draft, timezone: v })} />
              </div>
            </div>
          )}

          {tab === 'team' && (
            <div key="team" className="animate-fade-in">
              <h3 className="text-base font-semibold text-ink-50">Team</h3>
              <p className="mt-1 text-sm text-ink-400">{members.length} members · invite people by email.</p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendInvite();
                }}
                className="mt-5 flex gap-2"
              >
                <input
                  value={invite}
                  onChange={(e) => setInvite(e.target.value)}
                  placeholder="teammate@company.com"
                  aria-label="Email to invite"
                  className="focus-ring h-10 min-w-0 flex-1 rounded-lg border border-white/10 bg-ink-950/60 px-3 text-sm text-ink-50 outline-none placeholder:text-ink-500 focus:border-brand-400/60"
                />
                <button className="focus-ring inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-brand-500 px-3.5 text-sm font-medium text-white transition-colors hover:bg-brand-400">
                  <Plus className="h-4 w-4" /> Invite
                </button>
              </form>
              <ul className="mt-4 divide-y divide-white/5 rounded-xl border border-white/5">
                {members.map((m) => (
                  <li key={m.id} className="flex items-center gap-3 px-3 py-2.5 animate-fade-in">
                    <Initials name={m.name} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-ink-100">
                        {m.name} {m.pending && <span className="ml-1 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] text-amber-300">Pending</span>}
                      </p>
                      <p className="truncate text-xs text-ink-500">{m.email}</p>
                    </div>
                    {m.role === 'Owner' ? (
                      <span className="text-xs text-ink-400">Owner</span>
                    ) : (
                      <select
                        value={m.role}
                        aria-label={`Role for ${m.name}`}
                        onChange={(e) => setMembers((list) => list.map((x) => (x.id === m.id ? { ...x, role: e.target.value as Member['role'] } : x)))}
                        className="focus-ring h-8 rounded-md border border-white/10 bg-ink-950 px-2 text-xs text-ink-200"
                      >
                        <option>Admin</option>
                        <option>Member</option>
                      </select>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tab === 'billing' && (
            <div key="billing" className="animate-fade-in">
              <h3 className="text-base font-semibold text-ink-50">Billing</h3>
              <div className="mt-5 rounded-xl border border-brand-400/20 bg-brand-500/[0.06] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-brand-300">Current plan</p>
                    <p className="mt-1 text-lg font-semibold text-ink-50">
                      Team <span className="text-sm font-normal text-ink-400">· $240 / month</span>
                    </p>
                  </div>
                  <button className="focus-ring rounded-lg border border-white/10 px-3 py-1.5 text-sm text-ink-100 transition-colors hover:bg-white/5">Change plan</button>
                </div>
                {[
                  ['Seats', 6, 10],
                  ['AI credits', 7400, 10000],
                ].map(([label, used, total]) => (
                  <div key={label as string} className="mt-4">
                    <div className="flex justify-between text-xs text-ink-400">
                      <span>{label}</span>
                      <span className="font-mono tabular-nums">
                        {(used as number).toLocaleString()} / {(total as number).toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/5">
                      <div className="h-full rounded-full bg-brand-400 transition-all duration-700 ease-smooth" style={{ width: `${((used as number) / (total as number)) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-xs font-medium uppercase tracking-wider text-ink-500">Invoices</p>
              <ul className="mt-2 divide-y divide-white/5 rounded-xl border border-white/5">
                {INVOICES.map((inv) => (
                  <li key={inv.id} className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm">
                    <span className="font-mono text-xs text-ink-300">{inv.id}</span>
                    <span className="hidden text-ink-400 sm:inline">{inv.date}</span>
                    <span className="font-mono tabular-nums text-ink-100">{inv.amount}</span>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-300">Paid</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tab === 'keys' && (
            <div key="keys" className="animate-fade-in">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-ink-50">API keys</h3>
                  <p className="mt-1 text-sm text-ink-400">Keys can read and write your workspace.</p>
                </div>
                <button
                  onClick={() => {
                    setKeys((k) => [{ id: Date.now(), name: `Key ${k.length + 1}`, secret: randomKey(), created: 'Just now', shown: true }, ...k]);
                    flash('Copy your new key now. You will not see it again.');
                  }}
                  className="focus-ring inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand-500 px-3 text-sm font-medium text-white hover:bg-brand-400"
                >
                  <Plus className="h-4 w-4" /> Create key
                </button>
              </div>
              <ul className="mt-5 space-y-2">
                {keys.map((k) => (
                  <li key={k.id} className="rounded-xl border border-white/5 bg-ink-950/40 p-3 animate-fade-in">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-ink-100">{k.name}</p>
                      <span className="text-xs text-ink-500">{k.created}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5">
                      <code className="min-w-0 flex-1 truncate rounded-md bg-ink-950 px-2 py-1.5 font-mono text-xs text-ink-300">
                        {k.shown ? k.secret : k.secret.slice(0, 9) + '•'.repeat(16)}
                      </code>
                      <button aria-label={k.shown ? 'Hide key' : 'Reveal key'} onClick={() => setKeys((list) => list.map((x) => (x.id === k.id ? { ...x, shown: !x.shown } : x)))} className="focus-ring grid h-8 w-8 place-items-center rounded-md text-ink-400 hover:bg-white/5 hover:text-ink-100">
                        {k.shown ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button aria-label="Copy key" onClick={() => copy(k)} className="focus-ring grid h-8 w-8 place-items-center rounded-md text-ink-400 hover:bg-white/5 hover:text-ink-100">
                        {copied === k.id ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                      </button>
                      <button aria-label="Revoke key" onClick={() => setKeys((list) => list.filter((x) => x.id !== k.id))} className="focus-ring grid h-8 w-8 place-items-center rounded-md text-ink-400 hover:bg-rose-500/10 hover:text-rose-300">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
                {!keys.length && <li className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-ink-500">No keys yet.</li>}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className={cn('absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-ink-850/95 px-4 py-2.5 shadow-pop backdrop-blur transition-all duration-300 ease-smooth', dirty && tab === 'profile' ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0')}>
        <span className="text-sm text-ink-300">You have unsaved changes</span>
        <div className="flex gap-2">
          <button onClick={() => setDraft(saved)} className="focus-ring rounded-lg px-3 py-1.5 text-sm text-ink-400 hover:text-ink-100">
            Discard
          </button>
          <button onClick={save} disabled={saving} className="focus-ring rounded-lg bg-brand-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-400 disabled:opacity-70">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      <div role="status" aria-live="polite" className={cn('pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-ink-50 px-3 py-1.5 text-xs font-medium text-ink-950 shadow-pop transition-all duration-300', toast ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0')}>
        {toast}
      </div>
    </div>
  );
}

export function SettingsPageDemo() {
  return <SettingsPage />;
}
