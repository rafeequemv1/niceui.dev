import type { DocEntry } from '@/docs/types';
import { AgentHandoffDemo } from '@/components/ai/AgentHandoff';
import { PlanReviewDemo } from '@/components/ai/PlanReview';
import { KnowledgeBaseDemo } from '@/components/ai/KnowledgeBase';
import { AgentBuilderDemo } from '@/components/ai/AgentBuilder';
import { ModelCompareDemo } from '@/components/ai/ModelCompare';

export const agentBuildEntries: DocEntry[] = [
  {
    slug: 'agent-handoff',
    name: 'Agent Handoff',
    description: 'A multi-agent thread where a triage agent hands the conversation to specialists, showing the context each handoff carries.',
    badge: 'New',
    demos: [
      {
        title: 'Triage to Billing to Technical',
        description: 'Ownership moves along the breadcrumb as each specialist takes over. Replay when it resolves.',
        component: AgentHandoffDemo,
        height: 620,
        code: `import { AgentHandoff, type HandoffAgent } from '@/components/ai/AgentHandoff';
import { CreditCard, Route, Wrench } from 'lucide-react';

const agents: HandoffAgent[] = [
  { id: 'triage', name: 'Triage', role: 'Routes requests', icon: Route, tone: 'violet' },
  { id: 'billing', name: 'Billing', role: 'Refunds and invoices', icon: CreditCard, tone: 'emerald' },
  { id: 'tech', name: 'Technical', role: 'API and integrations', icon: Wrench, tone: 'sky' },
];

<AgentHandoff
  agents={agents}
  typing={run.activeAgent}
  resolved={run.status === 'resolved'}
  events={[
    { type: 'user', text: 'I was charged twice this month.' },
    { type: 'handoff', from: 'triage', to: 'billing', reason: 'Context passed to Billing', context: ['Invoice #4821'] },
    { type: 'agent', agent: 'billing', text: 'Refund issued.', tool: { name: 'billing.refund', duration: '0.8s' } },
  ]}
/>`,
      },
    ],
    props: [
      { name: 'agents', type: 'HandoffAgent[]', description: 'Agents with name, role, icon and a color tone. The first one owns the thread at the start.' },
      { name: 'events', type: 'HandoffEvent[]', description: 'User messages, agent messages (with an optional tool chip) and handoffs with the context passed along.' },
      { name: 'typing', type: 'string | null', description: 'Id of the agent currently replying; shows a typing row.' },
      { name: 'resolved', type: 'boolean', default: 'false', description: 'Switches the header pill from Live to Resolved.' },
      { name: 'onReplay', type: '() => void', description: 'Shows a replay button once resolved.' },
    ],
  },
  {
    slug: 'plan-review',
    name: 'Plan Review',
    description: 'An editable agent plan: rewrite, reorder, skip or add steps, request changes, then approve and watch it run.',
    badge: 'New',
    demos: [
      {
        title: 'Approve before the agent acts',
        description: 'Click a step to edit it, use the arrows to reorder, untick to skip. Request changes to see the agent revise.',
        component: PlanReviewDemo,
        height: 560,
        code: `import { PlanReview } from '@/components/ai/PlanReview';

<PlanReview
  title="Migrate auth to OAuth"
  steps={[
    { id: 'audit', text: 'Audit the current auth middleware', duration: 1100 },
    { id: 'flag', text: 'Add the OAuth provider behind a feature flag', duration: 1300 },
    { id: 'tests', text: 'Write integration tests for login and refresh', duration: 1200 },
  ]}
  revision={{ after: 2, text: 'Add a one-click rollback' }}
/>`,
      },
    ],
    props: [
      { name: 'title', type: 'string', description: 'What the plan is for, shown under the header.' },
      { name: 'steps', type: 'PlanStep[]', description: 'Steps with id, text, optional enabled flag and simulated duration in ms.' },
      { name: 'revision', type: '{ after: number; text: string }', description: 'The step the agent inserts when changes are requested.' },
      { name: 'className', type: 'string', description: 'Extra classes for the card.' },
    ],
  },
  {
    slug: 'knowledge-base',
    name: 'Knowledge Base',
    description: 'Sources that index through upload, parse, chunk and embed, with a retrieval tester that scores and highlights matching chunks.',
    badge: 'New',
    demos: [
      {
        title: 'Index and test retrieval',
        description: 'Add a file to watch it index. Retrieval only searches sources that are ready, so try “Enterprise pricing” before and after.',
        component: KnowledgeBaseDemo,
        height: 620,
        code: `import { KnowledgeBase } from '@/components/ai/KnowledgeBase';

<KnowledgeBase
  name="Support knowledge"
  files={sources}          // { name, kind, size, units, chunks, tokens, stage }
  chunks={indexedChunks}   // { file, where, text }
  library={uploadable}
  examples={['How do refunds work?', 'API rate limits']}
  defaultQuery="How do refunds work?"
/>`,
      },
    ],
    props: [
      { name: 'name', type: 'string', description: 'Knowledge base title.' },
      { name: 'files', type: 'KbFile[]', description: 'Sources with counts and a stage from 0 to 4 (upload, parse, chunk, embed, ready).' },
      { name: 'chunks', type: 'KbChunk[]', description: 'Indexed passages searched by the retrieval tester.' },
      { name: 'library', type: 'KbFile[]', description: 'Files offered in the Add menu.' },
      { name: 'examples', type: 'string[]', description: 'Example queries shown as chips.' },
      { name: 'defaultQuery', type: 'string', description: 'Query run on mount.' },
    ],
  },
  {
    slug: 'agent-builder',
    name: 'Agent Builder',
    description: 'A no-code agent builder with identity, instructions, model, tools, knowledge and creativity, beside a live test chat.',
    badge: 'New',
    demos: [
      {
        title: 'Configure and test',
        description: 'Change the name, tools or creativity and watch the greeting and tone update. Send a test message, then publish.',
        component: AgentBuilderDemo,
        height: 660,
        code: `import { AgentBuilder } from '@/components/ai/AgentBuilder';

<AgentBuilder
  initial={{
    name: 'Onboarding Buddy',
    avatar: 0,
    instructions: 'Help new hires through their first two weeks.',
    model: 'Nova Pro',
    tools: { web: false, calendar: true, code: false, knowledge: true },
    files: ['it-setup.md', 'handbook.pdf'],
    creativity: 45,
  }}
/>`,
      },
    ],
    props: [
      { name: 'initial', type: 'AgentConfig', description: 'Starting name, avatar, instructions, model, tools, files and creativity (0–100).' },
      { name: 'className', type: 'string', description: 'Extra classes for the builder.' },
    ],
  },
  {
    slug: 'model-compare',
    name: 'Model Compare',
    description: 'A blind side-by-side: two models stream the same prompt with live speed and cost, you vote, then their names are revealed.',
    badge: 'New',
    demos: [
      {
        title: 'Blind arena',
        description: 'Both answers stream at their own speed. Vote to reveal which model wrote which, or rerun.',
        component: ModelCompareDemo,
        height: 560,
        code: `import { ModelCompare } from '@/components/ai/ModelCompare';

<ModelCompare
  prompt="Explain vector databases to a product manager in three bullets."
  a={{ model: 'Atlas Reasoner', answer: answerA, ttft: 520, tps: 58, price: 12 }}
  b={{ model: 'Nova Mini', answer: answerB, ttft: 190, tps: 124, price: 0.6 }}
/>`,
      },
    ],
    props: [
      { name: 'prompt', type: 'string', description: 'The prompt both models answer.' },
      { name: 'a / b', type: 'CompareSide', description: 'Model name (hidden until the vote), answer text, time to first token, tokens per second and price per 1M tokens.' },
      { name: 'className', type: 'string', description: 'Extra classes for the wrapper.' },
    ],
  },
];
