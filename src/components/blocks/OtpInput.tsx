import { useRef, useState } from 'react';
import { CheckCircle2, Loader2, Lock, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/cn';

export type OtpStatus = 'idle' | 'verifying' | 'success' | 'error';

export type OtpInputProps = {
  length?: number;
  onComplete: (code: string) => Promise<boolean>;
  status: OtpStatus;
  disabled?: boolean;
};

export function OtpInput({ length = 6, onComplete, status, disabled }: OtpInputProps) {
  const [digits, setDigits] = useState<string[]>(() => Array(length).fill(''));
  const [focus, setFocus] = useState(0);
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const [shakeKey, setShakeKey] = useState(0);
  const locked = disabled || status === 'verifying' || status === 'success';

  const go = (i: number) => refs.current[Math.max(0, Math.min(length - 1, i))]?.focus();

  const commit = async (next: string[]) => {
    setDigits(next);
    if (next.every(Boolean)) {
      refs.current.forEach((r) => r?.blur());
      const ok = await onComplete(next.join(''));
      if (!ok) {
        setShakeKey((k) => k + 1);
        window.setTimeout(() => { setDigits(Array(length).fill('')); go(0); }, 450);
      }
    }
  };

  const fill = (start: number, text: string) => {
    const chars = text.replace(/\D/g, '').slice(0, length - start).split('');
    if (!chars.length) return;
    const next = [...digits];
    chars.forEach((c, k) => (next[start + k] = c));
    go(start + chars.length);
    void commit(next);
  };

  return (
    <div key={shakeKey} className={cn('flex gap-2', shakeKey > 0 && status === 'error' && 'animate-wiggle')}>
      {digits.map((d, i) => {
        const tone =
          status === 'success' ? 'bg-emerald-500/10 text-emerald-300 shadow-[0_0_0_1px_rgba(52,211,153,0.5)]'
          : status === 'error' ? 'bg-rose-500/10 text-rose-300 shadow-[0_0_0_1px_rgba(251,113,133,0.5)]'
          : focus === i && !locked ? 'bg-ink-850 text-ink-50 shadow-glow' : 'bg-ink-850 text-ink-50 shadow-hairline';
        return (
          <div key={i} className="relative">
            <input
              ref={(el) => (refs.current[i] = el)}
              aria-label={`Digit ${i + 1}`}
              inputMode="numeric"
              autoComplete={i === 0 ? 'one-time-code' : 'off'}
              maxLength={1}
              value={d}
              disabled={locked}
              onFocus={(e) => { setFocus(i); e.currentTarget.select(); }}
              onBlur={() => setFocus(-1)}
              onChange={(e) => fill(i, e.target.value.slice(-1))}
              onPaste={(e) => { e.preventDefault(); fill(i, e.clipboardData.getData('text')); }}
              onKeyDown={(e) => {
                if (e.key === 'Backspace') {
                  e.preventDefault();
                  const next = [...digits];
                  if (next[i]) next[i] = '';
                  else if (i > 0) { next[i - 1] = ''; go(i - 1); }
                  setDigits(next);
                }
                if (e.key === 'ArrowLeft') go(i - 1);
                if (e.key === 'ArrowRight') go(i + 1);
              }}
              className={cn(
                'h-14 w-11 rounded-xl text-center font-mono text-xl font-medium caret-transparent outline-none transition-all duration-300 ease-spring disabled:cursor-default sm:w-12',
                tone,
                d && status === 'idle' && 'scale-[1.04]',
              )}
              style={{ transitionDelay: status === 'success' ? `${i * 50}ms` : '0ms' }}
            />
            {focus === i && !d && !locked && <span className="pointer-events-none absolute left-1/2 top-1/2 h-6 w-px -translate-x-1/2 -translate-y-1/2 animate-blink bg-brand-400" />}
            {i === length / 2 - 1 && <span className="absolute -right-[7px] top-1/2 h-px w-1.5 bg-ink-600" />}
          </div>
        );
      })}
    </div>
  );
}

export function OtpInputDemo() {
  const [status, setStatus] = useState<OtpStatus>('idle');
  const [round, setRound] = useState(0);
  const verify = (code: string) =>
    new Promise<boolean>((resolve) => {
      setStatus('verifying');
      window.setTimeout(() => {
        const ok = code === '424242';
        setStatus(ok ? 'success' : 'error');
        if (!ok) window.setTimeout(() => setStatus('idle'), 900);
        resolve(ok);
      }, 1100);
    });

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center rounded-2xl bg-ink-900 px-6 py-8 text-center shadow-card">
      <span className={cn('flex h-11 w-11 items-center justify-center rounded-2xl transition-colors duration-500', status === 'success' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-ink-800 text-ink-200')}>
        {status === 'success' ? <CheckCircle2 className="h-5 w-5 animate-scale-in" /> : <Lock className="h-5 w-5" />}
      </span>
      <p className="mt-4 text-base font-medium text-ink-50">{status === 'success' ? 'Verified' : 'Enter verification code'}</p>
      <p className="mt-1 text-sm text-ink-400">We sent a 6-digit code to m•••@lumen.dev</p>
      <div className="mt-6">
        <OtpInput key={round} status={status} onComplete={verify} />
      </div>
      <div className="mt-5 flex h-5 items-center justify-center text-xs">
        {status === 'verifying' && <span className="flex animate-fade-in items-center gap-2 text-ink-300"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Verifying…</span>}
        {status === 'error' && <span className="animate-fade-in text-rose-400">Invalid code — try 424242</span>}
        {status === 'success' && (
          <button onClick={() => { setStatus('idle'); setRound((r) => r + 1); }} className="flex animate-fade-in items-center gap-1.5 text-ink-400 hover:text-ink-100">
            <RefreshCw className="h-3 w-3" /> Start over
          </button>
        )}
        {status === 'idle' && <span className="text-ink-500">Hint: the code is 424242</span>}
      </div>
    </div>
  );
}
