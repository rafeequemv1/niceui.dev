import { forwardRef, useId } from 'react';
import { MARKS, type MarkId } from './marks';

export type Style = 'flat' | 'outline' | 'stacked' | 'emboss';
export type Plate = 'none' | 'circle' | 'squircle';
export type FinishId = 'chrome' | 'glass' | 'matte' | 'gold' | 'pearl' | 'holo' | 'ink';
export type Backdrop = 'transparent' | 'solid' | 'gradient';

export type Settings = {
  mark: MarkId;
  letter: string;
  style: Style;
  plate: Plate;
  radius: number;
  stroke: number;
  padding: number;
  width: number;
  height: number;
  fillHoles: boolean;
  finish: FinishId;
  angle: number;
  gloss: number;
  grain: boolean;
  backdrop: Backdrop;
  backdropColor: string;
  shadow: number;
  glow: number;
  rotation: number;
};

export const FINISHES: { id: FinishId; label: string; stops: string[]; css: string }[] = [
  { id: 'chrome', label: 'Chrome', stops: ['#fafafa', '#a1a1aa', '#f4f4f5', '#3f3f46', '#e4e4e7'], css: 'linear-gradient(135deg,#fafafa,#a1a1aa 30%,#f4f4f5 50%,#3f3f46 75%,#e4e4e7)' },
  { id: 'glass', label: 'Glass', stops: ['#ffffffcc', '#e0f2fe66', '#ffffff22', '#bae6fd55', '#ffffffaa'], css: 'linear-gradient(135deg,#ffffff,#e0f2fe 40%,#94a3b8 70%,#ffffff)' },
  { id: 'matte', label: 'Matte', stops: ['#3f3f46', '#27272a', '#18181b'], css: 'linear-gradient(135deg,#52525b,#18181b)' },
  { id: 'gold', label: 'Gold', stops: ['#fef3c7', '#d97706', '#fde68a', '#78350f', '#fcd34d'], css: 'linear-gradient(135deg,#fef3c7,#d97706 30%,#fde68a 50%,#78350f 75%,#fcd34d)' },
  { id: 'pearl', label: 'Pearl', stops: ['#ffffff', '#fce7f3', '#e0f2fe', '#ede9fe', '#ffffff'], css: 'linear-gradient(135deg,#ffffff,#fce7f3 30%,#e0f2fe 55%,#ede9fe 80%,#ffffff)' },
  { id: 'holo', label: 'Holographic', stops: ['#f0abfc', '#93c5fd', '#86efac', '#fde047', '#f9a8d4'], css: 'linear-gradient(135deg,#f0abfc,#93c5fd 30%,#86efac 55%,#fde047 75%,#f9a8d4)' },
  { id: 'ink', label: 'Ink', stops: ['#18181b', '#09090b'], css: 'linear-gradient(135deg,#27272a,#09090b)' },
];

export const DEFAULTS: Settings = {
  mark: 'orbit',
  letter: 'F',
  style: 'emboss',
  plate: 'circle',
  radius: 4,
  stroke: 6,
  padding: 64,
  width: 512,
  height: 512,
  fillHoles: false,
  finish: 'chrome',
  angle: 35,
  gloss: 0.55,
  grain: true,
  backdrop: 'transparent',
  backdropColor: '#0ea5e9',
  shadow: 0.5,
  glow: 0,
  rotation: -8,
};

const S = 512;

