import type { ComponentType, ReactNode } from 'react';
import { Box, Command, Compass, Globe, Hexagon, Layers, Sparkles, Zap } from 'lucide-react';
import { cn } from '@/lib/cn';

export type MarqueeProps = {
  children: ReactNode;
  vertical?: boolean;
  reverse?: boolean;
  pauseOnHover?: boolean;
  duration?: number;
  gap?: number;
  className?: string;
};

export function Marquee({ children, vertical = false, reverse = false, pauseOnHover = true, duration = 30, gap = 16, className }: MarqueeProps) {
  return (
    <div className={cn('group flex overflow-hidden', vertical ? 'mask-fade-y flex-col' : 'mask-fade-x', className)}>
      <div
        className={cn(
          'flex shrink-0',
          vertical ? 'animate-marquee-y flex-col' : 'animate-marquee',
          pauseOnHover && 'group-hover:[animation-play-state:paused]',
        )}
        style={{ animationDuration: `${duration}s`, animationDirection: reverse ? 'reverse' : 'normal' }}
      >
        {[0, 1].map((copy) => (
          <div
            key={copy}
            aria-hidden={copy === 1}
            className={cn('flex shrink-0', vertical && 'flex-col')}
            style={vertical ? { gap, paddingBottom: gap } : { gap, paddingRight: gap }}
          >
            {children}
          </div>
        ))}
      </div>
    </div>
  );
}

const LOGOS: Array<{ name: string; icon: ComponentType<{ className?: string }> }> = [
  { name: 'Vertex', icon: Hexagon },
  { name: 'Boxwell', icon: Box },
  { name: 'Voltage', icon: Zap },
  { name: 'Orbital', icon: Globe },
  { name: 'Stackr', icon: Layers },
  { name: 'Keystroke', icon: Command },
  { name: 'Northstar', icon: Compass },
  { name: 'Lumina', icon: Sparkles },
];

function Logo({ name, icon: Icon }: (typeof LOGOS)[number]) {
  return (
    <div className="flex items-center gap-2 px-5 text-ink-400 transition-colors duration-300 hover:text-ink-50">
      <Icon className="h-5 w-5" />
      <span className="text-lg font-semibold tracking-tight">{name}</span>
    </div>
  );
}

export function LogoMarqueeDemo() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-ink-500">Trusted by teams at</p>
      <Marquee duration={28} gap={8}>
        {LOGOS.map((l) => <Logo key={l.name} {...l} />)}
      </Marquee>
      <Marquee duration={34} gap={8} reverse>
        {[...LOGOS].reverse().map((l) => <Logo key={l.name} {...l} />)}
      </Marquee>
    </div>
  );
}

const QUOTES = [
  { name: 'Lena Fischer', role: 'Design lead, Vertex', text: 'The toast stack alone saved us a sprint. It feels exactly like the apps we admire.' },
  { name: 'Marcus Reid', role: 'Founder, Voltage', text: 'We replaced three animation libraries with NiceUI and our bundle dropped 41 kB.' },
  { name: 'Aiko Tanaka', role: 'Frontend, Orbital', text: 'Every component has that last 10% of polish you usually never get to.' },
  { name: 'Diego Alvarez', role: 'CTO, Stackr', text: 'Copy, paste, ship. The code reads like something our own team would write.' },
  { name: 'Priya Nair', role: 'PM, Northstar', text: 'Customers literally comment on how smooth the dashboard feels now.' },
  { name: 'Tom Becker', role: 'Engineer, Boxwell', text: 'The bottom sheet physics are better than the native one we had before.' },
];

function Quote({ q }: { q: (typeof QUOTES)[number] }) {
  return (
    <figure className="w-full rounded-2xl bg-ink-900 p-4 shadow-card transition-transform duration-300 ease-smooth hover:-translate-y-0.5">
      <blockquote className="text-sm leading-relaxed text-ink-200">“{q.text}”</blockquote>
      <figcaption className="mt-3 flex items-center gap-2.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-teal-400 text-[11px] font-semibold text-ink-950">
          {q.name.split(' ').map((p) => p[0]).join('')}
        </span>
        <span>
          <span className="block text-xs font-medium text-ink-100">{q.name}</span>
          <span className="block text-[11px] text-ink-500">{q.role}</span>
        </span>
      </figcaption>
    </figure>
  );
}

export function VerticalMarqueeDemo() {
  return (
    <div className="mx-auto grid h-[380px] w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
      <Marquee vertical duration={26}>
        {QUOTES.slice(0, 3).map((q) => <Quote key={q.name} q={q} />)}
      </Marquee>
      <Marquee vertical reverse duration={30} className="hidden sm:flex">
        {QUOTES.slice(3).map((q) => <Quote key={q.name} q={q} />)}
      </Marquee>
    </div>
  );
}
