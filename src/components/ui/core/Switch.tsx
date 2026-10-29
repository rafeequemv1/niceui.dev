import { useId, useState } from 'react';
import { Bell, Globe, Mail, Shield } from 'lucide-react';
import { cn } from '@/lib/cn';

export type SwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  size?: 'sm' | 'md';
  disabled?: boolean;
  className?: string;
};

const SIZES = {
  sm: { track: 'h-5 w-9', thumb: 'h-4 w-4', pressed: 'w-5', on: 'translate-x-4', onPressed: 'translate-x-3' },
  md: { track: 'h-6 w-11', thumb: 'h-5 w-5', pressed: 'w-6', on: 'translate-x-5', onPressed: 'translate-x-4' },
};

export function Switch({ checked, onChange, label, size = 'md', disabled, className }: SwitchProps) {
  const id = useId();
  const [pressed, setPressed] = useState(false);
  const s = SIZES[size];

  return (
    <span className={cn('inline-flex items-center gap-3', disabled && 'opacity-50', className)}>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
        onPointerLeave={() => setPressed(false)}
        className={cn(
          'focus-ring relative inline-flex shrink-0 items-center rounded-full p-0.5 transition-colors duration-300 ease-smooth disabled:cursor-not-allowed',
          s.track,
          checked
            ? 'bg-brand-500 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12),0_0_16px_-4px_rgba(56,189,248,0.7)]'
            : 'bg-ink-700 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] hover:bg-ink-600',
        )}
      >
        <span
          className={cn(
            'block rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.35)] transition-all duration-300 ease-spring',
            s.thumb,
            pressed && s.pressed,
            checked ? (pressed ? s.onPressed : s.on) : 'translate-x-0',
          )}
        />
      </button>
      {label && (
        <label htmlFor={id} className="cursor-pointer select-none text-sm text-ink-200">
          {label}
        </label>
      )}
    </span>
  );
}

const SETTINGS = [
  { id: 'deploy', icon: Bell, title: 'Deployment alerts', desc: 'Notify me when a production deploy fails.' },
  { id: 'digest', icon: Mail, title: 'Weekly digest', desc: 'A summary of usage and spend every Monday.' },
  { id: 'sso', icon: Shield, title: 'Enforce SSO', desc: 'Require SAML login for all members.' },
  { id: 'edge', icon: Globe, title: 'Edge caching', desc: 'Serve static assets from 120+ regions.' },
];

export function SwitchDemo() {
  const [state, setState] = useState<Record<string, boolean>>({ deploy: true, digest: false, sso: true, edge: false });
  const [compact, setCompact] = useState(true);

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="divide-y divide-white/5 overflow-hidden rounded-2xl bg-ink-900 shadow-card">
        {SETTINGS.map(({ id, icon: Icon, title, desc }, i) => (
          <div key={id} className="flex animate-fade-up items-center gap-4 p-4" style={{ animationDelay: `${i * 60}ms` }}>
            <div
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-300',
                state[id] ? 'bg-brand-500/15 text-brand-300' : 'bg-ink-850 text-ink-400',
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink-100">{title}</p>
              <p className="text-xs text-ink-400">{desc}</p>
            </div>
            <Switch checked={state[id]} onChange={(v) => setState((s) => ({ ...s, [id]: v }))} />
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-center">
        <Switch size="sm" checked={compact} onChange={setCompact} label="Compact mode" />
      </div>
    </div>
  );
}
