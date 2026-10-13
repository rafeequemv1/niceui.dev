import type { DocEntry } from '@/docs/types';
import { HomePage } from '@/pages/intro/HomePage';
import { GuidesPage } from '@/pages/intro/GuidesPage';
import { MotionGuidesPage } from '@/pages/intro/MotionGuidesPage';
import { AgentGuidePage } from '@/pages/intro/AgentGuidePage';
import { OpenUIPage } from '@/pages/intro/OpenUIPage';

export const introEntries: DocEntry[] = [
  { slug: 'home', name: 'Home', description: 'The NiceUI landing page — a showcase of the library.', page: HomePage },
  { slug: 'guides', name: 'Guides', description: 'Install, configure and start building with NiceUI.', page: GuidesPage },
  { slug: 'motion-guides', name: 'Motion Guides', description: 'The animation patterns behind every component.', page: MotionGuidesPage },
  { slug: 'agent-guide', name: 'Agent Guide', description: 'Patterns for building trustworthy AI agent interfaces.', page: AgentGuidePage },
  { slug: 'openui', name: 'OpenUI', description: 'The design system: tokens, color ramps, and architecture.', page: OpenUIPage },
];
