import { useState } from 'react';
import { ArrowDown, ArrowUp, Clock, Sparkles, Zap } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Reveal, useInView } from '@/pages/landing/shared/motion';
import { NetworkBadge, networkMap, type NetworkId } from './logos';
import { IMG, SectionHeading } from './shared';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 16 }, (_, i) => i + 6);
const HEAT_NETS: NetworkId[] = ['instagram', 'linkedin', 'tiktok'];

const PEAKS: Record<string, { h: number; w: number }[]> = {
  instagram: [{ h: 8, w: 0.6 }, { h: 12, w: 0.75 }, { h: 19, w: 1 }],
  linkedin: [{ h: 8, w: 1 }, { h: 12, w: 0.8 }, { h: 17, w: 0.55 }],
  tiktok: [{ h: 13, w: 0.5 }, { h: 20, w: 1 }, { h: 21, w: 0.9 }],
};

function score(net: NetworkId, d: number, h: number) {
  const weekend = d >= 5;
  const dayW = net === 'linkedin' ? (weekend ? 0.35 : [0.9, 1, 0.95, 0.9, 0.7][d]) : weekend ? 1 : 0.8 + (d % 3) * 0.06;
  const peak = PEAKS[net].reduce((acc, p) => acc + p.w * Math.exp(-((h - p.h) ** 2) / 3.2), 0);
  const jitter = ((d * 7 + h * 13) % 9) / 60;
  return Math.max(0.05, Math.min(1, (peak * 0.85 + jitter) * dayW));
}

const fmtHour = (h: number) => `${((h + 11) % 12) + 1} ${h < 12 ? 'AM' : 'PM'}`;

