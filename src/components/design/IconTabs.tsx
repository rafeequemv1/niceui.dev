import { useState, type ReactNode } from 'react';
import { Palette, Shapes, Sparkles } from 'lucide-react';
import { cn } from '@/lib/cn';
import { LightFrame, focusRing } from './shared';
import { SegmentedPills } from './SegmentedPills';
import { InlineSlider } from './InlineSlider';
import { ToggleRow } from './ToggleRow';

export type IconTab = { id: string; label: string; icon: ReactNode; content: ReactNode };

/** Panel tabs where the active tab is a raised white tab joined to the panel below. */
export function IconTabs({ tabs, defaultTab }: { tabs: IconTab[]; defaultTab?: string }) {
  const [active, setActive] = useState(defaultTab ?? tabs[0].id);
  const current = tabs.find((t) => t.id === active) ?? tabs[0];
  return (
    <div>
      <div role="tablist" className="flex gap-1 px-1">
        {tabs.map((t, i) => {
          const on = t.id === active;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={on}
              tabIndex={on ? 0 : -1}
              onClick={() => setActive(t.id)}
              onKeyDown={(e) => {
                const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
                if (dir) setActive(tabs[(i + dir + tabs.length) % tabs.length].id);
              }}
              className={cn(
                'relative flex items-center gap-1.5 rounded-t-xl px-3.5 pb-2.5 pt-2 text-[13px] font-medium transition-colors',
                focusRing,
                on ? 'z-10 -mb-px border border-b-0 border-zinc-200/80 bg-white text-zinc-900' : 'text-zinc-500 hover:text-zinc-800',
              )}
            >
              <span className={cn(on ? 'text-zinc-800' : 'text-zinc-400')}>{t.icon}</span>
              {t.label}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" className="rounded-2xl rounded-tl-none border border-zinc-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div key={current.id} className="animate-fade-in">{current.content}</div>
      </div>
    </div>
  );
}

function ShapeTab() {
  const [mode, setMode] = useState('fill');
  const [w, setW] = useState(2);
  return (
    <div className="space-y-3">
      <SegmentedPills full size="sm" label="Shape mode" value={mode} onChange={setMode} options={[{ value: 'fill', label: 'Fill' }, { value: 'stroke', label: 'Stroke' }, { value: 'both', label: 'Both' }]} />
      <p className="text-[12px] leading-relaxed text-zinc-500">The traced outline becomes a vector shape you can recolour, stroke and export as SVG.</p>
      <InlineSlider label="Stroke width" value={w} onChange={setW} max={12} step={0.5} unit="px" defaultValue={2} />
    </div>
  );
}

function StyleTab() {
  const colors = ['#0b0b0c', '#2563eb', '#f97316', '#10b981', '#e11d48', '#a855f7'];
  const [c, setC] = useState(colors[1]);
  const [grain, setGrain] = useState(false);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {colors.map((x) => (
          <button key={x} aria-label={`Colour ${x}`} aria-pressed={c === x} onClick={() => setC(x)} className={cn('h-8 w-8 rounded-full ring-2 ring-offset-2 transition-all', focusRing, c === x ? 'ring-zinc-900' : 'ring-transparent hover:ring-zinc-300')} style={{ background: x }} />
        ))}
      </div>
      <ToggleRow label="Add grain" checked={grain} onChange={setGrain} />
    </div>
  );
}

function EffectsTab() {
  const [blur, setBlur] = useState(12);
  const [y, setY] = useState(8);
  return (
    <div className="space-y-2.5">
      <p className="text-[12px] font-medium text-zinc-500">Drop shadow</p>
      <InlineSlider label="Blur" value={blur} onChange={setBlur} max={64} step={1} unit="px" decimals={0} defaultValue={12} />
      <InlineSlider label="Offset Y" value={y} onChange={setY} max={32} step={1} unit="px" decimals={0} defaultValue={8} />
    </div>
  );
}

export function IconTabsDemo() {
  return (
    <LightFrame bare className="mx-auto max-w-[400px] p-4 sm:p-5">
      <IconTabs
        tabs={[
          { id: 'shape', label: 'Shape', icon: <Shapes className="h-3.5 w-3.5" />, content: <ShapeTab /> },
          { id: 'style', label: 'Style', icon: <Palette className="h-3.5 w-3.5" />, content: <StyleTab /> },
          { id: 'fx', label: 'Effects', icon: <Sparkles className="h-3.5 w-3.5" />, content: <EffectsTab /> },
        ]}
      />
    </LightFrame>
  );
}
