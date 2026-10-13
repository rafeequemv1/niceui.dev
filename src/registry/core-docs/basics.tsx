import type { DocEntry } from '@/docs/types';
import { ButtonDemo } from '@/components/ui/core/Button';
import { CtaButtonsDemo } from '@/components/ui/core/CtaButtons';
import { CardDemo } from '@/components/ui/core/Card';
import { TiltCardDemo } from '@/components/ui/core/TiltCard';
import { TabsDemo } from '@/components/ui/core/Tabs';
import { SwitchDemo } from '@/components/ui/core/Switch';
import { InputDemo } from '@/components/ui/core/Input';

export const basicEntries: DocEntry[] = [
  {
    slug: 'button',
    name: 'Button',
    description: 'Five variants, three sizes, loading state, icon slots and a pointer-origin ripple on every press.',
    demos: [
      {
        title: 'Variants, sizes & states',
        description: 'Click any button to see the ripple. The deploy button cycles loading → success.',
        component: ButtonDemo,
        height: 400,
        code: `import { Button } from '@/components/ui/core/Button';
import { Plus, Rocket } from 'lucide-react';

export function Toolbar() {
  const [deploying, setDeploying] = useState(false);

  return (
    <div className="flex gap-2">
      <Button variant="secondary" leftIcon={<Plus />}>New project</Button>
      <Button variant="outline">Export</Button>
      <Button
        loading={deploying}
        leftIcon={<Rocket />}
        onClick={() => setDeploying(true)}
      >
        Deploy to prod
      </Button>
      <Button variant="danger" size="sm">Delete</Button>
    </div>
  );
}`,
      },
    ],
    props: [
      { name: 'variant', type: "'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'", default: "'primary'", description: 'Visual style.' },
      { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Height, padding and icon size.' },
      { name: 'loading', type: 'boolean', default: 'false', description: 'Shows a spinner and disables the button.' },
      { name: 'leftIcon', type: 'ReactNode', description: 'Icon before the label (replaced by the spinner while loading).' },
      { name: 'rightIcon', type: 'ReactNode', description: 'Icon after the label.' },
      { name: '...props', type: 'ButtonHTMLAttributes', description: 'All native button attributes.' },
    ],
  },
  {
    slug: 'cta-buttons',
    name: 'Animated CTA Buttons',
    description: 'Six attention-grabbing call-to-action buttons for hero sections, pricing pages and launch banners.',
    demos: [
      {
        title: 'Collection',
        description: 'Hover, move your cursor and click each one.',
        component: CtaButtonsDemo,
        height: 420,
        code: `import {
  ShimmerBorderButton,
  GradientGlowButton,
  ArrowSlideButton,
  MagneticButton,
  ShineSweepButton,
  SuccessMorphButton,
} from '@/components/ui/core/CtaButtons';

export function Hero() {
  return (
    <div className="flex flex-wrap gap-3">
      <ArrowSlideButton onClick={start}>Get started</ArrowSlideButton>
      <ShimmerBorderButton>Try Nice Pro</ShimmerBorderButton>
      <MagneticButton strength={0.4}>Book a demo</MagneticButton>
      <SuccessMorphButton>Save changes</SuccessMorphButton>
    </div>
  );
}`,
      },
    ],
    props: [
      { name: 'children', type: 'ReactNode', description: 'Button label and optional icon.' },
      { name: 'onClick', type: '() => void', description: 'Click handler (SuccessMorphButton manages its own state).' },
      { name: 'strength', type: 'number', default: '0.35', description: 'MagneticButton only: how far the button follows the cursor.' },
      { name: 'className', type: 'string', description: 'Extra classes for the outer element.' },
    ],
  },
  {
    slug: 'card',
    name: 'Card',
    badge: 'New',
    description: 'A surface primitive with an optional cursor-follow spotlight and glowing border, driven by CSS variables.',
    demos: [
      {
        title: 'Spotlight cards',
        description: 'Feature, stat, pricing and profile compositions. Move your cursor across them.',
        component: CardDemo,
        height: 640,
        code: `import { Card } from '@/components/ui/core/Card';
import { Badge } from '@/components/ui/core/Badge';

export function RevenueCard() {
  return (
    <Card interactive className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-ink-400">Monthly revenue</p>
          <p className="text-3xl font-semibold">$48,290</p>
        </div>
        <Badge tone="success">+12.4%</Badge>
      </div>
    </Card>
  );
}`,
      },
    ],
    props: [
      { name: 'children', type: 'ReactNode', description: 'Card content.' },
      { name: 'interactive', type: 'boolean', default: 'false', description: 'Enables spotlight, border glow and hover lift.' },
      { name: 'className', type: 'string', description: 'Padding, sizing and layout classes.' },
    ],
  },
  {
    slug: 'tilt-card',
    name: 'Tilt Card',
    description: 'A 3D card that tilts toward the pointer with spring-smoothed rotation and a moving glare highlight.',
    demos: [
      {
        title: 'Credit card & launch card',
        component: TiltCardDemo,
        height: 400,
        code: `import { TiltCard } from '@/components/ui/core/TiltCard';

export function MembershipCard() {
  return (
    <TiltCard maxTilt={12} className="w-[340px]">
      <div className="aspect-[1.586] rounded-2xl bg-gradient-to-br from-brand-500 to-ink-950 p-6">
        <p className="font-mono text-lg tracking-widest">4242 8810 3021 0097</p>
        <p className="text-xs text-white/75">MAYA CHEN · 09/29</p>
      </div>
    </TiltCard>
  );
}`,
      },
    ],
    props: [
      { name: 'children', type: 'ReactNode', description: 'Card face.' },
      { name: 'maxTilt', type: 'number', default: '12', description: 'Maximum rotation in degrees.' },
      { name: 'glare', type: 'boolean', default: 'true', description: 'Renders a pointer-tracking light reflection.' },
      { name: 'scale', type: 'number', default: '1.03', description: 'Scale while hovered.' },
    ],
  },
  {
    slug: 'tabs',
    name: 'Tabs',
    description: 'Pill and underline tabs with a spring-animated indicator measured from the active tab. Arrow keys supported.',
    demos: [
      {
        title: 'Underline & pill',
        component: TabsDemo,
        height: 460,
        code: `import { Tabs } from '@/components/ui/core/Tabs';
import { Settings, Users, CreditCard } from 'lucide-react';

export function SettingsNav() {
  const [tab, setTab] = useState('general');

  return (
    <Tabs
      value={tab}
      onChange={setTab}
      tabs={[
        { id: 'general', label: 'General', icon: <Settings /> },
        { id: 'team', label: 'Team', icon: <Users /> },
        { id: 'billing', label: 'Billing', icon: <CreditCard /> },
      ]}
    />
  );
}`,
      },
    ],
    props: [
      { name: 'tabs', type: '{ id: string; label: string; icon?: ReactNode }[]', description: 'Tab definitions.' },
      { name: 'value', type: 'string', description: 'Active tab id.' },
      { name: 'onChange', type: '(id: string) => void', description: 'Called with the new tab id.' },
      { name: 'variant', type: "'pill' | 'underline'", default: "'pill'", description: 'Indicator style.' },
    ],
  },
  {
    slug: 'switch',
    name: 'Switch',
    description: 'A toggle with a springy thumb that stretches while pressed and a soft glow when on.',
    demos: [
      {
        title: 'Settings list',
        component: SwitchDemo,
        height: 420,
        code: `import { Switch } from '@/components/ui/core/Switch';

export function AlertsSetting() {
  const [enabled, setEnabled] = useState(true);

  return (
    <Switch
      checked={enabled}
      onChange={setEnabled}
      label="Deployment alerts"
    />
  );
}`,
      },
    ],
    props: [
      { name: 'checked', type: 'boolean', description: 'Current state.' },
      { name: 'onChange', type: '(checked: boolean) => void', description: 'Called when toggled.' },
      { name: 'label', type: 'string', description: 'Clickable label rendered to the right.' },
      { name: 'size', type: "'sm' | 'md'", default: "'md'", description: 'Track size.' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Prevents interaction.' },
    ],
  },
  {
    slug: 'input',
    name: 'Input',
    description: 'Text field with label, hint, icon slot, password visibility toggle, focus glow and an error shake.',
    demos: [
      {
        title: 'Form fields',
        description: 'Submit the form empty to trigger validation.',
        component: InputDemo,
        height: 460,
        code: `import { Input } from '@/components/ui/core/Input';
import { Mail, Lock } from 'lucide-react';

export function SignIn({ errors }) {
  return (
    <form className="space-y-4">
      <Input
        label="Email"
        type="email"
        leftIcon={<Mail />}
        error={errors.email}
      />
      <Input
        label="Password"
        type="password"
        leftIcon={<Lock />}
        hint="8+ characters, one number."
      />
    </form>
  );
}`,
      },
    ],
    props: [
      { name: 'label', type: 'string', description: 'Label above the field.' },
      { name: 'hint', type: 'string', description: 'Helper text shown when there is no error.' },
      { name: 'error', type: 'string', description: 'Error message; turns the field red and shakes it.' },
      { name: 'leftIcon', type: 'ReactNode', description: 'Icon inside the field on the left.' },
      { name: 'rightSlot', type: 'ReactNode', description: 'Content inside the field on the right, e.g. a shortcut.' },
      { name: 'type', type: 'string', default: "'text'", description: "Use 'password' to get the visibility toggle." },
    ],
  },
];
