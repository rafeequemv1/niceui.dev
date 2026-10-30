import { createContext, useContext } from 'react';
import type { Company, Note, Opportunity, Person, Target, Task } from './data';

export type ObjectKey = 'people' | 'companies' | 'opportunities' | 'tasks' | 'notes' | 'workflows' | 'dashboard';
export type Activity = { id: string; at: string; text: string; kind: 'edit' | 'task' | 'note' | 'stage' };

export type Crm = {
  people: Person[];
  companies: Company[];
  opps: Opportunity[];
  tasks: Task[];
  notes: Note[];
  setPeople: (f: (p: Person[]) => Person[]) => void;
  setCompanies: (f: (c: Company[]) => Company[]) => void;
  setOpps: (f: (o: Opportunity[]) => Opportunity[]) => void;
  setTasks: (f: (t: Task[]) => Task[]) => void;
  setNotes: (f: (n: Note[]) => Note[]) => void;
  /** Session activity per record id, newest first. */
  activity: Record<string, Activity[]>;
  log: (id: string, text: string, kind?: Activity['kind']) => void;
  openRecord: (t: Target) => void;
  favorites: Target[];
  toggleFavorite: (t: Target) => void;
  toast: (msg: string) => void;
  go: (o: ObjectKey) => void;
};

export const CrmContext = createContext<Crm | null>(null);
export function useCrm() {
  const c = useContext(CrmContext);
  if (!c) throw new Error('useCrm outside CrmApp');
  return c;
}

export const recordName = (crm: Crm, t: Target) =>
  t.kind === 'person' ? crm.people.find((p) => p.id === t.id)?.name : t.kind === 'company' ? crm.companies.find((c) => c.id === t.id)?.name : crm.opps.find((o) => o.id === t.id)?.name;

export const sameTarget = (a: Target, b: Target) => a.kind === b.kind && a.id === b.id;
