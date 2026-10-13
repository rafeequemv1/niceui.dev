import { Circle, Frame, Square, Trash2, Type } from 'lucide-react';
import { cn } from '@/lib/cn';
import { swatches, type Shape, type ShapeKind } from './editorModel';

export const kindIcon: Record<ShapeKind, typeof Frame> = { frame: Frame, rect: Square, ellipse: Circle, text: Type };

export function LayersPanel({ shapes, selected, onSelect }: { shapes: Shape[]; selected: string | null; onSelect: (id: string) => void }) {
  return (
    <aside className="hidden w-52 shrink-0 flex-col border-r border-zinc-200 bg-white lg:flex">
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
        <span className="text-xs font-semibold text-zinc-900">Layers</span>
        <span className="font-mono text-[10px] text-zinc-400">{shapes.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-1.5">
        {[...shapes].reverse().map((s) => {
          const Icon = kindIcon[s.kind];
          const active = s.id === selected;
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs transition-colors',
                active ? 'bg-[#0d99ff]/10 text-[#0b7fd4]' : 'text-zinc-700 hover:bg-zinc-100',
                s.fresh && 'animate-slide-in-right',
              )}
            >
              <Icon className={cn('h-3.5 w-3.5 shrink-0', active ? 'text-[#0d99ff]' : 'text-zinc-400')} />
              <span className="truncate">{s.name}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

function NumField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="flex items-center gap-2 rounded-md bg-zinc-100 px-2 py-1.5 transition-colors focus-within:bg-white focus-within:ring-1 focus-within:ring-[#0d99ff]">
      <span className="w-3 text-[10px] font-medium text-zinc-400">{label}</span>
      <input
        type="number"
        value={Math.round(value)}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (Number.isFinite(n)) onChange(n);
        }}
        className="w-full min-w-0 bg-transparent font-mono text-[11px] text-zinc-900 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
      />
    </label>
  );
}

export function Inspector({ shape, onChange, onDelete }: { shape: Shape | null; onChange: (patch: Partial<Shape>) => void; onDelete: () => void }) {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-l border-zinc-200 bg-white xl:flex">
      <div className="flex items-center gap-4 border-b border-zinc-200 px-4 py-3 text-xs">
        <span className="font-semibold text-zinc-900">Design</span>
        <span className="text-zinc-400">Prototype</span>
        <span className="text-zinc-400">Inspect</span>
      </div>
      {shape ? (
        <div key={shape.id} className="flex-1 space-y-5 overflow-y-auto p-4 animate-fade-in">
          <div>
            <div className="flex items-center justify-between">
              <span className="truncate text-xs font-semibold text-zinc-900">{shape.name}</span>
              <button onClick={onDelete} aria-label="Delete layer" className="rounded p-1 text-zinc-400 transition-colors hover:bg-rose-50 hover:text-rose-600">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-1.5">
              <NumField label="X" value={shape.x} onChange={(x) => onChange({ x })} />
              <NumField label="Y" value={shape.y} onChange={(y) => onChange({ y })} />
              <NumField label="W" value={shape.w} onChange={(w) => onChange({ w: Math.max(8, w) })} />
              <NumField label="H" value={shape.h} onChange={(h) => onChange({ h: Math.max(2, h) })} />
            </div>
          </div>
          {shape.kind !== 'ellipse' && shape.kind !== 'text' && (
            <div>
              <div className="flex justify-between text-[11px] text-zinc-500">
                <span>Corner radius</span>
                <span className="font-mono text-zinc-900">{shape.radius}</span>
              </div>
              <input
                type="range" min={0} max={40} value={shape.radius}
                onChange={(e) => onChange({ radius: Number(e.target.value) })}
                className="mt-2 w-full accent-[#0d99ff]"
              />
            </div>
          )}
          {shape.kind === 'text' && (
            <div>
              <span className="text-[11px] text-zinc-500">Content</span>
              <input
                value={shape.text ?? ''}
                onChange={(e) => onChange({ text: e.target.value })}
                className="mt-2 w-full rounded-md bg-zinc-100 px-2 py-1.5 text-xs text-zinc-900 outline-none focus:bg-white focus:ring-1 focus:ring-[#0d99ff]"
              />
            </div>
          )}
          <div>
            <span className="text-[11px] text-zinc-500">Fill</span>
            <div className="mt-2 grid grid-cols-8 gap-1.5">
              {swatches.map((c) => (
                <button
                  key={c}
                  onClick={() => onChange({ fill: c })}
                  aria-label={`Fill ${c}`}
                  className={cn('aspect-square rounded-md ring-1 ring-zinc-200 transition-transform hover:scale-110', shape.fill === c && 'ring-2 ring-[#0d99ff] ring-offset-1')}
                  style={{ background: c }}
                />
              ))}
            </div>
            <div className="mt-2 flex items-center gap-2 rounded-md bg-zinc-100 px-2 py-1.5 font-mono text-[11px] text-zinc-700">
              <span className="h-3.5 w-3.5 rounded-sm ring-1 ring-zinc-300" style={{ background: shape.fill }} />
              {shape.fill.toUpperCase()}
              <span className="ml-auto text-zinc-400">100%</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
          <Square className="h-6 w-6 text-zinc-300" />
          <p className="mt-3 text-xs leading-relaxed text-zinc-500">Select a layer to edit its size, radius and fill.</p>
        </div>
      )}
    </aside>
  );
}
