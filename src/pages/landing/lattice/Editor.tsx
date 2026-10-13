import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type PointerEvent } from 'react';
import { Circle, Frame, Loader2, MousePointer2, Play, Sparkles, Square, Type } from 'lucide-react';
import { cn } from '@/lib/cn';
import { generatedCard, initialShapes, makeShape, type Shape, type Tool } from './editorModel';
import { Inspector, LayersPanel } from './EditorPanels';

const BOARD_W = 820;

const tools: { id: Tool; icon: typeof Frame; key: string; label: string }[] = [
  { id: 'select', icon: MousePointer2, key: 'V', label: 'Move' },
  { id: 'frame', icon: Frame, key: 'F', label: 'Frame' },
  { id: 'rect', icon: Square, key: 'R', label: 'Rectangle' },
  { id: 'ellipse', icon: Circle, key: 'O', label: 'Ellipse' },
  { id: 'text', icon: Type, key: 'T', label: 'Text' },
];

const peers = [
  { name: 'Mira', color: '#f97316', path: [[620, 110], [480, 260], [700, 360], [560, 200]] },
  { name: 'Theo', color: '#10b981', path: [[200, 380], [330, 160], [150, 250], [300, 420]] },
];

function PeerCursor({ name, color, path, scale }: { name: string; color: string; path: number[][]; scale: number }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % path.length), 2400);
    return () => clearInterval(id);
  }, [path.length]);
  const [x, y] = path[i];
  return (
    <div className="pointer-events-none absolute left-0 top-0 z-30 transition-transform duration-[2200ms] ease-smooth" style={{ transform: `translate(${x * scale}px, ${y * scale}px)` }}>
      <MousePointer2 className="h-5 w-5 -rotate-12" style={{ color, fill: color }} />
      <span className="ml-4 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium text-white shadow-sm" style={{ background: color }}>{name}</span>
    </div>
  );
}

type Drag = { id: string; mode: 'move' | 'resize'; sx: number; sy: number; ox: number; oy: number; ow: number; oh: number };

