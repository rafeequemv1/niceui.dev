import type { Section } from '@/docs/types';
import { introEntries } from './intro';
import { landingEntries } from './landing';
import { appEntries } from './apps';
import { exampleEntries } from './examples';
import { aiEntries } from './ai';
import { crmEntries } from './crm';
import { galleryEntries } from './gallery';
import { designControlEntries } from './design-docs/controls';
import { effectEntries } from './effects';
import { appAuthEntries } from './app-docs/auth';
import { appPageEntries } from './app-docs/pages';
import { chartEntries } from './chart-docs/charts';
import { commerceEntries } from './commerce-docs/shop';
import { coreEntries } from './components-core';
import { motionEntries } from './components-motion';
import { blockEntries } from './blocks';
import { footerEntries } from './footers';
import { heroEntries } from './marketing-docs/heroes';
import { scenicHeroEntries } from './marketing-docs/heroes-scenic';
import { showcaseEntries } from './marketing-docs/showcase';
import { conversionEntries } from './marketing-docs/conversion';
import { navbarEntries } from './marketing-docs/navbars';
import { pointerEntries } from './effects-docs/pointer';
import { controlsExtraEntries } from './core-docs/controls-extra';
import { controlsMoreEntries } from './core-docs/controls-more';
import { controlsBasicEntries } from './core-docs/controls-basics';
import { patternEntries } from './patterns-docs/patterns';
import { isometricEntries } from './isometric-docs/isometric';

export const sections: Section[] = [
  { id: 'intro', title: 'Intro', entries: introEntries },
  { id: 'landing', title: 'Landing Pages', entries: landingEntries },
  { id: 'apps', title: 'App Templates', entries: appEntries },
  { id: 'examples', title: 'Dashboards', entries: exampleEntries },
  { id: 'ai', title: 'AI Agents', entries: aiEntries },
  { id: 'crm', title: 'CRM', entries: crmEntries },
  { id: 'application', title: 'Application', entries: [...appAuthEntries, ...appPageEntries] },
  { id: 'charts', title: 'Charts', entries: chartEntries },
  { id: 'commerce', title: 'E-commerce', entries: commerceEntries },
  { id: 'design', title: 'Design Tools', entries: designControlEntries },
  { id: 'gallery', title: 'Gallery', entries: galleryEntries },
  { id: 'effects', title: 'Effects', entries: [...effectEntries, ...pointerEntries] },
  { id: 'patterns', title: 'Patterns', entries: patternEntries },
  { id: 'isometric', title: 'Isometric', entries: isometricEntries },
  { id: 'components', title: 'Components', entries: [...coreEntries, ...motionEntries, ...controlsExtraEntries, ...controlsMoreEntries, ...controlsBasicEntries] },
  { id: 'blocks', title: 'Blocks', entries: blockEntries },
  { id: 'marketing', title: 'Marketing', entries: [...heroEntries, ...scenicHeroEntries, ...navbarEntries, ...showcaseEntries, ...conversionEntries] },
  { id: 'footers', title: 'Footers', entries: footerEntries },
];

const flat = sections.flatMap((section) => section.entries.map((entry) => ({ section, entry })));

export function resolveRoute(path: string) {
  const [, sectionId, slug] = path.split('/');
  const index = flat.findIndex((f) => f.section.id === sectionId && f.entry.slug === slug);
  const i = index === -1 ? 0 : index;
  return {
    found: index !== -1 || path === '/',
    current: flat[i],
    prev: i > 0 ? flat[i - 1] : null,
    next: i < flat.length - 1 ? flat[i + 1] : null,
  };
}
