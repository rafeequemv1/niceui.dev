import type { DocEntry } from '@/docs/types';
import { PageDotsDemo } from '@/components/controls/PageDots';
import { AutoResizeTextareaDemo } from '@/components/controls/AutoResizeTextarea';
import { ResizablePanelsDemo } from '@/components/controls/ResizablePanels';
import { DropdownMenuDemo } from '@/components/controls/DropdownMenu';
import { TimePickerDemo } from '@/components/controls/TimePicker';
import { VerticalSliderDemo } from '@/components/controls/VerticalSlider';
import { CountdownTimerDemo } from '@/components/controls/CountdownTimer';

export const controlsExtraEntries: DocEntry[] = [
  {
    slug: 'page-dots',
    name: 'Page Indicator Dots',
    description: 'Pagination dots for carousels, onboarding and galleries: the active dot morphs into a pill, fills as a progress bar on autoplay, or shows page numbers. Clickable, with arrow-key support.',
    badge: 'New',
    demos: [
      {
        title: 'Pill, progress and numbered dots',
        description: 'Click a dot, or focus the dots and use the arrow keys. The top set autoplays; pause it with the button.',
        component: PageDotsDemo,
        height: 460,
        code: `import { PageDots } from '@/components/controls/PageDots';

const [page, setPage] = useState(0);

<PageDots count={5} index={page} onChange={setPage} />
<PageDots variant="progress" duration={4000} count={5} index={page} onChange={setPage} />
<PageDots variant="numbered" count={5} index={page} onChange={setPage} />`,
      },
    ],
    props: [
      { name: 'count', type: 'number', description: 'Number of pages.' },
      { name: 'index', type: 'number', description: 'The active page (0-based).' },
      { name: 'onChange', type: '(index: number) => void', description: 'Called when a dot is clicked, a key is pressed or autoplay advances.' },
      { name: 'variant', type: "'pill' | 'progress' | 'numbered'", default: "'pill'", description: 'Stretching pill, autoplay progress fill, or numbered dots.' },
      { name: 'duration', type: 'number', default: '4000', description: 'Autoplay time per page in ms (progress variant).' },
      { name: 'paused', type: 'boolean', description: 'Pause the progress autoplay.' },
      { name: 'label', type: 'string', default: "'Pages'", description: 'Accessible name for the dot group.' },
    ],
  },
  {
    slug: 'auto-resize-textarea',
    name: 'Auto-Resize Textarea',
    description: 'A resizable textarea that grows with its content between a minimum and maximum number of rows, with a character counter, plus a variant with a custom drag handle you can also resize from the keyboard.',
    badge: 'New',
    demos: [
      {
        title: 'Auto-growing and drag-to-resize',
        description: 'Type in the composer (Enter sends, Shift+Enter adds a line). The bio counts characters; the notes field has a drag handle.',
        component: AutoResizeTextareaDemo,
        height: 520,
        code: `import { AutoResizeTextarea, ResizableTextarea } from '@/components/controls/AutoResizeTextarea';

<AutoResizeTextarea value={text} onChange={setText} minRows={1} maxRows={6} placeholder="Write a message…" />
<AutoResizeTextarea label="Bio" value={bio} onChange={setBio} minRows={3} maxLength={160} />
<ResizableTextarea value={notes} onChange={setNotes} height={140} minHeight={88} maxHeight={420} />`,
      },
    ],
    props: [
      { name: 'value', type: 'string', description: 'Controlled text.' },
      { name: 'onChange', type: '(value: string) => void', description: 'Called with the new text.' },
      { name: 'minRows', type: 'number', default: '2', description: 'Rows shown when empty.' },
      { name: 'maxRows', type: 'number', default: '8', description: 'Rows before it starts to scroll.' },
      { name: 'maxLength', type: 'number', description: 'Shows a counter that turns amber near the limit.' },
      { name: 'label', type: 'string', description: 'Visible label (pair it with an id).' },
    ],
  },
  {
    slug: 'resizable-panels',
    name: 'Resizable Panels',
    description: 'Resizable split panes for editors and dashboards: horizontal or vertical, nestable, with a drag handle, keyboard resizing, minimum sizes and double-click to reset.',
    badge: 'New',
    demos: [
      {
        title: 'Editor layout',
        description: 'Drag either handle, or focus one and use the arrow keys (Shift for bigger steps, Home/End for limits). Double-click to reset.',
        component: ResizablePanelsDemo,
        height: 440,
        code: `import { ResizablePanels } from '@/components/controls/ResizablePanels';

<ResizablePanels defaultSize={28} min={18}>
  <Sidebar />
  <ResizablePanels direction="vertical" defaultSize={64}>
    <Editor />
    <Terminal />
  </ResizablePanels>
</ResizablePanels>`,
      },
    ],
    props: [
      { name: 'children', type: '[ReactNode, ReactNode]', description: 'Exactly two panels.' },
      { name: 'direction', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Side by side or stacked.' },
      { name: 'defaultSize', type: 'number', default: '50', description: 'First panel size in percent (also the reset value).' },
      { name: 'min', type: 'number', default: '15', description: 'Minimum size of each panel in percent.' },
      { name: 'onResize', type: '(size: number) => void', description: 'Called with the first panel size as it changes.' },
    ],
  },
  {
    slug: 'dropdown-menu',
    name: 'Dropdown Menu',
    description: 'An animated React dropdown menu with icons, keyboard shortcuts, separators, checkbox and radio items and a nested submenu, with arrow-key navigation, typeahead and Esc or outside-click to close.',
    badge: 'New',
    demos: [
      {
        title: 'Project options menu',
        description: 'Open it with a click or with Arrow Down. Type a letter to jump, Arrow Right opens Share, Esc closes.',
        component: DropdownMenuDemo,
        height: 520,
        code: `import { DropdownMenu, type MenuEntry } from '@/components/controls/DropdownMenu';
import { Copy, Pencil, Share2, Trash2, Link2 } from 'lucide-react';

const items: MenuEntry[] = [
  { label: 'Rename', icon: Pencil, shortcut: '⌘R', onSelect: rename },
  { label: 'Duplicate', icon: Copy, shortcut: '⌘D', onSelect: duplicate },
  { type: 'sub', label: 'Share', icon: Share2, items: [{ label: 'Copy link', icon: Link2, onSelect: copyLink }] },
  { type: 'separator' },
  { type: 'checkbox', label: 'Starred', checked: starred, onChange: setStarred },
  { type: 'radio', label: 'Compact', checked: density === 'compact', onSelect: () => setDensity('compact') },
  { type: 'separator' },
  { label: 'Delete', icon: Trash2, danger: true, onSelect: remove },
];

<DropdownMenu trigger="Options" items={items} align="end" />`,
      },
    ],
    props: [
      { name: 'trigger', type: 'ReactNode', description: 'Content of the trigger button.' },
      { name: 'items', type: 'MenuEntry[]', description: "Items: plain, 'checkbox', 'radio', 'sub' (nested items), 'separator' or 'label'." },
      { name: 'align', type: "'start' | 'end'", default: "'start'", description: 'Align the menu to the left or right edge of the trigger.' },
      { name: 'label', type: 'string', default: "'Menu'", description: 'Accessible name for the menu.' },
    ],
  },
  {
    slug: 'time-picker',
    name: 'Time Picker',
    description: 'A time picker for React: a field that opens scrollable hour and minute columns with AM/PM, in 12- or 24-hour format, plus an inline iOS-style wheel. Full keyboard support.',
    badge: 'New',
    demos: [
      {
        title: 'Popover and wheel',
        description: 'Open a field and use the arrows (Left/Right between columns, Up/Down to change). Scroll or drag the alarm wheels.',
        component: TimePickerDemo,
        height: 480,
        code: `import { TimePicker, WheelTimePicker, formatTime } from '@/components/controls/TimePicker';

// value is minutes since midnight
const [time, setTime] = useState(9 * 60 + 30);

<TimePicker value={time} onChange={setTime} step={15} />
<TimePicker value={time} onChange={setTime} hour12={false} />
<WheelTimePicker value={time} onChange={setTime} />
formatTime(time, true); // "9:30 AM"`,
      },
    ],
    props: [
      { name: 'value', type: 'number', description: 'Minutes since midnight.' },
      { name: 'onChange', type: '(value: number) => void', description: 'Called with the new time in minutes.' },
      { name: 'hour12', type: 'boolean', default: 'true', description: '12-hour with AM/PM, or 24-hour.' },
      { name: 'step', type: '1 | 5 | 10 | 15 | 30', default: '5', description: 'Minute step (wheel default 1).' },
      { name: 'label', type: 'string', default: "'Time'", description: 'Accessible name for the field.' },
    ],
  },
  {
    slug: 'vertical-slider',
    name: 'Vertical Slider',
    description: 'A vertical slider for volume, levels and EQ bands, with a gradient fill, ticks, a value bubble, centred mode for bipolar values and full keyboard control. Demo includes a 7-band equalizer with presets.',
    badge: 'New',
    demos: [
      {
        title: 'Volume and equalizer',
        description: 'Drag or click a track, or focus one and use arrows, PageUp/PageDown and Home/End. Presets animate the EQ.',
        component: VerticalSliderDemo,
        height: 480,
        code: `import { VerticalSlider } from '@/components/controls/VerticalSlider';

<VerticalSlider label="Volume" value={volume} onChange={setVolume} format={(v) => \`\${v}%\`} ticks={10} />
<VerticalSlider label="60 Hz" value={gain} onChange={setGain} min={-12} max={12} centered format={(v) => \`\${v} dB\`} />`,
      },
    ],
    props: [
      { name: 'value', type: 'number', description: 'Current value.' },
      { name: 'onChange', type: '(value: number) => void', description: 'Called with the snapped value.' },
      { name: 'label', type: 'string', description: 'Accessible name (required).' },
      { name: 'min / max / step', type: 'number', default: '0 / 100 / 1', description: 'Range and step.' },
      { name: 'height', type: 'number', default: '180', description: 'Track height in px.' },
      { name: 'centered', type: 'boolean', description: 'Fill from the middle, for values like EQ gain.' },
      { name: 'ticks', type: 'number', default: '0', description: 'Draw a tick every n steps.' },
      { name: 'format', type: '(value: number) => string', description: 'Formats the bubble and screen-reader text.' },
    ],
  },
  {
    slug: 'countdown-timer',
    name: 'Countdown Timer',
    description: 'A countdown timer for React with rolling digits for days, hours, minutes and seconds, plus a pomodoro-style ring timer that alternates focus and break sessions.',
    badge: 'New',
    demos: [
      {
        title: 'Launch countdown and focus timer',
        description: 'The digits roll as time passes. Start the focus timer, skip to a break, or reset.',
        component: CountdownTimerDemo,
        height: 460,
        code: `import { CountdownTimer, FocusTimer } from '@/components/controls/CountdownTimer';

<CountdownTimer to={new Date('2026-12-31T23:59:59')} onDone={() => setLive(true)} />
<FocusTimer focus={25 * 60} rest={5 * 60} />`,
      },
    ],
    props: [
      { name: 'to', type: 'Date | number', description: 'The moment to count down to (CountdownTimer).' },
      { name: 'onDone', type: '() => void', description: 'Called once when it reaches zero.' },
      { name: 'focus / rest', type: 'number', default: '1500 / 300', description: 'Session lengths in seconds (FocusTimer).' },
    ],
  },
];
