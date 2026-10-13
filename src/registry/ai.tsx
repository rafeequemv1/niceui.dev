import type { DocEntry } from '@/docs/types';
import { conversationEntries } from './ai-docs/conversation';
import { agentEntries } from './ai-docs/agent';
import { experienceEntries } from './ai-docs/experience';

export const aiEntries: DocEntry[] = [...conversationEntries, ...agentEntries, ...experienceEntries];
