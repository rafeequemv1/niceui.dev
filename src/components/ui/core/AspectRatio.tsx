import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Tabs } from './Tabs';

export type AspectRatioProps = {
  ratio: number;
  children?: ReactNode;
  className?: string;
};

/** Keeps children at a fixed width/height ratio. Changes animate smoothly. */
export function AspectRatio({ ratio, children, className }: AspectRatioProps) {
  return (
    <div className={cn('relative w-full', className)}>
      <div className="transition-[padding] duration-700 ease-spring" style={{ paddingBottom: `${100 / ratio}%` }} />
      <div className="absolute inset-0">{children}</div>
    </div>
  );
}

const RATIOS = [
  { id: '16:9', label: '16:9', value: 16 / 9, use: 'Video · YouTube' },
  { id: '4:3', label: '4:3', value: 4 / 3, use: 'Presentation' },
  { id: '1:1', label: '1:1', value: 1, use: 'Instagram post' },
  { id: '9:16', label: '9:16', value: 9 / 16, use: 'Story · Reels' },
];

const BOX = 240;

export function AspectRatioDemo() {
  const [id, setId] = useState('16:9');
  const r = RATIOS.find((x) => x.id === id)!;
  const w = Math.min(BOX * 1.4, BOX * r.value);
  const h = w / r.value;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-6">
      <Tabs tabs={RATIOS.map(({ id, label }) => ({ id, label }))} value={id} onChange={setId} />
      <div className="flex h-[260px] items-center justify-center">
        <div
          className="relative overflow-hidden rounded-2xl shadow-pop transition-all duration-700 ease-spring"
          style={{ width: w, height: h }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#3396ff,transparent_55%),radial-gradient(circle_at_85%_80%,#14b8a6,transparent_55%),radial-gradient(circle_at_80%_10%,#fbbf24,transparent_40%)] bg-ink-900" />
          <div className="dot-bg absolute inset-0 opacity-50" />
          <div className="absolute inset-3 rounded-xl border border-dashed border-white/25" />
          <div className="relative flex h-full flex-col items-center justify-center text-white">
            <span key={id} className="animate-scale-in text-3xl font-semibold tracking-tight tabular-nums drop-shadow">
              {r.label}
            </span>
            <span key={`${id}-u`} className="mt-1 animate-fade-up text-xs text-white/80">
              {r.use}
            </span>
          </div>
        </div>
      </div>
      <p className="text-xs tabular-nums text-ink-500">
        {Math.round(w)} × {Math.round(h)} px
      </p>
    </div>
  );
}
