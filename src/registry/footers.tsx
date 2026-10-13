import type { DocEntry } from '@/docs/types';
import { DitherDotFooter, DitherGridFooter, DitherDiagonalFooter } from '@/components/blocks/DitherFooters';

const dotCode = `import { DitherDotFooter } from "@/components/blocks/DitherFooters";

<DitherDotFooter onNavigate={go} />`;

const gridCode = `import { DitherGridFooter } from "@/components/blocks/DitherFooters";

<DitherGridFooter onNavigate={go} />`;

const diagonalCode = `import { DitherDiagonalFooter } from "@/components/blocks/DitherFooters";

<DitherDiagonalFooter onNavigate={go} />`;

export const footerEntries: DocEntry[] = [
  {
    slug: 'dither-dot-footer',
    name: 'Dither Dot Footer',
    description: 'A footer with a fine dot dither pattern, CTA strip, link columns and status bar.',
    badge: 'New',
    demos: [
      {
        title: 'Dot dither pattern',
        description: 'Subtle radial dot texture with a gradient accent line at the top edge.',
        component: DitherDotFooter,
        code: dotCode,
        height: 520,
      },
    ],
    props: [
      { name: 'onNavigate', type: '(to: string) => void', description: 'Navigation callback for footer links.' },
    ],
  },
  {
    slug: 'dither-grid-footer',
    name: 'Dither Grid Footer',
    description: 'A footer with a grid dither pattern, newsletter signup and giant brand text.',
    badge: 'New',
    demos: [
      {
        title: 'Grid dither pattern',
        description: 'Fine grid texture with a radial glow, newsletter form and oversized brand wordmark.',
        component: DitherGridFooter,
        code: gridCode,
        height: 560,
      },
    ],
    props: [
      { name: 'onNavigate', type: '(to: string) => void', description: 'Navigation callback for footer links.' },
    ],
  },
  {
    slug: 'dither-diagonal-footer',
    name: 'Dither Diagonal Footer',
    description: 'A minimal footer with a diagonal line dither pattern and centered brand layout.',
    badge: 'New',
    demos: [
      {
        title: 'Diagonal dither pattern',
        description: 'Repeating diagonal lines with a centered brand, feature pills and compact link grid.',
        component: DitherDiagonalFooter,
        code: diagonalCode,
        height: 480,
      },
    ],
    props: [
      { name: 'onNavigate', type: '(to: string) => void', description: 'Navigation callback for footer links.' },
    ],
  },
];
