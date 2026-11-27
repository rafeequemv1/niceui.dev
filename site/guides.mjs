// Long-form guides and comparison pages. Body is HTML; `{{cards:a,b,c}}` is
// replaced with live NiceUI component cards (keys "<section>/<slug>"; missing
// keys are skipped). `{{code:lang}}…{{/code}}` becomes a copyable code block.

export const GUIDES = [
  {
    slug: "website-animation-examples",
    title: "Website Animation Examples — 40 Ideas with Free React Code",
    h1: "Website animation examples",
    description: "Website animation examples you can copy: hero backgrounds, text effects, scroll reveals, hover states, cursors, loaders and micro-interactions, each with free React and Tailwind code.",
    lede: "Good website animations explain, guide or reward. They are never just decoration. Here are forty proven patterns grouped by what they do, each with a live example and source you can copy.",
    updated: "2026-11-27",
    body: `
<h2>What makes a website animation work</h2>
<p>Every animation on a page should answer a question for the visitor: <em>what changed?</em>, <em>where should I look?</em> or <em>did that work?</em> Motion that does none of those is noise. Three rules cover most cases:</p>
<ul>
<li><b>Keep it short.</b> 150–300 ms for interface feedback, up to about a second for an entrance. Anything longer feels slow the second time.</li>
<li><b>Animate transform and opacity.</b> They run on the compositor and stay smooth even on phones. Avoid animating width, height or top.</li>
<li><b>Respect reduced motion.</b> Wrap non-essential motion in <code>prefers-reduced-motion</code> so people who get motion sick still get the content.</li>
</ul>

<h2>1. Hero and background animations</h2>
<p>The first screen sets the tone. A slow, drifting background adds depth without competing with the headline. Aurora gradients, light beams and animated grids are the most common, and the subtle ones age best.</p>
{{cards:effects/aurora-background,effects/beams-background,effects/animated-grid,marketing/hero-dusk,marketing/hero-meadow,components/shader-background}}

<h2>2. Text animations</h2>
<p>Animated text draws the eye to the one line you most want read. A typing effect suits developer tools, a scramble suits anything technical, and rotating words let one headline speak to several audiences.</p>
{{cards:effects/typewriter-text,effects/scramble-text,effects/word-rotate,effects/gradient-text,effects/number-ticker,components/text-animation}}

<h2>3. Scroll animations</h2>
<p>Scroll-driven motion turns a long page into a story. Reveal content as it enters the viewport, pin a visual while copy scrolls past, or zoom an image into the next section. Use it sparingly: two or three scroll moments per page are plenty.</p>
{{cards:gallery/scroll-reveal-images,gallery/zoom-parallax,gallery/scroll-stack-gallery,gallery/horizontal-scroll-gallery,gallery/curtain-reveal,components/scroll-animation}}

<h2>4. Hover and cursor effects</h2>
<p>Hover states tell people what is clickable. Go beyond a colour change with a magnetic pull, an underline that draws in, a spotlight that follows the pointer or a custom cursor that labels what a click will do.</p>
{{cards:effects/custom-cursor,effects/cursor-trail,effects/underline-animation,effects/magnetic-button,effects/spotlight-card,components/tilt-card}}

<h2>5. Loading and progress animations</h2>
<p>Waiting feels shorter when something moves. Use a small spinner for quick actions, a progress bar when you know the duration, and a shimmer or thinking indicator for AI responses.</p>
{{cards:components/loader,ai/thinking-states,ai/thinking-orbs,ai/dot-wave,ai/grid-flicker,ai/agent-loading}}

<h2>6. Micro-interactions</h2>
<p>Tiny responses to a click or toggle make an interface feel alive: a switch that springs, a button that confirms, confetti when someone finishes a task, a toast that stacks neatly.</p>
{{cards:components/theme-toggle,components/switch,effects/confetti,components/toast-stack,components/action-swap,effects/ripple-button}}

<h2>7. Navigation animations</h2>
<p>Menus that animate between states help people keep their place. Slide a highlight to the hovered link, morph a header as the page scrolls, or let a mega menu resize smoothly between sections.</p>
{{cards:marketing/animated-navbar,marketing/mega-menu,marketing/sticky-header,components/dock,blocks/morphing-tabs,marketing/bottom-navigation}}

<h2>How to add these to your site</h2>
<p>Every example above is a free React and Tailwind CSS component. Open one, copy the source or install it with the shadcn CLI, and it lives in your project with no package to update:</p>
{{code:bash}}npx shadcn@latest add https://niceui.dev/r/effects-aurora-background.json{{/code}}
<p>Start with one hero background, one text effect and good hover states. That alone makes most sites feel considered.</p>`,
    faq: [
      ["What are the most common website animations?", "Hero background motion, text reveals, scroll-triggered entrances, hover effects on buttons and cards, loading indicators and small micro-interactions such as toggles and toasts."],
      ["Do animations slow down a website?", "Not when they animate transform and opacity, run only while visible and avoid large JavaScript libraries. All examples here follow those rules."],
      ["How do I make animations accessible?", "Honour prefers-reduced-motion, never hide content behind animation, and keep flashing below three times per second."],
    ],
  },
  {
    slug: "react-icon-libraries",
    title: "Best React Icon Libraries in 2026 — Compared",
    h1: "The best React icon libraries",
    description: "A practical comparison of React icon libraries: Lucide, React Icons, Heroicons, Phosphor, Tabler, Radix Icons, Material Symbols, Iconoir and Remix Icon — with install commands and when to pick each.",
    lede: "Picking an icon set early saves a lot of visual inconsistency later. Here are the React icon libraries worth knowing, what each is good at, and how to install it.",
    updated: "2026-11-27",
    body: `
<h2>How to choose</h2>
<ul>
<li><b>One style, everywhere.</b> Mixing sets with different stroke widths and corner radii is the fastest way to make a UI look unfinished.</li>
<li><b>Tree-shaking.</b> Import icons one by one so only the ones you use reach the bundle.</li>
<li><b>Coverage.</b> Make sure the set has the boring icons you will need (settings, filter, sort, upload), not just pretty ones.</li>
</ul>

<h2>Lucide</h2>
<p>A clean, consistent 24 px outline set and a community fork of Feather. It is the default in shadcn/ui and in most NiceUI components, with a large catalogue and props for size, colour and stroke width.</p>
{{code:bash}}npm install lucide-react{{/code}}
{{code:tsx}}import { Search } from 'lucide-react';

<Search className="h-4 w-4" strokeWidth={1.75} />{{/code}}

<h2>React Icons</h2>
<p>One package that bundles many popular sets (Font Awesome, Material, Feather, Bootstrap and more) behind a common API. Great for prototypes and when you need a brand icon; import from the specific sub-path so tree-shaking works.</p>
{{code:bash}}npm install react-icons{{/code}}

<h2>Heroicons</h2>
<p>Made by the Tailwind CSS team, in outline, solid, mini and micro sizes. A smaller set, but very polished and a natural fit for Tailwind projects.</p>
{{code:bash}}npm install @heroicons/react{{/code}}

<h2>Phosphor</h2>
<p>A flexible family with six weights per icon, from thin to fill plus duotone, so one set can cover both quiet interfaces and bold marketing pages.</p>
{{code:bash}}npm install @phosphor-icons/react{{/code}}

<h2>Tabler Icons</h2>
<p>A very large free outline set on a 24 px grid with adjustable stroke, especially strong on dashboard and developer icons.</p>
{{code:bash}}npm install @tabler/icons-react{{/code}}

<h2>Radix Icons</h2>
<p>A compact 15 px set designed for dense interfaces. It pairs well with Radix primitives and toolbars.</p>
{{code:bash}}npm install @radix-ui/react-icons{{/code}}

<h2>Material Symbols</h2>
<p>Google's set, available as a variable font with adjustable fill, weight and grade, or as React components through <code>@mui/icons-material</code> if you already use MUI.</p>

<h2>Iconoir and Remix Icon</h2>
<p>Two more well-made free sets: Iconoir has a distinctive light, rounded outline style, and Remix Icon offers matching line and fill versions of almost every icon.</p>
{{code:bash}}npm install iconoir-react @remixicon/react{{/code}}

<h2>Our pick</h2>
<p>For most React and Tailwind projects, start with <b>Lucide</b> and reach for <b>React Icons</b> only for brand logos. If your design needs several weights, choose <b>Phosphor</b>. Whatever you pick, use one set for the whole product.</p>
<p>Icons shine inside good components. These NiceUI components all use Lucide and are free to copy:</p>
{{cards:site/command-palette,components/dock,blocks/action-bar,marketing/feature-grid,effects/icon-cloud,application/settings-page}}`,
    faq: [
      ["What is the most popular React icon library?", "Lucide and React Icons are the most widely used. Lucide is the default in shadcn/ui; React Icons bundles many sets in one package."],
      ["Do icon libraries increase bundle size?", "Only by the icons you import, as long as you import them individually and your bundler tree-shakes."],
      ["Can I use SVG icons without a library?", "Yes. Paste the SVG into a React component and pass className through. Libraries simply save you that work."],
    ],
  },
  {
    slug: "auto-resize-textarea",
    title: "How to Auto-Resize a Textarea (CSS & React)",
    h1: "How to auto-resize a textarea",
    description: "Make a textarea grow with its content using CSS field-sizing, or a small React hook with scrollHeight. Plus how to disable or restrict textarea resizing.",
    lede: "A textarea that grows as people type feels much better than one that scrolls inside a tiny box. There is now a one-line CSS answer, and a small JavaScript fallback for older browsers.",
    updated: "2026-11-27",
    body: `
<h2>The modern CSS way: field-sizing</h2>
<p>The <code>field-sizing: content</code> property makes form controls size themselves to their content. Add a minimum and maximum so it doesn't collapse or grow forever:</p>
{{code:css}}textarea {
  field-sizing: content;
  min-height: 3lh;   /* about three lines */
  max-height: 12lh;  /* then scroll */
}{{/code}}
<p>Browser support is still growing, so use the React approach below as a fallback or when you need precise control.</p>

<h2>The React way: measure scrollHeight</h2>
<p>Reset the height to <code>auto</code>, read <code>scrollHeight</code> and set the height to match. Do it whenever the value changes:</p>
{{code:tsx}}import { useLayoutEffect, useRef } from 'react';

export function AutoTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 320) + 'px';
  }, [props.value]);
  return <textarea ref={ref} rows={2} {...props} className="resize-none overflow-y-auto" />;
}{{/code}}

<h2>How to disable textarea resizing</h2>
<p>Browsers show a drag handle in the corner of a textarea. Remove it, or allow vertical resizing only:</p>
{{code:css}}textarea { resize: none; }      /* no handle */
textarea { resize: vertical; }  /* height only */{{/code}}
<p>In Tailwind, use <code>resize-none</code>, <code>resize-y</code> or <code>resize-x</code>.</p>

<h2>Ready-made components</h2>
<p>NiceUI's Auto-Resize Textarea adds a character counter, min and max rows and a custom drag handle, and the Resizable Panels component gives you draggable split panes with keyboard support:</p>
{{cards:components/auto-resize-textarea,components/resizable-panels,ai/prompt-input,ai/command-composer}}`,
    faq: [
      ["How do I make a textarea expand automatically?", "Use field-sizing: content in CSS, or set the height to its scrollHeight on every input in JavaScript."],
      ["How do I stop a textarea from being resized?", "Add resize: none in CSS, or the resize-none class in Tailwind."],
      ["Why does my auto-resizing textarea jump?", "Set the height to auto before reading scrollHeight, and run the update in useLayoutEffect so it happens before paint."],
    ],
  },
  {
    slug: "react-frameworks",
    title: "React Frameworks — Which One Should You Use?",
    h1: "React frameworks compared",
    description: "A clear guide to React frameworks: Next.js, React Router (formerly Remix), Astro, TanStack Start, Vite single-page apps and Expo — what each is for and how to choose.",
    lede: "React itself only renders components. A framework adds routing, data loading, rendering on the server and a build setup. Here's what the main options are good at, without the hype.",
    updated: "2026-11-27",
    body: `
<h2>Next.js</h2>
<p>The most widely used React framework. It offers file-based routing, React Server Components, static and server rendering, image optimisation and API routes in one package. Choose it for most production web apps, marketing sites with dynamic parts and anything that benefits from a large ecosystem.</p>

<h2>React Router (framework mode)</h2>
<p>Remix merged into React Router, which now has a framework mode with nested routes, loaders and actions for data, and server rendering. It stays close to web standards such as forms and fetch. Choose it if you like explicit data loading per route.</p>

<h2>Astro</h2>
<p>A content-first framework that ships zero JavaScript by default and hydrates only the interactive "islands", which can be React components. Choose it for blogs, docs and marketing sites where most of the page is static.</p>

<h2>TanStack Start</h2>
<p>A full-stack framework built on TanStack Router, with type-safe routing, server functions and streaming. Choose it if you want end-to-end type safety and already use TanStack Query or Router.</p>

<h2>Vite (single-page app)</h2>
<p>Not a framework, but the simplest way to run React: a fast dev server and a static build. Choose it for dashboards behind a login, internal tools and prototypes where SEO doesn't matter.</p>

<h2>Expo (React Native)</h2>
<p>For iOS and Android apps written in React, with file-based routing through Expo Router and an optional web target.</p>

<h2>How to choose</h2>
<ul>
<li><b>Public site that must rank in search:</b> Next.js or Astro.</li>
<li><b>App behind a login:</b> Vite, React Router or Next.js.</li>
<li><b>Mostly content with some interactivity:</b> Astro.</li>
<li><b>You want strict types from route to server:</b> TanStack Start.</li>
<li><b>Mobile apps:</b> Expo.</li>
</ul>

<h2>UI works in all of them</h2>
<p>NiceUI components are plain React and Tailwind CSS, so they drop into any of these frameworks. Interactive components need a client boundary in Next.js (<code>'use client'</code>) and a client directive in Astro (<code>client:load</code>).</p>
{{cards:landing/saas-landing,landing/agent-platform-landing,apps/docs-site,examples/analytics}}`,
    faq: [
      ["What is the best React framework?", "For most production web apps, Next.js. For content-heavy sites, Astro. For apps behind a login, a Vite single-page app is often enough."],
      ["Is Remix still a thing?", "Remix merged into React Router, so new projects use React Router's framework mode."],
      ["Do I need a framework to use React?", "No. Vite gives you a fast React setup without one; add a framework when you need server rendering, routing conventions or data loading."],
    ],
  },
  {
    slug: "css-loading-animations",
    title: "CSS Loading Animations — Spinners, Dots & Skeletons",
    h1: "CSS loading animations",
    description: "How to build CSS loading animations — spinners, bouncing dots, progress bars, shimmer skeletons and AI thinking indicators — with copy-paste code and React components.",
    lede: "A loading animation tells people the app heard them. These are the patterns worth using, the CSS behind them and ready-made React components.",
    updated: "2026-11-27",
    body: `
<h2>A simple CSS spinner</h2>
{{code:css}}.spinner {
  width: 20px; height: 20px;
  border: 2px solid rgb(255 255 255 / .15);
  border-top-color: #7dd3fc;
  border-radius: 50%;
  animation: spin .8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }{{/code}}

<h2>Bouncing dots</h2>
{{code:css}}.dots span {
  display: inline-block; width: 6px; height: 6px; margin: 0 2px;
  border-radius: 50%; background: currentColor;
  animation: bounce 1s infinite ease-in-out;
}
.dots span:nth-child(2) { animation-delay: .15s; }
.dots span:nth-child(3) { animation-delay: .3s; }
@keyframes bounce { 0%, 80%, 100% { transform: translateY(0); opacity: .4 } 40% { transform: translateY(-5px); opacity: 1 } }{{/code}}

<h2>Shimmer skeletons</h2>
<p>When a whole section is loading, a skeleton in the shape of the content feels faster than a spinner. Animate a gradient across a grey block:</p>
{{code:css}}.skeleton {
  background: linear-gradient(90deg, #111 25%, #1c1c1c 50%, #111 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}
@keyframes shimmer { to { background-position: -200% 0; } }{{/code}}

<h2>Which one to use</h2>
<ul>
<li><b>Under a second:</b> nothing, or a tiny spinner inside the button.</li>
<li><b>One to ten seconds:</b> a spinner or dots, ideally with a short status line.</li>
<li><b>Page sections:</b> skeletons.</li>
<li><b>AI responses:</b> a thinking indicator, then stream the answer.</li>
</ul>
<p>Always add <code>role="status"</code> and visually hidden text such as "Loading…" so screen reader users get the same feedback.</p>

<h2>Ready-made loading components</h2>
{{cards:components/loader,ai/braille-spinner,ai/thinking-states,ai/thinking-rings,ai/scan-line,ai/agent-loading}}`,
    faq: [
      ["How do I make a loading animation with CSS only?", "Use a keyframe animation on transform or opacity, such as a rotating bordered circle or bouncing dots. No JavaScript is needed."],
      ["Are skeleton screens better than spinners?", "For loading page sections, yes: they show the layout early and feel faster. Spinners suit short actions."],
    ],
  },
];

