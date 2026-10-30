import type { DocEntry } from '@/docs/types';
import { CrmApp } from '@/pages/apps/crm/CrmApp';

export const crmTemplateEntries: DocEntry[] = [
  {
    slug: 'crm-app',
    name: 'CRM App',
    description: 'A complete CRM workspace with people and company tables, a deal pipeline, record pages with a timeline, tasks, notes, workflows, a dashboard and a command menu.',
    badge: 'New',
    page: CrmApp,
  },
];
