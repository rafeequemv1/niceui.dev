import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Reveal } from '@/pages/landing/shared/motion';

const px = (id: number, ext: 'jpeg' | 'png' = 'jpeg', w = 400) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.${ext}?auto=compress&cs=tinysrgb&w=${w}`;

export const IMG = {
  latte: px(15554368),
  latteArt: px(8046389),
  cappuccino: px(19375004),
  vase: px(29904622),
  interior: px(14781780),
  plant: px(32473239, 'png'),
  sneakers: px(19869753),
  citrus: px(18815188),
  bloodOrange: px(13546345),
  team: px(23496704, 'jpeg', 800),
};

export const PEOPLE = {
  maya: { name: 'Maya Okafor', role: 'Head of Social, Brightloom', img: px(7717254, 'jpeg', 160) },
  daniel: { name: 'Daniel Reyes', role: 'Founder, Field Notes Co.', img: px(5308640, 'jpeg', 160) },
  amara: { name: 'Amara Bello', role: 'Content Lead, Oatside', img: px(6497112, 'jpeg', 160) },
  theo: { name: 'Theo Lindqvist', role: 'Creative Director, Northpaw', img: px(35681211, 'jpeg', 160) },
  jonah: { name: 'Jonah Whit', role: 'Growth, Parcel', img: px(39977028, 'jpeg', 160) },
  lena: { name: 'Lena Marsh', role: 'Agency Partner, Marsh & Co.', img: px(34930167, 'jpeg', 160) },
  kofi: { name: 'Kofi Mensah', role: 'Social Producer, Tonic', img: px(14950779, 'jpeg', 160) },
  zara: { name: 'Zara Nolan', role: 'Brand Manager, Velo', img: px(6497114, 'jpeg', 160) },
};

export const ACCENT = '#FF5A36';

export function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white/70 px-3 py-1 text-xs font-medium tracking-wide text-stone-600 backdrop-blur',
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-[#FF5A36]" />
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  accent,
  body,
  align = 'center',
}: {
  eyebrow: string;
  title: string;
  accent: string;
  body: string;
  align?: 'center' | 'left';
}) {
  return (
    <div className={cn('max-w-2xl', align === 'center' ? 'mx-auto text-center' : '')}>
      <Reveal>
        <Eyebrow>{eyebrow}</Eyebrow>
      </Reveal>
      <Reveal delay={80}>
        <h2 className="mt-4 text-4xl font-medium leading-[1.1] tracking-[-0.03em] text-stone-900 sm:text-5xl">
          {title} <span className="font-serif font-normal italic tracking-normal text-[#FF5A36]">{accent}</span>
        </h2>
      </Reveal>
      <Reveal delay={160}>
        <p className="mt-4 text-base leading-relaxed text-stone-600 sm:text-lg">{body}</p>
      </Reveal>
    </div>
  );
}

export function Avatar({ src, name, className }: { src: string; name: string; className?: string }) {
  return (
    <img
      src={src}
      alt={name}
      loading="lazy"
      className={cn('h-8 w-8 shrink-0 rounded-full object-cover ring-2 ring-white', className)}
    />
  );
}

export function PrimaryButton({ children, onClick, className }: { children: ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-white shadow-[0_8px_24px_-8px_rgba(28,25,23,0.6)] transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:bg-[#FF5A36] hover:shadow-[0_12px_32px_-8px_rgba(255,90,54,0.6)] active:translate-y-0 active:scale-[0.98]',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, onClick, className }: { children: ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full border border-stone-300 bg-white/70 px-6 py-3 text-sm font-medium text-stone-800 backdrop-blur transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:border-stone-900 hover:bg-white active:translate-y-0 active:scale-[0.98]',
        className,
      )}
    >
      {children}
    </button>
  );
}
