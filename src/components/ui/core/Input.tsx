import { useEffect, useId, useRef, useState, type FormEvent, type InputHTMLAttributes, type ReactNode } from 'react';
import { AlertCircle, Eye, EyeOff, Lock, Mail, Search, User } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from './Button';

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: ReactNode;
  /** Element rendered inside the field on the right (e.g. a shortcut). */
  rightSlot?: ReactNode;
};

export function Input({ label, hint, error, leftIcon, rightSlot, className, type = 'text', id, ...rest }: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const [show, setShow] = useState(false);
  const [shake, setShake] = useState(0);
  const fieldRef = useRef<HTMLDivElement>(null);
  const isPassword = type === 'password';

  useEffect(() => {
    if (error) setShake((n) => n + 1);
  }, [error]);

  useEffect(() => {
    if (!shake || !fieldRef.current) return;
    fieldRef.current.animate(
      [0, -6, 6, -4, 4, -2, 0].map((x) => ({ transform: `translateX(${x}px)` })),
      { duration: 420, easing: 'ease-out' },
    );
  }, [shake]);

  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-ink-200">
          {label}
        </label>
      )}
      <div
        ref={fieldRef}
        className={cn(
          'group relative flex h-10 items-center rounded-lg bg-ink-900 ring-1 ring-inset transition-all duration-200',
          error
            ? 'ring-rose-500/60 focus-within:ring-rose-400 focus-within:shadow-[0_0_0_4px_rgba(244,63,94,0.15)]'
            : 'ring-white/10 hover:ring-white/20 focus-within:ring-brand-500 focus-within:shadow-[0_0_0_4px_rgba(56,189,248,0.15)]',
        )}
      >
        {leftIcon && (
          <span
            className={cn(
              'pointer-events-none pl-3 transition-colors [&_svg]:h-4 [&_svg]:w-4',
              error ? 'text-rose-400' : 'text-ink-500 group-focus-within:text-brand-300',
            )}
          >
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          type={isPassword && show ? 'text' : type}
          aria-invalid={!!error || undefined}
          aria-describedby={describedBy}
          className="h-full w-full min-w-0 bg-transparent px-3 text-sm text-ink-50 outline-none placeholder:text-ink-500 disabled:cursor-not-allowed disabled:opacity-50"
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? 'Hide password' : 'Show password'}
            className="focus-ring relative mr-1.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-ink-400 transition hover:bg-white/5 hover:text-ink-100 active:scale-90"
          >
            <Eye className={cn('absolute h-4 w-4 transition-all duration-300 ease-spring', show ? 'rotate-90 scale-50 opacity-0' : 'opacity-100')} />
            <EyeOff className={cn('absolute h-4 w-4 transition-all duration-300 ease-spring', show ? 'opacity-100' : '-rotate-90 scale-50 opacity-0')} />
          </button>
        )}
        {rightSlot && <span className="mr-2 shrink-0">{rightSlot}</span>}
      </div>
      {error ? (
        <p id={`${inputId}-error`} key={error} className="mt-1.5 flex animate-fade-down items-center gap-1.5 text-xs text-rose-300">
          <AlertCircle className="h-3.5 w-3.5" /> {error}
        </p>
      ) : (
        hint && (
          <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-ink-400">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

export function InputDemo() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [done, setDone] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Enter a valid email address';
    if (password.length < 8) next.password = 'Use at least 8 characters';
    setErrors({});
    requestAnimationFrame(() => setErrors(next));
    setDone(Object.keys(next).length === 0);
  };

  return (
    <div className="mx-auto grid w-full max-w-2xl gap-6 md:grid-cols-[1fr_1fr]">
      <form onSubmit={submit} noValidate className="space-y-4 rounded-2xl bg-ink-900 p-5 shadow-card">
        <div>
          <p className="text-sm font-medium text-ink-50">Create account</p>
          <p className="text-xs text-ink-400">Submit empty to see the error shake.</p>
        </div>
        <Input
          label="Email"
          type="email"
          placeholder="you@company.com"
          leftIcon={<Mail />}
          value={email}
          error={errors.email}
          onChange={(e) => {
            setEmail(e.target.value);
            setErrors((s) => ({ ...s, email: undefined }));
          }}
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          leftIcon={<Lock />}
          hint="8+ characters, one number."
          value={password}
          error={errors.password}
          onChange={(e) => {
            setPassword(e.target.value);
            setErrors((s) => ({ ...s, password: undefined }));
          }}
        />
        <Button type="submit" className={cn('w-full', done && '!bg-emerald-600')}>
          {done ? 'Account created' : 'Sign up'}
        </Button>
      </form>
      <div className="flex flex-col justify-center gap-4">
        <Input
          placeholder="Search docs…"
          leftIcon={<Search />}
          aria-label="Search"
          rightSlot={<kbd className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-ink-400 shadow-hairline">⌘K</kbd>}
        />
        <Input label="Username" defaultValue="maya" leftIcon={<User />} hint="lumen.dev/maya" />
        <Input label="Disabled" defaultValue="acme-prod" disabled />
      </div>
    </div>
  );
}