function Heatmap() {
  const [net, setNet] = useState<NetworkId>('instagram');
  const [hover, setHover] = useState<{ d: number; h: number } | null>(null);
  const { ref, inView } = useInView<HTMLDivElement>(0.25);

  let best = { d: 0, h: 6, v: 0 };
  DAYS.forEach((_, d) =>
    HOURS.forEach((h) => {
      const v = score(net, d, h);
      if (v > best.v) best = { d, h, v };
    }),
  );

  return (
    <div ref={ref} className="rounded-3xl border border-stone-200 bg-white p-4 shadow-[0_24px_48px_-24px_rgba(28,25,23,0.25)] sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-stone-900">Best time to post</div>
          <div className="text-xs text-stone-500">Based on 90 days of your audience activity</div>
        </div>
        <div className="flex rounded-full bg-stone-100 p-1">
          {HEAT_NETS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setNet(id)}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-300',
                net === id ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800',
              )}
            >
              <NetworkBadge id={id} size="xs" />
              <span className="hidden sm:inline">{networkMap[id].name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="-mx-2 mt-6 overflow-x-auto px-2 pb-2 pt-1">
        <div className="min-w-[560px]">
          <div className="grid grid-cols-[40px_repeat(16,minmax(0,1fr))] gap-1">
            <span />
            {HOURS.map((h) => (
              <span key={h} className="text-center font-mono text-[10px] text-stone-400">
                {h % 3 === 0 ? fmtHour(h).replace(' ', '') : ''}
              </span>
            ))}
            {DAYS.map((day, d) => (
              <div key={day} className="contents">
                <span className="flex items-center text-xs text-stone-500">{day}</span>
                {HOURS.map((h, hi) => {
                  const v = score(net, d, h);
                  const isHover = hover?.d === d && hover.h === h;
                  const isBest = best.d === d && best.h === h;
                  return (
                    <button
                      key={h}
                      type="button"
                      onMouseEnter={() => setHover({ d, h })}
                      onMouseLeave={() => setHover(null)}
                      onFocus={() => setHover({ d, h })}
                      onBlur={() => setHover(null)}
                      aria-label={`${day} ${fmtHour(h)}: score ${Math.round(v * 100)}`}
                      className="relative aspect-square rounded-[6px] bg-stone-100"
                    >
                      <span
                        className={cn(
                          'absolute inset-0 rounded-[6px] transition-all duration-700 ease-spring',
                          inView ? 'scale-100' : 'scale-0',
                          isHover && 'scale-110 ring-2 ring-stone-900',
                        )}
                        style={{
                          backgroundColor: `rgba(255,90,54,${(0.08 + v * 0.92).toFixed(2)})`,
                          transitionDelay: inView && !isHover ? `${(d * 16 + hi) * 6}ms` : '0ms',
                        }}
                      />
                      {isBest && inView && <span className="absolute inset-0 animate-pulse-ring rounded-[6px] ring-2 ring-[#FF5A36]" />}
                      {isHover && (
                        <span
                          className={cn(
                            'pointer-events-none absolute left-1/2 z-20 w-max -translate-x-1/2 animate-scale-in rounded-xl bg-stone-900 px-3 py-2 text-left text-xs text-white shadow-xl',
                            d < 2 ? 'top-full mt-2' : 'bottom-full mb-2',
                          )}
                        >
                          <span className="block font-medium">{day} · {fmtHour(h)}</span>
                          <span className="block text-stone-300">Engagement score {Math.round(v * 100)}</span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 rounded-full bg-[#FFF3EE] px-3 py-1.5 text-xs text-stone-800">
          <Zap className="h-3.5 w-3.5 text-[#FF5A36]" />
          Peak for {networkMap[net].name}: <span className="font-medium">{DAYS[best.d]} at {fmtHour(best.h)}</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-stone-500">
          Low
          <span className="h-2 w-24 rounded-full bg-gradient-to-r from-[#FF5A36]/10 to-[#FF5A36]" />
          High
        </div>
      </div>
    </div>
  );
}

type QItem = { id: number; title: string; net: NetworkId; img: string };

const SLOT_TIMES = ['Today · 9:00 AM', 'Today · 12:30 PM', 'Today · 7:00 PM', 'Tomorrow · 8:15 AM', 'Tomorrow · 6:45 PM'];
const ROW = 76;

function Queue() {
  const [items, setItems] = useState<QItem[]>([
    { id: 1, title: 'Cold brew launch teaser', net: 'instagram', img: IMG.latte },
    { id: 2, title: 'Why we roast in small batches', net: 'linkedin', img: IMG.interior },
    { id: 3, title: '15s pour-over ASMR', net: 'tiktok', img: IMG.cappuccino },
    { id: 4, title: 'Thread: 5 brewing myths', net: 'x', img: IMG.plant },
    { id: 5, title: 'Summer citrus tonic', net: 'facebook', img: IMG.citrus },
  ]);
  const [moved, setMoved] = useState<number | null>(null);

  const move = (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[idx], next[j]] = [next[j], next[idx]];
    setItems(next);
    setMoved(items[idx].id);
  };

  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-4 shadow-[0_24px_48px_-24px_rgba(28,25,23,0.25)] sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-stone-900">Queue</div>
          <div className="text-xs text-stone-500">Reorder — posts snap into your best slots</div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
          <Sparkles className="h-3 w-3" /> Auto-slotting
        </span>
      </div>
      <div className="relative mt-5" style={{ height: items.length * ROW }}>
        {[...items].sort((a, b) => a.id - b.id).map((it) => {
          const idx = items.findIndex((x) => x.id === it.id);
          return (
            <div
              key={it.id}
              className="absolute inset-x-0 transition-transform duration-500 ease-spring"
              style={{ transform: `translateY(${idx * ROW}px)`, height: ROW - 8 }}
            >
              <div
                className={cn(
                  'flex h-full items-center gap-3 rounded-2xl border bg-white px-2.5 transition-all duration-500',
                  moved === it.id ? 'border-[#FF5A36]/40 shadow-[0_12px_24px_-12px_rgba(255,90,54,0.45)]' : 'border-stone-200 hover:border-stone-300',
                )}
              >
                <div className="relative h-12 w-12 shrink-0">
                  <img src={it.img} alt="" loading="lazy" className="h-full w-full rounded-xl object-cover" />
                  <NetworkBadge id={it.net} size="xs" className="absolute -bottom-1 -right-1 ring-2 ring-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-stone-900">{it.title}</div>
                  <div className="mt-0.5 flex items-center gap-1 font-mono text-[11px] text-stone-500">
                    <Clock className="h-3 w-3" /> {SLOT_TIMES[idx]}
                  </div>
                </div>
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => move(idx, -1)}
                    disabled={idx === 0}
                    aria-label={`Move ${it.title} earlier`}
                    className="rounded-md p-1 text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900 disabled:opacity-30"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(idx, 1)}
                    disabled={idx === items.length - 1}
                    aria-label={`Move ${it.title} later`}
                    className="rounded-md p-1 text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900 disabled:opacity-30"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Scheduling() {
  return (
    <section id="scheduling" className="relative scroll-mt-20 bg-[#F4F1EA] py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Smart scheduling"
          title="Publish when they're"
          accent="actually listening."
          body="Cadence learns when each audience is most active and quietly slots every post into the moment it'll land hardest."
        />
        <div className="mt-16 grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <Reveal>
            <Heatmap />
          </Reveal>
          <Reveal delay={120}>
            <Queue />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
