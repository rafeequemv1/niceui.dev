import type { DocEntry } from '@/docs/types';
import { TableDemo } from '@/components/ui/core/Table';
import { BreadcrumbDemo } from '@/components/ui/core/Breadcrumb';
import { StepperDemo } from '@/components/ui/core/Stepper';
import { AspectRatioDemo } from '@/components/ui/core/AspectRatio';
import { DateRangePickerDemo } from '@/components/ui/core/DateRangePicker';

export const dataEntries: DocEntry[] = [
  {
    slug: 'table',
    name: 'Table',
    description: 'A data table with sortable columns, row selection, status badges, hover actions and pagination.',
    demos: [
      {
        title: 'Invoices',
        description: 'Sort by any column, select rows and page through results.',
        component: TableDemo,
        height: 520,
        code: `import { Badge } from '@/components/ui/core/Badge';
import { Checkbox } from '@/components/ui/core/Checkbox';

const sorted = [...invoices].sort(
  (a, b) => (a[sort.key] < b[sort.key] ? -1 : 1) * sort.dir,
);

<table className="w-full text-sm">
  <tbody>
    {sorted.slice(page * 5, page * 5 + 5).map((inv) => (
      <tr key={inv.id} className="border-b border-white/5 hover:bg-white/[0.025]">
        <td><Checkbox checked={selected.includes(inv.id)} onChange={() => toggle(inv.id)} /></td>
        <td className="font-mono text-xs">{inv.id}</td>
        <td>{inv.customer}</td>
        <td><Badge tone={TONE[inv.status]} dot>{inv.status}</Badge></td>
        <td className="text-right tabular-nums">{money(inv.amount)}</td>
      </tr>
    ))}
  </tbody>
</table>`,
      },
    ],
    props: [
      { name: 'sort', type: '{ key; dir: 1 | -1 }', description: 'Active column and direction; click a header to toggle.' },
      { name: 'selected', type: 'string[]', description: 'Selected row ids; the header checkbox is indeterminate when partial.' },
      { name: 'page', type: 'number', description: 'Zero-based page index (5 rows per page).' },
      { name: 'status', type: "'Paid' | 'Pending' | 'Overdue' | 'Refunded'", description: 'Maps to a Badge tone.' },
    ],
  },
  {
    slug: 'breadcrumb',
    name: 'Animated Breadcrumb',
    description: 'Long paths collapse their middle into an ellipsis that expands with a staggered reveal on click.',
    demos: [
      {
        title: 'Deployment path',
        component: BreadcrumbDemo,
        height: 260,
        code: `import { Breadcrumb } from '@/components/ui/core/Breadcrumb';
import { Home, Folder } from 'lucide-react';

export function Path() {
  return (
    <Breadcrumb
      maxVisible={3}
      onNavigate={(i) => router.push(paths[i])}
      items={[
        { label: 'Acme', icon: <Home /> },
        { label: 'Projects', icon: <Folder /> },
        { label: 'web-app' },
        { label: 'Deployments' },
        { label: 'Build logs' },
      ]}
    />
  );
}`,
      },
    ],
    props: [
      { name: 'items', type: '{ label: string; icon?: ReactNode }[]', description: 'Path segments; the last is the current page.' },
      { name: 'maxVisible', type: 'number', default: '3', description: 'Items shown before the middle collapses.' },
      { name: 'onNavigate', type: '(index: number) => void', description: 'Called when a segment is clicked.' },
    ],
  },
  {
    slug: 'stepper',
    name: 'Adaptive Stepper',
    description: 'A multi-step flow with filling connectors, check-morphing step nodes and direction-aware sliding content.',
    demos: [
      {
        title: 'Onboarding',
        component: StepperDemo,
        height: 480,
        code: `import { Stepper } from '@/components/ui/core/Stepper';
import { User, Building2, CreditCard, Rocket } from 'lucide-react';

export function Onboarding() {
  const [step, setStep] = useState(0);
  return (
    <>
      <Stepper
        current={step}
        onStepClick={setStep}
        steps={[
          { id: 'account', label: 'Account', icon: <User /> },
          { id: 'team', label: 'Workspace', icon: <Building2 /> },
          { id: 'billing', label: 'Billing', icon: <CreditCard /> },
          { id: 'launch', label: 'Launch', icon: <Rocket /> },
        ]}
      />
      <StepContent step={step} />
    </>
  );
}`,
      },
    ],
    props: [
      { name: 'steps', type: '{ id: string; label: string; icon?: ReactNode }[]', description: 'Step definitions.' },
      { name: 'current', type: 'number', description: 'Zero-based active step.' },
      { name: 'onStepClick', type: '(index: number) => void', description: 'Lets users jump back to completed steps.' },
    ],
  },
  {
    slug: 'aspect-ratio',
    name: 'Aspect Ratio',
    description: 'Lock content to a ratio. Switching ratios morphs the frame with a spring.',
    demos: [
      {
        title: 'Ratio presets',
        component: AspectRatioDemo,
        height: 420,
        code: `import { AspectRatio } from '@/components/ui/core/AspectRatio';

export function VideoThumb() {
  return (
    <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-2xl">
      <img
        src="/thumbnail.jpg"
        alt="Launch keynote"
        className="h-full w-full object-cover"
      />
    </AspectRatio>
  );
}`,
      },
    ],
    props: [
      { name: 'ratio', type: 'number', description: 'Width divided by height, e.g. 16 / 9.' },
      { name: 'children', type: 'ReactNode', description: 'Content filling the frame.' },
      { name: 'className', type: 'string', description: 'Classes for the wrapper.' },
    ],
  },
  {
    slug: 'date-range-picker',
    name: 'Date Range Picker',
    description: 'Month grid with start/end selection, hover preview, quick presets and sliding month navigation.',
    demos: [
      {
        title: 'Analytics range',
        component: DateRangePickerDemo,
        height: 560,
        code: `import { DateRangePicker, type DateRange } from '@/components/ui/core/DateRangePicker';

export function ReportRange() {
  const [range, setRange] = useState<DateRange>({
    start: new Date(2025, 1, 3),
    end: new Date(2025, 1, 9),
  });

  return <DateRangePicker value={range} onChange={setRange} />;
}`,
      },
    ],
    props: [
      { name: 'value', type: '{ start: Date | null; end: Date | null }', description: 'Selected range.' },
      { name: 'onChange', type: '(range: DateRange) => void', description: 'Called on each click and preset.' },
    ],
  },
];
