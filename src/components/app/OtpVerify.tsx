import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/cn';
import { AuthCard, PrimaryButton } from './authUi';

export type OtpVerifyProps = {
  length?: number;
  destination?: string;
  /** Return true when the code is valid. */
  onVerify?: (code: string) => Promise<boolean>;
  resendSeconds?: number;
  /** Pre-filled digits. */
  initial?: string;
  className?: string;
};

export function OtpVerify({ length = 6, destination = 'maya@halcyon.app', onVerify, resendSeconds = 30, initial = '', className }: OtpVerifyProps) {
  const [digits, setDigits] = useState<string[]>(() => Array(length).fill('').map((_, k) => initial[k] ?? ''));
  const [state, setState] = useState<'idle' | 'checking' | 'error' | 'done'>('idle');
  const [left, setLeft] = useState(resendSeconds);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (left <= 0) return;
    const id = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [left]);

  const verify = async (code: string) => {
    setState('checking');
    const ok = await (onVerify ?? ((c) => new Promise<boolean>((r) => setTimeout(() => r(c === '424242'), 900))))(code);
    if (ok) setState('done');
    else {
      setState('error');
      setTimeout(() => {
        setDigits(Array(length).fill(''));
        refs.current[0]?.focus();
      }, 450);
    }
  };

  const set = (i: number, v: string) => {
    const next = [...digits];
    next[i] = v;
    setDigits(next);
    if (state === 'error') setState('idle');
    if (v && i < length - 1) refs.current[i + 1]?.focus();
    if (next.every(Boolean)) verify(next.join(''));
  };

  const onKey = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
      const next = [...digits];
      next[i - 1] = '';
      setDigits(next);
    }
    if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < length - 1) refs.current[i + 1]?.focus();
  };

  const onPaste = (e: ClipboardEvent) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!text) return;
    e.preventDefault();
    const next = Array(length).fill('').map((_, k) => text[k] ?? '');
    setDigits(next);
    refs.current[Math.min(text.length, length - 1)]?.focus();
    if (text.length === length) verify(text);
  };

  if (state === 'done')
    return (
      <AuthCard className={cn('text-center', className)}>
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400 animate-scale-in" />
        <h2 className="mt-4 text-xl font-semibold text-ink-50">You’re verified</h2>
        <p className="mt-1 text-sm text-ink-400">Redirecting you to your workspace…</p>
        <button onClick={() => { setDigits(Array(length).fill('')); setState('idle'); }} className="focus-ring mt-6 text-sm text-brand-300 hover:text-brand-200">
          Run the demo again
        </button>
      </AuthCard>
    );

  return (
    <AuthCard className={className}>
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-500/10 text-brand-300 ring-1 ring-brand-400/25">
        <ShieldCheck className="h-5 w-5" />
      </span>
      <h2 className="mt-5 text-xl font-semibold tracking-tight text-ink-50">Check your email</h2>
      <p className="mt-1 text-sm text-ink-400">
        We sent a {length}-digit code to <span className="text-ink-100">{destination}</span>.
      </p>
      <div className={cn('mt-6 flex justify-between gap-2', state === 'error' && 'animate-wiggle')} onPaste={onPaste} role="group" aria-label="One-time code">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => (refs.current[i] = el)}
            value={d}
            inputMode="numeric"
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            maxLength={1}
            aria-label={`Digit ${i + 1}`}
            disabled={state === 'checking'}
            onChange={(e) => set(i, e.target.value.replace(/\D/g, '').slice(-1))}
            onKeyDown={(e) => onKey(i, e)}
            onFocus={(e) => e.target.select()}
            className={cn(
              'h-12 w-full min-w-0 rounded-xl border bg-ink-950/60 text-center font-mono text-lg text-ink-50 outline-none transition-all focus:ring-2',
              state === 'error' ? 'border-rose-500/70 focus:ring-rose-500/25' : d ? 'border-brand-400/50 focus:ring-brand-500/25' : 'border-white/10 focus:border-brand-400/60 focus:ring-brand-500/20',
            )}
          />
        ))}
      </div>
      <p className={cn('mt-3 h-4 text-xs', state === 'error' ? 'text-rose-300' : 'text-ink-500')} aria-live="polite">
        {state === 'error' ? 'That code isn’t right. Try again.' : state === 'checking' ? 'Checking…' : 'Tip: in this demo the code is 424242. Paste works too.'}
      </p>
      <PrimaryButton className="mt-5" loading={state === 'checking'} disabled={!digits.every(Boolean)} onClick={() => verify(digits.join(''))}>
        Verify
      </PrimaryButton>
      <p className="mt-4 text-center text-sm text-ink-500">
        Didn’t get it?{' '}
        {left > 0 ? (
          <span className="font-mono tabular-nums text-ink-400">Resend in 0:{String(left).padStart(2, '0')}</span>
        ) : (
          <button onClick={() => setLeft(resendSeconds)} className="focus-ring text-brand-300 hover:text-brand-200">
            Resend code
          </button>
        )}
      </p>
    </AuthCard>
  );
}

export function OtpVerifyDemo() {
  return <OtpVerify initial="424" />;
}
