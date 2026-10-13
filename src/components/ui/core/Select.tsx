import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Check, ChevronsUpDown, Globe } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useClickOutside, useEscape, usePresence } from '@/components/ui/motion/hooks';

export type SelectOption = { value: string; label: string; icon?: ReactNode; description?: string };

export type SelectProps = {
  options: SelectOption[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
};

export function Select({ options, value, onChange, placeholder = 'Select…', label, className }: SelectProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const id = useId();
  const { mounted, visible } = usePresence(open, 160);
  const selected = options.find((o) => o.value === value);
  const close = useCallback(() => setOpen(false), []);

  useEscape(open, close);
  useClickOutside([root], open, close);

  useEffect(() => {
    if (open) setActive(Math.max(0, options.findIndex((o) => o.value === value)));
  }, [open, options, value]);

  useEffect(() => {
    if (!open) return;
    list.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  const pick = (i: number) => {
    onChange(options[i].value);
    setOpen(false);
  };

  const onKey = (e: KeyboardEvent) => {
    if (!open && ['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (!open) return;
    if (e.key === 'ArrowDown') setActive((a) => (a + 1) % options.length);
    else if (e.key === 'ArrowUp') setActive((a) => (a - 1 + options.length) % options.length);
    else if (e.key === 'Home') setActive(0);
    else if (e.key === 'End') setActive(options.length - 1);
    else if (e.key === 'Enter' || e.key === ' ') pick(active);
    else if (e.key === 'Tab') setOpen(false);
    else return;
    e.preventDefault();
  };

  return (
    <div ref={root} className={cn('relative w-full', className)}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-200">
          {label}
        </label>
      )}
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKey}
        className={cn(
          'focus-ring flex h-10 w-full items-center gap-2.5 rounded-lg bg-ink-900 px-3 text-left text-sm ring-1 ring-inset transition-all active:scale-[0.99]',
          open ? 'ring-brand-500 shadow-[0_0_0_4px_rgba(51,150,255,0.15)]' : 'ring-white/10 hover:ring-white/20',
        )}
      >
        {selected?.icon && <span className="text-ink-300 [&_svg]:h-4 [&_svg]:w-4">{selected.icon}</span>}
        <span className={cn('flex-1 truncate', selected ? 'text-ink-50' : 'text-ink-500')}>{selected?.label ?? placeholder}</span>
        <ChevronsUpDown className={cn('h-4 w-4 text-ink-400 transition-transform duration-300', open && 'scale-y-90')} />
      </button>
      {mounted && (
        <ul
          ref={list}
          role="listbox"
          aria-activedescendant={`${id}-${active}`}
          className={cn(
            'absolute left-0 right-0 top-full z-40 mt-2 max-h-64 origin-top overflow-auto rounded-xl bg-ink-850 p-1 shadow-pop',
            visible ? 'scale-100 opacity-100 transition-all duration-300 ease-spring' : '-translate-y-1 scale-95 opacity-0 transition-all duration-150',
          )}
        >
          {options.map((o, i) => {
            const isSel = o.value === value;
            return (
              <li
                key={o.value}
                id={`${id}-${i}`}
                data-index={i}
                role="option"
                aria-selected={isSel}
                onPointerMove={() => setActive(i)}
                onClick={() => pick(i)}
                className={cn(
                  'flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors',
                  i === active ? 'bg-white/[0.06] text-ink-50' : 'text-ink-300',
                )}
                style={{ animation: visible ? `fade-up 300ms cubic-bezier(0.16,1,0.3,1) ${i * 25}ms both` : undefined }}
              >
                {o.icon && <span className="text-ink-400 [&_svg]:h-4 [&_svg]:w-4">{o.icon}</span>}
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{o.label}</span>
                  {o.description && <span className="block truncate text-xs text-ink-500">{o.description}</span>}
                </span>
                <Check
                  className={cn('h-4 w-4 text-brand-300 transition-all duration-300 ease-spring', isSel ? 'scale-100 opacity-100' : 'scale-50 opacity-0')}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

const REGIONS: SelectOption[] = [
  { value: 'iad1', label: 'Washington, D.C.', description: 'us-east-1', icon: <Globe /> },
  { value: 'sfo1', label: 'San Francisco', description: 'us-west-1', icon: <Globe /> },
  { value: 'fra1', label: 'Frankfurt', description: 'eu-central-1', icon: <Globe /> },
  { value: 'lhr1', label: 'London', description: 'eu-west-2', icon: <Globe /> },
  { value: 'hnd1', label: 'Tokyo', description: 'ap-northeast-1', icon: <Globe /> },
  { value: 'syd1', label: 'Sydney', description: 'ap-southeast-2', icon: <Globe /> },
];

const ROLES: SelectOption[] = [
  { value: 'owner', label: 'Owner' },
  { value: 'admin', label: 'Admin' },
  { value: 'member', label: 'Member' },
  { value: 'viewer', label: 'Viewer' },
];

export function SelectDemo() {
  const [region, setRegion] = useState<string | null>('fra1');
  const [role, setRole] = useState<string | null>(null);

  return (
    <div className="mx-auto flex w-full max-w-xs flex-col gap-5 self-start">
      <Select label="Function region" options={REGIONS} value={region} onChange={setRegion} />
      <Select label="Invite as" options={ROLES} value={role} onChange={setRole} placeholder="Choose a role" />
      <p className="text-xs text-ink-500">Tip: focus a field and use ↑ ↓ Enter Esc.</p>
    </div>
  );
}
