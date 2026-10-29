// Single source of truth for the library.
// To ship a new item: add registry/<slug>.tsx, then add an entry here with status "ready".
// Pages, sitemap, llms.txt, shadcn registry JSON and structured data are generated from this list.

export const site = {
  name: "NiceUI",
  url: "https://niceui.dev",
  tagline: "Interfaces, nicely made.",
  description:
    "NiceUI is a free, open-source library of premium React and Tailwind CSS components, blocks and templates. Copy the code or install with the shadcn CLI. MIT licensed, no account required.",
  github: "https://github.com/",
  x: "https://x.com/",
};

export const items = [
  // ─── Components (ready) ───────────────────────────────────────────
  {
    slug: "button",
    name: "Button",
    kind: "component",
    category: "Buttons",
    status: "ready",
    description: "A pill-shaped button with primary, outline and ghost variants in three sizes. Accessible focus ring, forwarded ref.",
    keywords: ["react button", "tailwind button", "pill button"],
    thumb: 0.86,
    preview: `<div class="x-row"><button class="x-btn x-btn-primary">Get started</button><button class="x-btn x-btn-outline">Learn more</button><button class="x-btn x-btn-ghost">Cancel</button></div>`,
    usage: `import { Button } from "@/components/ui/button";

export default function Example() {
  return (
    <div className="flex gap-2">
      <Button>Get started</Button>
      <Button variant="outline">Learn more</Button>
      <Button variant="ghost">Cancel</Button>
    </div>
  );
}`,
  },
  {
    slug: "shimmer-button",
    name: "Shimmer Button",
    kind: "component",
    category: "Buttons",
    status: "ready",
    description: "A dark button with a sweeping sky-blue shimmer and a glowing bottom edge. Zero dependencies, keyframes included.",
    keywords: ["shimmer button", "animated button", "glow button"],
    preview: `<button class="x-shimmer"><span class="x-shimmer-sweep"></span><span class="x-shimmer-edge"></span><span class="x-shimmer-label">Join the beta <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></button>`,
    usage: `import { ShimmerButton } from "@/components/ui/shimmer-button";

export default function Example() {
  return <ShimmerButton>Join the beta</ShimmerButton>;
}`,
  },
  {
    slug: "badge",
    name: "Badge",
    kind: "component",
    category: "Data display",
    status: "ready",
    description: "Compact status labels in neutral, sky and outline variants, with an optional glowing status dot.",
    keywords: ["badge", "status pill", "tag"],
    preview: `<div class="x-row"><span class="x-badge x-badge-sky"><i></i>Live</span><span class="x-badge x-badge-neutral">Draft</span><span class="x-badge x-badge-outline">Archived</span></div>`,
    usage: `import { Badge } from "@/components/ui/badge";

export default function Example() {
  return (
    <div className="flex gap-1.5">
      <Badge variant="sky" dot>Live</Badge>
      <Badge>Draft</Badge>
      <Badge variant="outline">Archived</Badge>
    </div>
  );
}`,
  },
  {
    slug: "floating-input",
    name: "Floating Input",
    kind: "component",
    category: "Forms",
    status: "ready",
    description: "A text input whose label floats above the value on focus. Pure CSS peer states, no JavaScript needed for the animation.",
    keywords: ["floating label input", "tailwind input", "form field"],
    preview: `<div class="x-field"><input id="pv-email" type="email" placeholder=" " /><label for="pv-email">Email address</label></div>`,
    usage: `import { FloatingInput } from "@/components/ui/floating-input";

export default function Example() {
  return <FloatingInput label="Email address" type="email" />;
}`,
  },
  {
    slug: "switch",
    name: "Switch",
    kind: "component",
    category: "Forms",
    status: "ready",
    description: "An accessible toggle with a springy thumb. Works controlled or uncontrolled and uses role=\"switch\".",
    keywords: ["toggle switch", "react switch", "settings toggle"],
    preview: `<div class="x-opts"><label>Notifications <input type="checkbox" class="x-sw" checked /></label><label>Analytics <input type="checkbox" class="x-sw" /></label><label>Auto-update <input type="checkbox" class="x-sw" checked /></label></div>`,
    usage: `import { Switch } from "@/components/ui/switch";

export default function Example() {
  return (
    <label className="flex items-center justify-between gap-6 text-sm">
      Notifications
      <Switch defaultChecked label="Notifications" />
    </label>
  );
}`,
  },
  {
    slug: "segmented-control",
    name: "Segmented Control",
    kind: "component",
    category: "Navigation",
    status: "ready",
    description: "A pill tab switcher with a sliding sky indicator that springs between options.",
    keywords: ["segmented control", "animated tabs", "toggle group"],
    preview: `<div class="x-seg" data-seg><span class="x-seg-ind"></span><button class="on">Day</button><button>Week</button><button>Month</button></div>`,
    usage: `import { SegmentedControl } from "@/components/ui/segmented-control";

export default function Example() {
  return <SegmentedControl options={["Day", "Week", "Month"]} />;
}`,
  },
  {
    slug: "slider",
    name: "Slider",
    kind: "component",
    category: "Forms",
    status: "ready",
    description: "A minimal range slider with a sky fill, soft halo thumb and a live value readout.",
    keywords: ["range slider", "react slider", "tailwind range"],
    preview: `<div class="x-range" data-range><div class="x-range-top"><span>Opacity</span><span class="x-mono" data-range-v>64%</span></div><input type="range" min="0" max="100" value="64" aria-label="Opacity" /></div>`,
    usage: `import { Slider } from "@/components/ui/slider";

export default function Example() {
  return <Slider label="Opacity" defaultValue={64} format={(v) => v + "%"} />;
}`,
  },
  {
    slug: "stat-card",
    name: "Stat Card",
    kind: "component",
    category: "Data display",
    status: "ready",
    description: "A KPI card with label, value, delta and an inline sparkline generated from your data points.",
    keywords: ["stat card", "kpi card", "dashboard metric", "sparkline"],
    preview: `<div class="x-stat"><div class="x-stat-top"><span>Monthly revenue</span><em>+12.4%</em></div><span class="x-stat-v" data-count="48290">$48,290</span><svg viewBox="0 0 120 32" preserveAspectRatio="none"><path d="M0 26 L15 22 L30 24 L45 16 L60 18 L75 10 L90 12 L105 5 L120 7" fill="none" stroke="#7dd3fc" stroke-width="1.5"/></svg></div>`,
    usage: `import { StatCard } from "@/components/ui/stat-card";

export default function Example() {
  return (
    <StatCard
      label="Monthly revenue"
      value="$48,290"
      delta="+12.4%"
      trend={[4, 8, 6, 14, 12, 20, 18, 26, 24]}
    />
  );
}`,
  },
  {
    slug: "command-palette",
    name: "Command Palette",
    kind: "component",
    category: "Navigation",
    status: "ready",
    description: "A ⌘K search palette with live filtering, arrow-key navigation and an Enter action per item.",
    keywords: ["command palette", "cmd k", "command menu", "spotlight search"],
    thumb: 0.72,
    preview: `<div class="x-pal" data-pal><div class="x-pal-in"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input placeholder="Search components…" aria-label="Search" /><kbd>⌘K</kbd></div><ul><li class="on"><span>Hero — Horizon</span><em>Block</em></li><li><span>Pricing — Minimal</span><em>Block</em></li><li><span>Command Palette</span><em>Component</em></li><li><span>Stat Card</span><em>Component</em></li></ul></div>`,
    usage: `import { CommandPalette } from "@/components/ui/command-palette";

export default function Example() {
  return (
    <CommandPalette
      placeholder="Search components…"
      items={[
        { label: "Hero — Horizon", hint: "Block" },
        { label: "Pricing — Minimal", hint: "Block" },
        { label: "Command Palette", hint: "Component" },
      ]}
    />
  );
}`,
  },
  {
    slug: "avatar-group",
    name: "Avatar Group",
    kind: "component",
    category: "Data display",
    status: "ready",
    description: "Overlapping avatars with initials fallback, hover lift and a +N overflow counter.",
    keywords: ["avatar group", "avatar stack", "user avatars"],
    preview: `<div class="x-avs"><i>AK</i><i>MJ</i><i>RS</i><i>LP</i><i class="more">+9</i></div>`,
    usage: `import { AvatarGroup } from "@/components/ui/avatar-group";

const people = ["Ada King", "Mia Jones", "Raj Shah", "Leo Park", "Noa Ito", "Sam Lee"];

export default function Example() {
  return <AvatarGroup people={people.map((name) => ({ name }))} max={4} />;
}`,
  },
  {
    slug: "marquee",
    name: "Marquee",
    kind: "component",
    category: "Motion",
    status: "ready",
    description: "An infinite, edge-faded horizontal scroller for logos, tags or testimonials. Pauses on hover.",
    keywords: ["marquee", "infinite scroll", "logo carousel", "ticker"],
    preview: `<div class="x-marquee"><div class="x-marquee-track"><span>Accordion</span><span>Dialog</span><span>Tooltip</span><span>Sidebar</span><span>Command</span><span>Toast</span><span>Carousel</span><span>Accordion</span><span>Dialog</span><span>Tooltip</span><span>Sidebar</span><span>Command</span><span>Toast</span><span>Carousel</span></div></div>`,
    usage: `import { Marquee } from "@/components/ui/marquee";

const tags = ["Accordion", "Dialog", "Tooltip", "Sidebar", "Command", "Toast"];

export default function Example() {
  return (
    <Marquee>
      {tags.map((tag) => (
        <span key={tag} className="rounded-lg border border-white/15 px-3.5 py-2 text-sm">
          {tag}
        </span>
      ))}
    </Marquee>
  );
}`,
  },

  // ─── Blocks (ready) ───────────────────────────────────────────────
  {
    slug: "hero-horizon",
    name: "Hero — Horizon",
    kind: "block",
    category: "Heroes",
    status: "ready",
    description: "A cinematic landing hero with serif-italic accent, dual CTAs and the signature glowing horizon arc.",
    keywords: ["hero section", "landing page hero", "saas hero", "tailwind hero"],
    thumb: 0.42,
    wide: true,
    preview: `<div class="x-hero"><p class="x-hero-k"><span></span>Now in public beta</p><h3>Ship faster,<br /><em>beautifully</em> built.</h3><p class="x-hero-l">The platform for teams who care about craft.</p><div class="x-row"><span class="x-btn x-btn-primary">Get started</span><span class="x-btn x-btn-outline">Read the docs</span></div><div class="x-hero-h"><div class="x-hero-arc"></div><div class="x-hero-glow"></div></div></div>`,
    usage: `import { HeroHorizon } from "@/components/hero-horizon";

export default function Page() {
  return <HeroHorizon />;
}`,
  },
  {
    slug: "pricing-minimal",
    name: "Pricing — Minimal",
    kind: "block",
    category: "Pricing",
    status: "ready",
    description: "Three-tier pricing with a monthly/yearly toggle, featured plan glow and checkmark feature lists.",
    keywords: ["pricing table", "pricing section", "saas pricing", "tailwind pricing"],
    thumb: 0.42,
    wide: true,
    preview: `<div class="x-pricing" data-pricing><div class="x-pr-head"><h3>Simple, <em>honest</em> pricing.</h3><div class="x-pr-toggle"><button>Monthly</button><button class="on">Yearly</button></div></div><div class="x-pr-grid"><div class="x-pr-card"><b>Starter</b><div class="x-pr-price"><span data-m="0" data-y="0">$0</span><small>/ mo</small></div><p>For side projects.</p><ul><li>3 projects</li><li>Community support</li><li>Basic analytics</li></ul><span class="x-btn x-btn-outline">Start free</span></div><div class="x-pr-card feat"><b>Pro <i>Popular</i></b><div class="x-pr-price"><span data-m="24" data-y="19">$19</span><small>/ mo</small></div><p>For growing products.</p><ul><li>Unlimited projects</li><li>Priority support</li><li>Advanced analytics</li></ul><span class="x-btn x-btn-primary">Upgrade to Pro</span></div><div class="x-pr-card"><b>Team</b><div class="x-pr-price"><span data-m="59" data-y="49">$49</span><small>/ mo</small></div><p>For teams at scale.</p><ul><li>Everything in Pro</li><li>SSO and audit log</li><li>Dedicated manager</li></ul><span class="x-btn x-btn-outline">Contact sales</span></div></div></div>`,
    usage: `import { PricingMinimal } from "@/components/pricing-minimal";

export default function Page() {
  return <PricingMinimal />;
}`,
  },

  // ─── Coming soon ──────────────────────────────────────────────────
  ...[
    ["Accordion", "Disclosure"], ["Alert", "Feedback"], ["Dialog", "Overlays"], ["Dropdown Menu", "Overlays"],
    ["Tooltip", "Overlays"], ["Tabs", "Navigation"], ["Toast", "Feedback"], ["Checkbox", "Forms"],
    ["Radio Group", "Forms"], ["Select", "Forms"], ["Textarea", "Forms"], ["OTP Input", "Forms"],
    ["File Upload", "Forms"], ["Data Table", "Data display"], ["Pagination", "Navigation"], ["Calendar", "Forms"],
    ["Date Picker", "Forms"], ["Carousel", "Motion"], ["Spotlight Card", "Cards"], ["Number Ticker", "Motion"],
    ["Text Reveal", "Motion"], ["Kanban Board", "Data display"], ["AI Prompt Input", "AI"], ["Chat Bubble", "AI"],
  ].map(([name, category]) => ({ name, category, kind: "component", status: "soon" })),
  ...[
    ["Navbar — Floating", "Navigation"], ["Feature Grid", "Features"], ["Bento Grid", "Features"],
    ["Testimonials", "Social proof"], ["Logo Cloud", "Social proof"], ["FAQ", "Content"], ["CTA — Horizon", "Marketing"],
    ["Footer — Minimal", "Navigation"], ["Sign In", "Auth"], ["Dashboard Shell", "Application"],
  ].map(([name, category]) => ({ name, category, kind: "block", status: "soon" })),
  ...[
    ["Horizon", "SaaS landing page"], ["Console", "Admin dashboard"], ["Relay", "AI chat app"], ["Folio", "Portfolio"],
  ].map(([name, category]) => ({ name, category, kind: "template", status: "soon" })),
];

