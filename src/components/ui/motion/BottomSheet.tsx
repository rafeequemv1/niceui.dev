import { useCallback, useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { Clock, MapPin, Star } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Portal, useEscape } from './hooks';

export type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  /** Visible fractions of the viewport height, ascending. */
  snapPoints?: number[];
  children: ReactNode;
};

export function BottomSheet({ open, onClose, snapPoints = [0.45, 0.88], children }: BottomSheetProps) {
  const [mounted, setMounted] = useState(open);
  const [vh, setVh] = useState(() => window.innerHeight);
  const [offset, setOffset] = useState(vh); // translateY in px
  const [dragging, setDragging] = useState(false);
  const drag = useRef({ startY: 0, startOffset: 0, lastY: 0, lastT: 0, v: 0 });
  const maxH = Math.max(...snapPoints) * vh;
  const snapOffsets = snapPoints.map((s) => maxH - s * vh);

  useEffect(() => {
    const onResize = () => setVh(window.innerHeight);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setOffset(maxH);
      const id = requestAnimationFrame(() => requestAnimationFrame(() => setOffset(snapOffsets[0])));
      return () => cancelAnimationFrame(id);
    }
    setOffset(maxH);
    const t = window.setTimeout(() => setMounted(false), 450);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const dismiss = useCallback(() => onClose(), [onClose]);
  useEscape(open, dismiss);

  const onDown = (e: PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { startY: e.clientY, startOffset: offset, lastY: e.clientY, lastT: performance.now(), v: 0 };
    setDragging(true);
  };
  const onMove = (e: PointerEvent) => {
    if (!dragging) return;
    const d = drag.current;
    const now = performance.now();
    d.v = (e.clientY - d.lastY) / Math.max(1, now - d.lastT);
    d.lastY = e.clientY;
    d.lastT = now;
    let next = d.startOffset + (e.clientY - d.startY);
    if (next < 0) next = next * 0.25; // rubber-band past the top snap
    setOffset(next);
  };
  const onUp = () => {
    if (!dragging) return;
    setDragging(false);
    const { v } = drag.current;
    const projected = offset + v * 180;
    if (v > 1.1 || projected > maxH - snapPoints[0] * vh * 0.5) return onClose();
    const nearest = snapOffsets.reduce((a, b) => (Math.abs(b - projected) < Math.abs(a - projected) ? b : a));
    setOffset(nearest);
  };

  if (!mounted) return null;
  const progress = Math.min(1, Math.max(0, 1 - offset / maxH));

  return (
    <Portal>
    <div className="fixed inset-0 z-[100]">
      <div onClick={onClose} className="absolute inset-0 bg-ink-950/60 backdrop-blur-[2px]" style={{ opacity: progress, transition: dragging ? 'none' : 'opacity 450ms' }} />
      <div
        role="dialog"
        aria-modal
        className="absolute inset-x-0 bottom-0 mx-auto flex max-w-lg flex-col rounded-t-[28px] bg-ink-900 shadow-pop"
        style={{
          height: maxH,
          transform: `translateY(${offset}px)`,
          transition: dragging ? 'none' : 'transform 450ms cubic-bezier(0.32, 0.72, 0, 1)',
        }}
      >
        <div
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          className={cn('flex shrink-0 touch-none justify-center pb-2 pt-3', dragging ? 'cursor-grabbing' : 'cursor-grab')}
        >
          <span className={cn('h-1.5 rounded-full bg-ink-600 transition-all duration-300', dragging ? 'w-14 bg-ink-400' : 'w-10')} />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6">{children}</div>
      </div>
    </div>
    </Portal>
  );
}

const STOPS = [
  { time: '08:12', name: 'Alexanderplatz', note: 'Platform 3 · U2 towards Ruhleben' },
  { time: '08:19', name: 'Potsdamer Platz', note: 'Change to S1 · 2 min walk' },
  { time: '08:27', name: 'Yorckstraße', note: 'Exit north · 4 min walk' },
  { time: '08:31', name: 'Nice HQ', note: 'Großbeerenstraße 2' },
];

export function BottomSheetDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={() => setOpen(true)}
        className="focus-ring rounded-xl bg-ink-50 px-4 py-2 text-sm font-medium text-ink-950 transition hover:bg-white active:scale-[0.97]"
      >
        View route details
      </button>
      <p className="text-xs text-ink-500">Drag the handle up to expand, flick down to dismiss.</p>
      <BottomSheet open={open} onClose={() => setOpen(false)}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-medium text-ink-50">Route to Nice HQ</h3>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-ink-400"><Clock className="h-3.5 w-3.5" /> 19 min · arrives 08:31</p>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-300"><Star className="h-3 w-3" /> Fastest</span>
        </div>
        <ol className="relative mt-6 space-y-5 before:absolute before:bottom-2 before:left-[7px] before:top-2 before:w-px before:bg-white/10">
          {STOPS.map((s, i) => (
            <li key={s.name} style={{ animationDelay: `${120 + i * 70}ms` }} className="relative flex animate-fade-up gap-4">
              <span className={cn('relative z-10 mt-1 h-[15px] w-[15px] rounded-full border-2 border-ink-900', i === STOPS.length - 1 ? 'bg-brand-400' : 'bg-ink-600')} />
              <div className="flex-1">
                <div className="flex items-baseline justify-between">
                  <p className="text-sm font-medium text-ink-100">{s.name}</p>
                  <span className="font-mono text-xs text-ink-400">{s.time}</span>
                </div>
                <p className="mt-0.5 text-xs text-ink-400">{s.note}</p>
              </div>
            </li>
          ))}
        </ol>
        <button className="focus-ring mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 text-sm font-medium text-white transition hover:bg-brand-400 active:scale-[0.98]">
          <MapPin className="h-4 w-4" /> Start navigation
        </button>
      </BottomSheet>
    </div>
  );
}
