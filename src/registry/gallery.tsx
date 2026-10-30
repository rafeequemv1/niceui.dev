import type { DocEntry } from '@/docs/types';
import { galleryCarousel3dEntries } from './gallery-docs/carousels3d';
import { galleryGridEntries } from './gallery-docs/grids';
import { galleryMotionEntries } from './gallery-docs/motion';

export const galleryEntries: DocEntry[] = [...galleryCarousel3dEntries, ...galleryGridEntries, ...galleryMotionEntries];
