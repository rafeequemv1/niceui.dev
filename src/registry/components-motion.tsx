import type { DocEntry } from '@/docs/types';
import { overlayEntries } from './motion-docs/overlays';
import { surfaceEntries } from './motion-docs/surfaces';
import { controlEntries } from './motion-docs/controls';
import { interactiveEntries } from './motion-docs/interactive';

export const motionEntries: DocEntry[] = [...overlayEntries, ...surfaceEntries, ...controlEntries, ...interactiveEntries];
