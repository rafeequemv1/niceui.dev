import type { DocEntry } from '@/docs/types';
import { ShowreelPlayerDemo } from '@/components/gallery/ShowreelPlayer';
import { ReelGridDemo } from '@/components/gallery/ReelGrid';
import { ProjectCardsDemo } from '@/components/gallery/ProjectCards';
import { CanvasGalleryDemo } from '@/components/gallery/CanvasGallery';
import { PixelTransitionDemo } from '@/components/gallery/PixelTransition';
import { PolaroidStackDemo } from '@/components/gallery/PolaroidStack';

export const galleryShowcaseEntries: DocEntry[] = [
  {
    slug: 'showreel-player',
    name: 'Showreel Player',
    description: 'A video-style showreel with slow pan-and-zoom, a scrubber with chapter markers and hover previews, a chapter list and timecode.',
    badge: 'New',
    demos: [
      {
        title: 'Five-chapter reel',
        description: 'Scrub the bar, hover it for a preview, jump chapters, or press space and the arrow keys.',
        component: ShowreelPlayerDemo,
        height: 560,
        code: `import { ShowreelPlayer } from '@/components/gallery/ShowreelPlayer';

<ShowreelPlayer
  chapters={[
    { title: 'Low Tide, Dawn', image: '/reel/01.jpg', duration: 6 },
    { title: 'Glass Lagoon', image: '/reel/02.jpg', duration: 5 },
  ]}
/>`,
      },
    ],
    props: [
      { name: 'chapters', type: '{ title: string; image: string; duration: number }[]', description: 'Chapters in order; duration in seconds.' },
      { name: 'autoPlay', type: 'boolean', default: 'true', description: 'Start playing on mount (skipped under reduced motion).' },
    ],
  },
  {
    slug: 'reel-grid',
    name: 'Reel Grid',
    description: 'Vertical 9:16 reels that play a slow pan with a progress bar on hover or focus, with view and duration badges.',
    badge: 'New',
    demos: [
      {
        title: 'Short-form reels',
        description: 'Hover or tab to a reel to play it. Tap toggles on touch screens.',
        component: ReelGridDemo,
        height: 560,
        code: `import { ReelGrid } from '@/components/gallery/ReelGrid';

<ReelGrid reels={[{ id: 1, title: 'Neon Bloom', image: '/reels/1.jpg', views: '1.2M', duration: 14 }]} />`,
      },
    ],
    props: [{ name: 'reels', type: '{ id: number; title: string; image: string; views: string; duration: number }[]', description: 'Reels to show.' }],
  },
  {
    slug: 'project-cards',
    name: 'Project Cards',
    description: 'Portfolio case cards that cycle through project images on hover, with client, year, tags and an arrow reveal.',
    badge: 'New',
    demos: [
      {
        title: 'Selected work',
        description: 'Hover or focus a card to flip through its images.',
        component: ProjectCardsDemo,
        height: 480,
        code: `import { ProjectCards } from '@/components/gallery/ProjectCards';

<ProjectCards
  projects={[{ title: 'Low Tide Campaign', client: 'Comporta Hotels', year: 2026, tags: ['Film'], images: ['/a.jpg', '/b.jpg'] }]}
/>`,
      },
    ],
    props: [{ name: 'projects', type: '{ title; client; year; tags: string[]; images: string[] }[]', description: 'Projects to show.' }],
  },
  {
    slug: 'canvas-gallery',
    name: 'Infinite Canvas',
    description: 'An endless wall of images you drag in any direction, with inertia, a slow drift and a lightbox for the one you click.',
    badge: 'New',
    demos: [
      {
        title: 'Explore the archive',
        description: 'Drag or use the arrow keys to pan. Click an image to open it.',
        component: CanvasGalleryDemo,
        height: 500,
        code: `import { CanvasGallery } from '@/components/gallery/CanvasGallery';

<CanvasGallery images={photos.map((p) => p.src)} height={460} />`,
      },
    ],
    props: [
      { name: 'images', type: 'string[]', description: 'Image URLs; they repeat across the canvas.' },
      { name: 'height', type: 'number', default: '460', description: 'Canvas height in pixels.' },
    ],
  },
  {
    slug: 'pixel-transition',
    name: 'Pixel Transition',
    description: 'Canvas transitions between images: pixelate, dissolve or blinds, with captions and prev/next.',
    badge: 'New',
    demos: [
      {
        title: 'Three transitions',
        description: 'Pick an effect, then step through the images.',
        component: PixelTransitionDemo,
        height: 560,
        code: `import { PixelTransition } from '@/components/gallery/PixelTransition';

const [index, setIndex] = useState(0);
<PixelTransition images={images} index={index} effect="pixelate" />`,
      },
    ],
    props: [
      { name: 'images', type: 'string[]', description: 'Same-origin image URLs (drawn on a canvas).' },
      { name: 'index', type: 'number', description: 'Which image to show; changing it runs the transition.' },
      { name: 'effect', type: "'pixelate' | 'dissolve' | 'blinds'", default: "'pixelate'", description: 'Transition style.' },
    ],
  },
  {
    slug: 'polaroid-stack',
    name: 'Polaroid Scatter',
    description: 'Scattered polaroid photos with handwritten captions you can drag, bring to the front and shuffle.',
    badge: 'New',
    demos: [
      {
        title: 'Travel scraps',
        description: 'Drag a photo, click to bring it forward, or shuffle the pile. Arrow keys nudge the focused photo.',
        component: PolaroidStackDemo,
        height: 520,
        code: `import { PolaroidStack } from '@/components/gallery/PolaroidStack';

<PolaroidStack photos={[{ id: 1, image: '/p/1.jpg', caption: 'Comporta, \\'25' }]} />`,
      },
    ],
    props: [
      { name: 'photos', type: '{ id: number; image: string; caption: string }[]', description: 'Photos to scatter.' },
      { name: 'height', type: 'number', default: '480', description: 'Board height in pixels.' },
    ],
  },
];
