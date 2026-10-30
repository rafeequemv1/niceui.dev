/* Fictional demo data for the Meridian CRM template. */

export const TODAY = new Date('2026-10-30T10:00:00');

export type Member = { id: string; name: string; color: string };
export const MEMBERS: Member[] = [
  { id: 'm1', name: 'Ava Moreno', color: '#3e63dd' },
  { id: 'm2', name: 'Ben Okafor', color: '#12a594' },
  { id: 'm3', name: 'Chloe Park', color: '#d6409f' },
  { id: 'm4', name: 'Diego Santos', color: '#c77d00' },
  { id: 'm5', name: 'Elena Varga', color: '#8e4ec6' },
];
export const ME = MEMBERS[0];

export const INDUSTRIES = ['SaaS', 'Fintech', 'Health', 'Logistics', 'Energy', 'Retail', 'Robotics', 'Media'] as const;
export type Industry = (typeof INDUSTRIES)[number];

export type Company = {
  id: string;
  name: string;
  domain: string;
  industry: Industry;
  employees: number;
  arr: number;
  city: string;
  owner: string;
  icp: boolean;
  rating: number;
  created: string;
  color: string;
};

export const COMPANIES: Company[] = [
  { id: 'c1', name: 'Halcyon Labs', domain: 'halcyonlabs.io', industry: 'SaaS', employees: 140, arr: 4_200_000, city: 'Lisbon', owner: 'm1', icp: true, rating: 5, created: '2026-03-02', color: '#3e63dd' },
  { id: 'c2', name: 'Brightwater Analytics', domain: 'brightwater.ai', industry: 'SaaS', employees: 85, arr: 2_100_000, city: 'Dublin', owner: 'm2', icp: true, rating: 4, created: '2026-04-18', color: '#12a594' },
  { id: 'c3', name: 'Kestrel Logistics', domain: 'kestrel.co', industry: 'Logistics', employees: 920, arr: 18_500_000, city: 'Rotterdam', owner: 'm4', icp: true, rating: 4, created: '2025-11-07', color: '#c77d00' },
  { id: 'c4', name: 'Lumen Health', domain: 'lumenhealth.com', industry: 'Health', employees: 310, arr: 9_800_000, city: 'Boston', owner: 'm3', icp: false, rating: 3, created: '2026-01-22', color: '#d6409f' },
  { id: 'c5', name: 'Paperplane', domain: 'paperplane.app', industry: 'SaaS', employees: 36, arr: 720_000, city: 'Berlin', owner: 'm1', icp: false, rating: 3, created: '2026-06-11', color: '#8e4ec6' },
  { id: 'c6', name: 'Arbor Finance', domain: 'arbor.finance', industry: 'Fintech', employees: 220, arr: 7_400_000, city: 'London', owner: 'm5', icp: true, rating: 5, created: '2025-09-30', color: '#2b9a66' },
  { id: 'c7', name: 'Quill & Co', domain: 'quillandco.com', industry: 'Media', employees: 48, arr: 1_300_000, city: 'New York', owner: 'm2', icp: false, rating: 2, created: '2026-07-04', color: '#dc3e42' },
  { id: 'c8', name: 'Stratus Energy', domain: 'stratus.energy', industry: 'Energy', employees: 1_400, arr: 32_000_000, city: 'Austin', owner: 'm4', icp: true, rating: 4, created: '2025-08-15', color: '#0d9b8a' },
  { id: 'c9', name: 'Fernway Foods', domain: 'fernway.com', industry: 'Retail', employees: 560, arr: 12_600_000, city: 'Toronto', owner: 'm3', icp: false, rating: 3, created: '2026-02-09', color: '#b5730a' },
  { id: 'c10', name: 'Tidal Robotics', domain: 'tidalrobotics.io', industry: 'Robotics', employees: 120, arr: 5_100_000, city: 'Copenhagen', owner: 'm5', icp: true, rating: 5, created: '2026-05-27', color: '#3e63dd' },
  { id: 'c11', name: 'Copperline Studio', domain: 'copperline.studio', industry: 'Media', employees: 22, arr: 480_000, city: 'Melbourne', owner: 'm1', icp: false, rating: 2, created: '2026-09-03', color: '#cf3897' },
  { id: 'c12', name: 'Orchard Bank', domain: 'orchardbank.com', industry: 'Fintech', employees: 2_800, arr: 64_000_000, city: 'Zurich', owner: 'm2', icp: true, rating: 4, created: '2025-06-19', color: '#2b9a66' },
];

