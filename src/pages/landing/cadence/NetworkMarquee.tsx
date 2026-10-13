import { NetworkBadge, networks } from './logos';
import { Reveal } from '@/pages/landing/shared/motion';

const STATS: Record<string, string> = {
  instagram: 'Posts, Reels, Stories',
  x: 'Posts & threads',
  linkedin: 'Profiles & pages',
  tiktok: 'Videos & carousels',
  facebook: 'Pages & groups',
  youtube: 'Videos & Shorts',
};

export function NetworkMarquee() {
  const row = [...networks, ...networks];
  return (
    <section className="relative border-y border-stone-200/80 bg-white/60 py-12">
      <Reveal>
        <p className="text-center text-sm text-stone-500">
          Publish everywhere your audience is{' '}
          <span className="font-serif text-base italic text-stone-900">— from one calm place.</span>
        </p>
      </Reveal>
      <div className="group relative mt-8 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <div className="flex w-max animate-marquee gap-4 group-hover:[animation-play-state:paused]">
          {[...row, ...row].map((n, i) => (
            <div
              key={`${n.id}-${i}`}
              className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3 shadow-sm transition-all duration-300 ease-spring hover:-translate-y-1 hover:shadow-[0_12px_24px_-12px_rgba(28,25,23,0.25)]"
            >
              <NetworkBadge id={n.id} size="md" />
              <div>
                <div className="text-sm font-medium text-stone-900">{n.name}</div>
                <div className="text-xs text-stone-500">{STATS[n.id]}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
