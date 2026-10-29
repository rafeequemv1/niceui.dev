import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent, type RefObject } from 'react';
import { Check, ChevronDown, Download, Film, Maximize2, Pause, Play, SkipBack, Sparkles, Volume2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { DitherCanvas, PAPER, SCREEN, scenes, type Field, type SceneId } from './dither';
import { BROLL, GROUPS, PIECES, SHOTS, createClock, layout, pieceAt, useClock, type Clock, type Layout } from './editorModel';
import { CMDS, CmdChip, DirectorPanel, ORDER, ScriptPanel, Timeline, matchCommand, type CmdId, type Msg } from './EditorPanels';
import { tc } from './ui';

type Aspect = '16:9' | '9:16' | '1:1';
const RATIO: Record<Aspect, number> = { '16:9': 16 / 9, '9:16': 9 / 16, '1:1': 1 };
const SRC = 16 / 9;
const FOCUS: Record<SceneId, number> = { portrait: 0.57, coast: 0.62, city: 0.36, peaks: 0.3, reel: 0.5 };
const INTRO: Msg[] = [{ id: 1, role: 'ai', text: 'I watched all 5 takes. It’s a strong story with a few ums and long pauses. Want me to tighten it?' }];

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

function useVisible(ref: RefObject<Element>) {
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setV(e.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return v;
}

/** What's on screen at time t: the shot, or generated B-roll laid over it. */
function sceneAt(lay: Layout, broll: boolean, t: number) {
  const i = pieceAt(lay, t);
  if (broll) for (const b of BROLL) if (t >= lay.start[b.from] && t < lay.start[b.to] + lay.dur[b.to]) return { scene: b.scene, label: `GEN · ${b.prompt}`, ai: true };
  const s = SHOTS[PIECES[i].shot];
  return { scene: s.scene, label: `${s.clip} · ${s.label}`, ai: false };
}

export function Editor() {
  const clock = useMemo(createClock, []);
  const root = useRef<HTMLDivElement>(null);
  const visible = useVisible(root);
  const [playing, setPlaying] = useState(false);
  const [cut, setCut] = useState(false);
  const [captions, setCaptions] = useState(false);
  const [aspect, setAspect] = useState<Aspect>('16:9');
  const [broll, setBroll] = useState(false);
  const [studio, setStudio] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>(INTRO);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState('');
  const [pulse, setPulse] = useState<CmdId | null>(null);

  const lay = useMemo(() => layout(cut), [cut]);
  const applied: Record<CmdId, boolean> = { cut, captions, reframe: aspect === '9:16', broll, studio };
  const live = useRef({ lay, broll, applied, busy, playing });
  live.current = { lay, broll, applied, busy, playing };

  const timers = useRef<number[]>([]);
  const later = (ms: number, f: () => void) => void timers.current.push(window.setTimeout(f, ms));
  const touched = useRef(false);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // Playback: advance the shared clock; loop at the end of the cut.
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.max(0, Math.min(0.1, (now - last) / 1000));
      last = now;
      const t = clock.get() + dt;
      clock.set(t >= live.current.lay.total ? 0 : t);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, clock]);

  // Pause off-screen, resume when back.
  const resume = useRef(false);
  useEffect(() => {
    if (!visible) {
      resume.current = live.current.playing;
      setPlaying(false);
    } else if (resume.current) setPlaying(true);
  }, [visible]);

  const apply = (id: CmdId) => {
    if (id === 'cut') {
      const old = live.current.lay;
      const next = layout(true);
      const i = pieceAt(old, clock.get());
      clock.set(next.start[i] + Math.min(clock.get() - old.start[i], next.dur[i]));
      setCut(true);
    }
    if (id === 'captions') setCaptions(true);
    if (id === 'reframe') setAspect('9:16');
    if (id === 'broll') setBroll(true);
    if (id === 'studio') setStudio(true);
    setPulse(id);
    later(1400, () => setPulse(null));
  };

  const run = (id: CmdId, text?: string) => {
    if (live.current.busy) return;
    const c = CMDS[id];
    const uid = Date.now();
    if (live.current.applied[id]) {
      setMsgs((m) => [...m, { id: uid, role: 'user', text: text ?? c.prompt }, { id: uid + 1, role: 'ai', text: 'Already done. Try another one, or hit Reset.' }]);
      return;
    }
    live.current.busy = true;
    setBusy(true);
    setMsgs((m) => [...m, { id: uid, role: 'user', text: text ?? c.prompt }, { id: uid + 1, role: 'ai', steps: c.steps.map((label) => ({ label, done: false })) }]);
    c.steps.forEach((_, i) =>
      later(560 * (i + 1), () => setMsgs((m) => m.map((x) => (x.id === uid + 1 ? { ...x, steps: x.steps!.map((s, j) => (j <= i ? { ...s, done: true } : s)) } : x)))),
    );
    later(560 * c.steps.length + 280, () => {
      apply(id);
      setMsgs((m) => m.map((x) => (x.id === uid + 1 ? { ...x, text: c.done } : x)));
      live.current.busy = false;
      setBusy(false);
    });
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || busy) return;
    setDraft('');
    const id = matchCommand(text);
    if (id) run(id, text);
    else {
      const uid = Date.now();
      setMsgs((m) => [...m, { id: uid, role: 'user', text }, { id: uid + 1, role: 'ai', text: 'This preview knows five moves: cut fillers, captions, vertical reframe, B-roll and Studio Sound. Try one.' }]);
    }
  };

  const reset = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    touched.current = true;
    live.current.busy = false;
    setBusy(false);
    setCut(false);
    setCaptions(false);
    setAspect('16:9');
    setBroll(false);
    setStudio(false);
    setMsgs(INTRO);
    setDraft('');
    clock.set(0);
  };

  // Attract mode: play, then type two commands — until the visitor takes over.
  const started = useRef(false);
  useEffect(() => {
    if (!visible || started.current) return;
    started.current = true;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const type = (text: string, id: CmdId, then?: () => void) => {
      [...text].forEach((_, i) => later(34 * i, () => !touched.current && setDraft(text.slice(0, i + 1))));
      later(34 * text.length + 420, () => {
        if (touched.current) return;
        setDraft('');
        run(id, text);
        if (then) later(560 * CMDS[id].steps.length + 2600, then);
      });
    };
    later(700, () => !touched.current && setPlaying(true));
    later(2400, () => !touched.current && type(CMDS.cut.prompt, 'cut', () => !touched.current && type(CMDS.captions.prompt, 'captions')));
  }, [visible]);

  const takeOver = () => {
    if (touched.current) return;
    touched.current = true;
    if (!live.current.busy) setDraft('');
  };

  const seek = (t: number) => clock.set(t);

  return (
    <div ref={root} onPointerDownCapture={takeOver} onKeyDownCapture={takeOver} className="relative overflow-hidden rounded-[22px] border border-zinc-200 bg-white text-left shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_50px_100px_-40px_rgba(24,24,27,0.35),0_20px_40px_-24px_rgba(24,24,27,0.25)]">
      <TitleBar />
      <div className="grid lg:h-[380px] lg:grid-cols-[236px_minmax(0,1fr)_288px]">
        <div className="hidden min-h-0 lg:flex">
          <div className="flex min-h-0 w-full flex-col">
            <ScriptPanel clock={clock} lay={lay} cut={cut} broll={broll} onSeek={seek} />
          </div>
        </div>
        <Viewer clock={clock} lay={lay} broll={broll} captions={captions} aspect={aspect} setAspect={setAspect} playing={playing} setPlaying={setPlaying} />
        <div className="hidden min-h-0 lg:flex">
          <div className="flex min-h-0 w-full flex-col">
            <DirectorPanel msgs={msgs} busy={busy} applied={applied} draft={draft} setDraft={setDraft} onRun={(id) => run(id)} onSubmit={submit} onReset={reset} />
          </div>
        </div>
      </div>
      <MobileDirector msgs={msgs} busy={busy} applied={applied} onRun={(id) => run(id)} onReset={reset} />
      <Timeline clock={clock} lay={lay} cut={cut} captions={captions} broll={broll} studio={studio} pulse={pulse} onSeek={seek} />
    </div>
  );
}

