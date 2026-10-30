import { useRef, useState, type FormEvent } from 'react';
import { ArrowRight, Quote } from 'lucide-react';
import { cn } from '@/lib/cn';
import { BrandMark, Divider, Field, PasswordField, PrimaryButton, SsoButtons } from './authUi';

export type SignInProps = {
  /** Resolves on success, rejects (or returns an error string) on failure. */
  onSubmit?: (v: { email: string; password: string; remember: boolean }) => Promise<string | void>;
  /** Show the brand panel beside the form on wide screens. */
  split?: boolean;
  className?: string;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SignIn({ onSubmit, split = true, className }: SignInProps) {
  const [email, setEmail] = useState('maya@halcyon.app');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle');
  const [formError, setFormError] = useState('');

  const emailErr = touched.email && !EMAIL.test(email) ? 'Enter a valid email address.' : '';
  const pwErr = touched.password && password.length < 6 ? 'Password must be at least 6 characters.' : '';

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    setFormError('');
    if (!EMAIL.test(email) || password.length < 6) return;
    setState('loading');
    try {
      const res = await (onSubmit ?? (() => new Promise<void>((r) => setTimeout(r, 1100))))({ email, password, remember });
      if (typeof res === 'string') {
        setFormError(res);
        setState('idle');
      } else setState('done');
    } catch {
      setFormError('Something went wrong. Try again.');
      setState('idle');
    }
  };

  const form = (
    <form onSubmit={submit} noValidate className="w-full">
      <BrandMark />
      <h2 className="mt-6 text-xl font-semibold tracking-tight text-ink-50">Welcome back</h2>
      <p className="mt-1 text-sm text-ink-400">Sign in to continue to your workspace.</p>
      <div className="mt-6">
        <SsoButtons />
      </div>
      <Divider label="or with email" />
      <div className="space-y-4">
        <Field label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => setTouched((t) => ({ ...t, email: true }))} error={emailErr} />
        <PasswordField
          label="Password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, password: true }))}
          error={pwErr}
          hint={<a href="#reset" onClick={(e) => e.preventDefault()} className="text-xs text-brand-300 hover:text-brand-200">Forgot?</a>}
        />
      </div>
      <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-ink-300">
        <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 rounded border-white/20 bg-ink-950 accent-sky-400" />
        Keep me signed in for 30 days
      </label>
      {formError && <p role="alert" className="mt-4 rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-200 animate-fade-in">{formError}</p>}
      <PrimaryButton type="submit" className="mt-5" loading={state === 'loading'} done={state === 'done'}>
        {state === 'done' ? 'Signed in' : state === 'loading' ? 'Signing in…' : (<>Sign in <ArrowRight className="h-4 w-4" /></>)}
      </PrimaryButton>
      <p className="mt-5 text-center text-sm text-ink-500">
        New here? <a href="#signup" onClick={(e) => e.preventDefault()} className="text-brand-300 hover:text-brand-200">Create an account</a>
      </p>
    </form>
  );

  if (!split) return <div className={cn('w-full max-w-[400px] rounded-2xl bg-ink-900 p-6 shadow-card sm:p-7', className)}>{form}</div>;

  return (
    <div className={cn('grid w-full max-w-[860px] overflow-hidden rounded-2xl bg-ink-900 shadow-card md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]', className)}>
      <div className="p-6 sm:p-8">{form}</div>
      <BrandPanel />
    </div>
  );
}

function BrandPanel() {
  return (
    <div className="relative hidden overflow-hidden border-l border-white/5 bg-ink-950 p-8 md:flex md:flex-col md:justify-end">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-60" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand-500/25 blur-3xl animate-blob" />
      <div className="pointer-events-none absolute -bottom-20 left-0 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl animate-blob [animation-delay:-4s]" />
      <div className="relative">
        <Quote className="h-6 w-6 text-brand-300" />
        <p className="mt-4 font-serif text-2xl italic leading-snug text-ink-50">“We moved our whole team over in an afternoon. Nobody has asked for a password reset since.”</p>
        <div className="mt-6 flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-500/20 text-xs font-semibold text-brand-200">LB</span>
          <div>
            <p className="text-sm font-medium text-ink-100">Lena Brooks</p>
            <p className="text-xs text-ink-500">Head of IT, Northbeam</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SignInDemo() {
  const tried = useRef(0);
  return (
    <SignIn
      onSubmit={() =>
        new Promise((r) =>
          setTimeout(() => {
            tried.current += 1;
            r(tried.current === 1 ? 'That password doesn’t match. Try again (any password works now).' : undefined);
          }, 1000),
        )
      }
    />
  );
}

