import type { DocEntry } from '@/docs/types';
import { ExpandableTabsDemo } from '@/components/blocks/ExpandableTabs';
import { MorphingTabsDemo } from '@/components/blocks/MorphingTabs';
import { SwipeableListDemo } from '@/components/blocks/SwipeableList';
import { FileUploadDemo } from '@/components/blocks/FileUpload';
import { PredictionMarketDemo } from '@/components/blocks/PredictionMarket';
import { WalletCardDemo } from '@/components/blocks/WalletCard';

export const interactionBlockEntries: DocEntry[] = [
  {
    slug: 'expandable-tabs',
    name: 'Expandable Tabs',
    description: 'Compact icon tabs where the active one stretches open to show its label.',
    demos: [
      {
        title: 'Brand and neutral',
        description: 'Click a tab to expand it, or click it again to collapse it.',
        component: ExpandableTabsDemo,
        code: `import { ExpandableTabs } from '@/components/blocks/ExpandableTabs';

const tabs = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'inbox', label: 'Inbox', icon: Inbox, badge: 3 },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Toolbar() {
  const [value, setValue] = useState<string | null>('inbox');
  return <ExpandableTabs tabs={tabs} value={value} onChange={setValue} tone="brand" />;
}`,
      },
    ],
    props: [
      { name: 'tabs', type: 'ExpandableTab[]', description: 'Tabs with id, label, icon and optional badge count.' },
      { name: 'value', type: 'string | null', description: 'Id of the expanded tab, or null if none is expanded.' },
      { name: 'onChange', type: '(id: string | null) => void', description: 'Called with the clicked id. Clicking the active tab passes null.' },
      { name: 'tone', type: "'brand' | 'neutral'", default: "'brand'", description: 'Colour of the active tab.' },
    ],
  },
  {
    slug: 'morphing-tabs',
    name: 'Morphing Tabs',
    description: 'A segmented control whose indicator stretches toward the new tab before settling, while the panels crossfade.',
    demos: [
      {
        title: 'Analytics periods',
        description: 'The leading edge of the indicator moves first and the trailing edge follows, so it stretches like elastic.',
        component: MorphingTabsDemo,
        code: `import { MorphingTabs } from '@/components/blocks/MorphingTabs';

export function Overview() {
  return (
    <MorphingTabs
      defaultValue="week"
      onChange={(id) => analytics.track('period', id)}
      tabs={[
        { id: 'day', label: 'Today', content: <Stats period="day" /> },
        { id: 'week', label: 'Week', content: <Stats period="week" /> },
        { id: 'month', label: 'Month', content: <Stats period="month" /> },
      ]}
    />
  );
}`,
      },
    ],
    props: [
      { name: 'tabs', type: 'MorphTab[]', description: 'Tabs with id, label and panel content.' },
      { name: 'defaultValue', type: 'string', default: 'tabs[0].id', description: 'Tab selected on mount.' },
      { name: 'onChange', type: '(id: string) => void', description: 'Called when the selected tab changes.' },
    ],
  },
  {
    slug: 'swipeable-list',
    name: 'Swipeable List',
    description: 'Rows you can drag sideways to archive or delete, with rubber-band resistance, snap points and a collapsing exit.',
    demos: [
      {
        title: 'Inbox',
        description: 'Drag right to archive or left to delete. A short drag snaps open to show the action, a long drag completes it.',
        component: SwipeableListDemo,
        height: 500,
        code: `import { SwipeRow } from '@/components/blocks/SwipeableList';

export function Inbox({ mail, archive, remove }) {
  return (
    <div className="space-y-1.5">
      {mail.map((m) => (
        <SwipeRow key={m.id} onArchive={() => archive(m.id)} onDelete={() => remove(m.id)}>
          <div className="px-3 py-3">
            <p className="text-sm font-medium">{m.from}</p>
            <p className="text-xs text-ink-400">{m.subject}</p>
          </div>
        </SwipeRow>
      ))}
    </div>
  );
}`,
      },
    ],
    props: [
      { name: 'children', type: 'ReactNode', description: 'Row content. It slides over the action backgrounds.' },
      { name: 'onArchive', type: '() => void', description: 'Called once the row has been swiped right and has animated out.' },
      { name: 'onDelete', type: '() => void', description: 'Called once the row has been swiped left and has animated out.' },
    ],
  },
  {
    slug: 'file-upload',
    name: 'File Upload',
    description: 'A dropzone with a glowing drag-over state, a real file picker, per-file progress and animated removal.',
    demos: [
      {
        title: 'Dropzone',
        description: 'Drop files or click to browse. Uploads are simulated with realistic progress.',
        component: FileUploadDemo,
        height: 480,
        code: `import { FileUpload } from '@/components/blocks/FileUpload';

export function Attachments() {
  return (
    <FileUpload
      accept="image/*,application/pdf,audio/mpeg"
      maxSizeMb={25}
      multiple
    />
  );
}`,
      },
    ],
    props: [
      { name: 'accept', type: 'string', description: 'Passed to the file input, e.g. "image/*".' },
      { name: 'maxSizeMb', type: 'number', default: '25', description: 'Files larger than this are rejected with a shaking error message.' },
      { name: 'multiple', type: 'boolean', default: 'true', description: 'Allow selecting several files at once.' },
      { name: 'defaultItems', type: 'UploadItem[]', default: '[]', description: 'Initial files, e.g. ones already uploaded.' },
    ],
  },
  {
    slug: 'prediction-market',
    name: 'Prediction Market',
    description: 'A binary market card with a probability bar, an interactive SVG sparkline and a buy panel that calculates payout.',
    demos: [
      {
        title: 'Market',
        description: 'Hover the chart to scrub history. Pick Yes or No, set an amount and buy to move the odds.',
        component: PredictionMarketDemo,
        height: 680,
        code: `import { PredictionMarket } from '@/components/blocks/PredictionMarket';

export function MarketPage() {
  return (
    <PredictionMarket
      question="Will ETH close above $4,000 on Dec 31?"
      initialYes={64}
    />
  );
}

// payout = amount / price, where price = probability / 100
// e.g. $50 on Yes at 64¢ → 78.13 shares → $78.13 if Yes resolves`,
      },
    ],
    props: [
      { name: 'question', type: 'string', description: 'The market question.' },
      { name: 'initialYes', type: 'number', default: '64', description: 'Starting Yes probability in percent. No is 100 minus Yes.' },
    ],
  },
  {
    slug: 'wallet-card',
    name: 'Wallet Card',
    description: 'A crypto wallet summary with a counting balance, a privacy toggle, inline send and receive panels, and an asset list.',
    demos: [
      {
        title: 'Portfolio',
        description: 'Hide the balance, open Receive to copy the address, or send USDC to watch the balance count down.',
        component: WalletCardDemo,
        height: 640,
        code: `import { WalletCard } from '@/components/blocks/WalletCard';

export function Portfolio() {
  const { data: assets } = useAssets();

  return (
    <WalletCard
      address="0x71C9…3f8A"
      assets={assets.map((a) => ({
        symbol: a.symbol,
        name: a.name,
        amount: a.balance,
        price: a.usdPrice,
        change: a.change24h,
        color: 'from-sky-300 to-brand-600',
      }))}
    />
  );
}`,
      },
    ],
    props: [
      { name: 'assets', type: 'Asset[]', description: 'Holdings with amount, USD price, 24h change and gradient.' },
      { name: 'address', type: 'string', default: "'0x71C9…3f8A'", description: 'Address shown in the Receive panel.' },
    ],
  },
];
