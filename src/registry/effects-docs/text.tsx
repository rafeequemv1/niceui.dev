import type { DocEntry } from '@/docs/types';
import { TypewriterTextDemo } from '@/components/effects/TypewriterText';
import { ScrambleTextDemo } from '@/components/effects/ScrambleText';
import { GradientTextDemo } from '@/components/effects/GradientText';
import { NumberTickerDemo } from '@/components/effects/NumberTicker';
import { WordRotateDemo } from '@/components/effects/WordRotate';

export const effectTextEntries: DocEntry[] = [
  {
    slug: 'typewriter-text',
    name: 'Typewriter',
    description: 'Types, holds and deletes rotating phrases behind a blinking caret.',
    badge: 'New',
    demos: [{ title: 'Rotating phrases', component: TypewriterTextDemo, height: 320, code: `<TypewriterText phrases={['feel inevitable.', 'ship on Friday.']} />` }],
    props: [
      { name: 'phrases', type: 'string[]', description: 'Phrases to type in turn.' },
      { name: 'typeMs', type: 'number', default: '60', description: 'Delay per typed character.' },
      { name: 'deleteMs', type: 'number', default: '32', description: 'Delay per deleted character.' },
      { name: 'holdMs', type: 'number', default: '1400', description: 'Pause on a full phrase.' },
    ],
  },
  {
    slug: 'scramble-text',
    name: 'Scramble Text',
    description: 'Characters cycle through random glyphs and lock into place when the text appears or is hovered.',
    badge: 'New',
    demos: [{ title: 'On view and on hover', component: ScrambleTextDemo, height: 320, code: `<ScrambleText text="DECRYPTING THE SIGNAL" trigger="both" />` }],
    props: [
      { name: 'text', type: 'string', description: 'Final text.' },
      { name: 'duration', type: 'number', default: '900', description: 'Milliseconds until every character settles.' },
      { name: 'trigger', type: "'view' | 'hover' | 'both'", default: "'both'", description: 'What starts the scramble.' },
    ],
  },
  {
    slug: 'gradient-text',
    name: 'Animated Gradient Text',
    description: 'Text filled with a flowing gradient, with a light sweep passing over it.',
    badge: 'New',
    demos: [{ title: 'Product name', component: GradientTextDemo, height: 320, code: `<GradientText colors={['#7dd3fc', '#a78bfa', '#7dd3fc']}>Aurora 2.0</GradientText>` }],
    props: [
      { name: 'colors', type: 'string[]', description: 'Gradient stops; repeat the first at the end for a seamless loop.' },
      { name: 'speed', type: 'number', default: '6', description: 'Seconds per gradient cycle.' },
      { name: 'shine', type: 'boolean', default: 'true', description: 'Adds the light sweep.' },
    ],
  },
  {
    slug: 'number-ticker',
    name: 'Number Ticker',
    description: 'Digit columns roll into place when a number scrolls into view, with locale formatting.',
    badge: 'New',
    demos: [{ title: 'KPI tiles', component: NumberTickerDemo, height: 340, code: `<NumberTicker value={1284930} prefix="$" />` }],
    props: [
      { name: 'value', type: 'number', description: 'Number to roll to.' },
      { name: 'prefix', type: 'string', description: 'Shown before the number.' },
      { name: 'suffix', type: 'string', description: 'Shown after the number.' },
      { name: 'decimals', type: 'number', default: '0', description: 'Fraction digits.' },
    ],
  },
  {
    slug: 'word-rotate',
    name: 'Word Rotate',
    description: 'One word of a headline swaps with a blur-and-slide while the line width animates.',
    badge: 'New',
    demos: [{ title: 'Headline', component: WordRotateDemo, height: 300, code: `The UI kit for <WordRotate words={['AI agents', 'dashboards', 'CRMs']} />` }],
    props: [
      { name: 'words', type: 'string[]', description: 'Words to cycle.' },
      { name: 'interval', type: 'number', default: '2200', description: 'Milliseconds per word.' },
    ],
  },
];
