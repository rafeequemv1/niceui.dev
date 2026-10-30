import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { CalendarDays, GripVertical, PartyPopper, Plus } from 'lucide-react';
import { cn } from '@/lib/cn';

export type StageId = 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'won';
export type Deal = { id: string; title: string; company: string; amount: number; close: string; owner: string; stage: StageId; prob: number };

export const PIPELINE_STAGES: { id: StageId; label: string; dot: string; prob: number }[] = [
  { id: 'lead', label: 'Lead', dot: 'bg-sky-400', prob: 10 },
  { id: 'qualified', label: 'Qualified', dot: 'bg-violet-400', prob: 30 },
  { id: 'proposal', label: 'Proposal', dot: 'bg-amber-400', prob: 55 },
  { id: 'negotiation', label: 'Negotiation', dot: 'bg-orange-400', prob: 75 },
  { id: 'won', label: 'Won', dot: 'bg-emerald-400', prob: 100 },
];
const MONO = ['bg-sky-500/20 text-sky-200', 'bg-violet-500/20 text-violet-200', 'bg-emerald-500/20 text-emerald-200', 'bg-amber-500/20 text-amber-200', 'bg-rose-500/20 text-rose-200', 'bg-teal-500/20 text-teal-200'];
const mono = (s: string) => MONO[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % MONO.length];
const compact = (n: number) => (n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : `$${Math.round(n / 1000)}k`);
const CONFETTI = ['#38bdf8', '#34d399', '#fbbf24', '#fb7185', '#a78bfa', '#f0f9ff'];

type Press = { id: string; x: number; y: number; ox: number; oy: number; w: number; started: boolean };
type Drag = { id: string; x: number; y: number; over: StageId | null; index: number };
type Burst = { id: number; x: number; y: number; text: string };

export type PipelineBoardProps = {
  initialDeals: Deal[];
  onMove?: (deal: Deal, to: StageId) => void;
  className?: string;
};

