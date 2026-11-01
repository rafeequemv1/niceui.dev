import { useState, type ReactNode } from 'react';
import { Grid3x3, Hand, MousePointer2, Redo2, Ruler, Undo2, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '@/lib/cn';
import { LightFrame, focusRing } from './shared';
import { SegmentedPills } from './SegmentedPills';

function ToolButton({ label, kbd, active, onClick, children }: { label: string; kbd?: string; active?: boolean; onClick?: () => void; children: ReactNode }) {
  return (
    <span className="group relative">
      <button
        aria-label={label}
        aria-pressed={active}
        onClick={onClick}
        className={cn('grid h-8 w-8 place-items-center rounded-full transition-colors', focusRing, active ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900')}
      >
        {children}
      </button>
      <span className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-20 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-lg bg-zinc-900 px-2 py-1 text-[11.5px] text-white opacity-0 shadow-lg transition-all group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
        {label}
        {kbd && <span className="ml-1.5 text-zinc-400">{kbd}</span>}
      </span>
    </span>
  );
}

export type ViewSwitcherProps = {
  view: string;
  onView: (v: string) => void;
  tool: string;
  onTool: (t: string) => void;
  zoom: number;
  onZoom: (z: number) => void;
};

/** A floating pill toolbar: view mode segment, a divider, then tool and zoom buttons with tooltips. */
export function ViewSwitcher({ view, onView, tool, onTool, zoom, onZoom }: ViewSwitcherProps) {
  return (
    <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-zinc-200/80 bg-white/90 p-1 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.25)] backdrop-blur [scrollbar-width:none]">
      <SegmentedPills
        size="sm"
        label="Canvas view"
        value={view}
        onChange={onView}
        className="rounded-full [&>button]:rounded-full [&>span]:rounded-full"
        options={[{ value: 'fit', label: 'Fit' }, { value: '100', label: '100%' }, { value: 'pixel', label: 'Pixel' }]}
      />
      <span className="mx-1 h-5 w-px shrink-0 bg-zinc-200" />
      <ToolButton label="Select" kbd="V" active={tool === 'select'} onClick={() => onTool('select')}>
        <MousePointer2 className="h-4 w-4" />
      </ToolButton>
      <ToolButton label="Pan" kbd="H" active={tool === 'hand'} onClick={() => onTool('hand')}>
        <Hand className="h-4 w-4" />
      </ToolButton>
      <ToolButton label="Measure" kbd="M" active={tool === 'ruler'} onClick={() => onTool('ruler')}>
        <Ruler className="h-4 w-4" />
      </ToolButton>
      <span className="mx-1 h-5 w-px shrink-0 bg-zinc-200" />
      <ToolButton label="Zoom out" kbd="−" onClick={() => onZoom(Math.max(25, zoom - 25))}>
        <ZoomOut className="h-4 w-4" />
      </ToolButton>
      <span className="w-11 shrink-0 text-center font-mono text-[12px] tabular-nums text-zinc-700">{zoom}%</span>
      <ToolButton label="Zoom in" kbd="+" onClick={() => onZoom(Math.min(400, zoom + 25))}>
        <ZoomIn className="h-4 w-4" />
      </ToolButton>
    </div>
  );
}

export function ViewSwitcherDemo() {
  const [view, setView] = useState('fit');
  const [tool, setTool] = useState('select');
  const [zoom, setZoom] = useState(100);
  const [grid, setGrid] = useState(true);
  const scale = zoom / 100;
  return (
    <LightFrame className="mx-auto max-w-[620px]" bare>
      <div className="relative h-[360px] overflow-hidden rounded-2xl bg-[#f4f4f5]">
        {grid && <div className="absolute inset-0 opacity-70" style={{ backgroundImage: 'radial-gradient(#d4d4d8 1px, transparent 1px)', backgroundSize: `${16 * scale}px ${16 * scale}px` }} />}
        <div className={cn('absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 ease-smooth', tool === 'hand' && 'cursor-grab')} style={{ transform: `translate(-50%,-50%) scale(${view === 'fit' ? 0.9 : view === 'pixel' ? scale * 1.6 : scale})` }}>
          <div className={cn('relative grid h-36 w-36 place-items-center rounded-[28px] bg-white shadow-[0_20px_40px_-20px_rgba(0,0,0,0.35)] ring-1 ring-zinc-200', view === 'pixel' && '[image-rendering:pixelated]')}>
            <svg viewBox="0 0 40 40" className="h-20 w-20">
              <circle cx="20" cy="20" r="18" fill="#0b0b0c" />
              <path d="M11 25c5-8 13-8 18 0M14 19c4-5 8-5 12 0" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
            </svg>
            {tool === 'ruler' && (
              <span className="absolute -bottom-6 left-0 right-0 flex items-center gap-1 text-[10px] text-rose-500">
                <span className="h-px flex-1 bg-rose-400" /> 144 px <span className="h-px flex-1 bg-rose-400" />
              </span>
            )}
          </div>
        </div>
        <div className="absolute right-3 top-3 flex gap-1">
          <button aria-label="Undo" className={cn('grid h-8 w-8 place-items-center rounded-full bg-white text-zinc-500 shadow-sm ring-1 ring-zinc-200 hover:text-zinc-900', focusRing)}>
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button aria-label="Redo" className={cn('grid h-8 w-8 place-items-center rounded-full bg-white text-zinc-500 shadow-sm ring-1 ring-zinc-200 hover:text-zinc-900', focusRing)}>
            <Redo2 className="h-3.5 w-3.5" />
          </button>
          <button aria-label="Toggle grid" aria-pressed={grid} onClick={() => setGrid((g) => !g)} className={cn('grid h-8 w-8 place-items-center rounded-full shadow-sm ring-1 ring-zinc-200', focusRing, grid ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-500')}>
            <Grid3x3 className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="absolute inset-x-3 bottom-4 flex justify-center">
          <ViewSwitcher view={view} onView={setView} tool={tool} onTool={setTool} zoom={zoom} onZoom={setZoom} />
        </div>
      </div>
    </LightFrame>
  );
}
