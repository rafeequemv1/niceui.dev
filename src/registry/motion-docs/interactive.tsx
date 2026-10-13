import type { DocEntry } from '@/docs/types';
import { FileTreeDemo } from '@/components/ui/motion/FileTree';
import { SortableListDemo } from '@/components/ui/motion/SortableList';
import { ShaderBackgroundDemo } from '@/components/ui/motion/ShaderBackground';
import { CylinderCarouselDemo } from '@/components/ui/motion/CylinderCarousel';
import { WheelPickerDemo } from '@/components/ui/motion/WheelPicker';
import { ImageViewerDemo } from '@/components/ui/motion/ImageViewer';
import { SharedLayoutBackgroundDemo } from '@/components/ui/motion/SharedLayoutBackground';

export const interactiveEntries: DocEntry[] = [
  {
    slug: 'file-tree',
    name: 'File Tree',
    description: 'A nested file explorer with animated expand/collapse, indent guides and typed file icons.',
    demos: [
      {
        title: 'Project explorer',
        component: FileTreeDemo,
        height: 440,
        code: `import { FileTree, type TreeNode } from '@/components/ui/motion/FileTree';

const tree: TreeNode[] = [
  {
    name: 'src',
    children: [
      { name: 'components', children: [{ name: 'Button.tsx' }, { name: 'Dock.tsx' }] },
      { name: 'App.tsx' },
    ],
  },
  { name: 'package.json' },
];

export function Explorer() {
  return <FileTree data={tree} defaultExpanded={['/src']} onSelect={(path) => openFile(path)} />;
}`,
      },
    ],
    props: [
      { name: 'data', type: 'TreeNode[]', description: 'Nodes; a node with `children` is a folder.' },
      { name: 'defaultExpanded', type: 'string[]', default: '[]', description: 'Folder paths (e.g. "/src") open initially.' },
      { name: 'onSelect', type: '(path: string) => void', description: 'Called with the full path of the clicked node.' },
      { name: 'className', type: 'string', description: 'Classes for the tree wrapper.' },
    ],
  },
  {
    slug: 'sortable-list',
    name: 'Sortable List',
    description: 'Pointer-driven drag reordering where siblings slide out of the way and the item settles into place.',
    demos: [
      {
        title: 'Weekly priorities',
        component: SortableListDemo,
        height: 440,
        code: `import { SortableList } from '@/components/ui/motion/SortableList';

export function Priorities() {
  const [tasks, setTasks] = useState(initialTasks);
  return (
    <SortableList
      items={tasks}
      getId={(t) => t.id}
      onReorder={setTasks}
      rowHeight={56}
      renderItem={(task) => <span className="flex-1 text-sm">{task.title}</span>}
    />
  );
}`,
      },
    ],
    props: [
      { name: 'items', type: 'T[]', description: 'Items in their current order.' },
      { name: 'getId', type: '(item: T) => string', description: 'Stable key for each item.' },
      { name: 'onReorder', type: '(items: T[]) => void', description: 'Receives the reordered array on drop.' },
      { name: 'renderItem', type: '(item: T, dragging: boolean) => ReactNode', description: 'Row content rendered next to the grip.' },
      { name: 'rowHeight', type: 'number', default: '56', description: 'Fixed row height in px.' },
      { name: 'gap', type: 'number', default: '8', description: 'Space between rows in px.' },
    ],
  },
  {
    slug: 'shader-background',
    name: 'Shader Background',
    description: 'A canvas-rendered animated gradient mesh with film grain, perfect behind hero sections.',
    badge: 'New',
    demos: [
      {
        title: 'Hero',
        component: ShaderBackgroundDemo,
        height: 420,
        code: `import { ShaderBackground } from '@/components/ui/motion/ShaderBackground';

export function Hero() {
  return (
    <ShaderBackground
      colors={['#1b77f5', '#2dd4bf', '#59b6ff', '#f59e0b']}
      speed={1}
      className="flex h-[520px] items-center justify-center rounded-3xl"
    >
      <h1 className="text-5xl font-semibold text-white">Design at the speed of thought</h1>
    </ShaderBackground>
  );
}`,
      },
    ],
    props: [
      { name: 'colors', type: 'string[]', default: 'azure / teal / amber palette', description: 'Hex colors of the moving blobs.' },
      { name: 'speed', type: 'number', default: '1', description: 'Animation speed multiplier.' },
      { name: 'base', type: 'string', default: "'#0a0a0c'", description: 'Background color under the mesh.' },
      { name: 'grain', type: 'boolean', default: 'true', description: 'Overlay subtle film grain.' },
      { name: 'children', type: 'ReactNode', description: 'Content rendered above the mesh.' },
    ],
  },
  {
    slug: 'cylinder-carousel',
    name: 'Cylinder Carousel',
    description: 'A 3D rotating cylinder of cards built with CSS transforms, draggable and keyboard navigable.',
    demos: [
      {
        title: 'Destinations',
        component: CylinderCarouselDemo,
        height: 440,
        code: `import { CylinderCarousel } from '@/components/ui/motion/CylinderCarousel';

const cards = [
  { id: 'kyoto', title: 'Kyoto', subtitle: 'Temples at dawn', gradient: 'linear-gradient(#f43f5e, #f59e0b)' },
  { id: 'reykjavik', title: 'Reykjavík', subtitle: 'Northern lights', gradient: 'linear-gradient(#2dd4bf, #3396ff)' },
  // ...at least 6 cards look best
];

export function Destinations() {
  return <CylinderCarousel cards={cards} cardWidth={200} cardHeight={260} />;
}`,
      },
    ],
    props: [
      { name: 'cards', type: 'CylinderCard[]', description: 'Cards placed evenly around the cylinder.' },
      { name: 'cardWidth', type: 'number', default: '200', description: 'Card width; also determines the radius.' },
      { name: 'cardHeight', type: 'number', default: '260', description: 'Card height in px.' },
      { name: 'sensitivity', type: 'number', default: '0.35', description: 'Degrees rotated per dragged pixel.' },
    ],
  },
  {
    slug: 'wheel-picker',
    name: 'Wheel Picker',
    description: 'iOS-style scroll-snapping wheels with 3D rotation and depth fade.',
    demos: [
      {
        title: 'Time picker',
        component: WheelPickerDemo,
        height: 400,
        code: `import { Wheel } from '@/components/ui/motion/WheelPicker';

const hours = Array.from({ length: 12 }, (_, i) => String(i + 1));
const minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

export function AlarmPicker() {
  const [h, setH] = useState('7');
  const [m, setM] = useState('30');
  const [p, setP] = useState('AM');
  return (
    <div className="flex">
      <Wheel options={hours} value={h} onChange={setH} label="Hour" />
      <Wheel options={minutes} value={m} onChange={setM} label="Minute" />
      <Wheel options={['AM', 'PM']} value={p} onChange={setP} label="Period" />
    </div>
  );
}`,
      },
    ],
    props: [
      { name: 'options', type: 'string[]', description: 'Values shown on the wheel.' },
      { name: 'value', type: 'string', description: 'Selected value.' },
      { name: 'onChange', type: '(value: string) => void', description: 'Fires once scrolling settles.' },
      { name: 'width', type: 'number', default: '64', description: 'Wheel width in px.' },
      { name: 'label', type: 'string', description: 'Accessible name of the listbox.' },
    ],
  },
  {
    slug: 'image-viewer',
    name: 'Image Viewer',
    description: 'A thumbnail grid that expands into a lightbox with click-to-zoom and keyboard navigation.',
    demos: [
      {
        title: 'Gallery',
        component: ImageViewerDemo,
        code: `import { ImageViewer } from '@/components/ui/motion/ImageViewer';

const images = [
  { id: 'dune', title: 'Dune at dusk', art: 'url(/photos/dune.jpg) center / cover' },
  { id: 'fjord', title: 'Fjord morning', art: 'url(/photos/fjord.jpg) center / cover' },
  { id: 'meadow', title: 'Alpine meadow', art: 'url(/photos/meadow.jpg) center / cover' },
];

export function Gallery() {
  return <ImageViewer images={images} columns={3} />;
}`,
      },
    ],
    props: [
      { name: 'images', type: '{ id: string; title: string; art: string }[]', description: 'Images; `art` is any CSS background value.' },
      { name: 'columns', type: 'number', default: '3', description: 'Thumbnail grid columns.' },
    ],
  },
  {
    slug: 'shared-layout-background',
    name: 'Shared Layout Background',
    description: 'A single highlight that glides between hovered nav or menu items.',
    demos: [
      {
        title: 'Tabs & menu',
        component: SharedLayoutBackgroundDemo,
        height: 460,
        code: `import { SharedLayoutBackground } from '@/components/ui/motion/SharedLayoutBackground';

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'deployments', label: 'Deployments' },
  { id: 'analytics', label: 'Analytics' },
];

export function ProjectNav() {
  const [tab, setTab] = useState('overview');
  return <SharedLayoutBackground items={tabs} activeId={tab} onSelect={setTab} />;
}`,
      },
    ],
    props: [
      { name: 'items', type: '{ id; label; icon?; hint? }[]', description: 'Items sharing the highlight.' },
      { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Layout direction.' },
      { name: 'activeId', type: 'string', description: 'Currently selected item.' },
      { name: 'onSelect', type: '(id: string) => void', description: 'Click handler.' },
    ],
  },
];
