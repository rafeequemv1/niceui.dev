import { useMemo, useState, type MouseEvent } from 'react';
import { ArrowUpRight, Eye, Heart, MousePointerClick, Users } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Reveal, useCountUp, useInView } from '@/pages/landing/shared/motion';
import { NetworkBadge, networkMap, type NetworkId } from './logos';
import { IMG, SectionHeading } from './shared';

const KPIS = [
  { label: 'Impressions', value: 2.48, suffix: 'M', decimals: 2, delta: '+24.1%', Icon: Eye },
  { label: 'Engagement rate', value: 6.2, suffix: '%', decimals: 1, delta: '+1.8 pts', Icon: Heart },
  { label: 'Followers gained', value: 18420, suffix: '', decimals: 0, delta: '+12.6%', Icon: Users },
  { label: 'Link clicks', value: 42910, suffix: '', decimals: 0, delta: '+31.0%', Icon: MousePointerClick },
];

const RANGES = { '7D': 7, '30D': 30, '90D': 45 } as const;
type Range = keyof typeof RANGES;

const W = 640;
const H = 220;
const PAD = 8;

function series(n: number, seed: number, lift: number) {
  return Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    const wave = Math.sin(i * 0.7 + seed) * 0.08 + Math.sin(i * 0.23 + seed * 2) * 0.12;
    return Math.max(0.08, Math.min(0.95, 0.25 + t * lift + wave));
  });
}

function smoothPath(pts: [number, number][]) {
  return pts.reduce((d, p, i, a) => {
    if (i === 0) return `M${p[0]},${p[1]}`;
    const p0 = a[i - 2] ?? a[i - 1];
    const p1 = a[i - 1];
    const p2 = p;
    const p3 = a[i + 1] ?? p;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    return `${d} C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`;
  }, '');
}

function Kpi({ k, active, delay }: { k: (typeof KPIS)[number]; active: boolean; delay: number }) {
  const v = useCountUp(k.value, active, 1800 + delay);
  const shown = k.decimals ? v.toFixed(k.decimals) : Math.round(v).toLocaleString();
  return (
    <div className="group rounded-2xl border border-stone-200 bg-white p-4 transition-all duration-300 ease-spring hover:-translate-y-1 hover:shadow-[0_16px_32px_-16px_rgba(28,25,23,0.25)] sm:p-5">
      <div className="flex items-center justify-between">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FFF3EE] text-[#FF5A36] transition-transform duration-300 group-hover:scale-110">
          <k.Icon className="h-4 w-4" />
        </span>
        <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
          <ArrowUpRight className="h-3 w-3" />
          {k.delta}
        </span>
      </div>
      <div className="mt-4 text-2xl font-medium tabular-nums tracking-tight text-stone-900 sm:text-3xl">
        {shown}
        <span className="text-stone-400">{k.suffix}</span>
      </div>
      <div className="mt-1 text-xs text-stone-500">{k.label}</div>
    </div>
  );
}

