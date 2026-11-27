# NiceUI launch kit

These steps have to come from your own accounts, so they are drafted here for you to post. Do them in this order.

## 1. Search engines (do this first, about 15 minutes)

**Google Search Console** (search.google.com/search-console)
1. Add the domain property `niceui.dev` and verify it with the DNS TXT record (Vercel → Domains → DNS).
2. Sitemaps → submit `https://niceui.dev/sitemap.xml`.
3. URL Inspection → paste each URL below → **Request indexing**. Google allows roughly 10 a day, so spread them out:
   - `https://niceui.dev/`
   - `https://niceui.dev/browse`
   - `https://niceui.dev/s/react-image-gallery`
   - `https://niceui.dev/s/custom-cursor`
   - `https://niceui.dev/s/animated-navbar`
   - `https://niceui.dev/s/hero-section`
   - `https://niceui.dev/s/dark-mode-toggle`
   - `https://niceui.dev/s/text-animation`
   - `https://niceui.dev/guides/website-animation-examples`
   - `https://niceui.dev/guides/react-icon-libraries`
   - `https://niceui.dev/c/components/theme-toggle`
   - `https://niceui.dev/c/effects/custom-cursor`
   - `https://niceui.dev/c/components/page-dots`
   - `https://niceui.dev/c/components/auto-resize-textarea`
   - `https://niceui.dev/c/components/dropdown-menu`
   - `https://niceui.dev/c/marketing/animated-navbar`

**Bing Webmaster Tools** (bing.com/webmasters)
- Import the site from Google Search Console (one click), then submit the sitemap.
- IndexNow is already set up. After each deploy, run `npm run indexnow` to notify Bing, Yandex and the other IndexNow engines.

## 2. GitHub lists (links that count)

Open one pull request per list, following each repository's contributing guide. A suggested line for each:

- **awesome-shadcn-ui** (birobirobiro/awesome-shadcn-ui), under Libraries and components:
  `- [NiceUI](https://niceui.dev) - 300+ free React & Tailwind components, blocks and templates, with the largest set of AI agent interfaces. shadcn CLI and MCP ready.`
- **awesome-react-components** (brillout/awesome-react-components), under UI components → Component libraries:
  `- [NiceUI](https://niceui.dev) - Free, copy-paste React + Tailwind components, AI agent UI, landing pages and templates.`
- **awesome-tailwindcss** (aniftyco/awesome-tailwindcss), under UI libraries, components and templates:
  `- [NiceUI](https://niceui.dev) - Free React components, blocks and full templates built with Tailwind CSS.`

## 3. Product Hunt

- **Name:** NiceUI
- **Tagline (60 characters max):** Free React & Tailwind UI, built for AI agent products
- **Description:**
  > NiceUI is a free, MIT-licensed library of 300+ React and Tailwind components, blocks, landing pages and app templates, including more than 75 interfaces for AI agents (chat, reasoning, tool approvals, browser agents, traces, voice orbs). Preview everything in light and dark, copy the source, or install with the shadcn CLI. Your coding agent can find and install components over MCP or llms.txt.
- **First comment:** why you built it, what's unique (the AI agent UI, whole templates for free), and ask what people want next.
- **Gallery:** the homepage hero, the AI agent category, the CRM template, the voice orbs (as a video) and the /browse page.

## 4. Show HN

**Title:** `Show HN: NiceUI – free React/Tailwind components for AI agent interfaces`

**Text:**
> I built NiceUI, a free (MIT) library of React and Tailwind components focused on AI products: chat, reasoning traces, tool-approval flows, browser agents, memory panels and voice orbs that react to your mic, plus general components, landing pages and full app templates. Everything installs with the shadcn CLI, and agents can pull components over MCP or llms.txt. Feedback welcome, especially on what AI UI patterns are still missing.

## 5. Reddit (one post a week, a short video each time, never the same text twice)

- **r/reactjs:** "I made a free set of voice orbs for AI assistants that react to your microphone (React + canvas, no deps)", with a video of the three orbs and a link to the topic page.
- **r/tailwindcss:** "Free animated navbar collection: sliding pill, underline, morph on scroll, bottom tab bar", with a video and a link to `/s/animated-navbar`.
- **r/webdev:** "40 website animation examples with free code", linking to the guide.

Read each subreddit's self-promotion rules first. Answer every comment.

## 6. dev.to and Hashnode

Republish each guide with the canonical URL pointing at niceui.dev (both sites have a canonical URL field), so the link credit comes back to the site.

## 7. Weekly routine

- Ship 3–5 new components every week, aimed at a keyword from `seo/keyword-map.csv`.
- Add its search phrases to `site/seo.mjs`, deploy, then run `npm run indexnow`.
- Post one short video on X and Reddit.
- Check Search Console (or ask Claude to pull it through Piqo): pages indexed, impressions and position for the keyword groups.
