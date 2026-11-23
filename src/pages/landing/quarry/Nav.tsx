import {
  AlignLeft,
  BarChart3,
  Blocks,
  BookOpen,
  Bot,
  CircleHelp,
  Clapperboard,
  CreditCard,
  FileWarning,
  GalleryHorizontal,
  Hourglass,
  Image,
  Info,
  LayoutDashboard,
  LayoutGrid,
  LayoutPanelTop,
  ListChecks,
  Megaphone,
  MousePointerClick,
  Navigation,
  Palette,
  PanelBottom,
  Quote,
  ScrollText,
  Sparkles,
  SquareStack,
  Type,
  Users,
  Wand2,
} from 'lucide-react';
import { MegaMenu, type MegaItem } from '@/components/marketing/MegaMenu';
import { Wordmark } from './ui';

const p = (art: number, title: string, meta: string, kind: 'mesh' | 'landscape' = 'landscape') => ({ art, title, meta, kind });

export const QUARRY_MENU: MegaItem[] = [
  {
    label: 'Library',
    menu: {
      kind: 'grid',
      heading: 'Page sections',
      columns: [
        [
          { label: 'Navigation', icon: Navigation, preview: p(7, 'Bars that stay out of the way', '24 sections') },
          { label: 'Heroes', icon: LayoutPanelTop, badge: 'New', preview: p(0, 'First screens worth stopping for', '61 sections') },
          { label: 'Features', icon: LayoutGrid, preview: p(2, 'Explain it in one glance', '38 sections', 'mesh') },
          { label: 'Bento grids', icon: Blocks, preview: p(8, 'Tiles that tell a story', '22 sections', 'mesh') },
          { label: 'Pricing', icon: CreditCard, preview: p(9, 'Plans people can compare', '19 sections') },
          { label: 'Dashboards', icon: LayoutDashboard, preview: p(4, 'Product shots that feel real', '15 sections', 'mesh') },
        ],
        [
          { label: 'About', icon: Info, preview: p(5, 'Tell the story behind it', '14 sections') },
          { label: 'Testimonials', icon: Quote, preview: p(6, 'Let customers say it', '27 sections') },
          { label: 'Stats', icon: BarChart3, preview: p(10, 'Numbers that land', '12 sections', 'mesh') },
          { label: 'Team', icon: Users, preview: p(3, 'Faces behind the work', '9 sections') },
          { label: 'Blog', icon: BookOpen, preview: p(11, 'Writing that gets read', '16 sections') },
          { label: 'FAQ', icon: CircleHelp, preview: p(1, 'Answers before the asks', '11 sections', 'mesh') },
        ],
        [
          { label: 'Calls to action', icon: Megaphone, preview: p(9, 'The last nudge', '21 sections', 'mesh') },
          { label: 'Gallery', icon: GalleryHorizontal, preview: p(0, 'Work, beautifully framed', '17 sections') },
          { label: 'Forms', icon: ListChecks, preview: p(7, 'Inputs people finish', '13 sections', 'mesh') },
          { label: 'Coming soon', icon: Hourglass, preview: p(8, 'Build the waitlist', '8 sections') },
          { label: 'Error pages', icon: FileWarning, preview: p(4, 'Lost, but in style', '7 sections') },
          { label: 'Footers', icon: PanelBottom, preview: p(2, 'A tidy place to end', '18 sections') },
        ],
      ],
    },
  },
  {
    label: 'Parts',
    menu: {
      kind: 'list',
      heading: 'UI parts',
      links: [
        { label: 'Type in motion', icon: Type, description: 'Split, stagger and settle headlines', preview: p(6, 'Words that arrive gently', 'Text', 'mesh') },
        { label: 'Buttons', icon: MousePointerClick, description: 'Pressable, magnetic and quiet CTAs', preview: p(9, 'Click-worthy, not loud', 'Buttons', 'mesh') },
        { label: 'Micro-interactions', icon: Sparkles, description: 'Hover, cursor and focus details', preview: p(1, 'The small stuff, done right', 'Details', 'mesh') },
        { label: 'Scroll scenes', icon: ScrollText, description: 'Pin, parallax and reveal on scroll', preview: p(3, 'Pages that unfold', 'Scroll') },
        { label: 'Page transitions', icon: Clapperboard, description: 'Cinematic moves between routes', preview: p(11, 'Cut, don’t jump', 'Motion') },
      ],
    },
  },
  {
    label: 'Templates',
    menu: {
      kind: 'list',
      links: [
        { label: 'Websites', icon: SquareStack, description: 'Whole sites, ready to fill in', preview: p(5, '24 full websites', 'Templates') },
        { label: 'Social posts', icon: Image, description: '1080 × 1350 posts as plain code', preview: p(8, 'Posts as components', 'Social', 'mesh') },
      ],
    },
  },
  {
    label: 'Tools',
    menu: {
      kind: 'list',
      links: [
        { label: 'Palette lab', icon: Palette, description: 'Turn one colour into a full theme', preview: p(1, 'One colour in, a theme out', 'Tool', 'mesh') },
        { label: 'Agent bridge', icon: Bot, description: 'Sections straight into your editor', preview: p(7, 'Ask, and it’s in your code', 'Agents') },
        { label: 'Copy polish', icon: Wand2, description: 'Rewrite headlines in your voice', preview: p(10, 'Headlines with a pulse', 'Tool', 'mesh') },
        { label: 'Changelog', icon: AlignLeft, description: 'What shipped this week', preview: p(0, 'Fresh every Thursday', 'Updates') },
      ],
    },
  },
  { label: 'Pricing', href: '#quarry-pricing' },
  { label: 'FAQ', href: '#quarry-faq' },
];

export function QuarryNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/[.05] bg-[#0e0e0d]/80 backdrop-blur-xl">
      <div className="mx-auto max-w-[1240px] px-5 md:px-8">
        <MegaMenu
          items={QUARRY_MENU}
          brand={
            <a href="#" aria-label="Quarry home">
              <Wordmark />
            </a>
          }
          actions={
            <>
              <a href="#" className="rounded-lg px-3 py-2 text-[13.5px] text-white/70 hover:text-white">
                Sign in
              </a>
              <a href="#" className="rounded-lg bg-[#f2efe9] px-3.5 py-2 text-[13.5px] font-medium text-[#141413] transition-colors hover:bg-white">
                Get started
              </a>
            </>
          }
        />
      </div>
    </header>
  );
}