export const faq = [
  {
    q: "What is NiceUI?",
    a: "NiceUI is a free, open-source library of premium React and Tailwind CSS components, blocks and templates. Every item is copy-paste code that lives in your own project, styled in a minimal black and sky-blue aesthetic.",
  },
  {
    q: "Is NiceUI really free?",
    a: "Yes. Every component, block and template is free under the MIT license, including for commercial projects. There is no Pro tier, no credits and no account required.",
  },
  {
    q: "How do I install a NiceUI component?",
    a: "Run the shadcn CLI with the component's registry URL, for example: npx shadcn@latest add https://niceui.dev/r/button.json. You can also copy the code from any component page into components/ui in your project.",
  },
  {
    q: "Does NiceUI work with shadcn/ui and Next.js?",
    a: "Yes. NiceUI follows the shadcn registry format and works with React 18+, Next.js, Vite and Remix, styled with Tailwind CSS v3 or v4. Components have no runtime dependencies beyond React.",
  },
  {
    q: "Is NiceUI an alternative to 21st.dev or shadcn/ui?",
    a: "NiceUI uses the same open copy-paste model as shadcn/ui and community libraries like 21st.dev, with a focus on a small set of carefully designed pieces. Everything is free, MIT licensed and requires no sign-up.",
  },
  {
    q: "Can AI coding assistants use NiceUI?",
    a: "Yes. NiceUI publishes llms.txt and llms-full.txt, a Markdown version of every component page, and a Copy prompt button that hands the full source to tools like Claude, Cursor or v0.",
  },
];
