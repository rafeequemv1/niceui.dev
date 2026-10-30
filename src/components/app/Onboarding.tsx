import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Code2, Github, Megaphone, Palette, PenTool, Slack, Trello, X } from 'lucide-react';
import { cn } from '@/lib/cn';

const STEPS = ['Workspace', 'Your role', 'Invite', 'Integrations'] as const;
const ROLES = [
  { id: 'eng', label: 'Engineering', icon: Code2 },
  { id: 'design', label: 'Design', icon: Palette },
  { id: 'product', label: 'Product', icon: PenTool },
  { id: 'marketing', label: 'Marketing', icon: Megaphone },
];
const APPS = [
  { id: 'github', label: 'GitHub', desc: 'Link pull requests to tasks', icon: Github },
  { id: 'slack', label: 'Slack', desc: 'Get updates in channels', icon: Slack },
  { id: 'boards', label: 'Boards', desc: 'Import an existing board', icon: Trello },
];

export type OnboardingData = { workspace: string; url: string; role: string; invites: string[]; apps: string[] };

export function Onboarding({ onFinish, className }: { onFinish?: (d: OnboardingData) => void; className?: string }) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [data, setData] = useState<OnboardingData>({ workspace: 'Northbeam', url: 'northbeam', role: 'product', invites: ['jonas@northbeam.dev'], apps: ['github'] });
  const [email, setEmail] = useState('');

  const canNext = step === 0 ? data.workspace.trim().length > 1 : step === 1 ? !!data.role : true;
  const next = () => {
    if (!canNext) return;
    if (step < STEPS.length - 1) setStep(step + 1);
    else {
      setDone(true);
      onFinish?.(data);
    }
  };

  const addInvite = () => {
    const e = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(e) || data.invites.includes(e)) return;
    setData({ ...data, invites: [...data.invites, e] });
    setEmail('');
  };

  if (done)
    return (
      <div className={cn('w-full max-w-md rounded-2xl bg-ink-900 p-8 text-center shadow-card animate-scale-in', className)}>
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-500/10 ring-8 ring-emerald-500/5">
          <Check className="h-7 w-7 text-emerald-400" />
        </span>
        <h3 className="mt-5 text-lg font-semibold text-ink-50">{data.workspace} is ready</h3>
        <p className="mt-1.5 text-sm text-ink-400">
          {data.invites.length} invite{data.invites.length === 1 ? '' : 's'} sent · {data.apps.length} integration{data.apps.length === 1 ? '' : 's'} connected
        </p>
        <button
          onClick={() => {
            setDone(false);
            setStep(0);
          }}
          className="focus-ring mt-6 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-400"
        >
          Open workspace
        </button>
      </div>
    );

  return (
    <div className={cn('w-full max-w-md overflow-hidden rounded-2xl bg-ink-900 shadow-card', className)}>
      <div className="px-6 pt-6">
        <div className="flex items-center justify-between text-xs text-ink-500">
          <span>
            Step {step + 1} of {STEPS.length}
          </span>
          {step > 1 && (
            <button onClick={next} className="focus-ring rounded px-1 text-ink-400 hover:text-ink-100">
              Skip
            </button>
          )}
        </div>
        <div className="mt-3 grid grid-cols-4 gap-1.5" aria-hidden>
          {STEPS.map((s, i) => (
            <span key={s} className="h-1 overflow-hidden rounded-full bg-white/5">
              <span className={cn('block h-full rounded-full bg-brand-400 transition-all duration-500 ease-smooth', i <= step ? 'w-full' : 'w-0')} />
            </span>
          ))}
        </div>
        <h3 className="mt-5 text-lg font-semibold text-ink-50">{['Name your workspace', 'What do you do?', 'Invite your team', 'Connect your tools'][step]}</h3>
      </div>

      <div key={step} className="min-h-[230px] px-6 py-5 animate-fade-up">
        {step === 0 && (
          <div className="space-y-4">
            <label className="block">
              <span className="text-xs font-medium text-ink-400">Workspace name</span>
              <input
                autoFocus
                value={data.workspace}
                onChange={(e) => setData({ ...data, workspace: e.target.value, url: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') })}
                className="focus-ring mt-1.5 h-10 w-full rounded-lg border border-white/10 bg-ink-950/60 px-3 text-sm text-ink-50 outline-none focus:border-brand-400/60"
              />
            </label>
            <div className="flex min-w-0 items-center rounded-lg border border-white/10 bg-ink-950/60 text-sm">
              <span className="shrink-0 border-r border-white/10 px-3 py-2.5 text-ink-500">app.flow/</span>
              <span className="truncate px-3 text-ink-200">{data.url || 'your-team'}</span>
            </div>
          </div>
        )}
        {step === 1 && (
          <div role="radiogroup" aria-label="Role" className="grid grid-cols-2 gap-2">
            {ROLES.map((r) => (
              <button
                key={r.id}
                role="radio"
                aria-checked={data.role === r.id}
                onClick={() => setData({ ...data, role: r.id })}
                className={cn(
                  'focus-ring flex flex-col items-start gap-3 rounded-xl border p-3.5 text-left transition-all',
                  data.role === r.id ? 'border-brand-400/50 bg-brand-500/[0.08]' : 'border-white/5 hover:border-white/15',
                )}
              >
                <r.icon className={cn('h-5 w-5', data.role === r.id ? 'text-brand-300' : 'text-ink-400')} />
                <span className="text-sm text-ink-100">{r.label}</span>
              </button>
            ))}
          </div>
        )}
        {step === 2 && (
          <div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addInvite();
              }}
              className="flex gap-2"
            >
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" aria-label="Email" className="focus-ring h-10 min-w-0 flex-1 rounded-lg border border-white/10 bg-ink-950/60 px-3 text-sm text-ink-50 outline-none placeholder:text-ink-500 focus:border-brand-400/60" />
              <button className="focus-ring h-10 shrink-0 rounded-lg border border-white/10 px-3 text-sm text-ink-100 hover:bg-white/5">Add</button>
            </form>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {data.invites.map((e) => (
                <li key={e} className="flex items-center gap-1 rounded-full bg-white/5 py-1 pl-2.5 pr-1 text-xs text-ink-200 animate-scale-in">
                  {e}
                  <button aria-label={`Remove ${e}`} onClick={() => setData({ ...data, invites: data.invites.filter((x) => x !== e) })} className="grid h-5 w-5 place-items-center rounded-full text-ink-500 hover:bg-white/10 hover:text-ink-100">
                    <X className="h-3 w-3" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {step === 3 && (
          <ul className="space-y-2">
            {APPS.map((a) => {
              const on = data.apps.includes(a.id);
              return (
                <li key={a.id} className="flex items-center gap-3 rounded-xl border border-white/5 p-3">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/5">
                    <a.icon className="h-4 w-4 text-ink-200" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-ink-100">{a.label}</p>
                    <p className="truncate text-xs text-ink-500">{a.desc}</p>
                  </div>
                  <button
                    role="switch"
                    aria-checked={on}
                    aria-label={`Connect ${a.label}`}
                    onClick={() => setData({ ...data, apps: on ? data.apps.filter((x) => x !== a.id) : [...data.apps, a.id] })}
                    className={cn('focus-ring relative h-6 w-10 shrink-0 rounded-full transition-colors', on ? 'bg-brand-500' : 'bg-white/10')}
                  >
                    <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-300 ease-spring', on ? 'left-[18px]' : 'left-0.5')} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-white/5 px-6 py-4">
        <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="focus-ring inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-ink-400 hover:text-ink-100 disabled:invisible">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button onClick={next} disabled={!canNext} className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-400 disabled:opacity-40">
          {step === STEPS.length - 1 ? 'Finish' : 'Continue'} <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function OnboardingDemo() {
  return <Onboarding />;
}
