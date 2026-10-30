import type { DocEntry } from '@/docs/types';
import { EmailComposerDemo } from '@/components/crm/EmailComposer';
import { EmailThreadsDemo } from '@/components/crm/EmailThreads';
import { SequenceBuilderDemo } from '@/components/crm/SequenceBuilder';
import { SalesDashboardDemo } from '@/components/crm/SalesDashboard';
import { LeadScoreDemo } from '@/components/crm/LeadScore';

export const crmEngageEntries: DocEntry[] = [
  {
    slug: 'email-composer',
    name: 'Email Composer',
    description: 'A sales email composer with recipient chips, templates, highlighted merge fields, AI rewrites, scheduled send and open tracking.',
    badge: 'New',
    demos: [
      {
        title: 'Follow-up after a demo',
        description: 'Switch templates, try a rewrite, preview the merge fields, then schedule or send.',
        component: EmailComposerDemo,
        height: 560,
        code: `import { EmailComposer } from '@/components/crm/EmailComposer';

<EmailComposer
  to={[{ name: person.name, email: person.email }]}
  templates={templates}
  data={{ first_name: person.firstName, company: company.name, sender: me.firstName }}
  rewrite={(body, tone) => ai.rewrite(body, tone)}
  onSend={(email) => api.emails.send(email)}
/>`,
      },
    ],
    props: [
      { name: 'to', type: 'Recipient[]', description: 'Initial recipients, shown as removable chips.' },
      { name: 'cc', type: 'Recipient[]', default: '[]', description: 'Initial Cc recipients; the Cc row opens automatically when set.' },
      { name: 'templates', type: 'EmailTemplate[]', description: 'Templates with a subject and a body containing {{merge_fields}}.' },
      { name: 'data', type: 'Record<string, string>', description: 'Values for merge fields. Missing ones are flagged in amber.' },
      { name: 'rewrite', type: '(body, tone, templateId) => string', description: 'Returns the body rewritten as shorter, friendlier or formal.' },
      { name: 'onSend', type: '(email) => void', description: 'Called with recipients, subject, body, schedule and tracking choice.' },
    ],
  },
  {
    slug: 'email-threads',
    name: 'Email Threads',
    description: 'A CRM inbox: threads linked to companies, people and deals, with unread states, search, a thread view and quick reply.',
    badge: 'New',
    demos: [
      {
        title: 'Inbox with linked records',
        description: 'Open a thread, expand earlier messages and send a quick reply with ⌘ Enter.',
        component: EmailThreadsDemo,
        height: 520,
        code: `import { EmailThreads } from '@/components/crm/EmailThreads';

<EmailThreads threads={threads} me="You" />`,
      },
    ],
    props: [
      { name: 'threads', type: 'EmailThread[]', description: 'Threads with participants, linked records, unread state and messages.' },
      { name: 'me', type: 'string', default: "'You'", description: 'Sender name used for replies.' },
      { name: 'className', type: 'string', description: 'Extra classes for the outer frame.' },
    ],
  },
  {
    slug: 'sequence-builder',
    name: 'Sequence',
    description: 'An outreach sequence over days: email, LinkedIn, call and wait steps with live sent, open and reply rates.',
    badge: 'New',
    demos: [
      {
        title: 'Q4 outbound sequence',
        description: 'Counts climb while the sequence is active. Pause it, remove a step or add a new one.',
        component: SequenceBuilderDemo,
        height: 640,
        code: `import { SequenceBuilder } from '@/components/crm/SequenceBuilder';

<SequenceBuilder name="Q4 outbound · Heads of RevOps" enrolled={160} steps={sequence.steps} />`,
      },
    ],
    props: [
      { name: 'name', type: 'string', description: 'Sequence name shown in the header.' },
      { name: 'enrolled', type: 'number', description: 'People enrolled; caps the simulated send counts.' },
      { name: 'steps', type: 'SequenceStep[]', description: "Steps with kind ('email' | 'linkedin' | 'call' | 'wait'), day and stats." },
    ],
  },
  {
    slug: 'sales-dashboard',
    name: 'Sales Dashboard',
    description: 'KPI tiles with sparklines, revenue against quota, a pipeline funnel and a rep leaderboard, switchable by period.',
    badge: 'New',
    demos: [
      {
        title: 'Sales overview',
        description: 'Switch between month, quarter and year. Hover a bar to see revenue against quota.',
        component: SalesDashboardDemo,
        height: 620,
        code: `import { SalesDashboard } from '@/components/crm/SalesDashboard';

<SalesDashboard data={{ month, quarter, year }} defaultPeriod="quarter" />`,
      },
    ],
    props: [
      { name: 'data', type: "Record<'month' | 'quarter' | 'year', DashboardData>", description: 'KPIs, funnel stages, revenue bars and reps for each period.' },
      { name: 'defaultPeriod', type: "'month' | 'quarter' | 'year'", default: "'quarter'", description: 'Period selected on first render.' },
    ],
  },
  {
    slug: 'lead-score',
    name: 'Lead Score',
    description: 'A lead score gauge with a hot, warm or cold label, the factors behind it, an AI explanation and a 30-day trend.',
    badge: 'New',
    demos: [
      {
        title: 'Three leads',
        description: 'Switch leads to watch the gauge, factors and explanation update.',
        component: LeadScoreDemo,
        height: 480,
        code: `import { LeadScore } from '@/components/crm/LeadScore';

<LeadScore lead={{ name, company, title, score: 86, factors, explanation, history }} />`,
      },
    ],
    props: [
      { name: 'lead', type: 'Lead', description: 'Name, company, title, score (0–100), signed factors, explanation and score history.' },
      { name: 'className', type: 'string', description: 'Extra classes for the card.' },
    ],
  },
];
