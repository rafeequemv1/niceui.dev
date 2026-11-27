import type { DocEntry } from '@/docs/types';
import { DotPatternDemo } from '@/components/patterns/DotPattern';
import { GridPatternDemo } from '@/components/patterns/GridPattern';
import { FlickeringGridDemo } from '@/components/patterns/FlickeringGrid';
import { RetroGridDemo } from '@/components/patterns/RetroGrid';
import { WarpBackgroundDemo } from '@/components/patterns/WarpBackground';
import { HexagonPatternDemo } from '@/components/patterns/HexagonPattern';

const fade = { name: 'fade', type: "'none' | 'radial' | 'top' | 'bottom'", default: "'radial'", description: 'Fade the pattern out toward the edges with a mask.' };
const opacity = { name: 'opacity', type: 'number', default: '1', description: 'Overall opacity, 0–1.' };
const className = { name: 'className', type: 'string', description: 'Extra classes. The pattern fills its nearest positioned parent.' };

export const patternEntries: DocEntry[] = [
  {
    slug: 'dot-pattern',
    name: 'Dot Pattern',
    description: 'A dotted background pattern for React and Tailwind: an SVG dot grid with soft glowing dots that change every few seconds and an edge fade.',
    badge: 'New',
    demos: [
      {
        title: 'Dotted background',
        description: 'Change the gap, the fade and the glow.',
        component: DotPatternDemo,
        height: 440,
        code: `import { DotPattern } from '@/components/patterns/DotPattern';

<section className="relative overflow-hidden">
  <DotPattern gap={18} fade="radial" glow={14} />
  <h1 className="relative">Quiet texture, zero weight</h1>
</section>`,
      },
    ],
    props: [
      { name: 'gap', type: 'number', default: '18', description: 'Distance between dots in px.' },
      { name: 'radius', type: 'number', default: '1.2', description: 'Dot radius in px.' },
      { name: 'color', type: 'string', description: 'Dot colour.' },
      { name: 'glow', type: 'number', default: '14', description: 'How many dots glow at random. 0 turns it off.' },
      { name: 'glowColor', type: 'string', default: "'#7dd3fc'", description: 'Glow colour.' },
      opacity,
      fade,
      className,
    ],
  },
  {
    slug: 'grid-pattern',
    name: 'Grid Pattern',
    description: 'A grid background pattern for React and Tailwind: SVG grid lines with optional highlighted squares, a dashed variant and an edge fade.',
    badge: 'New',
    demos: [
      {
        title: 'Grid background',
        description: 'Resize the cells, switch to dashed lines and toggle the lit squares.',
        component: GridPatternDemo,
        height: 440,
        code: `import { GridPattern } from '@/components/patterns/GridPattern';

<section className="relative overflow-hidden">
  <GridPattern size={40} dashed squares={[[4, 2], [9, 3]]} />
  <h1 className="relative">Structure behind the story</h1>
</section>`,
      },
    ],
    props: [
      { name: 'size', type: 'number', default: '40', description: 'Cell size in px.' },
      { name: 'color', type: 'string', description: 'Line colour.' },
      { name: 'dashed', type: 'boolean', default: 'false', description: 'Dashed lines.' },
      { name: 'squares', type: 'Array<[number, number]>', default: '[]', description: 'Cells to highlight, as [column, row].' },
      { name: 'squareColor', type: 'string', description: 'Highlight colour.' },
      opacity,
      fade,
      className,
    ],
  },
  {
    slug: 'flickering-grid',
    name: 'Flickering Grid',
    description: 'A flickering grid background: a canvas of small squares that brighten and dim at random, sized to its container and paused when off screen.',
    badge: 'New',
    demos: [
      {
        title: 'Flickering squares',
        description: 'Pick a colour and change the flicker speed.',
        component: FlickeringGridDemo,
        height: 440,
        code: `import { FlickeringGrid } from '@/components/patterns/FlickeringGrid';

<section className="relative overflow-hidden">
  <FlickeringGrid rgb="125,211,252" square={4} gap={6} flicker={0.25} />
  <h1 className="relative">A screen that feels alive</h1>
</section>`,
      },
    ],
    props: [
      { name: 'square', type: 'number', default: '4', description: 'Square size in px.' },
      { name: 'gap', type: 'number', default: '6', description: 'Gap between squares in px.' },
      { name: 'rgb', type: 'string', default: "'125,211,252'", description: 'Square colour as "r,g,b".' },
      { name: 'maxOpacity', type: 'number', default: '0.32', description: 'Brightest a square gets.' },
      { name: 'flicker', type: 'number', default: '0.25', description: 'Chance per second that a square changes.' },
      opacity,
      fade,
      className,
    ],
  },
  {
    slug: 'retro-grid',
    name: 'Retro Grid',
    description: 'A retro grid background: a perspective synthwave floor that scrolls toward the viewer under a glowing horizon. Pure CSS.',
    badge: 'New',
    demos: [
      {
        title: 'Synthwave floor',
        description: 'Switch colour themes or pause the motion.',
        component: RetroGridDemo,
        height: 440,
        code: `import { RetroGrid } from '@/components/patterns/RetroGrid';

<section className="relative overflow-hidden">
  <RetroGrid cell={56} angle={66} speed={1.6} />
  <h1 className="relative">Drive into the launch</h1>
</section>`,
      },
    ],
    props: [
      { name: 'cell', type: 'number', default: '56', description: 'Cell size in px.' },
      { name: 'angle', type: 'number', default: '66', description: 'Floor tilt in degrees.' },
      { name: 'color', type: 'string', description: 'Line colour.' },
      { name: 'glow', type: 'string', description: 'Horizon glow colour.' },
      { name: 'speed', type: 'number', default: '1.6', description: 'Seconds per cell. 0 stops the motion.' },
      opacity,
      className,
    ],
  },
  {
    slug: 'warp-background',
    name: 'Warp Background',
    description: 'A warp background: a perspective tunnel of grid walls with coloured light beams travelling toward you, framing whatever you put in the middle.',
    badge: 'New',
    demos: [
      {
        title: 'Warp tunnel',
        description: 'Change the number of beams and the perspective.',
        component: WarpBackgroundDemo,
        height: 480,
        code: `import { WarpBackground } from '@/components/patterns/WarpBackground';

<WarpBackground beams={3} className="rounded-2xl p-16">
  <Card />
</WarpBackground>`,
      },
    ],
    props: [
      { name: 'children', type: 'ReactNode', description: 'Content in the middle of the tunnel.' },
      { name: 'beams', type: 'number', default: '3', description: 'Light beams per wall.' },
      { name: 'cells', type: 'number', default: '10', description: 'Grid cells across each wall.' },
      { name: 'beamColors', type: 'string[]', description: 'Beam colours, picked at random.' },
      { name: 'duration', type: 'number', default: '3.2', description: 'Seconds for a beam to travel the tunnel.' },
      { name: 'depth', type: 'number', default: '520', description: 'Tunnel depth in px.' },
      { name: 'perspective', type: 'number', default: '140', description: 'Perspective distance in px.' },
      className,
    ],
  },
  {
    slug: 'hexagon-pattern',
    name: 'Hexagon Pattern',
    description: 'A hexagon background pattern: an SVG honeycomb whose cells light up under the pointer and fade behind it, with optional highlighted hexes.',
    badge: 'New',
    demos: [
      {
        title: 'Honeycomb',
        description: 'Move your pointer over the pattern. Resize the hexagons or toggle the highlights.',
        component: HexagonPatternDemo,
        height: 440,
        code: `import { HexagonPattern } from '@/components/patterns/HexagonPattern';

<section className="relative overflow-hidden">
  <HexagonPattern radius={22} cells={[[3, 2], [10, 1]]} />
  <h1 className="relative">Move your pointer across the hive</h1>
</section>`,
      },
    ],
    props: [
      { name: 'radius', type: 'number', default: '22', description: 'Hexagon radius in px.' },
      { name: 'color', type: 'string', description: 'Outline colour.' },
      { name: 'highlight', type: 'string', description: 'Fill for highlighted and hovered cells.' },
      { name: 'cells', type: 'Array<[number, number]>', default: '[]', description: 'Cells to highlight, as [column, row].' },
      { name: 'interactive', type: 'boolean', default: 'true', description: 'Light up cells under the pointer.' },
      opacity,
      fade,
      className,
    ],
  },
];
