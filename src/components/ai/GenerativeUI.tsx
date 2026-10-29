import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { CalendarCheck, CalendarPlus, Check, Cloud, CloudSun, MapPin, Plane, Sun, TrendingUp, Wrench } from 'lucide-react';
import { cn } from '@/lib/cn';

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Shows a skeleton while the tool runs, then swaps in the rendered card. */
export function ToolCard({ tool, loading, children }: { tool: string; loading: boolean; children: ReactNode }) {
  return (
    <div className="w-full min-w-0 space-y-2">
      <p className="flex items-center gap-1.5 font-mono text-[11px] text-ink-500">
        <Wrench className="h-3 w-3" />
        <span className={cn(loading && 'shimmer-text')}>{loading ? `Calling ${tool}…` : `Called ${tool}`}</span>
      </p>
      {loading ? (
        <div className="space-y-3 rounded-2xl bg-ink-900 p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-xl bg-white/[0.06]" />
            <div className="flex-1 space-y-2">
              <div className="h-2.5 w-1/3 animate-pulse rounded-full bg-white/[0.06]" />
              <div className="h-2.5 w-1/2 animate-pulse rounded-full bg-white/[0.04]" />
            </div>
          </div>
          <div className="h-16 animate-pulse rounded-xl bg-white/[0.04]" />
        </div>
      ) : (
        <div className="animate-scale-in">{children}</div>
      )}
    </div>
  );
}

/* ——— Weather ——— */

const HOURS = [
  ['Now', 'sun', 23],
  ['14:00', 'sun', 24],
  ['15:00', 'part', 24],
  ['16:00', 'part', 22],
  ['17:00', 'cloud', 21],
  ['18:00', 'cloud', 19],
] as const;

