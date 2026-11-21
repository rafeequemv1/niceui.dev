import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { cn } from '@/lib/cn';

/* An original 5×7 bitmap face. Each glyph is 7 rows of 5 bits. */
const GLYPHS: Record<string, string> = {
  A: '01110 10001 10001 11111 10001 10001 10001',
  B: '11110 10001 10001 11110 10001 10001 11110',
  C: '01110 10001 10000 10000 10000 10001 01110',
  D: '11110 10001 10001 10001 10001 10001 11110',
  E: '11111 10000 10000 11110 10000 10000 11111',
  F: '11111 10000 10000 11110 10000 10000 10000',
  G: '01110 10001 10000 10111 10001 10001 01111',
  H: '10001 10001 10001 11111 10001 10001 10001',
  I: '11111 00100 00100 00100 00100 00100 11111',
  J: '00111 00010 00010 00010 00010 10010 01100',
  K: '10001 10010 10100 11000 10100 10010 10001',
  L: '10000 10000 10000 10000 10000 10000 11111',
  M: '10001 11011 10101 10101 10001 10001 10001',
  N: '10001 11001 10101 10011 10001 10001 10001',
  O: '01110 10001 10001 10001 10001 10001 01110',
  P: '11110 10001 10001 11110 10000 10000 10000',
  Q: '01110 10001 10001 10001 10101 10010 01101',
  R: '11110 10001 10001 11110 10100 10010 10001',
  S: '01111 10000 10000 01110 00001 00001 11110',
  T: '11111 00100 00100 00100 00100 00100 00100',
  U: '10001 10001 10001 10001 10001 10001 01110',
  V: '10001 10001 10001 10001 10001 01010 00100',
  W: '10001 10001 10001 10101 10101 10101 01010',
  X: '10001 10001 01010 00100 01010 10001 10001',
  Y: '10001 10001 01010 00100 00100 00100 00100',
  Z: '11111 00001 00010 00100 01000 10000 11111',
  '0': '01110 10001 10011 10101 11001 10001 01110',
  '1': '00100 01100 00100 00100 00100 00100 01110',
  '2': '01110 10001 00001 00010 00100 01000 11111',
  '3': '11110 00001 00001 01110 00001 00001 11110',
  '4': '00010 00110 01010 10010 11111 00010 00010',
  '5': '11111 10000 11110 00001 00001 10001 01110',
  '6': '00110 01000 10000 11110 10001 10001 01110',
  '7': '11111 00001 00010 00100 01000 01000 01000',
  '8': '01110 10001 10001 01110 10001 10001 01110',
  '9': '01110 10001 10001 01111 00001 00010 01100',
  '.': '00000 00000 00000 00000 00000 01100 01100',
  ',': '00000 00000 00000 00000 01100 00100 01000',
  "'": '00100 00100 01000 00000 00000 00000 00000',
  '-': '00000 00000 00000 11111 00000 00000 00000',
  '!': '00100 00100 00100 00100 00100 00000 00100',
  '?': '01110 10001 00001 00010 00100 00000 00100',
  '&': '01100 10010 10100 01000 10101 10010 01101',
};

type Px = { x: number; y: number; d: number };

function layout(word: string) {
  const px: Px[] = [];
  const chars = [...word.toUpperCase()];
  chars.forEach((ch, i) => {
    const rows = (GLYPHS[ch] ?? GLYPHS['?']).split(' ');
    rows.forEach((row, y) => {
      for (let x = 0; x < 5; x++) {
        if (row[x] === '1') {
          // stable pseudo-random order for the decode reveal
          const h = Math.sin((i * 31 + x * 7 + y * 13) * 12.9898) * 43758.5453;
          px.push({ x: i * 6 + x, y, d: h - Math.floor(h) });
        }
      }
    });
  });
  return { px, w: chars.length * 6 - 1 };
}

export type PixelTextProps = {
  text: string;
  /** Play a pixel-by-pixel decode when it mounts. */
  reveal?: boolean;
  /** Seconds before the reveal starts. */
  delay?: number;
  className?: string;
  /** Gap between words, in em. */
  wordGap?: number;
};

/**
 * Text set in a crisp 5×7 pixel face, one inline SVG per word so it wraps like
 * normal text. Size it with font-size; colour it with `color`.
 */
export function PixelText({ text, reveal = true, delay = 0, className, wordGap = 0.42 }: PixelTextProps) {
  const words = useMemo(() => text.split(/\s+/).filter(Boolean).map(layout), [text]);
  // after the decode, each word becomes one merged path so no seams show between pixels
  const total = words.reduce((n, w) => n + w.w, 0);
  const [done, setDone] = useState(!reveal);
  useEffect(() => {
    if (!reveal) return setDone(true);
    setDone(false);
    const id = window.setTimeout(() => setDone(true), (delay + total * 0.012 + 0.9) * 1000);
    return () => window.clearTimeout(id);
  }, [reveal, delay, total, text]);
  let offset = 0;
  return (
    <span className={cn('inline', className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((w, wi) => {
          const start = offset;
          offset += w.w;
          return (
            <svg
              key={wi}
              viewBox={`0 0 ${w.w} 7`}
              className="inline-block align-baseline"
              style={{ height: '0.86em', width: `${(w.w / 7) * 0.86}em`, marginRight: wi < words.length - 1 ? `${wordGap}em` : 0 }}
            >
              {done ? (
                <path fill="currentColor" d={w.px.map((p) => `M${p.x} ${p.y}h1v1h-1z`).join('')} />
              ) : w.px.map((p, i) => (
                <rect
                  key={i}
                  x={p.x}
                  y={p.y}
                  width="1.08"
                  height="1.08"
                  fill="currentColor"
                  className={reveal ? 'nui-px' : undefined}
                  style={reveal ? ({ animationDelay: `${delay + (start + p.x) * 0.012 + p.d * 0.35}s` } as CSSProperties) : undefined}
                />
              ))}
            </svg>
          );
        })}
      </span>
      {reveal && (
        <style>{`@keyframes nui-px{0%{opacity:0}40%{opacity:1;fill:#fdba74}100%{opacity:1}}.nui-px{opacity:0;animation:nui-px .5s steps(3,end) forwards}@media (prefers-reduced-motion:reduce){.nui-px{animation:none;opacity:1}}`}</style>
      )}
    </span>
  );
}
