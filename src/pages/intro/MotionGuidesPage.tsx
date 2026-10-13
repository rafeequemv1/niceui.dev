import { ArrowRight, Boxes, Layers, Move, Sparkles, Waves, Zap } from 'lucide-react';
import { CodeBlock } from '@/components/ui/CodeBlock';

type GuideProps = { onNavigate?: (to: string) => void };

const principles = [
  { icon: Sparkles, title: 'Easing matters', desc: 'Use cubic-bezier(0.16, 1, 0.3, 1) for entrances and cubic-bezier(0.34, 1.56, 0.64, 1) for spring-like pops.' },
  { icon: Layers, title: 'Stagger entrances', desc: 'Delay child animations by 40-80ms each. A 60ms stagger feels natural without dragging.' },
  { icon: Move, title: 'Transforms only', desc: 'Animate transform and opacity. Never animate width, height, or top — they trigger layout thrash.' },
  { icon: Zap, title: 'Exit animations', desc: 'Keep elements mounted during exit with a timeout state so users perceive continuity.' },
];

const easingCode = `// tailwind.config.js
transitionTimingFunction: {
  spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  smooth: "cubic-bezier(0.16, 1, 0.3, 1)",
}

// Usage
<div className="transition-transform duration-300 ease-spring" />
<div className="animate-fade-up" />`;

const staggerCode = `// Stagger children with animationDelay
function Grid({ items }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {items.map((item, i) => (
        <div
          key={item.id}
          className="animate-fade-up"
          style={{ animationDelay: \`\${i * 60}ms\` }}
        >
          {item.label}
        </div>
      ))}
    </div>
  );
}`;

const heightCode = `// Smooth height transitions with grid-rows
function Collapsible({ open, children }) {
  return (
    <div
      className={cn(
        "grid transition-[grid-template-rows] duration-300 ease-smooth",
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
      )}
    >
      <div className="overflow-hidden">{children}</div>
    </div>
  );
}`;

const indicatorCode = `// Sliding pill indicator that measures position
function Tabs({ tabs, value, onChange }) {
  const refs = useRef<Record<string, HTMLButtonElement>>({});
  const [pill, setPill] = useState({ x: 0, w: 0 });

  useEffect(() => {
    const el = refs.current[value];
    if (el) {
      setPill({ x: el.offsetLeft, w: el.offsetWidth });
    }
  }, [value]);

  return (
    <div className="relative flex">
      {tabs.map((t) => (
        <button key={t.id} ref={(el) => { if (el) refs.current[t.id] = el; }}>
          {t.label}
        </button>
      ))}
      <span
        className="absolute top-0 h-full rounded-lg bg-white/5 transition-all duration-300 ease-spring"
        style={{ transform: \`translateX(\${pill.x}px)\`, width: pill.w }}
      />
    </div>
  );
}`;

export function MotionGuidesPage({ onNavigate }: GuideProps) {
  const go = (to: string) => onNavigate?.(to);
  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-10 sm:px-8 lg:pt-14">
      <div className="animate-fade-up">
        <div className="text-xs font-medium uppercase tracking-[0.14em] text-brand-400">Animation</div>
        <h1 className="mt-3 text-3xl font-semibold text-ink-50 sm:text-4xl">Motion guides</h1>
        <p className="mt-3 max-w-2xl text-base text-ink-400">
          The patterns behind NiceUI's animations. Every component in this library follows these rules — master them and your interfaces will feel alive.
        </p>
      </div>

      {/* Principles */}
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {principles.map((p, i) => (
          <div key={p.title} className="surface p-5 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/10">
              <p.icon className="h-5 w-5 text-brand-400" />
            </div>
            <h3 className="font-medium text-ink-50">{p.title}</h3>
            <p className="mt-1.5 text-sm text-ink-400">{p.desc}</p>
          </div>
        ))}
      </div>

      {/* Easing */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-ink-50">Easing curves</h2>
        <p className="mt-2 text-sm text-ink-400">
          The two custom easing functions used throughout the library. <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-xs text-brand-300">smooth</code> for entrances, <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-xs text-brand-300">spring</code> for interactive feedback.
        </p>
        <div className="mt-4">
          <CodeBlock code={easingCode} filename="easing.ts" maxHeight={280} />
        </div>
      </section>

      {/* Stagger */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold text-ink-50">Staggered entrances</h2>
        <p className="mt-2 text-sm text-ink-400">
          The simplest way to make a list or grid feel premium: delay each child's entrance by a small increment.
        </p>
        <div className="mt-4">
          <CodeBlock code={staggerCode} filename="Stagger.tsx" maxHeight={280} />
        </div>
      </section>

      {/* Height transitions */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold text-ink-50">Smooth height transitions</h2>
        <p className="mt-2 text-sm text-ink-400">
          The <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-xs text-brand-300">grid-rows-[0fr]</code> to <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-xs text-brand-300">grid-rows-[1fr]</code> trick animates height without measuring scrollHeight in JavaScript.
        </p>
        <div className="mt-4">
          <CodeBlock code={heightCode} filename="Collapsible.tsx" maxHeight={280} />
        </div>
      </section>

      {/* Sliding indicator */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold text-ink-50">Sliding pill indicator</h2>
        <p className="mt-2 text-sm text-ink-400">
          Measure <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-xs text-brand-300">offsetLeft</code> and <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-xs text-brand-300">offsetWidth</code> of the active tab, then translate a shared background element. This powers Tabs, the sidebar, and the segmented controls.
        </p>
        <div className="mt-4">
          <CodeBlock code={indicatorCode} filename="Tabs.tsx" maxHeight={360} />
        </div>
      </section>

      {/* See it in action */}
      <section className="mt-12">
        <div className="surface flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <h3 className="flex items-center gap-2 font-medium text-ink-50">
              <Boxes className="h-5 w-5 text-brand-400" />
              See these patterns in action
            </h3>
            <p className="mt-1 text-sm text-ink-400">Explore the motion components to see easing, staggering and morphing live.</p>
          </div>
          <button
            onClick={() => go('/components/tooltip')}
            className="focus-ring group flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-medium text-white shadow-glow transition-all hover:bg-brand-400 active:scale-[0.97]"
          >
            Motion components
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </section>
    </div>
  );
}
