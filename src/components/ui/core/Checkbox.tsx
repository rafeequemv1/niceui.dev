import { useId, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  indeterminate?: boolean;
  label?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  className?: string;
};

export function Checkbox({ checked, onChange, indeterminate = false, label, description, disabled, className }: CheckboxProps) {
  const id = useId();
  const on = checked || indeterminate;

  return (
    <label
      htmlFor={id}
      className={cn('group inline-flex cursor-pointer items-start gap-3', disabled && 'cursor-not-allowed opacity-50', className)}
    >
      <span className="relative mt-0.5 flex h-[18px] w-[18px] shrink-0">
        <input
          id={id}
          type="checkbox"
          className="peer absolute inset-0 cursor-[inherit] appearance-none rounded-[5px] outline-none"
          checked={checked}
          disabled={disabled}
          aria-checked={indeterminate ? 'mixed' : checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span
          aria-hidden
          className={cn(
            'pointer-events-none flex h-full w-full items-center justify-center rounded-[5px] transition-all duration-200 ease-smooth group-active:scale-90 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500/60 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-ink-950',
            on
              ? 'bg-brand-500 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15),0_0_12px_-2px_rgba(51,150,255,0.6)]'
              : 'bg-ink-900 shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.18)] group-hover:shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.32)]',
          )}
        >
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="white" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
            <path
              d="M3.5 8.5 6.5 11.5 12.5 4.5"
              strokeDasharray={16}
              strokeDashoffset={checked && !indeterminate ? 0 : 16}
              style={{ transition: `stroke-dashoffset ${checked && !indeterminate ? '350ms cubic-bezier(0.65,0,0.35,1) 60ms' : '150ms ease-in'}` }}
            />
            <path
              d="M4 8h8"
              strokeDasharray={8}
              strokeDashoffset={indeterminate ? 0 : 8}
              style={{ transition: 'stroke-dashoffset 250ms cubic-bezier(0.65,0,0.35,1)' }}
            />
          </svg>
        </span>
      </span>
      {(label || description) && (
        <span className="select-none">
          {label && <span className="block text-sm font-medium text-ink-100">{label}</span>}
          {description && <span className="block text-xs text-ink-400">{description}</span>}
        </span>
      )}
    </label>
  );
}

const PERMS = [
  { id: 'read', label: 'Read deployments', desc: 'View builds, logs and previews.' },
  { id: 'write', label: 'Create deployments', desc: 'Push to preview and production.' },
  { id: 'env', label: 'Manage environment variables', desc: 'Read and edit secrets.' },
  { id: 'domains', label: 'Configure domains', desc: 'Add, verify and remove domains.' },
  { id: 'billing', label: 'Billing access', desc: 'View invoices and change plan.' },
];

export function CheckboxDemo() {
  const [sel, setSel] = useState<string[]>(['read', 'write']);
  const all = sel.length === PERMS.length;
  const some = sel.length > 0 && !all;

  return (
    <div className="mx-auto w-full max-w-sm overflow-hidden rounded-2xl bg-ink-900 shadow-card">
      <div className="flex items-center justify-between border-b border-white/5 bg-ink-950/40 px-4 py-3">
        <Checkbox
          checked={all}
          indeterminate={some}
          onChange={() => setSel(all ? [] : PERMS.map((p) => p.id))}
          label="API token scopes"
        />
        <span className="text-xs tabular-nums text-ink-400">
          {sel.length}/{PERMS.length}
        </span>
      </div>
      <div className="space-y-1 p-2">
        {PERMS.map((p, i) => (
          <div
            key={p.id}
            className={cn('animate-fade-up rounded-lg px-2 py-2 transition-colors', sel.includes(p.id) ? 'bg-brand-500/[0.06]' : 'hover:bg-white/[0.03]')}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <Checkbox
              checked={sel.includes(p.id)}
              onChange={(c) => setSel((s) => (c ? [...s, p.id] : s.filter((x) => x !== p.id)))}
              label={p.label}
              description={p.desc}
              className="w-full"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
