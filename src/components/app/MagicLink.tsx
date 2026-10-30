import { useEffect, useState, type FormEvent } from 'react';
import { ArrowLeft, Mail, MailOpen, Send } from 'lucide-react';
import { cn } from '@/lib/cn';
import { AuthCard, BrandMark, Field, PrimaryButton } from './authUi';

export type MagicLinkProps = {
  defaultEmail?: string;
  onSend?: (email: string) => Promise<void>;
  resendSeconds?: number;
  className?: string;
};

const MAIL_APPS = [
  { name: 'Gmail', href: 'https://mail.google.com', letter: 'G' },
  { name: 'Outlook', href: 'https://outlook.live.com', letter: 'O' },
];

export function MagicLink({ defaultEmail = 'maya@halcyon.app', onSend, resendSeconds = 20, className }: MagicLinkProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');
  const [left, setLeft] = useState(0);

  useEffect(() => {
    if (left <= 0) return;
    const id = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [left]);

  const send = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Enter a valid email address.');
    setError('');
    setState('sending');
    await (onSend ?? (() => new Promise<void>((r) => setTimeout(r, 900))))(email);
    setState('sent');
    setLeft(resendSeconds);
  };

  return (
    <AuthCard className={cn('overflow-hidden', className)}>
      {state !== 'sent' ? (
        <form onSubmit={send} noValidate className="animate-fade-in">
          <BrandMark />
          <h2 className="mt-6 text-xl font-semibold tracking-tight text-ink-50">Sign in without a password</h2>
          <p className="mt-1 text-sm text-ink-400">We’ll email you a link that signs you in instantly.</p>
          <Field className="mt-6" label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={error} />
          <PrimaryButton type="submit" className="mt-5" loading={state === 'sending'}>
            {state === 'sending' ? 'Sending link…' : (<><Send className="h-4 w-4" /> Email me a link</>)}
          </PrimaryButton>
          <p className="mt-4 text-center text-xs text-ink-500">Links expire after 15 minutes and work once.</p>
        </form>
      ) : (
        <div className="text-center animate-fade-up">
          <div className="relative mx-auto h-20 w-20">
            <span className="absolute inset-0 rounded-full bg-brand-500/20 animate-pulse-ring" />
            <span className="relative grid h-20 w-20 place-items-center rounded-full bg-brand-500/10 ring-1 ring-brand-400/30">
              <MailOpen className="h-8 w-8 text-brand-300 animate-float" />
            </span>
          </div>
          <h2 className="mt-5 text-xl font-semibold tracking-tight text-ink-50">Check your inbox</h2>
          <p className="mt-1 text-sm text-ink-400">
            We sent a sign-in link to <span className="break-all text-ink-100">{email}</span>.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-2">
            {MAIL_APPS.map((m) => (
              <a key={m.name} href={m.href} target="_blank" rel="noopener" className="focus-ring flex h-10 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] text-sm text-ink-200 transition-colors hover:bg-white/[0.06]">
                <span className="grid h-4 w-4 place-items-center rounded-[4px] bg-ink-700 text-[10px] font-bold text-ink-50">{m.letter}</span>
                Open {m.name}
              </a>
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between text-sm">
            <button onClick={() => setState('idle')} className="focus-ring inline-flex items-center gap-1 text-ink-400 hover:text-ink-100">
              <ArrowLeft className="h-3.5 w-3.5" /> Use another email
            </button>
            {left > 0 ? (
              <span className="font-mono text-xs tabular-nums text-ink-500">Resend in {left}s</span>
            ) : (
              <button onClick={() => send()} className="focus-ring inline-flex items-center gap-1 text-brand-300 hover:text-brand-200">
                <Mail className="h-3.5 w-3.5" /> Resend
              </button>
            )}
          </div>
        </div>
      )}
    </AuthCard>
  );
}

export function MagicLinkDemo() {
  return <MagicLink />;
}
