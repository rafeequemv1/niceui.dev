import type { DocEntry } from '@/docs/types';
import { ScrollAnimationDemo } from '@/components/ui/motion/ScrollAnimation';
import { LoaderDemo } from '@/components/ui/motion/Loader';
import { ThemeToggleDemo } from '@/components/ui/motion/ThemeToggle';
import { ActionSwapDemo } from '@/components/ui/motion/ActionSwap';
import { ExpandableControlDemo } from '@/components/ui/motion/ExpandableControl';
import { DockDemo } from '@/components/ui/motion/Dock';
import { AnimatedSidebarDemo } from '@/components/ui/motion/AnimatedSidebar';

export const controlEntries: DocEntry[] = [
  {
    slug: 'scroll-animation',
    name: 'Scroll Animation',
    description: 'Scroll-linked progress, parallax layers and reveal-on-scroll, scoped to any scroll container.',
    demos: [
      {
        title: 'Scroll inside the frame',
        component: ScrollAnimationDemo,
        height: 480,
        code: `import { Reveal, useScrollProgress } from '@/components/ui/motion/ScrollAnimation';

export function Landing() {
  const ref = useRef<HTMLDivElement>(null);
  const { progress, top } = useScrollProgress(ref);

  return (
    <div ref={ref} className="h-[420px] overflow-y-auto">
      <div className="sticky top-0 h-0.5 origin-left bg-brand-500" style={{ transform: \`scaleX(\${progress})\` }} />
      <h1 style={{ transform: \`translateY(\${top * 0.35}px)\` }}>Ship faster</h1>
      {features.map((f, i) => (
        <Reveal key={f.title} root={ref} delay={i * 60}>
          <FeatureCard {...f} />
        </Reveal>
      ))}
    </div>
  );
}`,
      },
    ],
    props: [
      { name: 'Reveal.root', type: 'RefObject<HTMLElement>', default: 'viewport', description: 'Scroll container observed by IntersectionObserver.' },
      { name: 'Reveal.delay', type: 'number', default: '0', description: 'Transition delay in ms when revealed.' },
      { name: 'useScrollProgress(ref)', type: '{ progress: number; top: number }', description: 'rAF-throttled scroll progress (0–1) and scrollTop.' },
    ],
  },
  {
    slug: 'loader',
    name: 'Loader',
    description: 'Eight polished loading indicators, from spinners and orbits to shimmering skeletons.',
    demos: [
      {
        title: 'All loaders',
        component: LoaderDemo,
        height: 400,
        code: `import { Loader, SkeletonCard, ProgressLoader } from '@/components/ui/motion/Loader';

export function Pending({ kind }) {
  if (kind === 'list') return <SkeletonCard />;
  if (kind === 'upload') return <ProgressLoader />;

  return (
    <div className="flex items-center gap-4">
      <Loader variant="ring" />
      <Loader variant="orbit" />
      <Loader variant="gradient" />
    </div>
  );
}`,
      },
    ],
    props: [
      { name: 'variant', type: "'ring' | 'dots' | 'bars' | 'orbit' | 'pulse' | 'progress' | 'skeleton' | 'gradient'", default: "'ring'", description: 'Loader style.' },
      { name: 'size', type: 'number', default: '28 / 36', description: 'Diameter for SpinnerRing and GradientSpinner.' },
      { name: 'className', type: 'string', description: 'Extra classes for the loader root.' },
    ],
  },
  {
    slug: 'theme-toggle',
    name: 'Theme Toggle',
    description: 'A sun-to-moon morphing toggle and a three-way segmented control with a sliding pill.',
    demos: [
      {
        title: 'Toggle & segmented',
        description: 'Changes apply to the preview card only.',
        component: ThemeToggleDemo,
        code: `import { SunMoonToggle, ThemeSegmented, type ThemeMode } from '@/components/ui/motion/ThemeToggle';

export function ThemeControls() {
  const [mode, setMode] = useState<ThemeMode>('system');
  const dark = mode === 'dark';

  return (
    <div className="flex items-center gap-3">
      <SunMoonToggle dark={dark} onChange={(d) => setMode(d ? 'dark' : 'light')} />
      <ThemeSegmented value={mode} onChange={setMode} />
    </div>
  );
}`,
      },
    ],
    props: [
      { name: 'dark', type: 'boolean', description: 'SunMoonToggle state.' },
      { name: 'onChange', type: '(dark: boolean) => void', description: 'SunMoonToggle change handler.' },
      { name: 'value', type: "'light' | 'dark' | 'system'", description: 'ThemeSegmented selected mode.' },
      { name: 'onChange (segmented)', type: '(mode: ThemeMode) => void', description: 'ThemeSegmented change handler.' },
    ],
  },
  {
    slug: 'action-swap',
    name: 'Action Swap',
    description: 'Icon and label swaps for stateful actions: copy, follow, play and like with a particle burst.',
    demos: [
      {
        title: 'Stateful buttons',
        component: ActionSwapDemo,
        height: 260,
        code: `import { ActionSwap, CopyButton, LikeButton } from '@/components/ui/motion/ActionSwap';

export function Actions() {
  const [following, setFollowing] = useState(false);
  return (
    <div className="flex gap-3">
      <CopyButton text="npx lumen add action-swap" />
      <ActionSwap
        active={following}
        onToggle={() => setFollowing((f) => !f)}
        idle={{ icon: UserPlus, label: 'Follow' }}
        done={{ icon: Users, label: 'Following' }}
      />
      <LikeButton count={128} />
    </div>
  );
}`,
      },
    ],
    props: [
      { name: 'active', type: 'boolean', description: 'Which face is shown.' },
      { name: 'onToggle', type: '() => void', description: 'Click handler.' },
      { name: 'idle', type: '{ icon: Icon; label?: string }', description: 'Face shown when inactive.' },
      { name: 'done', type: '{ icon: Icon; label?: string }', description: 'Face shown when active.' },
      { name: 'activeClassName', type: 'string', description: 'Classes applied in the active state.' },
      { name: 'idleClassName', type: 'string', description: 'Classes applied in the idle state.' },
    ],
  },
  {
    slug: 'expandable-control',
    name: 'Expandable Control',
    description: 'A compact now-playing pill that springs open into a full music player.',
    badge: 'New',
    demos: [
      {
        title: 'Music player',
        component: ExpandableControlDemo,
        code: `import { ExpandableControl } from '@/components/ui/motion/ExpandableControl';

export function NowPlaying() {
  return (
    <ExpandableControl
      collapsedSize={{ width: 240, height: 52 }}
      expandedSize={{ width: 360, height: 212 }}
      collapsed={<MiniPlayer track={track} />}
      expanded={<FullPlayer track={track} />}
    />
  );
}`,
      },
    ],
    props: [
      { name: 'collapsed', type: 'ReactNode', description: 'Content of the compact pill.' },
      { name: 'expanded', type: 'ReactNode', description: 'Content of the full control.' },
      { name: 'collapsedSize', type: '{ width: number; height: number }', default: '{ 240, 52 }', description: 'Pill dimensions.' },
      { name: 'expandedSize', type: '{ width: number; height: number }', default: '{ 360, 212 }', description: 'Expanded dimensions.' },
    ],
  },
  {
    slug: 'dock',
    name: 'Dock',
    description: 'A macOS-style dock with distance-based magnification, tooltips, launch bounce and open dots.',
    demos: [
      {
        title: 'App dock',
        component: DockDemo,
        height: 300,
        code: `import { Dock } from '@/components/ui/motion/Dock';

const apps = [
  { id: 'finder', label: 'Finder', icon: Folder, tint: 'bg-gradient-to-b from-sky-400 to-brand-600' },
  { id: 'mail', label: 'Mail', icon: Mail, tint: 'bg-gradient-to-b from-brand-400 to-brand-700' },
  { id: 'music', label: 'Music', icon: Music, tint: 'bg-gradient-to-b from-rose-400 to-amber-500' },
];

export function Desktop() {
  return <Dock items={apps} baseSize={44} maxSize={72} defaultOpen={['finder']} />;
}`,
      },
    ],
    props: [
      { name: 'items', type: 'DockItem[]', description: 'Apps with id, label, icon and tint classes.' },
      { name: 'baseSize', type: 'number', default: '44', description: 'Resting icon size in px.' },
      { name: 'maxSize', type: 'number', default: '72', description: 'Icon size directly under the cursor.' },
      { name: 'distance', type: 'number', default: '140', description: 'Cursor influence radius in px.' },
      { name: 'defaultOpen', type: 'string[]', default: '[]', description: 'Apps showing a running indicator.' },
    ],
  },
  {
    slug: 'animated-sidebar',
    name: 'Animated Sidebar',
    description: 'An app sidebar that collapses between 72px and 240px with fading labels and nested groups.',
    demos: [
      {
        title: 'Collapsible navigation',
        component: AnimatedSidebarDemo,
        height: 520,
        code: `import { AnimatedSidebar, type SidebarNode } from '@/components/ui/motion/AnimatedSidebar';

const nav: SidebarNode[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'inbox', label: 'Inbox', icon: Inbox, badge: 4 },
  {
    id: 'projects',
    label: 'Projects',
    icon: Folder,
    children: [{ id: 'p-web', label: 'Website relaunch', color: 'bg-brand-400' }],
  },
];

export function AppShell({ children }) {
  return (
    <div className="flex h-screen">
      <AnimatedSidebar items={nav} />
      <main className="flex-1">{children}</main>
    </div>
  );
}`,
      },
    ],
    props: [
      { name: 'items', type: 'SidebarNode[]', description: 'Navigation items; `children` creates a nested group.' },
      { name: 'defaultCollapsed', type: 'boolean', default: 'false', description: 'Start in the icon-only state.' },
      { name: 'collapsedWidth', type: 'number', default: '72', description: 'Width when collapsed.' },
      { name: 'expandedWidth', type: 'number', default: '240', description: 'Width when expanded.' },
    ],
  },
];
