import {
  ArrowRight,
  Code2,
  Copy,
  FolderTree,
  Package,
  Palette,
  Rocket,
  Settings,
  Terminal,
  Zap,
} from 'lucide-react';
import { CodeBlock } from '@/components/ui/CodeBlock';

type GuideProps = { onNavigate?: (to: string) => void };

const steps = [
  { icon: Package, title: 'Install', desc: 'Copy the files you need — no npm package required.' },
  { icon: Settings, title: 'Configure', desc: 'Add the theme tokens and Tailwind config to your project.' },
  { icon: Code2, title: 'Import', desc: 'Drop components into your app with the @/ alias.' },
  { icon: Rocket, title: 'Ship', desc: 'Enjoy premium animations out of the box.' },
];

const installCode = `# 1. Copy the src/components folder into your project
# 2. Add the Tailwind theme tokens (see tailwind.config.js)

# 3. Install dependencies
npm install lucide-react

# 4. Import and use
import { Button } from "@/components/ui/core/Button";

<Button variant="primary" size="lg">
  Get started
</Button>`;

const themeCode = `// tailwind.config.js — the important parts
export default {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: { 50: "#f7f7f8", /* ... */ 950: "#0a0a0c" },
        brand: { 50: "#eef8ff", /* ... */ 950: "#142b57" },
      },
      animation: {
        "fade-up": "fade-up 400ms cubic-bezier(0.16,1,0.3,1) both",
        shimmer: "shimmer 2.4s linear infinite",
        blob: "blob 12s ease-in-out infinite",
      },
    },
  },
};`;

const folderCode = `src/
├── components/
│   ├── ui/
│   │   ├── core/       # Button, Input, Card, Tabs, Switch...
│   │   └── motion/     # Modal, Drawer, Tooltip, Loader...
│   ├── ai/             # VoiceOrb, ChatApp, StreamingResponse...
│   └── blocks/         # CommandPalette, OtpInput, FileUpload...
├── pages/
│   └── examples/       # Full dashboard templates
└── registry/           # Documentation entries`;

export function GuidesPage({ onNavigate }: GuideProps) {
  const go = (to: string) => onNavigate?.(to);
  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-10 sm:px-8 lg:pt-14">
      <div className="animate-fade-up">
        <div className="text-xs font-medium uppercase tracking-[0.14em] text-brand-400">Getting started</div>
        <h1 className="mt-3 text-3xl font-semibold text-ink-50 sm:text-4xl">Guides</h1>
        <p className="mt-3 max-w-2xl text-base text-ink-400">
          Everything you need to get NiceUI running in your project. No build step, no runtime dependency — just copy, paste, and ship.
        </p>
      </div>

      {/* Quick start steps */}
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <div key={s.title} className="surface p-5 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/10">
              <s.icon className="h-5 w-5 text-brand-400" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-ink-500">0{i + 1}</span>
              <h3 className="font-medium text-ink-50">{s.title}</h3>
            </div>
            <p className="mt-1.5 text-sm text-ink-400">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Install */}
      <section className="mt-12 animate-fade-up" style={{ animationDelay: '120ms' }}>
        <h2 className="flex items-center gap-2 text-xl font-semibold text-ink-50">
          <Terminal className="h-5 w-5 text-brand-400" />
          Installation
        </h2>
        <p className="mt-2 text-sm text-ink-400">
          NiceUI is a copy-paste library. Clone the repo or grab the files you need from <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-xs text-brand-300">src/components/</code>.
        </p>
        <div className="mt-4">
          <CodeBlock code={installCode} filename="install.sh" language="bash" maxHeight={320} />
        </div>
      </section>

      {/* Theme */}
      <section className="mt-12 animate-fade-up" style={{ animationDelay: '160ms' }}>
        <h2 className="flex items-center gap-2 text-xl font-semibold text-ink-50">
          <Palette className="h-5 w-5 text-brand-400" />
          Theme configuration
        </h2>
        <p className="mt-2 text-sm text-ink-400">
          Add the <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-xs text-brand-300">ink</code> and <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-xs text-brand-300">brand</code> color ramps plus the animation keyframes to your Tailwind config.
        </p>
        <div className="mt-4">
          <CodeBlock code={themeCode} filename="tailwind.config.js" maxHeight={360} />
        </div>
      </section>

      {/* Folder structure */}
      <section className="mt-12 animate-fade-up" style={{ animationDelay: '200ms' }}>
        <h2 className="flex items-center gap-2 text-xl font-semibold text-ink-50">
          <FolderTree className="h-5 w-5 text-brand-400" />
          Folder structure
        </h2>
        <p className="mt-2 text-sm text-ink-400">
          Components are organized by category. Each file is self-contained and exports named components.
        </p>
        <div className="mt-4">
          <CodeBlock code={folderCode} filename="project structure" language="text" showLineNumbers={false} maxHeight={360} />
        </div>
      </section>

      {/* Features */}
      <section className="mt-12 animate-fade-up" style={{ animationDelay: '240ms' }}>
        <h2 className="text-xl font-semibold text-ink-50">Why NiceUI?</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {[
            { icon: Zap, title: 'Zero runtime deps', desc: 'Only lucide-react for icons. All animations use CSS transforms and Tailwind keyframes.' },
            { icon: Copy, title: 'Copy-paste friendly', desc: 'No npm install. Grab the file, drop it in, and tweak as you see fit.' },
            { icon: Code2, title: 'Fully typed', desc: 'Every component ships with TypeScript types and strict null checks.' },
            { icon: Palette, title: 'Consistent design system', desc: 'One color system, one spacing scale, one set of motion primitives.' },
          ].map((f, i) => (
            <div key={f.title} className="surface p-5 animate-fade-up" style={{ animationDelay: `${280 + i * 60}ms` }}>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white/5">
                <f.icon className="h-5 w-5 text-brand-400" />
              </div>
              <h3 className="font-medium text-ink-50">{f.title}</h3>
              <p className="mt-1.5 text-sm text-ink-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Next steps */}
      <div className="mt-12 flex flex-wrap gap-3 animate-fade-up" style={{ animationDelay: '400ms' }}>
        <button
          onClick={() => go('/components/button')}
          className="focus-ring group flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-medium text-white shadow-glow transition-all hover:bg-brand-400 active:scale-[0.97]"
        >
 Browse components
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
        <button
          onClick={() => go('/intro/motion-guides')}
          className="focus-ring flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-ink-100 backdrop-blur transition-all hover:bg-white/10 active:scale-[0.97]"
        >
          Motion guides
        </button>
      </div>
    </div>
  );
}