export const LIFECYCLES = ['Lead', 'MQL', 'SQL', 'Customer', 'Churned'] as const;
export type Lifecycle = (typeof LIFECYCLES)[number];

export type Person = {
  id: string;
  name: string;
  email: string;
  phone: string;
  title: string;
  companyId: string;
  city: string;
  lifecycle: Lifecycle;
  intent: number;
  lastContact: string;
  owner: string;
};

const P = (id: string, name: string, title: string, companyId: string, city: string, lifecycle: Lifecycle, intent: number, lastContact: string, owner: string, phone: string): Person => {
  const c = COMPANIES.find((x) => x.id === companyId)!;
  const [first, last] = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().split(' ');
  return { id, name, email: `${first}.${last}@${c.domain}`, phone, title, companyId, city, lifecycle, intent, lastContact, owner };
};

export const PEOPLE: Person[] = [
  P('p1', 'Maya Ocampo', 'Head of Operations', 'c1', 'Lisbon', 'Customer', 5, '2026-10-29', 'm1', '+351 912 440 118'),
  P('p2', 'Jonah Reyes', 'VP Engineering', 'c1', 'Lisbon', 'Customer', 4, '2026-10-21', 'm1', '+351 913 207 664'),
  P('p3', 'Priya Natarajan', 'Founder', 'c2', 'Dublin', 'SQL', 5, '2026-10-28', 'm2', '+353 87 551 2093'),
  P('p4', 'Tomás Lindqvist', 'Data Lead', 'c2', 'Dublin', 'MQL', 3, '2026-10-12', 'm2', '+353 86 310 7741'),
  P('p5', 'Hannah Vos', 'COO', 'c3', 'Rotterdam', 'SQL', 4, '2026-10-27', 'm4', '+31 6 2840 1193'),
  P('p6', 'Felix Brandt', 'Fleet Manager', 'c3', 'Rotterdam', 'Lead', 2, '2026-09-30', 'm4', '+31 6 1755 6620'),
  P('p7', 'Grace Liu', 'CTO', 'c4', 'Boston', 'MQL', 4, '2026-10-24', 'm3', '+1 617 555 0182'),
  P('p8', 'Samuel Adeyemi', 'Procurement', 'c4', 'Boston', 'Lead', 2, '2026-10-02', 'm3', '+1 617 555 0144'),
  P('p9', 'Lena Fischer', 'CEO', 'c5', 'Berlin', 'Lead', 3, '2026-10-19', 'm1', '+49 151 2290 4471'),
  P('p10', 'Oliver Grant', 'CFO', 'c6', 'London', 'Customer', 5, '2026-10-30', 'm5', '+44 7700 900 412'),
  P('p11', 'Isla McKenzie', 'Product Director', 'c6', 'London', 'Customer', 4, '2026-10-16', 'm5', '+44 7700 900 858'),
  P('p12', 'Noah Kim', 'Editor in Chief', 'c7', 'New York', 'Churned', 1, '2026-08-11', 'm2', '+1 212 555 0179'),
  P('p13', 'Camila Duarte', 'Head of Sustainability', 'c8', 'Austin', 'SQL', 5, '2026-10-26', 'm4', '+1 512 555 0123'),
  P('p14', 'Ethan Brooks', 'IT Director', 'c8', 'Austin', 'MQL', 3, '2026-10-08', 'm4', '+1 512 555 0167'),
  P('p15', 'Aisha Rahman', 'VP Digital', 'c9', 'Toronto', 'Lead', 3, '2026-10-14', 'm3', '+1 416 555 0191'),
  P('p16', 'Lucas Martin', 'Store Ops Lead', 'c9', 'Toronto', 'Lead', 2, '2026-09-22', 'm3', '+1 416 555 0138'),
  P('p17', 'Freya Nielsen', 'Founder', 'c10', 'Copenhagen', 'SQL', 4, '2026-10-29', 'm5', '+45 21 44 87 90'),
  P('p18', 'Mateo Rossi', 'Robotics Engineer', 'c10', 'Copenhagen', 'MQL', 3, '2026-10-05', 'm5', '+45 28 11 63 07'),
  P('p19', 'Zoe Carter', 'Creative Director', 'c11', 'Melbourne', 'Lead', 2, '2026-10-01', 'm1', '+61 412 555 093'),
  P('p20', 'Daniel Weber', 'Head of Payments', 'c12', 'Zurich', 'Customer', 5, '2026-10-27', 'm2', '+41 79 555 21 08'),
  P('p21', 'Sofia Marquez', 'Risk Officer', 'c12', 'Zurich', 'SQL', 4, '2026-10-23', 'm2', '+41 78 555 64 19'),
  P('p22', 'Kenji Watanabe', 'Platform Lead', 'c1', 'Lisbon', 'MQL', 3, '2026-10-10', 'm1', '+351 914 882 301'),
  P('p23', 'Amara Okoye', 'Growth Lead', 'c5', 'Berlin', 'Lead', 4, '2026-10-25', 'm1', '+49 160 3381 2056'),
  P('p24', 'Victor Hale', 'Ops Analyst', 'c3', 'Rotterdam', 'Churned', 1, '2026-07-29', 'm4', '+31 6 4419 0287'),
];

