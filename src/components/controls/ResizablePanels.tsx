import { useRef, useState, type KeyboardEvent, type PointerEvent as RPointerEvent, type ReactNode } from 'react';
import { FileCode2, Folder, TerminalSquare } from 'lucide-react';
import { cn } from '@/lib/cn';

export type ResizablePanelsProps = {
  /** Two panels. */
  children: [ReactNode, ReactNode];
  direction?: 'horizontal' | 'vertical';
  /** Size of the first panel in percent. */
  defaultSize?: number;
  /** Minimum size of each panel in percent. */
  min?: number;
  label?: string;
  className?: string;
  onResize?: (size: number) => void;
};

/**
 * Two resizable panels with a drag handle. The handle is a focusable separator:
 * arrow keys resize (Shift for bigger steps), Home/End collapse to the limits,
 * and double-click or Enter resets.
 */
export function ResizablePanels({ children, direction = 'horizontal', defaultSize = 50, min = 15, label = 'Resize panels', className, onResize }: ResizablePanelsProps) {
  const [size, setSize] = useState(defaultSize);
  const [drag, setDrag] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const h = direction === 'horizontal';
  const clamp = (v: number) => Math.min(100 - min, Math.max(min, v));
  const set = (v: number) => {
    const c = clamp(v);
    setSize(c);
    onResize?.(c);
  };

  const fromPointer = (e: RPointerEvent) => {
    const r = box.current!.getBoundingClientRect();
    set(h ? ((e.clientX - r.left) / r.width) * 100 : ((e.clientY - r.top) / r.height) * 100);
  };
  const onKey = (e: KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 2;
    const back = h ? 'ArrowLeft' : 'ArrowUp';
    const fwd = h ? 'ArrowRight' : 'ArrowDown';
    if (e.key === back) set(size - step);
    else if (e.key === fwd) set(size + step);
    else if (e.key === 'Home') set(min);
    else if (e.key === 'End') set(100 - min);
    else if (e.key === 'Enter') set(defaultSize);
    else return;
    e.preventDefault();
  };

  return (
    <div ref={box} className={cn('flex h-full w-full overflow-hidden', h ? 'flex-row' : 'flex-col', drag && 'select-none', className)}>
      <div className="min-h-0 min-w-0 overflow-auto" style={{ flexBasis: `${size}%`, flexShrink: 0 }}>
        {children[0]}
      </div>
      <div
        role="separator"
        aria-orientation={h ? 'vertical' : 'horizontal'}
        aria-label={label}
        aria-valuenow={Math.round(size)}
        aria-valuemin={min}
        aria-valuemax={100 - min}
        tabIndex={0}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          setDrag(true);
        }}
        onPointerMove={(e) => drag && fromPointer(e)}
        onPointerUp={() => setDrag(false)}
        onPointerCancel={() => setDrag(false)}
        onDoubleClick={() => set(defaultSize)}
        onKeyDown={onKey}
        className={cn(
          'group relative z-10 flex shrink-0 touch-none items-center justify-center outline-none',
          h ? 'w-px cursor-col-resize bg-white/[.08]' : 'h-px cursor-row-resize bg-white/[.08]',
        )}
      >
        {/* wide invisible hit area */}
        <span className={cn('absolute', h ? 'inset-y-0 -left-2 -right-2' : 'inset-x-0 -top-2 -bottom-2')} />
        <span
          className={cn(
            'pointer-events-none absolute rounded-full transition-all duration-200',
            h ? 'h-8 w-1' : 'h-1 w-8',
            drag ? 'scale-110 bg-brand-400' : 'bg-white/20 group-hover:bg-white/50 group-focus-visible:bg-brand-400',
          )}
        />
        <span className={cn('pointer-events-none absolute transition-colors', h ? 'inset-y-0 w-px' : 'inset-x-0 h-px', drag ? 'bg-brand-400/70' : 'group-hover:bg-white/25 group-focus-visible:bg-brand-400/60')} />
      </div>
      <div className="min-h-0 min-w-0 flex-1 overflow-auto">{children[1]}</div>
    </div>
  );
}

const FILES = ['app.tsx', 'layout.tsx', 'page.tsx', 'globals.css', 'utils.ts'];
const CODE = [
  ['import', ' { ResizablePanels } ', 'from', " '@/components/controls/ResizablePanels';"],
  ['', '', '', ''],
  ['export function', ' Editor() {', '', ''],
  ['  return', ' (', '', ''],
  ['    <ResizablePanels', ' direction="vertical"', '>', ''],
  ['      <Code />', '', '', ''],
  ['      <Terminal />', '', '', ''],
  ['    </ResizablePanels>', '', '', ''],
  ['  );', '', '', ''],
  ['}', '', '', ''],
];

export function ResizablePanelsDemo() {
  const [file, setFile] = useState(0);
  return (
    <div className="h-[380px] w-full max-w-3xl overflow-hidden rounded-2xl border border-white/[.08] bg-ink-950 shadow-card">
      <ResizablePanels defaultSize={28} min={18} label="Resize sidebar">
        <div className="h-full bg-ink-900/60 p-2">
          <p className="flex items-center gap-1.5 px-2 py-1.5 text-[11px] uppercase tracking-wider text-ink-500">
            <Folder className="h-3.5 w-3.5" /> src
          </p>
          {FILES.map((f, i) => (
            <button key={f} onClick={() => setFile(i)} className={cn('flex w-full items-center gap-2 truncate rounded-md px-2 py-1.5 text-left text-[12.5px]', i === file ? 'bg-brand-400/10 text-brand-200' : 'text-ink-300 hover:bg-white/[.04]')}>
              <FileCode2 className="h-3.5 w-3.5 shrink-0 opacity-70" /> <span className="truncate">{f}</span>
            </button>
          ))}
        </div>
        <ResizablePanels direction="vertical" defaultSize={64} min={20} label="Resize terminal">
          <div className="h-full p-4 font-mono text-[12px] leading-6">
            <p className="mb-2 text-[11px] text-ink-500">{FILES[file]}</p>
            {CODE.map((l, i) => (
              <p key={i} className="whitespace-pre">
                <span className="mr-4 inline-block w-4 text-right text-ink-600">{i + 1}</span>
                <span className="text-fuchsia-300">{l[0]}</span>
                <span className="text-ink-100">{l[1]}</span>
                <span className="text-fuchsia-300">{l[2]}</span>
                <span className="text-emerald-300">{l[3]}</span>
              </p>
            ))}
          </div>
          <div className="h-full bg-black/40 p-3 font-mono text-[12px] leading-6 text-ink-300">
            <p className="mb-1 flex items-center gap-1.5 text-[11px] text-ink-500">
              <TerminalSquare className="h-3.5 w-3.5" /> Terminal
            </p>
            <p>
              <span className="text-brand-300">~/app</span> $ npm run dev
            </p>
            <p className="text-emerald-300">✓ Ready in 412ms</p>
            <p className="text-ink-500">➜ Local: http://localhost:5173</p>
          </div>
        </ResizablePanels>
      </ResizablePanels>
    </div>
  );
}
