import type { DocEntry } from '@/docs/types';
import { AssistantApp } from '@/pages/apps/assistant/AssistantApp';
import { crmTemplateEntries } from './crm-template';
import { contentTemplateEntries } from './templates-docs/content';
import { siteTemplateEntries } from './templates-docs/sites';

export const appEntries: DocEntry[] = [
  ...crmTemplateEntries,
  ...siteTemplateEntries,
  ...contentTemplateEntries,
  {
    slug: 'ai-assistant',
    name: 'AI Chat Assistant',
    description: 'A complete chat assistant app with streaming, reasoning, web search, artifacts, image and video generation previews.',
    badge: 'New',
    page: AssistantApp,
  },
];
