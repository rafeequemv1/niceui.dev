import type { DocEntry } from '@/docs/types';
import { ScrollAreaDemo } from '@/components/structure/ScrollArea';
import { SkeletonDemo } from '@/components/structure/Skeleton';
import { PaginationDemo } from '@/components/structure/Pagination';

export const controlsBasicEntries: DocEntry[] = [
  {
    slug: 'scroll-area',
    name: 'Scroll Area',
    description:
      'A custom scrollbar for React: thin bars that grow on hover and fade when idle, a draggable thumb, click-to-jump tracks and soft fade edges, for vertical, horizontal or both. Native wheel, touch and keyboard scrolling keep working.',
    badge: 'New',
    demos: [
      {
        title: 'Vertical, horizontal and both',
        description: 'Scroll, drag a thumb, or click a track to jump. Focus an area and use the arrow keys.',
        component: ScrollAreaDemo,
        height: 520,
        code: `import { ScrollArea } from '@/components/structure/ScrollArea';

<ScrollArea viewportClassName="h-72" aria-label="Changelog">
  {/* long content */}
</ScrollArea>

<ScrollArea orientation="horizontal">
  <div className="flex gap-2">{/* chips */}</div>
</ScrollArea>`,
      },
    ],
    props: [
      { name: 'orientation', type: "'vertical' | 'horizontal' | 'both'", default: "'vertical'", description: 'Which directions scroll.' },
      { name: 'fades', type: 'boolean', default: 'true', description: 'Fade edges where more content is hidden.' },
      { name: 'hideDelay', type: 'number', default: '900', description: 'Milliseconds before idle bars fade out. 0 keeps them visible.' },
      { name: 'viewportClassName', type: 'string', description: 'Classes for the scrolling viewport; set its height or max-height here.' },
      { name: 'aria-label', type: 'string', description: 'Accessible name for the scrollable region.' },
    ],
  },
  {
    slug: 'skeleton',
    name: 'Skeleton',
    description:
      'Skeleton loaders and placeholders for React with shimmer or pulse animation, plus ready-made layouts for cards, list rows, profiles, tables, chat messages and articles that crossfade into the real content.',
    badge: 'New',
    demos: [
      {
        title: 'Loading to content',
        description: 'Watch the placeholders crossfade into content, switch between shimmer and pulse, and press Reload to see it again.',
        component: SkeletonDemo,
        height: 900,
        code: `import { Skeleton, SkeletonGroup, SkeletonCard, SkeletonListRow } from '@/components/structure/Skeleton';

<SkeletonGroup loading={isLoading}>
  {isLoading ? <SkeletonCard /> : <PostCard post={post} />}
</SkeletonGroup>

// or build your own
<Skeleton circle className="h-10 w-10" />
<Skeleton variant="pulse" className="h-4 w-48" />`,
      },
    ],
    props: [
      { name: 'variant', type: "'shimmer' | 'pulse'", default: "'shimmer'", description: 'Sweeping highlight or a gentle fade.' },
      { name: 'circle', type: 'boolean', default: 'false', description: 'Round placeholder for avatars.' },
      { name: 'className', type: 'string', description: 'Size and shape, e.g. h-4 w-32 or aspect-video w-full.' },
      { name: 'SkeletonGroup loading', type: 'boolean', default: 'true', description: 'Announces loading to screen readers once and adds the animation styles.' },
    ],
  },
  {
    slug: 'pagination',
    name: 'Pagination',
    description:
      'Numbered pagination for React with smart ellipsis, previous/next and first/last buttons, a sliding active indicator, a rows-per-page select, a go-to-page field and a compact "3 of 12" variant for phones.',
    badge: 'New',
    demos: [
      {
        title: 'Table pagination and compact',
        description: 'Click a page or use the arrow keys, Home and End. Change rows per page, or type a page number and press Enter.',
        component: PaginationDemo,
        height: 600,
        code: `import { Pagination, CompactPagination, PaginationFooter } from '@/components/structure/Pagination';

const [page, setPage] = useState(1);

<Pagination page={page} pageCount={25} onPageChange={setPage} />
<CompactPagination page={page} pageCount={12} onPageChange={setPage} />`,
      },
    ],
    props: [
      { name: 'page', type: 'number', description: 'Current page, starting at 1.' },
      { name: 'pageCount', type: 'number', description: 'Total number of pages.' },
      { name: 'onPageChange', type: '(page: number) => void', description: 'Called with the new page.' },
      { name: 'siblings', type: 'number', default: '1', description: 'Pages shown either side of the current one.' },
      { name: 'showEdges', type: 'boolean', default: 'true', description: 'Show first and last page buttons.' },
    ],
  },
];
