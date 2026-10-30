import type { DocEntry } from '@/docs/types';
import { RecordTableDemo } from '@/components/crm/RecordTable';
import { FilterBarDemo } from '@/components/crm/FilterBar';
import { PipelineBoardDemo } from '@/components/crm/PipelineBoard';
import { DealCardDemo } from '@/components/crm/DealCard';
import { CsvImportDemo } from '@/components/crm/CsvImport';

export const crmRecordEntries: DocEntry[] = [
  {
    slug: 'record-table',
    name: 'Record Table',
    description: 'A spreadsheet-style record grid with sticky columns, typed cells, inline editing, keyboard navigation and bulk actions.',
    badge: 'New',
    demos: [
      {
        title: 'People',
        description: 'Double-click or press Enter to edit a cell, arrow keys to move, Space to select. Selecting rows opens the bulk bar.',
        component: RecordTableDemo,
        height: 520,
        code: `import { RecordTable, type PersonRow } from '@/components/crm/RecordTable';

export function PeoplePage({ people }: { people: PersonRow[] }) {
  return (
    <RecordTable
      initialRows={people}
      onChange={(rows) => savePeople(rows)}
    />
  );
}`,
      },
    ],
    props: [
      { name: 'initialRows', type: 'PersonRow[]', description: 'Records to show. Each has name, email, phone, company, stage, arr, lastContact and rating.' },
      { name: 'initialSelected', type: 'string[]', default: '[]', description: 'Row ids selected on mount.' },
      { name: 'onChange', type: '(rows: PersonRow[]) => void', description: 'Called after edits, additions and deletions.' },
      { name: 'className', type: 'string', description: 'Extra classes for the outer card.' },
    ],
  },
  {
    slug: 'filter-bar',
    name: 'Filter & Sort Bar',
    description: 'Saved views, a step-by-step filter builder, sort chips and search over a list that filters live, with a save-view state.',
    badge: 'New',
    demos: [
      {
        title: 'Saved views',
        description: 'Switch views, add a filter (field, operator, value), flip the sort, then save the view.',
        component: FilterBarDemo,
        height: 560,
        code: `import { FilterBar, DEFAULT_VIEWS } from '@/components/crm/FilterBar';

<FilterBar
  people={people}
  views={DEFAULT_VIEWS}
  initialView="hot"
/>`,
      },
    ],
    props: [
      { name: 'people', type: 'FilterPerson[]', description: 'Rows to filter: name, company, stage, owner, city and arr.' },
      { name: 'views', type: 'SavedView[]', default: 'DEFAULT_VIEWS', description: 'Saved views, each with filters and a sort.' },
      { name: 'initialView', type: 'string', default: "'hot'", description: 'Id of the view selected on mount.' },
      { name: 'className', type: 'string', description: 'Extra classes for the outer card.' },
    ],
  },
  {
    slug: 'pipeline-board',
    name: 'Pipeline Board',
    description: 'An opportunities kanban with drag and drop between stages, column totals and weighted pipeline, and a celebration on Won.',
    badge: 'New',
    demos: [
      {
        title: 'Q4 pipeline',
        description: 'Drag a card to another stage, or focus a card and press ← →. Drop one in Won.',
        component: PipelineBoardDemo,
        height: 520,
        code: `import { PipelineBoard, type Deal } from '@/components/crm/PipelineBoard';

<PipelineBoard
  initialDeals={deals}
  onMove={(deal, stage) => updateDeal(deal.id, { stage })}
/>`,
      },
    ],
    props: [
      { name: 'initialDeals', type: 'Deal[]', description: 'Deals with title, company, amount, close date, owner initials, stage and probability.' },
      { name: 'onMove', type: '(deal: Deal, to: StageId) => void', description: 'Called when a deal changes stage.' },
      { name: 'className', type: 'string', description: 'Extra classes for the board card.' },
    ],
  },
  {
    slug: 'deal-card',
    name: 'Deal Card',
    description: 'An opportunity summary with a clickable stage stepper, win-probability ring, health, next step, buying group and an AI next action.',
    badge: 'New',
    demos: [
      {
        title: 'Opportunity',
        description: 'Click a stage segment to move the deal, tick the next step, or let the AI draft the follow-up.',
        component: DealCardDemo,
        height: 600,
        code: `import { DealCard } from '@/components/crm/DealCard';

<DealCard
  name="Platform rollout"
  company="Sorabase"
  amount={120000}
  closeDate="Nov 12"
  owner="Leo Park"
  initialStage="Negotiation"
  lastActivityDays={6}
  nextStep="Security review call with their IT lead"
  contacts={buyingGroup}
  suggestion="Send the security questionnaire before Thursday's call."
/>`,
      },
    ],
    props: [
      { name: 'name / company', type: 'string', description: 'Deal title and account name.' },
      { name: 'amount', type: 'number', description: 'Deal value in dollars.' },
      { name: 'initialStage', type: "'Lead' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Won'", default: "'Proposal'", description: 'Starting stage; drives the probability ring.' },
      { name: 'lastActivityDays', type: 'number', description: 'Healthy up to 3 days, at risk up to 10, then stalled.' },
      { name: 'nextStep', type: 'string', description: 'The next action, which can be ticked off.' },
      { name: 'contacts', type: 'DealContact[]', description: 'Buying group with name, title and role.' },
      { name: 'suggestion', type: 'string', description: 'Optional AI next-best-action text.' },
    ],
  },
  {
    slug: 'csv-import',
    name: 'CSV Import',
    description: 'A four-step importer: drop a file, preview rows, map columns with confidence scores, review duplicates and invalid rows, then import.',
    badge: 'New',
    demos: [
      {
        title: 'Import people',
        description: 'A sample file loads on its own. Continue through mapping and review to run the import.',
        component: CsvImportDemo,
        height: 560,
        code: `import { CsvImport } from '@/components/crm/CsvImport';

<CsvImport
  onComplete={({ created, updated, skipped }) =>
    toast(\`\${created} created, \${updated} merged, \${skipped} skipped\`)
  }
/>`,
      },
    ],
    props: [
      { name: 'autoPlay', type: 'boolean', default: 'true', description: 'Loads the sample file on mount.' },
      { name: 'onComplete', type: '(summary: { created: number; updated: number; skipped: number }) => void', description: 'Called when the import finishes.' },
      { name: 'className', type: 'string', description: 'Extra classes for the card.' },
    ],
  },
];
