import { ARTWORKS, artwork } from '@/components/gallery/art';

export type Swatch = { name: string; hex: string };
export type Product = {
  id: number;
  name: string;
  kind: string;
  price: number;
  compareAt?: number;
  badge?: 'New' | 'Sale' | 'Limited';
  rating: number;
  reviews: number;
  art: [number, number];
  swatches: Swatch[];
  sizes: { label: string; stock: number }[];
};

const FRAMES: Swatch[] = [
  { name: 'Oak', hex: '#c8a27a' },
  { name: 'Black', hex: '#1c1c1f' },
  { name: 'White', hex: '#f1efe9' },
];

const SIZES = [
  { label: 'A4', stock: 12 },
  { label: 'A3', stock: 4 },
  { label: 'A2', stock: 0 },
  { label: 'A1', stock: 2 },
];

export const PRODUCTS: Product[] = [
  { id: 0, name: 'Low Tide, Dawn', kind: 'Giclée print', price: 68, badge: 'New', rating: 4.9, reviews: 214, art: [0, 6], swatches: FRAMES, sizes: SIZES },
  { id: 1, name: 'Neon Bloom', kind: 'Framed print', price: 96, compareAt: 128, badge: 'Sale', rating: 4.7, reviews: 98, art: [1, 8], swatches: FRAMES.slice(0, 2), sizes: SIZES },
  { id: 2, name: 'Glass Lagoon', kind: 'Canvas', price: 142, rating: 4.8, reviews: 61, art: [2, 7], swatches: FRAMES, sizes: SIZES },
  { id: 3, name: 'Copper Dunes', kind: 'Giclée print', price: 74, badge: 'Limited', rating: 5, reviews: 33, art: [3, 11], swatches: FRAMES.slice(1), sizes: SIZES },
  { id: 4, name: 'Fog Study No. 4', kind: 'Framed print', price: 88, rating: 4.6, reviews: 120, art: [4, 10], swatches: FRAMES, sizes: SIZES },
  { id: 5, name: 'Green Hour', kind: 'Canvas', price: 118, compareAt: 150, badge: 'Sale', rating: 4.8, reviews: 76, art: [5, 9], swatches: FRAMES.slice(0, 2), sizes: SIZES },
];

export const img = (artId: number, w = 600, h = 750) => artwork(artId, w, h);
export const artistOf = (p: Product) => ARTWORKS[p.art[0]].artist;
export const money = (n: number) => `$${n.toFixed(n % 1 ? 2 : 0)}`;
