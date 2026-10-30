import type { ButtonHTMLAttributes } from 'react';
import { Github } from 'lucide-react';
import { cn } from '@/lib/cn';

const css = `@keyframes nui-rainbow{to{background-position:200% 0}}
@media (prefers-reduced-motion:reduce){.nui-rainbow,.nui-rainbow-glow{animation:none!important}}`;
const gradient = 'linear-gradient(90deg,#38bdf8,#a78bfa,#f472b6,#fb923c,#facc15,#4ade80,#38bdf8)';

/** A dark button whose border and glow cycle through an animated rainbow. */
export function RainbowButton({ className, children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...rest} className={cn('focus-ring group relative inline-flex h-11 rounded-full p-px transition-transform active:scale-[0.97]', className)}>
      <style>{css}</style>
      <span aria-hidden className="nui-rainbow-glow absolute inset-x-4 -bottom-2 h-4 rounded-full opacity-60 blur-lg transition-opacity group-hover:opacity-90 [animation:nui-rainbow_4s_linear_infinite]" style={{ backgroundImage: gradient, backgroundSize: '200% 100%' }} />
      <span aria-hidden className="nui-rainbow absolute inset-0 rounded-full [animation:nui-rainbow_4s_linear_infinite]" style={{ backgroundImage: gradient, backgroundSize: '200% 100%' }} />
      <span className="relative flex h-full items-center gap-2 rounded-full bg-ink-950 px-6 text-sm font-medium text-ink-50">{children}</span>
    </button>
  );
}

export function RainbowButtonDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <RainbowButton>
        <Github className="h-4 w-4" /> Star on GitHub
      </RainbowButton>
      <RainbowButton>Join the waitlist</RainbowButton>
    </div>
  );
}
