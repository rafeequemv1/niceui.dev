import type { DocEntry } from '@/docs/types';
import { basicEntries } from './core-docs/basics';
import { inputEntries } from './core-docs/inputs';
import { dataEntries } from './core-docs/data';

export const coreEntries: DocEntry[] = [...basicEntries, ...inputEntries, ...dataEntries];
