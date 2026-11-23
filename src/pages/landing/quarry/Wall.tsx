import { useMemo, type ReactNode } from 'react';
import { artwork } from '@/components/gallery/art';
import { cn } from '@/lib/cn';

/* Miniature page previews for the drifting wall. Each is plain markup over procedural art. */

function Frame({ children, className, h }: { children: ReactNode; className?: string; h: number }) {
  return (
    <div className={cn('relative overflow-hidden rounded-xl border border-white/[.07] bg-[#1a1a19] shadow-[0_20px_40px_-20px_rgba(0,0,0,.8)]', className)} style={{ height: h }}>
      {children}
    </div>
  );
}
const Bar = ({ dark }: { dark?: boolean }) => (
  <div className={cn('absolute inset-x-3 top-2.5 flex items-center gap-1.5', dark ? 'text-black/60' : 'text-white/70')}>
    <span className="h-1.5 w-6 rounded-full bg-current" />
    <span className="ml-auto h-1 w-4 rounded-full bg-current opacity-60" />
    <span className="h-1 w-4 rounded-full bg-current opacity-60" />
    <span className="h-1 w-4 rounded-full bg-current opacity-60" />
  </div>
);
const Lines = ({ n = 3, className }: { n?: number; className?: string }) => (
  <div className={cn('space-y-1', className)}>
    {Array.from({ length: n }, (_, i) => (
      <span key={i} className="block h-[3px] rounded-full bg-current opacity-40" style={{ width: `${88 - i * 18}%` }} />
    ))}
  </div>
);

