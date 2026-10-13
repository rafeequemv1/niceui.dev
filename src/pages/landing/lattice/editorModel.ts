export type ShapeKind = 'frame' | 'rect' | 'ellipse' | 'text';
export type Tool = 'select' | 'frame' | 'rect' | 'ellipse' | 'text';

export interface Shape {
  id: string;
  kind: ShapeKind;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
  radius: number;
  text?: string;
  fresh?: boolean;
}

export const swatches = ['#ffffff', '#18181b', '#0d99ff', '#f97316', '#10b981', '#f43f5e', '#facc15', '#e4e4e7'];

export const initialShapes: Shape[] = [
  { id: 'f1', kind: 'frame', name: 'Hero / Desktop', x: 40, y: 36, w: 340, h: 250, fill: '#ffffff', radius: 14 },
  { id: 't1', kind: 'text', name: 'Headline', x: 64, y: 70, w: 230, h: 30, fill: '#18181b', radius: 0, text: 'Ship it faster' },
  { id: 'r1', kind: 'rect', name: 'Image', x: 64, y: 116, w: 292, h: 100, fill: '#0d99ff', radius: 10 },
  { id: 'r2', kind: 'rect', name: 'Button', x: 64, y: 232, w: 112, h: 34, fill: '#18181b', radius: 17 },
  { id: 'e1', kind: 'ellipse', name: 'Avatar', x: 420, y: 70, w: 84, h: 84, fill: '#f97316', radius: 0 },
  { id: 'r3', kind: 'rect', name: 'Sticky note', x: 410, y: 182, w: 130, h: 104, fill: '#facc15', radius: 6 },
];

const defaults: Record<ShapeKind, Pick<Shape, 'w' | 'h' | 'fill' | 'radius'> & { text?: string }> = {
  frame: { w: 200, h: 140, fill: '#ffffff', radius: 12 },
  rect: { w: 120, h: 80, fill: '#10b981', radius: 8 },
  ellipse: { w: 80, h: 80, fill: '#f43f5e', radius: 0 },
  text: { w: 160, h: 28, fill: '#18181b', radius: 0, text: 'Type something' },
};

export function makeShape(kind: ShapeKind, x: number, y: number, n: number): Shape {
  const d = defaults[kind];
  const label = kind[0].toUpperCase() + kind.slice(1);
  return { id: crypto.randomUUID(), kind, name: `${label} ${n}`, x: x - d.w / 2, y: y - d.h / 2, ...d, fresh: true };
}

export function generatedCard(ox: number, oy: number): Shape[] {
  const id = crypto.randomUUID();
  return [
    { id: `g-${id}-0`, kind: 'frame', name: 'AI / Pricing card', x: ox, y: oy, w: 210, h: 230, fill: '#18181b', radius: 16, fresh: true },
    { id: `g-${id}-1`, kind: 'text', name: 'Plan', x: ox + 20, y: oy + 22, w: 120, h: 18, fill: '#a1a1aa', radius: 0, text: 'PRO PLAN', fresh: true },
    { id: `g-${id}-2`, kind: 'text', name: 'Price', x: ox + 20, y: oy + 48, w: 150, h: 40, fill: '#ffffff', radius: 0, text: '$24/mo', fresh: true },
    { id: `g-${id}-3`, kind: 'rect', name: 'Divider', x: ox + 20, y: oy + 104, w: 170, h: 2, fill: '#3f3f46', radius: 1, fresh: true },
    { id: `g-${id}-4`, kind: 'rect', name: 'Feature', x: ox + 20, y: oy + 124, w: 140, h: 10, fill: '#52525b', radius: 5, fresh: true },
    { id: `g-${id}-5`, kind: 'rect', name: 'Feature', x: ox + 20, y: oy + 144, w: 110, h: 10, fill: '#52525b', radius: 5, fresh: true },
    { id: `g-${id}-6`, kind: 'rect', name: 'CTA', x: ox + 20, y: oy + 178, w: 170, h: 34, fill: '#0d99ff', radius: 10, fresh: true },
  ];
}