export const STAGES = ['New', 'Screening', 'Meeting', 'Proposal', 'Customer'] as const;
export type Stage = (typeof STAGES)[number];

export type Opportunity = {
  id: string;
  name: string;
  companyId: string;
  amount: number;
  stage: Stage;
  close: string;
  poc: string;
  owner: string;
  probability: number;
};

export const OPPORTUNITIES: Opportunity[] = [
  { id: 'o1', name: 'Halcyon · Enterprise renewal', companyId: 'c1', amount: 186_000, stage: 'Proposal', close: '2026-11-20', poc: 'p1', owner: 'm1', probability: 70 },
  { id: 'o2', name: 'Brightwater · Analytics seats', companyId: 'c2', amount: 64_000, stage: 'Meeting', close: '2026-12-05', poc: 'p3', owner: 'm2', probability: 45 },
  { id: 'o3', name: 'Kestrel · Fleet rollout', companyId: 'c3', amount: 420_000, stage: 'Screening', close: '2027-01-30', poc: 'p5', owner: 'm4', probability: 25 },
  { id: 'o4', name: 'Lumen · Pilot', companyId: 'c4', amount: 38_000, stage: 'New', close: '2026-12-15', poc: 'p7', owner: 'm3', probability: 10 },
  { id: 'o5', name: 'Paperplane · Starter', companyId: 'c5', amount: 12_500, stage: 'Meeting', close: '2026-11-12', poc: 'p9', owner: 'm1', probability: 40 },
  { id: 'o6', name: 'Arbor · Expansion', companyId: 'c6', amount: 240_000, stage: 'Customer', close: '2026-10-14', poc: 'p10', owner: 'm5', probability: 100 },
  { id: 'o7', name: 'Stratus · Grid analytics', companyId: 'c8', amount: 510_000, stage: 'Proposal', close: '2026-12-01', poc: 'p13', owner: 'm4', probability: 60 },
  { id: 'o8', name: 'Fernway · Store insights', companyId: 'c9', amount: 96_000, stage: 'New', close: '2027-02-10', poc: 'p15', owner: 'm3', probability: 10 },
  { id: 'o9', name: 'Tidal · Factory twin', companyId: 'c10', amount: 145_000, stage: 'Meeting', close: '2026-12-20', poc: 'p17', owner: 'm5', probability: 50 },
  { id: 'o10', name: 'Copperline · Studio plan', companyId: 'c11', amount: 8_400, stage: 'Screening', close: '2026-11-28', poc: 'p19', owner: 'm1', probability: 20 },
  { id: 'o11', name: 'Orchard · Payments API', companyId: 'c12', amount: 680_000, stage: 'Proposal', close: '2027-01-15', poc: 'p20', owner: 'm2', probability: 55 },
  { id: 'o12', name: 'Halcyon · Data add-on', companyId: 'c1', amount: 42_000, stage: 'Customer', close: '2026-09-29', poc: 'p2', owner: 'm1', probability: 100 },
  { id: 'o13', name: 'Kestrel · Customs module', companyId: 'c3', amount: 88_000, stage: 'New', close: '2027-03-01', poc: 'p6', owner: 'm4', probability: 10 },
  { id: 'o14', name: 'Orchard · Risk dashboards', companyId: 'c12', amount: 132_000, stage: 'Screening', close: '2026-12-18', poc: 'p21', owner: 'm2', probability: 30 },
];

