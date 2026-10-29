import type { DocEntry } from '@/docs/types';
import {
  BentoGridDemo,
  FeatureGridDemo,
  LogoGridCycleDemo,
  LogoMarqueeDemo,
  TestimonialMarqueeDemo,
  TestimonialVideoDemo,
  TestimonialWallDemo,
} from '@/components/marketing/Showcase';

const sectionProps = [
  { name: 'eyebrow', type: 'string', description: 'Small pill label above the heading.' },
  { name: 'title', type: 'ReactNode', description: 'Section heading. Wrap words in <em> for the serif accent.' },
  { name: 'className', type: 'string', description: 'Extra classes for the section.' },
];

export const showcaseEntries: DocEntry[] = [
  {
    slug: 'feature-grid',
    name: 'Feature Grid — Spotlight',
    description: 'Six features in a hairline grid. A cursor-following spotlight lights each cell and traces its border; icons tilt and glow on hover.',
    badge: 'New',
    demos: [
      {
        title: 'Spotlight features',
        description: 'Move your cursor across the grid.',
        component: FeatureGridDemo,
        height: 640,
        code: `import { FeatureGrid } from '@/components/marketing/Showcase';
import { Zap, ShieldCheck, Layers } from 'lucide-react';

<FeatureGrid
  eyebrow="Platform"
  title={<>Everything you need. <em>Nothing</em> you don't.</>}
  features={[
    { icon: Zap, title: 'Instant by default', text: 'Edge-rendered pages under 100ms.' },
    { icon: ShieldCheck, title: 'Secure from day one', text: 'SSO and audit logs built in.' },
    { icon: Layers, title: 'Composable blocks', text: 'Every piece shares tokens and motion.' },
  ]}
/>`,
      },
    ],
    props: [
      ...sectionProps,
      { name: 'sub', type: 'string', description: 'Supporting line under the heading.' },
      { name: 'features', type: 'Feature[]', description: '{ icon, title, text } for each cell. Six fills the grid best.' },
    ],
  },
  {
    slug: 'bento-grid',
    name: 'Bento Grid — Live',
    description: 'An asymmetric bento where every tile is alive: streaming bars, a typing search, a rotating dot globe, cycling notifications, toggles and a shimmering code line.',
    badge: 'New',
    demos: [
      {
        title: 'Live bento',
        component: BentoGridDemo,
        height: 680,
        code: `import { BentoGrid } from '@/components/marketing/Showcase';

<BentoGrid
  eyebrow="Why teams switch"
  title={<>Built for the <em>whole</em> product.</>}
  sub="Analytics, search, global delivery and settings — designed as one system."
/>`,
      },
    ],
    props: [...sectionProps, { name: 'sub', type: 'string', description: 'Supporting line under the heading.' }],
  },
  {
    slug: 'logo-marquee',
    name: 'Logo Cloud — Marquee',
    description: 'Two rows of wordmarks drifting in opposite directions with soft edge fades. Pauses on hover.',
    badge: 'New',
    demos: [
      {
        title: 'Logo marquee',
        component: LogoMarqueeDemo,
        height: 460,
        code: `import { LogoMarquee } from '@/components/marketing/Showcase';

<LogoMarquee
  title="Trusted by product teams at"
  logos={[
    { name: 'Halcyon', style: 'font-serif italic text-[22px]' },
    { name: 'PARALLAX', style: 'font-mono tracking-[0.22em] text-[13px]' },
  ]}
  speed={38}
/>`,
      },
    ],
    props: [
      { name: 'title', type: 'string', default: "'Trusted by product teams at'", description: 'Caption above the rows.' },
      { name: 'logos', type: 'Logo[]', description: '{ name, style } — swap name for an <img> or SVG in your build.' },
      { name: 'speed', type: 'number', default: '38', description: 'Seconds per loop for the first row.' },
    ],
  },
  {
    slug: 'logo-grid-cycle',
    name: 'Logo Cloud — Cycling Grid',
    description: 'A 2×4 logo grid where cells take turns swapping brands with a blur crossfade, beside a short heading.',
    badge: 'New',
    demos: [
      {
        title: 'Cycling logos',
        component: LogoGridCycleDemo,
        height: 460,
        code: `import { LogoGridCycle } from '@/components/marketing/Showcase';

<LogoGridCycle
  title={<>Loved by teams that <em>ship weekly.</em></>}
  interval={2600}
/>`,
      },
    ],
    props: [
      { name: 'title', type: 'ReactNode', description: 'Heading in the left column.' },
      { name: 'logos', type: 'Logo[]', description: 'Pool of logos; more than eight gives the cycle variety.' },
      { name: 'interval', type: 'number', default: '2600', description: 'Milliseconds between swaps.' },
    ],
  },
  {
    slug: 'testimonial-wall',
    name: 'Testimonials — Wall',
    description: 'A masonry wall of quotes in three columns scrolling vertically at different speeds, with star ratings and faded edges.',
    badge: 'New',
    demos: [
      {
        title: 'Wall of love',
        description: 'Hover a column to pause it.',
        component: TestimonialWallDemo,
        height: 680,
        code: `import { TestimonialWall } from '@/components/marketing/Showcase';

<TestimonialWall
  title={<>Teams <em>can't stop</em> talking.</>}
  testimonials={[
    { quote: 'Our landing page went from two weeks to an afternoon.', name: 'Hana Sato', role: 'Founder, kite', rating: 5 },
  ]}
/>`,
      },
    ],
    props: [...sectionProps, { name: 'testimonials', type: 'Testimonial[]', description: '{ quote, name, role, rating? } — split across three columns.' }],
  },
  {
    slug: 'testimonial-marquee',
    name: 'Testimonials — Marquee',
    description: 'A large featured quote above two rows of compact quote cards gliding in opposite directions.',
    badge: 'New',
    demos: [
      {
        title: 'Featured + marquee',
        component: TestimonialMarqueeDemo,
        height: 600,
        code: `import { TestimonialMarquee } from '@/components/marketing/Showcase';

<TestimonialMarquee
  featured={{ quote: 'It feels expensive without feeling busy.', name: 'Luca Bianchi', role: 'Staff Engineer, Monolith' }}
  testimonials={quotes}
/>`,
      },
    ],
    props: [
      { name: 'featured', type: 'Testimonial', description: 'The large quote at the top.' },
      { name: 'testimonials', type: 'Testimonial[]', description: 'Quotes for the two marquee rows.' },
      { name: 'className', type: 'string', description: 'Extra classes for the section.' },
    ],
  },
  {
    slug: 'testimonial-video',
    name: 'Testimonials — Video',
    description: 'Video testimonial cards with gradient posters and a pulsing play button that open an animated player with captions and progress.',
    badge: 'New',
    demos: [
      {
        title: 'Customer stories',
        description: 'Click a card to open the player. Esc or the backdrop closes it.',
        component: TestimonialVideoDemo,
        height: 620,
        code: `import { TestimonialVideo } from '@/components/marketing/Showcase';

<TestimonialVideo
  title={<>Hear it <em>from them.</em></>}
  videos={[
    {
      quote: 'Our designers finally trust what ships.',
      name: 'Imani Okafor',
      role: 'Design Eng Lead, Halcyon',
      duration: '1:24',
      poster: 'radial-gradient(120% 90% at 20% 10%, #0c4a6e, transparent 55%), #05070a',
      captions: ['We had three design systems…', '…now everything ships from one.'],
    },
  ]}
/>`,
      },
    ],
    props: [...sectionProps, { name: 'videos', type: 'VideoTestimonial[]', description: 'Testimonial plus duration, poster (CSS background) and captions[]. Swap the modal body for a <video> in production.' }],
  },
];
