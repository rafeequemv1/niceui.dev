import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowUp, AudioLines, Captions, Check, Crop, LoaderCircle, Magnet, MousePointer2, RotateCcw, Scissors, Sparkles, WandSparkles, ZoomIn } from 'lucide-react';
import { cn } from '@/lib/cn';
import { ditherStill, scenes } from './dither';
import { BROLL, FILLERS, FULL, GROUPS, PAUSES, PIECES, SAVED, SCALE, SHOTS, WORDS, bars, pieceAt, shotRange, useClock, type Clock, type Layout } from './editorModel';
import { tc } from './ui';

export type CmdId = 'cut' | 'captions' | 'reframe' | 'broll' | 'studio';
export type Msg = { id: number; role: 'user' | 'ai'; text?: string; steps?: { label: string; done: boolean }[] };

export const CMDS: Record<CmdId, { chip: string; prompt: string; icon: typeof Scissors; steps: string[]; done: string }> = {
  cut: {
    chip: 'Remove filler words',
    prompt: 'Cut the ums and tighten the pauses',
    icon: Scissors,
    steps: [`Transcribing ${FULL.toFixed(1)}s of dialogue`, `Found ${FILLERS} filler words and ${PAUSES} long pauses`, `Ripple-deleting ${SAVED.toFixed(1)}s, cutting on breaths`],
    done: `Done. ${SAVED.toFixed(1)}s tighter, and every cut lands on a breath.`,
  },
  captions: {
    chip: 'Add captions',
    prompt: 'Add animated captions',
    icon: Captions,
    steps: [`Aligning ${WORDS} words to the waveform`, 'Style: Bold, karaoke highlight', 'Placing caption blocks on CC'],
    done: 'Captions are on. Fix a word in the script and they update.',
  },
  reframe: {
    chip: 'Reframe 9:16',
    prompt: 'Make a vertical version for Shorts',
    icon: Crop,
    steps: ['Tracking the subject across 5 shots', 'Keeping faces on the rule of thirds', 'Rendering the 9:16 crop'],
    done: 'Vertical cut ready. The subject stays in frame in every shot.',
  },
  broll: {
    chip: 'Generate B-roll',
    prompt: 'Generate B-roll for the talking parts',
    icon: WandSparkles,
    steps: ['Reading the script for visual moments', 'Generating 2 shots at 4s, 24 fps', 'Matching the grade to your footage'],
    done: 'Added 2 generated shots on V2, over “coastline” and “edit on the fly”.',
  },
  studio: {
    chip: 'Studio Sound',
    prompt: 'Clean up the audio',
    icon: AudioLines,
    steps: ['Isolating voice from room tone', 'Removing 60 Hz hum and harsh esses', 'Mastering to −14 LUFS'],
    done: 'Studio Sound applied. It sounds like a treated booth now.',
  },
};

export const ORDER: CmdId[] = ['cut', 'captions', 'reframe', 'broll', 'studio'];

export function matchCommand(text: string): CmdId | null {
  const s = text.toLowerCase();
  if (/\bum|\buh|filler|pause|tight|silence|cut/.test(s)) return 'cut';
  if (/caption|subtitle/.test(s)) return 'captions';
  if (/vertical|9:16|short|reel|tiktok|reframe|portrait/.test(s)) return 'reframe';
  if (/b-?roll|generate|cutaway/.test(s)) return 'broll';
  if (/sound|audio|noise|hum|echo|voice/.test(s)) return 'studio';
  return null;
}

/* ——— Script / media ——— */

