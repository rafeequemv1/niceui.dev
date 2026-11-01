import { useId, useState } from 'react';
import { cn } from '@/lib/cn';
import { LightFrame, Panel, SectionHead, focusRing } from './shared';

export type ToggleRowProps = {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
};

export function SoftSwitch({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn('relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200 disabled:opacity-40', focusRing, checked ? 'bg-zinc-900' : 'bg-zinc-200 ring-1 ring-inset ring-zinc-300/60')}
    >
      <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.25)] transition-all duration-300 ease-spring', checked ? 'left-[18px]' : 'left-0.5')} />
    </button>
  );
}

/** A full-width settings row: soft background, label on the left, switch on the right. */
export function ToggleRow({ label, description, checked, onChange, disabled }: ToggleRowProps) {
  const id = useId();
  return (
    <div className={cn('rounded-xl bg-zinc-100 px-3 py-2.5 ring-1 ring-inset ring-zinc-200/70', disabled && 'opacity-60')}>
      <div className="flex items-center justify-between gap-3">
        <span id={id} className="text-[13px] text-zinc-700">{label}</span>
        <SoftSwitch checked={checked} onChange={onChange} label={label} disabled={disabled} />
      </div>
      {description && <p className="mt-1 text-[12px] leading-snug text-zinc-500">{description}</p>}
    </div>
  );
}

export function ToggleRowDemo() {
  const [holes, setHoles] = useState(false);
  const [snap, setSnap] = useState(true);
  const [outline, setOutline] = useState(true);
  const [grid, setGrid] = useState(false);
  return (
    <LightFrame className="mx-auto max-w-[420px]">
      <Panel className="space-y-5">
        <div>
          <SectionHead title="Outline" meta="3 paths · dark pixels" />
          <div className="space-y-2">
            <ToggleRow label="Fill holes" checked={holes} onChange={setHoles} />
            <ToggleRow label="Keep stroke" description="Trace the outline as a stroke as well as a fill." checked={outline} onChange={setOutline} />
          </div>
        </div>
        <div className="h-px bg-zinc-100" />
        <div>
          <SectionHead title="Canvas" meta={snap ? 'Snapping on' : 'Snapping off'} />
          <div className="space-y-2">
            <ToggleRow label="Snap to pixel grid" checked={snap} onChange={setSnap} />
            <ToggleRow label="Show grid" checked={grid} onChange={setGrid} disabled={!snap} />
          </div>
        </div>
      </Panel>
    </LightFrame>
  );
}
