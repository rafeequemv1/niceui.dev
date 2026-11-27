import { useEffect, useState, type ReactNode, type SVGProps } from 'react';
import { cn } from '@/lib/cn';

/* Isometric drawing kit: a 30° projection, boxes, cylinders, text laid on the
   floor or on a wall, floor stat rows, a callout with a leader line and the
   card shell. Every scene in this folder is plain SVG built from these. */

const C = 0.8660254;
const S = 0.5;

export type V3 = [number, number, number];

/** Project a 3D point (x right-down, y left-down, z up) to 2D. */
export const iso = (x: number, y: number, z = 0): [number, number] => [(x - y) * C, (x + y) * S - z];
const pts = (list: V3[]) => list.map((p) => iso(...p).map((n) => n.toFixed(1)).join(',')).join(' ');

export const LINE = 'rgba(255,255,255,0.34)';
const FACE = { top: '#232327', left: '#17171a', right: '#1c1c20' };

export function useReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduce(m.matches);
    const on = () => setReduce(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);
  return reduce;
}

/** Counts up to a number once, on mount. */
export function useCountUp(target: number, ms = 1100) {
  const reduce = useReducedMotion();
  const [v, setV] = useState(target);
  useEffect(() => {
    if (reduce) return setV(target);
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / ms);
      setV(target * (1 - Math.pow(1 - k, 3)));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms, reduce]);
  return v;
}

/** Hover or focus a part to make it the active one. */
export function usePart<T extends string>(initial: T) {
  const [active, setActive] = useState<T>(initial);
  const bind = (id: T, label: string) => ({
    onPointerEnter: () => setActive(id),
    onFocus: () => setActive(id),
    onClick: () => setActive(id),
    tabIndex: 0,
    role: 'button',
    'aria-label': label,
    'aria-pressed': active === id,
    style: { cursor: 'pointer', outline: 'none' },
  });
  return [active, bind, setActive] as const;
}

type Hot = { hot?: boolean; accent?: string };

function Glow({ accent, children }: { accent: string; children: ReactNode }) {
  return <g style={{ filter: `drop-shadow(0 0 10px ${accent}88)` }}>{children}</g>;
}

/** A solid box: x/y/z is the back corner, w along x, d along y, h up. */
export function IsoBox({ x, y, z = 0, w, d, h, hot, accent = '#ff6b35', faces, stroke = LINE, ...rest }: { x: number; y: number; z?: number; w: number; d: number; h: number; faces?: Partial<typeof FACE>; stroke?: string } & Hot & Omit<SVGProps<SVGGElement>, 'x' | 'y' | 'z' | 'd' | 'h' | 'w' | 'stroke'>) {
  const f = { ...FACE, ...faces };
  const tint = (c: string, a: number) => (hot ? `color-mix(in srgb, ${accent} ${a}%, ${c})` : c);
  const body = (
    <g strokeLinejoin="round" strokeWidth={1.4} stroke={hot ? accent : stroke} {...rest}>
      <polygon points={pts([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]])} fill={tint(f.left, 30)} />
      <polygon points={pts([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]])} fill={tint(f.right, 38)} />
      <polygon points={pts([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]])} fill={tint(f.top, 46)} />
    </g>
  );
  return hot ? <Glow accent={accent}>{body}</Glow> : body;
}

/** A vertical cylinder standing on the floor at (x, y). */
export function IsoCylinder({ x, y, z = 0, r, h, hot, accent = '#ff6b35', fill = FACE.right, top = FACE.top, ...rest }: { x: number; y: number; z?: number; r: number; h: number; fill?: string; top?: string } & Hot & Omit<SVGProps<SVGGElement>, 'x' | 'y' | 'z' | 'r' | 'h' | 'fill' | 'top'>) {
  const [bx, by] = iso(x, y, z);
  const ty = by - h;
  const rx = r * Math.SQRT2 * C;
  const ry = r * Math.SQRT2 * S;
  const tint = (c: string, a: number) => (hot ? `color-mix(in srgb, ${accent} ${a}%, ${c})` : c);
  const body = (
    <g stroke={hot ? accent : LINE} strokeWidth={1.4} {...rest}>
      <path d={`M${bx - rx} ${ty}V${by}A${rx} ${ry} 0 0 0 ${bx + rx} ${by}V${ty}Z`} fill={tint(fill, 36)} />
      <ellipse cx={bx} cy={ty} rx={rx} ry={ry} fill={tint(top, 46)} />
    </g>
  );
  return hot ? <Glow accent={accent}>{body}</Glow> : body;
}

