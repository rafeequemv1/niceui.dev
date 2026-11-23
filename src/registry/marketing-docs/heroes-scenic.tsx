import type { DocEntry } from '@/docs/types';
import { HeroDuskDemo } from '@/components/marketing/heroes/HeroDusk';
import { HeroMeadowDemo } from '@/components/marketing/heroes/HeroMeadow';
import { MegaMenuDemo } from '@/components/marketing/MegaMenuDemo';

export const scenicHeroEntries: DocEntry[] = [
  {
    slug: 'mega-menu',
    name: 'Mega Menu',
    description: 'A desktop mega menu with one shared panel that morphs its size and position between menus, hover intent, an icon grid or described list per menu, a preview card that follows the hovered link, keyboard support and an accordion sheet on phones.',
    badge: 'New',
    demos: [
      {
        title: 'Morphing mega menu',
        description: 'Hover across Library, Parts, Templates and Tools. Arrow Down opens a menu from the keyboard; Esc closes it.',
        component: MegaMenuDemo,
        height: 560,
        code: `import { MegaMenu, type MegaItem } from '@/components/marketing/MegaMenu';
import { Blocks, CreditCard, Type } from 'lucide-react';

const items: MegaItem[] = [
  {
    label: 'Library',
    menu: {
      kind: 'grid',
      heading: 'Page sections',
      columns: [[
        { label: 'Bento grids', icon: Blocks, preview: { art: 8, kind: 'mesh', title: 'Tiles that tell a story', meta: '22 sections' } },
        { label: 'Pricing', icon: CreditCard, preview: { art: 9, title: 'Plans people can compare', meta: '19 sections' } },
      ]],
    },
  },
  {
    label: 'Parts',
    menu: { kind: 'list', links: [{ label: 'Type in motion', icon: Type, description: 'Split, stagger and settle headlines' }] },
  },
  { label: 'Pricing', href: '/pricing' },
];

<MegaMenu items={items} brand={<Logo />} actions={<a href="/start">Get started</a>} />`,
      },
    ],
    props: [
      { name: 'items', type: 'MegaItem[]', description: "Top-level entries. Give one a `menu` of kind 'grid' (icon columns + preview) or 'list' (described links + preview), or just an `href`." },
      { name: 'brand', type: 'ReactNode', description: 'Left slot, usually the logo.' },
      { name: 'actions', type: 'ReactNode', description: 'Right slot, usually sign-in and a button. Also shown in the phone sheet.' },
      { name: 'defaultOpen', type: 'number', description: 'Index of a menu to show open on first render.' },
      { name: 'className', type: 'string', description: 'Extra classes for the wrapper.' },
    ],
  },
  {
    slug: 'hero-dusk',
    name: 'Hero — Dusk',
    description:
      'A cinematic dark hero over a grainy dusk landscape: a headline in an original 5×7 pixel face that decodes in, a boxed segmented nav with a sliding pill, pointer parallax and a divided partner-logo strip.',
    badge: 'New',
    theme: 'light',
    demos: [
      {
        title: 'Cinematic dusk',
        description: 'Move the pointer for parallax. Click the nav to slide the pill. The landscape is painted procedurally; pass `image` to use a photo.',
        component: HeroDuskDemo,
        height: 860,
        code: `import { HeroDusk } from '@/components/marketing/heroes/HeroDusk';

export default function Page() {
  return (
    <HeroDusk
      title="See the signal in every hard call"
      subtitle="Pull metrics, bets and debates into one calm view."
      cta="Book a walkthrough"
      image="/hero/dunes.jpg" // optional
    />
  );
}

// The pixel headline is reusable on its own:
import { PixelText } from '@/components/marketing/heroes/PixelText';
<h1 className="text-6xl"><PixelText text="Hello world" /></h1>`,
      },
    ],
    props: [
      { name: 'title', type: 'string', description: 'Headline, set in the pixel face (A–Z, 0–9 and basic punctuation).' },
      { name: 'subtitle', type: 'string', description: 'Supporting line under the headline.' },
      { name: 'cta', type: 'string', default: "'Book a walkthrough'", description: 'Main button label.' },
      { name: 'image', type: 'string', description: 'Background photo URL. Without it a dusk dune scene is painted on canvas.' },
      { name: 'className', type: 'string', description: 'Extra classes for the section.' },
    ],
  },
  {
    slug: 'hero-meadow',
    name: 'Hero — Meadow',
    description:
      'A bright, airy hero over sky and flowering hills: a floating pill nav, a headline with tilted serif word chips where the second word rotates, a pressable 3D button and a live product dashboard rising out of the meadow.',
    badge: 'New',
    theme: 'light',
    demos: [
      {
        title: 'Spring meadow with product',
        description: 'The chip word rotates, KPIs count up, and the chart bars grow and show values on hover.',
        component: HeroMeadowDemo,
        height: 1080,
        code: `import { HeroMeadow } from '@/components/marketing/heroes/HeroMeadow';

export default function Page() {
  return (
    <HeroMeadow
      words={['Momentum', 'Revenue', 'Readers']}
      subtitle="Plan, ship and measure growth experiments in one calm place."
      cta="Start growing"
    />
  );
}`,
      },
    ],
    props: [
      { name: 'words', type: 'string[]', default: "['Momentum','Revenue','Readers']", description: 'Words that rotate inside the second chip.' },
      { name: 'subtitle', type: 'string', description: 'Supporting line under the headline.' },
      { name: 'cta', type: 'string', default: "'Start growing'", description: 'Main button label.' },
      { name: 'image', type: 'string', description: 'Background photo URL. Without it a spring meadow is painted on canvas.' },
      { name: 'className', type: 'string', description: 'Extra classes for the section.' },
    ],
  },
];
