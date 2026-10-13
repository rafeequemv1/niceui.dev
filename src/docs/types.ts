import type { ComponentType } from 'react';

export type PropDef = {
  name: string;
  type: string;
  default?: string;
  description: string;
};

export type Demo = {
  title?: string;
  description?: string;
  component: ComponentType;
  code?: string;
  /** Minimum preview height in px. Defaults to 360. */
  height?: number;
};

export type DocEntry = {
  slug: string;
  name: string;
  description: string;
  badge?: 'New' | 'Pro';
  demos?: Demo[];
  props?: PropDef[];
  /** When set, the entry renders as a full-width page instead of a documentation page. */
  page?: ComponentType<{ onNavigate?: (to: string) => void }>;
};

export type Section = {
  id: string;
  title: string;
  entries: DocEntry[];
};
