import type { DocEntry } from '@/docs/types';
import { ClarifyingQuestionDemo, ClarifyingQuestionsDemo } from '@/components/ai/ClarifyingQuestion';
import { CheckpointsDemo } from '@/components/ai/Checkpoints';
import { MemoryPanelDemo } from '@/components/ai/MemoryPanel';
import { ArtifactPanelDemo } from '@/components/ai/ArtifactPanel';
import { CommandComposerDemo } from '@/components/ai/CommandComposer';

export const agentControlEntries: DocEntry[] = [
  {
    slug: 'clarifying-question',
    name: 'Clarifying Question',
    description: 'The agent stops to ask: options with descriptions, an “Other” answer, number-key shortcuts and an auto-continue countdown.',
    badge: 'New',
    demos: [
      {
        title: 'One question',
        description: 'Press 1–4 to choose and Enter to submit. Do nothing and it continues with the recommended option.',
        component: ClarifyingQuestionDemo,
        height: 600,
        code: `import { ClarifyingQuestion } from '@/components/ai/ClarifyingQuestion';

<ClarifyingQuestion
  header="Framework"
  question="Which framework should I scaffold the dashboard with?"
  options={[
    { id: 'next', label: 'Next.js 15', description: 'App Router and server actions.', recommended: true },
    { id: 'remix', label: 'Remix', description: 'Nested routes with loaders and actions.' },
    { id: 'vite', label: 'Vite + React', description: 'A plain single-page app.' },
  ]}
  autoContinue={15}
  onSubmit={(answer) => agent.resume({ framework: answer.other ?? answer.selected[0] })}
/>`,
      },
      {
        title: 'Several questions',
        description: 'A short brief, one question at a time, with a summary you can edit at the end.',
        component: ClarifyingQuestionsDemo,
        height: 560,
        code: `import { ClarifyingQuestions } from '@/components/ai/ClarifyingQuestion';

<ClarifyingQuestions
  steps={[
    { id: 'audience', header: 'Audience', question: 'Who is this page for?', options: audiences },
    { id: 'sections', header: 'Sections', question: 'Which sections?', options: sections, multiSelect: true },
    { id: 'tone', header: 'Tone', question: 'How should it feel?', options: tones },
  ]}
  onComplete={(answers) => agent.resume(answers)}
/>`,
      },
    ],
    props: [
      { name: 'question', type: 'string', description: 'The question the agent is asking.' },
      { name: 'header', type: 'string', description: 'Short topic chip, e.g. “Framework”.' },
      { name: 'options', type: 'QuestionOption[]', description: 'id, label, optional description and recommended flag.' },
      { name: 'multiSelect', type: 'boolean', default: 'false', description: 'Allow more than one option.' },
      { name: 'allowOther', type: 'boolean', default: 'true', description: 'Adds an “Other” option with a text field.' },
      { name: 'autoContinue', type: 'number', description: 'Seconds before the recommended option is submitted. Any interaction cancels it.' },
      { name: 'onSubmit', type: '(answer: QuestionAnswer) => void', description: 'Receives selected ids, the free-text answer, or skipped.' },
    ],
  },
  {
    slug: 'checkpoints',
    name: 'Checkpoints',
    description: 'A timeline of the checkpoints an agent saves before each edit, with files changed and a confirm-to-restore rewind.',
    badge: 'New',
    demos: [
      {
        title: 'Rewind a session',
        description: 'Restore an earlier checkpoint: later ones dim and a banner offers Redo.',
        component: CheckpointsDemo,
        height: 660,
        code: `import { Checkpoints } from '@/components/ai/Checkpoints';

<Checkpoints
  checkpoints={session.checkpoints.map((c) => ({
    id: c.id,
    prompt: c.prompt,
    time: format(c.createdAt, 'HH:mm'),
    files: c.changes.map((f) => ({ path: f.path, add: f.additions, del: f.deletions })),
  }))}
  onRestore={(id) => (id ? session.rewindTo(id) : session.redo())}
/>`,
      },
    ],
    props: [
      { name: 'checkpoints', type: 'Checkpoint[]', description: 'Oldest first: id, prompt, time and the files it changed.' },
      { name: 'onRestore', type: '(id: string | null) => void', description: 'Called with the restored checkpoint id, or null on Redo.' },
      { name: 'className', type: 'string', description: 'Extra classes for the card.' },
    ],
  },
  {
    slug: 'memory-panel',
    name: 'Memory',
    description: 'What the assistant remembers, grouped and editable: edit inline, forget with undo, add a memory or switch memory off.',
    badge: 'New',
    demos: [
      {
        title: 'Learning from a chat',
        description: 'A new fact in the conversation lands in Projects with a “Memory updated” pill. Hover a memory to edit or forget it.',
        component: MemoryPanelDemo,
        height: 600,
        code: `import { MemoryPanel } from '@/components/ai/MemoryPanel';

const [incoming, setIncoming] = useState<Memory | null>(null);

useEffect(() => agent.on('memory', (m) => setIncoming(m)), []);

<MemoryPanel initial={user.memories} incoming={incoming} onChange={saveMemories} />`,
      },
    ],
    props: [
      { name: 'initial', type: 'Memory[]', description: 'id, text and group: Preferences, Projects or Facts.' },
      { name: 'incoming', type: 'Memory | null', description: 'Set to a new memory to add it with the “Memory updated” pill.' },
      { name: 'onChange', type: '(memories: Memory[]) => void', description: 'Fires after every add, edit, forget or undo.' },
      { name: 'className', type: 'string', description: 'Extra classes for the panel.' },
    ],
  },
  {
    slug: 'artifact-panel',
    name: 'Artifact Panel',
    description: 'Chat beside a live artifact: the latest version streams in, Preview and Code views, versions with changed lines and copy or download.',
    badge: 'New',
    demos: [
      {
        title: 'Pricing card in three versions',
        description: 'Switch v1, v2 and v3 to see what changed, then open Preview and try the yearly toggle.',
        component: ArtifactPanelDemo,
        height: 560,
        code: `import { ArtifactPanel } from '@/components/ai/ArtifactPanel';

<ArtifactPanel
  title="PricingCard.tsx"
  versions={artifact.versions.map((v) => ({
    id: v.id,
    prompt: v.prompt,
    summary: v.summary,
    code: v.source,
    preview: <Sandbox code={v.source} />,
  }))}
/>`,
      },
    ],
    props: [
      { name: 'title', type: 'string', description: 'File name shown in the toolbar and used for downloads.' },
      { name: 'versions', type: 'ArtifactVersion[]', description: 'Oldest first: prompt, summary, code and a rendered preview.' },
      { name: 'speed', type: 'number', default: '6', description: 'Characters revealed per frame while the latest version streams.' },
    ],
  },
  {
    slug: 'command-composer',
    name: 'Command Composer',
    description: 'A composer with a / command menu and @ mentions for files, people and docs, keyboard driven, with selections as chips.',
    badge: 'New',
    demos: [
      {
        title: 'Commands and mentions',
        description: 'Type / or @, move with ↑↓, pick with Enter or Tab, close with Esc. Backspace removes the last chip.',
        component: CommandComposerDemo,
        height: 480,
        code: `import { CommandComposer } from '@/components/ai/CommandComposer';

<CommandComposer
  commands={commands}
  mentions={[...files, ...teammates, ...docs]}
  onSend={({ command, mentions, text }) =>
    agent.run({ command: command?.id, context: mentions.map((m) => m.id), prompt: text })
  }
/>`,
      },
    ],
    props: [
      { name: 'onSend', type: '(message: ComposerMessage) => void', description: 'Receives the parsed command, mentions and text.' },
      { name: 'commands', type: 'ComposerItem[]', description: 'Slash commands shown after typing /.' },
      { name: 'mentions', type: 'ComposerItem[]', description: 'Files, people and docs shown after typing @.' },
      { name: 'placeholder', type: 'string', description: 'Shown while the composer is empty.' },
    ],
  },
];
