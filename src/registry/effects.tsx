import type { DocEntry } from '@/docs/types';
import { effectBackgroundEntries } from './effects-docs/backgrounds';
import { effectTextEntries } from './effects-docs/text';
import { effectButtonEntries } from './effects-docs/buttons';

export const effectEntries: DocEntry[] = [...effectBackgroundEntries, ...effectTextEntries, ...effectButtonEntries];