export function ScriptPanel({ clock, lay, cut, broll, onSeek }: { clock: Clock; lay: Layout; cut: boolean; broll: boolean; onSeek: (t: number) => void }) {
  const [tab, setTab] = useState<'script' | 'media'>('script');
  const cur = useClock(clock, (t) => pieceAt(lay, t));
  const box = useRef<HTMLDivElement>(null);
  const curEl = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const b = box.current;
    const el = curEl.current;
    if (!b || !el) return;
    if (el.offsetTop < b.scrollTop + 24 || el.offsetTop > b.scrollTop + b.clientHeight - 48) b.scrollTo({ top: el.offsetTop - 56, behavior: 'smooth' });
  }, [cur]);

  return (
    <div className="flex min-h-0 flex-col border-r border-zinc-200/80">
      <div className="flex h-10 shrink-0 items-center gap-1 border-b border-zinc-200/80 px-2">
        {(['script', 'media'] as const).map((k) => (
          <button key={k} onClick={() => setTab(k)} className={cn('rounded-md px-2.5 py-1 text-[12px] font-medium capitalize transition-colors', tab === k ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-500 hover:text-zinc-800')}>
            {k}
          </button>
        ))}
        <span className="ml-auto font-mono text-[10px] text-zinc-400">EN · {WORDS} words</span>
      </div>
      {tab === 'script' ? (
        <div ref={box} className="relative min-h-0 flex-1 overflow-y-auto px-3.5 py-3 [scrollbar-width:none]">
          {SHOTS.map((s, si) => (
            <div key={si} className="mb-3.5">
              <div className="mb-1 flex items-center gap-2 font-mono text-[10px] text-zinc-400">
                <span>{tc(shotRange(lay, si)[0]).slice(3)}</span>
                <span className="h-px flex-1 bg-zinc-100" />
                <span className="uppercase tracking-wider">{s.label}</span>
              </div>
              <p className="text-[13px] leading-[1.75] text-zinc-800">
                {PIECES.filter((p) => p.shot === si).map((p) => {
                  const active = p.id === cur;
                  const gone = cut && p.kind !== 'word';
                  const common = cn('-mx-[2px] rounded-[4px] px-[2px] transition-all duration-300', active && !gone && 'bg-[#ff4f1f] text-white', gone && 'text-zinc-300 line-through decoration-zinc-300');
                  if (p.kind === 'pause')
                    return (
                      <button key={p.id} ref={active ? curEl : undefined} onClick={() => onSeek(lay.start[p.id])} className={cn(common, 'mx-0.5 inline-flex translate-y-[-1px] items-center gap-1 bg-zinc-100 font-mono text-[10px] text-zinc-500', active && !gone && 'bg-zinc-900')}>
                        ‖ {p.dur.toFixed(1)}s
                      </button>
                    );
                  return (
                    <span key={p.id}>
                      <button ref={active ? curEl : undefined} onClick={() => onSeek(lay.start[p.id])} className={cn(common, p.kind === 'filler' && !gone && !active && 'text-[#e2400f] underline decoration-[#ff4f1f]/50 decoration-wavy underline-offset-[3px]', !active && !gone && 'hover:bg-zinc-100')}>
                        {p.text}
                      </button>{' '}
                    </span>
                  );
                })}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 auto-rows-min grid-cols-2 gap-2 overflow-y-auto p-3 [scrollbar-width:none]">
          {[...SHOTS.map((s, i) => ({ key: `s${i}`, scene: s.scene, name: s.clip, d: shotRange(lay, i)[1] - shotRange(lay, i)[0], ai: false })), ...(broll ? BROLL.map((b, i) => ({ key: `b${i}`, scene: b.scene, name: `GEN_${b.scene.toUpperCase()}`, d: 4, ai: true })) : [])].map((m) => (
            <div key={m.key} className="group">
              <div className="relative aspect-video overflow-hidden rounded-md ring-1 ring-zinc-200 [image-rendering:pixelated]" style={{ backgroundImage: `url(${ditherStill(`thumb-${m.scene}`, scenes[m.scene], 112, 63)})`, backgroundSize: 'cover' }}>
                {m.ai && <span className="absolute left-1 top-1 rounded bg-[#ff4f1f] px-1 font-mono text-[8px] font-medium text-white">AI</span>}
                <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1 font-mono text-[8px] text-white">{m.d.toFixed(1)}s</span>
              </div>
              <p className="mt-1 truncate font-mono text-[9.5px] text-zinc-500">{m.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ——— Director (AI) ——— */

export function DirectorPanel({ msgs, busy, applied, draft, setDraft, onRun, onSubmit, onReset }: {
  msgs: Msg[];
  busy: boolean;
  applied: Record<CmdId, boolean>;
  draft: string;
  setDraft: (s: string) => void;
  onRun: (id: CmdId) => void;
  onSubmit: (e: FormEvent) => void;
  onReset: () => void;
}) {
  const list = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = list.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [msgs]);

  return (
    <div className="flex min-h-0 flex-col border-l border-zinc-200/80">
      <div className="flex h-10 shrink-0 items-center gap-2 border-b border-zinc-200/80 px-3">
        <span className="grid h-5 w-5 place-items-center rounded-md bg-zinc-950">
          <Sparkles className="h-3 w-3 text-[#ff4f1f]" />
        </span>
        <span className="text-[12.5px] font-semibold text-zinc-900">Director</span>
        <span className="rounded bg-zinc-100 px-1.5 py-px font-mono text-[9.5px] text-zinc-500">rushes-3</span>
        <button onClick={onReset} className="ml-auto flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900" title="Reset the demo">
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
      </div>
      <div ref={list} className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-3 py-3 [scrollbar-width:none]">
        {msgs.map((m) => (m.role === 'user' ? <UserMsg key={m.id} text={m.text!} /> : <AiMsg key={m.id} m={m} />))}
      </div>
      <div className="shrink-0 space-y-2 border-t border-zinc-200/80 p-2.5">
        <div className="flex flex-wrap gap-1">
          {ORDER.map((id) => (
            <CmdChip key={id} id={id} done={applied[id]} disabled={busy} onRun={onRun} />
          ))}
        </div>
        <form onSubmit={onSubmit} className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white py-1 pl-3 pr-1 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors focus-within:border-zinc-400">
          <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Tell Director what to do…" aria-label="Command" className="h-7 min-w-0 flex-1 bg-transparent text-[12.5px] text-zinc-900 outline-none placeholder:text-zinc-400" />
          <button type="submit" disabled={busy || !draft.trim()} aria-label="Send" className="grid h-7 w-7 place-items-center rounded-lg bg-zinc-950 text-white transition-all disabled:bg-zinc-200 disabled:text-zinc-400 active:scale-95">
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}

export function CmdChip({ id, done, disabled, onRun, className }: { id: CmdId; done: boolean; disabled: boolean; onRun: (id: CmdId) => void; className?: string }) {
  const c = CMDS[id];
  const Icon = done ? Check : c.icon;
  return (
    <button
      onClick={() => onRun(id)}
      disabled={disabled || done}
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-[3px] text-[11px] font-medium transition-all active:scale-95',
        done ? 'border-transparent bg-zinc-100 text-zinc-400' : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 disabled:opacity-50',
        className,
      )}
    >
      <Icon className={cn('h-3 w-3', !done && 'text-[#ff4f1f]')} />
      {c.chip}
    </button>
  );
}

function UserMsg({ text }: { text: string }) {
  return (
    <div className="flex justify-end animate-fade-up">
      <p className="max-w-[86%] rounded-2xl rounded-br-md bg-zinc-950 px-3 py-1.5 text-[12px] leading-snug text-white">{text}</p>
    </div>
  );
}

function AiMsg({ m }: { m: Msg }) {
  return (
    <div className="flex gap-2 animate-fade-up">
      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-zinc-100">
        <Sparkles className="h-2.5 w-2.5 text-[#ff4f1f]" />
      </span>
      <div className="min-w-0 flex-1 space-y-1.5">
        {m.steps && (
          <div className="space-y-1 rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-2">
            {m.steps.map((s) => (
              <div key={s.label} className={cn('flex items-center gap-1.5 text-[11px] transition-colors', s.done ? 'text-zinc-600' : 'text-zinc-400')}>
                {s.done ? <Check className="h-3 w-3 shrink-0 text-[#ff4f1f]" /> : <LoaderCircle className="h-3 w-3 shrink-0 animate-spin" />}
                <span className="truncate">{s.label}</span>
              </div>
            ))}
          </div>
        )}
        {m.text && <p className="text-[12px] leading-snug text-zinc-700 animate-fade-in">{m.text}</p>}
      </div>
    </div>
  );
}

/* ——— Timeline ——— */

const pct = (s: number) => `${(s / SCALE) * 100}%`;
const TRACK_LABELS = ['V2', 'V1', 'A1', 'CC'];

export function Timeline({ clock, lay, cut, captions, broll, studio, pulse, onSeek }: {
  clock: Clock;
  lay: Layout;
  cut: boolean;
  captions: boolean;
  broll: boolean;
  studio: boolean;
  pulse: CmdId | null;
  onSeek: (t: number) => void;
}) {
  const area = useRef<HTMLDivElement>(null);
  const drag = useRef(false);
  const seekAt = (clientX: number) => {
    const r = area.current!.getBoundingClientRect();
    onSeek(Math.max(0, Math.min(lay.total - 0.02, ((clientX - r.left) / r.width) * SCALE)));
  };

  return (
    <div className="border-t border-zinc-200/80 bg-zinc-50/60">
      <div className="flex h-9 items-center gap-0.5 border-b border-zinc-200/70 px-2">
        {[MousePointer2, Scissors, Magnet, ZoomIn].map((I, i) => (
          <span key={i} className={cn('grid h-6 w-6 place-items-center rounded-md', i === 0 ? 'bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200' : i === 2 ? 'text-[#ff4f1f]' : 'text-zinc-400')}>
            <I className="h-3.5 w-3.5" />
          </span>
        ))}
        <span className="mx-2 hidden h-4 w-px bg-zinc-200 sm:block" />
        <span className="hidden font-mono text-[10px] uppercase tracking-wider text-zinc-400 sm:block">Ripple · Snap</span>
        <div className="ml-auto flex items-center gap-1.5">
          {studio && <Badge>Studio Sound</Badge>}
          {cut && <Badge accent>−{(FULL - lay.total).toFixed(1)}s</Badge>}
          <span className="font-mono text-[10.5px] tabular-nums text-zinc-500">{tc(lay.total)}</span>
        </div>
      </div>
      <div className="grid grid-cols-[34px_minmax(0,1fr)] sm:grid-cols-[42px_minmax(0,1fr)]">
        <div className="border-r border-zinc-200/70 pt-[22px]">
          {TRACK_LABELS.map((l, i) => (
            <div key={l} className={cn('flex items-center justify-center font-mono text-[9.5px] font-medium text-zinc-400', ['h-7', 'h-11', 'h-10', 'h-7'][i])}>
              {l}
            </div>
          ))}
        </div>
        <div
          ref={area}
          className="relative cursor-text touch-pan-y select-none overflow-hidden pr-1"
          onPointerDown={(e) => {
            drag.current = true;
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            seekAt(e.clientX);
          }}
          onPointerMove={(e) => drag.current && seekAt(e.clientX)}
          onPointerUp={() => (drag.current = false)}
          onPointerCancel={() => (drag.current = false)}
        >
          <Ruler />
          {/* V2 — B-roll */}
          <div className={cn('relative h-7 border-b border-zinc-200/60 transition-colors duration-700', pulse === 'broll' && 'bg-[#ff4f1f]/[0.06]')}>
            {!broll && <span className="absolute inset-y-0 left-2 flex items-center text-[10px] text-zinc-300">Drop B-roll here, or ask Director</span>}
            {BROLL.map((b, i) => (
              <div key={i} className={cn('absolute inset-y-[3px] origin-left overflow-hidden rounded-[5px] ring-1 ring-[#ff4f1f] transition-all duration-700 ease-smooth', broll ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0')} style={{ left: pct(lay.start[b.from]), width: pct(lay.start[b.to] + lay.dur[b.to] - lay.start[b.from]), transitionDelay: broll ? `${i * 160}ms` : '0ms' }}>
                <Strip scene={b.scene} />
                <span className="absolute left-1 top-1/2 flex -translate-y-1/2 items-center gap-0.5 rounded bg-[#ff4f1f] px-1 font-mono text-[8.5px] font-medium text-white">
                  <Sparkles className="h-2 w-2" /> AI
                </span>
              </div>
            ))}
          </div>
          {/* V1 — main */}
          <div className={cn('relative h-11 border-b border-zinc-200/60 transition-colors duration-700', pulse === 'reframe' && 'bg-[#ff4f1f]/[0.06]')}>
            {SHOTS.map((s, i) => {
              const [a, b] = shotRange(lay, i);
              return (
                <div key={i} className="absolute inset-y-[3px] overflow-hidden rounded-[5px] ring-1 ring-inset ring-black/10 transition-all duration-700 ease-smooth" style={{ left: `calc(${pct(a)} + 1px)`, width: `calc(${pct(b - a)} - 2px)` }}>
                  <Strip scene={s.scene} />
                  <span className="absolute left-1 top-1 hidden rounded-[3px] bg-black/70 px-1 font-mono text-[8.5px] leading-[13px] text-white sm:block">{s.clip}</span>
                </div>
              );
            })}
            {PIECES.filter((p) => p.kind !== 'word').map((p) => (
              <div
                key={p.id}
                className={cn('absolute inset-y-[3px] rounded-[3px] transition-all duration-700 ease-smooth', cut ? 'opacity-0' : 'opacity-100')}
                style={{ left: pct(lay.start[p.id]), width: pct(lay.dur[p.id]), background: 'repeating-linear-gradient(135deg, rgba(255,79,31,0.9) 0 2px, rgba(255,79,31,0.35) 2px 5px)' }}
              />
            ))}
          </div>
          {/* A1 — dialogue */}
          <div className={cn('relative h-10 border-b border-zinc-200/60 transition-colors duration-700', (pulse === 'studio' || pulse === 'cut') && 'bg-[#ff4f1f]/[0.06]')}>
            {PIECES.map((p) => (
              <div key={p.id} className="absolute inset-y-1 flex items-center justify-between gap-px overflow-hidden px-px transition-all duration-700 ease-smooth" style={{ left: pct(lay.start[p.id]), width: pct(lay.dur[p.id]) }}>
                {bars(p, studio).map((h, i) => (
                  <span
                    key={i}
                    className={cn('w-[2px] shrink-0 rounded-full transition-[height] duration-700', p.kind === 'filler' ? 'bg-[#ff4f1f]' : p.kind === 'pause' ? 'bg-zinc-400' : 'bg-zinc-800')}
                    style={{ height: `${h * 100}%` }}
                  />
                ))}
              </div>
            ))}
          </div>
          {/* CC — captions */}
          <div className={cn('relative h-7 transition-colors duration-700', pulse === 'captions' && 'bg-[#ff4f1f]/[0.06]')}>
            {!captions && <span className="absolute inset-y-0 left-2 flex items-center text-[10px] text-zinc-300">No captions yet</span>}
            {GROUPS.map((g, i) => {
              const a = lay.start[g[0]];
              const b = lay.start[g[g.length - 1]] + lay.dur[g[g.length - 1]];
              return (
                <div key={i} className={cn('absolute inset-y-[4px] overflow-hidden rounded-[4px] border border-zinc-300 bg-white px-1 transition-all duration-500 ease-smooth', captions ? 'opacity-100' : 'scale-y-0 opacity-0')} style={{ left: `calc(${pct(a)} + 1px)`, width: `calc(${pct(b - a)} - 2px)`, transitionDelay: captions ? `${i * 25}ms` : '0ms' }}>
                  <span className="block truncate text-[8.5px] leading-[17px] text-zinc-600">{g.map((id) => PIECES[id].text).join(' ')}</span>
                </div>
              );
            })}
          </div>
          <Playhead clock={clock} />
        </div>
      </div>
    </div>
  );
}

function Ruler() {
  const marks = Array.from({ length: Math.floor(SCALE / 5) + 1 }, (_, i) => i * 5);
  return (
    <div className="relative h-[22px] border-b border-zinc-200/70" style={{ backgroundImage: `repeating-linear-gradient(90deg, #d4d4d8 0 1px, transparent 1px ${100 / SCALE}%)`, backgroundSize: '100% 5px', backgroundRepeat: 'no-repeat', backgroundPosition: 'bottom' }}>
      {marks.map((s) => (
        <span key={s} className="absolute top-1 font-mono text-[9px] text-zinc-400" style={{ left: `calc(${pct(s)} + 3px)` }}>
          {`00:${String(s).padStart(2, '0')}`}
        </span>
      ))}
    </div>
  );
}

function Playhead({ clock }: { clock: Clock }) {
  const t = useClock(clock, (v) => v);
  return (
    <div className="pointer-events-none absolute inset-y-0 z-10 w-px bg-[#ff4f1f]" style={{ left: pct(t) }}>
      <span className="absolute -left-[5px] top-0 h-3 w-[11px] rounded-b-[3px] bg-[#ff4f1f] [clip-path:polygon(0_0,100%_0,100%_60%,50%_100%,0_60%)]" />
    </div>
  );
}

function Strip({ scene }: { scene: keyof typeof scenes }) {
  return <div className="absolute inset-0 [image-rendering:pixelated]" style={{ backgroundImage: `url(${ditherStill(`strip-${scene}`, scenes[scene], 64, 36, 3)})`, backgroundSize: 'auto 100%', backgroundRepeat: 'repeat-x' }} />;
}

function Badge({ children, accent }: { children: ReactNode; accent?: boolean }) {
  return <span className={cn('rounded-full px-1.5 py-px font-mono text-[9.5px] font-medium animate-scale-in', accent ? 'bg-[#ff4f1f]/10 text-[#e2400f]' : 'bg-zinc-200/70 text-zinc-600')}>{children}</span>;
}
