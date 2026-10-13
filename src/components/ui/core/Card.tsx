import { useRef, type PointerEvent, type ReactNode } from 'react';
import { ArrowUpRight, Check, Github, MapPin, TrendingUp, Zap } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Badge } from './Badge';
import { Button } from './Button';

export type CardProps = {
  children: ReactNode;
  className?: string;
  /** Enables the cursor-follow spotlight, hover lift and border glow. */
  interactive?: boolean;
};

export function Card({ children, className, interactive = false }: CardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--x', `${e.clientX - r.left}px`);
    el.style.setProperty('--y', `${e.clientY - r.top}px`);
  };

  return (
    <div
      ref={ref}
      onPointerMove={interactive ? onMove : undefined}
      className={cn(
        'group/card relative overflow-hidden rounded-2xl bg-ink-900 shadow-card',
        interactive && 'transition-[transform,box-shadow] duration-300 ease-smooth hover:-translate-y-0.5 hover:shadow-pop',
        className,
      )}
    >
      {interactive && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100"
            style={{ background: 'radial-gradient(420px circle at var(--x, 50%) var(--y, 50%), rgba(51,150,255,0.10), transparent 45%)' }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover/card:opacity-100"
            style={{
              padding: 1,
              background: 'radial-gradient(260px circle at var(--x, 50%) var(--y, 50%), rgba(89,182,255,0.55), transparent 60%)',
              WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
            }}
          />
        </>
      )}
      <div className="relative">{children}</div>
    </div>
  );
}

const BARS = [32, 48, 40, 64, 52, 72, 58, 84, 70, 92, 78, 100];

export function CardDemo() {
  return (
    <div className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-4 md:grid-cols-2">
      <div className="animate-fade-up">
        <Card interactive className="h-full p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-300 ring-1 ring-inset ring-brand-500/25">
            <Zap className="h-5 w-5" />
          </div>
          <h3 className="mt-5 text-base font-medium text-ink-50">Edge functions</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-400">
            Run server code within 50ms of every user. Hover to see the spotlight follow your cursor.
          </p>
          <a href="#" onClick={(e) => e.preventDefault()} className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-brand-300 hover:text-brand-200">
            Read the docs <ArrowUpRight className="h-4 w-4 transition-transform group-hover/card:-translate-y-0.5 group-hover/card:translate-x-0.5" />
          </a>
        </Card>
      </div>

      <div className="animate-fade-up [animation-delay:80ms]">
        <Card interactive className="h-full p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-ink-400">Monthly revenue</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight text-ink-50 tabular-nums">$48,290</p>
            </div>
            <Badge tone="success">
              <TrendingUp className="h-3 w-3" /> 12.4%
            </Badge>
          </div>
          <div className="mt-6 flex h-20 items-end gap-1.5">
            {BARS.map((h, i) => (
              <div
                key={i}
                className="flex-1 origin-bottom rounded-sm bg-gradient-to-t from-brand-600/40 to-brand-400 transition-all duration-300 hover:to-brand-200"
                style={{ height: `${h}%`, animation: `fade-up 500ms cubic-bezier(0.16,1,0.3,1) ${200 + i * 40}ms both` }}
              />
            ))}
          </div>
        </Card>
      </div>

      <div className="animate-fade-up [animation-delay:160ms]">
        <Card interactive className="h-full p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-ink-100">Pro</p>
            <Badge tone="brand">Most popular</Badge>
          </div>
          <p className="mt-3 flex items-baseline gap-1">
            <span className="text-4xl font-semibold tracking-tight text-ink-50">$24</span>
            <span className="text-sm text-ink-400">/ seat / month</span>
          </p>
          <ul className="mt-5 space-y-2.5 text-sm text-ink-300">
            {['Unlimited projects', 'Preview deployments', 'Advanced analytics', 'Priority support'].map((f) => (
              <li key={f} className="flex items-center gap-2.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-500/15 text-brand-300">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                {f}
              </li>
            ))}
          </ul>
          <Button className="mt-6 w-full">Start 14-day trial</Button>
        </Card>
      </div>

      <div className="animate-fade-up [animation-delay:240ms]">
        <Card interactive className="h-full p-6">
          <div className="flex items-center gap-4">
            <img
              src="https://images.pexels.com/photos/33680700/pexels-photo-33680700.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop"
              alt="Maya Chen"
              className="h-14 w-14 rounded-full object-cover ring-2 ring-ink-800"
            />
            <div className="min-w-0">
              <p className="truncate font-medium text-ink-50">Maya Chen</p>
              <p className="truncate text-sm text-ink-400">Staff engineer · Platform</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-ink-500">
                <MapPin className="h-3 w-3" /> Lisbon, PT
              </p>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-3 divide-x divide-white/5 rounded-xl bg-ink-950/50 py-3 text-center shadow-hairline">
            {[
              ['1.2k', 'Commits'],
              ['86', 'Reviews'],
              ['14', 'Repos'],
            ].map(([v, l]) => (
              <div key={l}>
                <p className="text-sm font-medium text-ink-50 tabular-nums">{v}</p>
                <p className="text-xs text-ink-500">{l}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="secondary" size="sm" className="flex-1">
              Follow
            </Button>
            <Button variant="outline" size="sm" leftIcon={<Github />} className="flex-1">
              Profile
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
