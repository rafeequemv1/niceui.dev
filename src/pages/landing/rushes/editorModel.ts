import { useSyncExternalStore } from 'react';
import { hash, type SceneId } from './dither';

export type Kind = 'word' | 'filler' | 'pause';
export type Piece = { id: number; text: string; kind: Kind; shot: number; dur: number };
export type Shot = { scene: SceneId; label: string; clip: string };

export const SHOTS: Shot[] = [
  { scene: 'portrait', label: 'Intro', clip: 'A001_C004' },
  { scene: 'coast', label: 'Coast', clip: 'B002_C011' },
  { scene: 'portrait', label: 'Studio', clip: 'A001_C007' },
  { scene: 'city', label: 'City', clip: 'C003_C002' },
  { scene: 'peaks', label: 'Outro', clip: 'D001_C001' },
];

const SCRIPT = [
  "Hi, I'm Maya. {um} Three years ago I quit my job to film the coastline I grew up on.",
  'Every morning, {uh} the light does something different.',
  'So I built a tiny studio, [] and {like} learned to edit on the fly.',
  'Then the city called. [] Long nights, {um} longer edits.',
  'Now Rushes cuts my footage while I sleep. [] This is the story, {uh} without the busywork.',
];

export const PIECES: Piece[] = SCRIPT.flatMap((line, shot) =>
  line.split(' ').map((raw) => {
    if (raw === '[]') return { text: '', kind: 'pause' as Kind, shot, dur: 1 };
    if (raw.startsWith('{')) return { text: raw.slice(1, -1), kind: 'filler' as Kind, shot, dur: 0.6 };
    return { text: raw, kind: 'word' as Kind, shot, dur: Math.min(0.62, 0.17 + raw.replace(/\W/g, '').length * 0.05) };
  }),
).map((p, id) => ({ ...p, id }));

export const FULL = PIECES.reduce((s, p) => s + p.dur, 0);
export const SCALE = Math.ceil(FULL + 1.5);
export const WORDS = PIECES.filter((p) => p.kind === 'word').length;
export const FILLERS = PIECES.filter((p) => p.kind === 'filler').length;
export const PAUSES = PIECES.filter((p) => p.kind === 'pause').length;
export const SAVED = PIECES.filter((p) => p.kind !== 'word').reduce((s, p) => s + p.dur, 0);

export type Layout = { start: number[]; dur: number[]; total: number };

export function layout(cut: boolean): Layout {
  const start: number[] = [];
  const dur: number[] = [];
  let t = 0;
  for (const p of PIECES) {
    const d = cut && p.kind !== 'word' ? 0 : p.dur;
    start.push(t);
    dur.push(d);
    t += d;
  }
  return { start, dur, total: t };
}

export const shotRange = (l: Layout, shot: number) => {
  const ids = PIECES.filter((p) => p.shot === shot).map((p) => p.id);
  const a = l.start[ids[0]];
  const b = l.start[ids[ids.length - 1]] + l.dur[ids[ids.length - 1]];
  return [a, b] as const;
};

export function pieceAt(l: Layout, t: number) {
  for (let i = PIECES.length - 1; i >= 0; i--) if (l.dur[i] > 0 && t >= l.start[i]) return i;
  return 0;
}

/** Caption groups: up to four words, broken on punctuation. Fillers and pauses are skipped. */
export const GROUPS: number[][] = (() => {
  const out: number[][] = [];
  let cur: number[] = [];
  for (const p of PIECES) {
    if (p.kind !== 'word') continue;
    if (cur.length && PIECES[cur[0]].shot !== p.shot) {
      out.push(cur);
      cur = [];
    }
    cur.push(p.id);
    if (/[.,]$/.test(p.text) || cur.length === 4) {
      out.push(cur);
      cur = [];
    }
  }
  if (cur.length) out.push(cur);
  return out;
})();

const find = (shot: number, word: string) => PIECES.find((p) => p.shot === shot && p.text.replace(/\W/g, '') === word)!.id;

export const BROLL: { from: number; to: number; scene: SceneId; prompt: string }[] = [
  { from: find(0, 'film'), to: find(0, 'on'), scene: 'coast', prompt: 'coastline at dawn' },
  { from: find(2, 'learned'), to: find(2, 'fly'), scene: 'reel', prompt: 'spinning film reel' },
];

/** Deterministic waveform heights for a piece, 0..1. */
export function bars(p: Piece, studio: boolean) {
  const n = Math.max(2, Math.round(p.dur / 0.085));
  return Array.from({ length: n }, (_, i) => {
    const r = hash(p.id * 7 + i, i * 3);
    if (p.kind === 'pause') return studio ? 0.04 : 0.1 + r * 0.14;
    const env = Math.sin(((i + 0.5) / n) * Math.PI);
    const v = (p.kind === 'filler' ? 0.35 : 0.42) + env * 0.48 * (0.55 + r * 0.45);
    return studio ? v * 0.92 : Math.min(1, v + 0.08 + r * 0.1);
  });
}

/* A tiny clock store so only the playhead, timecode and captions re-render every frame. */
export function createClock() {
  let t = 0;
  const subs = new Set<() => void>();
  return {
    get: () => t,
    set(v: number) {
      t = v;
      subs.forEach((f) => f());
    },
    subscribe(f: () => void) {
      subs.add(f);
      return () => {
        subs.delete(f);
      };
    },
  };
}
export type Clock = ReturnType<typeof createClock>;

export function useClock<T>(clock: Clock, select: (t: number) => T): T {
  return useSyncExternalStore(clock.subscribe, () => select(clock.get()));
}
