import type { DocEntry } from '@/docs/types';
import { CenterMorphModalDemo } from '@/components/ui/motion/CenterMorphModal';
import { DrawerDemo } from '@/components/ui/motion/Drawer';
import { BottomSheetDemo } from '@/components/ui/motion/BottomSheet';
import { ToastStack } from '@/components/ui/motion/ToastStack';
import { TextAnimationDemo, TextEffectsDemo } from '@/components/ui/motion/TextAnimation';
import { NumberTickerDemo, OdometerDemo } from '@/components/ui/motion/NumberTicker';
import { LogoMarqueeDemo, VerticalMarqueeDemo } from '@/components/ui/motion/Marquee';

export const surfaceEntries: DocEntry[] = [
  {
    slug: 'center-morph-modal',
    name: 'Center Morph Modal',
    description: 'A pill button that morphs its size, position and radius into a centered dialog.',
    demos: [
      {
        title: 'Create workspace',
        component: CenterMorphModalDemo,
        code: `import { CenterMorphModal } from '@/components/ui/motion/CenterMorphModal';

export function NewWorkspace() {
  return (
    <CenterMorphModal label={<><Plus /> New workspace</>} width={420} height={410}>
      {(close) => (
        <div className="flex h-full flex-col p-6">
          <h3>Create workspace</h3>
          <input defaultValue="Acme Studio" />
          <button onClick={close} className="mt-auto">Create</button>
        </div>
      )}
    </CenterMorphModal>
  );
}`,
      },
    ],
    props: [
      { name: 'label', type: 'ReactNode', description: 'Button content; cross-fades out as the dialog grows.' },
      { name: 'children', type: '(close: () => void) => ReactNode', description: 'Dialog content.' },
      { name: 'width', type: 'number', default: '420', description: 'Dialog width in px (clamped to viewport).' },
      { name: 'height', type: 'number', default: '410', description: 'Dialog height in px.' },
      { name: 'duration', type: 'number', default: '560', description: 'Morph duration in ms.' },
    ],
  },
  {
    slug: 'drawer',
    name: 'Drawer',
    description: 'A floating side drawer with a blurred backdrop, staggered content and Escape to close.',
    demos: [
      {
        title: 'Settings drawer',
        component: DrawerDemo,
        code: `import { Drawer } from '@/components/ui/motion/Drawer';

export function SettingsButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Open settings</button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Preferences"
        description="Manage how NiceUI keeps you in the loop."
        footer={<button onClick={() => setOpen(false)}>Save changes</button>}
      >
        <NotificationSettings />
      </Drawer>
    </>
  );
}`,
      },
    ],
    props: [
      { name: 'open', type: 'boolean', description: 'Controls visibility.' },
      { name: 'onClose', type: '() => void', description: 'Called on backdrop click, Escape or close button.' },
      { name: 'title', type: 'string', description: 'Heading text.' },
      { name: 'side', type: "'right' | 'left'", default: "'right'", description: 'Edge the drawer slides from.' },
      { name: 'width', type: 'number', default: '400', description: 'Drawer width in px.' },
      { name: 'footer', type: 'ReactNode', description: 'Sticky footer actions.' },
    ],
  },
  {
    slug: 'bottom-sheet',
    name: 'Bottom Sheet',
    description: 'A draggable sheet with snap points, rubber-banding and flick-to-dismiss physics.',
    demos: [
      {
        title: 'Route details',
        component: BottomSheetDemo,
        code: `import { BottomSheet } from '@/components/ui/motion/BottomSheet';

export function RouteSheet() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>View route details</button>
      <BottomSheet open={open} onClose={() => setOpen(false)} snapPoints={[0.45, 0.88]}>
        <h3>Route to Nice HQ</h3>
        <StopList />
      </BottomSheet>
    </>
  );
}`,
      },
    ],
    props: [
      { name: 'open', type: 'boolean', description: 'Controls visibility.' },
      { name: 'onClose', type: '() => void', description: 'Called when dragged down, flicked, Escape or backdrop click.' },
      { name: 'snapPoints', type: 'number[]', default: '[0.45, 0.88]', description: 'Visible fractions of viewport height, ascending.' },
      { name: 'children', type: 'ReactNode', description: 'Scrollable sheet content.' },
    ],
  },
  {
    slug: 'toast-stack',
    name: 'Animated Toast Stack',
    description: 'Stacked toasts that fan out on hover, auto-dismiss with a progress bar and support promises.',
    badge: 'New',
    demos: [
      {
        title: 'Toast types',
        description: 'Fire a few toasts, then hover the stack.',
        component: ToastStack,
        height: 240,
        code: `import { Toaster, toast } from '@/components/ui/motion/ToastStack';

export function App() {
  return (
    <>
      <button onClick={() => toast.success('Changes deployed', { description: 'Build #482 is live.' })}>
        Deploy
      </button>
      <button
        onClick={() =>
          toast.promise(createInvoice(), {
            loading: 'Generating invoice…',
            success: 'Invoice sent',
            error: 'Could not generate invoice',
          })
        }
      >
        Send invoice
      </button>
      <Toaster />
    </>
  );
}`,
      },
    ],
    props: [
      { name: 'toast(title, opts)', type: '(title: string, { description?, duration? }) => number', description: 'Shows an info toast and returns its id.' },
      { name: 'toast.success / error / warning / loading', type: 'same as toast', description: 'Typed variants with matching icon and progress color.' },
      { name: 'toast.promise', type: '(p: Promise, { loading, success, error }) => Promise', description: 'Loading toast that resolves into success or error.' },
      { name: 'toast.dismiss', type: '(id: number) => void', description: 'Dismisses a toast with its exit animation.' },
      { name: 'duration', type: 'number', default: '4000', description: 'Auto-dismiss delay; paused while hovering the stack.' },
    ],
  },
  {
    slug: 'text-animation',
    name: 'Text Animation',
    description: 'Blur-in words, typewriter, scramble decrypt, rotating words and gradient sweep effects.',
    demos: [
      {
        title: 'Blur-in & rotating words',
        component: TextAnimationDemo,
        code: `import { BlurInText, RotatingWords } from '@/components/ui/motion/TextAnimation';

export function Hero() {
  return (
    <>
      <h1 className="text-4xl font-semibold">
        <BlurInText text="Interfaces that feel alive, not animated." stagger={70} />
      </h1>
      <p className="text-2xl">
        Build for <RotatingWords words={['designers', 'founders', 'engineers']} />
      </p>
    </>
  );
}`,
      },
      {
        title: 'Typewriter, scramble & sweep',
        component: TextEffectsDemo,
        code: `import { Typewriter, ScrambleText, GradientSweepText } from '@/components/ui/motion/TextAnimation';

<Typewriter words={['npx lumen add dock', 'npx lumen init']} speed={55} />
<ScrambleText text="ACCESS GRANTED" duration={1200} trigger={attempt} />
<GradientSweepText text="Introducing Nice 2.0" className="text-lg font-semibold" />`,
      },
    ],
    props: [
      { name: 'BlurInText.stagger', type: 'number', default: '70', description: 'Delay between words in ms.' },
      { name: 'Typewriter.words', type: 'string[]', description: 'Phrases typed and deleted in a loop.' },
      { name: 'ScrambleText.trigger', type: 'number', default: '0', description: 'Change to replay the decrypt.' },
      { name: 'RotatingWords.interval', type: 'number', default: '2200', description: 'Milliseconds per word.' },
      { name: 'GradientSweepText.text', type: 'string', description: 'Text painted with the moving gradient.' },
    ],
  },
  {
    slug: 'number-animation',
    name: 'Number Animation',
    description: 'Eased number tickers and a rolling-digit odometer for currency, counts and percentages.',
    demos: [
      {
        title: 'Number ticker',
        component: NumberTickerDemo,
        code: `import { NumberTicker } from '@/components/ui/motion/NumberTicker';

const usd = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function RevenueCard({ revenue, conversion }) {
  return (
    <div>
      <NumberTicker value={revenue} format={usd} className="text-3xl font-semibold" />
      <NumberTicker value={conversion} format={(n) => \`\${n.toFixed(2)}%\`} duration={900} />
    </div>
  );
}`,
      },
      {
        title: 'Rolling odometer',
        component: OdometerDemo,
        code: `import { Odometer } from '@/components/ui/motion/NumberTicker';

<Odometer value={raised} format={usd} className="text-5xl font-semibold" />`,
      },
    ],
    props: [
      { name: 'value', type: 'number', description: 'Target value; animates from the previous one.' },
      { name: 'format', type: '(n: number) => string', default: 'toLocaleString', description: 'Formats each animated frame.' },
      { name: 'duration', type: 'number', default: '1200', description: 'Animation length in ms (easeOutExpo).' },
      { name: 'className', type: 'string', description: 'Classes for the rendered span.' },
    ],
  },
  {
    slug: 'marquee',
    name: 'Marquee',
    description: 'Infinitely scrolling rows or columns with faded edges, reverse and pause on hover.',
    demos: [
      {
        title: 'Logo cloud',
        component: LogoMarqueeDemo,
        code: `import { Marquee } from '@/components/ui/motion/Marquee';

export function Logos() {
  return (
    <>
      <Marquee duration={28}>
        {logos.map((l) => <Logo key={l.name} {...l} />)}
      </Marquee>
      <Marquee duration={34} reverse>
        {logos.map((l) => <Logo key={l.name} {...l} />)}
      </Marquee>
    </>
  );
}`,
      },
      {
        title: 'Vertical testimonials',
        component: VerticalMarqueeDemo,
        height: 440,
        code: `<div className="grid h-[380px] grid-cols-2 gap-4">
  <Marquee vertical duration={26}>{left.map((q) => <Quote key={q.name} q={q} />)}</Marquee>
  <Marquee vertical reverse duration={30}>{right.map((q) => <Quote key={q.name} q={q} />)}</Marquee>
</div>`,
      },
    ],
    props: [
      { name: 'children', type: 'ReactNode', description: 'Items to loop; duplicated internally for a seamless loop.' },
      { name: 'vertical', type: 'boolean', default: 'false', description: 'Scroll along the Y axis.' },
      { name: 'reverse', type: 'boolean', default: 'false', description: 'Reverse the direction.' },
      { name: 'pauseOnHover', type: 'boolean', default: 'true', description: 'Pause while hovered.' },
      { name: 'duration', type: 'number', default: '30', description: 'Seconds per loop.' },
      { name: 'gap', type: 'number', default: '16', description: 'Space between items in px.' },
    ],
  },
];
