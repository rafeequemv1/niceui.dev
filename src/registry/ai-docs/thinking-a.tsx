import type { DocEntry } from '@/docs/types';
import { GridFlickerDemo } from '@/components/ai/thinking/GridFlicker';
import { ThinkingOrbsDemo } from '@/components/ai/thinking/ThinkingOrbs';
import { ThinkingRingsDemo } from '@/components/ai/thinking/ThinkingRings';
import { DotWaveDemo } from '@/components/ai/thinking/DotWave';
import { ScanLineDemo } from '@/components/ai/thinking/ScanLine';
import { BrailleSpinnerDemo } from '@/components/ai/thinking/BrailleSpinner';

const stateProp = { name: 'state', type: "'idle' | 'thinking' | 'done'", default: "'thinking'", description: 'Idle dims and pauses, thinking animates, done settles.' };
const toneProp = { name: 'tone', type: "'sky' | 'violet' | 'emerald' | 'amber' | 'white'", default: "'sky'", description: 'Colour family.' };
const sizeProp = { name: 'size', type: 'number', default: '20', description: 'Size in px. Works from 12 to 64.' };

export const thinkingAEntries: DocEntry[] = [
  {
    slug: 'grid-flicker',
    name: 'Grid Flicker',
    description: 'A tiny dot grid that flickers in waves, snakes, ripples or random sparks while the agent thinks.',
    badge: 'New',
    demos: [
      {
        title: 'Patterns and sizes',
        description: 'Switch the pattern and grid density. It sits inline next to a status line.',
        component: GridFlickerDemo,
        height: 440,
        code: `import { GridFlicker } from '@/components/ai/thinking/GridFlicker';

<div className="flex items-center gap-2">
  <GridFlicker size={16} grid={3} pattern="ripple" state={busy ? 'thinking' : 'done'} />
  <span className="text-sm text-ink-300">Planning the migration…</span>
</div>`,
      },
    ],
    props: [sizeProp, { name: 'grid', type: '3 | 4 | 5', default: '3', description: 'Cells per side.' }, { name: 'pattern', type: "'wave' | 'snake' | 'random' | 'ripple'", default: "'wave'", description: 'How the cells light up.' }, toneProp, stateProp],
  },
  {
    slug: 'thinking-orbs',
    name: 'Thinking Orbs',
    description: 'Four small orbs for agent status: breathing, glass with a travelling highlight, dithered and a morphing blob.',
    badge: 'New',
    demos: [
      {
        title: 'Variants and states',
        description: 'Try idle, thinking and done for each orb.',
        component: ThinkingOrbsDemo,
        height: 440,
        code: `import { ThinkingOrb } from '@/components/ai/thinking/ThinkingOrbs';

<ThinkingOrb size={18} variant="glass" tone="violet" state="thinking" />`,
      },
    ],
    props: [sizeProp, { name: 'variant', type: "'breathing' | 'glass' | 'dithered' | 'blob'", default: "'breathing'", description: 'Orb style.' }, toneProp, stateProp],
  },
  {
    slug: 'thinking-rings',
    name: 'Thinking Rings',
    description: 'Ring spinners for tool calls and searches: gradient arc, orbiting dots, pulsing halo and a radar sweep, with a done check.',
    badge: 'New',
    demos: [
      {
        title: 'Variants and states',
        description: 'Done swaps the ring for a check in the same footprint.',
        component: ThinkingRingsDemo,
        height: 440,
        code: `import { ThinkingRing } from '@/components/ai/thinking/ThinkingRings';

<ThinkingRing size={16} variant="sweep" state={call.status === 'running' ? 'thinking' : 'done'} />`,
      },
    ],
    props: [sizeProp, { name: 'variant', type: "'arc' | 'orbit' | 'halo' | 'sweep'", default: "'arc'", description: 'Ring style.' }, toneProp, stateProp],
  },
  {
    slug: 'dot-wave',
    name: 'Dot Wave',
    description: 'Typing-style dots and bars that wave, bounce, fade or pulse like an equaliser.',
    badge: 'New',
    demos: [
      {
        title: 'Variants and states',
        description: 'Use it inside a message bubble while a reply is on its way.',
        component: DotWaveDemo,
        height: 440,
        code: `import { DotWave } from '@/components/ai/thinking/DotWave';

<span className="rounded-2xl bg-white/5 px-3 py-2">
  <DotWave size={10} variant="bounce" />
</span>`,
      },
    ],
    props: [{ name: 'size', type: 'number', default: '20', description: 'Height in px.' }, { name: 'variant', type: "'wave' | 'bounce' | 'fade' | 'bars'", default: "'wave'", description: 'Motion style.' }, { name: 'dots', type: 'number', default: '3', description: 'Number of dots or bars.' }, toneProp, stateProp],
  },
  {
    slug: 'scan-line',
    name: 'Scan Line',
    description: 'A soft light that scans across whatever the agent is reading: a document, a card or a skeleton.',
    badge: 'New',
    demos: [
      {
        title: 'Reading a document',
        description: 'Wrap any block. Shimmer works well over skeletons.',
        component: ScanLineDemo,
        height: 480,
        code: `import { ScanLine } from '@/components/ai/thinking/ScanLine';

<ScanLine variant="line" state={reading ? 'thinking' : 'done'} className="rounded-2xl bg-ink-900 p-4">
  <DocumentPreview file={file} />
</ScanLine>`,
      },
    ],
    props: [{ name: 'variant', type: "'line' | 'shimmer'", default: "'line'", description: 'A scanning line or a diagonal shimmer.' }, { name: 'speed', type: 'number', default: '1.8', description: 'Seconds per pass.' }, toneProp, stateProp, { name: 'children', type: 'ReactNode', description: 'The block being scanned.' }],
  },
  {
    slug: 'braille-spinner',
    name: 'Terminal Spinners',
    description: 'Unicode spinners in the style of command-line coding agents, with labels, elapsed time and done ticks.',
    badge: 'New',
    demos: [
      {
        title: 'Agent run in a terminal',
        description: 'Braille, dots, line, arc and star frames. Done steps show a tick.',
        component: BrailleSpinnerDemo,
        height: 480,
        code: `import { BrailleSpinner } from '@/components/ai/thinking/BrailleSpinner';

<BrailleSpinner kind="braille" label="Editing middleware…" elapsed />
<BrailleSpinner state="done" label="Read src/api/upload.ts" />`,
      },
    ],
    props: [{ name: 'kind', type: "'braille' | 'dots' | 'line' | 'arc' | 'star'", default: "'braille'", description: 'Frame set.' }, { name: 'size', type: 'number', default: '14', description: 'Font size in px.' }, { name: 'label', type: 'string', description: 'Text after the spinner.' }, { name: 'elapsed', type: 'boolean', default: 'false', description: 'Show seconds elapsed and an interrupt hint.' }, toneProp, stateProp],
  },
];
