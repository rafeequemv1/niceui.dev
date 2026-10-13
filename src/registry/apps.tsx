import type { DocEntry } from '@/docs/types';
import { AssistantApp } from '@/pages/apps/assistant/AssistantApp';

export const appEntries: DocEntry[] = [
  {
    slug: 'ai-assistant',
    name: 'AI Chat Assistant',
    description: 'A complete chat assistant app with streaming, reasoning, web search, artifacts, image and video generation previews.',
    badge: 'New',
    page: AssistantApp,
  },
];
