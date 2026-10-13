import type { DocEntry } from '@/docs/types';
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
];
