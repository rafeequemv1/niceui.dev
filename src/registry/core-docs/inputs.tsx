import type { DocEntry } from '@/docs/types';
import { SelectDemo } from '@/components/ui/core/Select';
import { ComboboxDemo } from '@/components/ui/core/Combobox';
import { MultiSelectDemo } from '@/components/ui/core/MultiSelect';
import { CheckboxDemo } from '@/components/ui/core/Checkbox';
import { RadioGroupDemo } from '@/components/ui/core/RadioGroup';
import { RangeSliderDemo } from '@/components/ui/core/RangeSlider';
import { AnimatedBadgeDemo } from '@/components/ui/core/Badge';
import { ColorPickerDemo } from '@/components/ui/core/ColorPicker';
import { ColorSelectorDemo } from '@/components/ui/core/ColorSelector';

export const inputEntries: DocEntry[] = [
  {
    slug: 'select',
    name: 'Select',
    description: 'A custom listbox with a spring dropdown, staggered options, keyboard navigation and an animated check.',
    demos: [
      {
        title: 'Region & role',
        component: SelectDemo,
        height: 480,
        code: `import { Select } from '@/components/ui/core/Select';

const regions = [
  { value: 'iad1', label: 'Washington, D.C.', description: 'us-east-1' },
  { value: 'fra1', label: 'Frankfurt', description: 'eu-central-1' },
  { value: 'hnd1', label: 'Tokyo', description: 'ap-northeast-1' },
];

export function RegionField() {
  const [region, setRegion] = useState('fra1');
  return <Select label="Function region" options={regions} value={region} onChange={setRegion} />;
}`,
      },
    ],
    props: [
      { name: 'options', type: '{ value; label; icon?; description? }[]', description: 'Available options.' },
      { name: 'value', type: 'string | null', description: 'Selected value.' },
      { name: 'onChange', type: '(value: string) => void', description: 'Called when an option is picked.' },
      { name: 'placeholder', type: 'string', default: "'Select…'", description: 'Shown when nothing is selected.' },
      { name: 'label', type: 'string', description: 'Field label.' },
    ],
  },
  {
    slug: 'combobox',
    name: 'Combobox',
    description: 'A searchable select that filters as you type and highlights the matched substring.',
    demos: [
      {
        title: 'Framework search',
        component: ComboboxDemo,
        height: 440,
        code: `import { Combobox } from '@/components/ui/core/Combobox';

const frameworks = [
  { value: 'next', label: 'Next.js', meta: '14.2.5' },
  { value: 'remix', label: 'Remix', meta: '2.11.0' },
  { value: 'astro', label: 'Astro', meta: '4.13.1' },
];

export function FrameworkField() {
  const [value, setValue] = useState<string | null>(null);
  return <Combobox label="Framework" options={frameworks} value={value} onChange={setValue} />;
}`,
      },
    ],
    props: [
      { name: 'options', type: '{ value; label; meta? }[]', description: 'Searchable options; meta is also matched.' },
      { name: 'value', type: 'string | null', description: 'Selected value.' },
      { name: 'onChange', type: '(value: string | null) => void', description: 'Called on select or clear.' },
      { name: 'placeholder', type: 'string', default: "'Search…'", description: 'Input placeholder.' },
      { name: 'emptyText', type: 'string', default: "'No results'", description: 'Shown when nothing matches.' },
    ],
  },
  {
    slug: 'multi-select',
    name: 'Multi Select',
    description: 'Pick several values as chips that pop in and collapse out when removed. Backspace removes the last chip.',
    demos: [
      {
        title: 'Issue labels',
        component: MultiSelectDemo,
        height: 440,
        code: `import { MultiSelect } from '@/components/ui/core/MultiSelect';

const labels = [
  { value: 'bug', label: 'Bug', color: '#fb7185' },
  { value: 'feature', label: 'Feature', color: '#38bdf8' },
  { value: 'design', label: 'Design', color: '#2dd4bf' },
];

export function LabelPicker() {
  const [value, setValue] = useState(['feature']);
  return <MultiSelect label="Labels" options={labels} value={value} onChange={setValue} max={5} />;
}`,
      },
    ],
    props: [
      { name: 'options', type: '{ value; label; color? }[]', description: 'Options with an optional dot color.' },
      { name: 'value', type: 'string[]', description: 'Selected values.' },
      { name: 'onChange', type: '(value: string[]) => void', description: 'Called with the new selection.' },
      { name: 'max', type: 'number', description: 'Maximum number of selections.' },
      { name: 'placeholder', type: 'string', default: "'Add…'", description: 'Shown when empty.' },
    ],
  },
  {
    slug: 'checkbox',
    name: 'Checkbox',
    description: 'Checkboxes whose tick draws itself with an SVG stroke, plus an indeterminate state for select-all groups.',
    demos: [
      {
        title: 'Token scopes',
        component: CheckboxDemo,
        height: 440,
        code: `import { Checkbox } from '@/components/ui/core/Checkbox';

export function Scopes({ scopes, selected, setSelected }) {
  const all = selected.length === scopes.length;
  return (
    <>
      <Checkbox
        checked={all}
        indeterminate={!all && selected.length > 0}
        onChange={() => setSelected(all ? [] : scopes.map((s) => s.id))}
        label="Select all"
      />
      {scopes.map((s) => (
        <Checkbox key={s.id} checked={selected.includes(s.id)} onChange={() => toggle(s.id)} label={s.label} />
      ))}
    </>
  );
}`,
      },
    ],
    props: [
      { name: 'checked', type: 'boolean', description: 'Checked state.' },
      { name: 'onChange', type: '(checked: boolean) => void', description: 'Called when toggled.' },
      { name: 'indeterminate', type: 'boolean', default: 'false', description: 'Shows a dash for partially selected groups.' },
      { name: 'label', type: 'ReactNode', description: 'Primary label.' },
      { name: 'description', type: 'ReactNode', description: 'Secondary text under the label.' },
    ],
  },
  {
    slug: 'radio-group',
    name: 'Radio Group',
    description: 'Card-style radio options with a springy dot, ring pulse and roving keyboard focus.',
    demos: [
      {
        title: 'Plan picker',
        component: RadioGroupDemo,
        height: 420,
        code: `import { RadioGroup } from '@/components/ui/core/RadioGroup';
import { User, Rocket, Building2 } from 'lucide-react';

export function PlanPicker() {
  const [plan, setPlan] = useState('pro');
  return (
    <RadioGroup
      label="Plan"
      value={plan}
      onChange={setPlan}
      options={[
        { value: 'hobby', label: 'Hobby', description: 'Personal projects', icon: <User /> },
        { value: 'pro', label: 'Pro', description: 'Growing teams', icon: <Rocket /> },
        { value: 'enterprise', label: 'Enterprise', description: 'SSO & SLAs', icon: <Building2 /> },
      ]}
    />
  );
}`,
      },
    ],
    props: [
      { name: 'options', type: '{ value; label; description?; meta?; icon? }[]', description: 'Radio options.' },
      { name: 'value', type: 'string', description: 'Selected value.' },
      { name: 'onChange', type: '(value: string) => void', description: 'Called on selection.' },
      { name: 'label', type: 'string', description: 'Accessible group label.' },
    ],
  },
  {
    slug: 'range-slider',
    name: 'Range Slider',
    description: 'Single or dual-thumb slider with pointer dragging, stepping, keyboard support and a value tooltip.',
    demos: [
      {
        title: 'Single & range',
        component: RangeSliderDemo,
        height: 420,
        code: `import { RangeSlider } from '@/components/ui/core/RangeSlider';

export function PriceFilter() {
  const [price, setPrice] = useState<[number, number]>([120, 640]);
  return (
    <RangeSlider
      label="Price range"
      value={price}
      onChange={setPrice}
      max={1000}
      step={10}
      format={(n) => '$' + n}
    />
  );
}`,
      },
    ],
    props: [
      { name: 'value', type: 'number | [number, number]', description: 'Pass a tuple for a dual-thumb range.' },
      { name: 'onChange', type: '(value) => void', description: 'Called continuously while dragging.' },
      { name: 'min / max', type: 'number', default: '0 / 100', description: 'Bounds.' },
      { name: 'step', type: 'number', default: '1', description: 'Snapping increment.' },
      { name: 'format', type: '(n: number) => string', description: 'Formats the tooltip and label.' },
    ],
  },
  {
    slug: 'animated-badge',
    name: 'Animated Badge',
    description: 'Status badges in five tones with pulsing live dots, a rolling counter and a shimmering “New” tag.',
    demos: [
      {
        title: 'Tones, pulse & counter',
        description: 'Use + and − to watch the count roll.',
        component: AnimatedBadgeDemo,
        code: `import { Badge, CountBadge, ShimmerBadge } from '@/components/ui/core/Badge';

export function Status() {
  return (
    <div className="flex gap-2">
      <Badge tone="success" pulse>All systems operational</Badge>
      <Badge tone="warning" dot>Degraded</Badge>
      <ShimmerBadge>New</ShimmerBadge>
      <div className="relative">
        <Bell />
        <CountBadge count={unread} className="absolute -right-1.5 -top-1.5" />
      </div>
    </div>
  );
}`,
      },
    ],
    props: [
      { name: 'tone', type: "'neutral' | 'brand' | 'success' | 'warning' | 'error'", default: "'neutral'", description: 'Color scheme.' },
      { name: 'dot', type: 'boolean', default: 'false', description: 'Leading status dot.' },
      { name: 'pulse', type: 'boolean', default: 'false', description: 'Adds an expanding ring to the dot.' },
      { name: 'count', type: 'number', description: 'CountBadge: value that rolls when changed.' },
      { name: 'max', type: 'number', default: '99', description: 'CountBadge: shows “99+” above this.' },
    ],
  },
  {
    slug: 'color-picker',
    name: 'Color Picker',
    badge: 'New',
    description: 'Saturation/value square, hue slider, hex input with copy and preset swatches, all draggable with the pointer.',
    demos: [
      {
        title: 'Brand accent',
        component: ColorPickerDemo,
        height: 460,
        code: `import { ColorPicker } from '@/components/ui/core/ColorPicker';

export function AccentSetting() {
  const [color, setColor] = useState('#38bdf8');
  return (
    <ColorPicker
      value={color}
      onChange={setColor}
      swatches={['#38bdf8', '#14b8a6', '#fbbf24', '#f43f5e']}
    />
  );
}`,
      },
    ],
    props: [
      { name: 'value', type: 'string', description: 'Hex color, e.g. #38bdf8.' },
      { name: 'onChange', type: '(hex: string) => void', description: 'Called while dragging and on input.' },
      { name: 'swatches', type: 'string[]', description: 'Preset colors shown under the picker.' },
    ],
  },
  {
    slug: 'animated-color-selector',
    name: 'Animated Color Selector',
    description: 'Swatch picker where the selected color expands into a pill with a check and its name.',
    demos: [
      {
        title: 'Product finish',
        component: ColorSelectorDemo,
        height: 440,
        code: `import { ColorSelector } from '@/components/ui/core/ColorSelector';

const finishes = [
  { value: 'graphite', name: 'Graphite', hex: '#36363e' },
  { value: 'silver', name: 'Silver', hex: '#d6d6db', light: true },
  { value: 'ocean', name: 'Ocean', hex: '#0ea5e9' },
];

export function FinishPicker() {
  const [finish, setFinish] = useState('ocean');
  return <ColorSelector colors={finishes} value={finish} onChange={setFinish} />;
}`,
      },
    ],
    props: [
      { name: 'colors', type: '{ value; name; hex; light? }[]', description: 'Swatches; light flips the check to dark.' },
      { name: 'value', type: 'string', description: 'Selected value.' },
      { name: 'onChange', type: '(value: string) => void', description: 'Called on selection.' },
      { name: 'showName', type: 'boolean', default: 'true', description: 'Reveal the name inside the selected swatch.' },
      { name: 'size', type: "'sm' | 'md'", default: "'md'", description: 'Swatch size.' },
    ],
  },
];
