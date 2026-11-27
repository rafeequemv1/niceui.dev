import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import { cn } from '@/lib/cn';
import { artwork } from '@/components/gallery/art';

export type Chapter = { start: number; title: string };

export type VideoScrubberProps = {
  /** Total length in seconds. */
  duration: number;
  /** Current time in seconds. */
  time: number;
  onSeek: (t: number) => void;
  chapters?: Chapter[];
  /** Seconds buffered so far. */
  buffered?: number;
  /** Returns a preview image URL for a given time (shown on hover). */
  preview?: (t: number) => string;
  className?: string;
};

const fmtTime = (s: number) => {
  const t = Math.max(0, Math.floor(s));
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const sec = String(t % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`;
};

/** A video scrubber timeline with chapters, hover preview, buffered range and keyboard seeking. */
export function VideoScrubber({ duration, time, onSeek, chapters = [], buffered = 0, preview, className }: VideoScrubberProps) {
  const bar = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [drag, setDrag] = useState(false);
  const [barW, setBarW] = useState(0);

  useEffect(() => {
    const el = bar.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBarW(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const tAt = useCallback(
    (clientX: number) => {
      const r = bar.current!.getBoundingClientRect();
      return Math.max(0, Math.min(1, (clientX - r.left) / r.width)) * duration;
    },
    [duration],
  );

  const segs = useMemo(() => {
    const list = chapters.length ? [...chapters].sort((a, b) => a.start - b.start) : [{ start: 0, title: '' }];
    return list.map((c, i) => ({ ...c, end: list[i + 1]?.start ?? duration }));
  }, [chapters, duration]);
  const chapterAt = (t: number) => segs.find((s) => t >= s.start && t < s.end) ?? segs[segs.length - 1];

  const shown = hover ?? (drag ? time : null);
  const tipX = shown === null ? 0 : Math.max(64, Math.min(barW - 64, (shown / duration) * barW));
  const now = chapterAt(time);

  return (
    <div className={cn('w-full select-none', className)}>
      <div className="relative">
        {shown !== null && (
          <div className="pointer-events-none absolute bottom-full mb-3 -translate-x-1/2" style={{ left: tipX }}>
            <div className="w-32 overflow-hidden rounded-lg border border-white/10 bg-ink-900 shadow-pop">
              {preview && <img src={preview(shown)} alt="" className="aspect-video w-full object-cover" />}
              <div className="px-2 py-1.5">
                <p className="truncate text-[11px] font-medium text-ink-100">{chapterAt(shown).title || 'Preview'}</p>
                <p className="font-mono text-[10px] tabular-nums text-brand-300">{fmtTime(shown)}</p>
              </div>
            </div>
          </div>
        )}
        <div
          ref={bar}
          role="slider"
          tabIndex={0}
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          aria-valuenow={Math.round(time)}
          aria-valuetext={`${fmtTime(time)} of ${fmtTime(duration)}${now.title ? `, ${now.title}` : ''}`}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            setDrag(true);
            onSeek(tAt(e.clientX));
          }}
          onPointerMove={(e) => {
            const t = tAt(e.clientX);
            if (e.pointerType === 'mouse') setHover(t);
            if (drag) onSeek(t);
          }}
          onPointerUp={() => setDrag(false)}
          onPointerCancel={() => setDrag(false)}
          onPointerLeave={() => setHover(null)}
          onKeyDown={(e) => {
            const step = e.shiftKey ? 10 : 5;
            const map: Record<string, number> = { ArrowRight: time + step, ArrowLeft: time - step, Home: 0, End: duration, PageUp: time + 30, PageDown: time - 30 };
            if (e.key in map) {
              e.preventDefault();
              onSeek(Math.max(0, Math.min(duration, map[e.key])));
            }
          }}
          className="focus-ring group relative flex h-6 cursor-pointer items-center gap-[3px] rounded-md"
        >
          {segs.map((s) => {
            const w = ((s.end - s.start) / duration) * 100;
            const played = Math.max(0, Math.min(1, (time - s.start) / (s.end - s.start)));
            const buf = Math.max(0, Math.min(1, (buffered - s.start) / (s.end - s.start)));
            const hot = shown !== null && shown >= s.start && shown < s.end;
            return (
              <div key={s.start} className={cn('relative h-1.5 overflow-hidden rounded-full bg-white/10 transition-[height] duration-200 group-hover:h-2.5', hot && 'h-2.5')} style={{ width: `${w}%` }}>
                <div className="absolute inset-y-0 left-0 bg-white/20" style={{ width: `${buf * 100}%` }} />
                {hover !== null && hot && <div className="absolute inset-y-0 left-0 bg-white/25" style={{ width: `${Math.max(0, Math.min(1, (hover - s.start) / (s.end - s.start))) * 100}%` }} />}
                <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand-400 to-brand-300" style={{ width: `${played * 100}%` }} />
              </div>
            );
          })}
          <div
            aria-hidden
            className={cn('pointer-events-none absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_0_4px_rgba(125,211,252,0.25)] transition-transform duration-200', drag ? 'scale-125' : 'scale-0 group-hover:scale-100 group-focus-visible:scale-100')}
            style={{ left: `${(time / duration) * 100}%` }}
          />
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between gap-3 text-[11px] text-ink-400">
        <span className="font-mono tabular-nums text-ink-200">
          {fmtTime(time)} <span className="text-ink-500">/ {fmtTime(duration)}</span>
        </span>
        {now.title && <span className="truncate text-ink-300">{now.title}</span>}
      </div>
    </div>
  );
}

const CHAPTERS: Chapter[] = [
  { start: 0, title: 'Cold open' },
  { start: 48, title: 'The coastline' },
  { start: 131, title: 'Building the studio' },
  { start: 205, title: 'Night edits' },
  { start: 262, title: 'What comes next' },
];

export function VideoScrubberDemo() {
  const duration = 318;
  const [time, setTime] = useState(52);
  const [playing, setPlaying] = useState(true);
  const [buffered, setBuffered] = useState(90);
  const frames = useRef(new Map<number, string>());

  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setTime((t) => (t + dt * 4 >= duration ? 0 : t + dt * 4));
      setBuffered((b) => Math.min(duration, b + dt * 9));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const preview = useCallback((t: number) => {
    const idx = CHAPTERS.findIndex((c, i) => t >= c.start && t < (CHAPTERS[i + 1]?.start ?? duration));
    const key = Math.max(0, idx);
    if (!frames.current.has(key)) frames.current.set(key, artwork([0, 2, 5, 7, 11][key % 5], 256, 144, key % 2 ? 'mesh' : 'landscape'));
    return frames.current.get(key)!;
  }, []);

  const current = CHAPTERS.reduce((acc, c, i) => (time >= c.start ? i : acc), 0);
  const jump = (dir: 1 | -1) => setTime(CHAPTERS[Math.max(0, Math.min(CHAPTERS.length - 1, current + dir))].start);

  return (
    <div className="w-full max-w-2xl">
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-ink-900 shadow-card">
        <img src={preview(time)} alt="" className="h-full w-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4 pt-16 sm:p-5">
          <VideoScrubber duration={duration} time={time} onSeek={setTime} chapters={CHAPTERS} buffered={buffered} preview={preview} />
          <div className="mt-2 flex items-center gap-1.5">
            <button type="button" onClick={() => jump(-1)} aria-label="Previous chapter" className="focus-ring grid h-9 w-9 place-items-center rounded-full text-ink-200 hover:bg-white/10">
              <SkipBack className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => setPlaying((p) => !p)} aria-label={playing ? 'Pause' : 'Play'} className="focus-ring grid h-10 w-10 place-items-center rounded-full bg-white text-ink-950 transition-transform active:scale-90">
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 translate-x-px" />}
            </button>
            <button type="button" onClick={() => jump(1)} aria-label="Next chapter" className="focus-ring grid h-9 w-9 place-items-center rounded-full text-ink-200 hover:bg-white/10">
              <SkipForward className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      <ol className="mt-4 grid gap-1 sm:grid-cols-2">
        {CHAPTERS.map((c, i) => (
          <li key={c.start}>
            <button
              type="button"
              onClick={() => setTime(c.start)}
              aria-current={i === current ? 'true' : undefined}
              className={cn('focus-ring flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-xs transition-colors', i === current ? 'bg-brand-500/10 text-ink-50' : 'text-ink-400 hover:bg-white/5 hover:text-ink-200')}
            >
              <span className="w-10 font-mono tabular-nums text-brand-300">{fmtTime(c.start)}</span>
              <span className="truncate">{c.title}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
