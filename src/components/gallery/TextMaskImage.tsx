import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { ARTWORKS, artwork } from './art';

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export type TextMaskImageProps = {
  /** Lines of the headline; the image shows through the letters. */
  lines: string[];
  images: { src: string; label: string }[];
  /** Cycle images automatically until the visitor picks one. */
  autoplay?: boolean;
  className?: string;
};

/** A huge headline with a slowly panning image shown through its letters. Hover a label to swap the image. */
export function TextMaskImage({ lines, images, autoplay = true, className }: TextMaskImageProps) {
  const [i, setI] = useState(0);
  const touched = useRef(false);
  const still = reduced();

  useEffect(() => {
    if (!autoplay || still) return;
    const id = window.setInterval(() => !touched.current && setI((v) => (v + 1) % images.length), 2800);
    return () => clearInterval(id);
  }, [autoplay, still, images.length]);

  const pick = (k: number) => {
    touched.current = true;
    setI(k);
  };

  return (
    <div className={cn('w-full overflow-hidden rounded-2xl bg-ink-950 px-5 py-10 text-center shadow-card sm:px-10', className)}>
      <style>{`@keyframes nui-pan{0%{background-position:0% 40%}50%{background-position:100% 60%}100%{background-position:0% 40%}}`}</style>
      <h3
        aria-label={lines.join(' ')}
        className="select-none font-black uppercase leading-[0.86] tracking-[-0.05em] transition-[background-image] duration-500"
        style={{
          fontSize: 'clamp(56px, 15vw, 168px)',
          backgroundImage: `url(${images[i].src})`,
          backgroundSize: '180% auto',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          animation: still ? undefined : 'nui-pan 18s ease-in-out infinite',
        }}
      >
        {lines.map((l) => (
          <span key={l} className="block">
            {l}
          </span>
        ))}
      </h3>
      <div className="mt-8 flex flex-wrap justify-center gap-2" role="group" aria-label="Choose image">
        {images.map((im, k) => (
          <button
            key={im.label}
            onMouseEnter={() => pick(k)}
            onFocus={() => pick(k)}
            onClick={() => pick(k)}
            aria-pressed={k === i}
            className={cn('focus-ring flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-xs transition-colors', k === i ? 'border-brand-400/50 bg-brand-500/10 text-ink-50' : 'border-white/10 text-ink-400 hover:text-ink-100')}
          >
            <img src={im.src} alt="" className="h-6 w-6 rounded-full object-cover" />
            {im.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function TextMaskImageDemo() {
  const images = [2, 6, 1, 9].map((id) => ({ src: artwork(id, 1200, 800), label: ARTWORKS[id].title }));
  return <TextMaskImage lines={['Light', '& Land']} images={images} />;
}
