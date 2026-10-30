import type { DocEntry } from '@/docs/types';
import { AuroraBackgroundDemo } from '@/components/effects/AuroraBackground';
import { AnimatedGridDemo } from '@/components/effects/AnimatedGrid';
import { MeteorsDemo } from '@/components/effects/Meteors';
import { ParticlesDemo } from '@/components/effects/Particles';
import { BorderBeamDemo } from '@/components/effects/BorderBeam';

const children = { name: 'children', type: 'ReactNode', description: 'Content rendered above the effect.' };
const className = { name: 'className', type: 'string', description: 'Classes for the wrapper (size, padding, radius).' };

export const effectBackgroundEntries: DocEntry[] = [
  {
    slug: 'aurora-background',
    name: 'Aurora Background',
    description: 'Slow, blurred gradient ribbons that drift behind a hero or section. Pure CSS.',
    badge: 'New',
    demos: [{ title: 'Hero', component: AuroraBackgroundDemo, height: 420, code: `<AuroraBackground className="min-h-[480px] grid place-items-center">\n  <h1>Light that moves.</h1>\n</AuroraBackground>` }],
    props: [children, className],
  },
  {
    slug: 'animated-grid',
    name: 'Animated Grid',
    description: 'A perspective grid floor whose cells light up at random, faded with a radial mask.',
    badge: 'New',
    demos: [{ title: 'Grid floor', component: AnimatedGridDemo, height: 420, code: `<AnimatedGrid cols={16} rows={9} interval={700}>\n  <h1>Built on a grid.</h1>\n</AnimatedGrid>` }],
    props: [
      { name: 'cols', type: 'number', default: '16', description: 'Columns in the grid.' },
      { name: 'rows', type: 'number', default: '9', description: 'Rows in the grid.' },
      { name: 'interval', type: 'number', default: '700', description: 'Milliseconds between newly lit cells.' },
      children,
      className,
    ],
  },
  {
    slug: 'meteors',
    name: 'Meteors',
    description: 'Falling light streaks across a card, with staggered timing.',
    badge: 'New',
    demos: [{ title: 'Announcement card', component: MeteorsDemo, height: 420, code: `<Meteors count={18} className="p-8">\n  <h3>Shipping something every day.</h3>\n</Meteors>` }],
    props: [{ name: 'count', type: 'number', default: '18', description: 'Number of meteors.' }, children, className],
  },
  {
    slug: 'particles',
    name: 'Particles',
    description: 'Canvas particles that drift slowly and lean away from the pointer.',
    badge: 'New',
    demos: [{ title: 'Interactive field', description: 'Move the pointer over the field.', component: ParticlesDemo, height: 420, code: `<Particles quantity={90} color="125, 211, 252">\n  <h1>Move your cursor.</h1>\n</Particles>` }],
    props: [
      { name: 'quantity', type: 'number', default: '90', description: 'Number of particles.' },
      { name: 'color', type: 'string', default: "'125, 211, 252'", description: 'RGB channels for the particles.' },
      children,
      className,
    ],
  },
  {
    slug: 'border-beam',
    name: 'Border Beam',
    description: 'A short beam of light that travels around a card border, drawn with a conic gradient.',
    badge: 'New',
    demos: [{ title: 'Pricing card', component: BorderBeamDemo, height: 400, code: `<BorderBeam duration={6} colorFrom="#7dd3fc" colorTo="#a78bfa">\n  <PricingCard />\n</BorderBeam>` }],
    props: [
      { name: 'duration', type: 'number', default: '6', description: 'Seconds per lap.' },
      { name: 'colorFrom', type: 'string', default: "'#7dd3fc'", description: 'Beam tail colour.' },
      { name: 'colorTo', type: 'string', default: "'#a78bfa'", description: 'Beam head colour.' },
      children,
      className,
    ],
  },
];
