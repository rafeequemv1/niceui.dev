import type { DocEntry } from '@/docs/types';
import {
  BlogCardsDemo,
  ChangelogDemo,
  CtaGridBeamsDemo,
  CtaHorizonDemo,
  FaqTwoColumnDemo,
  FooterMegaDemo,
  FooterMinimalDemo,
  PricingComparisonDemo,
  PricingTiersDemo,
  PricingUsageDemo,
  TeamGridDemo,
} from '@/components/marketing/Conversion';

const IMPORT = "from '@/components/marketing/Conversion';";

export const conversionEntries: DocEntry[] = [
  {
    slug: 'pricing-tiers',
    name: 'Pricing Tiers',
    description: 'Three pricing tiers with a sliding monthly/yearly toggle, rolling-digit prices and a featured plan wrapped in a rotating glow border.',
    badge: 'New',
    demos: [
      {
        title: 'Tiers with yearly toggle',
        description: 'Switch billing period to watch the digits roll.',
        component: PricingTiersDemo,
        height: 720,
        code: `import { PricingTiers } ${IMPORT}

<PricingTiers
  tiers={[
    { name: 'Starter', monthly: 0, yearly: 0, description: 'For side projects.', features: ['3 projects'], cta: 'Start free' },
    { name: 'Pro', monthly: 29, yearly: 23, description: 'For teams.', features: ['Unlimited projects'], cta: 'Upgrade', featured: true },
    { name: 'Scale', monthly: 79, yearly: 63, description: 'For orgs.', features: ['SSO'], cta: 'Contact sales' },
  ]}
/>`,
      },
    ],
    props: [
      { name: 'tiers', type: 'PricingTier[]', description: '{ name, monthly, yearly, description, features, cta, featured? } per plan.' },
      { name: 'title', type: 'ReactNode', description: 'Section heading.' },
      { name: 'subtitle', type: 'string', description: 'Text under the heading.' },
      { name: 'className', type: 'string', description: 'Extra classes for the section.' },
    ],
  },
  {
    slug: 'pricing-comparison',
    name: 'Pricing Comparison',
    description: 'A plan comparison table with a sticky plan header, grouped feature rows, a highlighted featured column and hover rows. Scrolls horizontally on mobile.',
    badge: 'New',
    demos: [
      {
        title: 'Compare plans',
        component: PricingComparisonDemo,
        height: 720,
        code: `import { PricingComparison } ${IMPORT}

<PricingComparison
  plans={[
    { name: 'Starter', price: '$0', cta: 'Start free' },
    { name: 'Pro', price: '$29', cta: 'Upgrade', featured: true },
  ]}
  groups={[{ group: 'Usage', rows: [{ feature: 'Projects', values: ['3', 'Unlimited'] }] }]}
/>`,
      },
    ],
    props: [
      { name: 'plans', type: '{ name, price, cta, featured? }[]', description: 'Columns of the table.' },
      { name: 'groups', type: 'ComparisonGroup[]', description: '{ group, rows: { feature, values } } — values are true, false or text.' },
    ],
  },
  {
    slug: 'pricing-usage',
    name: 'Usage Pricing Slider',
    description: 'Usage-based pricing: drag the slider and the price tweens smoothly, the plan badge switches and a cost breakdown updates live.',
    badge: 'New',
    demos: [
      {
        title: 'Pay as you grow',
        component: PricingUsageDemo,
        height: 560,
        code: `import { PricingUsage } ${IMPORT}

<PricingUsage min={0} max={100000} step={500} defaultValue={12000} unit="monthly active users" />`,
      },
    ],
    props: [
      { name: 'min / max / step', type: 'number', default: '0 / 100000 / 500', description: 'Slider range.' },
      { name: 'defaultValue', type: 'number', default: '12000', description: 'Initial usage.' },
      { name: 'unit', type: 'string', default: "'monthly active users'", description: 'Label for the usage metric.' },
    ],
  },
  {
    slug: 'faq-two-column',
    name: 'FAQ — Two Column',
    description: 'Heading and contact card on the left, an accordion on the right with smooth height animation and a plus-to-minus icon morph.',
    badge: 'New',
    demos: [
      {
        title: 'FAQ',
        component: FaqTwoColumnDemo,
        height: 620,
        code: `import { FaqTwoColumn } ${IMPORT}

<FaqTwoColumn
  items={[
    { q: 'Is there a free plan?', a: 'Yes — free forever.' },
    { q: 'Can I change plans later?', a: 'Anytime, prorated.' },
  ]}
/>`,
      },
    ],
    props: [
      { name: 'items', type: '{ q: string; a: string }[]', description: 'Questions and answers. One is open at a time.' },
      { name: 'title', type: 'ReactNode', description: 'Left column heading.' },
    ],
  },
  {
    slug: 'cta-horizon',
    name: 'CTA — Horizon',
    description: 'A centred call to action over a faint grid, sitting on the signature glowing horizon arc.',
    badge: 'New',
    demos: [
      {
        title: 'Horizon CTA',
        component: CtaHorizonDemo,
        height: 560,
        code: `import { CtaHorizon } ${IMPORT}

<CtaHorizon primary="Start for free" secondary="Talk to sales" />`,
      },
    ],
    props: [
      { name: 'title', type: 'ReactNode', description: 'Headline.' },
      { name: 'body', type: 'string', description: 'Supporting text.' },
      { name: 'primary / secondary', type: 'string', description: 'Button labels.' },
    ],
  },
  {
    slug: 'cta-grid-beams',
    name: 'CTA — Grid Beams',
    description: 'A newsletter CTA card with a drifting grid, light beams sweeping across and an email form with an animated success state.',
    badge: 'New',
    demos: [
      {
        title: 'Newsletter CTA',
        component: CtaGridBeamsDemo,
        height: 520,
        code: `import { CtaGridBeams } ${IMPORT}

<CtaGridBeams onSubmit={(email) => subscribe(email)} />`,
      },
    ],
    props: [
      { name: 'title', type: 'ReactNode', description: 'Headline.' },
      { name: 'placeholder / button', type: 'string', description: 'Input placeholder and button label.' },
      { name: 'onSubmit', type: '(email: string) => void', description: 'Called with the email before the success state shows.' },
    ],
  },
  {
    slug: 'footer-mega',
    name: 'Footer — Mega',
    description: 'A full footer with newsletter, link columns, socials and a live status dot, ending in a giant outlined wordmark that fills with sky light as it scrolls into view.',
    badge: 'New',
    demos: [
      {
        title: 'Mega footer',
        component: FooterMegaDemo,
        height: 720,
        code: `import { FooterMega } ${IMPORT}

<FooterMega brand="acme" columns={[{ title: 'Product', links: ['Features', 'Pricing'] }]} />`,
      },
    ],
    props: [
      { name: 'brand', type: 'string', default: "'niceui'", description: 'Brand name, also used for the giant wordmark.' },
      { name: 'columns', type: '{ title: string; links: string[] }[]', description: 'Link columns.' },
    ],
  },
  {
    slug: 'footer-minimal',
    name: 'Footer — Minimal',
    description: 'A single-row footer with logo, underline-on-hover links, socials and a soft sky hairline on top.',
    badge: 'New',
    demos: [
      {
        title: 'Minimal footer',
        component: FooterMinimalDemo,
        height: 460,
        code: `import { FooterMinimal } ${IMPORT}

<FooterMinimal brand="acme" links={['Product', 'Pricing', 'Docs']} />`,
      },
    ],
    props: [
      { name: 'brand', type: 'string', default: "'niceui'", description: 'Brand name.' },
      { name: 'links', type: 'string[]', description: 'Navigation links.' },
    ],
  },
  {
    slug: 'changelog',
    name: 'Changelog',
    description: 'A release timeline whose dots light up as entries scroll into view, with tag chips, small visuals and New / Improved / Fixed filters.',
    badge: 'New',
    demos: [
      {
        title: 'Release timeline',
        component: ChangelogDemo,
        height: 720,
        code: `import { Changelog } ${IMPORT}

<Changelog
  releases={[
    { version: 'v2.6', date: 'Oct 24, 2026', tags: ['New'], title: 'Agent workflows', body: '…', visual: 'ui' },
  ]}
/>`,
      },
    ],
    props: [{ name: 'releases', type: 'Release[]', description: "{ version, date, tags: ('New' | 'Improved' | 'Fixed')[], title, body, visual?: 'chart' | 'ui' | 'code' }." }],
  },
  {
    slug: 'team-grid',
    name: 'Team Grid',
    description: 'Team cards with gradient portraits built from initials; hover slides up a bio and social links. Includes a “We’re hiring” card.',
    badge: 'New',
    demos: [
      {
        title: 'Team',
        component: TeamGridDemo,
        height: 720,
        code: `import { TeamGrid } ${IMPORT}

<TeamGrid members={[{ name: 'Ada King', role: 'Design', bio: '…', hue: 199 }]} hiring />`,
      },
    ],
    props: [
      { name: 'members', type: 'TeamMember[]', description: '{ name, role, bio, hue? } — hue tints the generated portrait.' },
      { name: 'hiring', type: 'boolean', default: 'true', description: 'Show the hiring card.' },
    ],
  },
  {
    slug: 'blog-cards',
    name: 'Blog Cards',
    description: 'A featured post plus a card grid with generated gradient cover art, category chips and read time; covers zoom and arrows slide on hover.',
    badge: 'New',
    demos: [
      {
        title: 'Journal',
        component: BlogCardsDemo,
        height: 720,
        code: `import { BlogCards } ${IMPORT}

<BlogCards
  posts={[
    { title: 'Designing motion', excerpt: '…', category: 'Design', readTime: '8 min', author: 'Ada King', date: 'Oct 21', hue: 199 },
  ]}
/>`,
      },
    ],
    props: [{ name: 'posts', type: 'BlogPost[]', description: '{ title, excerpt, category, readTime, author, date, hue? }. The first post is featured.' }],
  },
];