function TitleBar() {
  const [exp, setExp] = useState<'idle' | 'run' | 'done'>('idle');
  const [pct, setPct] = useState(0);
  useEffect(() => {
    if (exp !== 'run') return;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = clamp01((now - t0) / 2400);
      setPct(p);
      if (p < 1) raf = requestAnimationFrame(tick);
      else setExp('done');
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [exp]);
  useEffect(() => {
    if (exp !== 'done') return;
    const id = window.setTimeout(() => setExp('idle'), 3200);
    return () => clearTimeout(id);
  }, [exp]);

  return (
    <div className="relative flex h-11 items-center gap-3 border-b border-zinc-200/80 bg-zinc-50/80 px-3.5">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-[11px] w-[11px] rounded-full bg-zinc-200 ring-1 ring-inset ring-black/5" />
        ))}
      </div>
      <div className="flex min-w-0 items-center gap-1.5 text-[12.5px] text-zinc-500">
        <Film className="h-3.5 w-3.5 shrink-0" />
        <span className="hidden sm:inline">Maya Ocampo</span>
        <span className="hidden text-zinc-300 sm:inline">/</span>
        <span className="truncate font-medium text-zinc-900">Coastline<span className="hidden sm:inline"> · launch film</span></span>
        <ChevronDown className="h-3 w-3 shrink-0" />
      </div>
      <span className="hidden items-center gap-1 rounded-full bg-emerald-50 px-2 py-px text-[10.5px] font-medium text-emerald-700 md:flex">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Saved
      </span>
      <div className="ml-auto flex items-center gap-2">
        <div className="hidden -space-x-1.5 sm:flex">
          {[
            ['MO', '#18181b'],
            ['LK', '#ff4f1f'],
            ['JS', '#a1a1aa'],
          ].map(([n, c]) => (
            <span key={n} className="grid h-6 w-6 place-items-center rounded-full text-[9px] font-semibold text-white ring-2 ring-zinc-50" style={{ background: c }}>
              {n}
            </span>
          ))}
        </div>
        <button className="hidden h-7 items-center rounded-lg px-2.5 text-[12px] font-medium text-zinc-700 ring-1 ring-zinc-200 transition-colors hover:bg-white sm:flex">Share</button>
        <button onClick={() => exp === 'idle' && setExp('run')} className="flex h-7 items-center gap-1.5 rounded-lg bg-zinc-950 px-2.5 text-[12px] font-medium text-white transition-all hover:bg-zinc-800 active:scale-95">
          <Download className="h-3 w-3" /> Export
        </button>
      </div>
      {exp !== 'idle' && (
        <div className="absolute right-3 top-[calc(100%+8px)] z-30 w-60 rounded-xl border border-zinc-200 bg-white p-3 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.25)] animate-scale-in">
          <div className="flex items-center justify-between text-[12px] font-medium text-zinc-900">
            {exp === 'run' ? 'Exporting 4K · H.265' : 'Ready to publish'}
            {exp === 'done' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <span className="font-mono text-[11px] text-zinc-500">{Math.round(pct * 100)}%</span>}
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-zinc-100">
            <div className="h-full rounded-full bg-[#ff4f1f]" style={{ width: `${pct * 100}%` }} />
          </div>
          <p className="mt-2 font-mono text-[10.5px] text-zinc-500">{exp === 'done' ? 'coastline-launch.mp4 · 38.2 MB' : 'Rendering on 4 GPUs…'}</p>
        </div>
      )}
    </div>
  );
}

