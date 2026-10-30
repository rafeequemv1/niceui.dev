import { useState, type FormEvent } from 'react';
import { Check, CheckCircle2, KeyRound, MailCheck } from 'lucide-react';
import { cn } from '@/lib/cn';
import { AuthCard, Field, PasswordField, PrimaryButton, StrengthMeter, passwordChecks } from './authUi';

type Step = 0 | 1 | 2 | 3;
const STEPS = ['Request', 'Check email', 'New password'];

export type PasswordResetProps = {
  defaultEmail?: string;
  /** Start on a later step (0 request, 1 sent, 2 new password, 3 done). */
  initialStep?: Step;
  className?: string;
};

export function PasswordReset({ defaultEmail = 'maya@halcyon.app', initialStep = 0, className }: PasswordResetProps) {
  const [step, setStep] = useState<Step>(initialStep);
  const [email, setEmail] = useState(defaultEmail);
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [tried, setTried] = useState(false);

  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const strong = passwordChecks(pw).filter((c) => c.ok).length >= 3;
  const mismatch = tried && confirm !== pw ? 'Passwords don’t match.' : '';

  const request = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await wait(900);
    setLoading(false);
    setStep(1);
  };
  const save = async (e: FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!strong || pw !== confirm) return;
    setLoading(true);
    await wait(900);
    setLoading(false);
    setStep(3);
  };

  return (
    <AuthCard className={className}>
      <ol className="mb-6 flex items-center gap-2" aria-label="Progress">
        {STEPS.map((s, i) => {
          const done = step > i;
          const on = step === i;
          return (
            <li key={s} className="flex min-w-0 flex-1 items-center gap-2">
              <span className={cn('grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold transition-all duration-300', done ? 'bg-emerald-400 text-ink-950' : on ? 'bg-brand-400 text-ink-950 ring-4 ring-brand-500/20' : 'bg-white/5 text-ink-500')}>
                {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span className={cn('hidden truncate text-[11px] sm:block', on ? 'text-ink-100' : 'text-ink-500')} aria-current={on ? 'step' : undefined}>
                {s}
              </span>
              {i < STEPS.length - 1 && <span className={cn('h-px flex-1 transition-colors duration-500', done ? 'bg-emerald-400/60' : 'bg-white/10')} />}
            </li>
          );
        })}
      </ol>

      <div key={step} className="animate-fade-up">
        {step === 0 && (
          <form onSubmit={request} noValidate>
            <Icon><KeyRound className="h-5 w-5" /></Icon>
            <h2 className="mt-5 text-xl font-semibold tracking-tight text-ink-50">Forgot your password?</h2>
            <p className="mt-1 text-sm text-ink-400">Enter your email and we’ll send you a reset link.</p>
            <Field className="mt-6" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <PrimaryButton type="submit" className="mt-5" loading={loading}>Send reset link</PrimaryButton>
          </form>
        )}
        {step === 1 && (
          <div>
            <Icon><MailCheck className="h-5 w-5" /></Icon>
            <h2 className="mt-5 text-xl font-semibold tracking-tight text-ink-50">Reset link sent</h2>
            <p className="mt-1 text-sm text-ink-400">
              If an account exists for <span className="break-all text-ink-100">{email}</span>, you’ll get an email in a minute.
            </p>
            <div className="mt-5 rounded-xl border border-white/10 bg-ink-950/50 p-3 text-xs text-ink-400">
              <p className="font-medium text-ink-200">Reset your Halcyon password</p>
              <p className="mt-1">Click the button below to choose a new password. This link expires in 1 hour.</p>
            </div>
            <PrimaryButton className="mt-5" onClick={() => setStep(2)}>Open the link (demo)</PrimaryButton>
            <button onClick={() => setStep(0)} className="focus-ring mt-3 w-full text-center text-sm text-ink-400 hover:text-ink-100">Use a different email</button>
          </div>
        )}
        {step === 2 && (
          <form onSubmit={save} noValidate>
            <h2 className="text-xl font-semibold tracking-tight text-ink-50">Choose a new password</h2>
            <p className="mt-1 text-sm text-ink-400">Use something you haven’t used before.</p>
            <div className="mt-6 space-y-4">
              <PasswordField label="New password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} error={tried && !strong ? 'Meet at least three requirements.' : ''} />
              <StrengthMeter password={pw} />
              <PasswordField label="Confirm password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={mismatch} />
            </div>
            <PrimaryButton type="submit" className="mt-5" loading={loading}>Update password</PrimaryButton>
          </form>
        )}
        {step === 3 && (
          <div className="py-4 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400 animate-scale-in" />
            <h2 className="mt-4 text-xl font-semibold text-ink-50">Password updated</h2>
            <p className="mt-1 text-sm text-ink-400">You’ve been signed out of other devices.</p>
            <PrimaryButton className="mt-6" onClick={() => { setStep(0); setPw(''); setConfirm(''); setTried(false); }}>Back to sign in</PrimaryButton>
          </div>
        )}
      </div>
    </AuthCard>
  );
}

function Icon({ children }: { children: React.ReactNode }) {
  return <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-500/10 text-brand-300 ring-1 ring-brand-400/25">{children}</span>;
}

export function PasswordResetDemo() {
  return <PasswordReset />;
}