export function WeatherCard({ city = 'Lisbon' }: { city?: string }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500/20 via-ink-900 to-ink-900 p-4 shadow-card ring-1 ring-white/5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1 text-xs text-ink-400">
            <MapPin className="h-3 w-3" /> {city}
          </p>
          <p className="mt-1 text-5xl font-light tracking-tight text-ink-50">23°</p>
          <p className="text-sm text-ink-300">Sunny intervals · H 25° L 16°</p>
        </div>
        <div className="relative h-16 w-16 shrink-0">
          <Sun className="absolute right-1 top-0 h-11 w-11 animate-spin-slow text-amber-300 [animation-duration:18s]" />
          <Cloud className="absolute bottom-1 left-0 h-9 w-9 animate-float fill-ink-200/90 text-ink-200" />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-6 gap-1 rounded-xl bg-white/[0.03] p-2">
        {HOURS.map(([h, k, t]) => {
          const Icon = k === 'sun' ? Sun : k === 'part' ? CloudSun : Cloud;
          return (
            <div key={h} className="flex min-w-0 flex-col items-center gap-1 py-1">
              <span className="truncate text-[10px] text-ink-500">{h}</span>
              <Icon className={cn('h-4 w-4', k === 'sun' ? 'text-amber-300' : 'text-ink-300')} />
              <span className="font-mono text-[11px] text-ink-100">{t}°</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ——— Stock ——— */

const RANGES = { '1D': 0.6, '1W': 1.4, '1M': 2.6, '1Y': 5 } as const;
type Range = keyof typeof RANGES;

function series(range: Range) {
  const vol = RANGES[range];
  let v = 172;
  return Array.from({ length: 48 }, (_, i) => {
    v += Math.sin(i * 0.7 + vol) * vol * 0.9 + Math.cos(i * 0.23 * vol) * vol * 0.6 + vol * 0.12;
    return v;
  });
}

export function StockCard() {
  const [range, setRange] = useState<Range>('1M');
  const [hover, setHover] = useState<number | null>(null);
  const data = useMemo(() => series(range), [range]);
  const min = Math.min(...data);
  const max = Math.max(...data);
  const W = 300;
  const H = 90;
  const pts = data.map((v, i) => [(i / (data.length - 1)) * W, H - ((v - min) / (max - min || 1)) * (H - 10) - 5] as const);
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const last = data[data.length - 1];
  const change = ((last - data[0]) / data[0]) * 100;
  const shown = hover ?? data.length - 1;

  return (
    <div className="rounded-2xl bg-ink-900 p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-ink-500">NOVA · Nova Robotics</p>
          <p className="mt-0.5 font-mono text-2xl tabular-nums text-ink-50">${data[shown].toFixed(2)}</p>
          <p className={cn('flex items-center gap-1 font-mono text-xs', change >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
            <TrendingUp className="h-3 w-3" />
            {change >= 0 ? '+' : ''}
            {change.toFixed(2)}% · {range}
          </p>
        </div>
        <div className="flex rounded-lg bg-white/[0.04] p-0.5" role="tablist" aria-label="Range">
          {(Object.keys(RANGES) as Range[]).map((r) => (
            <button key={r} role="tab" aria-selected={r === range} onClick={() => setRange(r)} className={cn('focus-ring rounded-md px-2 py-1 font-mono text-[11px] transition-colors', r === range ? 'bg-ink-800 text-ink-50 shadow-hairline' : 'text-ink-500 hover:text-ink-200')}>
              {r}
            </button>
          ))}
        </div>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-3 h-24 w-full touch-none overflow-visible"
        preserveAspectRatio="none"
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setHover(Math.max(0, Math.min(data.length - 1, Math.round(((e.clientX - r.left) / r.width) * (data.length - 1)))));
        }}
        onPointerLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id="gen-ui-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#38bdf8" stopOpacity="0.35" />
            <stop offset="1" stopColor="#38bdf8" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${line} L${W},${H} L0,${H} Z`} fill="url(#gen-ui-fill)" />
        <path key={range} d={line} fill="none" stroke="#38bdf8" strokeWidth="1.8" vectorEffect="non-scaling-stroke" pathLength={1} strokeDasharray="1" className="[animation:gen-ui-draw_900ms_cubic-bezier(0.16,1,0.3,1)_both]" />
        {hover !== null && (
          <>
            <line x1={pts[hover][0]} x2={pts[hover][0]} y1="0" y2={H} stroke="rgba(255,255,255,0.15)" vectorEffect="non-scaling-stroke" />
            <circle cx={pts[hover][0]} cy={pts[hover][1]} r="3" fill="#7dd3fc" />
          </>
        )}
      </svg>
      <style>{'@keyframes gen-ui-draw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}'}</style>
    </div>
  );
}

/* ——— Flights ——— */

const FLIGHTS = [
  { id: 'a', air: 'Aero Lumen', code: 'AL', dep: '07:10', arr: '19:05', dur: '10h 55m', stops: 'Nonstop', price: 612 },
  { id: 'b', air: 'Skyline', code: 'SK', dep: '09:45', arr: '23:30', dur: '12h 45m', stops: '1 stop · BOS', price: 498 },
  { id: 'c', air: 'Northwind Air', code: 'NW', dep: '13:20', arr: '07:15+1', dur: '16h 55m', stops: '1 stop · JFK', price: 451 },
];

export function FlightOptions() {
  const [sel, setSel] = useState('a');
  const [booked, setBooked] = useState(false);
  return (
    <div className="rounded-2xl bg-ink-900 p-3 shadow-card">
      <p className="flex items-center gap-1.5 px-1 pb-2 text-xs text-ink-400">
        <Plane className="h-3.5 w-3.5" /> SFO → LIS · Thu 14 May · 1 adult
      </p>
      <div role="radiogroup" aria-label="Flights" className="space-y-1.5">
        {FLIGHTS.map((f) => (
          <button
            key={f.id}
            role="radio"
            aria-checked={sel === f.id}
            disabled={booked}
            onClick={() => setSel(f.id)}
            className={cn('focus-ring flex w-full min-w-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left ring-1 transition-all', sel === f.id ? 'bg-brand-500/10 ring-brand-400/40' : 'bg-white/[0.02] ring-white/5 hover:bg-white/[0.04]')}
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/[0.06] font-mono text-[11px] font-semibold text-ink-200">{f.code}</span>
            <span className="min-w-0 flex-1">
              <span className="block font-mono text-sm tabular-nums text-ink-50">
                {f.dep} – {f.arr}
              </span>
              <span className="block truncate text-[11px] text-ink-500">
                {f.air} · {f.dur} · {f.stops}
              </span>
            </span>
            <span className="font-mono text-sm text-ink-100">${f.price}</span>
          </button>
        ))}
      </div>
      <button
        onClick={() => setBooked(true)}
        disabled={booked}
        className={cn('focus-ring mt-3 flex h-9 w-full items-center justify-center gap-1.5 rounded-xl text-sm font-medium transition-all active:scale-[0.98]', booked ? 'bg-emerald-500/15 text-emerald-300' : 'bg-brand-500 text-white hover:bg-brand-400')}
      >
        {booked ? (
          <>
            <Check className="h-4 w-4" /> Held for 24h · seat 14A
          </>
        ) : (
          `Select ${FLIGHTS.find((f) => f.id === sel)!.air} · $${FLIGHTS.find((f) => f.id === sel)!.price}`
        )}
      </button>
    </div>
  );
}

/* ——— Calendar ——— */

export function EventCard() {
  const [added, setAdded] = useState(false);
  return (
    <div className="flex gap-4 rounded-2xl bg-ink-900 p-4 shadow-card">
      <div className="flex w-14 shrink-0 flex-col items-center overflow-hidden rounded-xl bg-white/[0.04] ring-1 ring-white/5">
        <span className="w-full bg-rose-500/80 py-0.5 text-center text-[10px] font-semibold uppercase tracking-wider text-white">May</span>
        <span className="py-1.5 text-2xl font-light text-ink-50">14</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink-50">Coffee with Ana · roadmap</p>
        <p className="mt-0.5 text-xs text-ink-400">Thu · 10:30 – 11:00 · Café Dama</p>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex -space-x-1.5">
            {['#7dd3fc', '#f9a8d4'].map((c, i) => (
              <span key={c} className="grid h-5 w-5 place-items-center rounded-full text-[9px] font-semibold text-ink-950 ring-2 ring-ink-900" style={{ background: c }}>
                {i ? 'A' : 'Y'}
              </span>
            ))}
          </div>
          <span className="text-[11px] text-ink-500">You, Ana · no conflicts</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={() => setAdded(true)} disabled={added} className={cn('focus-ring flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition-all active:scale-95', added ? 'bg-emerald-500/15 text-emerald-300' : 'bg-ink-50 text-ink-950 hover:bg-white')}>
            {added ? <CalendarCheck className="h-3.5 w-3.5" /> : <CalendarPlus className="h-3.5 w-3.5" />}
            {added ? 'Added to calendar' : 'Add to calendar'}
          </button>
          {!added && <button className="focus-ring h-8 rounded-lg px-3 text-xs text-ink-400 ring-1 ring-white/10 transition-colors hover:text-ink-100">Edit</button>}
        </div>
      </div>
    </div>
  );
}

/* ——— Demo thread ——— */

const ASKS = [
  { key: 'weather', label: 'Weather', prompt: 'What’s the weather in Lisbon this afternoon?', tool: 'get_weather', card: <WeatherCard /> },
  { key: 'stock', label: 'Stocks', prompt: 'How is Nova Robotics trading this month?', tool: 'get_quote', card: <StockCard /> },
  { key: 'flights', label: 'Flights', prompt: 'Find me flights from SFO to Lisbon on the 14th.', tool: 'search_flights', card: <FlightOptions /> },
  { key: 'calendar', label: 'Calendar', prompt: 'Book coffee with Ana on Thursday morning.', tool: 'create_event', card: <EventCard /> },
];

export function GenerativeUIDemo() {
  const [k, setK] = useState(0);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (reduced()) return setLoading(false);
    setLoading(true);
    const id = window.setTimeout(() => setLoading(false), 1100);
    return () => clearTimeout(id);
  }, [k]);
  const a = ASKS[k];
  return (
    <div className="mx-auto w-full max-w-md space-y-3">
      <div className="flex flex-wrap justify-center gap-1.5">
        {ASKS.map((x, i) => (
          <button key={x.key} onClick={() => setK(i)} className={cn('focus-ring rounded-full px-3 py-1 text-xs transition-colors', i === k ? 'bg-ink-50 text-ink-950' : 'bg-white/[0.04] text-ink-400 ring-1 ring-white/10 hover:text-ink-100')}>
            {x.label}
          </button>
        ))}
      </div>
      <div key={a.key} className="space-y-3">
        <div className="flex justify-end">
          <p className="max-w-[85%] rounded-2xl rounded-br-md bg-brand-500/90 px-3.5 py-2 text-sm text-white animate-fade-up">{a.prompt}</p>
        </div>
        <ToolCard tool={a.tool} loading={loading}>
          {a.card}
        </ToolCard>
      </div>
    </div>
  );
}
