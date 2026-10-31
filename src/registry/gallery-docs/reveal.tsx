import type { DocEntry } from '@/docs/types';
import { ImageTrailDemo } from '@/components/gallery/ImageTrail';
import { ScrollRevealDemo } from '@/components/gallery/ScrollReveal';
import { ZoomParallaxDemo } from '@/components/gallery/ZoomParallax';
import { HorizontalScrollDemo } from '@/components/gallery/HorizontalScroll';
import { TextMaskImageDemo } from '@/components/gallery/TextMaskImage';
import { CurtainRevealDemo } from '@/components/gallery/CurtainReveal';

export const galleryRevealEntries: DocEntry[] = [
  {
    slug: 'image-trail',
    name: 'Image Trail',
    description: 'Moving the pointer drops a trail of images that pop in, then shrink and fade.',
    badge: 'New',
    demos: [
      {
        title: 'Portfolio hero',
        description: 'Move your pointer over the frame. Until you do, it traces a figure-eight on its own.',
        component: ImageTrailDemo,
        height: 500,
        code: `import { ImageTrail } from '@/components/gallery/ImageTrail';

<ImageTrail images={work.map((w) => w.cover)} spacing={80}>
  <h1 className="text-6xl font-semibold">Move your cursor</h1>
</ImageTrail>`,
      },
    ],
    props: [
      { name: 'images', type: 'string[]', description: 'Image URLs dropped in order.' },
      { name: 'spacing', type: 'number', default: '80', description: 'Pixels of travel between drops.' },
      { name: 'life', type: 'number', default: '1100', description: 'How long each image lives, in ms.' },
      { name: 'children', type: 'ReactNode', description: 'Content centred above the trail.' },
    ],
  },
  {
    slug: 'scroll-reveal-images',
    name: 'Scroll Reveal',
    description: 'Images wipe in with a clip-path and settle from a slight zoom as they scroll into view.',
    badge: 'New',
    demos: [
      {
        title: 'Selected work',
        description: 'Scroll inside the frame. Images alternate sides and wipe in from the opposite edge.',
        component: ScrollRevealDemo,
        height: 540,
        code: `import { ScrollReveal } from '@/components/gallery/ScrollReveal';

<ScrollReveal
  height={600}
  items={projects.map((p) => ({ src: p.image, title: p.name, meta: p.year }))}
/>`,
      },
    ],
    props: [
      { name: 'items', type: '{ src: string; title: string; meta: string }[]', description: 'Images and captions.' },
      { name: 'height', type: 'number', default: '480', description: 'Height of the scrolling frame.' },
    ],
  },
  {
    slug: 'zoom-parallax',
    name: 'Zoom Parallax',
    description: 'A full-frame image zooms out into a grid of surrounding images as you scroll.',
    badge: 'New',
    demos: [
      {
        title: 'Zoom out to the grid',
        description: 'Scroll inside the frame to pull back from the hero image.',
        component: ZoomParallaxDemo,
        height: 540,
        code: `import { ZoomParallax } from '@/components/gallery/ZoomParallax';

<ZoomParallax images={[hero, ...rest].slice(0, 7)} length={3} />`,
      },
    ],
    props: [
      { name: 'images', type: 'string[]', description: 'Up to seven URLs; the first is the hero.' },
      { name: 'height', type: 'number', default: '480', description: 'Height of the frame.' },
      { name: 'length', type: 'number', default: '3', description: 'Screens of scrolling the effect takes.' },
      { name: 'autoPreview', type: 'boolean', default: 'true', description: 'Scroll part-way on mount.' },
    ],
  },
  {
    slug: 'horizontal-scroll-gallery',
    name: 'Horizontal Scroll',
    description: 'Scrolling down slides a track of large captioned images sideways, with a progress line.',
    badge: 'New',
    demos: [
      {
        title: 'Field notes',
        description: 'Scroll inside the frame; the track moves sideways and each image drifts slightly.',
        component: HorizontalScrollDemo,
        height: 520,
        code: `import { HorizontalScroll } from '@/components/gallery/HorizontalScroll';

<HorizontalScroll items={stories.map((s) => ({ src: s.image, title: s.title, meta: s.place }))} />`,
      },
    ],
    props: [
      { name: 'items', type: '{ src: string; title: string; meta: string }[]', description: 'Images and captions.' },
      { name: 'height', type: 'number', default: '460', description: 'Height of the frame.' },
      { name: 'autoPreview', type: 'boolean', default: 'true', description: 'Scroll part-way on mount.' },
    ],
  },
  {
    slug: 'text-mask-image',
    name: 'Image in Text',
    description: 'A huge headline with a slowly panning image showing through its letters; hover a label to swap it.',
    badge: 'New',
    demos: [
      {
        title: 'Light & Land',
        description: 'Images cycle on their own until you hover or focus a label.',
        component: TextMaskImageDemo,
        height: 500,
        code: `import { TextMaskImage } from '@/components/gallery/TextMaskImage';

<TextMaskImage
  lines={['Light', '& Land']}
  images={[{ src: '/coast.jpg', label: 'Coast' }, { src: '/ridge.jpg', label: 'Ridge' }]}
/>`,
      },
    ],
    props: [
      { name: 'lines', type: 'string[]', description: 'Headline lines.' },
      { name: 'images', type: '{ src: string; label: string }[]', description: 'Images and their labels.' },
      { name: 'autoplay', type: 'boolean', default: 'true', description: 'Cycle until the visitor picks one.' },
    ],
  },
  {
    slug: 'curtain-reveal',
    name: 'Curtain Reveal',
    description: 'Slides change behind a curtain of strips that pull away up and down, with captions and autoplay.',
    badge: 'New',
    demos: [
      {
        title: 'Exhibition slider',
        description: 'Autoplays with a progress line; hover pauses. Use the arrows or ← →.',
        component: CurtainRevealDemo,
        height: 520,
        code: `import { CurtainReveal } from '@/components/gallery/CurtainReveal';

<CurtainReveal slides={works.map((w) => ({ src: w.image, title: w.title, meta: w.artist }))} interval={4500} />`,
      },
    ],
    props: [
      { name: 'slides', type: '{ src: string; title: string; meta: string }[]', description: 'Slides in order.' },
      { name: 'interval', type: 'number', default: '4500', description: 'Autoplay delay in ms.' },
      { name: 'height', type: 'number', default: '460', description: 'Height of the stage.' },
    ],
  },
];