function Tiles() {
  const a = (id: number, w = 360, h = 260, k?: 'mesh' | 'landscape') => artwork(id, w, h, k);
  return [
    // 0 architecture site
    <Frame key="0" h={190}>
      <img src={a(0)} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <Bar />
      <p className="absolute inset-x-0 top-9 text-center font-serif text-[40px] tracking-[0.06em] text-white/90">HOLLOW</p>
      <span className="absolute bottom-3 right-3 h-4 w-10 rounded bg-white/85" />
    </Frame>,
    // 1 testimonial cards
    <Frame key="1" h={120} className="bg-[#232320] p-3">
      <div className="grid h-full grid-cols-3 gap-1.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-md bg-[#e6e2cf] p-1.5 text-black/70">
            <Lines n={3} />
            <span className="mt-3 block h-2.5 w-2.5 rounded-full bg-black/30" />
          </div>
        ))}
      </div>
    </Frame>,
    // 2 app panel
    <Frame key="2" h={230} className="bg-[#efece6] p-4">
      <div className="relative h-full overflow-hidden rounded-lg">
        <img src={a(8, 300, 240, 'mesh')} alt="" className="absolute inset-0 h-full w-full object-cover" />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="absolute right-4 flex items-center gap-1.5" style={{ top: 26 + i * 34 }}>
            <span className="h-[3px] w-12 rounded-full bg-white/60" />
            <span className={cn('h-2.5 w-5 rounded-full', i === 2 ? 'bg-[#c8d5b9]' : 'bg-white/30')} />
          </div>
        ))}
      </div>
    </Frame>,
    // 3 planner on blurred green
    <Frame key="3" h={260}>
      <img src={a(5, 300, 320)} alt="" className="absolute inset-0 h-full w-full scale-110 object-cover blur-[3px]" />
      <div className="absolute inset-0 bg-black/40" />
      <p className="absolute left-4 top-8 max-w-[60%] text-[12px] font-medium leading-tight text-white">Plans that bend around your week</p>
      <div className="absolute right-3 top-6 w-[42%] space-y-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-md bg-black/55 p-2 text-white">
            <Lines n={2} />
          </div>
        ))}
      </div>
      <span className="absolute bottom-4 left-4 h-4 w-12 rounded bg-white/85" />
    </Frame>,
    // 4 travel serif
    <Frame key="4" h={180}>
      <img src={a(3)} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <Bar />
      <p className="absolute left-4 top-8 font-serif text-[22px] leading-[1] text-white">
        Stay somewhere
        <br />
        <em className="pl-6">very quiet.</em>
      </p>
      <span className="absolute bottom-3 left-4 h-4 w-16 rounded-full bg-white/90" />
    </Frame>,
    // 5 glass mesh
    <Frame key="5" h={140}>
      <img src={a(1, 360, 200, 'mesh')} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute left-1/2 top-1/2 h-12 w-[58%] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-white/30 bg-white/15 p-2 backdrop-blur-md">
        <Lines n={2} className="text-white" />
      </div>
    </Frame>,
    // 6 skincare split
    <Frame key="6" h={170} className="grid grid-cols-2 bg-[#111]">
      <div className="p-4 pt-10">
        <p className="text-[12px] font-medium leading-tight text-white">Good light is not luck, it is care.</p>
        <span className="mt-3 block h-3.5 w-10 rounded bg-white/80" />
      </div>
      <img src={a(6, 200, 260, 'mesh')} alt="" className="h-full w-full object-cover" />
    </Frame>,
    // 7 pricing
    <Frame key="7" h={160} className="bg-[#151514] p-3">
      <div className="grid h-full grid-cols-2 gap-2">
        {[0, 1].map((i) => (
          <div key={i} className={cn('rounded-lg border p-2.5', i ? 'border-[#c8d5b9]/40 bg-[#c8d5b9]/10' : 'border-white/10')}>
            <span className="block text-[15px] font-medium text-white">{i ? '$19' : '$0'}</span>
            <Lines n={4} className="mt-2 text-white" />
            <span className={cn('mt-3 block h-3 rounded', i ? 'bg-[#c8d5b9]' : 'bg-white/20')} />
          </div>
        ))}
      </div>
    </Frame>,
    // 8 chart dashboard
    <Frame key="8" h={200} className="bg-[#f4f2ec] p-3">
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex-1 rounded-md bg-white p-1.5 text-black">
            <span className="block h-[3px] w-8 rounded bg-black/20" />
            <span className="mt-1.5 block text-[11px] font-medium">{['4.2k', '61%', '$9k'][i]}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex h-[110px] items-end gap-1 rounded-md bg-white p-2">
        {[30, 48, 40, 62, 55, 74, 68, 88, 80, 96].map((v, i) => (
          <span key={i} className={cn('flex-1 rounded-sm', i === 9 ? 'bg-[#7c9a62]' : 'bg-[#c8d5b9]')} style={{ height: `${v}%` }} />
        ))}
      </div>
    </Frame>,
    // 9 big wordmark
    <Frame key="9" h={150}>
      <img src={a(9)} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <Bar />
      <p className="absolute inset-x-0 bottom-1 text-center text-[46px] font-semibold leading-none tracking-[-0.04em] text-white/85">MERIDIAN</p>
    </Frame>,
    // 10 blog list
    <Frame key="10" h={180} className="bg-[#efece6] p-4 text-black">
      <span className="block h-2 w-16 rounded bg-black/70" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="mt-3 flex gap-2.5">
          <img src={a(10 + i, 80, 60)} alt="" className="h-9 w-12 rounded object-cover" />
          <Lines n={2} className="flex-1 pt-1" />
        </div>
      ))}
    </Frame>,
    // 11 sign in
    <Frame key="11" h={210}>
      <img src={a(7, 300, 300, 'mesh')} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute left-1/2 top-1/2 w-[62%] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-[#111]/85 p-3 backdrop-blur">
        <span className="mx-auto block h-2 w-14 rounded bg-white/80" />
        <span className="mt-3 block h-5 rounded border border-white/15" />
        <span className="mt-1.5 block h-5 rounded border border-white/15" />
        <span className="mt-2.5 block h-5 rounded bg-white/85" />
      </div>
    </Frame>,
  ];
}

/**
 * Four columns of page previews drifting up and down at different speeds.
 * Hover pauses a column; edges fade out.
 */
export function PreviewWall() {
  const tiles = Tiles();
  const cols = useMemo(
    () => [
      [0, 6, 10, 3],
      [1, 2, 9, 7],
      [3, 8, 5, 11],
      [4, 5, 0, 8],
    ],
    [],
  );
  const speeds = [46, 38, 52, 42];
  return (
    <div className="relative mx-auto h-[560px] max-w-[1240px] overflow-hidden px-5 [mask-image:linear-gradient(180deg,transparent,#000_12%,#000_70%,transparent)] md:h-[640px] md:px-8">
      <style>{`@keyframes q-up{to{transform:translateY(-50%)}}@keyframes q-down{from{transform:translateY(-50%)}to{transform:none}}.q-col:hover>div{animation-play-state:paused}@media (prefers-reduced-motion:reduce){.q-col>div{animation:none!important}}`}</style>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {cols.map((c, ci) => (
          <div key={ci} className={cn('q-col', ci > 1 && 'hidden md:block', ci % 2 === 1 && 'mt-16')}>
            <div className="space-y-4" style={{ animation: `${ci % 2 ? 'q-down' : 'q-up'} ${speeds[ci]}s linear infinite` }}>
              {[...c, ...c].map((t, i) => (
                <div key={i} className="transition-transform duration-500 hover:-translate-y-1">
                  {tiles[t]}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
