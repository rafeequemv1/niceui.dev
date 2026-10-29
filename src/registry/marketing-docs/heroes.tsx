import type { DocEntry } from '@/docs/types';
import {
  HeroAuroraDemo,
  HeroBeamsDemo,
  HeroOrbitDemo,
  HeroRotatingWordDemo,
  HeroSplitProductDemo,
  HeroSpotlightDemo,
} from '@/components/marketing/Heroes';

const ctaProps = [
  { name: 'primary', type: '{ label: string; href: string }', description: 'Main call to action.' },
  { name: 'secondary', type: '{ label: string; href: string }', description: 'Secondary outline action.' },
  { name: 'className', type: 'string', description: 'Extra classes for the section.' },
];

export const heroEntries: DocEntry[] = [
  {
    slug: 'hero-aurora',
    name: 'Hero — Aurora',
    description: 'A slow, drifting aurora of sky, cyan and indigo light behind a serif-accented headline and an email capture with success state.',
    badge: 'New',
    demos: [
      {
        title: 'Waitlist hero',
        description: 'Submit an email to see the success state.',
        component: HeroAuroraDemo,
        height: 600,
        code: `import { HeroAurora } from '@/components/marketing/Heroes';

export default function Page() {
  return (
    <HeroAurora
      eyebrow="Early access is open"
      title="The calm place to"
      accent="think together."
      onSubmit={(email) => joinWaitlist(email)}
    />
  );
}`,
      },
    ],
    props: [
      { name: 'eyebrow', type: 'string', description: 'Pill text above the headline.' },
      { name: 'title / accent', type: 'string', description: 'Headline; the accent renders in serif italic.' },
      { name: 'description', type: 'string', description: 'Supporting paragraph.' },
      { name: 'placeholder', type: 'string', default: "'you@company.com'", description: 'Email input placeholder.' },
      { name: 'buttonLabel', type: 'string', default: "'Join the waitlist'", description: 'Submit button label.' },
      { name: 'onSubmit', type: '(email: string) => void', description: 'Called with the email after a valid submit.' },
      { name: 'className', type: 'string', description: 'Extra classes for the section.' },
    ],
  },
  {
    slug: 'hero-spotlight',
    name: 'Hero — Spotlight',
    description: 'A dark grid lit by a mouse-following spotlight, with a headline that resolves word by word from blur to sharp.',
    badge: 'New',
    demos: [
      {
        title: 'Spotlight grid',
        description: 'Move your cursor across the section.',
        component: HeroSpotlightDemo,
        height: 600,
        code: `import { HeroSpotlight } from '@/components/marketing/Heroes';

<HeroSpotlight
  title="See every request your product makes"
  accentIndex={1}
  primary={{ label: 'Start tracing', href: '/signup' }}
  secondary={{ label: 'Live demo', href: '/demo' }}
/>`,
      },
    ],
    props: [
      { name: 'title', type: 'string', description: 'Headline; split into words for the staggered reveal.' },
      { name: 'accentIndex', type: 'number', default: '1', description: 'Index of the word rendered as the serif accent.' },
      { name: 'eyebrow', type: 'string', description: 'Pill text above the headline.' },
      { name: 'description', type: 'string', description: 'Supporting paragraph.' },
      ...ctaProps,
    ],
  },
  {
    slug: 'hero-split-product',
    name: 'Hero — Split Product',
    description: 'Copy and social proof on the left; a 3D-tilting stack of floating product cards — chart, notification, metric — on the right.',
    badge: 'New',
    demos: [
      {
        title: 'Product hero',
        description: 'Hover the cards to tilt the stack.',
        component: HeroSplitProductDemo,
        height: 640,
        code: `import { HeroSplitProduct } from '@/components/marketing/Heroes';

<HeroSplitProduct
  title="Know your numbers"
  accent="before Monday."
  rating="4.9"
  reviewers="from 2,400+ finance teams"
/>`,
      },
    ],
    props: [
      { name: 'eyebrow', type: 'string', description: 'Pill text above the headline.' },
      { name: 'title / accent', type: 'string', description: 'Headline; the accent renders in serif italic.' },
      { name: 'description', type: 'string', description: 'Supporting paragraph.' },
      { name: 'rating / reviewers', type: 'string', description: 'Social-proof rating and caption.' },
      ...ctaProps,
    ],
  },
  {
    slug: 'hero-beams',
    name: 'Hero — Beams',
    description: 'Light beams fall through a column grid behind an announcement badge, headline and a copyable install command.',
    badge: 'New',
    demos: [
      {
        title: 'Developer hero',
        component: HeroBeamsDemo,
        height: 600,
        code: `import { HeroBeams } from '@/components/marketing/Heroes';

<HeroBeams
  badge="v4.0 — now with edge functions"
  title="Deploy at the"
  accent="speed of thought."
  command="npx create-orbit@latest"
/>`,
      },
    ],
    props: [
      { name: 'badge', type: 'string', description: 'Announcement text in the top pill.' },
      { name: 'title / accent', type: 'string', description: 'Headline; the accent renders in serif italic.' },
      { name: 'command', type: 'string', description: 'Shell command shown in the copy pill.' },
      { name: 'beams', type: 'number', default: '9', description: 'Number of beam columns.' },
      { name: 'primary', type: '{ label: string; href: string }', description: 'Main call to action.' },
      { name: 'className', type: 'string', description: 'Extra classes for the section.' },
    ],
  },
  {
    slug: 'hero-orbit',
    name: 'Hero — Orbit',
    description: 'Integration icons orbit a glowing core on three concentric rings at different speeds, framing a centered headline.',
    badge: 'New',
    demos: [
      {
        title: 'Integrations hero',
        component: HeroOrbitDemo,
        height: 640,
        code: `import { HeroOrbit } from '@/components/marketing/Heroes';

<HeroOrbit
  eyebrow="120+ integrations"
  title="Everything you use,"
  accent="in orbit."
/>`,
      },
    ],
    props: [
      { name: 'eyebrow', type: 'string', description: 'Pill text above the headline.' },
      { name: 'title / accent', type: 'string', description: 'Headline; the accent renders in serif italic.' },
      { name: 'description', type: 'string', description: 'Supporting paragraph.' },
      ...ctaProps,
    ],
  },
  {
    slug: 'hero-rotating-word',
    name: 'Hero — Rotating Word',
    description: 'Editorial, oversized type where one word cycles with a blur-slide transition and a drawn underline.',
    badge: 'New',
    demos: [
      {
        title: 'Studio hero',
        component: HeroRotatingWordDemo,
        height: 560,
        code: `import { HeroRotatingWord } from '@/components/marketing/Heroes';

<HeroRotatingWord
  prefix="Software for teams who"
  words={['design', 'build', 'ship', 'care']}
  suffix="with intent."
  interval={2200}
/>`,
      },
    ],
    props: [
      { name: 'prefix / suffix', type: 'string', description: 'Text before and after the rotating word.' },
      { name: 'words', type: 'string[]', description: 'Words to cycle through.' },
      { name: 'interval', type: 'number', default: '2200', description: 'Milliseconds per word.' },
      { name: 'links', type: '{ label: string; href: string }[]', description: 'Minimal arrow links under the rule.' },
      { name: 'description', type: 'string', description: 'Supporting paragraph.' },
      { name: 'className', type: 'string', description: 'Extra classes for the section.' },
    ],
  },
];
