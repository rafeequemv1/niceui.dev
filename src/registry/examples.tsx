import type { DocEntry } from '@/docs/types';
import { AnalyticsDashboard } from '@/pages/examples/AnalyticsDashboard';
import { FinanceDashboard } from '@/pages/examples/FinanceDashboard';
import { InfrastructureMonitor } from '@/pages/examples/InfrastructureMonitor';
import { CommerceDashboard } from '@/pages/examples/CommerceDashboard';
import { AgentConsole } from '@/pages/examples/AgentConsole';

export const exampleEntries: DocEntry[] = [
  {
    slug: 'analytics',
    name: 'Analytics Dashboard',
    description: 'SaaS product analytics with KPI sparklines, revenue area chart, traffic donut, top pages, live visitors and activity feed.',
    badge: 'New',
    page: AnalyticsDashboard,
  },
  {
    slug: 'finance',
    name: 'Finance Dashboard',
    description: 'Personal and business banking with a balance hero card, income vs expense bars, spending categories, transactions and quick transfer.',
    page: FinanceDashboard,
  },
  {
    slug: 'devops',
    name: 'Infrastructure Monitor',
    description: 'Cloud operations console with live CPU/memory/latency charts, service status grid, deployments, incidents, region latency and a log stream.',
    page: InfrastructureMonitor,
  },
  {
    slug: 'ecommerce',
    name: 'Commerce Dashboard',
    description: 'Store admin with sales KPIs, an orders table, best sellers, an animated conversion funnel, customer reviews and inventory alerts.',
    page: CommerceDashboard,
  },
  {
    slug: 'ai-ops',
    name: 'AI Agent Console',
    description: 'LLM ops console with token usage, model cost donut, agent runs table, a streaming live run trace, latency cards and prompt eval scores.',
    page: AgentConsole,
  },
];
