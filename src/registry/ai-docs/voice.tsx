import type { DocEntry } from '@/docs/types';
import { DitherOrbDemo, DitherOrbPaletteDemo } from '@/components/ai/voice/DitherOrb';
import { DotGlobeDemo, DotGlobePillDemo } from '@/components/ai/voice/DotGlobe';
import { GridOrbDemo } from '@/components/ai/voice/GridOrb';

const size = (d: string) => ({ name: 'size', type: 'number', default: d, description: 'Width and height of the orb in CSS pixels.' });

const common = [
  { name: 'state', type: "'idle' | 'listening' | 'thinking' | 'speaking'", default: "'idle'", description: 'What the assistant is doing. Each state has its own motion, and changes ease in.' },
  { name: 'mic', type: 'boolean', default: 'false', description: "Drive the orb from the user's microphone (Web Audio analyser). Asks for permission when turned on." },
  { name: 'level', type: 'number', description: 'Optional 0..1 loudness from your own audio, such as text-to-speech output. Without it, a natural simulated voice is used.' },
  { name: 'color', type: 'string', description: 'Main colour; the shades are mixed from it.' },
  { name: 'onMicError', type: '(message: string | null) => void', description: 'Called when the microphone is denied or unavailable.' },
];

export const voiceEntries: DocEntry[] = [
  {
    slug: 'dither-orb',
    name: 'Dither Voice Orb',
    description: 'A liquid, lit sphere quantised to five tones with 8×8 ordered dithering. The rim ripples with the voice, a light sweeps around it while thinking, and it can listen to your mic.',
    badge: 'New',
    demos: [
      {
        title: 'Dithered voice',
        description: 'Cycles through the states on its own. Pick one, tap the orb, or turn on your microphone.',
        component: DitherOrbDemo,
        height: 480,
        code: `import { DitherOrb } from '@/components/ai/voice/DitherOrb';

// simulated voice
<DitherOrb state="speaking" />

// live microphone
<DitherOrb mic />

// your own audio level (e.g. TTS), 0..1
<DitherOrb state="speaking" level={ttsLevel} pixel={3} color="#7dd3fc" />`,
      },
      {
        title: 'Palettes and states',
        description: 'Any colour works; the four darker tones are mixed from it.',
        component: DitherOrbPaletteDemo,
        height: 280,
        code: `<DitherOrb color="#f9a8d4" state="listening" size={120} pixel={2.5} />`,
      },
    ],
    props: [...common, size('280'), { name: 'pixel', type: 'number', default: '3', description: 'Size of one dither cell in CSS pixels. Bigger is chunkier.' }],
  },
  {
    slug: 'dot-globe',
    name: 'Dot Globe Orb',
    description: 'A rotating 3D globe of evenly spread dots with depth shading. Ripples spread from the front while listening, frequency bands push out rings while speaking, and a scan band sweeps while thinking.',
    badge: 'New',
    demos: [
      {
        title: '3D dot globe',
        description: 'Cycles through the states on its own. Pick one, tap the globe, or turn on your microphone.',
        component: DotGlobeDemo,
        height: 520,
        code: `import { DotGlobe } from '@/components/ai/voice/DotGlobe';

<DotGlobe state="listening" />
<DotGlobe mic dots={1800} color="#bae6fd" shade="#0369a1" />`,
      },
      {
        title: 'Voice pill',
        description: 'A tiny globe inside a status pill, for composers and call bars.',
        component: DotGlobePillDemo,
        height: 200,
        code: `<div className="flex items-center gap-3 rounded-full bg-ink-900 py-1.5 pl-1.5 pr-5">
  <DotGlobe state="speaking" size={44} dots={260} />
  <span>Speaking</span>
</div>`,
      },
    ],
    props: [
      ...common,
      size('300'),
      { name: 'dots', type: 'number', default: '1400', description: 'How many dots make up the globe.' },
      { name: 'shade', type: 'string', default: "'#0369a1'", description: 'Colour of the dots on the far side.' },
    ],
  },
  {
    slug: 'grid-orb',
    name: 'Grid Voice Orb',
    description: 'A shaded wireframe globe over a soft core and a reflective floor. The grid bulges with the voice bands, pulses as it speaks and twists around its axis while thinking.',
    badge: 'New',
    demos: [
      {
        title: 'Wireframe globe',
        description: 'Cycles through the states on its own. Pick one, tap the orb, or turn on your microphone.',
        component: GridOrbDemo,
        height: 540,
        code: `import { GridOrb } from '@/components/ai/voice/GridOrb';

<GridOrb state="thinking" />
<GridOrb mic rings={14} meridians={24} floor={false} />`,
      },
    ],
    props: [
      ...common,
      size('300'),
      { name: 'rings', type: 'number', default: '11', description: 'Latitude rings.' },
      { name: 'meridians', type: 'number', default: '20', description: 'Longitude lines.' },
      { name: 'floor', type: 'boolean', default: 'true', description: 'Show the reflection and floor lines under the orb.' },
    ],
  },
];
