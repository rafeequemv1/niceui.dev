import { useRef, useState, type ReactNode } from 'react';
import { Bold, Copy, Download, Share2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { usePresence } from './hooks';

type Side = 'top' | 'right' | 'bottom' | 'left';

const POS: Record<Side, string> = {
  top: 'bottom-full left-1/2 mb-2.5 -translate-x-1/2 origin-bottom',
  bottom: 'top-full left-1/2 mt-2.5 -translate-x-1/2 origin-top',
  left: 'right-full top-1/2 mr-2.5 -translate-y-1/2 origin-right',
  right: 'left-full top-1/2 ml-2.5 -translate-y-1/2 origin-left',
};

const HIDDEN: Record<Side, string> = {
  top: 'translate-y-1',
  bottom: '-translate-y-1',
  left: 'translate-x-1',
  right: '-translate-x-1',
};

const ARROW: Record<Side, string> = {
  top: 'top-full left-1/2 -translate-x-1/2 -mt-1',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 -mb-1',
  left: 'left-full top-1/2 -translate-y-1/2 -ml-1',
  right: 'right-full top-1/2 -translate-y-1/2 -mr-1',
};

export type TooltipProps = {
  content: ReactNode;
  children: ReactNode;
  side?: Side;
  delay?: number;
  shortcut?: string;
  className?: string;
};

export function Tooltip({ content, children, side = 'top', delay = 250, shortcut, className }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const timer = useRef<number>();
  const { mounted, visible } = usePresence(open, 150);

  const show = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(true), delay);
  };
  const hide = () => {
    window.clearTimeout(timer.current);
    setOpen(false);
  };

  return (
    <span className="relative inline-flex" onPointerEnter={show} onPointerLeave={hide} onFocus={show} onBlur={hide}>
      {children}
      {mounted && (
        <span
          role="tooltip"
          className={cn(
            'pointer-events-none absolute z-50 flex items-center gap-2 whitespace-nowrap rounded-lg bg-ink-800 px-2.5 py-1.5 text-xs font-medium text-ink-50 shadow-pop',
            POS[side],
            visible
              ? 'scale-100 opacity-100 transition-[opacity,transform,translate] duration-300 ease-spring'
              : cn('scale-90 opacity-0 transition-all duration-150 ease-out', HIDDEN[side]),
            className,
          )}
        >
          {content}
          {shortcut && (
            <kbd className="rounded bg-white/10 px-1.5 py-px font-mono text-[10px] font-medium text-ink-300">{shortcut}</kbd>
          )}
          <span className={cn('absolute h-2 w-2 rotate-45 bg-ink-800', ARROW[side])} />
        </span>
      )}
    </span>
  );
}

const btn =
  'focus-ring flex h-10 w-10 items-center justify-center rounded-xl text-ink-300 transition-all hover:bg-white/5 hover:text-ink-50 active:scale-90';

export function TooltipDemo() {
  return (
    <div className="flex flex-col items-center gap-10">
      <div className="flex items-center gap-1 rounded-2xl bg-ink-900 p-1.5 shadow-card">
        <Tooltip content="Bold" shortcut="⌘B">
          <button className={btn} aria-label="Bold"><Bold className="h-4 w-4" /></button>
        </Tooltip>
        <Tooltip content="Duplicate" shortcut="⌘D">
          <button className={btn} aria-label="Duplicate"><Copy className="h-4 w-4" /></button>
        </Tooltip>
        <Tooltip content="Share link" shortcut="⌘L">
          <button className={btn} aria-label="Share"><Share2 className="h-4 w-4" /></button>
        </Tooltip>
        <Tooltip content="Export as PDF">
          <button className={btn} aria-label="Download"><Download className="h-4 w-4" /></button>
        </Tooltip>
        <div className="mx-1 h-5 w-px bg-white/10" />
        <Tooltip content="Move to trash" shortcut="⌫">
          <button className={cn(btn, 'hover:bg-rose-500/10 hover:text-rose-300')} aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
        </Tooltip>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {(['top', 'right', 'bottom', 'left'] as const).map((s) => (
          <Tooltip key={s} content={`Tooltip on ${s}`} side={s} delay={100}>
            <button className="focus-ring rounded-lg bg-ink-850 px-3 py-1.5 text-xs font-medium capitalize text-ink-200 shadow-hairline transition hover:bg-ink-800 hover:text-ink-50 active:scale-95">
              {s}
            </button>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}
