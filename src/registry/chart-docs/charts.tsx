import type { DocEntry } from '@/docs/types';
import { LineChartDemo } from '@/components/charts/LineChart';
import { AreaChartDemo } from '@/components/charts/AreaChart';
import { BarChartDemo } from '@/components/charts/BarChart';
import { DonutChartDemo } from '@/components/charts/DonutChart';
import { RadarChartDemo } from '@/components/charts/RadarChart';
import { ChartCardDemo } from '@/components/charts/ChartCard';

export const chartEntries: DocEntry[] = [
  {
    slug: 'line-chart',
    name: 'Line Chart',
    description: 'A multi-series line chart in plain SVG with smooth curves, a crosshair tooltip, toggleable series and range tabs that redraw it.',
    badge: 'New',
    demos: [
      {
        title: 'Revenue vs expenses',
        description: 'Hover or focus the chart and use the arrow keys. Switch ranges to replay the draw-in.',
        component: LineChartDemo,
        height: 440,
        code: `import { LineChart } from '@/components/charts/LineChart';

<LineChart
  labels={days}
  series={[
    { name: 'Revenue', values: revenue },
    { name: 'Expenses', values: expenses },
  ]}
  prefix="$"
  animationKey={range}
/>`,
      },
    ],
    props: [
      { name: 'labels', type: 'string[]', description: 'X-axis labels, one per point.' },
      { name: 'series', type: '{ name: string; color?: string; values: number[] }[]', description: 'Lines to draw. Colors default to the chart palette.' },
      { name: 'height', type: 'number', default: '260', description: 'Chart height in pixels; width follows the container.' },
      { name: 'prefix', type: 'string', default: "''", description: 'Prepended to axis and tooltip values, e.g. "$".' },
      { name: 'animationKey', type: 'string | number', description: 'Change it to replay the draw-in animation.' },
    ],
  },
  {
    slug: 'area-chart',
    name: 'Area Chart',
    description: 'Stacked or overlaid gradient areas with a reveal animation, a totals tooltip and legend toggles.',
    badge: 'New',
    demos: [
      {
        title: 'Visitors by channel',
        description: 'Switch between stacked and overlay. Hide a channel from the legend and the stack re-forms.',
        component: AreaChartDemo,
        height: 440,
        code: `import { AreaChart } from '@/components/charts/AreaChart';

<AreaChart labels={months} series={channels} mode="stacked" />`,
      },
    ],
    props: [
      { name: 'labels', type: 'string[]', description: 'X-axis labels.' },
      { name: 'series', type: '{ name: string; color?: string; values: number[] }[]', description: 'Areas, bottom to top.' },
      { name: 'mode', type: "'stacked' | 'overlay'", default: "'stacked'", description: 'Stack the series or draw them over each other.' },
      { name: 'height', type: 'number', default: '260', description: 'Chart height in pixels.' },
    ],
  },
  {
    slug: 'bar-chart',
    name: 'Bar Chart',
    description: 'Grouped or stacked bars, vertical or horizontal, with grow-in animation, value labels and a per-category tooltip.',
    badge: 'New',
    demos: [
      {
        title: 'Sessions by device',
        description: 'Try every combination of grouped/stacked and vertical/horizontal. Categories are keyboard focusable.',
        component: BarChartDemo,
        height: 460,
        code: `import { BarChart } from '@/components/charts/BarChart';

<BarChart labels={days} series={devices} mode="stacked" orientation="horizontal" />`,
      },
    ],
    props: [
      { name: 'labels', type: 'string[]', description: 'Category labels.' },
      { name: 'series', type: '{ name: string; color?: string; values: number[] }[]', description: 'One entry per series.' },
      { name: 'mode', type: "'grouped' | 'stacked'", default: "'grouped'", description: 'Side by side or stacked bars.' },
      { name: 'orientation', type: "'vertical' | 'horizontal'", default: "'vertical'", description: 'Bar direction.' },
      { name: 'showValues', type: 'boolean', default: 'true', description: 'Show totals at the end of stacked bars.' },
    ],
  },
  {
    slug: 'donut-chart',
    name: 'Donut Chart',
    description: 'An interactive donut: segments grow on hover, the centre shows the hovered value, and the legend hides slices.',
    badge: 'New',
    demos: [
      {
        title: 'Revenue by plan',
        description: 'Hover a segment or legend row; click a row to hide that slice.',
        component: DonutChartDemo,
        height: 420,
        code: `import { DonutChart } from '@/components/charts/DonutChart';

<DonutChart
  label="MRR"
  data={plans}
  format={(v) => '$' + (v / 1000).toFixed(1) + 'k'}
/>`,
      },
    ],
    props: [
      { name: 'data', type: '{ name: string; value: number; color?: string }[]', description: 'Slices.' },
      { name: 'size', type: 'number', default: '220', description: 'Diameter in pixels.' },
      { name: 'thickness', type: 'number', default: '22', description: 'Ring thickness.' },
      { name: 'label', type: 'string', default: "'Total'", description: 'Centre label when nothing is hovered.' },
      { name: 'format', type: '(v: number) => string', description: 'Formats the centre value.' },
    ],
  },
  {
    slug: 'radar-chart',
    name: 'Radar Chart',
    description: 'Compare two series across axes, with a springy reveal and an axis readout on hover or focus.',
    badge: 'New',
    demos: [
      {
        title: 'Model evaluation',
        description: 'Hover or tab to an axis label to compare both series on it.',
        component: RadarChartDemo,
        height: 480,
        code: `import { RadarChart } from '@/components/charts/RadarChart';

<RadarChart
  axes={['Reasoning', 'Coding', 'Writing', 'Speed', 'Cost', 'Tool use']}
  series={[{ name: 'Model A', values: a }, { name: 'Model B', values: b }]}
/>`,
      },
    ],
    props: [
      { name: 'axes', type: 'string[]', description: 'Axis names, clockwise from the top.' },
      { name: 'series', type: '{ name: string; color?: string; values: number[] }[]', description: 'One value per axis.' },
      { name: 'max', type: 'number', default: '100', description: 'Value at the outer ring.' },
    ],
  },
  {
    slug: 'chart-cards',
    name: 'KPI Chart Cards',
    description: 'Stat cards with counting values, deltas and a sparkline, mini bars or a progress ring.',
    badge: 'New',
    demos: [
      {
        title: 'Dashboard KPIs',
        description: 'Values count up when the cards scroll into view.',
        component: ChartCardDemo,
        height: 420,
        code: `import { KpiCard } from '@/components/charts/ChartCard';

<KpiCard label="MRR" value={118400} prefix="$" delta={12.4} visual="sparkline" data={mrr} />
<KpiCard label="Churn" value={1.92} suffix="%" decimals={2} delta={-0.6} invert visual="sparkline" data={churn} />
<KpiCard label="Quota" value={742} prefix="$" suffix="k" delta={4.3} visual="ring" ring={74} />`,
      },
    ],
    props: [
      { name: 'label', type: 'string', description: 'Metric name.' },
      { name: 'value', type: 'number', description: 'Value to count up to.' },
      { name: 'delta', type: 'number', description: 'Percent change; colored by direction.' },
      { name: 'invert', type: 'boolean', description: 'Treat a decrease as good (e.g. churn).' },
      { name: 'visual', type: "'sparkline' | 'bars' | 'ring'", description: 'The mini chart to show.' },
      { name: 'data', type: 'number[]', description: 'Points for the sparkline or bars.' },
      { name: 'ring', type: 'number', description: 'Percent for the progress ring.' },
    ],
  },
];
