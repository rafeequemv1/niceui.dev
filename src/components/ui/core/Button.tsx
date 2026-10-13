import { useState, type ButtonHTMLAttributes, type PointerEvent, type ReactNode } from 'react';
import { ArrowRight, Check, Download, Loader2, Plus, Rocket, Trash2 } from 'lucide-react';
import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-600 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_1px_2px_rgba(0,0,0,0.4),0_4px_14px_-4px_rgba(27,119,245,0.6)] hover:bg-brand-500',
  secondary: 'bg-ink-800 text-ink-50 shadow-hairline hover:bg-ink-700',
  ghost: 'text-ink-300 hover:bg-white/5 hover:text-ink-50',
  outline: 'text-ink-100 ring-1 ring-inset ring-white/10 hover:bg-white/[0.03] hover:ring-white/20',
  danger: 'bg-rose-500/10 text-rose-300 ring-1 ring-inset ring-rose-500/25 hover:bg-rose-500/15 hover:text-rose-200',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 gap-1.5 rounded-lg px-3 text-xs [&_svg]:h-3.5 [&_svg]:w-3.5',
  md: 'h-9 gap-2 rounded-lg px-4 text-sm [&_svg]:h-4 [&_svg]:w-4',
  lg: 'h-11 gap-2 rounded-xl px-5 text-sm [&_svg]:h-4 [&_svg]:w-4',
};

type Ripple = { id: number; x: number; y: number; size: number };

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  className,
  children,
  disabled,
  onPointerDown,
  type = 'button',
  ...rest
}: ButtonProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handlePointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    onPointerDown?.(e);
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2.2;
    const id = Date.now() + Math.random();
    setRipples((r) => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top, size }]);
    window.setTimeout(() => setRipples((r) => r.filter((x) => x.id !== id)), 650);
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      onPointerDown={handlePointerDown}
      className={cn(
        'focus-ring relative inline-flex select-none items-center justify-center overflow-hidden whitespace-nowrap font-medium transition-all duration-200 ease-smooth active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    >
      {ripples.map((r) => (
        <span
          key={r.id}
          aria-hidden
          ref={(el) => {
            if (el && !el.dataset.played) {
              el.dataset.played = '1';
              el.animate(
                [
                  { transform: 'translate(-50%,-50%) scale(0)', opacity: 0.35 },
                  { transform: 'translate(-50%,-50%) scale(1)', opacity: 0 },
                ],
                { duration: 600, easing: 'cubic-bezier(0.16,1,0.3,1)', fill: 'forwards' },
              );
            }
          }}
          className={cn('pointer-events-none absolute rounded-full', variant === 'primary' ? 'bg-white/40' : 'bg-white/20')}
          style={{ left: r.x, top: r.y, width: r.size, height: r.size, transform: 'translate(-50%,-50%) scale(0)' }}
        />
      ))}
      {loading ? <Loader2 className="animate-spin" /> : leftIcon}
      {children && <span className="relative">{children}</span>}
      {rightIcon && !loading && <span className="relative inline-flex">{rightIcon}</span>}
    </button>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <span className="w-20 shrink-0 text-xs font-medium uppercase tracking-wider text-ink-500">{label}</span>
      <div className="flex flex-wrap items-center gap-2.5">{children}</div>
    </div>
  );
}

export function ButtonDemo() {
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle');

  const deploy = () => {
    if (state !== 'idle') return;
    setState('loading');
    window.setTimeout(() => setState('done'), 1600);
    window.setTimeout(() => setState('idle'), 3400);
  };

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <Row label="Variants">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
      </Row>
      <Row label="Sizes">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </Row>
      <Row label="Icons">
        <Button variant="secondary" leftIcon={<Plus />}>New project</Button>
        <Button variant="outline" leftIcon={<Download />}>Export</Button>
        <Button variant="ghost" rightIcon={<ArrowRight />}>Continue</Button>
        <Button variant="danger" leftIcon={<Trash2 />} aria-label="Delete" />
      </Row>
      <Row label="Loading">
        <Button
          onClick={deploy}
          loading={state === 'loading'}
          leftIcon={state === 'done' ? <Check className="animate-scale-in" /> : <Rocket />}
          className={cn('min-w-[148px]', state === 'done' && '!bg-emerald-600')}
        >
          {state === 'loading' ? 'Deploying…' : state === 'done' ? 'Deployed' : 'Deploy to prod'}
        </Button>
        <Button variant="secondary" loading>
          Saving
        </Button>
      </Row>
    </div>
  );
}
