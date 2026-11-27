import { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState, type PointerEvent as RPointerEvent, type TextareaHTMLAttributes } from 'react';
import { ArrowUp, GripHorizontal } from 'lucide-react';
import { cn } from '@/lib/cn';

export type AutoResizeTextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> & {
  value: string;
  onChange: (value: string) => void;
  /** Rows shown when empty. */
  minRows?: number;
  /** Rows before it starts scrolling. */
  maxRows?: number;
  /** Shows a counter and turns it amber near the limit. */
  maxLength?: number;
  label?: string;
};

/**
 * A resizable textarea that grows with its content between `minRows` and `maxRows`,
 * with an optional character counter. No scrollbar until it reaches the cap.
 */
export const AutoResizeTextarea = forwardRef<HTMLTextAreaElement, AutoResizeTextareaProps>(function AutoResizeTextarea(
  { value, onChange, minRows = 2, maxRows = 8, maxLength, label, className, id, ...rest },
  ref,
) {
  const el = useRef<HTMLTextAreaElement>(null);
  useImperativeHandle(ref, () => el.current as HTMLTextAreaElement);

  const fit = useCallback(() => {
    const t = el.current;
    if (!t) return;
    const cs = getComputedStyle(t);
    const line = parseFloat(cs.lineHeight) || 20;
    const pad = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom) + parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth);
    t.style.height = 'auto';
    const min = line * minRows + pad;
    const max = line * maxRows + pad;
    const h = Math.min(max, Math.max(min, t.scrollHeight + parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth)));
    t.style.height = `${h}px`;
    t.style.overflowY = t.scrollHeight + 2 > max ? 'auto' : 'hidden';
  }, [minRows, maxRows]);

  useLayoutEffect(fit, [value, fit]);
  useEffect(() => {
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [fit]);

  const near = maxLength ? value.length / maxLength : 0;
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label htmlFor={id} className="mb-2 block text-[13px] font-medium text-ink-200">
          {label}
        </label>
      )}
      <div className="relative">
        <textarea
          ref={el}
          id={id}
          value={value}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
          rows={minRows}
          className="block w-full resize-none rounded-xl border border-white/10 bg-ink-900/70 px-4 py-3 text-[14px] leading-6 text-ink-50 placeholder:text-ink-500 transition-[border-color,box-shadow,height] duration-200 focus:border-brand-400/60 focus:outline-none focus:ring-4 focus:ring-brand-400/10 motion-reduce:transition-none"
          {...rest}
        />
      </div>
      {maxLength && (
        <p className={cn('mt-1.5 text-right font-mono text-[11px] tabular-nums transition-colors', near >= 1 ? 'text-rose-400' : near > 0.85 ? 'text-amber-300' : 'text-ink-500')} aria-live="polite">
          {value.length} / {maxLength}
        </p>
      )}
    </div>
  );
});

export type ResizableTextareaProps = {
  value: string;
  onChange: (value: string) => void;
  /** Starting, minimum and maximum height in px. */
  height?: number;
  minHeight?: number;
  maxHeight?: number;
  placeholder?: string;
  label?: string;
  className?: string;
};

/**
 * A textarea with a custom drag handle (pointer or arrow keys) instead of the
 * browser's corner grip. Double-click the handle to reset the height.
 */
export function ResizableTextarea({ value, onChange, height = 140, minHeight = 88, maxHeight = 420, placeholder, label = 'Notes', className }: ResizableTextareaProps) {
  const [h, setH] = useState(height);
  const [drag, setDrag] = useState(false);
  const start = useRef({ y: 0, h: 0 });
  const clamp = (v: number) => Math.min(maxHeight, Math.max(minHeight, v));

  const down = (e: RPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = { y: e.clientY, h };
    setDrag(true);
  };
  const move = (e: RPointerEvent<HTMLDivElement>) => {
    if (drag) setH(clamp(start.current.h + e.clientY - start.current.y));
  };

  return (
    <div className={cn('w-full overflow-hidden rounded-xl border border-white/10 bg-ink-900/70 transition-colors focus-within:border-brand-400/60', drag && 'border-brand-400/60', className)}>
      <textarea
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ height: h }}
        className="block w-full resize-none bg-transparent px-4 py-3 text-[14px] leading-6 text-ink-50 placeholder:text-ink-500 focus:outline-none"
      />
      <div
        role="separator"
        aria-orientation="horizontal"
        aria-label="Resize notes"
        aria-valuemin={minHeight}
        aria-valuemax={maxHeight}
        aria-valuenow={Math.round(h)}
        tabIndex={0}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={() => setDrag(false)}
        onPointerCancel={() => setDrag(false)}
        onDoubleClick={() => setH(height)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            setH((v) => clamp(v + (e.key === 'ArrowDown' ? 1 : -1) * (e.shiftKey ? 40 : 12)));
          }
          if (e.key === 'Enter') setH(height);
        }}
        className={cn('flex h-5 cursor-row-resize touch-none items-center justify-center border-t border-white/[.06] text-ink-500 outline-none transition-colors hover:bg-white/[.03] hover:text-ink-200 focus-visible:bg-brand-400/10 focus-visible:text-brand-300', drag && 'bg-brand-400/10 text-brand-300')}
      >
        <GripHorizontal className="h-3.5 w-3.5" />
      </div>
    </div>
  );
}

export function AutoResizeTextareaDemo() {
  const [msg, setMsg] = useState('');
  const [bio, setBio] = useState('Designer turned engineer. I like calm interfaces, long walks and short meetings.');
  const [notes, setNotes] = useState('Drag the handle below, or focus it and use the arrow keys.\nDouble-click it to reset.');
  const [sent, setSent] = useState<string[]>([]);
  return (
    <div className="grid w-full max-w-2xl gap-6 md:grid-cols-2">
      <div className="flex flex-col gap-3 md:col-span-2">
        {sent.length > 0 && (
          <div className="flex flex-col items-end gap-1.5">
            {sent.slice(-2).map((s, i) => (
              <p key={i} className="max-w-[80%] animate-fade-up whitespace-pre-wrap rounded-2xl rounded-br-md bg-brand-500 px-3.5 py-2 text-[13px] text-ink-950">
                {s}
              </p>
            ))}
          </div>
        )}
        <form
          className="relative"
          onSubmit={(e) => {
            e.preventDefault();
            if (!msg.trim()) return;
            setSent((s) => [...s, msg.trim()]);
            setMsg('');
          }}
        >
          <AutoResizeTextarea
            value={msg}
            onChange={setMsg}
            minRows={1}
            maxRows={6}
            placeholder="Write a message… (Shift+Enter for a new line)"
            aria-label="Message"
            className="[&_textarea]:pr-14"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                (e.currentTarget.form as HTMLFormElement | null)?.requestSubmit();
              }
            }}
          />
          <button type="submit" aria-label="Send" disabled={!msg.trim()} className="absolute bottom-2 right-2 grid h-8 w-8 place-items-center rounded-lg bg-brand-400 text-ink-950 transition-opacity disabled:opacity-30">
            <ArrowUp className="h-4 w-4" />
          </button>
        </form>
      </div>
      <AutoResizeTextarea id="bio" label="Bio" value={bio} onChange={setBio} minRows={3} maxRows={7} maxLength={160} />
      <div>
        <p className="mb-2 text-[13px] font-medium text-ink-200">Notes</p>
        <ResizableTextarea value={notes} onChange={setNotes} />
      </div>
    </div>
  );
}