/** A flat polygon on any plane, given 3D corners. */
export function IsoPoly({ points, ...rest }: { points: V3[] } & Omit<SVGProps<SVGPolygonElement>, 'points'>) {
  return <polygon points={pts(points)} {...rest} />;
}
export function IsoLine({ from, to, ...rest }: { from: V3; to: V3 } & Omit<SVGProps<SVGLineElement>, 'from' | 'to'>) {
  const [x1, y1] = iso(...from);
  const [x2, y2] = iso(...to);
  return <line x1={x1} y1={y1} x2={x2} y2={y2} {...rest} />;
}

export type Plane = 'floor' | 'left' | 'right';
// floor: text runs along +x; left wall (y = const) runs along +x, upright; right wall (x = const) runs along -y, upright
const MATRIX: Record<Plane, [number, number, number, number]> = {
  floor: [C, S, -C, S],
  left: [C, S, 0, 1],
  right: [C, -S, 0, 1],
};
/** Text laid flat on the floor or painted on a wall at a 3D point. */
export function IsoText({ at, plane = 'floor', size = 12, children, ...rest }: { at: V3; plane?: Plane; size?: number; children: ReactNode } & SVGProps<SVGTextElement>) {
  const [a, b, c, d] = MATRIX[plane];
  const [e, f] = iso(...at);
  return (
    <text transform={`matrix(${a} ${b} ${c} ${d} ${e.toFixed(1)} ${f.toFixed(1)})`} fontSize={size} fill="#f4f4f5" {...rest}>
      {children}
    </text>
  );
}

export type StatRow = { label: string; value: string; pct: number; strong?: boolean };
/** Stat rows lying on the floor: label, value and a thin bar per row, stacked along y. */
export function IsoStats({ at, rows, length = 150, gap = 15, caption }: { at: V3; rows: StatRow[]; length?: number; gap?: number; caption?: string }) {
  const [x0, y0, z] = at;
  return (
    <g>
      {caption && (
        <IsoText at={[x0, y0 - gap, z]} size={9.5} fill="rgba(255,255,255,0.5)" fontStyle="italic">
          {caption}
        </IsoText>
      )}
      {rows.map((r, i) => {
        const y = y0 + i * gap;
        return (
          <g key={r.label}>
            <IsoText at={[x0, y, z]} size={10.5} fontWeight={r.strong ? 600 : 500} fill={r.strong ? '#fafafa' : 'rgba(255,255,255,0.78)'}>
              {r.label}
            </IsoText>
            <IsoText at={[x0 + length, y, z]} size={9.5} textAnchor="end" fill="rgba(255,255,255,0.55)" fontStyle="italic">
              {r.value}
            </IsoText>
            <IsoLine from={[x0, y + 3.5, z]} to={[x0 + length, y + 3.5, z]} stroke="rgba(255,255,255,0.14)" strokeWidth={1.6} />
            <IsoLine from={[x0, y + 3.5, z]} to={[x0 + length * Math.max(0, Math.min(1, r.pct)), y + 3.5, z]} stroke={r.strong ? '#f4f4f5' : 'rgba(255,255,255,0.6)'} strokeWidth={1.8} strokeLinecap="round" />
          </g>
        );
      })}
    </g>
  );
}

/** A big number on the floor with a unit and an italic caption, like a painted road marking. */
export function IsoMetric({ at, value, unit, caption, size = 34 }: { at: V3; value: string; unit?: string; caption?: string; size?: number }) {
  const [x, y, z] = at;
  return (
    <g>
      {caption && (
        <IsoText at={[x, y - size * 0.95, z]} size={9.5} fill="rgba(255,255,255,0.55)" fontStyle="italic">
          {caption}
        </IsoText>
      )}
      <IsoText at={[x, y, z]} size={size} fontWeight={700} letterSpacing={-1}>
        {value}
        {unit && (
          <tspan fontSize={size * 0.38} fontWeight={500} dx={4} fill="rgba(255,255,255,0.75)">
            {unit}
          </tspan>
        )}
      </IsoText>
    </g>
  );
}

