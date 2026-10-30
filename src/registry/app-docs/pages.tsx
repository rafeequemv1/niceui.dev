import type { DocEntry } from '@/docs/types';
import { SettingsPageDemo } from '@/components/app/SettingsPage';
import { OnboardingDemo } from '@/components/app/Onboarding';
import { EmptyStatesDemo } from '@/components/app/EmptyStates';
import { NotificationInboxDemo } from '@/components/app/NotificationInbox';
import { DataTableProDemo } from '@/components/app/DataTablePro';
import { MultiStepFormDemo } from '@/components/app/MultiStepForm';

export const appPageEntries: DocEntry[] = [
  {
    slug: 'settings-page',
    name: 'Settings',
    description: 'Tabbed account settings with profile, team invites and roles, billing usage and invoices, and API keys with a save bar.',
    badge: 'New',
    demos: [
      {
        title: 'Workspace settings',
        description: 'Edit a profile field to bring up the save bar. Invite a teammate, or create, reveal, copy and revoke an API key.',
        component: SettingsPageDemo,
        height: 600,
        code: `import { SettingsPage } from '@/components/app/SettingsPage';

export default function Settings() {
  return <SettingsPage className="mx-auto" />;
}`,
      },
    ],
    props: [{ name: 'className', type: 'string', description: 'Extra classes for the outer card.' }],
  },
  {
    slug: 'onboarding-flow',
    name: 'Onboarding',
    description: 'A four-step workspace setup with progress, back and next, skip, and a success screen.',
    badge: 'New',
    demos: [
      {
        title: 'New workspace',
        description: 'Name the workspace, pick a role, invite people and connect tools.',
        component: OnboardingDemo,
        height: 560,
        code: `import { Onboarding } from '@/components/app/Onboarding';

<Onboarding onFinish={(data) => createWorkspace(data)} />`,
      },
    ],
    props: [
      { name: 'onFinish', type: '(data: OnboardingData) => void', description: 'Called with workspace, role, invites and integrations.' },
      { name: 'className', type: 'string', description: 'Extra classes for the card.' },
    ],
  },
  {
    slug: 'empty-states',
    name: 'Empty States',
    description: 'Four illustrated empty states, for no projects, no results, inbox zero and errors, each with actions.',
    badge: 'New',
    demos: [
      {
        title: 'Four states',
        description: 'Switch tabs to see each state. Try again on the error state recovers.',
        component: EmptyStatesDemo,
        height: 480,
        code: `import { EmptyState } from '@/components/app/EmptyStates';

{projects.length === 0 && <EmptyState kind="projects" onAction={createProject} />}`,
      },
    ],
    props: [
      { name: 'kind', type: "'projects' | 'search' | 'inbox' | 'error'", description: 'Which illustration and copy to show.' },
      { name: 'onAction', type: '() => void', description: 'Primary button handler.' },
    ],
  },
  {
    slug: 'notification-inbox',
    name: 'Notification Inbox',
    description: 'A bell popover with All, Mentions and Unread tabs, grouped by day, with mark read, archive with undo and live items.',
    badge: 'New',
    demos: [
      {
        title: 'Inbox',
        description: 'A new mention arrives after a moment. Hover a row to archive it, then undo.',
        component: NotificationInboxDemo,
        height: 520,
        code: `import { NotificationInbox } from '@/components/app/NotificationInbox';

<NotificationInbox initial={notifications} defaultOpen={false} />`,
      },
    ],
    props: [
      { name: 'initial', type: 'Note[]', description: 'Starting notifications.' },
      { name: 'defaultOpen', type: 'boolean', default: 'true', description: 'Open the popover on mount.' },
      { name: 'live', type: 'boolean', default: 'true', description: 'Simulate a new notification arriving.' },
    ],
  },
  {
    slug: 'data-table',
    name: 'Data Table',
    description: 'A full data table with search, column visibility, sorting, row selection, row actions, status badges and pagination.',
    badge: 'New',
    demos: [
      {
        title: 'Customers',
        description: 'Sort by any column, hide columns, select rows to bulk delete, and page through results.',
        component: DataTableProDemo,
        height: 560,
        code: `import { DataTablePro } from '@/components/app/DataTablePro';

<DataTablePro rows={customers} />`,
      },
    ],
    props: [
      { name: 'rows', type: 'Row[]', description: 'Table data.' },
      { name: 'loadingFirst', type: 'boolean', default: 'true', description: 'Show skeleton rows briefly on mount.' },
    ],
  },
  {
    slug: 'multi-step-form',
    name: 'Multi-step Form',
    description: 'A three-step form with validation on each step, a review step with edit links, and a success state.',
    badge: 'New',
    demos: [
      {
        title: 'Project inquiry',
        description: 'Continue validates the current step. The review step lets you jump back to edit.',
        component: MultiStepFormDemo,
        height: 560,
        code: `import { MultiStepForm } from '@/components/app/MultiStepForm';

<MultiStepForm onSubmit={(data) => sendInquiry(data)} />`,
      },
    ],
    props: [{ name: 'onSubmit', type: '(data) => void', description: 'Called after the review step is submitted.' }],
  },
];
