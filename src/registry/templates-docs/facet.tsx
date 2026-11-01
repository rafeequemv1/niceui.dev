import type { DocEntry } from '@/docs/types';
import { FacetApp } from '@/pages/apps/facet/FacetApp';

export const facetTemplateEntries: DocEntry[] = [
  {
    slug: 'badge-maker',
    name: 'Badge Maker',
    description: 'A light 2D design tool for metallic badges and icons: an inspector with Shape, Material and Scene tabs, a dark canvas with a finish rail and view toolbar, undo and redo, and SVG, PNG and CSS export.',
    badge: 'New',
    theme: 'light',
    page: FacetApp,
  },
];
