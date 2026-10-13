import { useEffect, useState } from 'react';
import { CalendarDays, Check, ChevronLeft, ChevronRight, Loader2, Plus, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/cn';
import { NetworkBadge, networkMap, type NetworkId } from './logos';
import { IMG, PEOPLE, Avatar } from './shared';

type MockPost = { day: number; slot: number; net: NetworkId; img: string; time: string; title: string };

const DAYS = [
  { d: 'Mon', n: 9 },
  { d: 'Tue', n: 10 },
  { d: 'Wed', n: 11 },
  { d: 'Thu', n: 12 },
  { d: 'Fri', n: 13 },
  { d: 'Sat', n: 14 },
  { d: 'Sun', n: 15 },
];
const SLOTS = ['9 AM', '12 PM', '3 PM', '6 PM'];

const POSTS: MockPost[] = [
  { day: 0, slot: 0, net: 'instagram', img: IMG.latte, time: '09:00', title: 'Morning ritual' },
  { day: 1, slot: 1, net: 'linkedin', img: IMG.interior, time: '12:15', title: 'Studio tour recap' },
  { day: 2, slot: 0, net: 'x', img: IMG.citrus, time: '09:30', title: 'Summer menu drop' },
  { day: 0, slot: 2, net: 'tiktok', img: IMG.sneakers, time: '15:00', title: 'Unboxing in 15s' },
  { day: 3, slot: 3, net: 'youtube', img: IMG.team, time: '18:00', title: 'Behind the brand' },
  { day: 4, slot: 1, net: 'facebook', img: IMG.vase, time: '12:00', title: 'Restock alert' },
  { day: 2, slot: 2, net: 'instagram', img: IMG.cappuccino, time: '15:45', title: 'Latte art reel' },
  { day: 5, slot: 0, net: 'tiktok', img: IMG.bloodOrange, time: '10:00', title: 'Weekend recipe' },
  { day: 1, slot: 3, net: 'x', img: IMG.plant, time: '18:30', title: 'Thread: our process' },
  { day: 6, slot: 2, net: 'linkedin', img: IMG.latteArt, time: '14:00', title: 'Hiring baristas' },
  { day: 4, slot: 3, net: 'instagram', img: IMG.sneakers, time: '19:00', title: 'Drop countdown' },
  { day: 3, slot: 0, net: 'tiktok', img: IMG.latte, time: '08:45', title: 'Day in the life' },
];

const N = POSTS.length;
const CYCLE = N + 5;

const dayVis = (i: number) => (i >= 5 ? 'hidden lg:block' : i >= 3 ? 'hidden sm:block' : 'block');

export function HeroMock() {
  const [t, setT] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setT((v) => v + 1), 900);
    return () => window.clearInterval(id);
  }, []);

  const visible = Math.min(t % CYCLE, N);
  const tickIdx = Math.floor(t / 3) % N;
  const published = t % 3 === 2;
  const tick = POSTS[tickIdx];

  return (
    <div className="relative">
      <div className="absolute -inset-x-8 -inset-y-10 -z-10 rounded-[48px] bg-gradient-to-b from-[#FF5A36]/15 via-amber-200/20 to-transparent blur-3xl" />
      <div className="overflow-hidden rounded-3xl border border-stone-200/80 bg-white/90 shadow-[0_40px_80px_-32px_rgba(28,25,23,0.35),0_0_0_1px_rgba(255,255,255,0.6)_inset] backdrop-blur">
        <div className="flex items-center justify-between gap-4 border-b border-stone-200/80 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="hidden gap-1.5 sm:flex">
              <span className="h-2.5 w-2.5 rounded-full bg-stone-200" />
              <span className="h-2.5 w-2.5 rounded-full bg-stone-200" />
              <span className="h-2.5 w-2.5 rounded-full bg-stone-200" />
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-stone-900">
              <CalendarDays className="h-4 w-4 text-[#FF5A36]" />
              June 9 – 15
            </div>
            <div className="hidden items-center gap-0.5 sm:flex">
              <span className="rounded-md p-1 text-stone-400"><ChevronLeft className="h-4 w-4" /></span>
              <span className="rounded-md p-1 text-stone-400"><ChevronRight className="h-4 w-4" /></span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden -space-x-2 md:flex">
              <Avatar src={PEOPLE.maya.img} name={PEOPLE.maya.name} className="h-7 w-7" />
              <Avatar src={PEOPLE.daniel.img} name={PEOPLE.daniel.name} className="h-7 w-7" />
              <Avatar src={PEOPLE.amara.img} name={PEOPLE.amara.name} className="h-7 w-7" />
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-900 px-3 py-1.5 text-xs font-medium text-white">
              <Plus className="h-3.5 w-3.5" /> New post
            </span>
          </div>
        </div>

        <div className="flex">
          <div className="hidden w-14 shrink-0 border-r border-stone-100 pt-10 sm:block">
            {SLOTS.map((s) => (
              <div key={s} className="h-[76px] pr-2 text-right font-mono text-[10px] text-stone-400">{s}</div>
            ))}
          </div>
          <div className="grid flex-1 grid-cols-3 sm:grid-cols-5 lg:grid-cols-7">
            {DAYS.map((day, di) => (
              <div key={day.d} className={cn('border-r border-stone-100 last:border-r-0', dayVis(di))}>
                <div className="flex h-10 items-center justify-center gap-1.5 border-b border-stone-100 text-xs">
                  <span className="text-stone-500">{day.d}</span>
                  <span className={cn('font-medium', di === 2 ? 'flex h-5 w-5 items-center justify-center rounded-full bg-[#FF5A36] text-white' : 'text-stone-900')}>
                    {day.n}
                  </span>
                </div>
                {SLOTS.map((s, si) => {
                  const pi = POSTS.findIndex((p) => p.day === di && p.slot === si);
                  const post = pi >= 0 ? POSTS[pi] : null;
                  const show = post !== null && pi < visible;
                  const live = post !== null && pi === tickIdx;
                  return (
                    <div key={s} className="h-[76px] border-b border-dashed border-stone-100 p-1.5 last:border-b-0">
                      {post && show && (
                        <div
                          key={`${t - (t % CYCLE)}-${pi}`}
                          className={cn(
                            'cad-pop flex h-full items-center gap-2 rounded-xl border bg-white p-1.5 shadow-sm transition-all duration-500',
                            live ? 'border-[#FF5A36]/50 ring-4 ring-[#FF5A36]/10' : 'border-stone-200/80',
                          )}
                        >
                          <div className="relative h-full w-10 shrink-0 overflow-hidden rounded-lg">
                            <img src={post.img} alt="" loading="lazy" className="h-full w-full object-cover" />
                            <NetworkBadge id={post.net} size="xs" className="absolute bottom-0.5 right-0.5 !h-4 !w-4 !rounded-[5px]" />
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-[11px] font-medium leading-tight text-stone-900">{post.title}</div>
                            <div className="mt-1 font-mono text-[10px] text-stone-400">{post.time}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute -bottom-6 left-4 right-4 flex justify-center sm:left-auto sm:right-8 sm:justify-end">
        <div
          key={tickIdx}
          className="cad-pop flex items-center gap-3 rounded-2xl border border-stone-200 bg-white px-3 py-2.5 shadow-[0_16px_40px_-16px_rgba(28,25,23,0.35)]"
        >
          <NetworkBadge id={tick.net} size="sm" />
          <div className="min-w-0">
            <div className="truncate text-xs font-medium text-stone-900">{tick.title}</div>
            <div className="text-[11px] text-stone-500">{networkMap[tick.net].name} · {tick.time}</div>
          </div>
          <span
            className={cn(
              'ml-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors duration-300',
              published ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700',
            )}
          >
            {published ? <Check className="h-3 w-3" /> : <Loader2 className="h-3 w-3 animate-spin" />}
            {published ? 'Published' : 'Publishing…'}
          </span>
        </div>
      </div>

      <div className="absolute -left-6 top-24 hidden animate-float rounded-2xl border border-stone-200 bg-white px-4 py-3 shadow-[0_16px_40px_-16px_rgba(28,25,23,0.3)] xl:block">
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <TrendingUp className="h-3.5 w-3.5 text-emerald-600" /> Reach this week
        </div>
        <div className="mt-1 text-xl font-medium tracking-tight text-stone-900">
          +38.4<span className="text-emerald-600">%</span>
        </div>
      </div>
    </div>
  );
}

const ORBIT: { id: NetworkId; pos: string; delay: number; rot: number }[] = [
  { id: 'instagram', pos: '-left-4 top-0 sm:-left-10 sm:-top-6', delay: 0, rot: -8 },
  { id: 'x', pos: '-right-3 top-10 sm:-right-8 sm:-top-2', delay: 600, rot: 6 },
  { id: 'tiktok', pos: 'hidden sm:block -right-12 top-1/2', delay: 1200, rot: -6 },
  { id: 'linkedin', pos: 'hidden sm:block -left-14 bottom-24', delay: 300, rot: 8 },
  { id: 'youtube', pos: 'hidden md:block left-1/3 -bottom-14', delay: 900, rot: -4 },
  { id: 'facebook', pos: 'hidden lg:block right-1/4 -top-12', delay: 1500, rot: 5 },
];

export function OrbitingLogos() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {ORBIT.map((o) => (
        <div key={o.id} className={cn('absolute', o.pos)}>
          <div className="cad-drift" style={{ animationDelay: `${o.delay}ms` }}>
            <div
              className="rounded-[20px] bg-white/80 p-1.5 shadow-[0_20px_40px_-16px_rgba(28,25,23,0.35)] ring-1 ring-stone-200/70 backdrop-blur"
              style={{ transform: `rotate(${o.rot}deg)` }}
            >
              <NetworkBadge id={o.id} size="lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
