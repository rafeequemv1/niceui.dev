import { useState, type FormEvent } from 'react';
import { ArrowRight, Check, Eye, EyeOff, Github, Loader2, Lock, Mail, Twitter } from 'lucide-react';
import { cn } from '@/lib/cn';

export function passwordScore(pw: string) {
  const checks = [pw.length >= 8, /[A-Z]/.test(pw) && /[a-z]/.test(pw), /\d/.test(pw), /[^A-Za-z0-9]/.test(pw)];
  return { checks, score: checks.filter(Boolean).length };
}

const LEVELS = [
  { label: 'Too weak', color: 'bg-rose-500', text: 'text-rose-400' },
  { label: 'Weak', color: 'bg-rose-500', text: 'text-rose-400' },
  { label: 'Fair', color: 'bg-amber-400', text: 'text-amber-400' },
  { label: 'Good', color: 'bg-sky-400', text: 'text-sky-400' },
  { label: 'Strong', color: 'bg-emerald-400', text: 'text-emerald-400' },
];
const RULES = ['8+ characters', 'Upper & lowercase', 'A number', 'A symbol'];

export type SignUpFormProps = { onSubmit?: (data: { email: string; password: string }) => Promise<void> };

export function SignUpForm({ onSubmit = () => new Promise((r) => setTimeout(r, 1300)) }: SignUpFormProps) {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [touched, setTouched] = useState({ email: false, pw: false });
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle');
  const [shake, setShake] = useState(0);
  const { checks, score } = passwordScore(pw);
  const emailErr = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? (email ? 'Enter a valid email address' : 'Email is required') : null;
  const pwErr = score < 3 ? 'Use a stronger password' : null;
  const level = LEVELS[pw ? score : 0];

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, pw: true });
    if (emailErr || pwErr) return setShake((s) => s + 1);
    setState('loading');
    await onSubmit({ email, password: pw });
    setState('done');
  };

  if (state === 'done') {
    return (
      <div className="flex w-full max-w-sm animate-scale-in flex-col items-center rounded-2xl bg-ink-900 px-6 py-10 text-center shadow-card">
        <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
          <span className="absolute inset-0 animate-pulse-ring rounded-full bg-emerald-500/30" />
          <Check className="relative h-6 w-6 animate-scale-in" />
        </span>
        <p className="mt-5 text-lg font-medium text-ink-50">Check your inbox</p>
        <p className="mt-1 text-sm text-ink-400">We sent a confirmation link to <span className="text-ink-200">{email}</span></p>
        <button onClick={() => { setState('idle'); setPw(''); setTouched({ email: false, pw: false }); }} className="mt-6 text-xs text-ink-400 transition-colors hover:text-ink-100">Use a different email</button>
      </div>
    );
  }

  const field = 'flex h-11 items-center gap-2.5 rounded-xl bg-ink-850 px-3 transition-shadow duration-200 focus-within:shadow-glow';
  return (
    <form onSubmit={submit} noValidate className="w-full max-w-sm rounded-2xl bg-ink-900 p-6 shadow-card">
      <p className="text-lg font-medium text-ink-50">Create your account</p>
      <p className="mt-1 text-sm text-ink-400">Start building with NiceUI in seconds.</p>
      <div className="mt-5 grid grid-cols-2 gap-2">
        {[{ icon: Github, label: 'GitHub' }, { icon: Twitter, label: 'Twitter' }].map(({ icon: Icon, label }) => (
          <button key={label} type="button" className="focus-ring flex h-10 items-center justify-center gap-2 rounded-xl bg-ink-850 text-sm font-medium text-ink-100 shadow-hairline transition-all hover:bg-ink-800 active:scale-[0.97]">
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>
      <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-wider text-ink-500">
        <span className="h-px flex-1 bg-white/5" /> or <span className="h-px flex-1 bg-white/5" />
      </div>
      <div key={shake} className={cn('space-y-3', shake > 0 && 'animate-wiggle')}>
        <div>
          <label className={cn(field, touched.email && emailErr ? 'shadow-[0_0_0_1px_rgba(251,113,133,0.5)]' : 'shadow-hairline')}>
            <Mail className="h-4 w-4 text-ink-500" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => setTouched((t) => ({ ...t, email: true }))} placeholder="you@company.com" className="h-full flex-1 bg-transparent text-sm text-ink-50 outline-none placeholder:text-ink-500" />
          </label>
          <p className={cn('overflow-hidden text-xs text-rose-400 transition-all duration-300', touched.email && emailErr ? 'mt-1.5 max-h-5 opacity-100' : 'max-h-0 opacity-0')}>{emailErr}</p>
        </div>
        <div>
          <label className={cn(field, touched.pw && pwErr ? 'shadow-[0_0_0_1px_rgba(251,113,133,0.5)]' : 'shadow-hairline')}>
            <Lock className="h-4 w-4 text-ink-500" />
            <input type={show ? 'text' : 'password'} value={pw} onChange={(e) => setPw(e.target.value)} onBlur={() => setTouched((t) => ({ ...t, pw: true }))} placeholder="Password" className="h-full flex-1 bg-transparent text-sm text-ink-50 outline-none placeholder:text-ink-500" />
            <button type="button" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow((s) => !s)} className="text-ink-500 transition-colors hover:text-ink-200">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </label>
          <div className={cn('grid transition-all duration-500 ease-smooth', pw ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
            <div className="overflow-hidden">
              <div className="mt-2.5 flex items-center gap-2">
                <div className="flex flex-1 gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <span key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-ink-800">
                      <span className={cn('block h-full origin-left rounded-full transition-all duration-500 ease-spring', level.color, i < score ? 'scale-x-100' : 'scale-x-0')} style={{ transitionDelay: `${i * 40}ms` }} />
                    </span>
                  ))}
                </div>
                <span className={cn('w-14 text-right text-[11px] font-medium transition-colors', level.text)}>{level.label}</span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-1">
                {RULES.map((r, i) => (
                  <span key={r} className={cn('flex items-center gap-1.5 text-[11px] transition-colors duration-300', checks[i] ? 'text-ink-200' : 'text-ink-500')}>
                    <span className={cn('flex h-3.5 w-3.5 items-center justify-center rounded-full transition-all duration-300', checks[i] ? 'bg-emerald-500 text-ink-950' : 'bg-ink-800')}>
                      <Check className={cn('h-2.5 w-2.5 transition-transform duration-300 ease-spring', checks[i] ? 'scale-100' : 'scale-0')} />
                    </span>
                    {r}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <button type="submit" disabled={state === 'loading'} className="focus-ring group mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-ink-50 text-sm font-medium text-ink-950 transition-all hover:bg-white active:scale-[0.98] disabled:opacity-70">
        {state === 'loading' ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating account…</> : <>Create account <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></>}
      </button>
      <p className="mt-4 text-center text-xs text-ink-500">By continuing you agree to our Terms and Privacy Policy.</p>
    </form>
  );
}

export function SignUpFormDemo() {
  return (
    <div className="flex justify-center">
      <SignUpForm />
    </div>
  );
}
