import { useState } from 'react';
import { cn } from '@/lib/cn';

export type ProjectFolderProps = {
  title: string;
  meta: string;
  color?: 'brand' | 'amber' | 'emerald' | 'rose';
  papers?: string[];
  open?: boolean;
  onClick?: () => void;
};

const TONES = {
  brand: { back: 'from-brand-700 to-brand-900', front: 'from-brand-500 to-brand-700', glow: 'rgba(56,189,248,0.35)' },
  amber: { back: 'from-amber-600 to-amber-800', front: 'from-amber-400 to-amber-600', glow: 'rgba(251,191,36,0.3)' },
  emerald: { back: 'from-emerald-700 to-emerald-900', front: 'from-emerald-400 to-emerald-600', glow: 'rgba(52,211,153,0.3)' },
  rose: { back: 'from-rose-700 to-rose-900', front: 'from-rose-400 to-rose-600', glow: 'rgba(251,113,133,0.3)' },
};

const FAN = [
  { x: -34, y: -38, r: -14 },
  { x: 0, y: -52, r: 0 },
  { x: 34, y: -38, r: 14 },
];

export function ProjectFolder({ title, meta, color = 'brand', papers = ['Brief', 'Wireframes', 'Assets'], open, onClick }: ProjectFolderProps) {
  const [hover, setHover] = useState(false);
  const active = open ?? hover;
  const tone = TONES[color];

  return (
    <button
      onClick={onClick}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      className="focus-ring group flex flex-col items-center gap-4 rounded-2xl p-3 outline-none"
    >
      <div
        className="relative h-[120px] w-[160px] transition-transform duration-500 ease-spring"
        style={{ transform: active ? 'translateY(-4px)' : 'none', filter: active ? `drop-shadow(0 18px 24px ${tone.glow})` : 'drop-shadow(0 8px 16px rgba(0,0,0,0.5))' }}
      >
        {/* back + tab */}
        <div className={cn('absolute left-0 top-0 h-5 w-16 rounded-t-lg bg-gradient-to-b', tone.back)} />
        <div className={cn('absolute inset-x-0 bottom-0 top-3 rounded-xl rounded-tl-none bg-gradient-to-b', tone.back)} />
        {/* papers */}
        {papers.slice(0, 3).map((p, i) => {
          const f = FAN[i];
          return (
            <div
              key={p}
              className="absolute bottom-3 left-1/2 flex h-[92px] w-[110px] flex-col gap-1.5 rounded-lg bg-ink-50 p-2.5 shadow-card transition-transform duration-500 ease-spring"
              style={{
                transform: active
                  ? `translateX(calc(-50% + ${f.x}px)) translateY(${f.y}px) rotate(${f.r}deg)`
                  : `translateX(-50%) translateY(${-6 - i * 3}px) rotate(${(i - 1) * 2}deg)`,
                transitionDelay: `${active ? i * 50 : (2 - i) * 30}ms`,
              }}
            >
              <span className="truncate text-left text-[10px] font-medium text-ink-900">{p}</span>
              <span className="h-1 w-4/5 rounded-full bg-ink-200" />
              <span className="h-1 w-3/5 rounded-full bg-ink-200" />
              <span className="h-1 w-2/3 rounded-full bg-ink-200" />
            </div>
          );
        })}
        {/* front */}
        <div
          className={cn('absolute inset-x-0 bottom-0 h-[84px] origin-bottom rounded-xl bg-gradient-to-b shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] transition-transform duration-500 ease-spring', tone.front)}
          style={{ transform: active ? 'perspective(500px) rotateX(-34deg)' : 'perspective(500px) rotateX(-6deg)' }}
        >
          <div className="absolute inset-x-3 top-2 h-px bg-white/20" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-ink-100">{title}</p>
        <p className="text-xs text-ink-400">{meta}</p>
      </div>
    </button>
  );
}

export function ProjectFolderDemo() {
  const [selected, setSelected] = useState<string | null>(null);
  const folders = [
    { title: 'Brand refresh', meta: '24 files · 3 members', color: 'brand' as const, papers: ['Moodboard', 'Logo v4', 'Guidelines'] },
    { title: 'Mobile app', meta: '112 files · 8 members', color: 'amber' as const, papers: ['Flows', 'Screens', 'Specs'] },
    { title: 'Q3 Launch', meta: '9 files · 2 members', color: 'emerald' as const, papers: ['Plan', 'Copy', 'Press kit'] },
  ];
  return (
    <div className="flex flex-col items-center gap-6 pt-8">
      <div className="flex flex-wrap justify-center gap-6">
        {folders.map((f) => (
          <ProjectFolder key={f.title} {...f} open={selected === f.title ? true : undefined} onClick={() => setSelected((s) => (s === f.title ? null : f.title))} />
        ))}
      </div>
      <p className="h-4 text-xs text-ink-500">Hover a folder · click to pin it open</p>
    </div>
  );
}
