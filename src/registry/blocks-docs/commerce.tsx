import type { DocEntry } from '@/docs/types';
import { CardFolderDemo } from '@/components/blocks/CardFolder';
import { FixturesDemo } from '@/components/blocks/Fixtures';
import { AvailabilitySchedulerDemo } from '@/components/blocks/AvailabilityScheduler';
import { MultichainSwapDemo } from '@/components/blocks/MultichainSwap';
import { ActionBarDemo } from '@/components/blocks/ActionBar';
import { OverflowActionsDemo } from '@/components/blocks/OverflowActions';

export const commerceBlockEntries: DocEntry[] = [
  {
    slug: 'card-folder',
    name: 'Card Folder',
    description: 'A wallet of payment cards that fans out on hover. Pick one and it rises out of the pocket.',
    demos: [
      {
        title: 'Wallet',
        description: 'Hover to fan the cards out, click one to select it, click it again to put it back.',
        component: CardFolderDemo,
        height: 460,
        code: `import { CardFolder } from '@/components/blocks/CardFolder';

export function PaymentMethod() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <CardFolder
      cards={[
        { id: 'a', brand: 'Visa', last4: '4242', holder: 'Mira Chen', balance: '$4,820.12',
          gradient: 'from-brand-400 via-brand-600 to-brand-900' },
        { id: 'b', brand: 'Amex', last4: '1005', holder: 'Mira Chen', balance: '$12,930.00',
          gradient: 'from-emerald-300 via-teal-500 to-sky-700' },
      ]}
      selected={selected}
      onSelect={setSelected}
    />
  );
}`,
      },
    ],
    props: [
      { name: 'cards', type: 'WalletCard[]', description: 'Cards with brand, last4, holder, gradient and balance.' },
      { name: 'selected', type: 'string | null', description: 'Id of the selected card, which lifts out of the wallet.' },
      { name: 'onSelect', type: '(id: string | null) => void', description: 'Called with the clicked card id, or null when it is clicked again.' },
    ],
  },
  {
    slug: 'fixtures',
    name: 'Fixtures',
    description: 'A sports scoreboard with day tabs, live match minutes behind a pulsing indicator and kickoff reminders.',
    demos: [
      {
        title: 'Matchday',
        description: 'Switch days with the sliding tabs. Live minutes tick up, and upcoming games can be set to remind you.',
        component: FixturesDemo,
        height: 460,
        code: `import { Fixtures } from '@/components/blocks/Fixtures';

export function Scores() {
  return (
    <Fixtures
      defaultDay="t"
      days={[
        {
          id: 't', label: 'Today', date: 'Sun 15',
          fixtures: [
            { id: '1', home: arsenal, away: chelsea, status: 'live', score: [2, 1], minute: 67, league: 'Premier League' },
            { id: '2', home: newcastle, away: liverpool, status: 'upcoming', kickoff: '19:45', league: 'Premier League' },
          ],
        },
      ]}
    />
  );
}`,
      },
    ],
    props: [
      { name: 'days', type: 'Array<{ id; label; date; fixtures: Fixture[] }>', description: 'One tab per day, each with its fixtures.' },
      { name: 'defaultDay', type: 'string', default: "'t'", description: 'Id of the day selected on mount.' },
      { name: 'Fixture.status', type: "'live' | 'ft' | 'upcoming'", description: 'Live shows score and minute, FT shows the final score, upcoming shows kickoff and a reminder.' },
    ],
  },
  {
    slug: 'availability-scheduler',
    name: 'Availability Scheduler',
    description: 'Set weekly working hours with day toggles and time ranges that animate as they are added or removed.',
    demos: [
      {
        title: 'Working hours',
        description: 'Turn days on and off, add split shifts with +, and remove ranges. Weekly hours update as you edit.',
        component: AvailabilitySchedulerDemo,
        height: 560,
        code: `import { AvailabilityScheduler, DEFAULT_WEEK } from '@/components/blocks/AvailabilityScheduler';

export function HoursSettings() {
  const [week, setWeek] = useState(DEFAULT_WEEK);

  return (
    <section className="rounded-2xl bg-ink-900 p-5">
      <h2 className="text-sm font-medium">Working hours</h2>
      <AvailabilityScheduler value={week} onChange={setWeek} />
      <button onClick={() => api.saveAvailability(week)}>Save</button>
    </section>
  );
}`,
      },
    ],
    props: [
      { name: 'value', type: 'DaySchedule[]', description: 'One entry per weekday with enabled flag and time ranges.' },
      { name: 'onChange', type: '(next: DaySchedule[]) => void', description: 'Called with the updated week after any edit.' },
      { name: 'TimeRange', type: '{ id: number; start: string; end: string }', description: 'Times are HH:mm in 30-minute steps. Ranges that end before they start are flagged.' },
    ],
  },
  {
    slug: 'multichain-swap',
    name: 'Multi-chain Swap',
    description: 'A token swap card with chain-aware selectors, a rotating flip control, live rate and fee, and a button that reflects every state.',
    demos: [
      {
        title: 'Swap',
        description: 'Change tokens, type an amount or tap Max, and flip direction. Choosing tokens on different chains routes through a bridge.',
        component: MultichainSwapDemo,
        height: 560,
        code: `import { MultichainSwap } from '@/components/blocks/MultichainSwap';

export function Trade() {
  return (
    <div className="flex justify-center">
      <MultichainSwap slippage={0.5} />
    </div>
  );
}

// Button label is derived from state:
// 'Enter an amount' → 'Insufficient ETH' → 'Swap' | 'Bridge & swap'
// → 'Swapping…' → 'Swap complete'`,
      },
    ],
    props: [
      { name: 'slippage', type: 'number', default: '0.5', description: 'Max slippage percentage shown in the header.' },
      { name: 'TOKENS', type: 'Token[]', description: 'Exported token list with symbol, chain, USD price and balance.' },
      { name: 'Token.chain', type: 'string', description: 'When the two tokens are on different chains, the route and fee include a bridge.' },
    ],
  },
  {
    slug: 'action-bar',
    name: 'Expandable Action Bar',
    description: 'A floating bar that springs up from the bottom when list items are selected, showing a live count and bulk actions.',
    demos: [
      {
        title: 'Bulk file actions',
        description: 'Select files to reveal the bar. Archive or delete collapses the rows; Escape clears the selection.',
        component: ActionBarDemo,
        height: 440,
        code: `import { ActionBar } from '@/components/blocks/ActionBar';

export function FileList({ files }) {
  const [selected, setSelected] = useState<number[]>([]);

  return (
    <div className="relative h-96">
      {/* …rows that toggle ids in \`selected\` */}
      <ActionBar
        count={selected.length}
        onClear={() => setSelected([])}
        actions={[
          { id: 'share', label: 'Share', icon: Share2, onClick: share },
          { id: 'archive', label: 'Archive', icon: Archive, onClick: archive },
          { id: 'delete', label: 'Delete', icon: Trash2, danger: true, onClick: remove },
        ]}
      />
    </div>
  );
}`,
      },
    ],
    props: [
      { name: 'count', type: 'number', description: 'Selected count. The bar shows when it is above zero.' },
      { name: 'actions', type: 'BarAction[]', description: 'Buttons with label, icon, click handler and optional danger style.' },
      { name: 'onClear', type: '() => void', description: 'Called by the × button and by Escape.' },
      { name: 'label', type: '(n: number) => ReactNode', default: '`${n} selected`', description: 'Custom count label.' },
    ],
  },
  {
    slug: 'overflow-actions',
    name: 'Overflow Actions',
    description: 'A toolbar that measures itself and moves actions into a “more” menu as space runs out, with smooth width transitions.',
    demos: [
      {
        title: 'Responsive toolbar',
        description: 'Drag the slider to shrink the container. The badge shows how many actions are hidden.',
        component: OverflowActionsDemo,
        height: 400,
        code: `import { OverflowActions } from '@/components/blocks/OverflowActions';

export function EditorToolbar() {
  return (
    <OverflowActions
      actions={[
        { id: 'bold', label: 'Bold', icon: Bold },
        { id: 'italic', label: 'Italic', icon: Italic },
        { id: 'link', label: 'Link', icon: Link },
        { id: 'share', label: 'Share', icon: Share2 },
        { id: 'delete', label: 'Delete', icon: Trash2, danger: true },
      ]}
      onAction={(a) => editor.run(a.id)}
    />
  );
}`,
      },
    ],
    props: [
      { name: 'actions', type: 'ToolbarAction[]', description: 'Actions in priority order. The last ones move into the menu first.' },
      { name: 'onAction', type: '(action: ToolbarAction) => void', description: 'Called from the toolbar or the overflow menu.' },
      { name: 'ToolbarAction.danger', type: 'boolean', default: 'false', description: 'Shows the action in rose.' },
    ],
  },
];
