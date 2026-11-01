import type { DocEntry } from '@/docs/types';
import { ThinkingTextDemo } from '@/components/ai/thinking/ThinkingText';
import { ScrambleStatusDemo } from '@/components/ai/thinking/ScrambleStatus';
import { RotatingStatusDemo } from '@/components/ai/thinking/RotatingStatus';
import { AgentStatusRingDemo } from '@/components/ai/thinking/AgentStatusRing';
import { ThinkingStatesDemo } from '@/components/ai/thinking/ThinkingStates';
import { GradientBlobDemo } from '@/components/ai/thinking/GradientBlob';

export const thinkingBEntries: DocEntry[] = [
  {
    slug: 'thinking-text',
    name: 'Thinking Text',
    description: 'A "Thinking…" label with a shimmer sweep, a letter-by-letter glint or a gentle wave.',
    badge: 'New',
    demos: [
      {
        title: 'Three variants',
        component: ThinkingTextDemo,
        height: 320,
        code: `import { ThinkingText } from '@/components/ai/thinking/ThinkingText';

{isThinking && <ThinkingText variant="gradient" />}
<ThinkingText variant="wave" text="Working on it…" />`,
      },
    ],
    props: [
      { name: 'text', type: 'string', default: "'Thinking…'", description: 'Label to animate.' },
      { name: 'variant', type: "'gradient' | 'glint' | 'wave'", default: "'gradient'", description: 'Sweep, per-letter glint or bobbing letters.' },
      { name: 'duration', type: 'number', default: '2', description: 'Seconds per cycle.' },
    ],
  },
  {
    slug: 'scramble-status',
    name: 'Scramble Status',
    description: 'A status label that scramble-decodes into place each time its text changes.',
    badge: 'New',
    demos: [
      {
        title: 'Agent steps',
        component: ScrambleStatusDemo,
        height: 260,
        code: `import { ScrambleStatus } from '@/components/ai/thinking/ScrambleStatus';

<ScrambleStatus text={run.currentStep} />`,
      },
    ],
    props: [
      { name: 'text', type: 'string', description: 'Current status; changing it triggers the decode.' },
      { name: 'duration', type: 'number', default: '650', description: 'Decode time in ms.' },
    ],
  },
  {
    slug: 'rotating-status',
    name: 'Rotating Status',
    description: 'Cycles through what the agent is doing with an icon per step, a soft slide-and-blur and an elapsed timer.',
    badge: 'New',
    demos: [
      {
        title: 'Search, read, write',
        component: RotatingStatusDemo,
        height: 260,
        code: `import { RotatingStatus } from '@/components/ai/thinking/RotatingStatus';
import { BookOpen, PenLine, Search } from 'lucide-react';

<RotatingStatus
  loop={false}
  steps={[
    { label: 'Searching the web…', icon: Search, ms: 1600 },
    { label: 'Reading 4 sources…', icon: BookOpen, ms: 1900 },
    { label: 'Writing the answer…', icon: PenLine, ms: 1700 },
  ]}
/>`,
      },
    ],
    props: [
      { name: 'steps', type: '{ label: string; icon: LucideIcon; ms: number }[]', description: 'Steps and how long each shows.' },
      { name: 'doneLabel', type: 'string', default: "'Done'", description: 'Shown after the last step.' },
      { name: 'loop', type: 'boolean', default: 'true', description: 'Start over after finishing.' },
    ],
  },
  {
    slug: 'agent-status-ring',
    name: 'Agent Avatar Status',
    description: 'An agent avatar with a ring that spins, breathes or settles for idle, thinking, tool use, waiting, done and error.',
    badge: 'New',
    demos: [
      {
        title: 'Six states',
        component: AgentStatusRingDemo,
        height: 380,
        code: `import { AgentStatusRing } from '@/components/ai/thinking/AgentStatusRing';

<AgentStatusRing state={agent.state} initials="Ny" size={40} />`,
      },
    ],
    props: [
      { name: 'state', type: "'idle' | 'thinking' | 'tool' | 'waiting' | 'done' | 'error'", description: 'Drives ring motion, colour and badge.' },
      { name: 'initials', type: 'string', default: "'AI'", description: 'Avatar text.' },
      { name: 'size', type: 'number', default: '56', description: 'Diameter in px.' },
    ],
  },
  {
    slug: 'thinking-states',
    name: 'Thinking → Done',
    description: 'One indicator that morphs from a resting dot to a sweeping arc, orbiting dots, a drawn check or a cross.',
    badge: 'New',
    demos: [
      {
        title: 'Morphing states',
        component: ThinkingStatesDemo,
        height: 340,
        code: `import { ThinkingStates } from '@/components/ai/thinking/ThinkingStates';

<ThinkingStates state={status} size={20} />`,
      },
    ],
    props: [
      { name: 'state', type: "'idle' | 'thinking' | 'tool' | 'done' | 'error'", description: 'Current state; changes animate.' },
      { name: 'size', type: 'number', default: '40', description: 'Size in px.' },
    ],
  },
  {
    slug: 'gradient-blob',
    name: 'Gradient Blob',
    description: 'A soft morphing gradient blob that speeds up while thinking and settles when done, from 16 to 160px.',
    badge: 'New',
    demos: [
      {
        title: 'Idle, thinking, done',
        component: GradientBlobDemo,
        height: 440,
        code: `import { GradientBlob } from '@/components/ai/thinking/GradientBlob';

<GradientBlob mode={busy ? 'thinking' : 'done'} size={24} />`,
      },
    ],
    props: [
      { name: 'mode', type: "'idle' | 'thinking' | 'done'", default: "'thinking'", description: 'Colour and speed.' },
      { name: 'size', type: 'number', default: '96', description: 'Size in px.' },
    ],
  },
];
