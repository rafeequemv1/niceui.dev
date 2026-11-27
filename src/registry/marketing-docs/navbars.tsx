import type { DocEntry } from '@/docs/types';
import { AnimatedNavbarDemo, MorphingNavbarDemo } from '@/components/marketing/nav/AnimatedNavbar';
import { BottomNavigationDemo } from '@/components/marketing/nav/BottomNavigation';
import { StickyHeaderDemo, StickyHeaderProgressDemo } from '@/components/marketing/nav/StickyHeader';

export const navbarEntries: DocEntry[] = [
  {
    slug: 'animated-navbar',
    name: 'Animated Navbar',
    description:
      'An animated navigation bar for React and Tailwind: a pill or underline that slides to the hovered link, a glass navbar that morphs into a compact floating pill on scroll, and a mobile menu with staggered links.',
    badge: 'New',
    demos: [
      {
        title: 'Sliding pill and animated underline',
        description: 'Hover the links: the indicator glides to them and settles back on the active page. Resize below 768px for the mobile menu.',
        component: AnimatedNavbarDemo,
        height: 420,
        code: `import { AnimatedNavbar } from '@/components/marketing/nav/AnimatedNavbar';

<AnimatedNavbar indicator="pill" />
<AnimatedNavbar indicator="underline" links={[{ label: 'Product', href: '/product' }, { label: 'Pricing', href: '/pricing' }]} />`,
      },
      {
        title: 'Glass navbar that morphs on scroll',
        description: 'Scroll inside the box: the full-width bar turns into a compact, blurred pill.',
        component: MorphingNavbarDemo,
        height: 520,
        code: `import { MorphingNavbar } from '@/components/marketing/nav/AnimatedNavbar';

// Uses window scroll by default; pass scrollRoot for a scrolling container.
<MorphingNavbar threshold={40} />`,
      },
    ],
    props: [
      { name: 'links', type: '{ label: string; href?: string }[]', description: 'Navigation links.' },
      { name: 'indicator', type: "'pill' | 'underline'", default: "'pill'", description: 'How the hovered and active link is marked (AnimatedNavbar).' },
      { name: 'actions', type: 'ReactNode', description: 'Right-hand slot; defaults to sign in and a call to action (AnimatedNavbar).' },
      { name: 'defaultActive', type: 'number', default: '0', description: 'Index of the active link (AnimatedNavbar).' },
      { name: 'scrollRoot', type: 'RefObject<HTMLElement>', description: 'Scroll container that drives the morph; window when omitted (MorphingNavbar).' },
      { name: 'threshold', type: 'number', default: '40', description: 'Pixels scrolled before the bar becomes a pill (MorphingNavbar).' },
    ],
  },
  {
    slug: 'bottom-navigation',
    name: 'Bottom Navigation Bar',
    description:
      'A floating bottom navigation bar for mobile web apps: icon tabs with labels and badge counts, an animated active indicator (sliding blob or notch), and a variant with a raised floating action button.',
    badge: 'New',
    demos: [
      {
        title: 'Blob, notch and floating action button',
        description: 'Tap the tabs, or focus one and use the arrow keys.',
        component: BottomNavigationDemo,
        height: 460,
        code: `import { BottomNavigation, BottomNavigationFab } from '@/components/marketing/nav/BottomNavigation';
import { Home, Search, Bell, User } from 'lucide-react';

<BottomNavigation
  variant="notch"
  items={[
    { label: 'Home', icon: Home },
    { label: 'Search', icon: Search },
    { label: 'Alerts', icon: Bell, badge: 4 },
    { label: 'Profile', icon: User },
  ]}
  onChange={(i) => navigate(i)}
/>

<BottomNavigationFab onAction={() => openComposer()} />`,
      },
    ],
    props: [
      { name: 'items', type: '{ label: string; icon: LucideIcon; badge?: number }[]', description: 'Tabs to show; badges above 9 show as 9+.' },
      { name: 'variant', type: "'blob' | 'notch'", default: "'blob'", description: 'Sliding glow pill, or a notched bar with a raised active icon.' },
      { name: 'defaultActive', type: 'number', default: '0', description: 'Initially selected tab.' },
      { name: 'onChange', type: '(index: number) => void', description: 'Called when a tab is chosen.' },
      { name: 'onAction', type: '() => void', description: 'Called when the floating action button is pressed (BottomNavigationFab).' },
    ],
  },
  {
    slug: 'sticky-header',
    name: 'Sticky Header',
    description:
      'A sticky website header that hides when you scroll down, reveals itself the moment you scroll up, and shrinks onto a blurred background once the page moves, with an optional reading progress bar.',
    badge: 'New',
    demos: [
      {
        title: 'Hide on scroll down, show on scroll up',
        description: 'Scroll inside the box, then scroll back up a little.',
        component: StickyHeaderDemo,
        height: 500,
        code: `import { StickyHeader } from '@/components/marketing/nav/StickyHeader';

// Uses window scroll by default.
<StickyHeader />`,
      },
      {
        title: 'With reading progress',
        description: 'A thin gradient bar along the bottom edge tracks how far you have read.',
        component: StickyHeaderProgressDemo,
        height: 500,
        code: `<StickyHeader progress />

// Or use the hook for your own header:
import { useScrollHeader } from '@/components/marketing/nav/StickyHeader';
const { hidden, scrolled, progress } = useScrollHeader();`,
      },
    ],
    props: [
      { name: 'progress', type: 'boolean', default: 'false', description: 'Show a reading-progress bar along the bottom edge.' },
      { name: 'alwaysVisible', type: 'boolean', default: 'false', description: 'Keep the header on screen instead of hiding it on scroll down.' },
      { name: 'scrollRoot', type: 'RefObject<HTMLElement>', description: 'Scroll container that drives the header; window when omitted.' },
      { name: 'brand', type: 'ReactNode', description: 'Replaces the default wordmark.' },
    ],
  },
];