export function Editor() {
  const [shapes, setShapes] = useState<Shape[]>(initialShapes);
  const [selected, setSelected] = useState<string | null>('r1');
  const [tool, setTool] = useState<Tool>('select');
  const [prompt, setPrompt] = useState('Pricing card, dark, with CTA');
  const [generating, setGenerating] = useState(false);
  const [scale, setScale] = useState(1);
  const boardRef = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setScale(Math.min(1, entry.contentRect.width / BOARD_W)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const update = (id: string, patch: Partial<Shape>) => setShapes((list) => list.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const remove = (id: string) => {
    setShapes((list) => list.filter((s) => s.id !== id));
    setSelected(null);
  };

  const local = (e: PointerEvent) => {
    const b = boardRef.current!.getBoundingClientRect();
    return { x: (e.clientX - b.left) / scale, y: (e.clientY - b.top) / scale };
  };

  const onBoardDown = (e: PointerEvent<HTMLDivElement>) => {
    if (tool === 'select') {
      setSelected(null);
      return;
    }
    const p = local(e);
    const shape = makeShape(tool, p.x, p.y, shapes.length + 1);
    setShapes((list) => [...list, shape]);
    setSelected(shape.id);
    setTool('select');
  };

  const startDrag = (e: PointerEvent<HTMLElement>, s: Shape, mode: Drag['mode']) => {
    if (tool !== 'select') return;
    e.stopPropagation();
    setSelected(s.id);
    const p = local(e);
    drag.current = { id: s.id, mode, sx: p.x, sy: p.y, ox: s.x, oy: s.y, ow: s.w, oh: s.h };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const p = local(e);
    const dx = p.x - d.sx;
    const dy = p.y - d.sy;
    if (d.mode === 'move') update(d.id, { x: Math.round(d.ox + dx), y: Math.round(d.oy + dy) });
    else update(d.id, { w: Math.max(12, Math.round(d.ow + dx)), h: Math.max(2, Math.round(d.oh + dy)) });
  };

  const generate = (e: FormEvent) => {
    e.preventDefault();
    if (generating || !prompt.trim()) return;
    setGenerating(true);
    const offset = (shapes.filter((s) => s.name === 'AI / Pricing card').length % 3) * 18;
    const parts = generatedCard(580 + offset, 40 + offset);
    timers.current.push(
      window.setTimeout(() => {
        parts.forEach((part, i) => {
          timers.current.push(window.setTimeout(() => setShapes((list) => [...list, part]), i * 130));
        });
        timers.current.push(
          window.setTimeout(() => {
            setSelected(parts[0].id);
            setGenerating(false);
          }, parts.length * 130),
        );
      }, 1100),
    );
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).tagName === 'INPUT') return;
    const t = tools.find((x) => x.key.toLowerCase() === e.key.toLowerCase());
    if (t) return setTool(t.id);
    if (!selected) return;
    const s = shapes.find((x) => x.id === selected);
    if (!s) return;
    const step = e.shiftKey ? 10 : 1;
    const nudges: Record<string, Partial<Shape>> = {
      ArrowLeft: { x: s.x - step }, ArrowRight: { x: s.x + step }, ArrowUp: { y: s.y - step }, ArrowDown: { y: s.y + step },
    };
    if (nudges[e.key]) {
      e.preventDefault();
      update(s.id, nudges[e.key]);
    } else if (e.key === 'Delete' || e.key === 'Backspace') remove(s.id);
    else if (e.key === 'Escape') setSelected(null);
  };

  const current = shapes.find((s) => s.id === selected) ?? null;

  return (
    <div tabIndex={0} onKeyDown={onKey} className="flex h-[560px] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_50px_100px_-40px_rgba(24,24,27,0.35)] outline-none focus-visible:ring-2 focus-visible:ring-[#0d99ff]/40">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-zinc-200 bg-zinc-950 px-3 text-white">
        <div className="flex items-center gap-1">
          {tools.map((t) => (
            <button
              key={t.id}
              onClick={() => setTool(t.id)}
              title={`${t.label} (${t.key})`}
              aria-label={t.label}
              className={cn('grid h-8 w-8 place-items-center rounded-md transition-colors', tool === t.id ? 'bg-[#0d99ff] text-white' : 'text-zinc-400 hover:bg-white/10 hover:text-white')}
            >
              <t.icon className="h-4 w-4" />
            </button>
          ))}
        </div>
        <span className="hidden text-xs text-zinc-400 sm:block">Marketing site <span className="text-zinc-600">/</span> <span className="text-white">Hero v3</span></span>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1.5">
            {[['M', '#f97316'], ['T', '#10b981'], ['Y', '#0d99ff']].map(([l, c]) => (
              <span key={l} className="grid h-7 w-7 place-items-center rounded-full text-[11px] font-semibold ring-2 ring-zinc-950" style={{ background: c }}>{l}</span>
            ))}
          </div>
          <button aria-label="Present" className="grid h-8 w-8 place-items-center rounded-md text-zinc-400 hover:bg-white/10 hover:text-white"><Play className="h-4 w-4" /></button>
          <button className="h-8 rounded-md bg-[#0d99ff] px-3 text-xs font-medium text-white transition-colors hover:bg-[#0b87e0]">Share</button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <LayersPanel shapes={shapes} selected={selected} onSelect={setSelected} />
        <div className="relative min-w-0 flex-1 overflow-hidden bg-[#f5f5f5]" style={{ backgroundImage: 'radial-gradient(#d4d4d8 1px, transparent 1px)', backgroundSize: '16px 16px' }}>
          <div
            ref={boardRef}
            onPointerDown={onBoardDown}
            onPointerMove={onMove}
            onPointerUp={() => (drag.current = null)}
            className={cn('absolute inset-0 touch-none', tool === 'select' ? 'cursor-default' : 'cursor-crosshair')}
          >
            {shapes.map((s) => {
              const isSel = s.id === selected;
              return (
                <div
                  key={s.id}
                  onPointerDown={(e) => startDrag(e, s, 'move')}
                  className={cn('group absolute', s.fresh && 'animate-scale-in', tool === 'select' && 'cursor-move')}
                  style={{ left: s.x * scale, top: s.y * scale, width: s.w * scale, height: s.h * scale }}
                >
                  {s.kind === 'text' ? (
                    <div className="h-full w-full select-none whitespace-nowrap font-semibold leading-none tracking-tight" style={{ color: s.fill, fontSize: s.h * 0.78 * scale }}>{s.text}</div>
                  ) : (
                    <div
                      className={cn('h-full w-full', s.kind === 'frame' && 'shadow-[0_1px_3px_rgba(0,0,0,0.08),0_10px_30px_-12px_rgba(0,0,0,0.15)]')}
                      style={{ background: s.fill, borderRadius: s.kind === 'ellipse' ? '9999px' : s.radius * scale }}
                    />
                  )}
                  {s.kind === 'frame' && <span className="absolute -top-5 left-0 whitespace-nowrap text-[10px] text-zinc-500">{s.name}</span>}
                  <div className={cn('pointer-events-none absolute -inset-px border-[1.5px] border-[#0d99ff] transition-opacity', isSel ? 'opacity-100' : 'opacity-0 group-hover:opacity-60')} />
                  {isSel && (
                    <>
                      {['-left-1 -top-1', '-right-1 -top-1', '-left-1 -bottom-1'].map((p) => (
                        <span key={p} className={cn('pointer-events-none absolute h-2 w-2 border-[1.5px] border-[#0d99ff] bg-white', p)} />
                      ))}
                      <span onPointerDown={(e) => startDrag(e, s, 'resize')} className="absolute -bottom-1.5 -right-1.5 h-3 w-3 cursor-nwse-resize border-[1.5px] border-[#0d99ff] bg-white" />
                      <span className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded bg-[#0d99ff] px-1.5 py-0.5 font-mono text-[10px] text-white">
                        {Math.round(s.w)} × {Math.round(s.h)}
                      </span>
                    </>
                  )}
                </div>
              );
            })}
            {peers.map((p) => <PeerCursor key={p.name} {...p} scale={scale} />)}
            {generating && (
              <div className="absolute overflow-hidden rounded-2xl border-2 border-dashed border-[#0d99ff]/60 bg-[#0d99ff]/5" style={{ left: 580 * scale, top: 40 * scale, width: 210 * scale, height: 230 * scale }}>
                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-[#0d99ff]/20 to-transparent" />
              </div>
            )}
          </div>

          <form onSubmit={generate} onPointerDown={(e) => e.stopPropagation()} className="absolute bottom-4 left-1/2 z-40 flex w-[min(92%,440px)] -translate-x-1/2 items-center gap-2 rounded-xl border border-zinc-200 bg-white p-1.5 pl-3 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.25)]">
            <Sparkles className={cn('h-4 w-4 shrink-0 text-[#0d99ff]', generating && 'animate-spin-slow')} />
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              aria-label="Describe what to generate"
              placeholder="Describe a component..."
              className="min-w-0 flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
            />
            <button disabled={generating} className="flex h-8 items-center gap-1.5 rounded-lg bg-zinc-950 px-3 text-xs font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-70">
              {generating ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating</> : 'Generate'}
            </button>
          </form>
          <span className="pointer-events-none absolute left-3 top-3 rounded-md bg-white/80 px-2 py-1 font-mono text-[10px] text-zinc-500 ring-1 ring-zinc-200 backdrop-blur">{Math.round(scale * 100)}%</span>
        </div>
        <Inspector shape={current} onChange={(patch) => current && update(current.id, patch)} onDelete={() => current && remove(current.id)} />
      </div>
    </div>
  );
}

