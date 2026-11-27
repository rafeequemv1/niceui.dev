import type { DocEntry } from '@/docs/types';
import { CustomCursorDemo } from '@/components/effects/pointer/CustomCursor';
import { CursorTrailDemo } from '@/components/effects/pointer/CursorTrail';
import { UnderlineAnimationDemo } from '@/components/effects/pointer/UnderlineAnimation';
import { ConfettiDemo } from '@/components/effects/pointer/Confetti';
import { IconCloudDemo } from '@/components/effects/pointer/IconCloud';

const className = { name: 'className', type: 'string', description: 'Classes for the wrapper.' };

export const pointerEntries: DocEntry[] = [
  {
    slug: 'custom-cursor',
    name: 'Custom Cursor',
    description:
      'An animated custom mouse cursor for React and Tailwind: a smooth spring-follow dot and ring that grows and shows a label over links, snaps magnetically to buttons, and has a blend-mode variant. Scoped to its container; touch screens keep the native cursor.',
    badge: 'New',
    demos: [
      {
        title: 'Custom mouse cursor',
        description: 'Hover the cards for a labelled cursor and the buttons for a magnetic snap. Switch to the blend disc.',
        component: CustomCursorDemo,
        height: 520,
        code: `import { CustomCursor } from '@/components/effects/pointer/CustomCursor';

<CustomCursor variant="ring" magnetic={0.35}>
  <a href="/work/northfold" data-cursor="View">Northfold Studio</a>
  <button data-cursor-magnetic>Start a project</button>
</CustomCursor>`,
      },
    ],
    props: [
      { name: 'children', type: 'ReactNode', description: 'The area where the custom cursor is shown.' },
      { name: 'variant', type: "'ring' | 'blend'", default: "'ring'", description: 'Dot and ring, or a large disc that inverts what it covers.' },
      { name: 'magnetic', type: 'number', default: '0.35', description: 'Pull strength (0–1) toward elements with data-cursor-magnetic.' },
      { name: 'data-cursor', type: 'attribute', description: 'Put on any element to grow the cursor and show this label over it.' },
      className,
    ],
  },
  {
    slug: 'cursor-trail',
    name: 'Cursor Trail',
    description:
      'A custom cursor trail for React: a glowing ribbon, drifting particles or a chain of spring dots drawn on a canvas inside its container. Works with touch drags, pauses off-screen and respects reduced motion.',
    badge: 'New',
    demos: [
      {
        title: 'Mouse cursor trail',
        description: 'Pick a trail style and colour, then move across the stage.',
        component: CursorTrailDemo,
        height: 420,
        code: `import { CursorTrail } from '@/components/effects/pointer/CursorTrail';

<CursorTrail variant="ribbon" color="#7dd3fc" className="h-[300px] rounded-2xl">
  <p>Move your cursor here</p>
</CursorTrail>`,
      },
    ],
    props: [
      { name: 'variant', type: "'ribbon' | 'particles' | 'dots'", default: "'ribbon'", description: 'Trail style.' },
      { name: 'color', type: 'string', default: "'#7dd3fc'", description: 'Trail colour.' },
      { name: 'children', type: 'ReactNode', description: 'Content shown above the trail.' },
      className,
    ],
  },
  {
    slug: 'underline-animation',
    name: 'Underline Animation',
    description:
      'Link underline animations for React and Tailwind: six pure-CSS hover and focus effects — slide in and out, grow from center, wavy line, highlight sweep, double line and flowing gradient.',
    badge: 'New',
    demos: [
      {
        title: 'Hover underline effects',
        description: 'Hover or tab to each link.',
        component: UnderlineAnimationDemo,
        height: 380,
        code: `import { UnderlineLink } from '@/components/effects/pointer/UnderlineAnimation';

<UnderlineLink href="/about" variant="center">About us</UnderlineLink>
<UnderlineLink href="/blog" variant="wave">Read the blog</UnderlineLink>`,
      },
    ],
    props: [
      { name: 'variant', type: "'slide' | 'center' | 'wave' | 'highlight' | 'double' | 'gradient'", default: "'slide'", description: 'Underline effect.' },
      { name: '...anchor props', type: 'AnchorHTMLAttributes', description: 'Everything an <a> accepts (href, target, onClick…).' },
      className,
    ],
  },
  {
    slug: 'confetti',
    name: 'Confetti Animation',
    description:
      'A confetti animation for React with no dependencies: canvas bursts from any point, side cannons from the corners, and an imperative fire() API from a hook. Celebrate sign-ups, launches and completed tasks.',
    badge: 'New',
    demos: [
      {
        title: 'Confetti burst and cannons',
        description: 'Burst from the button, or fire both side cannons.',
        component: ConfettiDemo,
        height: 400,
        code: `import { useConfetti } from '@/components/effects/pointer/Confetti';

function Launch() {
  const { ref, fire, cannons } = useConfetti();
  return (
    <div className="relative">
      <canvas ref={ref} className="pointer-events-none absolute inset-0 h-full w-full" />
      <button onClick={() => fire({ x: 0.5, y: 0.6 })}>Celebrate</button>
      <button onClick={() => cannons()}>Side cannons</button>
    </div>
  );
}`,
      },
    ],
    props: [
      { name: 'fire(options)', type: '(o?: ConfettiOptions) => void', description: 'Burst from x/y (0–1 of the canvas) at an angle and spread, with count, speed and colors.' },
      { name: 'cannons(options)', type: '(o?) => void', description: 'Fire from both bottom corners toward the middle.' },
      { name: 'ref', type: 'RefObject<HTMLCanvasElement>', description: 'Attach to the canvas that covers the confetti area.' },
    ],
  },
  {
    slug: 'icon-cloud',
    name: 'Icon Cloud',
    description:
      'An interactive 3D icon cloud for React: icons or text tags spread evenly on a rotating sphere you can drag or spin with the arrow keys, with depth fade and a glowing hover highlight.',
    badge: 'New',
    demos: [
      {
        title: '3D icon sphere',
        description: 'Drag to spin. Switch between icons and tags.',
        component: IconCloudDemo,
        height: 440,
        code: `import { IconCloud } from '@/components/effects/pointer/IconCloud';
import { Code2, Database, Rocket } from 'lucide-react';

<IconCloud items={[Code2, Database, Rocket, 'React', 'Tailwind']} size={320} speed={0.35} />`,
      },
    ],
    props: [
      { name: 'items', type: 'Array<LucideIcon | string>', description: 'Icons or text tags to place on the sphere.' },
      { name: 'size', type: 'number', default: '320', description: 'Sphere size in px.' },
      { name: 'speed', type: 'number', default: '0.35', description: 'Idle spin speed in radians per second.' },
      className,
    ],
  },
];