function Viewer({ clock, lay, broll, captions, aspect, setAspect, playing, setPlaying }: {
  clock: Clock;
  lay: Layout;
  broll: boolean;
  captions: boolean;
  aspect: Aspect;
  setAspect: (a: Aspect) => void;
  playing: boolean;
  setPlaying: (p: boolean | ((p: boolean) => boolean)) => void;
}) {
  const view = useRef({ lay, broll });
  view.current = { lay, broll };
  const field = useMemo<Field>(() => {
    let ct = -1;
    let scene = scenes.portrait;
    let focus = 0.5;
    return (u, v, t, ar) => {
      if (t !== ct) {
        ct = t;
        const id = sceneAt(view.current.lay, view.current.broll, t).scene;
        scene = scenes[id];
        focus = FOCUS[id];
      }
      const w = Math.min(1, ar / SRC);
      const x0 = Math.min(1 - w, Math.max(0, focus - w / 2));
      return scene(x0 + u * w, v, t, SRC);
    };
  }, []);

  return (
    <div className="flex min-h-0 min-w-0 flex-col">
      <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-zinc-100/80 px-3 py-4 [--h:178px] sm:py-5 sm:[--h:250px] lg:py-0 lg:[--h:282px]" style={{ backgroundImage: 'radial-gradient(#e4e4e7 1px, transparent 1px)', backgroundSize: '14px 14px' }}>
        <div className="relative max-w-full overflow-hidden rounded-[10px] bg-[#0d0d0e] shadow-[0_12px_30px_-12px_rgba(0,0,0,0.5)] transition-[width] duration-700 ease-smooth" style={{ height: 'var(--h)', width: `calc(var(--h) * ${RATIO[aspect]})` } as CSSProperties}>
          <DitherCanvas field={field} time={clock.get} follow pixel={2} ink={PAPER} bg={SCREEN} className="absolute inset-0" />
          <PlayerHud clock={clock} lay={lay} broll={broll} aspect={aspect} />
          {captions && <CaptionOverlay clock={clock} lay={lay} vertical={aspect !== '16:9'} />}
          {!playing && (
            <button onClick={() => setPlaying(true)} aria-label="Play" className="absolute inset-0 grid place-items-center bg-black/10 transition-colors hover:bg-black/0">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-white/90 text-zinc-950 shadow-lg backdrop-blur transition-transform hover:scale-105">
                <Play className="ml-0.5 h-5 w-5 fill-current" />
              </span>
            </button>
          )}
        </div>
      </div>
      <div className="flex h-11 shrink-0 items-center gap-1.5 border-t border-zinc-200/80 px-2.5">
        <button onClick={() => clock.set(0)} aria-label="Back to start" className="grid h-7 w-7 place-items-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900">
          <SkipBack className="h-3.5 w-3.5 fill-current" />
        </button>
        <button onClick={() => setPlaying((p) => !p)} aria-label={playing ? 'Pause' : 'Play'} className="grid h-7 w-7 place-items-center rounded-full bg-zinc-950 text-white transition-transform active:scale-90">
          {playing ? <Pause className="h-3 w-3 fill-current" /> : <Play className="ml-px h-3 w-3 fill-current" />}
        </button>
        <Timecode clock={clock} total={lay.total} />
        <div className="ml-auto flex items-center gap-0.5 rounded-lg bg-zinc-100 p-0.5">
          {(['16:9', '9:16', '1:1'] as Aspect[]).map((a) => (
            <button key={a} onClick={() => setAspect(a)} className={cn('rounded-md px-1.5 py-0.5 font-mono text-[10.5px] transition-all', aspect === a ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-500 hover:text-zinc-800')}>
              {a}
            </button>
          ))}
        </div>
        <Volume2 className="ml-1 hidden h-3.5 w-3.5 text-zinc-400 sm:block" />
        <Maximize2 className="hidden h-3.5 w-3.5 text-zinc-400 sm:block" />
      </div>
    </div>
  );
}

function Timecode({ clock, total }: { clock: Clock; total: number }) {
  const f = useClock(clock, (t) => Math.floor(t * 24));
  return (
    <span className="ml-1 font-mono text-[11px] tabular-nums text-zinc-900">
      {tc(f / 24)}
      <span className="hidden text-zinc-400 sm:inline"> / {tc(total)}</span>
    </span>
  );
}

function PlayerHud({ clock, lay, broll, aspect }: { clock: Clock; lay: Layout; broll: boolean; aspect: Aspect }) {
  const label = useClock(clock, (t) => sceneAt(lay, broll, t).label);
  const ai = label.startsWith('GEN');
  return (
    <>
      <span className={cn('absolute left-2 top-2 flex max-w-[70%] items-center gap-1 truncate rounded-[5px] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider backdrop-blur', ai ? 'bg-[#ff4f1f] text-white' : 'bg-black/55 text-white/80')}>
        {ai && <Sparkles className="h-2.5 w-2.5 shrink-0" />}
        <span className="truncate">{label}</span>
      </span>
      {aspect === '16:9' && <span className="absolute right-2 top-2 rounded-[5px] bg-black/55 px-1.5 py-0.5 font-mono text-[9px] text-white/70 backdrop-blur">4K · 24 FPS</span>}
      <span className="pointer-events-none absolute inset-3 border border-dashed border-white/10" />
    </>
  );
}

function CaptionOverlay({ clock, lay, vertical }: { clock: Clock; lay: Layout; vertical: boolean }) {
  const gi = useClock(clock, (t) => GROUPS.findIndex((g) => t >= lay.start[g[0]] - 0.05 && t < lay.start[g[g.length - 1]] + lay.dur[g[g.length - 1]] + 0.3));
  const wi = useClock(clock, (t) => pieceAt(lay, t));
  if (gi < 0) return null;
  return (
    <div className={cn('pointer-events-none absolute inset-x-2 flex justify-center', vertical ? 'bottom-[22%]' : 'bottom-[9%]')}>
      <p key={gi} className={cn('flex flex-wrap justify-center gap-x-1 gap-y-0.5 text-center font-semibold leading-tight text-white animate-scale-in [text-shadow:0_1px_2px_rgba(0,0,0,0.9)]', vertical ? 'max-w-[150px] text-[13px]' : 'text-[12px] sm:text-[15px]')}>
        {GROUPS[gi].map((id) => (
          <span key={id} className={cn('rounded-[4px] px-1 transition-all duration-150', id === wi ? 'scale-110 bg-[#ff4f1f] [text-shadow:none]' : '')}>
            {PIECES[id].text}
          </span>
        ))}
      </p>
    </div>
  );
}

function MobileDirector({ msgs, busy, applied, onRun, onReset }: { msgs: Msg[]; busy: boolean; applied: Record<CmdId, boolean>; onRun: (id: CmdId) => void; onReset: () => void }) {
  const last = msgs[msgs.length - 1];
  const step = last.steps?.find((s) => !s.done);
  const line = busy && step ? `${step.label}…` : last.text ?? '';
  return (
    <div className="space-y-2 border-t border-zinc-200/80 px-3 py-2.5 lg:hidden">
      <div className="flex items-start gap-2">
        <span className="mt-px grid h-5 w-5 shrink-0 place-items-center rounded-md bg-zinc-950">
          <Sparkles className="h-3 w-3 text-[#ff4f1f]" />
        </span>
        <p key={line} className="min-h-[2.5em] flex-1 text-[12px] leading-snug text-zinc-700 animate-fade-in">{line}</p>
        <button onClick={onReset} className="shrink-0 text-[11px] text-zinc-400 hover:text-zinc-900">Reset</button>
      </div>
      <div className="-mx-3 flex gap-1 overflow-x-auto px-3 pb-0.5 [scrollbar-width:none]">
        {ORDER.map((id) => (
          <CmdChip key={id} id={id} done={applied[id]} disabled={busy} onRun={onRun} />
        ))}
      </div>
    </div>
  );
}
