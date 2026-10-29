import type { DocEntry } from '@/docs/types';
import { LandingPageCadence } from '@/pages/landing/LandingPageCadence';
import { LandingPageCorpus } from '@/pages/landing/LandingPageCorpus';
import { LandingPageAurelia } from '@/pages/landing/LandingPageAurelia';
import { LandingPageLattice } from '@/pages/landing/LandingPageLattice';
import { LandingPageSaaS } from '@/pages/landing/LandingPageSaaS';
import { LandingPageStudio } from '@/pages/landing/LandingPageStudio';
import { LandingPageNorthstar } from '@/pages/landing/LandingPageNorthstar';
import { LandingPageRushes } from '@/pages/landing/LandingPageRushes';

export const landingEntries: DocEntry[] = [
  {
    slug: 'video-editor-landing',
    name: 'AI Video Editor Landing',
    description: 'A white, editorial landing page for an AI video editor: a working editor in the hero (transcript, dithered player, AI Director, multitrack timeline), live bento demos, dithered art, pricing and FAQ.',
    badge: 'New',
    page: LandingPageRushes,
  },
  {
    slug: 'agent-platform-landing',
    name: 'AI Agent Platform Landing',
    description: 'A framed, grid-lined landing page for an AI dev product: auto-advancing feature tabs, live agent demos, constellation, marquee testimonials, pricing and FAQ.',
    badge: 'New',
    page: LandingPageNorthstar,
  },
  {
    slug: 'saas-landing',
    name: 'SaaS Landing Page',
    description: 'A premium SaaS product landing page with hero, features, pricing, testimonials and dither footer.',
    badge: 'New',
    page: LandingPageSaaS,
  },
  {
    slug: 'studio-landing',
    name: 'Studio Landing Page',
    description: 'A design studio landing page with editorial hero, selected work, process, pricing and dither footer.',
    badge: 'New',
    page: LandingPageStudio,
  },
  {
    slug: 'wealth-landing',
    name: 'Wealth Landing Page',
    description: 'A warm, editorial light-theme fintech landing page with bento features, sticky steps, pricing toggle and story carousel.',
    badge: 'New',
    page: LandingPageAurelia,
  },
  {
    slug: 'design-tool-landing',
    name: 'AI Design Tool Landing',
    description: 'A Figma-style landing page with a live, interactive canvas editor, AI generation, multiplayer, prototyping and Dev Mode.',
    badge: 'New',
    page: LandingPageLattice,
  },
  {
    slug: 'social-scheduler-landing',
    name: 'Social Scheduler Landing',
    description: 'A warm, animated landing page for a social media scheduling app with real network logos, live composer previews, heatmaps and analytics.',
    badge: 'New',
    page: LandingPageCadence,
  },
  {
    slug: 'ai-data-landing',
    name: 'AI Data Company Landing',
    description: 'A dark editorial landing page for an AI training data company with a dataset catalog, sample explorer, pipeline and compliance story.',
    badge: 'New',
    page: LandingPageCorpus,
  },
];
