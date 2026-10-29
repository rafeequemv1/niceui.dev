import type { DocEntry } from '@/docs/types';
import { BrowserAgentDemo } from '@/components/ai/BrowserAgent';
import { ResearchProgressDemo } from '@/components/ai/ResearchProgress';
import { AgentTraceDemo } from '@/components/ai/AgentTrace';
import { AgentFlowDemo } from '@/components/ai/AgentFlow';
import { AgentQueueDemo } from '@/components/ai/AgentQueue';

export const agentOpsEntries: DocEntry[] = [
  {
    slug: 'browser-agent',
    name: 'Browser Agent',
    description: 'A computer-use view where an agent drives a browser, with a moving cursor, labelled targets and a synced step log.',
    badge: 'New',
    demos: [
      {
        title: 'Flight search',
        description: 'The agent types a URL, fills the form and compares fares. Pause it, or take over the browser yourself.',
        component: BrowserAgentDemo,
        height: 600,
        code: `import { BrowserFrame, AgentCursor } from '@/components/ai/BrowserAgent';

export function LiveSession({ session }) {
  const { url, title, screenshot, cursor, action } = session.latestFrame;

  return (
    <BrowserFrame url={url} title={title} loading={session.loading}>
      <img src={screenshot} alt="" className="h-full w-full" />
      {cursor && <AgentCursor x={cursor.x} y={cursor.y} clicking={action === 'click'} />}
    </BrowserFrame>
  );
}`,
      },
    ],
    props: [
      { name: 'task', type: 'string', description: 'The instruction shown above the browser.' },
      { name: 'autoPlay', type: 'boolean', default: 'true', description: 'Start when the component scrolls into view.' },
      { name: 'onDone', type: '() => void', description: 'Called when the run finishes.' },
      { name: 'BrowserFrame', type: 'component', description: 'Browser chrome with url, title, loading and human props. Children are drawn at 600 × 380 and scaled to fit.' },
      { name: 'AgentCursor', type: 'component', description: 'The agent pointer with a name tag; x, y in screen units, clicking shows a ripple.' },
    ],
  },
  {
    slug: 'research-progress',
    name: 'Deep Research',
    description: 'A research run that plans, searches, reads and writes, with a climbing source count and a report card at the end.',
    badge: 'New',
    demos: [
      {
        title: 'Research run',
        description: 'Watch the phases fill as queries go out and sources are read. Stop it at any point to keep a partial report.',
        component: ResearchProgressDemo,
        height: 560,
        code: `import { ResearchProgress } from '@/components/ai/ResearchProgress';

<ResearchProgress
  question="How are EU AI Act obligations phased in for general-purpose AI models?"
  timeScale={16}
/>`,
      },
    ],
    props: [
      { name: 'question', type: 'string', description: 'The research question shown in the header.' },
      { name: 'timeScale', type: 'number', default: '16', description: 'Multiplier for the elapsed clock, so a short demo reads like a real run.' },
      { name: 'className', type: 'string', description: 'Extra classes for the card.' },
    ],
  },
  {
    slug: 'agent-trace',
    name: 'Agent Trace',
    description: 'A run inspector with a collapsible span tree, a timing waterfall, and the input, output, tokens and cost of each span.',
    badge: 'New',
    demos: [
      {
        title: 'Support agent run',
        description: 'Spans stream in as the run progresses. Click one to inspect it, and collapse parents from the chevron.',
        component: AgentTraceDemo,
        height: 560,
        code: `import { AgentTrace, type TraceSpan } from '@/components/ai/AgentTrace';

const spans: TraceSpan[] = run.spans.map((s) => ({
  id: s.id,
  parent: s.parentId,
  kind: s.type, // 'agent' | 'llm' | 'tool' | 'retrieval'
  name: s.name,
  start: s.startMs,
  end: s.endMs,
  status: s.error ? 'error' : 'ok',
  model: s.model,
  tokensIn: s.usage?.input,
  tokensOut: s.usage?.output,
  input: s.input,
  output: s.output,
}));

<AgentTrace spans={spans} live={false} />`,
      },
    ],
    props: [
      { name: 'spans', type: 'TraceSpan[]', description: 'Flat list of spans; nesting comes from parent ids.' },
      { name: 'live', type: 'boolean', default: 'true', description: 'Replay the run in real time instead of showing it finished.' },
      { name: 'className', type: 'string', description: 'Extra classes for the card.' },
    ],
  },
  {
    slug: 'agent-flow',
    name: 'Agent Flow',
    description: 'A workflow canvas of agents and tools where you can drag nodes and run the flow to watch data move along the edges.',
    badge: 'New',
    demos: [
      {
        title: 'Support triage flow',
        description: 'Drag any node, or focus it and use the arrow keys. Press Run to send a ticket through the graph.',
        component: AgentFlowDemo,
        height: 480,
        code: `import { AgentFlow } from '@/components/ai/AgentFlow';

export function FlowEditor() {
  return <AgentFlow autoRun={false} className="max-w-5xl" />;
}`,
      },
    ],
    props: [
      { name: 'autoRun', type: 'boolean', default: 'true', description: 'Run once when the canvas scrolls into view.' },
      { name: 'className', type: 'string', description: 'Extra classes for the card.' },
    ],
  },
  {
    slug: 'agent-queue',
    name: 'Agent Task Queue',
    description: 'An inbox for background agents with queued, running, review, merged and failed tasks, plus review and merge.',
    badge: 'New',
    demos: [
      {
        title: 'Coding agents inbox',
        description: 'Add a task and it starts running. Open a task that needs review to see its summary and changed files.',
        component: AgentQueueDemo,
        height: 620,
        code: `import { AgentQueue, type AgentTask } from '@/components/ai/AgentQueue';

const tasks: AgentTask[] = runs.map((r) => ({
  id: r.id,
  title: r.prompt,
  repo: r.repo,
  branch: r.branch,
  status: r.status, // 'queued' | 'running' | 'review' | 'merged' | 'failed'
  progress: r.progress,
  added: r.diff?.additions,
  removed: r.diff?.deletions,
  age: timeAgo(r.updatedAt),
}));

<AgentQueue initial={tasks} />`,
      },
    ],
    props: [
      { name: 'initial', type: 'AgentTask[]', description: 'Tasks to show on mount.' },
      { name: 'className', type: 'string', description: 'Extra classes for the card.' },
    ],
  },
];