export type Target = { kind: 'person' | 'company' | 'opportunity'; id: string };

export type Task = { id: string; title: string; due: string; done: boolean; assignee: string; target: Target };
export const TASKS: Task[] = [
  { id: 't1', title: 'Send renewal proposal v2', due: '2026-10-28', done: false, assignee: 'm1', target: { kind: 'opportunity', id: 'o1' } },
  { id: 't2', title: 'Book security review with Jonah', due: '2026-10-30', done: false, assignee: 'm1', target: { kind: 'person', id: 'p2' } },
  { id: 't3', title: 'Prepare grid analytics demo', due: '2026-10-30', done: false, assignee: 'm4', target: { kind: 'opportunity', id: 'o7' } },
  { id: 't4', title: 'Follow up on pilot scope', due: '2026-11-02', done: false, assignee: 'm3', target: { kind: 'company', id: 'c4' } },
  { id: 't5', title: 'Share ROI model with Priya', due: '2026-11-03', done: false, assignee: 'm2', target: { kind: 'person', id: 'p3' } },
  { id: 't6', title: 'Legal redlines for payments API', due: '2026-11-05', done: false, assignee: 'm2', target: { kind: 'opportunity', id: 'o11' } },
  { id: 't7', title: 'Intro call with Fernway digital team', due: '2026-11-12', done: false, assignee: 'm3', target: { kind: 'company', id: 'c9' } },
  { id: 't8', title: 'Quarterly business review deck', due: '2026-11-19', done: false, assignee: 'm5', target: { kind: 'company', id: 'c6' } },
  { id: 't9', title: 'Log call notes from Tidal visit', due: '2026-10-27', done: true, assignee: 'm5', target: { kind: 'opportunity', id: 'o9' } },
  { id: 't10', title: 'Update Kestrel stakeholder map', due: '2026-10-24', done: true, assignee: 'm4', target: { kind: 'company', id: 'c3' } },
];

export type Note = { id: string; title: string; body: string; target: Target; author: string; updated: string };
export const NOTES: Note[] = [
  { id: 'n1', title: 'Renewal call recap', body: 'Maya wants SSO and an audit log before signing. Budget is approved; procurement needs the DPA by Nov 15.', target: { kind: 'person', id: 'p1' }, author: 'm1', updated: '2026-10-29' },
  { id: 'n2', title: 'Grid analytics: technical fit', body: 'Camila’s team ingests 2B meter readings a day. Our streaming connector covers it; need a capacity plan.', target: { kind: 'opportunity', id: 'o7' }, author: 'm4', updated: '2026-10-26' },
  { id: 'n3', title: 'Why Quill churned', body: 'Moved to an in-house tool after their editorial reorg. Open to a lighter plan next year.', target: { kind: 'company', id: 'c7' }, author: 'm2', updated: '2026-10-11' },
  { id: 'n4', title: 'Orchard procurement steps', body: 'Three rounds: vendor risk, InfoSec, then the payments committee on the first Tuesday of each month.', target: { kind: 'company', id: 'c12' }, author: 'm2', updated: '2026-10-23' },
  { id: 'n5', title: 'Tidal factory visit', body: 'Saw the twin prototype. Freya wants weekly model refreshes and an on-prem option for line 3.', target: { kind: 'person', id: 'p17' }, author: 'm5', updated: '2026-10-27' },
  { id: 'n6', title: 'Brightwater seat math', body: '42 analysts today, 60 by Q2. Proposed volume tier at seat 50 to keep them on annual.', target: { kind: 'opportunity', id: 'o2' }, author: 'm2', updated: '2026-10-28' },
];

export const companyOf = (id: string) => COMPANIES.find((c) => c.id === id);
export const memberOf = (id: string) => MEMBERS.find((m) => m.id === id) ?? ME;
