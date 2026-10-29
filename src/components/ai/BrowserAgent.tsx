import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  ArrowDown,
  Bot,
  CalendarDays,
  Check,
  Eye,
  Globe,
  Hand,
  Keyboard,
  Loader2,
  Lock,
  MousePointerClick,
  Pause,
  Play,
  Plus,
  RotateCcw,
  RotateCw,
  Search,
  X,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { useInView } from '@/pages/landing/shared/motion';

/* The agent's screen is drawn at a fixed size and scaled to fit, like a live screenshot. */
const W = 600;
const H = 380;

export type BrowserAction = 'navigate' | 'wait' | 'click' | 'type' | 'select' | 'scroll' | 'read' | 'done';
export type BrowserStep = { at: number; action: BrowserAction; label: string; detail?: string };

const ICON: Record<BrowserAction, typeof Globe> = {
  navigate: Globe,
  wait: Loader2,
  click: MousePointerClick,
  type: Keyboard,
  select: CalendarDays,
  scroll: ArrowDown,
  read: Eye,
  done: Check,
};

const URL = 'skyway.travel/flights';
const STEPS: BrowserStep[] = [
  { at: 0, action: 'navigate', label: `Open ${URL}` },
  { at: 900, action: 'wait', label: 'Wait for the page to load' },
  { at: 1500, action: 'click', label: 'Click the “To” field' },
  { at: 2100, action: 'type', label: 'Type “Tokyo (HND)”' },
  { at: 3200, action: 'select', label: 'Pick Fri, 14 Nov' },
  { at: 3900, action: 'click', label: 'Click “Search flights”' },
  { at: 5300, action: 'scroll', label: 'Scroll through 4 results' },
  { at: 6500, action: 'read', label: 'Compare nonstop fares' },
  { at: 7600, action: 'done', label: 'Cheapest nonstop is $612', detail: 'Pacifica PA 11, 10:45 → 14:55. Skipped $498 (1 stop).' },
];
const TOTAL = 8000;

/* Rects on the agent's screen, in screen units. */
const FIELD = {
  from: { x: 24, y: 138, w: 132, h: 46 },
  to: { x: 164, y: 138, w: 150, h: 46 },
  date: { x: 322, y: 138, w: 122, h: 46 },
  search: { x: 452, y: 138, w: 124, h: 46 },
};
const ROW_Y = 252;
const ROW_H = 62;
const ROW_GAP = 8;
const SCROLL = 176;

const FLIGHTS = [
  { code: 'ZE', name: 'Zephyr', no: 'ZE 22', dep: '07:10', arr: '16:35 +1', dur: '15h 25m', stops: '1 stop · ICN', price: 498, color: 'bg-amber-500' },
  { code: 'PA', name: 'Pacifica', no: 'PA 11', dep: '10:45', arr: '14:55 +1', dur: '11h 10m', stops: 'Nonstop', price: 612, color: 'bg-sky-600' },
  { code: 'KT', name: 'Kite Airways', no: 'KT 7', dep: '13:20', arr: '17:45 +1', dur: '11h 25m', stops: 'Nonstop', price: 689, color: 'bg-rose-500' },
  { code: 'NL', name: 'Northline', no: 'NL 870', dep: '16:05', arr: '23:10 +1', dur: '14h 05m', stops: '1 stop · SEA', price: 734, color: 'bg-emerald-600' },
];

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
const phase = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const center = (r: { x: number; y: number; w: number; h: number }) => ({ x: r.x + r.w * 0.55, y: r.y + r.h * 0.6 });

function useReducedMotion() {
  const [reduce] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  return reduce;
}

