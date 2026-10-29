import type { DocEntry } from '@/docs/types';
import { AnimatedAlertDemo } from '@/components/ui/motion/Alert';
import { CollapsibleDemo } from '@/components/ui/motion/Collapsible';
import { BouncyAccordionDemo, BouncyAccordionMultipleDemo } from '@/components/ui/motion/BouncyAccordion';
import { TooltipDemo } from '@/components/ui/motion/Tooltip';
import { PopoverDemo } from '@/components/ui/motion/Popover';
import { ContextMenuDemo } from '@/components/ui/motion/ContextMenu';
import { MorphingModalDemo } from '@/components/ui/motion/MorphingModal';

export const overlayEntries: DocEntry[] = [
  {
    slug: 'animated-alert',
    name: 'Animated Alert',
    description: 'Status alerts with stroke-drawn icons and a smooth collapse when dismissed.',
    demos: [
      {
        title: 'Variants',
        description: 'Info, success, warning and error. Dismiss one to watch the stack collapse.',
        component: AnimatedAlertDemo,
        height: 460,
        code: `import { AnimatedAlert } from '@/components/ui/motion/Alert';

export function BillingNotice() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <AnimatedAlert
      variant="error"
      title="Payment failed"
      onDismiss={() => setVisible(false)}
      action={<button className="text-sm text-rose-300">Update billing</button>}
    >
      Your Visa ending 4242 was declined.
    </AnimatedAlert>
  );
}`,
      },
    ],
    props: [
      { name: 'variant', type: "'info' | 'success' | 'warning' | 'error'", default: "'info'", description: 'Color scheme and icon.' },
      { name: 'title', type: 'string', description: 'Bold first line of the alert.' },
      { name: 'children', type: 'ReactNode', description: 'Supporting description text.' },
      { name: 'dismissible', type: 'boolean', default: 'true', description: 'Shows the close button.' },
      { name: 'onDismiss', type: '() => void', description: 'Called after the collapse exit animation finishes.' },
      { name: 'action', type: 'ReactNode', description: 'Optional call-to-action rendered under the text.' },
    ],
  },
  {
    slug: 'collapsible',
    name: 'Animated Collapsible',
    description: 'A disclosure panel with grid-based height animation and blurred content reveal.',
    demos: [
      {
        title: 'Changed files',
        component: CollapsibleDemo,
        code: `import { Collapsible } from '@/components/ui/motion/Collapsible';

export function PullRequestFiles({ files }) {
  return (
    <Collapsible
      defaultOpen
      trigger={
        <div>
          <p className="text-sm font-medium">feat/command-palette</p>
          <p className="text-xs text-ink-400">{files.length} files changed</p>
        </div>
      }
    >
      {files.map((f) => (
        <FileRow key={f.name} file={f} />
      ))}
    </Collapsible>
  );
}`,
      },
    ],
    props: [
      { name: 'trigger', type: 'ReactNode', description: 'Content of the clickable header.' },
      { name: 'children', type: 'ReactNode', description: 'Panel content revealed when open.' },
      { name: 'defaultOpen', type: 'boolean', default: 'false', description: 'Initial state when uncontrolled.' },
      { name: 'open', type: 'boolean', description: 'Controlled open state.' },
      { name: 'onOpenChange', type: '(open: boolean) => void', description: 'Fires when the header is toggled.' },
    ],
  },
  {
    slug: 'bouncy-accordion',
    name: 'Bouncy Accordion',
    description: 'An accordion with spring-eased panels, a rotating plus icon and single or multiple open modes.',
    demos: [
      {
        title: 'Single open',
        description: 'Opening one item closes the others.',
        component: BouncyAccordionDemo,
        height: 420,
        code: `import { BouncyAccordion } from '@/components/ui/motion/BouncyAccordion';

const faq = [
  { id: 'license', title: 'Can I use it commercially?', content: 'Yes, MIT licensed.' },
  { id: 'deps', title: 'Any dependencies?', content: 'None beyond React.' },
  { id: 'a11y', title: 'Is it accessible?', content: 'Keyboard + ARIA ready.' },
];

export function Faq() {
  return <BouncyAccordion items={faq} defaultOpen={['deps']} />;
}`,
      },
      {
        title: 'Multiple open',
        component: BouncyAccordionMultipleDemo,
        height: 380,
        code: `<BouncyAccordion items={faq} type="multiple" defaultOpen={['license', 'a11y']} />`,
      },
    ],
    props: [
      { name: 'items', type: '{ id: string; title: string; content: ReactNode }[]', description: 'Accordion sections.' },
      { name: 'type', type: "'single' | 'multiple'", default: "'single'", description: 'Whether several panels can be open at once.' },
      { name: 'defaultOpen', type: 'string[]', default: '[]', description: 'Ids of initially open sections.' },
      { name: 'className', type: 'string', description: 'Extra classes for the wrapper.' },
    ],
  },
  {
    slug: 'tooltip',
    name: 'Tooltip',
    description: 'Hover and focus tooltips with a spring scale-in, arrow, delay and keyboard shortcut hints.',
    demos: [
      {
        title: 'Toolbar & sides',
        component: TooltipDemo,
        code: `import { Tooltip } from '@/components/ui/motion/Tooltip';

export function Toolbar() {
  return (
    <div className="flex gap-1">
      <Tooltip content="Bold" shortcut="⌘B">
        <button aria-label="Bold"><Bold /></button>
      </Tooltip>
      <Tooltip content="Share link" side="bottom" delay={100}>
        <button aria-label="Share"><Share2 /></button>
      </Tooltip>
    </div>
  );
}`,
      },
    ],
    props: [
      { name: 'content', type: 'ReactNode', description: 'Tooltip label.' },
      { name: 'side', type: "'top' | 'right' | 'bottom' | 'left'", default: "'top'", description: 'Placement relative to the trigger.' },
      { name: 'delay', type: 'number', default: '250', description: 'Milliseconds before showing.' },
      { name: 'shortcut', type: 'string', description: 'Optional keyboard hint rendered as a kbd.' },
      { name: 'children', type: 'ReactNode', description: 'The trigger element.' },
    ],
  },
  {
    slug: 'popover',
    name: 'Popover',
    description: 'A click-triggered floating panel that scales from its anchor with a spring.',
    demos: [
      {
        title: 'Invite form',
        component: PopoverDemo,
        height: 400,
        code: `import { Popover } from '@/components/ui/motion/Popover';

export function InviteButton() {
  return (
    <Popover
      align="center"
      trigger={({ toggle }) => <button onClick={toggle}>Invite teammate</button>}
    >
      {(close) => (
        <form onSubmit={(e) => { e.preventDefault(); sendInvite(); close(); }}>
          <input placeholder="name@company.com" />
          <button type="submit">Send invite</button>
        </form>
      )}
    </Popover>
  );
}`,
      },
    ],
    props: [
      { name: 'trigger', type: '({ open, toggle }) => ReactNode', description: 'Render prop for the anchor button.' },
      { name: 'children', type: '(close: () => void) => ReactNode', description: 'Panel content with a close callback.' },
      { name: 'align', type: "'start' | 'center' | 'end'", default: "'start'", description: 'Horizontal alignment and transform origin.' },
      { name: 'width', type: 'number', default: '320', description: 'Panel width in px.' },
    ],
  },
  {
    slug: 'context-menu',
    name: 'Animated Context Menu',
    description: 'A right-click menu that opens at the cursor with staggered items, shortcuts and submenus.',
    badge: 'New',
    demos: [
      {
        title: 'File actions',
        component: ContextMenuDemo,
        code: `import { ContextMenu, type MenuItem } from '@/components/ui/motion/ContextMenu';

const items: MenuItem[] = [
  { label: 'Open', icon: FolderOpen, shortcut: '↵' },
  { label: 'Duplicate', icon: Copy, shortcut: '⌘D' },
  { label: 'Move to', icon: Share2, submenu: ['Design', 'Engineering'] },
  { type: 'separator' },
  { label: 'Delete', icon: Trash2, danger: true, onSelect: remove },
];

export function FileCard() {
  return (
    <ContextMenu items={items}>
      <div className="rounded-2xl p-6">Q3 Roadmap.fig</div>
    </ContextMenu>
  );
}`,
      },
    ],
    props: [
      { name: 'items', type: 'MenuItem[]', description: 'Menu entries, separators and submenus.' },
      { name: 'children', type: 'ReactNode', description: 'The zone that listens for right-clicks.' },
      { name: 'item.shortcut', type: 'string', description: 'Right-aligned keyboard hint.' },
      { name: 'item.submenu', type: 'string[]', description: 'Nested options shown on hover.' },
      { name: 'item.danger', type: 'boolean', default: 'false', description: 'Renders the item in the destructive color.' },
    ],
  },
  {
    slug: 'morphing-modal',
    name: 'Morphing Modal',
    description: 'Cards that FLIP-morph from their grid position into a centered modal and back.',
    badge: 'New',
    demos: [
      {
        title: 'Project cards',
        component: MorphingModalDemo,
        height: 320,
        code: `import { MorphingModal } from '@/components/ui/motion/MorphingModal';

const projects = [
  {
    id: 'aurora',
    title: 'Aurora',
    subtitle: 'Brand refresh · 2025',
    gradient: 'linear-gradient(135deg, #7dd3fc, #14b8a6)',
    body: 'A complete rework of the Aurora identity.',
    meta: [{ label: 'Team', value: '6 people' }],
  },
  // ...
];

export function Projects() {
  return <MorphingModal items={projects} duration={520} />;
}`,
      },
    ],
    props: [
      { name: 'items', type: 'MorphItem[]', description: 'Cards with title, gradient, body and meta.' },
      { name: 'duration', type: 'number', default: '520', description: 'Morph duration in ms.' },
      { name: 'MorphItem.gradient', type: 'string', description: 'CSS background shared by card and modal header.' },
      { name: 'MorphItem.meta', type: '{ label: string; value: string }[]', description: 'Stat tiles shown in the expanded view.' },
    ],
  },
];