export const COMPARE = [
  {
    slug: "magic-ui-alternatives",
    title: "Magic UI Alternatives — Free Animated React Component Libraries",
    h1: "Magic UI alternatives",
    description: "Looking for a Magic UI alternative? Compare free animated React and Tailwind component libraries, including NiceUI, shadcn/ui, Aceternity UI and 21st.dev.",
    lede: "Magic UI popularised copy-paste animated components for React and Tailwind. If you're comparing options, here's how the main libraries differ and where NiceUI fits.",
    body: `
<h2>The short version</h2>
<ul>
<li><b>NiceUI</b>: free, MIT-licensed components, blocks, full templates and the largest set of AI agent interfaces, installable with the shadcn CLI and connectable to coding agents over MCP.</li>
<li><b>Magic UI</b>: a popular library of animated components and effects built with Tailwind CSS and Motion, installable with the shadcn CLI, with paid templates.</li>
<li><b>shadcn/ui</b>: the foundation most of these build on: unstyled-to-styled primitives (buttons, dialogs, forms) you copy into your project.</li>
<li><b>Aceternity UI</b>: eye-catching animated sections and effects, with paid templates.</li>
<li><b>21st.dev</b>: a community registry where many authors publish shadcn-style components, plus AI generation tools.</li>
</ul>

<h2>What NiceUI adds</h2>
<ul>
<li><b>AI agent UI.</b> Chat, reasoning, tool approvals, browser agents, traces, memory and voice orbs: more than 75 interfaces for AI products.</li>
<li><b>Whole pages, free.</b> Landing pages, dashboards and app templates (CRM, store, docs, portfolio) with full source, not just components.</li>
<li><b>Light and dark.</b> Every preview can be checked in both themes before you copy.</li>
<li><b>Built for agents.</b> A shadcn registry, MCP setup and <a class="ul" href="/llms.txt">llms.txt</a> so your coding assistant can find and install components.</li>
</ul>

<h2>Popular animated components</h2>
{{cards:components/theme-toggle,marketing/bento-grid,effects/number-ticker,effects/typewriter-text,effects/custom-cursor,effects/confetti,effects/icon-cloud,site/marquee}}

<h2>Can I use them together?</h2>
<p>Yes. All of these libraries copy source code into your project and share the same Tailwind and shadcn conventions, so you can mix components from several of them in one app.</p>`,
    faq: [
      ["Is NiceUI free?", "Yes. Every component, block and template is free and MIT licensed."],
      ["Does NiceUI work with shadcn/ui?", "Yes. Items install with the shadcn CLI and use the same conventions, so they sit alongside shadcn/ui components."],
    ],
  },
  {
    slug: "21st-dev-alternatives",
    title: "21st.dev Alternatives — Free shadcn Component Libraries",
    h1: "21st.dev alternatives",
    description: "Comparing 21st.dev alternatives: curated, free shadcn-compatible component libraries for React and Tailwind, including NiceUI, shadcn/ui, Magic UI and Origin UI.",
    lede: "21st.dev is a large community registry of shadcn-style components. If you want a curated, consistent set instead, here are the alternatives and how they compare.",
    body: `
<h2>Community registry or curated library?</h2>
<p>A community registry gives you breadth: many authors and many styles. A curated library gives you consistency: one design language, the same API patterns and the same accessibility standard across every component. Many teams use both.</p>

<h2>Alternatives worth knowing</h2>
<ul>
<li><b>NiceUI</b>: a curated, free library of more than 300 components, blocks, landing pages and app templates in one consistent black-and-sky style, with the largest collection of AI agent interfaces. Installs with the shadcn CLI and connects to coding agents over MCP.</li>
<li><b>shadcn/ui</b>: the core primitives everything else builds on.</li>
<li><b>Magic UI</b>: animated components and effects.</li>
<li><b>Origin UI</b>: a large set of form inputs and interface components built on shadcn/ui.</li>
</ul>

<h2>Find what you'd search for</h2>
<p>Browse <a class="ul" href="/browse">all components</a>, or jump to a topic:</p>
{{tags:react-image-gallery,custom-cursor,animated-navbar,hero-section,dark-mode-toggle,react-chatbot-ui,loading-animation,react-dashboard}}

<h2>AI agent interfaces</h2>
{{cards:ai/chat-app,ai/reasoning,ai/tool-approval,ai/browser-agent,ai/agent-trace,ai/dot-globe}}`,
    faq: [
      ["Can I install NiceUI components with the shadcn CLI?", "Yes. Every item has a registry URL, for example npx shadcn@latest add https://niceui.dev/r/components-theme-toggle.json."],
      ["Does NiceUI have an MCP server?", "NiceUI works with the shadcn MCP server: add the @niceui registry to components.json and your agent can search and install components."],
    ],
  },
];
