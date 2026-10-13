import type { DocEntry } from '@/docs/types';
import { MorphingSearchDemo } from '@/components/blocks/MorphingSearch';
import { CommandPaletteDemo } from '@/components/blocks/CommandPalette';
import { DynamicIslandDemo } from '@/components/blocks/DynamicIsland';
import { NotificationStackDemo } from '@/components/blocks/NotificationStack';
import { InfiniteMasonryDemo } from '@/components/blocks/InfiniteMasonry';
import { ProjectFolderDemo } from '@/components/blocks/ProjectFolder';

export const navigationBlockEntries: DocEntry[] = [
  {
    slug: 'morphing-search',
    name: 'Morphing Search',
    badge: 'New',
    description: 'An icon button that springs open into a wide search field with a keyboard-navigable results dropdown.',
    demos: [
      {
        title: 'Expand to search',
        description: 'Click the icon, type to filter, use ↑ ↓ and Enter. Escape or clicking outside collapses it.',
        component: MorphingSearchDemo,
        code: `import { MorphingSearch } from '@/components/blocks/MorphingSearch';

const items = [
  { id: '1', label: 'Q3 Roadmap', meta: 'Doc · edited 2h ago', kind: 'doc' },
  { id: '2', label: 'Design System', meta: 'Project · 24 files', kind: 'project' },
  { id: '3', label: 'Mira Chen', meta: 'Product Designer', kind: 'person' },
];

export function HeaderSearch() {
  const navigate = useNavigate();
  return (
    <MorphingSearch
      items={items}
      width={360}
      placeholder="Search docs, projects, people…"
      onSelect={(item) => navigate(\`/\${item.kind}/\${item.id}\`)}
    />
  );
}`,
      },
    ],
    props: [
      { name: 'items', type: 'SearchItem[]', description: 'Searchable entries with label, meta line and kind (doc, project, person).' },
      { name: 'width', type: 'number', default: '340', description: 'Expanded width in pixels. The collapsed state is a 44px circle.' },
      { name: 'placeholder', type: 'string', default: "'Search docs, projects, people…'", description: 'Input placeholder shown once expanded.' },
      { name: 'onSelect', type: '(item: SearchItem) => void', description: 'Called on click or Enter. The search collapses afterwards.' },
    ],
  },
  {
    slug: 'command-palette',
    name: 'Command Palette',
    description: 'A ⌘K launcher with fuzzy matching, grouped results, a spring-sliding highlight and keyboard shortcuts.',
    demos: [
      {
        title: 'Launcher',
        description: 'Press ⌘K / Ctrl+K or click the button. Navigate with arrows and press Enter to run a command.',
        component: CommandPaletteDemo,
        height: 480,
        code: `import { CommandPalette } from '@/components/blocks/CommandPalette';

export function App() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <CommandPalette
      open={open}
      onClose={() => setOpen(false)}
      commands={[
        { id: 'new', label: 'Create new project', group: 'Actions', icon: Plus, shortcut: ['⌘', 'N'] },
        { id: 'docs', label: 'Open documentation', group: 'Navigation', icon: FileText },
      ]}
      onRun={(cmd) => toast(\`Ran \${cmd.label}\`)}
    />
  );
}`,
      },
    ],
    props: [
      { name: 'open', type: 'boolean', description: 'Controls visibility. Enter and exit are animated.' },
      { name: 'onClose', type: '() => void', description: 'Called on Escape, backdrop click or after running a command.' },
      { name: 'commands', type: 'CommandItem[]', description: 'Commands with label, group, icon and optional shortcut keys.' },
      { name: 'onRun', type: '(command: CommandItem) => void', description: 'Called when a command is chosen with click or Enter.' },
    ],
  },
  {
    slug: 'dynamic-island',
    name: 'Dynamic Island',
    description: 'A black pill that morphs its width, height and radius between idle, call, music, timer and notification states.',
    demos: [
      {
        title: 'Live activities',
        description: 'Switch activities to watch the island stretch. End the call or pause the track from inside the pill.',
        component: DynamicIslandDemo,
        height: 400,
        code: `import { DynamicIsland, type IslandMode } from '@/components/blocks/DynamicIsland';

export function StatusArea() {
  const [mode, setMode] = useState<IslandMode>('idle');

  useEffect(() => {
    return calls.subscribe((call) => setMode(call ? 'call' : 'idle'));
  }, []);

  return (
    <div className="flex justify-center pt-3">
      <DynamicIsland mode={mode} onModeChange={setMode} />
    </div>
  );
}`,
      },
    ],
    props: [
      { name: 'mode', type: "'idle' | 'call' | 'music' | 'timer' | 'notification'", description: 'Active state. Each has its own size and content.' },
      { name: 'onModeChange', type: '(mode: IslandMode) => void', description: 'Called when the island changes itself, e.g. ending a call returns to idle.' },
    ],
  },
  {
    slug: 'notification-stack',
    name: 'Notification Stack',
    description: 'iOS-style stacked notifications that fan out into a list when tapped, and cards that slide away when dismissed.',
    demos: [
      {
        title: 'Lock screen stack',
        description: 'Click the stack to expand it. Hover a card and press × to dismiss.',
        component: NotificationStackDemo,
        height: 440,
        code: `import { NotificationStack } from '@/components/blocks/NotificationStack';

export function LockScreen() {
  const [items, setItems] = useState(initialNotifications);

  return (
    <NotificationStack
      items={items}
      maxPeek={3}
      onDismiss={(id) => setItems((xs) => xs.filter((x) => x.id !== id))}
    />
  );
}`,
      },
    ],
    props: [
      { name: 'items', type: 'StackNotification[]', description: 'Notifications with app, title, body, time, icon and tint.' },
      { name: 'onDismiss', type: '(id: number) => void', description: 'Called after the card has animated out.' },
      { name: 'maxPeek', type: 'number', default: '3', description: 'Cards visible behind the top card while collapsed.' },
    ],
  },
  {
    slug: 'infinite-masonry',
    name: 'Infinite Masonry',
    description: 'A balanced masonry grid in its own scroll container that streams in more cards with shimmering skeletons.',
    demos: [
      {
        title: 'Inspiration feed',
        description: 'Scroll inside the panel. Near the bottom a new page loads with skeleton placeholders.',
        component: InfiniteMasonryDemo,
        height: 520,
        code: `import { InfiniteMasonry } from '@/components/blocks/InfiniteMasonry';

export function Explore() {
  return (
    <InfiniteMasonry
      columns={3}
      pageSize={9}
      maxItems={54}
      threshold={160}
      height={440}
    />
  );
}`,
      },
    ],
    props: [
      { name: 'columns', type: 'number', default: '3', description: 'Number of columns. Cards go to the shortest column.' },
      { name: 'pageSize', type: 'number', default: '9', description: 'Cards added per page.' },
      { name: 'maxItems', type: 'number', default: '54', description: 'Stops loading once this many cards exist.' },
      { name: 'threshold', type: 'number', default: '160', description: 'Distance from the bottom, in px, that triggers loading.' },
      { name: 'height', type: 'number', default: '440', description: 'Height of the internal scroll container.' },
    ],
  },
  {
    slug: 'project-folder',
    name: 'Project Folder',
    description: 'A 3D folder whose front flap tilts open on hover while the papers inside fan out with a spring.',
    demos: [
      {
        title: 'Project grid',
        description: 'Hover to peek inside a folder, click to pin it open.',
        component: ProjectFolderDemo,
        code: `import { ProjectFolder } from '@/components/blocks/ProjectFolder';

export function Projects() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="flex gap-6">
      <ProjectFolder
        title="Brand refresh"
        meta="24 files · 3 members"
        color="brand"
        papers={['Moodboard', 'Logo v4', 'Guidelines']}
        open={open === 'brand' || undefined}
        onClick={() => setOpen((o) => (o === 'brand' ? null : 'brand'))}
      />
      <ProjectFolder title="Q3 Launch" meta="9 files" color="emerald" />
    </div>
  );
}`,
      },
    ],
    props: [
      { name: 'title', type: 'string', description: 'Folder name under the illustration.' },
      { name: 'meta', type: 'string', description: 'Secondary line, e.g. file count.' },
      { name: 'color', type: "'brand' | 'amber' | 'emerald' | 'rose'", default: "'brand'", description: 'Folder tint and hover glow.' },
      { name: 'papers', type: 'string[]', default: "['Brief', 'Wireframes', 'Assets']", description: 'Up to three paper labels.' },
      { name: 'open', type: 'boolean', description: 'Forces the open state. Otherwise it follows hover and focus.' },
      { name: 'onClick', type: '() => void', description: 'Click handler for the folder.' },
    ],
  },
];