/** Where the agent is looking at time t: cursor target, labelled highlight and click ripple. */
function focusAt(t: number, scroll: number) {
  const row = (i: number) => ({ x: 16, y: ROW_Y + i * (ROW_H + ROW_GAP), w: W - 32, h: ROW_H });
  if (t < 1500) return { cursor: null, box: null, label: '', click: -1 };
  if (t < 2100) return { cursor: center(FIELD.to), box: FIELD.to, label: 'Click · To', click: 2050 };
  if (t < 3200) return { cursor: center(FIELD.to), box: FIELD.to, label: 'Type · Tokyo (HND)', click: -1 };
  if (t < 3900) return { cursor: center(FIELD.date), box: FIELD.date, label: 'Select · Fri 14 Nov', click: 3650 };
  if (t < 5300) return { cursor: center(FIELD.search), box: FIELD.search, label: 'Click · Search flights', click: 4400 };
  if (t < 6500) return { cursor: { x: 300, y: 300 }, box: null, label: '', click: -1 };
  const r = row(1);
  return { cursor: { x: 470, y: r.y + r.h / 2 - scroll }, box: r, label: t < 7600 ? 'Read · $612 nonstop' : 'Answer · $612 nonstop', click: -1 };
}

export type BrowserAgentProps = {
  /** The instruction shown above the browser. */
  task?: string;
  /** Start as soon as the component scrolls into view. */
  autoPlay?: boolean;
  onDone?: () => void;
  className?: string;
};

/** A computer-use view: the agent drives a browser while a synced step log narrates each action. */
export function BrowserAgent({ task = 'Find the cheapest nonstop flight from SFO to Tokyo on Fri, 14 Nov', autoPlay = true, onDone, className }: BrowserAgentProps) {
  const reduce = useReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>(0.2);
  const [t, setT] = useState(reduce ? TOTAL : 0);
  const [paused, setPaused] = useState(!autoPlay);
  const [human, setHuman] = useState(false);
  const [run, setRun] = useState(0);
  const tRef = useRef(t);
  tRef.current = t;
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (reduce || !inView || paused || human || tRef.current >= TOTAL) return;
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    const tick = (now: number) => {
      const dt = Math.max(0, now - last);
      last = now;
      const next = Math.min(TOTAL, tRef.current + dt);
      tRef.current = next;
      acc += dt;
      if (acc > 30 || next >= TOTAL) {
        acc = 0;
        setT(next);
      }
      if (next < TOTAL) raf = requestAnimationFrame(tick);
      else doneRef.current?.();
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, paused, human, run, reduce]);

  const replay = () => {
    tRef.current = 0;
    setT(0);
    setPaused(false);
    setHuman(false);
    setRun((r) => r + 1);
  };

  const done = t >= TOTAL;
  const active = STEPS.reduce((acc, s, i) => (t >= s.at ? i : acc), 0);
  const scroll = ease(phase(t, 5600, 6400)) * SCROLL;
  const focus = focusAt(t, scroll);
  const status = done ? 'Done' : human ? 'You have control' : paused ? 'Paused' : 'Browsing';

  return (
    <div ref={ref} className={cn('w-full overflow-hidden rounded-2xl bg-ink-900 text-left shadow-card', className)}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-white/5 px-4 py-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500/15 text-brand-300">
          <Bot className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-sm font-medium text-ink-100">
            Browser agent
            <span className={cn('inline-flex items-center gap-1 rounded-full px-1.5 py-px text-[10.5px] font-medium', done ? 'bg-emerald-500/10 text-emerald-300' : human ? 'bg-amber-500/10 text-amber-300' : 'bg-brand-500/10 text-brand-300')}>
              <span className={cn('h-1.5 w-1.5 rounded-full', done ? 'bg-emerald-400' : human ? 'bg-amber-400' : paused ? 'bg-brand-400' : 'animate-pulse bg-brand-400')} />
              {status}
            </span>
          </p>
          <p className="truncate text-xs text-ink-500">{task}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="mr-1 font-mono text-[11px] tabular-nums text-ink-500">{(t / 1000).toFixed(1)}s</span>
          {!done && (
            <CtrlButton onClick={() => setPaused((p) => !p)} disabled={human} label={paused ? 'Resume agent' : 'Pause agent'}>
              {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{paused ? 'Resume' : 'Pause'}</span>
            </CtrlButton>
          )}
          {!done && (
            <CtrlButton onClick={() => setHuman((h) => !h)} label={human ? 'Hand control back to the agent' : 'Take over the browser'} tone={human ? 'amber' : 'default'}>
              {human ? <Bot className="h-3.5 w-3.5" /> : <Hand className="h-3.5 w-3.5" />}
              {human ? 'Hand back' : 'Take over'}
            </CtrlButton>
          )}
          {done && (
            <CtrlButton onClick={replay} label="Replay the run">
              <RotateCcw className="h-3.5 w-3.5" /> Replay
            </CtrlButton>
          )}
        </div>
      </div>

      <div className="grid gap-3 p-3 md:grid-cols-[minmax(0,1fr)_224px]">
        <BrowserFrame
          url={t < 900 ? URL.slice(0, Math.floor(phase(t, 80, 860) * URL.length)) : URL}
          typing={t < 900}
          loading={t >= 900 && t < 1500 ? phase(t, 900, 1500) : null}
          title={t < 1500 ? 'New tab' : 'Skyway · Flights'}
          human={human}
        >
          <AgentScreen t={t} scroll={scroll} />
          {focus.box && !human && (
            <div className="pointer-events-none absolute z-10 rounded-[10px] border-2 border-brand-500 bg-brand-400/10 transition-all duration-500 ease-smooth" style={{ left: focus.box.x - 4, top: focus.box.y - 4 - (focus.box === FIELD.to || focus.box === FIELD.date || focus.box === FIELD.search ? 0 : scroll), width: focus.box.w + 8, height: focus.box.h + 8 }}>
              <span className="absolute -top-[22px] left-0 whitespace-nowrap rounded-md bg-brand-500 px-1.5 py-0.5 text-[11px] font-medium text-white shadow-lg">{focus.label}</span>
            </div>
          )}
          {focus.cursor && !human && <AgentCursor x={focus.cursor.x} y={focus.cursor.y} clicking={focus.click > 0 && t >= focus.click && t < focus.click + 450} />}
        </BrowserFrame>

        <StepLog t={t} active={active} done={done} />
      </div>
    </div>
  );
}

