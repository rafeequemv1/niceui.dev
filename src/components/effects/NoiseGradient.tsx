import { type ReactNode } from 'react';
import { cn } from '@/lib/cn';

const css = `@keyframes nui-mesh-a{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(18%,12%) scale(1.15)}}
@keyframes nui-mesh-b{0%,100%{transform:translate(0,0) scale(1.1)}50%{transform:translate(-16%,-10%) scale(.95)}}
@keyframes nui-mesh-c{0%,100%{transform:translate(0,0)}50%{transform:translate(10%,-18%)}}
@media (prefers-reduced-motion:reduce){.nui-mesh{animation:none!important}}`;

const grain = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.55'/%3E%3C/svg%3E")`;

export type NoiseGradientProps = { children?: ReactNode; colors?: [string, string, string]; className?: string };

/** A slowly shifting mesh gradient with film grain on top. */
export function NoiseGradient({ children, colors = ['#0ea5e9', '#7c3aed', '#f472b6'], className }: NoiseGradientProps) {
  const blob = 'nui-mesh absolute h-[70%] w-[70%] rounded-full blur-3xl opacity-70';
  return (
    <div className={cn('relative isolate overflow-hidden rounded-2xl bg-ink-950', className)}>
      <style>{css}</style>
      <div aria-hidden className={cn(blob, '-left-[10%] -top-[20%] [animation:nui-mesh-a_14s_ease-in-out_infinite]')} style={{ background: colors[0] }} />
      <div aria-hidden className={cn(blob, '-right-[15%] top-[10%] [animation:nui-mesh-b_16s_ease-in-out_infinite]')} style={{ background: colors[1] }} />
      <div aria-hidden className={cn(blob, '-bottom-[30%] left-[20%] [animation:nui-mesh-c_18s_ease-in-out_infinite]')} style={{ background: colors[2] }} />
      <div aria-hidden className="absolute inset-0 mix-blend-overlay" style={{ backgroundImage: grain }} />
      <div className="relative">{children}</div>
    </div>
  );
}

export function NoiseGradientDemo() {
  return (
    <NoiseGradient className="w-full max-w-3xl">
      <div className="flex min-h-[300px] flex-col items-center justify-center px-6 py-16 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/70">Spring release</p>
        <h3 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">Colour with texture.</h3>
        <p className="mt-3 max-w-sm text-sm text-white/75">Three drifting gradients and a layer of SVG grain. No images, no canvas.</p>
      </div>
    </NoiseGradient>
  );
}
