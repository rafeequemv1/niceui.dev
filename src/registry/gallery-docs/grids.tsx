import type { DocEntry } from '@/docs/types';
import { MasonryGalleryDemo } from '@/components/gallery/MasonryGallery';
import { LightboxDemo } from '@/components/gallery/Lightbox';
import { BentoGalleryDemo } from '@/components/gallery/BentoGallery';
import { FilmstripViewerDemo } from '@/components/gallery/FilmstripViewer';
import { HoverRevealDemo } from '@/components/gallery/HoverReveal';

export const galleryGridEntries: DocEntry[] = [
  {
    slug: 'masonry-gallery',
    name: 'Masonry Gallery',
    description: 'A responsive masonry of mixed aspect ratios with tone filters, staggered reveals and hover captions.',
    badge: 'New',
    demos: [
      {
        title: 'Filter by tone',
        description: 'Pick a tone to re-flow the columns. Hover or focus a photo for its caption.',
        component: MasonryGalleryDemo,
        height: 640,
        code: `import { MasonryGallery } from '@/components/gallery/MasonryGallery';

<MasonryGallery items={photos} />`,
      },
    ],
    props: [
      { name: 'items', type: 'Artwork[]', description: 'Photos with id, title, artist, place, year and tone.' },
      { name: 'className', type: 'string', description: 'Extra classes for the wrapper.' },
    ],
  },
  {
    slug: 'lightbox',
    name: 'Lightbox',
    description: 'A thumbnail grid that opens a viewer with zoom and pan, swipe, arrow keys, a filmstrip, a counter and a details panel.',
    badge: 'New',
    demos: [
      {
        title: 'Viewer',
        description: 'Click the photo to zoom and drag to pan. Swipe or use ← → to move, Esc to close.',
        component: LightboxDemo,
        height: 560,
        code: `import { Lightbox } from '@/components/gallery/Lightbox';

<Lightbox items={photos} defaultIndex={null} />`,
      },
    ],
    props: [
      { name: 'items', type: 'Artwork[]', description: 'Photos to show.' },
      { name: 'defaultIndex', type: 'number | null', default: 'null', description: 'Photo opened on mount; null starts on the grid.' },
    ],
  },
  {
    slug: 'bento-gallery',
    name: 'Bento Gallery',
    description: 'An editorial bento grid with a featured tile; click any photo to swap it into the spotlight with a FLIP animation.',
    badge: 'New',
    demos: [
      {
        title: 'Swap the feature',
        description: 'Click a smaller tile to move it into the featured slot.',
        component: BentoGalleryDemo,
        height: 520,
        code: `import { BentoGallery } from '@/components/gallery/BentoGallery';

<BentoGallery items={photos.slice(0, 6)} />`,
      },
    ],
    props: [{ name: 'items', type: 'Artwork[]', description: 'Six photos; the first starts featured.' }],
  },
  {
    slug: 'filmstrip-viewer',
    name: 'Filmstrip Viewer',
    description: 'A cinematic stage with crossfades and Ken Burns motion, a synced filmstrip, arrows and an autoplay progress ring.',
    badge: 'New',
    demos: [
      {
        title: 'Slideshow',
        description: 'Autoplay pauses on hover. Use the ring to pause, or ← → to step.',
        component: FilmstripViewerDemo,
        height: 600,
        code: `import { FilmstripViewer } from '@/components/gallery/FilmstripViewer';

<FilmstripViewer items={photos} interval={5} autoplay />`,
      },
    ],
    props: [
      { name: 'items', type: 'Artwork[]', description: 'Photos to show.' },
      { name: 'interval', type: 'number', default: '5', description: 'Seconds per slide.' },
      { name: 'autoplay', type: 'boolean', default: 'true', description: 'Start playing on mount.' },
    ],
  },
  {
    slug: 'hover-reveal-list',
    name: 'Hover Reveal List',
    description: 'An editorial index where hovering a title floats its photo beside the cursor with spring motion and a clip-path reveal.',
    badge: 'New',
    demos: [
      {
        title: 'Index',
        description: 'Move across the titles. On touch, tap a row to show its photo.',
        component: HoverRevealDemo,
        height: 480,
        code: `import { HoverReveal } from '@/components/gallery/HoverReveal';

<HoverReveal items={projects} />`,
      },
    ],
    props: [
      { name: 'items', type: 'Artwork[]', description: 'Rows to list.' },
      { name: 'defaultActive', type: 'number | null', default: 'null', description: 'Row whose photo shows on mount.' },
    ],
  },
];
