import type { DocEntry } from '@/docs/types';
import { PortfolioApp } from '@/pages/apps/portfolio/PortfolioApp';
import { BlogApp } from '@/pages/apps/blog/BlogApp';

export const contentTemplateEntries: DocEntry[] = [
  {
    slug: 'portfolio',
    name: 'Portfolio',
    description: 'An editorial designer portfolio with filterable selected work, case-study overlays, a career timeline, services and a contact form.',
    badge: 'New',
    theme: 'light',
    page: PortfolioApp,
  },
  {
    slug: 'blog',
    name: 'Blog',
    description: 'A dark magazine-style blog with a featured story, category tabs, search, bookmarks, an article view with reading progress and contents, and a newsletter signup.',
    badge: 'New',
    page: BlogApp,
  },
];