/** Renders the badge as a standalone SVG — the same markup is exported. */
export const Badge = forwardRef<SVGSVGElement, { s: Settings; className?: string }>(function Badge({ s, className }, ref) {
  const uid = useId().replace(/:/g, '');
  const id = (n: string) => `${uid}-${n}`;
  const finish = FINISHES.find((f) => f.id === s.finish) ?? FINISHES[0];
  const mark = MARKS.find((m) => m.id === s.mark) ?? MARKS[0];
  const box = S - s.padding * 2;
  const plated = s.plate !== 'none';
  const markBox = plated ? box * 0.58 : box;
  const scale = markBox / 100;
  const off = (S - markBox) / 2;
  const fillRule = mark.holes && !s.fillHoles ? 'evenodd' : 'nonzero';

  const shape = (props: Record<string, unknown> = {}) =>
    mark.id === 'letter' ? (
      <text x="50" y="54" textAnchor="middle" dominantBaseline="central" fontSize="92" fontWeight={700} fontFamily="Geist, Inter, system-ui, sans-serif" letterSpacing="-4" {...props}>
        {(s.letter || 'F').slice(0, 2)}
      </text>
    ) : (
      <path d={mark.d} fillRule={fillRule} {...props} />
    );

  const plateShape = (props: Record<string, unknown> = {}) =>
    s.plate === 'circle' ? (
      <circle cx={S / 2} cy={S / 2} r={box / 2} {...props} />
    ) : (
      <rect x={s.padding} y={s.padding} width={box} height={box} rx={box * 0.28} {...props} />
    );

  const paint = `url(#${id('fin')})`;
  const inv = `url(#${id('inv')})`;
  const round = s.style !== 'outline' && s.radius > 0 ? { stroke: plated ? inv : paint, strokeWidth: (s.radius * 2) / scale, strokeLinejoin: 'round' as const } : {};
  const markPaint = plated ? inv : paint;
  const markLayer = () => {
    const g = (k: string, dx: number, dy: number, fill: string, extra: Record<string, unknown> = {}) => (
      <g key={k} transform={`translate(${off + dx} ${off + dy}) scale(${scale})`}>{shape({ fill, ...extra })}</g>
    );
    if (s.style === 'outline') return g('o', 0, 0, 'none', { stroke: markPaint, strokeWidth: Math.max(1.5, s.stroke) / scale, strokeLinejoin: 'round' });
    if (s.style === 'stacked')
      return (
        <>
          {[6, 5, 4, 3, 2, 1].map((i) => g('s' + i, i * 3, i * 3, `rgba(0,0,0,${0.14 + i * 0.04})`, round.stroke ? { ...round, stroke: `rgba(0,0,0,${0.14 + i * 0.04})` } : {}))}
          {g('t', 0, 0, markPaint, round)}
        </>
      );
    if (s.style === 'emboss')
      return (
        <>
          {g('d', 3, 4, 'rgba(0,0,0,0.45)', round.stroke ? { ...round, stroke: 'rgba(0,0,0,0.45)' } : {})}
          {g('l', -2, -2.5, 'rgba(255,255,255,0.7)', round.stroke ? { ...round, stroke: 'rgba(255,255,255,0.7)' } : {})}
          {g('t', 0, 0, markPaint, round)}
        </>
      );
    return g('f', 0, 0, markPaint, round);
  };

  const rot = `rotate(${s.angle} 0.5 0.5)`;
  return (
    <svg ref={ref} xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${S} ${S}`} width={s.width} height={s.height} className={className} role="img" aria-label="Badge preview">
      <defs>
        <linearGradient id={id('fin')} gradientTransform={rot}>
          {finish.stops.map((c, i) => (
            <stop key={i} offset={i / (finish.stops.length - 1)} stopColor={c} />
          ))}
        </linearGradient>
        <linearGradient id={id('inv')} gradientTransform={`rotate(${s.angle + 180} 0.5 0.5)`}>
          {finish.stops.map((c, i) => (
            <stop key={i} offset={i / (finish.stops.length - 1)} stopColor={c} />
          ))}
        </linearGradient>
        <radialGradient id={id('gloss')} cx="0.32" cy="0.22" r="0.65">
          <stop offset="0" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0.18" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id('bg')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={s.backdropColor} />
          <stop offset="1" stopColor="#0b0c0e" />
        </linearGradient>
        <clipPath id={id('clip')}>{plated ? plateShape() : <g transform={`translate(${off} ${off}) scale(${scale})`}>{shape()}</g>}</clipPath>
        <filter id={id('fx')} x="-30%" y="-30%" width="160%" height="160%">
          {s.glow > 0 && <feDropShadow dx="0" dy="0" stdDeviation={10 + s.glow * 24} floodColor={s.backdropColor} floodOpacity={s.glow} />}
          {s.shadow > 0 && <feDropShadow dx="0" dy={8 + s.shadow * 18} stdDeviation={8 + s.shadow * 16} floodColor="#000" floodOpacity={0.15 + s.shadow * 0.4} />}
        </filter>
        <filter id={id('grain')}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </defs>
      {s.backdrop === 'solid' && <rect width={S} height={S} fill={s.backdropColor} />}
      {s.backdrop === 'gradient' && <rect width={S} height={S} fill={`url(#${id('bg')})`} />}
      <g transform={`rotate(${s.rotation} ${S / 2} ${S / 2})`} filter={s.shadow > 0 || s.glow > 0 ? `url(#${id('fx')})` : undefined}>
        {plated && (
          <>
            {plateShape({ fill: paint, opacity: s.finish === 'glass' ? 0.85 : 1 })}
            {plateShape({ fill: 'none', stroke: 'rgba(255,255,255,0.55)', strokeWidth: 3 })}
          </>
        )}
        {markLayer()}
        <g clipPath={`url(#${id('clip')})`}>
          {s.gloss > 0 && <rect width={S} height={S} fill={`url(#${id('gloss')})`} opacity={s.gloss} />}
          {s.grain && <rect width={S} height={S} filter={`url(#${id('grain')})`} opacity="0.16" style={{ mixBlendMode: 'overlay' }} />}
        </g>
      </g>
    </svg>
  );
});