export function PipelineBoard({ initialDeals, onMove, className }: PipelineBoardProps) {
  const [deals, setDeals] = useState(initialDeals);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [burst, setBurst] = useState<Burst | null>(null);
  const [announce, setAnnounce] = useState('');
  const wrap = useRef<HTMLDivElement>(null);
  const cols = useRef(new Map<StageId, HTMLDivElement>());
  const press = useRef<Press | null>(null);
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);
  useEffect(() => {
    if (!burst) return;
    const id = window.setTimeout(() => setBurst(null), 2600);
    return () => clearTimeout(id);
  }, [burst]);

  const move = (id: string, to: StageId, index: number | null, at?: { x: number; y: number }) => {
    const deal = deals.find((d) => d.id === id);
    if (!deal) return;
    const prob = PIPELINE_STAGES.find((s) => s.id === to)!.prob;
    const moved = { ...deal, stage: to, prob: to === deal.stage ? deal.prob : prob };
    setDeals((ds) => {
      const rest = ds.filter((d) => d.id !== id);
      const col = rest.filter((d) => d.stage === to);
      const before = index === null ? undefined : col[index];
      const pos = before ? rest.indexOf(before) : col.length ? rest.indexOf(col[col.length - 1]) + 1 : rest.length;
      rest.splice(pos, 0, moved);
      return rest;
    });
    if (to !== deal.stage) {
      onMove?.(moved, to);
      const label = PIPELINE_STAGES.find((s) => s.id === to)!.label;
      setAnnounce(`Moved ${deal.title} to ${label}`);
      if (to === 'won') {
        const r = wrap.current?.getBoundingClientRect();
        const x = at && r ? at.x - r.left : (r?.width ?? 600) - 120;
        const y = at && r ? at.y - r.top : 120;
        setBurst({ id: Date.now(), x, y, text: `${deal.company} closed · $${deal.amount.toLocaleString('en-US')}` });
      }
    }
  };

  const onDown = (e: PointerEvent<HTMLDivElement>, deal: Deal) => {
    if (e.button !== 0) return;
    if (e.pointerType !== 'mouse' && !(e.target as HTMLElement).closest('[data-handle]')) return;
    const r = e.currentTarget.getBoundingClientRect();
    press.current = { id: deal.id, x: e.clientX, y: e.clientY, ox: e.clientX - r.left, oy: e.clientY - r.top, w: r.width, started: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMovePointer = (e: PointerEvent<HTMLDivElement>) => {
    const p = press.current;
    if (!p) return;
    if (!p.started && Math.hypot(e.clientX - p.x, e.clientY - p.y) < 5) return;
    p.started = true;
    let over: StageId | null = null;
    let index = 0;
    for (const [id, el] of cols.current) {
      const r = el.getBoundingClientRect();
      if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top - 40 && e.clientY <= r.bottom + 40) {
        over = id;
        const cards = [...el.querySelectorAll<HTMLElement>('[data-card]')].filter((c) => c.dataset.card !== p.id);
        index = cards.findIndex((c) => {
          const cr = c.getBoundingClientRect();
          return e.clientY < cr.top + cr.height / 2;
        });
        if (index < 0) index = cards.length;
      }
    }
    setDrag({ id: p.id, x: e.clientX, y: e.clientY, over, index });
  };
  const onUp = (e: PointerEvent<HTMLDivElement>) => {
    const p = press.current;
    press.current = null;
    if (p?.started && drag?.over) move(p.id, drag.over, drag.index, { x: e.clientX, y: e.clientY });
    setDrag(null);
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>, deal: Deal) => {
    const i = PIPELINE_STAGES.findIndex((s) => s.id === deal.stage);
    const next = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : -1;
    if (next < 0 || next >= PIPELINE_STAGES.length || (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft')) return;
    e.preventDefault();
    move(deal.id, PIPELINE_STAGES[next].id, null);
    requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-card="${deal.id}"]`)?.focus());
  };

  const dragged = drag ? deals.find((d) => d.id === drag.id) : null;
  const wr = wrap.current?.getBoundingClientRect();

  return (
    <div ref={wrap} className={cn('relative w-full rounded-2xl bg-ink-900 shadow-card', className)}>
      <style>{`@keyframes crm-confetti{0%{transform:translate(0,0) rotate(0);opacity:1}100%{transform:translate(var(--dx),var(--dy)) rotate(var(--r));opacity:0}}`}</style>
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-3">
        <div className="min-w-0">
          <p className="text-[13.5px] font-medium text-ink-50">Q4 pipeline</p>
          <p className="text-[12px] text-ink-500">
            <span className="font-mono tabular-nums text-ink-300">{compact(deals.filter((d) => d.stage !== 'won').reduce((s, d) => s + d.amount, 0))}</span> open ·{' '}
            <span className="font-mono tabular-nums text-ink-300">{compact(deals.filter((d) => d.stage !== 'won').reduce((s, d) => s + (d.amount * d.prob) / 100, 0))}</span> weighted
          </p>
        </div>
        <span className="hidden text-[11.5px] text-ink-500 sm:block">Drag cards, or focus one and press ← →</span>
      </div>

      <div className="overflow-x-auto [scrollbar-width:thin]">
        <div className="flex gap-2 p-3">
          {PIPELINE_STAGES.map((stage) => {
            const list = deals.filter((d) => d.stage === stage.id);
            const total = list.reduce((s, d) => s + d.amount, 0);
            const isOver = drag?.over === stage.id;
            return (
              <div
                key={stage.id}
                ref={(el) => {
                  if (el) cols.current.set(stage.id, el);
                  else cols.current.delete(stage.id);
                }}
                className={cn('flex w-[200px] shrink-0 flex-col rounded-xl p-1.5 transition-colors duration-200 sm:w-auto sm:min-w-[150px] sm:flex-1', isOver ? 'bg-brand-500/[0.07] ring-1 ring-brand-400/30' : stage.id === 'won' ? 'bg-emerald-500/[0.04]' : 'bg-white/[0.02]')}
              >
                <div className="flex items-center justify-between px-1.5 pb-2 pt-1">
                  <span className="flex min-w-0 items-center gap-1.5 text-[12.5px] font-medium text-ink-100">
                    <span className={cn('h-2 w-2 shrink-0 rounded-full', stage.dot)} />
                    <span className="truncate">{stage.label}</span>
                    <span className="rounded-full bg-white/[0.06] px-1.5 font-mono text-[10.5px] text-ink-400">{list.length}</span>
                  </span>
                  <span className="font-mono text-[11px] tabular-nums text-ink-500">{compact(total)}</span>
                </div>
                <div className="flex min-h-[120px] flex-1 flex-col gap-1.5">
                  {list.map((d, i) => (
                    <div key={d.id}>
                      {isOver && drag?.index === i && <div className="mb-1.5 h-0.5 rounded-full bg-brand-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />}
                      <DealTile deal={d} ghost={drag?.id === d.id} onPointerDown={(e) => onDown(e, d)} onPointerMove={onMovePointer} onPointerUp={onUp} onKeyDown={(e) => onKey(e, d)} />
                    </div>
                  ))}
                  {isOver && drag && drag.index >= list.filter((d) => d.id !== drag.id).length && <div className="h-0.5 rounded-full bg-brand-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />}
                  <button className="focus-ring mt-auto flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11.5px] text-ink-500 transition-colors hover:bg-white/5 hover:text-ink-200">
                    <Plus className="h-3 w-3" /> New
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {drag && dragged && wr && drag.x !== 0 && (
        <div className="pointer-events-none absolute z-50 rotate-2 scale-[1.03]" style={{ left: drag.x - wr.left - (press.current?.ox ?? 20), top: drag.y - wr.top - (press.current?.oy ?? 20), width: press.current?.w ?? 180 }}>
          <DealTile deal={dragged} floating />
        </div>
      )}

      {burst && (
        <div key={burst.id} className="pointer-events-none absolute inset-0 z-50 overflow-hidden rounded-2xl">
          {!reduce.current &&
            Array.from({ length: 22 }, (_, i) => {
              const a = (i / 22) * Math.PI * 2;
              const d = 60 + ((i * 37) % 70);
              return (
                <span
                  key={i}
                  className="absolute h-1.5 w-1.5 rounded-[2px]"
                  style={{ left: burst.x, top: burst.y, background: CONFETTI[i % CONFETTI.length], animation: `crm-confetti 900ms cubic-bezier(.2,.7,.3,1) ${i * 8}ms forwards`, ['--dx' as string]: `${Math.cos(a) * d}px`, ['--dy' as string]: `${Math.sin(a) * d - 30}px`, ['--r' as string]: `${(i * 47) % 360}deg` }}
                />
              );
            })}
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-xl bg-emerald-500/15 px-3 py-2 text-[12.5px] font-medium text-emerald-200 ring-1 ring-emerald-400/30 backdrop-blur animate-fade-up">
            <PartyPopper className="h-4 w-4" /> {burst.text}
          </div>
        </div>
      )}
      <p className="sr-only" aria-live="polite">
        {announce}
      </p>
    </div>
  );
}

type TileProps = {
  deal: Deal;
  ghost?: boolean;
  floating?: boolean;
  onPointerDown?: (e: PointerEvent<HTMLDivElement>) => void;
  onPointerMove?: (e: PointerEvent<HTMLDivElement>) => void;
  onPointerUp?: (e: PointerEvent<HTMLDivElement>) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLDivElement>) => void;
};

function DealTile({ deal, ghost, floating, ...handlers }: TileProps) {
  const won = deal.stage === 'won';
  return (
    <div
      data-card={floating ? undefined : deal.id}
      tabIndex={floating ? -1 : 0}
      role="button"
      aria-label={`${deal.title}, ${deal.company}, $${deal.amount.toLocaleString('en-US')}. Press left or right arrow to change stage.`}
      onPointerDown={handlers.onPointerDown}
      onPointerMove={handlers.onPointerMove}
      onPointerUp={handlers.onPointerUp}
      onPointerCancel={handlers.onPointerUp}
      onKeyDown={handlers.onKeyDown}
      className={cn(
        'focus-ring group relative cursor-grab select-none rounded-lg bg-ink-850 p-2.5 ring-1 ring-white/[0.06] transition-[opacity,box-shadow,background-color] duration-200 hover:bg-ink-800 hover:ring-white/10 active:cursor-grabbing',
        ghost && 'opacity-30',
        floating && 'shadow-pop ring-brand-400/40',
        won && 'ring-emerald-400/20',
      )}
    >
      <div className="flex items-center gap-1.5">
        <span className={cn('grid h-5 w-5 shrink-0 place-items-center rounded-[5px] text-[9.5px] font-bold', mono(deal.company))}>{deal.company[0]}</span>
        <span className="min-w-0 flex-1 truncate text-[11.5px] text-ink-400">{deal.company}</span>
        <span data-handle className="touch-none rounded p-0.5 text-ink-600 transition-colors group-hover:text-ink-400" aria-hidden>
          <GripVertical className="h-3.5 w-3.5" />
        </span>
      </div>
      <p className="mt-1.5 truncate text-[12.5px] font-medium text-ink-50">{deal.title}</p>
      <div className="mt-1.5 flex items-center justify-between gap-2">
        <span className="font-mono text-[12.5px] tabular-nums text-ink-100">${deal.amount.toLocaleString('en-US')}</span>
        <span className="flex items-center gap-1 text-[10.5px] text-ink-500">
          <CalendarDays className="h-3 w-3" />
          {deal.close}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
          <span className={cn('block h-full rounded-full transition-all duration-500', won ? 'bg-emerald-400' : 'bg-brand-400')} style={{ width: `${deal.prob}%` }} />
        </span>
        <span className="font-mono text-[10px] tabular-nums text-ink-500">{deal.prob}%</span>
        <span className="grid h-5 w-5 place-items-center rounded-full bg-white/[0.07] text-[8.5px] font-semibold text-ink-200" title={`Owner ${deal.owner}`}>
          {deal.owner}
        </span>
      </div>
    </div>
  );
}

export const DEMO_DEALS: Deal[] = [
  { id: 'd1', title: 'Team plan pilot', company: 'Verdant OS', amount: 24000, close: 'Dec 2', owner: 'AR', stage: 'lead', prob: 10 },
  { id: 'd2', title: 'Data residency add-on', company: 'Atlas Freight', amount: 15000, close: 'Dec 9', owner: 'LP', stage: 'lead', prob: 10 },
  { id: 'd3', title: 'EU expansion', company: 'Kestrel Labs', amount: 42000, close: 'Nov 28', owner: 'LP', stage: 'qualified', prob: 30 },
  { id: 'd4', title: 'Support upgrade', company: 'Northbeam', amount: 18000, close: 'Nov 21', owner: 'AR', stage: 'qualified', prob: 30 },
  { id: 'd5', title: 'Analytics suite', company: 'Tidewater AI', amount: 67000, close: 'Nov 19', owner: 'MS', stage: 'proposal', prob: 55 },
  { id: 'd6', title: 'Annual renewal', company: 'Harborline', amount: 56000, close: 'Nov 14', owner: 'MS', stage: 'proposal', prob: 55 },
  { id: 'd7', title: 'Platform rollout', company: 'Sorabase', amount: 120000, close: 'Nov 12', owner: 'LP', stage: 'negotiation', prob: 75 },
  { id: 'd8', title: 'SSO + audit logs', company: 'Brightmill', amount: 38000, close: 'Nov 10', owner: 'AR', stage: 'negotiation', prob: 75 },
  { id: 'd9', title: 'Enterprise seats', company: 'Lumenpay', amount: 84000, close: 'Oct 30', owner: 'AR', stage: 'won', prob: 100 },
];

export function PipelineBoardDemo() {
  return (
    <div className="w-full max-w-[1040px]">
      <PipelineBoard initialDeals={DEMO_DEALS} />
    </div>
  );
}
