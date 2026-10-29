import { useState, type ReactNode } from 'react';
import { ArrowRight, Building2, Check, ChevronLeft, CreditCard, Rocket, User } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from './Button';
import { Input } from './Input';
import { animateOnce } from './utils';

export type Step = { id: string; label: string; icon?: ReactNode };

export type StepperProps = { steps: Step[]; current: number; onStepClick?: (index: number) => void };

export function Stepper({ steps, current, onStepClick }: StepperProps) {
  return (
    <ol className="flex w-full items-start">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={s.id} className="relative flex flex-1 flex-col items-center">
            {i < steps.length - 1 && (
              <span className="absolute left-[calc(50%+22px)] right-[calc(-50%+22px)] top-4 h-0.5 overflow-hidden rounded-full bg-ink-800">
                <span
                  className="block h-full origin-left bg-brand-500 transition-transform duration-500 ease-smooth"
                  style={{ transform: `scaleX(${done ? 1 : 0})` }}
                />
              </span>
            )}
            <button
              type="button"
              disabled={!onStepClick || i > current}
              onClick={() => onStepClick?.(i)}
              aria-current={active ? 'step' : undefined}
              className={cn(
                'focus-ring relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-all duration-500 ease-spring [&_svg]:h-4 [&_svg]:w-4',
                done && 'bg-brand-500 text-white',
                active && 'scale-110 bg-ink-900 text-brand-300 shadow-[inset_0_0_0_2px_#38bdf8,0_0_0_5px_rgba(56,189,248,0.15)]',
                !done && !active && 'bg-ink-900 text-ink-500 shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.12)]',
              )}
            >
              {done ? <Check className="animate-scale-in" strokeWidth={3} /> : s.icon ?? i + 1}
            </button>
            <span className={cn('mt-2 text-xs font-medium transition-colors duration-300', active ? 'text-ink-50' : done ? 'text-ink-300' : 'text-ink-500')}>
              {s.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

const STEPS: Step[] = [
  { id: 'account', label: 'Account', icon: <User /> },
  { id: 'team', label: 'Workspace', icon: <Building2 /> },
  { id: 'billing', label: 'Billing', icon: <CreditCard /> },
  { id: 'launch', label: 'Launch', icon: <Rocket /> },
];

function Panel({ step }: { step: number }) {
  if (step === 0)
    return (
      <div className="space-y-3">
        <Input label="Full name" defaultValue="Maya Chen" />
        <Input label="Work email" defaultValue="maya@acme.com" />
      </div>
    );
  if (step === 1)
    return (
      <div className="space-y-3">
        <Input label="Workspace name" defaultValue="Acme Inc." />
        <Input label="URL" defaultValue="acme" rightSlot={<span className="text-xs text-ink-500">.lumen.dev</span>} />
      </div>
    );
  if (step === 2)
    return (
      <div className="space-y-3">
        <Input label="Card number" defaultValue="4242 4242 4242 4242" leftIcon={<CreditCard />} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Expiry" defaultValue="09 / 29" />
          <Input label="CVC" defaultValue="123" />
        </div>
      </div>
    );
  return (
    <div className="flex flex-col items-center py-6 text-center">
      <span className="flex h-12 w-12 animate-scale-in items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
        <Check className="h-6 w-6" strokeWidth={2.5} />
      </span>
      <p className="mt-3 font-medium text-ink-50">You’re all set</p>
      <p className="mt-1 text-sm text-ink-400">acme.lumen.dev is ready for your first deploy.</p>
    </div>
  );
}

export function StepperDemo() {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const go = (n: number) => {
    setDir(n > step ? 1 : -1);
    setStep(n);
  };
  const last = step === STEPS.length - 1;

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl bg-ink-900 p-6 shadow-card">
      <Stepper steps={STEPS} current={step} onStepClick={go} />
      <div className="relative mt-6 min-h-[168px] overflow-hidden">
        <div
          key={step}
          ref={(el) =>
            animateOnce(
              el,
              [
                { opacity: 0, transform: `translateX(${dir * 40}px)` },
                { opacity: 1, transform: 'translateX(0)' },
              ],
              { duration: 450, easing: 'cubic-bezier(0.16,1,0.3,1)' },
            )
          }
        >
          <Panel step={step} />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
        <Button variant="ghost" size="sm" leftIcon={<ChevronLeft />} disabled={step === 0} onClick={() => go(step - 1)}>
          Back
        </Button>
        <span className="text-xs tabular-nums text-ink-500">
          Step {step + 1} of {STEPS.length}
        </span>
        {last ? (
          <Button size="sm" variant="secondary" onClick={() => go(0)}>
            Start over
          </Button>
        ) : (
          <Button size="sm" rightIcon={<ArrowRight />} onClick={() => go(step + 1)}>
            {step === STEPS.length - 2 ? 'Finish' : 'Continue'}
          </Button>
        )}
      </div>
    </div>
  );
}
