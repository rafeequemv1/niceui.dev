import type { DocEntry } from '@/docs/types';
import { CircularProgressDemo } from '@/components/media/CircularProgress';
import { ImageLoaderDemo } from '@/components/media/ImageLoader';
import { RadialMenuDemo } from '@/components/media/RadialMenu';
import { VideoScrubberDemo } from '@/components/media/VideoScrubber';

export const controlsMoreEntries: DocEntry[] = [
  {
    slug: 'circular-progress',
    name: 'Circular Progress Bar',
    description: 'An animated circular progress bar for React: a gradient SVG ring with a value label, a stepped variant, an indeterminate spinner, and circular progress buttons for hold-to-confirm and upload progress.',
    badge: 'New',
    demos: [
      {
        title: 'Rings, steps and progress buttons',
        description: 'Drag the slider to set the value. Press and hold the delete button (or hold Space), and click upload.',
        component: CircularProgressDemo,
        height: 520,
        code: `import { CircularProgress, HoldToConfirmButton, UploadProgressButton } from '@/components/media/CircularProgress';

<CircularProgress value={64} />
<CircularProgress value={64} segments={8} colors={['#c4b5fd', '#7c3aed']} />
<CircularProgress indeterminate />
<HoldToConfirmButton duration={1200} onConfirm={deleteItem} />
<UploadProgressButton />`,
      },
    ],
    props: [
      { name: 'value', type: 'number', default: '0', description: 'Progress from 0 to 100.' },
      { name: 'indeterminate', type: 'boolean', default: 'false', description: 'Spin without a value, for unknown durations.' },
      { name: 'size', type: 'number', default: '120', description: 'Diameter in pixels.' },
      { name: 'thickness', type: 'number', default: '10', description: 'Stroke width in pixels.' },
      { name: 'segments', type: 'number', description: 'Split the ring into steps; the label shows "done/total".' },
      { name: 'label', type: 'boolean | ReactNode', default: 'true', description: 'Show the percentage, hide it, or pass your own centre content.' },
      { name: 'colors', type: '[string, string]', default: "['#7dd3fc', '#0284c7']", description: 'Gradient start and end colours.' },
      { name: 'duration (HoldToConfirmButton)', type: 'number', default: '1200', description: 'How long to hold, in ms, before onConfirm fires.' },
    ],
  },
  {
    slug: 'image-loader',
    name: 'Image Loader',
    description: 'Blur-up image loading for React: a tiny blurred preview or a shimmer skeleton while the full image loads, then a blur, fade or scale reveal, plus an error state with retry.',
    badge: 'New',
    demos: [
      {
        title: 'Blur-up, skeleton and error states',
        description: 'Images arrive on a simulated slow network. The third fails first; press Retry. Replay to watch again.',
        component: ImageLoaderDemo,
        height: 420,
        code: `import { ImageLoader } from '@/components/media/ImageLoader';

<ImageLoader
  src="/photos/coast-1600.jpg"
  placeholder="/photos/coast-24.jpg" // ~1 KB, shown blurred
  alt="Coastline at dawn"
  reveal="blur"
  className="aspect-[3/2] w-full"
/>`,
      },
    ],
    props: [
      { name: 'src', type: 'string', description: 'The full-size image.' },
      { name: 'placeholder', type: 'string', description: 'A tiny version shown blurred while loading (blur-up).' },
      { name: 'alt', type: 'string', description: 'Alternative text for the image.' },
      { name: 'reveal', type: "'blur' | 'fade' | 'scale'", default: "'blur'", description: 'How the sharp image appears once loaded.' },
      { name: 'skeleton', type: 'boolean', default: 'true', description: 'Show a shimmer when there is no placeholder.' },
      { name: 'delay / failFirst', type: 'number / boolean', description: 'Demo helpers to simulate a slow network or a failed first load.' },
    ],
  },
  {
    slug: 'radial-menu',
    name: 'Radial Menu',
    description: 'A radial circle menu for React: actions fan out around a floating button with a spring, as a full circle or a quarter circle from a corner, with hover labels, arrow-key navigation and Esc to close.',
    badge: 'New',
    demos: [
      {
        title: 'Full circle and corner menus',
        description: 'Click the plus button. Use the arrow keys to move between actions, Enter to pick one, Esc to close.',
        component: RadialMenuDemo,
        height: 420,
        code: `import { RadialMenu } from '@/components/media/RadialMenu';
import { Camera, Mic, Video } from 'lucide-react';

<RadialMenu
  label="Create"
  items={[
    { label: 'Photo', icon: Camera, onSelect: takePhoto },
    { label: 'Video', icon: Video, onSelect: recordVideo },
    { label: 'Voice note', icon: Mic, onSelect: recordVoice },
  ]}
/>

<RadialMenu variant="corner" radius={108} items={shareItems} />`,
      },
    ],
    props: [
      { name: 'items', type: '{ label: string; icon: ComponentType; onSelect?: () => void }[]', description: 'The actions around the button.' },
      { name: 'variant', type: "'full' | 'corner'", default: "'full'", description: 'Fan all the way round, or a quarter circle up and to the left.' },
      { name: 'radius', type: 'number', default: '96', description: 'Distance of the items from the centre, in pixels.' },
      { name: 'label', type: 'string', default: "'Quick actions'", description: 'Accessible name for the button and menu.' },
    ],
  },
  {
    slug: 'video-scrubber',
    name: 'Video Scrubber',
    description: 'A video scrubber timeline with chapters for React: segmented progress, a hover preview thumbnail with timecode, a buffered range, drag and keyboard seeking, and play/pause with chapter skipping.',
    badge: 'New',
    demos: [
      {
        title: 'Chapter timeline',
        description: 'Hover the timeline for a preview, drag or click to seek, or focus it and use the arrow keys (Shift for 10 s). Playback is simulated.',
        component: VideoScrubberDemo,
        height: 560,
        code: `import { VideoScrubber } from '@/components/media/VideoScrubber';

const video = useRef<HTMLVideoElement>(null);
const [time, setTime] = useState(0);

<VideoScrubber
  duration={video.current?.duration ?? 0}
  time={time}
  buffered={bufferedEnd}
  onSeek={(t) => { video.current!.currentTime = t; setTime(t); }}
  chapters={[{ start: 0, title: 'Intro' }, { start: 48, title: 'The coastline' }]}
  preview={(t) => thumbnailAt(t)}
/>`,
      },
    ],
    props: [
      { name: 'duration', type: 'number', description: 'Total length in seconds.' },
      { name: 'time', type: 'number', description: 'Current time in seconds.' },
      { name: 'onSeek', type: '(t: number) => void', description: 'Called while dragging, clicking or pressing arrow keys.' },
      { name: 'chapters', type: '{ start: number; title: string }[]', description: 'Chapter markers; the timeline splits into segments.' },
      { name: 'buffered', type: 'number', default: '0', description: 'Seconds loaded so far, drawn as a lighter range.' },
      { name: 'preview', type: '(t: number) => string', description: 'Returns a thumbnail URL for the hover preview.' },
    ],
  },
];
