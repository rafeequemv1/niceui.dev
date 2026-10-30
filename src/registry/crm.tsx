import type { DocEntry } from '@/docs/types';
import { crmRecordEntries } from './crm-docs/records';
import { crmDetailEntries } from './crm-docs/detail';
import { crmEngageEntries } from './crm-docs/engage';

export const crmEntries: DocEntry[] = [...crmRecordEntries, ...crmDetailEntries, ...crmEngageEntries];
