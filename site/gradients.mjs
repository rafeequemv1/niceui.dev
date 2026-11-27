// Gradient gallery data. Each gradient becomes /gradients/<slug>; each family
// becomes /gradients/<family>-gradients. `stops` are [hex, percent].
// kind: "linear" (uses angle), "radial", or "mesh" (layers of radial blobs).

export const FAMILIES = [
  { id: "green", name: "Green gradients", blurb: "Fresh greens, from soft pastel mint to deep forest and emerald." },
  { id: "pastel", name: "Pastel gradients", blurb: "Soft, airy pastel gradients for backgrounds, cards and onboarding screens." },
  { id: "cream", name: "Cream & neutral gradients", blurb: "Warm creams, beiges and off-whites for calm, editorial designs." },
  { id: "blue", name: "Blue gradients", blurb: "Sky, ocean and electric blues for tech products and dashboards." },
  { id: "purple", name: "Purple gradients", blurb: "Lavender, violet and indigo gradients for creative and AI products." },
  { id: "pink", name: "Pink gradients", blurb: "Blush, rose and hot pink gradients for playful, modern brands." },
  { id: "orange", name: "Orange & sunset gradients", blurb: "Peach, coral and sunset gradients full of warmth." },
  { id: "dark", name: "Dark gradients", blurb: "Deep, low-contrast gradients for dark mode heroes and app backgrounds." },
  { id: "mesh", name: "Mesh gradients", blurb: "Multi-colour mesh gradients made of soft overlapping blobs." },
];

