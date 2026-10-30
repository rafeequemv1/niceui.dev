import { useState, type FormEvent } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/cn';
import { AuthCard, BrandMark, Divider, Field, PasswordField, PrimaryButton, SsoButtons, StrengthMeter, passwordChecks } from './authUi';

export type SignUpProps = {
  plan?: string;
  onSubmit?: (v: { name: string; email: string; password: string }) => Promise<void>;
  className?: string;
};

export function SignUp({ plan = 'Pro trial · 14 days', onSubmit, className }: SignUpProps) {
  const [name, setName] = useState('Maya Ocampo');
  const [email, setEmail] = useState('maya@halcyon.app');
  const [password, setPassword] = useState('Halcyon2');
  const [terms, setTerms] = useState(false);
  const [tried, setTried] = useState(false);
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle');

  const strongEnough = passwordChecks(password).filter((c) => c.ok).length >= 3;
  const errors = {
    name: tried && !name.trim() ? 'Tell us your name.' : '',
    email: tried && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Enter a valid email address.' : '',
    password: tried && !strongEnough ? 'Meet at least three of the requirements below.' : '',
    terms: tried && !terms ? 'Please accept the terms to continue.' : '',
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!name.trim() || errors.email || !strongEnough || !terms) return;
    setState('loading');
    await (onSubmit ?? (() => new Promise<void>((r) => setTimeout(r, 1100))))({ name, email, password });
    setState('done');
  };

  return (
    <AuthCard className={className}>
      <form onSubmit={submit} noValidate>
        <div className="flex items-center justify-between gap-3">
          <BrandMark />
          <span className="inline-flex items-center gap-1 truncate rounded-full border border-brand-400/30 bg-brand-500/10 px-2.5 py-1 text-[11px] font-medium text-brand-200">
            <Sparkles className="h-3 w-3 shrink-0" /> <span className="truncate">{plan}</span>
          </span>
        </div>
        <h2 className="mt-6 text-xl font-semibold tracking-tight text-ink-50">Create your account</h2>
        <p className="mt-1 text-sm text-ink-400">No credit card needed. Cancel anytime.</p>
        <div className="mt-6">
          <SsoButtons />
        </div>
        <Divider />
        <div className="space-y-4">
          <Field label="Full name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
          <Field label="Work email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
          <div>
            <PasswordField label="Password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
            <div className="mt-3">
              <StrengthMeter password={password} />
            </div>
          </div>
        </div>
        <label className={cn('mt-5 flex cursor-pointer items-start gap-2 text-sm', errors.terms ? 'text-rose-300' : 'text-ink-300')}>
          <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 rounded accent-sky-400" />
          <span>
            I agree to the <a href="#terms" onClick={(e) => e.preventDefault()} className="text-brand-300 underline-offset-2 hover:underline">Terms</a> and{' '}
            <a href="#privacy" onClick={(e) => e.preventDefault()} className="text-brand-300 underline-offset-2 hover:underline">Privacy Policy</a>.
          </span>
        </label>
        <PrimaryButton type="submit" className="mt-5" loading={state === 'loading'} done={state === 'done'}>
          {state === 'done' ? 'Account created' : state === 'loading' ? 'Creating account…' : (<>Start free trial <ArrowRight className="h-4 w-4" /></>)}
        </PrimaryButton>
        <p className="mt-5 text-center text-sm text-ink-500">
          Already have an account? <a href="#signin" onClick={(e) => e.preventDefault()} className="text-brand-300 hover:text-brand-200">Sign in</a>
        </p>
      </form>
    </AuthCard>
  );
}

export function SignUpDemo() {
  return <SignUp />;
}