function CtrlButton({ children, onClick, label, disabled, tone = 'default' }: { children: ReactNode; onClick: () => void; label: string; disabled?: boolean; tone?: 'default' | 'amber' }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        'focus-ring flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-all active:scale-95 disabled:opacity-40',
        tone === 'amber' ? 'bg-amber-400/15 text-amber-200 hover:bg-amber-400/25' : 'bg-white/[0.04] text-ink-200 shadow-hairline hover:bg-white/[0.08] hover:text-ink-50',
      )}
    >
      {children}
    </button>
  );
}

export type BrowserFrameProps = {
  url: string;
  title: string;
  /** Show a caret in the address bar while the agent types. */
  typing?: boolean;
  /** 0–1 page-load progress, or null when idle. */
  loading?: number | null;
  /** Amber outline and banner while a person is in control. */
  human?: boolean;
  /** Screen content, drawn at 600 × 380 and scaled to fit. */
  children: ReactNode;
  className?: string;
};

/** Browser chrome around a scaled agent screen. */
export function BrowserFrame({ url, title, typing, loading = null, human, children, className }: BrowserFrameProps) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.9);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(el.clientWidth / W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className={cn('min-w-0 overflow-hidden rounded-xl bg-ink-850 ring-1 transition-shadow duration-300', human ? 'ring-2 ring-amber-400/70' : 'ring-white/10', className)}>
      <div className="flex items-center gap-2 px-3 pt-2.5">
        <span className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-2.5 w-2.5 rounded-full bg-white/10" />
          ))}
        </span>
        <span className="ml-2 flex min-w-0 max-w-[60%] items-center gap-2 rounded-t-lg bg-ink-800 px-3 py-1.5 text-[11px] text-ink-300">
          <span className="grid h-3.5 w-3.5 shrink-0 place-items-center rounded-[4px] bg-indigo-500 text-[7px] font-bold text-white">S</span>
          <span className="truncate">{title}</span>
          <X className="h-3 w-3 shrink-0 text-ink-500" />
        </span>
        <Plus className="h-3.5 w-3.5 text-ink-500" />
      </div>
      <div className="relative flex items-center gap-2 bg-ink-800 px-3 py-2">
        <RotateCw className="h-3.5 w-3.5 shrink-0 text-ink-500" />
        <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-full bg-ink-950/70 px-3 py-1.5 font-mono text-[11px] text-ink-200 ring-1 ring-white/5">
          <Lock className="h-3 w-3 shrink-0 text-ink-500" />
          <span className="truncate">{url || <span className="text-ink-500">Search or type a URL</span>}</span>
          {typing && <span className="-ml-1 inline-block h-3.5 w-[1.5px] shrink-0 animate-blink bg-brand-300" />}
        </div>
        {loading !== null && <span className="absolute bottom-0 left-0 h-[2px] bg-brand-400 transition-[width] duration-200" style={{ width: `${loading * 100}%` }} />}
      </div>
      <div ref={box} className="relative w-full overflow-hidden" style={{ height: H * scale }}>
        <div className="absolute left-0 top-0 origin-top-left" style={{ width: W, height: H, transform: `scale(${scale})` }}>
          {children}
        </div>
        {human && (
          <div className="absolute inset-x-0 top-2 z-30 flex justify-center animate-fade-down">
            <span className="flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1 text-[11px] font-semibold text-ink-950 shadow-lg">
              <Hand className="h-3 w-3" /> You have control · the agent is waiting
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/** The agent's pointer with a name tag and an optional click ripple. Coordinates are in screen units. */
export function AgentCursor({ x, y, clicking, name = 'Agent' }: { x: number; y: number; clicking?: boolean; name?: string }) {
  return (
    <div className="pointer-events-none absolute left-0 top-0 z-20 transition-transform duration-[650ms] ease-smooth" style={{ transform: `translate(${x}px, ${y}px)` }}>
      {clicking && <span className="absolute -left-4 -top-4 h-8 w-8 rounded-full border-2 border-brand-500 animate-pulse-ring" />}
      <svg width="20" height="22" viewBox="0 0 20 22" className="drop-shadow-[0_2px_3px_rgba(0,0,0,0.35)]" aria-hidden="true">
        <path d="M2 2 L2 17.5 L6.3 13.6 L9.3 20 L12.2 18.7 L9.3 12.5 L15 12.3 Z" fill="#0b0c0e" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
      <span className="absolute left-4 top-5 whitespace-nowrap rounded-full bg-brand-500 px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-md">{name}</span>
    </div>
  );
}

/* ——— The mock site the agent is using (light, like a real web page) ——— */

function AgentScreen({ t, scroll }: { t: number; scroll: number }) {
  if (t < 900) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#f4f5f8]">
        <span className="text-[22px] font-semibold tracking-tight text-zinc-300">New tab</span>
        <span className="flex h-10 w-[340px] items-center gap-2 rounded-full bg-white px-4 text-[12px] text-zinc-400 shadow-sm ring-1 ring-zinc-200">
          <Search className="h-3.5 w-3.5" /> Search or type a URL
        </span>
      </div>
    );
  }
  if (t < 1500) {
    return (
      <div className="absolute inset-0 animate-pulse bg-[#f4f5f8]">
        <div className="h-11 border-b border-zinc-200 bg-white" />
        <div className="ml-6 mt-6 h-5 w-48 rounded bg-zinc-200" />
        <div className="ml-6 mt-2 h-3 w-64 rounded bg-zinc-200/70" />
        <div className="mx-4 mt-6 h-[66px] rounded-2xl bg-white ring-1 ring-zinc-200" />
        {[0, 1].map((i) => (
          <div key={i} className="mx-4 mt-3 h-[62px] rounded-xl bg-white/70 ring-1 ring-zinc-200" />
        ))}
      </div>
    );
  }

  const to = 'Tokyo (HND)'.slice(0, Math.floor(phase(t, 2150, 3100) * 11));
  const dated = t >= 3650;
  const searching = t >= 4400 && t < 5300;
  const shown = t >= 5300;
  const picked = t >= 6900;

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#f4f5f8] text-zinc-900">
      <div className="absolute inset-x-0 top-0" style={{ transform: `translateY(${-scroll}px)` }}>
        <div className="flex h-11 items-center justify-between border-b border-zinc-200 bg-white px-6">
          <span className="flex items-center gap-1.5 text-[15px] font-semibold tracking-tight">
            <span className="grid h-5 w-5 place-items-center rounded-md bg-indigo-500 text-[10px] font-bold text-white">S</span>
            skyway
          </span>
          <span className="flex gap-5 text-[12px] text-zinc-500">
            <b className="font-medium text-zinc-900">Flights</b>
            <span>Hotels</span>
            <span>Deals</span>
          </span>
          <span className="rounded-full px-3 py-1 text-[11px] text-zinc-600 ring-1 ring-zinc-300">Sign in</span>
        </div>
        <div className="px-6 pt-5">
          <p className="text-[21px] font-semibold tracking-[-0.02em]">Where to next?</p>
          <p className="mt-0.5 text-[12px] text-zinc-500">Compare 600+ airlines in seconds.</p>
        </div>
        <div className="absolute left-4 top-[126px] h-[70px] w-[568px] rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)] ring-1 ring-zinc-200" />
        <Field rect={FIELD.from} label="From" value="San Francisco (SFO)" />
        <Field rect={FIELD.to} label="To" value={to} placeholder="City or airport" active={t >= 2050 && t < 3200} />
        <Field rect={FIELD.date} label="Depart" value={dated ? 'Fri, 14 Nov' : ''} placeholder="Any date" />
        <div className={cn('absolute flex items-center justify-center gap-1.5 rounded-xl text-[13px] font-semibold text-white transition-colors', searching ? 'bg-indigo-400' : 'bg-indigo-600')} style={{ left: FIELD.search.x, top: FIELD.search.y, width: FIELD.search.w, height: FIELD.search.h }}>
          {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          {searching ? 'Searching' : 'Search flights'}
        </div>
        <div className={cn('absolute left-6 right-6 flex items-center justify-between text-[11.5px] text-zinc-500 transition-opacity duration-300', shown ? 'opacity-100' : 'opacity-0')} style={{ top: ROW_Y - 30 }}>
          <span>
            <b className="font-semibold text-zinc-900">4 flights</b> · SFO → HND · Fri, 14 Nov
          </span>
          <span>Sort: Price</span>
        </div>
        {FLIGHTS.map((f, i) => (
          <div
            key={f.no}
            className={cn('absolute left-4 flex items-center gap-3 rounded-xl bg-white px-3.5 ring-1 transition-all duration-500 ease-smooth', shown ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0', i === 1 && picked ? 'ring-2 ring-emerald-500' : 'ring-zinc-200')}
            style={{ top: ROW_Y + i * (ROW_H + ROW_GAP), width: W - 32, height: ROW_H, transitionDelay: shown ? `${i * 90}ms` : '0ms' }}
          >
            <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white', f.color)}>{f.code}</span>
            <span className="w-[104px]">
              <span className="block text-[12.5px] font-semibold">{f.name}</span>
              <span className="block text-[10.5px] text-zinc-500">{f.no}</span>
            </span>
            <span className="w-[120px]">
              <span className="block text-[13px] font-semibold tabular-nums">
                {f.dep} → {f.arr}
              </span>
              <span className="block text-[10.5px] text-zinc-500">{f.dur}</span>
            </span>
            <span className={cn('rounded-full px-2 py-0.5 text-[10.5px] font-medium', f.stops === 'Nonstop' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700')}>{f.stops}</span>
            <span className="ml-auto text-right">
              <span className="block text-[16px] font-bold tabular-nums">${f.price}</span>
              <span className="block text-[10px] text-zinc-500">{i === 0 ? 'Cheapest' : i === 1 && picked ? 'Best nonstop' : 'Economy'}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ rect, label, value, placeholder, active }: { rect: { x: number; y: number; w: number; h: number }; label: string; value: string; placeholder?: string; active?: boolean }) {
  return (
    <div className={cn('absolute rounded-xl px-3 py-1.5 ring-1 transition-colors', active ? 'bg-indigo-50/60 ring-indigo-400' : 'bg-zinc-50 ring-zinc-200')} style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }}>
      <span className="block text-[9.5px] font-medium uppercase tracking-wider text-zinc-400">{label}</span>
      <span className={cn('block truncate text-[13px] font-medium', value ? 'text-zinc-900' : 'text-zinc-400')}>
        {value || placeholder}
        {active && <span className="ml-px inline-block h-3.5 w-[1.5px] translate-y-0.5 animate-blink bg-indigo-500" />}
      </span>
    </div>
  );
}

/* ——— Step log ——— */

function StepLog({ t, active, done }: { t: number; active: number; done: boolean }) {
  const final = STEPS[STEPS.length - 1];
  return (
    <div className="flex min-w-0 flex-col rounded-xl bg-ink-850/60 p-3 ring-1 ring-white/5">
      <div className="mb-2 flex items-center justify-between text-[11px] font-medium uppercase tracking-wider text-ink-500">
        Steps
        <span className="font-mono normal-case tracking-normal tabular-nums">
          {Math.min(STEPS.length, active + (done ? 1 : 0))}/{STEPS.length}
        </span>
      </div>
      <ol className="space-y-0.5">
        {STEPS.map((s, i) => {
          const Icon = ICON[s.action];
          const state = done || i < active ? 'done' : i === active ? 'active' : 'todo';
          return (
            <li key={s.label} className={cn('flex items-center gap-2 rounded-lg px-1.5 py-1 text-[12px] transition-colors duration-300', state === 'active' && 'bg-white/[0.04]')}>
              <span
                className={cn(
                  'relative grid h-5 w-5 shrink-0 place-items-center rounded-md transition-colors duration-300',
                  state === 'done' ? 'bg-emerald-500/15 text-emerald-300' : state === 'active' ? 'bg-brand-500/20 text-brand-300' : 'bg-white/[0.04] text-ink-600',
                )}
              >
                {state === 'done' ? <Check className="h-3 w-3" /> : <Icon className={cn('h-3 w-3', state === 'active' && s.action === 'wait' && 'animate-spin')} />}
              </span>
              <span className={cn('min-w-0 flex-1 truncate', state === 'todo' ? 'text-ink-600' : state === 'active' ? 'text-ink-50' : 'text-ink-300')}>{s.label}</span>
              {state !== 'todo' && <span className="font-mono text-[10px] tabular-nums text-ink-600">{(s.at / 1000).toFixed(1)}s</span>}
            </li>
          );
        })}
      </ol>
      <div className={cn('mt-3 rounded-lg bg-emerald-500/10 p-2.5 ring-1 ring-emerald-400/20 transition-all duration-500 ease-smooth', done ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-1 opacity-0')} aria-live="polite">
        <p className="text-[12px] font-medium text-emerald-200">{final.label}</p>
        <p className="mt-0.5 text-[11px] leading-snug text-emerald-200/70">{final.detail}</p>
      </div>
      {!done && t > 0 && <p className="sr-only" aria-live="polite">{STEPS[active].label}</p>}
    </div>
  );
}

export function BrowserAgentDemo() {
  return <BrowserAgent />;
}