export type CalloutData = { title: string; code: string; rows: Array<[string, string]> };
/** The spec callout with a leader line to the active part. `side` sets which end the leader leaves from. */
export function Callout({ x, y, data, target, side = 'left', width = 168, accent = '#ff6b35' }: { x: number; y: number; data: CalloutData; target: [number, number]; side?: 'left' | 'right'; width?: number; accent?: string }) {
  const base = y + 26 + data.rows.length * 16;
  const sx = side === 'left' ? x + 12 : x + width - 12;
  return (
    <g aria-live="polite">
      <text x={x} y={y + 12} fontSize={13} fontWeight={600} fill="#fafafa">
        {data.title}
        <tspan dx={7} fontSize={10} fill={accent} fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" letterSpacing={0.5}>
          {data.code}
        </tspan>
      </text>
      {data.rows.map(([k, v], i) => (
        <text key={k} x={x} y={y + 32 + i * 16} fontSize={10.5}>
          <tspan fill="rgba(255,255,255,0.45)">{k}</tspan>
          <tspan x={x + 44} fill="rgba(255,255,255,0.86)">
            {v}
          </tspan>
        </text>
      ))}
      <line x1={x - (side === 'left' ? 14 : 0)} y1={base} x2={x + width + (side === 'right' ? 14 : 0)} y2={base} stroke="rgba(255,255,255,0.3)" />
      <line x1={sx} y1={base} x2={target[0]} y2={target[1]} stroke="rgba(255,255,255,0.45)" />
      <circle cx={target[0]} cy={target[1]} r={3} fill={accent} />
    </g>
  );
}

/** Animated chevrons on the floor, pointing along +x. */
export function IsoChevrons({ at, count = 3, step = 16, size = 7, color = 'rgba(255,255,255,0.4)' }: { at: V3; count?: number; step?: number; size?: number; color?: string }) {
  const reduce = useReducedMotion();
  const [x, y, z] = at;
  return (
    <g fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {Array.from({ length: count }, (_, i) => {
        const cx = x + i * step;
        const p = pts([[cx - size / 2, y - size, z], [cx + size / 2, y, z], [cx - size / 2, y + size, z]]);
        return (
          <polyline key={i} points={p}>
            {!reduce && <animate attributeName="opacity" values="0.15;1;0.15" dur="1.4s" begin={`${i * 0.2}s`} repeatCount="indefinite" />}
          </polyline>
        );
      })}
    </g>
  );
}

/** A soft pulse ring, for "live" parts. */
export function Pulse({ cx, cy, r = 6, color = '#ff6b35' }: { cx: number; cy: number; r?: number; color?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={1.5}>
      <animate attributeName="r" values={`${r};${r * 3}`} dur="1.8s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.8;0" dur="1.8s" repeatCount="indefinite" />
    </circle>
  );
}

/** The card shell: title and ID chip, the SVG scene, then a status line and an action. */
export function IsoCard({ title, tag, status, action, onAction, accent = '#ff6b35', viewBox = '0 0 360 400', className, children, label }: { title: string; tag: string; status: string; action: string; onAction?: () => void; accent?: string; viewBox?: string; className?: string; children: ReactNode; label?: string }) {
  return (
    <article className={cn('w-full max-w-[400px] rounded-[28px] border border-white/10 bg-[#0b0b0d] p-6 text-white shadow-[0_40px_80px_-40px_rgba(0,0,0,0.9)]', className)}>
      <header className="flex items-center justify-between gap-3">
        <h3 className="text-[17px] font-medium tracking-tight">{title}</h3>
        <span className="rounded-lg border border-white/15 px-2.5 py-1 font-mono text-[11px] tracking-[0.18em] text-white/70">{tag}</span>
      </header>
      <svg viewBox={viewBox} className="mt-3 h-auto w-full select-none overflow-visible" role="img" aria-label={label || title} fontFamily="inherit">
        {children}
      </svg>
      <footer className="mt-3 flex items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2 text-[13px] text-white/45">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="shrink-0">
            <path d="M21 12a9 9 0 1 1-9-9" />
            <path d="M12 7v5l3 2" />
          </svg>
          <span className="truncate">{status}</span>
        </span>
        <button type="button" onClick={onAction} className="inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-[13.5px] font-semibold text-black transition-[filter,transform] hover:brightness-110 active:scale-[0.98]" style={{ backgroundColor: accent }}>
          {action}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </footer>
    </article>
  );
}
