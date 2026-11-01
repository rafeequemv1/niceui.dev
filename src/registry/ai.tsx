import type { DocEntry } from '@/docs/types';
import { conversationEntries } from './ai-docs/conversation';
import { chatKitEntries } from './ai-docs/chat-kit';
import { agentEntries } from './ai-docs/agent';
import { agentControlEntries } from './ai-docs/agent-control';
import { agentOpsEntries } from './ai-docs/agent-ops';
import { agentGenEntries } from './ai-docs/agent-gen';
import { agentBuildEntries } from './ai-docs/agent-build';
import { experienceEntries } from './ai-docs/experience';
import { thinkingAEntries } from './ai-docs/thinking-a';
import { thinkingBEntries } from './ai-docs/thinking-b';
import { inlineEntries } from './ai-docs/inline';
import { errorEntries } from './ai-docs/errors';
import { ioEntries } from './ai-docs/io';

export const aiEntries: DocEntry[] = [...conversationEntries, ...chatKitEntries, ...agentEntries, ...agentOpsEntries, ...agentControlEntries, ...agentGenEntries, ...agentBuildEntries, ...experienceEntries, ...thinkingAEntries, ...thinkingBEntries, ...inlineEntries, ...errorEntries, ...ioEntries];