function Chart({ active }: { active: boolean }) {
  const [range, setRange] = useState<Range>('30D');
  const [hover, setHover] = useState<number | null>(null);
  const n = RANGES[range];

  const { cur, prev, line, prevLine, area, pts } = useMemo(() => {
    const cur = series(n, n * 0.37, 0.5);
    const prev = series(n, n * 0.91 + 2, 0.25).map((v) => v * 0.8);
    const toPts = (s: number[]) =>
      s.map((v, i) => [PAD + (i / (n - 1)) * (W - PAD * 2), H - PAD - v * (H - PAD * 2)] as [number, number]);
    const pts = toPts(cur);
    const line = smoothPath(pts);
    return { cur, prev, pts, line, prevLine: smoothPath(toPts(prev)), area: `${line} L${W - PAD},${H} L${PAD},${H} Z` };
  }, [n]);

  const onMove = (e: MouseEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W;
    setHover(Math.max(0, Math.min(n - 1, Math.round(((x - PAD) / (W - PAD * 2)) * (n - 1)))));
  };

  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-4 shadow-[0_24px_48px_-24px_rgba(28,25,23,0.25)] sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-stone-900">Engagement over time</div>
          <div className="mt-1 flex items-center gap-4 text-xs text-stone-500">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#FF5A36]" /> This period</span>
            <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-stone-300" /> Previous</span>
          </div>
        </div>
        <div className="flex rounded-full bg-stone-100 p-1">
          {(Object.keys(RANGES) as Range[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={cn('rounded-full px-3 py-1 font-mono text-xs transition-all', range === r ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800')}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      <div className="relative mt-6">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-56 w-full overflow-visible sm:h-64" preserveAspectRatio="none" onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
          <defs>
            <linearGradient id="cad-area" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#FF5A36" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#FF5A36" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((g) => (
            <line key={g} x1={0} x2={W} y1={H * g} y2={H * g} stroke="#E7E5E4" strokeDasharray="3 5" vectorEffect="non-scaling-stroke" />
          ))}
          <g key={range}>
            <path d={prevLine} fill="none" stroke="#D6D3D1" strokeWidth="1.5" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
            <path d={area} fill="url(#cad-area)" className={cn('transition-opacity delay-700 duration-1000', active ? 'opacity-100' : 'opacity-0')} />
            <path
              d={line}
              fill="none"
              stroke="#FF5A36"
              strokeWidth="2.5"
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="1"
              className={active ? 'cad-draw' : 'opacity-0'}
            />
          </g>
          {hover !== null && (
            <line x1={pts[hover][0]} x2={pts[hover][0]} y1={0} y2={H} stroke="#1C1917" strokeOpacity="0.25" vectorEffect="non-scaling-stroke" />
          )}
        </svg>
        {hover !== null && (
          <>
            <span
              className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#FF5A36] shadow"
              style={{ left: `${(pts[hover][0] / W) * 100}%`, top: `${(pts[hover][1] / H) * 100}%` }}
            />
            <div
              className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-xl bg-stone-900 px-3 py-2 text-xs text-white shadow-xl"
              style={{ left: `${Math.min(88, Math.max(12, (pts[hover][0] / W) * 100))}%` }}
            >
              <div className="font-mono text-stone-400">Day {hover + 1}</div>
              <div className="font-medium">{Math.round(cur[hover] * 12000).toLocaleString()} engagements</div>
              <div className="text-emerald-400">+{Math.round(((cur[hover] - prev[hover]) / prev[hover]) * 100)}% vs prev</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const BREAKDOWN: { id: NetworkId; pct: number; value: string }[] = [
  { id: 'instagram', pct: 86, value: '1.02M' },
  { id: 'tiktok', pct: 72, value: '846K' },
  { id: 'linkedin', pct: 48, value: '312K' },
  { id: 'x', pct: 36, value: '204K' },
  { id: 'youtube', pct: 22, value: '98K' },
];

const TOP = [
  { title: 'Latte art in 15 seconds', id: 'tiktok' as NetworkId, img: IMG.cappuccino, eng: '84.2K', rate: '11.4%' },
  { title: 'Our cold brew, explained', id: 'instagram' as NetworkId, img: IMG.latte, eng: '42.7K', rate: '8.9%' },
  { title: 'How we hire for craft', id: 'linkedin' as NetworkId, img: IMG.interior, eng: '18.1K', rate: '7.2%' },
];

export function Analytics() {
  const { ref, inView } = useInView<HTMLDivElement>(0.2);
  return (
    <section id="analytics" className="scroll-mt-20 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Analytics"
          title="Know what works."
          accent="Do more of it."
          body="Every network in one beautifully clear dashboard. No spreadsheets, no exports — just the numbers that move your strategy."
        />
        <div ref={ref} className="mt-16 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {KPIS.map((k, i) => (
            <Reveal key={k.label} delay={i * 80}>
              <Kpi k={k} active={inView} delay={i * 120} />
            </Reveal>
          ))}
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)]">
          <Reveal>
            <Chart active={inView} />
          </Reveal>
          <Reveal delay={120}>
            <div className="h-full rounded-3xl border border-stone-200 bg-white p-4 shadow-[0_24px_48px_-24px_rgba(28,25,23,0.25)] sm:p-6">
              <div className="text-sm font-medium text-stone-900">Reach by network</div>
              <div className="mt-5 space-y-4">
                {BREAKDOWN.map((b, i) => (
                  <div key={b.id}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 text-stone-700">
                        <NetworkBadge id={b.id} size="xs" /> {networkMap[b.id].name}
                      </span>
                      <span className="font-mono text-stone-500">{b.value}</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-100">
                      <div
                        className="h-full rounded-full transition-[width] duration-1000 ease-spring"
                        style={{
                          width: inView ? `${b.pct}%` : '0%',
                          transitionDelay: `${300 + i * 120}ms`,
                          background: b.id === 'instagram' ? 'linear-gradient(90deg,#fd5949,#d6249f)' : b.id === 'tiktok' ? 'linear-gradient(90deg,#25F4EE,#FE2C55)' : networkMap[b.id].color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 text-sm font-medium text-stone-900">Top posts</div>
              <div className="mt-3 space-y-2">
                {TOP.map((p) => (
                  <div key={p.title} className="flex items-center gap-3 rounded-xl p-1.5 transition-colors hover:bg-stone-50">
                    <div className="relative h-10 w-10 shrink-0">
                      <img src={p.img} alt="" loading="lazy" className="h-full w-full rounded-lg object-cover" />
                      <NetworkBadge id={p.id} size="xs" className="absolute -bottom-1 -right-1 !h-4 !w-4 ring-2 ring-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-medium text-stone-900">{p.title}</div>
                      <div className="text-[11px] text-stone-500">{p.eng} engagements</div>
                    </div>
                    <span className="font-mono text-xs text-emerald-700">{p.rate}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
