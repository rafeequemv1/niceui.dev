import type { DocEntry, PropDef } from '@/docs/types';
import { AgentRunCardDemo } from '@/components/isometric/AgentRunCard';
import { SupportBotCardDemo } from '@/components/isometric/SupportBotCard';
import { VoiceAgentCardDemo } from '@/components/isometric/VoiceAgentCard';
import { RagPipelineCardDemo } from '@/components/isometric/RagPipelineCard';
import { GpuClusterCardDemo } from '@/components/isometric/GpuClusterCard';
import { FineTuneCardDemo } from '@/components/isometric/FineTuneCard';
import { IsoKitDemo } from '@/components/isometric/IsoKitDemo';

const common: PropDef[] = [
  { name: 'title', type: 'string', description: 'Card title, top left.' },
  { name: 'tag', type: 'string', description: 'The ID chip, top right.' },
  { name: 'status', type: 'string', description: 'Status line next to the clock icon.' },
  { name: 'action', type: 'string', description: 'Label of the action button.' },
  { name: 'onAction', type: '() => void', description: 'Called when the action button is pressed.' },
  { name: 'accent', type: 'string', default: "'#ff6b35'", description: 'Highlight colour for the active part, the callout code and the button.' },
  { name: 'stats', type: 'Array<{ label: string; value: string; pct: number; strong?: boolean }>', description: 'Rows painted on the floor. pct (0–1) sets the bar length; strong makes a row brighter.' },
];
const height = 620;
const note = 'Hover or focus a part to move the callout to it. Plain SVG, no 3D library.';

export const isometricEntries: DocEntry[] = [
  {
    slug: 'agent-run',
    name: 'Agent Run Card',
    description: 'An isometric AI agent card: a planner core with search, browser, code and email tools plugged in, live step count, token and cost stats, and an approve button.',
    badge: 'New',
    demos: [{ title: 'Agent run', description: note, component: AgentRunCardDemo, height, code: `import { AgentRunCard } from '@/components/isometric/AgentRunCard';\n\n<AgentRunCard step={9} steps={14} action="Approve step" onAction={approve} />` }],
    props: [...common, { name: 'step', type: 'number', default: '9', description: 'Current step.' }, { name: 'steps', type: 'number', default: '14', description: 'Total steps in the plan.' }],
  },
  {
    slug: 'support-bot',
    name: 'Support Bot Card',
    description: 'An isometric chatbot card: a support robot with its live chat thread, resolution, handoff and CSAT stats painted on the floor, and a take-over button.',
    badge: 'New',
    demos: [{ title: 'Support bot', description: note, component: SupportBotCardDemo, height, code: `import { SupportBotCard } from '@/components/isometric/SupportBotCard';\n\n<SupportBotCard firstReply="1.2" action="Take over chat" />` }],
    props: [...common, { name: 'firstReply', type: 'string', default: "'1.2'", description: 'Median first reply time in seconds.' }],
  },
  {
    slug: 'voice-agent',
    name: 'Voice Agent Card',
    description: 'An isometric voice AI agent card: a smart speaker with a glowing mic ring, a live waveform on the floor, latency and call stats, and a listen-live button.',
    badge: 'New',
    demos: [{ title: 'Voice agent', description: note, component: VoiceAgentCardDemo, height, code: `import { VoiceAgentCard } from '@/components/isometric/VoiceAgentCard';\n\n<VoiceAgentCard latency={480} action="Listen live" />` }],
    props: [...common, { name: 'latency', type: 'number', default: '480', description: 'Voice-to-voice latency in ms.' }],
  },
  {
    slug: 'rag-pipeline',
    name: 'RAG Pipeline Card',
    description: 'An isometric RAG card: documents flow into a vector store and on to the answer model, with recall, hit rate and retrieval latency on the floor.',
    badge: 'New',
    demos: [{ title: 'Knowledge base', description: note, component: RagPipelineCardDemo, height, code: `import { RagPipelineCard } from '@/components/isometric/RagPipelineCard';\n\n<RagPipelineCard latency={142} action="Re-index" />` }],
    props: [...common, { name: 'latency', type: 'number', default: '142', description: 'Median retrieval time in ms.' }],
  },
  {
    slug: 'gpu-cluster',
    name: 'GPU Cluster Card',
    description: 'An isometric GPU cluster card: two server racks with a hot GPU blade, a coolant loop and checkpoint storage, per-GPU utilisation and a scale-up button.',
    badge: 'New',
    demos: [{ title: 'Training cluster', description: note, component: GpuClusterCardDemo, height, code: `import { GpuClusterCard } from '@/components/isometric/GpuClusterCard';\n\n<GpuClusterCard util={87} action="Scale up" />` }],
    props: [...common, { name: 'util', type: 'number', default: '87', description: 'Cluster utilisation in percent.' }],
  },
  {
    slug: 'fine-tune',
    name: 'Fine-tune Card',
    description: 'An isometric model training card: an AI chip with memory stacks and a loss curve drawn on the floor, step, token and ETA stats, and a stop-and-save button.',
    badge: 'New',
    demos: [{ title: 'Fine-tune', description: note, component: FineTuneCardDemo, height, code: `import { FineTuneCard } from '@/components/isometric/FineTuneCard';\n\n<FineTuneCard loss={[1, 0.6, 0.42, 0.31, 0.26, 0.22]} action="Stop & save" />` }],
    props: [...common, { name: 'loss', type: 'number[]', description: 'Loss values from first to latest, drawn as the floor curve. The last one is the big number.' }],
  },
  {
    slug: 'iso-kit',
    name: 'Isometric Kit',
    description: 'Build your own isometric UI cards: an SVG kit with boxes, cylinders, text on floors and walls, floor stat rows, chevrons and a spec callout with a leader line.',
    badge: 'New',
    demos: [
      {
        title: 'Inference queue, built from the kit',
        description: 'Every card in this section is made from these pieces.',
        component: IsoKitDemo,
        height,
        code: `import { IsoCard, IsoBox, IsoText, IsoStats, Callout, iso } from '@/components/isometric/IsoKit';

<IsoCard title="Inference queue" tag="Q-EU-1" status="eu-west · 13:02" action="Add worker">
  <g transform="translate(120 178)">
    <IsoBox x={120} y={10} w={60} d={60} h={44} hot />
    <IsoText at={[128, 52, 44]} size={13} fontWeight={700}>LLM</IsoText>
  </g>
</IsoCard>`,
      },
    ],
    props: [
      { name: 'iso(x, y, z)', type: '[number, number]', description: 'Projects a 3D point to the SVG plane (30° isometric).' },
      { name: '<IsoBox>', type: 'x y z w d h hot accent faces', description: 'A solid box. hot gives it the accent glow.' },
      { name: '<IsoCylinder>', type: 'x y z r h hot', description: 'A vertical cylinder.' },
      { name: '<IsoText>', type: "at plane: 'floor' | 'left' | 'right'", description: 'Text laid on the floor or painted on a wall.' },
      { name: '<IsoStats> / <IsoMetric>', type: 'at rows | value unit caption', description: 'Stat rows and a big number lying on the floor.' },
      { name: '<Callout>', type: 'x y data target side', description: 'Spec block with a leader line to the active part.' },
      { name: 'usePart(initial)', type: '[active, bind]', description: 'Hover, focus and click handling for parts.' },
    ],
  },
];
