import type { DocEntry } from '@/docs/types';
import { InfiniteMarqueeGalleryDemo } from '@/components/gallery/InfiniteMarqueeGallery';
import { ExpandingPanelsDemo } from '@/components/gallery/ExpandingPanels';
import { BeforeAfterDemo } from '@/components/gallery/BeforeAfter';
import { Gallery3DWallDemo } from '@/components/gallery/Gallery3DWall';
import { ScrollStackDemo } from '@/components/gallery/ScrollStack';

export const galleryMotionEntries: DocEntry[] = [
  {
    slug: 'marquee-gallery',
    name: 'Marquee Gallery',
    description: 'Rows of images drifting in opposite directions that pause on hover and speed up when you scroll or drag.',
    badge: 'New',
    demos: [
      {
        title: 'Three rows',
        description: 'Hover a row to pause it, then scroll or drag to give it a push.',
        component: InfiniteMarqueeGalleryDemo,
        height: 520,
        code: `import { InfiniteMarqueeGallery } from '@/components/gallery/InfiniteMarqueeGallery';

<InfiniteMarqueeGallery
  speed={40}
  rows={[
    photos.slice(0, 6).map((p) => ({ src: p.url, title: p.title, caption: p.author })),
    photos.slice(6, 12).map((p) => ({ src: p.url, title: p.title, caption: p.author })),
  ]}
/>`,
      },
    ],
    props: [
      { name: 'rows', type: '{ src: string; title: string; caption?: string }[][]', description: 'One array per row; rows alternate direction.' },
      { name: 'speed', type: 'number', default: '40', description: 'Base drift speed in pixels per second.' },
      { name: 'className', type: 'string', description: 'Extra classes for the wrapper.' },
    ],
  },
  {
    slug: 'expanding-panels',
    name: 'Expanding Panels',
    description: 'A horizontal accordion of tall image panels: the active one opens with its caption and the rest show vertical titles.',
    badge: 'New',
    demos: [
      {
        title: 'Auto-advancing panels',
        description: 'Panels advance on a timer; hover to pause, click or use the arrow keys to choose one.',
        component: ExpandingPanelsDemo,
        height: 480,
        code: `import { ExpandingPanels } from '@/components/gallery/ExpandingPanels';

<ExpandingPanels
  interval={4200}
  items={stories.map((s) => ({ src: s.cover, title: s.title, subtitle: s.byline, meta: s.issue }))}
/>`,
      },
    ],
    props: [
      { name: 'items', type: '{ src: string; title: string; subtitle?: string; meta?: string }[]', description: 'Panels in order.' },
      { name: 'interval', type: 'number', default: '4200', description: 'Auto-advance interval in ms; 0 turns it off.' },
      { name: 'className', type: 'string', description: 'Extra classes for the wrapper.' },
    ],
  },
  {
    slug: 'before-after',
    name: 'Before / After',
    description: 'A draggable comparison slider between an original and an edited image, with keyboard control and tap-to-flip on phones.',
    badge: 'New',
    demos: [
      {
        title: 'Photo edit comparison',
        description: 'Drag the handle, or focus it and use the arrow keys. Switch presets underneath.',
        component: BeforeAfterDemo,
        height: 560,
        code: `import { BeforeAfter } from '@/components/gallery/BeforeAfter';

<BeforeAfter
  before="/photos/raw.jpg"
  after="/photos/graded.jpg"
  beforeLabel="Original"
  afterLabel="Edited"
/>`,
      },
    ],
    props: [
      { name: 'before', type: 'string', description: 'Image shown on the left of the handle.' },
      { name: 'after', type: 'string', description: 'Image shown on the right of the handle.' },
      { name: 'beforeFilter', type: 'string', description: 'CSS filter for the before image, useful with a single photo.' },
      { name: 'beforeLabel', type: 'string', default: "'Before'", description: 'Left label.' },
      { name: 'afterLabel', type: 'string', default: "'After'", description: 'Right label.' },
      { name: 'initial', type: 'number', default: '50', description: 'Starting split, 0–100.' },
    ],
  },
  {
    slug: 'gallery-wall',
    name: '3D Gallery Wall',
    description: 'Framed artworks hung along a perspective wall; walk along it by dragging or with the arrow keys, and the focused piece steps forward.',
    badge: 'New',
    demos: [
      {
        title: 'Exhibition wall',
        description: 'Drag or swipe sideways, click a frame, or focus the wall and use ← →.',
        component: Gallery3DWallDemo,
        height: 520,
        code: `import { Gallery3DWall } from '@/components/gallery/Gallery3DWall';

<Gallery3DWall
  initial={2}
  items={works.map((w) => ({ src: w.image, title: w.title, artist: w.artist, year: w.year, place: w.city }))}
/>`,
      },
    ],
    props: [
      { name: 'items', type: '{ src: string; title: string; artist: string; year: number | string; place?: string }[]', description: 'Artworks along the wall.' },
      { name: 'initial', type: 'number', default: '0', description: 'Index of the artwork in focus at start.' },
      { name: 'className', type: 'string', description: 'Extra classes for the wrapper.' },
    ],
  },
  {
    slug: 'scroll-stack-gallery',
    name: 'Scroll Stack',
    description: 'Sticky image cards that pile up and recede as you scroll inside the gallery, with a live index counter.',
    badge: 'New',
    demos: [
      {
        title: 'Stacked photo story',
        description: 'Scroll inside the frame; earlier cards shrink and dim beneath the next one.',
        component: ScrollStackDemo,
        height: 540,
        code: `import { ScrollStack } from '@/components/gallery/ScrollStack';

<ScrollStack
  height={440}
  items={chapters.map((c) => ({ src: c.image, title: c.title, caption: c.place }))}
/>`,
      },
    ],
    props: [
      { name: 'items', type: '{ src: string; title: string; caption?: string }[]', description: 'Cards from first to last.' },
      { name: 'height', type: 'number', default: '440', description: 'Height of the scroll viewport in px.' },
      { name: 'className', type: 'string', description: 'Extra classes for the wrapper.' },
    ],
  },
];
