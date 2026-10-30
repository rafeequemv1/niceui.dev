import { cn } from '@/lib/cn';
import { img } from './data';

/** A framed print on a soft studio wall — the product shot used across the shop demos. */
export function Print({ art, frame = '#1c1c1f', className, zoom = 1 }: { art: number; frame?: string; className?: string; zoom?: number }) {
  const light = frame === '#f1efe9';
  return (
    <div className={cn('relative grid place-items-center overflow-hidden bg-gradient-to-b from-[#1a1b1f] to-[#101114]', className)}>
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent" />
      <div
        className="relative w-[62%] p-[3.2%] shadow-[0_24px_40px_-16px_rgba(0,0,0,0.8)] transition-transform duration-500 ease-smooth"
        style={{ background: frame, transform: `scale(${zoom})` }}
      >
        <div className={cn('p-[7%]', light ? 'bg-white' : 'bg-[#f6f4ef]')}>
          <img src={img(art)} alt="" draggable={false} className="block aspect-[4/5] w-full object-cover" />
        </div>
      </div>
    </div>
  );
}
