import type { DocEntry } from '@/docs/types';
import { AgentTerminalDemo, DiffSuggestionDemo, McpToolPickerDemo, ParallelAgentsDemo, FeatureTabsDemo, NetworkPulseDemo } from '@/components/ai/AgentWorkflow';
import { TodoListDemo } from '@/components/ai/TodoList';
import { ToolApprovalDemo } from '@/components/ai/ToolApproval';
import { FileDiffDemo } from '@/components/ai/FileDiff';
import { ToolResultDemo } from '@/components/ai/ToolResult';
import { CitationsDemo } from '@/components/ai/Citations';

export const agentEntries: DocEntry[] = [
  {
    slug: 'todo-list',
    name: 'Todo List',
    description: 'An agent plan checklist that progresses from pending to running to done with a live progress bar.',
    demos: [
      {
        title: 'Agent plan',
        description: 'Steps tick off automatically. Restart to watch it again.',
        component: TodoListDemo,
        height: 420,
        code: `import { TodoList } from '@/components/ai/TodoList';

export function AgentPlan({ plan, currentStep }) {
  const items = plan.map((step, i) => ({
    id: step.id,
    label: step.label,
    detail: step.activity,
    status: i < currentStep ? 'done' : i === currentStep ? 'active' : 'pending',
  }));

  return (
    <TodoList
      title="Implement token refresh"
      items={items}
      onRestart={() => agent.rerun()}
    />
  );
}`,
      },
    ],
    props: [
      { name: 'items', type: 'TodoItem[]', description: "List of { id, label, detail?, status: 'pending' | 'active' | 'done' }." },
      { name: 'title', type: 'string', default: "'Plan'", description: 'Heading shown above the progress bar.' },
      { name: 'onRestart', type: '() => void', description: 'Shows a restart button when provided.' },
      { name: 'className', type: 'string', description: 'Extra classes for the card.' },
    ],
  },
  {
    slug: 'tool-approval',
    name: 'Tool Approval',
    description: 'A human-in-the-loop card that shows tool arguments and morphs into its resolved state.',
    demos: [
      {
        title: 'Approve or deny',
        description: 'Toggle “Always allow” to skip future prompts for the same tool.',
        component: ToolApprovalDemo,
        height: 600,
        code: `import { ToolApproval } from '@/components/ai/ToolApproval';

export function PendingToolCall({ call }) {
  return (
    <ToolApproval
      tool={call.name}
      description="Install dependencies and run database migrations."
      args={call.arguments}
      onDecision={(approved, alwaysAllow) => {
        if (alwaysAllow) permissions.allow(call.name);
        agent.respond(call.id, approved);
      }}
    />
  );
}`,
      },
    ],
    props: [
      { name: 'tool', type: 'string', description: 'Tool or function name, rendered in mono.' },
      { name: 'description', type: 'string', description: 'Plain-language summary of what the call will do.' },
      { name: 'args', type: 'Record<string, unknown>', description: 'Arguments rendered as highlighted JSON.' },
      { name: 'icon', type: 'ReactNode', default: '<Terminal />', description: 'Icon shown in the header.' },
      { name: 'onDecision', type: '(approved: boolean, alwaysAllow: boolean) => void', description: 'Called when the user approves or denies.' },
    ],
  },
  {
    slug: 'file-diff',
    name: 'File Diff',
    description: 'A unified diff with collapsible hunks, change stats and accept or reject actions.',
    demos: [
      {
        title: 'Proposed edit',
        description: 'Collapse a hunk from its header. Accepted or rejected states can be undone.',
        component: FileDiffDemo,
        height: 480,
        code: `import { FileDiff } from '@/components/ai/FileDiff';

<FileDiff
  path="src/server/billing/invoices.ts"
  hunks={[
    {
      header: '@@ -12,7 +12,9 @@ export async function getInvoices',
      oldStart: 12,
      newStart: 12,
      lines: [
        { type: 'ctx', text: '  const db = await connect();' },
        { type: 'del', text: '  const rows = await db.query(raw);' },
        { type: 'add', text: '  const rows = await db.query(sql, [orgId]);' },
      ],
    },
  ]}
  onResolve={(accepted) => agent.applyEdit(accepted)}
/>`,
      },
    ],
    props: [
      { name: 'path', type: 'string', description: 'File path shown in the header.' },
      { name: 'hunks', type: 'DiffHunk[]', description: 'Hunks with header, start lines and add/del/ctx lines.' },
      { name: 'onResolve', type: '(accepted: boolean) => void', description: 'Called when the change is accepted or rejected.' },
      { name: 'className', type: 'string', description: 'Extra classes for the card.' },
    ],
  },
  {
    slug: 'tool-result',
    name: 'Tool Result',
    description: 'Collapsible cards that summarize tool output with a status icon and live duration.',
    demos: [
      {
        title: 'Web search and terminal',
        description: 'Cards tick a timer while running, then settle into success or error.',
        component: ToolResultDemo,
        height: 480,
        code: `import { ToolResult } from '@/components/ai/ToolResult';
import { Globe } from 'lucide-react';

<ToolResult
  icon={<Globe className="h-4 w-4" />}
  title="Searched the web"
  subtitle="rate limiting serverless edge functions"
  status={call.status}
  duration={call.durationMs}
  defaultOpen
>
  <SearchResults results={call.output} />
</ToolResult>`,
      },
    ],
    props: [
      { name: 'icon', type: 'ReactNode', description: 'Tool icon shown at the left.' },
      { name: 'title', type: 'string', description: 'Summary line; shimmers while running.' },
      { name: 'status', type: "'running' | 'success' | 'error'", description: 'Controls the status icon and timer.' },
      { name: 'duration', type: 'number', description: 'Final duration in ms once finished.' },
      { name: 'defaultOpen', type: 'boolean', default: 'false', description: 'Start expanded.' },
      { name: 'children', type: 'ReactNode', description: 'Result body revealed when expanded.' },
    ],
  },
  {
    slug: 'citations',
    name: 'Citations',
    description: 'Inline numbered citation chips with hover source previews and a linked source list.',
    demos: [
      {
        title: 'Grounded answer',
        description: 'Hover a citation to preview the source and highlight it below.',
        component: CitationsDemo,
        height: 480,
        code: `import { Citation, SourceList } from '@/components/ai/Citations';

export function Answer({ sources }) {
  const [active, setActive] = useState<number | null>(null);
  const cite = (id: number) => (
    <Citation source={sources[id - 1]} active={active === id} onHover={setActive} />
  );

  return (
    <>
      <p>Oceans absorbed a record amount of heat in 2023{cite(1)}.</p>
      <SourceList sources={sources} active={active} />
    </>
  );
}`,
      },
    ],
    props: [
      { name: 'source', type: 'Source', description: '{ id, title, site, snippet, date? } for the preview card.' },
      { name: 'active', type: 'boolean', description: 'Highlights the chip, e.g. when its source is hovered.' },
      { name: 'onHover', type: '(id: number | null) => void', description: 'Sync hover state with the source list.' },
      { name: 'sources', type: 'Source[]', description: 'SourceList only: sources to render as cards.' },
    ],
  },
  {
    slug: 'agent-terminal',
    name: 'Agent Terminal',
    description: 'A terminal that types out an agent run log line by line when it scrolls into view, with replay.',
    badge: 'New',
    demos: [{ title: 'Run log', component: AgentTerminalDemo, height: 360, code: `import { AgentTerminal } from '@/components/ai/AgentWorkflow';

<AgentTerminal
  command="northstar run NS-482"
  lines={['Reading ticket …', 'Planning 3 components', 'Writing PricingCard.tsx', '✓ Opened PR #318']}
/>` }],
    props: [
      { name: 'command', type: 'string', description: 'The command shown on the first line.' },
      { name: 'lines', type: 'string[]', description: 'Output lines, typed in order. The last line is highlighted.' },
      { name: 'interval', type: 'number', default: '650', description: 'Milliseconds between lines.' },
      { name: 'label', type: 'string', default: "'agent'", description: 'Badge text in the title bar.' },
    ],
  },
  {
    slug: 'diff-suggestion',
    name: 'Diff Suggestion',
    description: 'An inline review suggestion: removed lines swap for added lines with one Apply click, and back with Undo.',
    badge: 'New',
    demos: [{ title: 'Review suggestion', component: DiffSuggestionDemo, height: 340, code: `import { DiffSuggestion } from '@/components/ai/AgentWorkflow';

<DiffSuggestion
  file="useCart.ts"
  head="export function useCart() {"
  tail="}"
  before={['useEffect(() => save(items))']}
  after={['useEffect(() => save(items), [items])']}
  issue="Missing dependency array"
/>` }],
    props: [
      { name: 'file', type: 'string', description: 'File name shown in the header.' },
      { name: 'before / after', type: 'string[]', description: 'Lines removed and added by the suggestion.' },
      { name: 'head / tail', type: 'string', description: 'Optional context lines around the change.' },
      { name: 'issue', type: 'string', description: 'Why the change is suggested.' },
      { name: 'onApply', type: '(applied: boolean) => void', description: 'Called when the suggestion is applied or undone.' },
    ],
  },
  {
    slug: 'mcp-tool-picker',
    name: 'MCP Tool Picker',
    description: 'A searchable list of MCP servers with one-click install toggles and a live installed count.',
    badge: 'New',
    demos: [{ title: 'Server picker', component: McpToolPickerDemo, height: 380, code: `import { McpToolPicker } from '@/components/ai/AgentWorkflow';

<McpToolPicker
  tools={[
    { name: 'Figma', installed: true, hint: 'Design files' },
    { name: 'GitHub', installed: true },
    { name: 'Linear' },
  ]}
  onChange={(tools) => save(tools)}
/>` }],
    props: [
      { name: 'tools', type: 'McpTool[]', description: '{ name, installed?, hint? } for each server.' },
      { name: 'placeholder', type: 'string', default: "'Search MCP servers…'", description: 'Search input placeholder.' },
      { name: 'onChange', type: '(tools: McpTool[]) => void', description: 'Called after a server is installed or removed.' },
    ],
  },
  {
    slug: 'parallel-agents',
    name: 'Parallel Agents',
    description: 'Agents on a shared timeline that slide in and fill their progress bars as they scroll into view.',
    badge: 'New',
    demos: [{ title: 'Parallel run', component: ParallelAgentsDemo, height: 380, code: `import { ParallelAgents } from '@/components/ai/AgentWorkflow';

<ParallelAgents
  agents={[
    { who: 'designer@team', task: 'Drafting variants', progress: 82, tokens: '18k' },
    { who: 'builder@team', task: 'Writing components', progress: 54, tokens: '31k' },
  ]}
/>` }],
    props: [{ name: 'agents', type: 'AgentRun[]', description: '{ who, task, progress (0–100), tokens? } per agent.' }],
  },
  {
    slug: 'feature-tabs',
    name: 'Auto Feature Tabs',
    description: 'Auto-advancing feature tabs with a glowing progress underline; each tab swaps in its own live content.',
    badge: 'New',
    demos: [{ title: 'Feature showcase', component: FeatureTabsDemo, height: 520, code: `import { FeatureTabs } from '@/components/ai/AgentWorkflow';

<FeatureTabs
  duration={6000}
  tabs={[
    { label: 'Generate', title: 'Components from a sentence', body: '…', content: <Preview /> },
    { label: 'Review', title: 'Reviews that read the diff', body: '…', content: <Diff /> },
  ]}
/>` }],
    props: [
      { name: 'tabs', type: 'FeatureTab[]', description: '{ label, icon?, title, body, content } per tab.' },
      { name: 'duration', type: 'number', default: '6000', description: 'Milliseconds before advancing to the next tab.' },
    ],
  },
  {
    slug: 'network-pulse',
    name: 'Network Pulse',
    description: 'A hub-and-spoke constellation with pulses travelling from the core to breathing nodes. Pure SVG.',
    badge: 'New',
    demos: [{ title: 'Constellation', component: NetworkPulseDemo, height: 400, code: `import { NetworkPulse } from '@/components/ai/AgentWorkflow';

<NetworkPulse nodes={9} />` }],
    props: [{ name: 'nodes', type: 'number', default: '9', description: 'Number of outer nodes.' }],
  },
];
