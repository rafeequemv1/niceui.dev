import type { DocEntry } from '@/docs/types';
import { AgentActivityDemo } from '@/components/ai/AgentActivity';
import { AgentLoadingDemo } from '@/components/ai/AgentLoading';
import { ImageGenerationDemo } from '@/components/ai/ImageGeneration';
import { ChatAppDemo } from '@/components/ai/ChatApp';
import { AISidebarDemo } from '@/components/ai/AISidebar';

export const experienceEntries: DocEntry[] = [
  {
    slug: 'agent-activity',
    name: 'Agent Activity',
    description: 'A live vertical timeline of what the agent is doing, with per-step elapsed timers.',
    demos: [
      {
        title: 'Research run',
        description: 'Steps appear as the agent thinks, searches, reads and writes.',
        component: AgentActivityDemo,
        height: 460,
        code: `import { AgentActivity } from '@/components/ai/AgentActivity';

const steps = [
  { kind: 'thinking', title: 'Planning the comparison', duration: 1600 },
  { kind: 'searching', title: 'Searching 3 providers', detail: 'neon.tech · supabase.com', duration: 2200 },
  { kind: 'reading', title: 'Reading pricing pages', detail: '8 pages', duration: 2400 },
  { kind: 'writing', title: 'Drafting the summary table', duration: 2000 },
];

<AgentActivity steps={steps} />`,
      },
    ],
    props: [
      { name: 'steps', type: 'ActivityStep[]', description: "List of { kind, title, detail?, duration } where kind is 'thinking' | 'searching' | 'reading' | 'writing'." },
      { name: 'onComplete', type: '() => void', description: 'Called once every step has finished.' },
      { name: 'showRestart', type: 'boolean', default: 'true', description: 'Show the restart button in the header.' },
      { name: 'className', type: 'string', description: 'Extra classes for the card.' },
    ],
  },
  {
    slug: 'agent-loading',
    name: 'Agent Loading States',
    description: 'Six loading indicators for agents: shimmer text, dot pulse, equalizer, orbit, skeleton and typing.',
    demos: [
      {
        title: 'Gallery',
        component: AgentLoadingDemo,
        height: 420,
        code: `import {
  ThinkingShimmer,
  DotPulse,
  EqualizerBars,
  OrbitSpinner,
  SkeletonLines,
  TypingIndicator,
} from '@/components/ai/AgentLoading';

export function AssistantPending({ phase }) {
  if (phase === 'thinking') return <ThinkingShimmer label="Reasoning…" />;
  if (phase === 'voice') return <EqualizerBars bars={7} />;
  if (phase === 'drafting') return <SkeletonLines lines={4} />;
  return <TypingIndicator />;
}`,
      },
    ],
    props: [
      { name: 'label', type: 'string', default: "'Thinking…'", description: 'ThinkingShimmer: text to shimmer.' },
      { name: 'bars', type: 'number', default: '7', description: 'EqualizerBars: number of bars.' },
      { name: 'lines', type: 'number', default: '4', description: 'SkeletonLines: number of placeholder lines.' },
      { name: 'className', type: 'string', description: 'Extra classes on every indicator.' },
    ],
  },
  {
    slug: 'image-generation',
    name: 'Image Generation',
    description: 'A prompt-to-image flow with progressive blur-to-sharp reveals and a 2×2 variation grid.',
    demos: [
      {
        title: 'Variations',
        description: 'Pick a preset or type a prompt. Images sharpen as progress climbs.',
        component: ImageGenerationDemo,
        height: 620,
        code: `import { GeneratedImage } from '@/components/ai/ImageGeneration';

export function Variations({ job }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {job.variations.map((v, i) => (
        <GeneratedImage
          key={v.id}
          palette={v.palette}
          seed={v.seed}
          progress={v.progress}
          selected={job.selected === i}
          onSelect={() => job.select(i)}
        />
      ))}
    </div>
  );
}`,
      },
    ],
    props: [
      { name: 'progress', type: 'number', description: '0–1. Drives blur, saturation, scale and the % badge.' },
      { name: 'palette', type: 'string[]', description: 'Four colors used to paint the gradient mesh.' },
      { name: 'seed', type: 'number', description: 'Varies gradient positions between variations.' },
      { name: 'selected', type: 'boolean', description: 'Shows a selection ring.' },
      { name: 'onSelect', type: '() => void', description: 'Called when a finished image is clicked.' },
    ],
  },
  {
    slug: 'chat-app',
    name: 'Chat App',
    description: 'A complete chat experience with a conversation sidebar, streaming replies and a rich composer.',
    badge: 'New',
    demos: [
      {
        title: 'Full chat',
        description: 'Send a message to see the assistant think, then stream. Switch conversations or start a new chat.',
        component: ChatAppDemo,
        height: 640,
        code: `import { ChatApp } from '@/components/ai/ChatApp';

export default function AssistantPage() {
  return (
    <main className="h-screen p-4">
      <ChatApp className="h-full" />
    </main>
  );
}

// Composed from:
// MessageBubble · PromptInput · TypingIndicator · useStream + Markdown`,
      },
    ],
    props: [
      { name: 'conversations', type: 'Convo[]', description: 'Initial conversations: { id, title, group, messages }.' },
      { name: 'replies', type: 'string[]', description: 'Markdown replies streamed in rotation (swap for your model call).' },
      { name: 'defaultSidebarOpen', type: 'boolean', default: 'true', description: 'Initial state of the conversation sidebar on md+ screens.' },
      { name: 'className', type: 'string', description: 'Extra classes; override the default 560px height here.' },
    ],
  },
  {
    slug: 'ai-sidebar',
    name: 'AI Sidebar',
    description: 'A collapsible copilot panel beside a document, with suggestions that apply directly to the text.',
    demos: [
      {
        title: 'Writing copilot',
        description: 'Hover a suggestion to see what it targets, then apply it to the doc.',
        component: AISidebarDemo,
        height: 560,
        code: `import { AISidebar } from '@/components/ai/AISidebar';

export function DocEditor() {
  return (
    <div className="h-[600px]">
      <AISidebar className="h-full" />
    </div>
  );
}

// Each suggestion is a pure transform over document blocks:
const tldr = {
  title: 'Add a TL;DR',
  after: 'Teams +38%, Slack launched, billing incident resolved.',
  apply: (blocks) => [{ id: 'tldr', kind: 'tldr', text: summary }, ...blocks],
};`,
      },
    ],
    props: [
      { name: 'title', type: 'string', default: "'Q3 Product Update'", description: 'Document title.' },
      { name: 'defaultOpen', type: 'boolean', default: 'true', description: 'Whether the copilot panel starts expanded.' },
      { name: 'onApply', type: '(suggestionId: string) => void', description: 'Called when a suggestion is applied.' },
      { name: 'className', type: 'string', description: 'Extra classes for the editor shell.' },
    ],
  },
];
