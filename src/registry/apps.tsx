import type { DocEntry } from '@/docs/types';
import { AssistantApp } from '@/pages/apps/assistant/AssistantApp';
import { crmTemplateEntries } from './crm-template';

export const appEntries: DocEntry[] = [
  ...crmTemplateEntries,
  {
    slug: 'ai-assistant',
    name: 'AI Chat Assistant',
    description: 'A complete chat assistant app with streaming, reasoning, web search, artifacts, image and video generation previews.',
    badge: 'New',
    page: AssistantApp,
  },
];