export const GRADIENTS = [
  // green
  { slug: "pastel-green-gradient", name: "Pastel Green", family: ["green", "pastel"], kind: "linear", angle: 135, stops: [["#d4fc79", 0], ["#96e6a1", 100]] },
  { slug: "mint-green-gradient", name: "Mint Green", family: ["green", "pastel"], kind: "linear", angle: 120, stops: [["#e0f9ec", 0], ["#a8edcb", 55], ["#7ee0b5", 100]] },
  { slug: "green-gradient", name: "Green", family: ["green"], kind: "linear", angle: 135, stops: [["#56ab2f", 0], ["#a8e063", 100]] },
  { slug: "emerald-gradient", name: "Emerald", family: ["green"], kind: "linear", angle: 135, stops: [["#047857", 0], ["#10b981", 60], ["#6ee7b7", 100]] },
  { slug: "forest-green-gradient", name: "Forest Green", family: ["green", "dark"], kind: "linear", angle: 160, stops: [["#0b2a1f", 0], ["#14532d", 50], ["#3f8f5a", 100]] },
  { slug: "lime-gradient", name: "Lime", family: ["green"], kind: "linear", angle: 90, stops: [["#bef264", 0], ["#84cc16", 100]] },
  { slug: "sage-green-gradient", name: "Sage Green", family: ["green", "cream"], kind: "linear", angle: 150, stops: [["#eef1e6", 0], ["#c8d5b9", 55], ["#9fb393", 100]] },
  { slug: "teal-gradient", name: "Teal", family: ["green", "blue"], kind: "linear", angle: 135, stops: [["#0f766e", 0], ["#2dd4bf", 100]] },
  // cream / neutral
  { slug: "light-cream-gradient", name: "Light Cream", family: ["cream", "pastel"], kind: "linear", angle: 180, stops: [["#fffdf6", 0], ["#fbf3e2", 60], ["#f4e7cf", 100]] },
  { slug: "mint-cream-gradient", name: "Mint Cream", family: ["cream", "green", "pastel"], kind: "linear", angle: 135, stops: [["#fdfbf3", 0], ["#e7f6ea", 100]] },
  { slug: "beige-gradient", name: "Beige", family: ["cream"], kind: "linear", angle: 135, stops: [["#f5ebe0", 0], ["#e3d5ca", 100]] },
  { slug: "warm-sand-gradient", name: "Warm Sand", family: ["cream", "orange"], kind: "linear", angle: 120, stops: [["#fdf6ec", 0], ["#f3dcc0", 55], ["#e6bf95", 100]] },
  { slug: "paper-white-gradient", name: "Paper White", family: ["cream"], kind: "radial", stops: [["#ffffff", 0], ["#f2efe9", 100]] },
  // pastel
  { slug: "pastel-rainbow-gradient", name: "Pastel Rainbow", family: ["pastel"], kind: "linear", angle: 90, stops: [["#ffd1dc", 0], ["#ffe5b4", 25], ["#fdfd96", 50], ["#c1f0c1", 75], ["#aec6cf", 100]] },
  { slug: "cotton-candy-gradient", name: "Cotton Candy", family: ["pastel", "pink", "blue"], kind: "linear", angle: 135, stops: [["#fbc2eb", 0], ["#a6c1ee", 100]] },
  { slug: "pastel-blue-gradient", name: "Pastel Blue", family: ["pastel", "blue"], kind: "linear", angle: 135, stops: [["#e0f2fe", 0], ["#bae6fd", 50], ["#c7d2fe", 100]] },
  { slug: "lavender-gradient", name: "Lavender", family: ["pastel", "purple"], kind: "linear", angle: 135, stops: [["#e9d5ff", 0], ["#c4b5fd", 100]] },
  { slug: "peach-gradient", name: "Peach", family: ["pastel", "orange"], kind: "linear", angle: 135, stops: [["#ffecd2", 0], ["#fcb69f", 100]] },
  // blue
  { slug: "blue-gradient", name: "Blue", family: ["blue"], kind: "linear", angle: 135, stops: [["#2563eb", 0], ["#38bdf8", 100]] },
  { slug: "sky-blue-gradient", name: "Sky Blue", family: ["blue", "pastel"], kind: "linear", angle: 180, stops: [["#3f8fe6", 0], ["#8ec5f2", 60], ["#e6f3fb", 100]] },
  { slug: "ocean-gradient", name: "Ocean", family: ["blue"], kind: "linear", angle: 160, stops: [["#0c4a6e", 0], ["#0369a1", 50], ["#22d3ee", 100]] },
  { slug: "electric-blue-gradient", name: "Electric Blue", family: ["blue", "purple"], kind: "linear", angle: 120, stops: [["#1e3a8a", 0], ["#3b82f6", 50], ["#7dd3fc", 100]] },
  { slug: "navy-gradient", name: "Navy", family: ["blue", "dark"], kind: "linear", angle: 180, stops: [["#020617", 0], ["#0f172a", 50], ["#1e3a8a", 100]] },
  // purple
  { slug: "purple-gradient", name: "Purple", family: ["purple"], kind: "linear", angle: 135, stops: [["#7c3aed", 0], ["#c084fc", 100]] },
  { slug: "violet-blue-gradient", name: "Violet Blue", family: ["purple", "blue"], kind: "linear", angle: 135, stops: [["#4f46e5", 0], ["#7c3aed", 50], ["#2563eb", 100]] },
  { slug: "ultraviolet-gradient", name: "Ultraviolet", family: ["purple", "dark"], kind: "linear", angle: 145, stops: [["#1e1b4b", 0], ["#4c1d95", 55], ["#a855f7", 100]] },
  // pink
  { slug: "pink-gradient", name: "Pink", family: ["pink"], kind: "linear", angle: 135, stops: [["#ec4899", 0], ["#f9a8d4", 100]] },
  { slug: "rose-gold-gradient", name: "Rose Gold", family: ["pink", "cream"], kind: "linear", angle: 135, stops: [["#f6d5c6", 0], ["#e8b4a6", 50], ["#c98b7f", 100]] },
  { slug: "pink-purple-gradient", name: "Pink Purple", family: ["pink", "purple"], kind: "linear", angle: 135, stops: [["#f472b6", 0], ["#a855f7", 100]] },
  // orange / sunset
  { slug: "sunset-gradient", name: "Sunset", family: ["orange", "pink"], kind: "linear", angle: 180, stops: [["#24324a", 0], ["#b06a48", 45], ["#ef8a52", 75], ["#ffd29c", 100]] },
  { slug: "orange-gradient", name: "Orange", family: ["orange"], kind: "linear", angle: 135, stops: [["#f97316", 0], ["#fdba74", 100]] },
  { slug: "coral-gradient", name: "Coral", family: ["orange", "pink"], kind: "linear", angle: 135, stops: [["#ff7e5f", 0], ["#feb47b", 100]] },
  { slug: "golden-hour-gradient", name: "Golden Hour", family: ["orange", "cream"], kind: "linear", angle: 160, stops: [["#fff4d6", 0], ["#fcd34d", 55], ["#f59e0b", 100]] },
  // dark
  { slug: "dark-gradient", name: "Dark", family: ["dark"], kind: "linear", angle: 180, stops: [["#18181b", 0], ["#09090b", 100]] },
  { slug: "midnight-gradient", name: "Midnight", family: ["dark", "blue"], kind: "radial", stops: [["#0c4a6e", 0], ["#020617", 70], ["#000000", 100]] },
  { slug: "black-gradient", name: "Black", family: ["dark"], kind: "linear", angle: 135, stops: [["#000000", 0], ["#1c1e22", 100]] },
  { slug: "charcoal-gradient", name: "Charcoal", family: ["dark"], kind: "linear", angle: 160, stops: [["#30333a", 0], ["#0b0c0e", 100]] },
  // mesh
  { slug: "aurora-mesh-gradient", name: "Aurora Mesh", family: ["mesh", "blue", "green"], kind: "mesh", base: "#020617", blobs: [["#22d3ee", 20, 25], ["#a78bfa", 80, 20], ["#34d399", 40, 85], ["#0ea5e9", 90, 80]] },
  { slug: "pastel-mesh-gradient", name: "Pastel Mesh", family: ["mesh", "pastel"], kind: "mesh", base: "#fdf8f3", blobs: [["#fbcfe8", 15, 20], ["#bae6fd", 85, 25], ["#d9f99d", 30, 85], ["#e9d5ff", 85, 85]] },
  { slug: "sunset-mesh-gradient", name: "Sunset Mesh", family: ["mesh", "orange", "pink"], kind: "mesh", base: "#1f1135", blobs: [["#fb7185", 20, 30], ["#fdba74", 80, 20], ["#f472b6", 60, 85], ["#facc15", 15, 85]] },
  { slug: "green-mesh-gradient", name: "Green Mesh", family: ["mesh", "green"], kind: "mesh", base: "#052e16", blobs: [["#4ade80", 20, 20], ["#bef264", 85, 30], ["#2dd4bf", 30, 85], ["#86efac", 80, 85]] },
  { slug: "cream-mesh-gradient", name: "Cream Mesh", family: ["mesh", "cream"], kind: "mesh", base: "#fffaf0", blobs: [["#fde68a", 20, 25], ["#fecdd3", 85, 20], ["#e7e5e4", 30, 85], ["#fed7aa", 80, 80]] },
];

