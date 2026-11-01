import type { DocEntry } from '@/docs/types';
import { SegmentedPillsDemo } from '@/components/design/SegmentedPills';
import { InlineSliderDemo } from '@/components/design/InlineSlider';
import { ToggleRowDemo } from '@/components/design/ToggleRow';
import { UnitInputDemo } from '@/components/design/UnitInput';
import { IconTabsDemo } from '@/components/design/IconTabs';
import { FileCardDemo } from '@/components/design/FileCard';
import { ExportMenuDemo } from '@/components/design/ExportMenu';
import { ViewSwitcherDemo } from '@/components/design/ViewSwitcher';
import { SwatchRailDemo } from '@/components/design/SwatchRail';
import { MeasureBarDemo } from '@/components/design/MeasureBar';

export const designControlEntries: DocEntry[] = [
  {
    slug: 'segmented-pills',
    name: 'Segmented Pills',
    description: 'A soft track with a white pill that glides to the active option. Works with text, icons or both, and the arrow keys move between options.',
    badge: 'New',
    theme: 'light',
    demos: [{ title: 'Mode, filter and alignment pickers', component: SegmentedPillsDemo, height: 460, code: `import { SegmentedPills } from '@/components/design/SegmentedPills';` }],
    props: [
      { name: 'options', type: 'PillOption[]', description: '{ value, label?, icon? } items.' },
      { name: 'value', type: 'string', description: 'Selected value.' },
      { name: 'onChange', type: '(v: string) => void', description: 'Called with the new value.' },
      { name: 'size', type: "'sm' | 'md'", default: "'md'", description: 'Control height.' },
      { name: 'full', type: 'boolean', default: 'false', description: 'Stretch to the container and share width equally.' },
    ],
  },
  {
    slug: 'inline-slider',
    name: 'Inline Slider',
    description: 'A slider with its label inside the track and the value on the right. Drag anywhere to scrub, use the arrow keys (Shift for ×10), or double-click the value to type one.',
    badge: 'New',
    theme: 'light',
    demos: [{ title: 'Trace settings', component: InlineSliderDemo, height: 380, code: `import { InlineSlider } from '@/components/design/InlineSlider';` }],
    props: [
      { name: 'label', type: 'string', description: 'Shown inside the track.' },
      { name: 'value', type: 'number', description: 'Current value.' },
      { name: 'onChange', type: '(v: number) => void', description: 'Called while scrubbing.' },
      { name: 'min / max / step', type: 'number', default: '0 / 1 / 0.01', description: 'Range and snapping.' },
      { name: 'unit', type: 'string', description: 'Suffix such as px or %.' },
      { name: 'defaultValue', type: 'number', description: 'Shows a reset button when the value differs.' },
    ],
  },
  {
    slug: 'toggle-row',
    name: 'Toggle Row',
    description: 'A settings row with a soft background and a switch. It can carry a description, and a row can be disabled when it depends on another one.',
    badge: 'New',
    theme: 'light',
    demos: [{ title: 'Outline and canvas settings', component: ToggleRowDemo, height: 460, code: `import { ToggleRow } from '@/components/design/ToggleRow';` }],
    props: [
      { name: 'label', type: 'string', description: 'Row label.' },
      { name: 'description', type: 'string', description: 'Optional helper line.' },
      { name: 'checked', type: 'boolean', description: 'Switch state.' },
      { name: 'onChange', type: '(v: boolean) => void', description: 'Toggle handler.' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Dim and lock the row.' },
    ],
  },
  {
    slug: 'unit-input',
    name: 'Unit Input',
    description: 'Compact number fields with a prefix letter and a unit. Drag the letter to scrub, ↑ ↓ to nudge, and out-of-range values turn red. The demo locks the aspect ratio between W and H.',
    badge: 'New',
    theme: 'light',
    demos: [{ title: 'Size with aspect lock', component: UnitInputDemo, height: 260, code: `import { UnitInput } from '@/components/design/UnitInput';` }],
    props: [
      { name: 'prefix', type: 'string', description: 'Letter shown at the start; drag it to scrub.' },
      { name: 'value', type: 'number', description: 'Current value.' },
      { name: 'onChange', type: '(v: number) => void', description: 'Change handler.' },
      { name: 'unit', type: 'string', default: "'px'", description: 'Unit suffix.' },
      { name: 'min / max / step', type: 'number', default: '0 / 9999 / 1', description: 'Range and nudge size.' },
    ],
  },
  {
    slug: 'icon-tabs',
    name: 'Icon Tabs',
    description: 'Inspector tabs where the active tab is a raised white tab joined to the panel below it. Each tab here holds real controls.',
    badge: 'New',
    theme: 'light',
    demos: [{ title: 'Shape, style and effects', component: IconTabsDemo, height: 440, code: `import { IconTabs } from '@/components/design/IconTabs';` }],
    props: [
      { name: 'tabs', type: 'IconTab[]', description: '{ id, label, icon, content } items.' },
      { name: 'defaultTab', type: 'string', default: 'first tab', description: 'Initially active tab id.' },
    ],
  },
  {
    slug: 'file-card',
    name: 'File Card',
    description: 'The current asset: a thumbnail tile, name and meta, a menu to replace or remove it, and a drop state when a file is dragged over.',
    badge: 'New',
    theme: 'light',
    demos: [{ title: 'Replace or remove an asset', component: FileCardDemo, height: 240, code: `import { FileCard } from '@/components/design/FileCard';` }],
    props: [
      { name: 'name', type: 'string', description: 'File name.' },
      { name: 'meta', type: 'string', description: 'Secondary line, such as layers and points.' },
      { name: 'thumbnail', type: 'string', description: 'Image URL; a file icon shows when missing.' },
      { name: 'onReplace', type: '(file?: File) => void', description: 'From the menu or a drop.' },
      { name: 'onRemove', type: '() => void', description: 'Remove handler.' },
    ],
  },
  {
    slug: 'export-menu',
    name: 'Export Menu',
    description: 'A dark pill button that opens a light popover of export formats, with icon tiles, shortcuts, simulated progress per row and a privacy note.',
    badge: 'New',
    theme: 'light',
    demos: [{ title: 'Export from a file header', component: ExportMenuDemo, height: 440, code: `import { ExportMenu } from '@/components/design/ExportMenu';` }],
    props: [
      { name: 'formats', type: 'ExportFormat[]', default: 'SVG, PNG, PDF, React', description: '{ id, label, hint, icon, kbd? } rows.' },
      { name: 'label', type: 'string', default: "'Export'", description: 'Button text.' },
    ],
  },
  {
    slug: 'view-switcher',
    name: 'View Toolbar',
    description: 'A floating pill toolbar for the canvas: a Fit / 100% / Pixel segment, tool buttons with tooltips and shortcuts, and zoom controls.',
    badge: 'New',
    theme: 'light',
    demos: [{ title: 'Canvas toolbar', component: ViewSwitcherDemo, height: 420, code: `import { ViewSwitcher } from '@/components/design/ViewSwitcher';` }],
    props: [
      { name: 'view', type: 'string', description: "'fit' | '100' | 'pixel'." },
      { name: 'tool', type: 'string', description: 'Active tool id.' },
      { name: 'zoom', type: 'number', description: 'Zoom percent.' },
      { name: 'onView / onTool / onZoom', type: 'function', description: 'Change handlers.' },
    ],
  },
  {
    slug: 'swatch-rail',
    name: 'Swatch Rail',
    description: 'A rail of material spheres (chrome, glass, clay, gold, pearl, holographic, ink) drawn with CSS gradients, with a selected ring, tooltips and arrow-key navigation.',
    badge: 'New',
    theme: 'light',
    demos: [{ title: 'Material picker', component: SwatchRailDemo, height: 460, code: `import { SwatchRail } from '@/components/design/SwatchRail';` }],
    props: [
      { name: 'swatches', type: 'Swatch[]', default: 'MATERIAL_SWATCHES', description: '{ id, name, background } items.' },
      { name: 'value', type: 'string', description: 'Selected id.' },
      { name: 'onChange', type: '(id: string) => void', description: 'Change handler.' },
      { name: 'orientation', type: "'vertical' | 'horizontal'", default: "'vertical'", description: 'Rail direction.' },
    ],
  },
  {
    slug: 'measure-bar',
    name: 'Measure Bar',
    description: 'A dark translucent chip bar of live measurements whose numbers tween when they change. Drag the handle (or use the arrow keys on it) to resize the shape.',
    badge: 'New',
    theme: 'light',
    demos: [{ title: 'Live selection stats', component: MeasureBarDemo, height: 380, code: `import { MeasureBar } from '@/components/design/MeasureBar';` }],
    props: [
      { name: 'items', type: 'Measure[]', description: '{ label, value, unit?, decimals? } cells.' },
      { name: 'className', type: 'string', description: 'Extra classes.' },
    ],
  },
];
