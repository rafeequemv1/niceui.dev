import type { DocEntry } from '@/docs/types';
import { InlineAIEditDemo } from '@/components/ai/InlineAIEdit';
import { GhostAutocompleteDemo } from '@/components/ai/GhostAutocomplete';
import { AskAIToolbarDemo } from '@/components/ai/AskAIToolbar';
import { ToolPermissionsDemo } from '@/components/ai/ToolPermissions';
import { SandboxAllowlistDemo } from '@/components/ai/SandboxAllowlist';

export const inlineEntries: DocEntry[] = [
  {
    slug: 'inline-ai-edit',
    name: 'Inline AI Edit',
    description: 'Press ⌘K on selected lines to describe a change, watch the diff stream in, then accept, reject or retry.',
    badge: 'New',
    demos: [
      {
        title: 'Edit selected lines',
        description: 'The demo types an instruction. Focus the editor and press ⌘K to try your own; Esc cancels, ⌘↵ accepts.',
        component: InlineAIEditDemo,
        height: 520,
        code: `import { InlineAIEdit } from '@/components/ai/InlineAIEdit';

<InlineAIEdit
  fileName="rate-limit.ts"
  lines={source.split('\\n')}
  selection={[2, 6]}
  generate={(prompt, attempt) => runModel(prompt, selectedCode, attempt)}
/>`,
      },
    ],
    props: [
      { name: 'lines', type: 'string[]', description: 'Source lines shown in the editor.' },
      { name: 'selection', type: '[number, number]', description: 'Inclusive, zero-based range the edit replaces.' },
      { name: 'generate', type: '(prompt: string, attempt: number) => string[]', description: 'Returns the replacement lines; attempt increments on Retry.' },
      { name: 'autoPrompt', type: 'string', description: 'Types and runs this instruction on mount (for demos).' },
      { name: 'fileName', type: 'string', default: "'rate-limit.ts'", description: 'Shown in the editor header.' },
    ],
  },
  {
    slug: 'ghost-autocomplete',
    name: 'Ghost Text',
    description: 'Inline AI autocomplete: a grey continuation appears as you pause; Tab accepts it, → takes one word, Esc dismisses.',
    badge: 'New',
    demos: [
      {
        title: 'Email autocomplete',
        description: 'Watch it type, then press Tab or → to accept. Keep writing for more suggestions.',
        component: GhostAutocompleteDemo,
        height: 400,
        code: `import { GhostAutocomplete } from '@/components/ai/GhostAutocomplete';

<GhostAutocomplete
  placeholder="Write a reply…"
  suggest={(text) => completionCache.get(text) ?? ''}
  delay={450}
/>`,
      },
    ],
    props: [
      { name: 'suggest', type: '(text: string) => string', description: 'Returns the continuation for the current text, or an empty string.' },
      { name: 'delay', type: 'number', default: '450', description: 'Pause in ms before a suggestion appears.' },
      { name: 'defaultValue', type: 'string', description: 'Initial text.' },
      { name: 'autoType', type: 'string', description: 'Types this text on mount (for demos).' },
    ],
  },
  {
    slug: 'ask-ai-toolbar',
    name: 'Ask AI Toolbar',
    description: 'Select text in a document to get a floating toolbar — improve, shorten, translate, explain or ask — with replace and insert.',
    badge: 'New',
    demos: [
      {
        title: 'Selection toolbar',
        description: 'Pick an action on the highlighted text, or select any other passage.',
        component: AskAIToolbarDemo,
        height: 520,
        code: `import { AskAIToolbar } from '@/components/ai/AskAIToolbar';

<AskAIToolbar
  paragraphs={doc.paragraphs}
  respond={(text, action, question) => ai.rewrite({ text, action, question })}
/>`,
      },
    ],
    props: [
      { name: 'paragraphs', type: 'string[]', description: 'Document text, one string per paragraph.' },
      { name: 'respond', type: "(text: string, action: 'improve' | 'shorten' | 'translate' | 'explain' | 'ask', question?: string) => string", description: 'Produces the AI result for the selection.' },
      { name: 'initialSelection', type: '{ para: number; start: number; end: number }', description: 'Selection shown on mount.' },
    ],
  },
  {
    slug: 'tool-permissions',
    name: 'Tool Permissions',
    description: 'A permission matrix for agent tools — Always, Ask or Never per tool — grouped by files, web, shell and MCP servers, with presets.',
    badge: 'New',
    demos: [
      {
        title: 'Permission presets',
        description: 'Switch between Cautious, Balanced and Autonomous, or set each tool yourself.',
        component: ToolPermissionsDemo,
        height: 600,
        code: `import { ToolPermissions, type Permission } from '@/components/ai/ToolPermissions';

const [perms, setPerms] = useState<Record<string, Permission>>(saved);

<ToolPermissions tools={agentTools} value={perms} onChange={setPerms} />`,
      },
    ],
    props: [
      { name: 'tools', type: 'ToolDef[]', description: 'id, name, desc, group and risk (low, medium, high) for each tool.' },
      { name: 'value', type: "Record<string, 'always' | 'ask' | 'never'>", description: 'Current permission per tool id.' },
      { name: 'onChange', type: '(next) => void', description: 'Called with the whole updated map.' },
    ],
  },
  {
    slug: 'sandbox-allowlist',
    name: 'Sandbox Allowlist',
    description: 'Folders and domains an agent may touch, with wildcard validation and a live checker that says whether a path or URL is allowed.',
    badge: 'New',
    demos: [
      {
        title: 'Folders and domains',
        description: 'Add or remove rules, then type any path or URL into the tester.',
        component: SandboxAllowlistDemo,
        height: 560,
        code: `import { SandboxAllowlist } from '@/components/ai/SandboxAllowlist';

<SandboxAllowlist
  folders={policy.folders}
  domains={policy.domains}
  onChange={(next) => savePolicy(next)}
/>`,
      },
    ],
    props: [
      { name: 'folders', type: 'string[]', description: 'Path globs; ** spans folders, * stays within one.' },
      { name: 'domains', type: 'string[]', description: 'Hosts, optionally with a *. prefix for subdomains.' },
      { name: 'onChange', type: '(next: { folders: string[]; domains: string[] }) => void', description: 'Called when a rule is added or removed.' },
    ],
  },
];
