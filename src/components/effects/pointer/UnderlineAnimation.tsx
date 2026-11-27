import type { AnchorHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export type UnderlineVariant = 'slide' | 'center' | 'wave' | 'highlight' | 'double' | 'gradient';

export type UnderlineLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: UnderlineVariant };

const CSS = `
.ul-x{position:relative;display:inline-block;text-decoration:none;color:inherit;outline:none}
.ul-x:focus-visible{outline:2px solid #7dd3fc;outline-offset:4px;border-radius:4px}
.ul-x::before,.ul-x::after{content:"";position:absolute;left:0;right:0;pointer-events:none}
.ul-slide::after{bottom:-3px;height:1.5px;background:currentColor;transform:scaleX(0);transform-origin:right;transition:transform .45s cubic-bezier(.2,.8,.2,1)}
.ul-slide:hover::after,.ul-slide:focus-visible::after{transform:scaleX(1);transform-origin:left}
.ul-center::after{bottom:-3px;height:2px;border-radius:2px;background:#7dd3fc;transform:scaleX(0);transition:transform .35s cubic-bezier(.2,.8,.2,1)}
.ul-center:hover::after,.ul-center:focus-visible::after{transform:scaleX(1)}
.ul-wave::after{bottom:-7px;height:7px;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='7' viewBox='0 0 20 7'%3E%3Cpath d='M0 3.5 Q5 0 10 3.5 T20 3.5' fill='none' stroke='%237dd3fc' stroke-width='1.6'/%3E%3C/svg%3E") repeat-x 0 0/20px 7px;clip-path:inset(0 100% 0 0);transition:clip-path .45s cubic-bezier(.2,.8,.2,1)}
.ul-wave:hover::after,.ul-wave:focus-visible::after{clip-path:inset(0 0 0 0);animation:ul-wave .6s linear infinite}
@keyframes ul-wave{to{background-position-x:20px}}
.ul-highlight{z-index:0;padding:0 2px}
.ul-highlight::before{z-index:-1;bottom:0;top:auto;height:.35em;background:rgba(125,211,252,.28);border-radius:2px;transition:height .35s cubic-bezier(.2,.8,.2,1)}
.ul-highlight:hover::before,.ul-highlight:focus-visible::before{height:100%}
.ul-double::before,.ul-double::after{height:1px;background:currentColor;transition:transform .4s cubic-bezier(.2,.8,.2,1)}
.ul-double::before{bottom:-2px;transform:scaleX(0);transform-origin:left}
.ul-double::after{bottom:-6px;transform:scaleX(0);transform-origin:right;transition-delay:.06s}
.ul-double:hover::before,.ul-double:hover::after,.ul-double:focus-visible::before,.ul-double:focus-visible::after{transform:scaleX(1)}
.ul-gradient::after{bottom:-3px;height:2px;border-radius:2px;background:linear-gradient(90deg,#7dd3fc,#a78bfa,#f472b6,#7dd3fc);background-size:300% 100%;opacity:.35;transition:opacity .3s}
.ul-gradient:hover::after,.ul-gradient:focus-visible::after{opacity:1;animation:ul-grad 1.6s linear infinite}
@keyframes ul-grad{to{background-position:300% 0}}
@media (prefers-reduced-motion:reduce){.ul-x::before,.ul-x::after{transition:none!important;animation:none!important}}
`;

/** Injects the underline styles once per document. */
function UnderlineStyles() {
  return <style>{CSS}</style>;
}

/** A link with an animated hover and focus underline. Pure CSS, six variants. */
export function UnderlineLink({ variant = 'slide', className, children, ...rest }: UnderlineLinkProps) {
  return (
    <>
      <UnderlineStyles />
      <a {...rest} className={cn('ul-x', `ul-${variant}`, className)}>
        {children}
      </a>
    </>
  );
}

const VARIANTS: { v: UnderlineVariant; label: string }[] = [
  { v: 'slide', label: 'Slide in, slide out' },
  { v: 'center', label: 'Grow from center' },
  { v: 'wave', label: 'Wavy line' },
  { v: 'highlight', label: 'Highlight sweep' },
  { v: 'double', label: 'Double line' },
  { v: 'gradient', label: 'Gradient flow' },
];

export function UnderlineAnimationDemo() {
  return (
    <div className="grid w-full max-w-2xl gap-3 sm:grid-cols-2">
      {VARIANTS.map(({ v, label }) => (
        <div key={v} className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.06] bg-ink-950 px-5 py-6">
          <UnderlineLink href="#" variant={v} onClick={(e) => e.preventDefault()} className="text-[17px] font-medium text-ink-50">
            {label}
          </UnderlineLink>
          <code className="shrink-0 font-mono text-[11px] text-ink-500">{v}</code>
        </div>
      ))}
    </div>
  );
}
