import type { DocEntry } from '@/docs/types';
import { StoreApp } from '@/pages/apps/store/StoreApp';
import { DocsApp } from '@/pages/apps/docs/DocsApp';

export const siteTemplateEntries: DocEntry[] = [
  {
    slug: 'store',
    name: 'Store',
    description: 'A premium e-commerce storefront with hero, category tiles, a filterable product grid, quick view, wishlist and a cart drawer with a free-shipping meter.',
    badge: 'New',
    theme: 'light',
    page: StoreApp,
  },
  {
    slug: 'docs-site',
    name: 'Docs Site',
    description: 'A developer documentation site with a ⌘K search palette, collapsible nav, code blocks with tabs and copy, callouts, a scroll-spy table of contents and a version switcher.',
    badge: 'New',
    page: DocsApp,
  },
];
