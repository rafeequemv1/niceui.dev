import type { DocEntry } from '@/docs/types';
import { CoverflowCarouselDemo } from '@/components/gallery/CoverflowCarousel';
import { RingCarouselDemo } from '@/components/gallery/RingCarousel';
import { StackCarouselDemo } from '@/components/gallery/StackCarousel';
import { ParallaxCarouselDemo } from '@/components/gallery/ParallaxCarousel';
import { TiltGalleryDemo } from '@/components/gallery/TiltGallery';

const itemsProp = { name: 'items', type: 'Artwork[]', default: 'ARTWORKS', description: 'Images to show, each with a title, artist, place and year.' };
const srcProp = { name: 'src', type: '(item) => string', description: 'Returns the image URL for an item. Point it at your own photos.' };
const classProp = { name: 'className', type: 'string', description: 'Extra classes for the root.' };

export const galleryCarousel3dEntries: DocEntry[] = [
  {
    slug: 'coverflow-carousel',
    name: 'Coverflow Carousel',
    description: 'A 3D coverflow with side covers that turn away, mirrored reflections, drag or swipe with inertia, arrow keys and captions.',
    badge: 'New',
    demos: [
      {
        title: 'Album-style coverflow',
        description: 'Drag, swipe or use the arrow keys. A fast flick carries the flow further.',
        component: CoverflowCarouselDemo,
        height: 560,
        code: `import { CoverflowCarousel } from '@/components/gallery/CoverflowCarousel';

<CoverflowCarousel
  items={photos}
  src={(p) => p.url}
  initial={3}
/>`,
      },
    ],
    props: [itemsProp, srcProp, { name: 'initial', type: 'number', default: '3', description: 'Index of the cover that starts in front.' }, classProp],
  },
  {
    slug: 'ring-carousel',
    name: '3D Ring Carousel',
    description: 'Cards on a slowly turning cylinder: drag to spin it with momentum, click a card to bring it to the front, pause with one tap.',
    badge: 'New',
    demos: [
      {
        title: 'Rotating ring',
        description: 'It turns on its own until you hover. Drag to spin, or press ← → to step.',
        component: RingCarouselDemo,
        height: 520,
        code: `import { RingCarousel } from '@/components/gallery/RingCarousel';

<RingCarousel items={photos} src={(p) => p.url} speed={9} />`,
      },
    ],
    props: [itemsProp, srcProp, { name: 'speed', type: 'number', default: '9', description: 'Idle rotation in degrees per second. 0 turns it off.' }, classProp],
  },
  {
    slug: 'stack-carousel',
    name: 'Card Stack',
    description: 'A swipeable stack of photo cards that tilt as you drag and fly out left or right, with keep and skip buttons, keyboard control and restack.',
    badge: 'New',
    demos: [
      {
        title: 'Keep or skip',
        description: 'Drag the top card past the edge, press ← or →, or use the buttons.',
        component: StackCarouselDemo,
        height: 520,
        code: `import { StackCarousel } from '@/components/gallery/StackCarousel';

<StackCarousel
  items={photos}
  src={(p) => p.url}
  onSwipe={(photo, dir) => dir === 'right' && save(photo)}
/>`,
      },
    ],
    props: [itemsProp, srcProp, { name: 'onSwipe', type: "(item, dir: 'left' | 'right') => void", description: 'Called when a card leaves the stack.' }, classProp],
  },
  {
    slug: 'parallax-carousel',
    name: 'Parallax Slider',
    description: 'Full-width slides whose images travel slower than the frame, with large serif captions, segmented autoplay progress and pause.',
    badge: 'New',
    demos: [
      {
        title: 'Editorial slider',
        description: 'Autoplay pauses on hover. Drag to feel the parallax, or use the arrows.',
        component: ParallaxCarouselDemo,
        height: 600,
        code: `import { ParallaxCarousel } from '@/components/gallery/ParallaxCarousel';

<ParallaxCarousel items={stories} src={(s) => s.cover} interval={5000} />`,
      },
    ],
    props: [itemsProp, srcProp, { name: 'interval', type: 'number', default: '5000', description: 'Autoplay interval in ms. 0 turns autoplay off.' }, classProp],
  },
  {
    slug: 'tilt-gallery',
    name: '3D Tilt Gallery',
    description: 'A grid of cards that tilt toward the pointer with a moving glare and floating captions; click one to zoom it open from where it sits.',
    badge: 'New',
    demos: [
      {
        title: 'Tilt and zoom',
        description: 'Move over a card to tilt it. Click to open, Esc or click outside to close.',
        component: TiltGalleryDemo,
        height: 520,
        code: `import { TiltGallery } from '@/components/gallery/TiltGallery';

<TiltGallery items={photos} src={(p) => p.url} maxTilt={12} />`,
      },
    ],
    props: [itemsProp, srcProp, { name: 'maxTilt', type: 'number', default: '12', description: 'Maximum tilt in degrees.' }, classProp],
  },
];
