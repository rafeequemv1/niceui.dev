import type { DocEntry } from '@/docs/types';
import { conversationEntries } from './ai-docs/conversation';
import { chatKitEntries } from './ai-docs/chat-kit';
import { agentEntries } from './ai-docs/agent';
import { agentControlEntries } from './ai-docs/agent-control';
import { agentOpsEntries } from './ai-docs/agent-ops';
import { agentGenEntries } from './ai-docs/agent-gen';
import { agentBuildEntries } from './ai-docs/agent-build';
import { experienceEntries } from './ai-docs/experience';

export const aiEntries: DocEntry[] = [...conversationEntries, ...chatKitEntries, ...agentEntries, ...agentOpsEntries, ...agentControlEntries, ...agentGenEntries, ...agentBuildEntries, ...experienceEntries];