/** CSS background value for a gradient. */
export function gradientCss(g) {
  const s = (st) => st.map(([c, p]) => `${c} ${p}%`).join(", ");
  if (g.kind === "linear") return `linear-gradient(${g.angle}deg, ${s(g.stops)})`;
  if (g.kind === "radial") return `radial-gradient(circle at 50% 30%, ${s(g.stops)})`;
  return [...g.blobs.map(([c, x, y]) => `radial-gradient(at ${x}% ${y}%, ${c} 0px, transparent 55%)`), g.base].join(", ");
}

/** Tailwind classes: arbitrary value always works; from/via/to when it maps cleanly. */
export function gradientTailwind(g) {
  const tw = (v) => v.replace(/\s*,\s*/g, ",").replace(/\s+/g, "_");
  // Tailwind needs the image: hint, and a mesh's solid base colour as its own class
  const arb = g.kind === "mesh" ? `bg-[image:${tw(g.blobs.map(([c, x, y]) => `radial-gradient(at ${x}% ${y}%, ${c} 0px, transparent 55%)`).join(", "))}] bg-[${g.base}]` : `bg-[image:${tw(gradientCss(g))}]`;
  const dirs = { 0: "to-t", 45: "to-tr", 90: "to-r", 135: "to-br", 180: "to-b", 225: "to-bl", 270: "to-l", 315: "to-tl" };
  let simple = null;
  if (g.kind === "linear" && dirs[g.angle] && g.stops.length <= 3) {
    const [a, b, c] = g.stops;
    simple = `bg-gradient-${dirs[g.angle]} from-[${a[0]}] ${c ? `via-[${b[0]}] to-[${c[0]}]` : `to-[${b[0]}]`}`;
  }
  return { arb, simple };
}

/** Main colours, for alt text and descriptions. */
export const gradientColours = (g) => (g.kind === "mesh" ? [g.base, ...g.blobs.map((b) => b[0])] : g.stops.map((s) => s[0]));
