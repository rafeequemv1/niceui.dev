import type { DocEntry } from '@/docs/types';
import { navigationBlockEntries } from './blocks-docs/navigation';
import { commerceBlockEntries } from './blocks-docs/commerce';
import { interactionBlockEntries } from './blocks-docs/interaction';
import { formBlockEntries } from './blocks-docs/forms';

export const blockEntries: DocEntry[] = [
  ...navigationBlockEntries,
  ...commerceBlockEntries,
  ...interactionBlockEntries,
  ...formBlockEntries,
];
