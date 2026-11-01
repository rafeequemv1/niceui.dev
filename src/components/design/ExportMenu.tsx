import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Check, ChevronDown, Code2, Download, FileCode2, FileImage, Image as ImageIcon, Lock, Share2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { LightFrame, focusRing } from './shared';

export type ExportFormat = { id: string; label: string; hint: string; icon: ReactNode; kbd?: string };

const DEFAULT_FORMATS: ExportFormat[] = [
  { id: 'svg', label: 'SVG', hint: 'Vector, editable paths', icon: <FileCode2 className="h-4 w-4" />, kbd: '⌘⇧S' },
  { id: 'png', label: 'PNG @2x', hint: 'Transparent, 2400 × 1600', icon: <ImageIcon className="h-4 w-4" /> },
  { id: 'pdf', label: 'PDF', hint: 'Print ready, CMYK', icon: <FileImage className="h-4 w-4" /> },
  { id: 'react', label: 'React component', hint: 'Copies TSX to clipboard', icon: <Code2 className="h-4 w-4" />, kbd: '⌘⇧C' },
];

/** A dark pill trigger that opens a light popover of export targets, with simulated progress per row. */
export function ExportMenu({ formats = DEFAULT_FORMATS, label = 'Export' }: { formats?: ExportFormat[]; label?: string }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    window.addEventListener('pointerdown', close);
    requestAnimationFrame(() => items.current[0]?.focus());
    return () => window.removeEventListener('pointerdown', close);
  }, [open]);

  useEffect(() => {
    if (!busy) return;
    let p = 0;
    const t = setInterval(() => {
      p = Math.min(100, p + 7 + Math.random() * 12);
      setProgress(p);
      if (p >= 100) {
        clearInterval(t);
        setDone(busy);
        setBusy(null);
        setTimeout(() => setDone(null), 1600);
      }
    }, 90);
    return () => clearInterval(t);
  }, [busy]);

  return (
    <div ref={ref} className="relative inline-block" onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn('flex h-9 items-center gap-2 rounded-full bg-zinc-900 pl-4 pr-3 text-[13px] font-medium text-white shadow-[0_1px_0_rgba(255,255,255,0.15)_inset,0_6px_16px_-6px_rgba(0,0,0,0.5)] transition-colors hover:bg-zinc-800', focusRing)}
      >
        {busy ? `Exporting ${Math.round(progress)}%` : done ? 'Saved' : label}
        {done ? <Check className="h-3.5 w-3.5" /> : <ChevronDown className={cn('h-3.5 w-3.5 opacity-70 transition-transform', open && 'rotate-180')} />}
      </button>
      {open && (
        <div
          role="menu"
          onKeyDown={(e) => {
            const i = items.current.findIndex((el) => el === document.activeElement);
            if (e.key === 'ArrowDown') (e.preventDefault(), items.current[(i + 1) % formats.length]?.focus());
            if (e.key === 'ArrowUp') (e.preventDefault(), items.current[(i - 1 + formats.length) % formats.length]?.focus());
          }}
          className="absolute right-0 top-[calc(100%+8px)] z-30 w-[min(300px,calc(100vw-48px))] rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-[0_24px_48px_-16px_rgba(0,0,0,0.25)] animate-scale-in"
          style={{ transformOrigin: 'top right' }}
        >
          <p className="px-2.5 pb-1 pt-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-400">Export selection</p>
          {formats.map((f, i) => {
            const running = busy === f.id;
            return (
              <button
                key={f.id}
                ref={(el) => (items.current[i] = el)}
                role="menuitem"
                disabled={!!busy}
                onClick={() => (setProgress(0), setBusy(f.id))}
                className="relative flex w-full items-center gap-3 overflow-hidden rounded-xl px-2 py-2 text-left outline-none transition-colors hover:bg-zinc-100 focus-visible:bg-zinc-100 disabled:cursor-progress"
              >
                {running && <span className="absolute inset-y-0 left-0 bg-zinc-100 transition-[width] duration-100" style={{ width: `${progress}%` }} />}
                <span className="relative grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-zinc-100 text-zinc-700 ring-1 ring-inset ring-zinc-200">{f.icon}</span>
                <span className="relative min-w-0 flex-1">
                  <span className="block text-[13px] font-medium text-zinc-900">{f.label}</span>
                  <span className="block truncate text-[12px] text-zinc-500">{running ? `${Math.round(progress)}% · preparing file` : f.hint}</span>
                </span>
                <span className="relative shrink-0">
                  {done === f.id ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : f.kbd ? (
                    <kbd className="rounded-md bg-zinc-100 px-1.5 py-0.5 font-sans text-[11px] text-zinc-500 ring-1 ring-inset ring-zinc-200">{f.kbd}</kbd>
                  ) : (
                    <Download className="h-3.5 w-3.5 text-zinc-400" />
                  )}
                </span>
              </button>
            );
          })}
          <div className="mt-1 flex items-center gap-2 border-t border-zinc-100 px-2.5 pb-1 pt-2.5 text-[11.5px] text-zinc-500">
            <Lock className="h-3 w-3 shrink-0" /> Files are made on your device. Nothing is uploaded.
          </div>
        </div>
      )}
    </div>
  );
}

export function ExportMenuDemo() {
  return (
    <LightFrame className="mx-auto max-w-[460px]">
      <div className="flex min-h-[340px] flex-col">
        <div className="flex items-center justify-between gap-2 rounded-2xl border border-zinc-200/80 bg-white px-3 py-2 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-zinc-900">Poster draft</p>
            <p className="text-[12px] text-zinc-500">Saved just now</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button aria-label="Share" className={cn('grid h-9 w-9 place-items-center rounded-full text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900', focusRing)}>
              <Share2 className="h-4 w-4" />
            </button>
            <ExportMenu />
          </div>
        </div>
        <p className="mt-auto pt-6 text-center text-[12px] text-zinc-500">Open the menu with Enter. ↑ ↓ to move, Esc to close.</p>
      </div>
    </LightFrame>
  );
}
