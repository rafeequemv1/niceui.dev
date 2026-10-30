import type { DocEntry } from '@/docs/types';
import { PersonProfileDemo } from '@/components/crm/PersonProfile';
import { CompanyCardDemo } from '@/components/crm/CompanyCard';
import { ActivityTimelineDemo } from '@/components/crm/ActivityTimeline';
import { CrmTasksDemo } from '@/components/crm/CrmTasks';
import { RelationPickerDemo } from '@/components/crm/RelationPicker';

export const crmDetailEntries: DocEntry[] = [
  {
    slug: 'person-profile',
    name: 'Person Profile',
    description: 'A contact record header with quick email and call actions, plus a field list you edit inline: email, phone, title, city, tags and owner.',
    badge: 'New',
    demos: [
      {
        title: 'Contact record',
        description: 'Click any value to edit it; Enter saves, Esc cancels. Watch the city update live, then try Call and the owner menu.',
        component: PersonProfileDemo,
        height: 640,
        code: `import { PersonProfile, type Person } from '@/components/crm/PersonProfile';

export function ContactPage({ contact, team }: { contact: Person; team: Owner[] }) {
  const [person, setPerson] = useState(contact);

  return (
    <PersonProfile
      person={person}
      owners={team}
      onChange={(next) => {
        setPerson(next);
        saveContact(next);
      }}
    />
  );
}`,
      },
    ],
    props: [
      { name: 'person', type: 'Person', description: 'Name, initials, title, company, email, phone, city, LinkedIn, tags, owner and created label.' },
      { name: 'owners', type: 'Owner[]', default: '[]', description: 'Teammates offered in the owner menu.' },
      { name: 'onChange', type: '(person: Person) => void', description: 'Called with the updated record after any inline edit.' },
      { name: 'autoType', type: '{ field; text } | null', description: 'Types and saves a value, as if a teammate edited the record live.' },
      { name: 'className', type: 'string', description: 'Extra classes for the card.' },
    ],
  },
  {
    slug: 'company-card',
    name: 'Company Card',
    description: 'A company record with domain, firmographics, an ICP-fit ring, people and open deals, and an Enrich action that fills empty fields with sourced AI data.',
    badge: 'New',
    demos: [
      {
        title: 'Enrich a company',
        description: 'Empty fields look themselves up one by one, get an AI badge, and the fit score updates. Sources are listed underneath.',
        component: CompanyCardDemo,
        height: 600,
        code: `import { CompanyCard } from '@/components/crm/CompanyCard';

<CompanyCard
  company={company}
  enrichment={await enrichCompany(company.domain)}
  sources={['Company site', 'Public filings', 'Press']}
/>`,
      },
    ],
    props: [
      { name: 'company', type: 'Company', description: 'Name, domain, industry, monogram, fields, ICP score, people and deals.' },
      { name: 'enrichment', type: 'Partial<Record<CompanyFieldKey, string>>', description: 'Values Enrich writes into empty fields, in order.' },
      { name: 'sources', type: 'string[]', default: '[]', description: 'Where the enriched data came from; shown after enriching.' },
      { name: 'autoEnrich', type: 'number', description: 'Start enriching automatically after this many milliseconds.' },
      { name: 'className', type: 'string', description: 'Extra classes for the card.' },
    ],
  },
  {
    slug: 'activity-timeline',
    name: 'Activity Timeline',
    description: 'Everything that happened on a record, grouped by day: emails, calls, meetings, notes, stage changes and field updates, with filters and load more.',
    badge: 'New',
    demos: [
      {
        title: 'Deal timeline',
        description: 'A reply arrives live. Filter by type, expand long emails, and load older activity at the bottom.',
        component: ActivityTimelineDemo,
        height: 660,
        code: `import { ActivityTimeline } from '@/components/crm/ActivityTimeline';

<ActivityTimeline
  activities={record.activities}
  fresh={unseenIds}
  onLoadMore={() => api.activities(record.id, { before: cursor })}
/>`,
      },
    ],
    props: [
      { name: 'activities', type: 'Activity[]', description: 'Items with kind (email, call, meeting, note, stage, update), day, time, actor, title and optional body, meta, from/to and attendees.' },
      { name: 'onLoadMore', type: '() => Promise<Activity[]>', description: 'Loads older items; resolve with an empty array when there are no more.' },
      { name: 'fresh', type: 'string[]', default: '[]', description: 'Ids to highlight as just arrived.' },
      { name: 'className', type: 'string', description: 'Extra classes for the card.' },
    ],
  },
  {
    slug: 'crm-tasks',
    name: 'Tasks',
    description: 'Tasks grouped into overdue, today and upcoming, with assignees and linked records, an animated complete, and quick add that reads dates like “tomorrow 3pm”.',
    badge: 'New',
    demos: [
      {
        title: 'Task list with natural-language dates',
        description: 'Type a task with a date in plain words and watch it become a date chip. Tick a task to complete it.',
        component: CrmTasksDemo,
        height: 600,
        code: `import { CrmTasks, parseDue } from '@/components/crm/CrmTasks';

export function MyTasks() {
  const [tasks, setTasks] = useState(initialTasks);
  return <CrmTasks tasks={tasks} onChange={setTasks} me={currentUser} />;
}

parseDue('Call Ana tomorrow 3pm');
// → { title: 'Call Ana', due: 'Tomorrow 3:00 PM', group: 'upcoming' }`,
      },
    ],
    props: [
      { name: 'tasks', type: 'CrmTask[]', description: 'Tasks with title, group, due label, assignee, linked records and done state.' },
      { name: 'onChange', type: '(tasks: CrmTask[]) => void', description: 'Called when a task is added or completed.' },
      { name: 'me', type: 'Assignee', description: 'Who new tasks are assigned to.' },
      { name: 'autoType', type: '{ text; submit? }', description: 'Drives the quick-add box from outside, for demos and onboarding.' },
      { name: 'className', type: 'string', description: 'Extra classes for the card.' },
    ],
  },
  {
    slug: 'relation-picker',
    name: 'Relation Picker',
    description: 'A searchable multi-select for linking people, companies and deals to a record, grouped with avatars, create-new and full keyboard control.',
    badge: 'New',
    demos: [
      {
        title: 'Link records',
        description: 'Type to filter, use the arrow keys and Enter to link, Backspace to remove the last chip, or create a new record from your search.',
        component: RelationPickerDemo,
        height: 480,
        code: `import { RelationPicker } from '@/components/crm/RelationPicker';

<RelationPicker
  label="Linked records"
  options={records}
  value={linkedIds}
  onChange={setLinkedIds}
  onCreate={(label, kind) => createRecord({ label, kind })}
/>`,
      },
    ],
    props: [
      { name: 'options', type: 'RelationOption[]', description: 'Records with id, kind (person, company, deal), label, optional sub-line and color.' },
      { name: 'value', type: 'string[]', description: 'Ids of the linked records, shown as chips.' },
      { name: 'onChange', type: '(ids: string[]) => void', description: 'Called when records are linked or unlinked.' },
      { name: 'onCreate', type: '(label, kind) => RelationOption', description: 'Creates a record from the search text; omit to hide Create.' },
      { name: 'label', type: 'string', default: "'Linked records'", description: 'Field label above the picker.' },
      { name: 'defaultOpen', type: 'boolean', default: 'false', description: 'Open the results list on mount.' },
    ],
  },
];
