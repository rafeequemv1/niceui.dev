import type { DocEntry } from '@/docs/types';
import { ShinyButtonDemo } from '@/components/effects/ShinyButton';
import { RainbowButtonDemo } from '@/components/effects/RainbowButton';
import { MagneticButtonDemo } from '@/components/effects/MagneticButton';
import { RippleButtonDemo } from '@/components/effects/RippleButton';
import { SpotlightCardDemo } from '@/components/effects/SpotlightCard';
import { NoiseGradientDemo } from '@/components/effects/NoiseGradient';
import { BeamsBackgroundDemo } from '@/components/effects/BeamsBackground';

const cls = { name: 'className', type: 'string', description: 'Extra classes for the root.' };

export const effectButtonEntries: DocEntry[] = [
  {
    slug: 'shiny-button',
    name: 'Shiny Button',
    description: 'A pill button with a soft light sweep, in solid, outline and glass variants.',
    badge: 'New',
    demos: [{ title: 'Variants', component: ShinyButtonDemo, height: 280, code: `import { ShinyButton } from '@/components/effects/ShinyButton';

<ShinyButton>Get started</ShinyButton>
<ShinyButton variant="outline">Try the beta</ShinyButton>
<ShinyButton variant="glass">View changelog</ShinyButton>` }],
    props: [{ name: 'variant', type: "'solid' | 'outline' | 'glass'", default: "'solid'", description: 'Visual style.' }, cls],
  },
  {
    slug: 'rainbow-button',
    name: 'Rainbow Button',
    description: 'A dark button framed by an animated rainbow border with a matching glow.',
    badge: 'New',
    demos: [{ title: 'Rainbow border', component: RainbowButtonDemo, height: 280, code: `import { RainbowButton } from '@/components/effects/RainbowButton';

<RainbowButton>Star on GitHub</RainbowButton>` }],
    props: [cls],
  },
  {
    slug: 'magnetic-button',
    name: 'Magnetic Button',
    description: 'A button that leans toward the pointer on a spring, with a label that moves further for depth.',
    badge: 'New',
    demos: [{ title: 'Magnetic pull', component: MagneticButtonDemo, height: 300, code: `import { MagneticButton } from '@/components/effects/MagneticButton';

<MagneticButton strength={0.35}>Let’s talk</MagneticButton>` }],
    props: [{ name: 'strength', type: 'number', default: '0.35', description: 'How far the button follows the pointer.' }, { name: 'onClick', type: '() => void', description: 'Click handler.' }, cls],
  },
  {
    slug: 'ripple-button',
    name: 'Ripple Button',
    description: 'Ripples spread from the click point, then the button moves through loading and success.',
    badge: 'New',
    demos: [{ title: 'Ripple and states', component: RippleButtonDemo, height: 280, code: `import { RippleButton } from '@/components/effects/RippleButton';

<RippleButton label="Send invite" onAction={() => api.invite(email)} />` }],
    props: [{ name: 'onAction', type: '() => Promise<void> | void', description: 'Runs on click; success shows when it resolves.' }, { name: 'label', type: 'string', default: "'Send invite'", description: 'Idle label.' }, cls],
  },
  {
    slug: 'spotlight-card',
    name: 'Spotlight Card',
    description: 'Cards lit by a soft light that follows the pointer, with a matching border highlight.',
    badge: 'New',
    demos: [{ title: 'Feature grid', component: SpotlightCardDemo, height: 400, code: `import { SpotlightCard } from '@/components/effects/SpotlightCard';

<SpotlightCard>
  <h3>AI suggestions</h3>
  <p>Context-aware edits as you type.</p>
</SpotlightCard>` }],
    props: [{ name: 'color', type: 'string', default: "'56,189,248'", description: 'RGB triplet for the light.' }, { name: 'children', type: 'ReactNode', description: 'Card content.' }, cls],
  },
  {
    slug: 'noise-gradient',
    name: 'Noise Gradient Background',
    description: 'A slowly shifting mesh gradient with SVG film grain, for heroes and banners.',
    badge: 'New',
    demos: [{ title: 'Mesh with grain', component: NoiseGradientDemo, height: 420, code: `import { NoiseGradient } from '@/components/effects/NoiseGradient';

<NoiseGradient colors={['#0ea5e9', '#7c3aed', '#f472b6']}>
  <Hero />
</NoiseGradient>` }],
    props: [{ name: 'colors', type: '[string, string, string]', description: 'The three blob colours.' }, { name: 'children', type: 'ReactNode', description: 'Content on top.' }, cls],
  },
  {
    slug: 'beams-background',
    name: 'Light Beams',
    description: 'Vertical light beams fall through a dark panel at their own pace, over faint guide lines.',
    badge: 'New',
    demos: [{ title: 'Beams behind a hero', component: BeamsBackgroundDemo, height: 420, code: `import { BeamsBackground } from '@/components/effects/BeamsBackground';

<BeamsBackground>
  <Hero />
</BeamsBackground>` }],
    props: [{ name: 'children', type: 'ReactNode', description: 'Content on top.' }, cls],
  },
];
