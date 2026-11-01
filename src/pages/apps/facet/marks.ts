/* Sample marks, drawn in a 100 × 100 box. Swap in any SVG path of your own. */

export type MarkId = 'star' | 'bolt' | 'leaf' | 'heart' | 'orbit' | 'letter';

const star = (() => {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? 21 : 46;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    pts.push(`${(50 + Math.cos(a) * r).toFixed(2)} ${(54 + Math.sin(a) * r).toFixed(2)}`);
  }
  return `M${pts.join(' L')} Z`;
})();

export const MARKS: { id: MarkId; label: string; d?: string; holes?: boolean }[] = [
  { id: 'star', label: 'Star', d: star },
  { id: 'bolt', label: 'Bolt', d: 'M60 4 L16 58 H46 L38 96 L84 40 H54 Z' },
  { id: 'leaf', label: 'Leaf', d: 'M90 8 C44 8 10 32 10 66 C10 80 18 90 18 90 C26 74 40 62 58 52 C42 66 30 80 24 94 C66 98 92 64 90 8 Z' },
  { id: 'heart', label: 'Heart', d: 'M50 90 C20 70 6 54 6 35 C6 20 17 10 30 10 C39 10 46 15 50 22 C54 15 61 10 70 10 C83 10 94 20 94 35 C94 54 80 70 50 90 Z' },
  {
    id: 'orbit',
    label: 'Orbit',
    holes: true,
    d: 'M50 6 A44 44 0 1 1 49.99 6 Z M50 30 A20 20 0 1 0 50.01 30 Z M78 18 A9 9 0 1 1 77.99 18 Z',
  },
  { id: 'letter', label: 'Letter' },
];

/** Rough node count for the measure bar. */
export const nodeCount = (d?: string) => (d ? (d.match(/[MLHVCSQTAZ]/gi) || []).length : 0);
