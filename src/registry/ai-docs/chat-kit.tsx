import type { DocEntry } from '@/docs/types';
import { ReasoningDemo } from '@/components/ai/Reasoning';
import { ModelSelectorDemo } from '@/components/ai/ModelSelector';
import { ContextUsageDemo } from '@/components/ai/ContextUsage';
import { ResponseBranchesDemo } from '@/components/ai/ResponseBranches';
import { FollowUpsDemo, PromptSuggestionsDemo } from '@/components/ai/PromptSuggestions';

export const chatKitEntries: DocEntry[] = [
  {
    slug: 'reasoning',
    name: 'Reasoning',
    description: 'A collapsible thinking panel that streams the model’s reasoning with a live timer, then folds into “Thought for 6 seconds”.',
    badge: 'New',
    demos: [
      {
        title: 'Think, then answer',
        description: 'The reasoning streams while the timer runs, then folds away as the answer arrives. Open it again from the header.',
        component: ReasoningDemo,
        height: 540,
        code: `import { Reasoning } from '@/components/ai/Reasoning';
import { Markdown } from '@/components/ai/stream';

export function AssistantTurn({ message }) {
  const thinking = message.status === 'reasoning';

  return (
    <div className="space-y-3">
      <Reasoning
        text={message.reasoning}
        thinking={thinking}
        duration={message.reasoningSeconds}
      />
      {!thinking && <Markdown text={message.text} caret={message.status === 'streaming'} />}
    </div>
  );
}`,
      },
    ],
    props: [
      { name: 'text', type: 'string', description: 'Reasoning streamed so far.' },
      { name: 'thinking', type: 'boolean', description: 'Keeps the panel open with a shimmering header and live timer.' },
      { name: 'duration', type: 'number', description: 'Seconds spent thinking, shown once done. Measured live when omitted.' },
      { name: 'open', type: 'boolean', description: 'Controlled open state. Leave undefined to auto-open while thinking and collapse after.' },
      { name: 'onOpenChange', type: '(open: boolean) => void', description: 'Called when the reader toggles the panel.' },
    ],
  },
  {
    slug: 'model-selector',
    name: 'Model Selector',
    description: 'A command-menu model picker with search, favorites, capability badges, context and price, and a detail pane.',
    badge: 'New',
    demos: [
      {
        title: 'Pick a model',
        description: 'Type to filter, use the arrow keys and Enter, or star a model to pin it to Favorites.',
        component: ModelSelectorDemo,
        height: 540,
        code: `import { ModelSelector, type ModelOption } from '@/components/ai/ModelSelector';

const models: ModelOption[] = [
  {
    id: 'nova-pro', name: 'Nova Pro', provider: 'Nova', glyph: 'N',
    tint: 'bg-sky-500/15 text-sky-300', context: 400_000, price: 3, speed: 3,
    caps: ['vision', 'tools', 'reasoning'],
    description: 'The all-rounder for writing, analysis and tool use.',
  },
  // …
];

export function ChatHeader() {
  const [model, setModel] = useState('auto');
  const [favorites, setFavorites] = useState<string[]>([]);

  return (
    <ModelSelector
      models={models}
      value={model}
      onChange={setModel}
      favorites={favorites}
      onToggleFavorite={(id) =>
        setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]))
      }
    />
  );
}`,
      },
    ],
    props: [
      { name: 'models', type: 'ModelOption[]', description: 'Models with provider, glyph, context, price, speed and capabilities.' },
      { name: 'value', type: 'string', description: "Selected model id, or 'auto'." },
      { name: 'onChange', type: '(id: string) => void', description: 'Called with the chosen model id.' },
      { name: 'favorites', type: 'string[]', default: '[]', description: 'Model ids pinned to the Favorites group.' },
      { name: 'onToggleFavorite', type: '(id: string) => void', description: 'Shows star buttons and the ⌥F shortcut.' },
      { name: 'allowAuto', type: 'boolean', default: 'true', description: 'Adds an Auto option that routes each message.' },
      { name: 'defaultOpen', type: 'boolean', default: 'false', description: 'Start with the menu open.' },
    ],
  },
  {
    slug: 'context-usage',
    name: 'Context Usage',
    description: 'A context-window meter with a segmented ring and bar, running cost, a warning near the limit and a compact action.',
    badge: 'New',
    demos: [
      {
        title: 'Watch it fill',
        description: 'Add messages, files or tool calls. Past 80% a warning appears, and Compact summarizes older turns.',
        component: ContextUsageDemo,
        height: 520,
        code: `import { ContextUsage } from '@/components/ai/ContextUsage';

<ContextUsage
  model="Nova Pro"
  limit={200_000}
  pricePerMillion={3}
  segments={[
    { id: 'system', label: 'System prompt', tokens: usage.system, color: '#64748b' },
    { id: 'tools', label: 'Tool definitions', tokens: usage.tools, color: '#a78bfa' },
    { id: 'files', label: 'Files', tokens: usage.files, color: '#2dd4bf' },
    { id: 'messages', label: 'Messages', tokens: usage.messages, color: '#7dd3fc' },
  ]}
  compacting={isCompacting}
  onCompact={compactConversation}
/>`,
      },
    ],
    props: [
      { name: 'segments', type: '{ id, label, tokens, color }[]', description: 'Token usage by category, drawn in order on the ring and bar.' },
      { name: 'limit', type: 'number', description: 'Context window size in tokens.' },
      { name: 'model', type: 'string', description: 'Model name shown in the header.' },
      { name: 'pricePerMillion', type: 'number', default: '3', description: 'Input price used for the running cost.' },
      { name: 'warnAt', type: 'number', default: '0.8', description: 'Fraction of the window at which the warning appears.' },
      { name: 'onCompact', type: '() => void', description: 'Shows the Compact button in the warning.' },
      { name: 'compacting', type: 'boolean', description: 'Shows a summarizing state and disables Compact.' },
    ],
  },
  {
    slug: 'response-branches',
    name: 'Response Branches',
    description: 'Regenerated replies you can page through, with copy, rate, feedback, share and read-aloud actions.',
    badge: 'New',
    demos: [
      {
        title: 'Versions and actions',
        description: 'Regenerate to stream a new version, page between them, and thumbs down to leave feedback.',
        component: ResponseBranchesDemo,
        height: 440,
        code: `import { BranchPicker, ResponseActions } from '@/components/ai/ResponseBranches';

export function AssistantFooter({ message, versions, index, setIndex }) {
  return (
    <div className="flex items-center gap-1">
      <BranchPicker index={index} count={versions.length} onChange={setIndex} />
      <ResponseActions
        text={versions[index].text}
        onRegenerate={() => regenerate(message.id)}
        regenerating={message.status === 'streaming'}
        onFeedback={(f) => sendFeedback(message.id, f)}
        meta="Nova Pro · 1.4s"
      />
    </div>
  );
}`,
      },
    ],
    props: [
      { name: 'index / count', type: 'number', description: 'BranchPicker: zero-based version shown and total versions.' },
      { name: 'onChange', type: '(index: number) => void', description: 'BranchPicker: called with the next version index.' },
      { name: 'text', type: 'string', description: 'ResponseActions: text copied by the copy action.' },
      { name: 'onRegenerate', type: '() => void', description: 'ResponseActions: shows the regenerate action.' },
      { name: 'regenerating', type: 'boolean', description: 'Spins the regenerate icon and disables it.' },
      { name: 'onFeedback', type: "(f: { vote, reasons?, comment? } | null) => void", description: 'Called on thumbs up, or after the thumbs-down form is sent.' },
      { name: 'shareUrl', type: 'string', description: 'Link copied by the share action.' },
      { name: 'meta', type: 'string', description: 'Trailing label, for example model and latency.' },
    ],
  },
  {
    slug: 'prompt-suggestions',
    name: 'Prompt Suggestions',
    description: 'Starter prompts in category tabs for an empty chat, plus follow-up chips that cascade in after a reply.',
    badge: 'New',
    demos: [
      {
        title: 'Empty state',
        description: 'Switch categories, then pick a card to type it into the composer.',
        component: PromptSuggestionsDemo,
        height: 600,
        code: `import { PromptSuggestions } from '@/components/ai/PromptSuggestions';
import { PenLine, Code2 } from 'lucide-react';

<PromptSuggestions
  categories={[
    { id: 'write', label: 'Write', icon: PenLine, items: writingPrompts },
    { id: 'code', label: 'Code', icon: Code2, items: codingPrompts },
  ]}
  onSelect={(prompt) => composer.setText(prompt)}
/>`,
      },
      {
        title: 'Follow-ups',
        description: 'Chips appear when the reply finishes. Pick one to keep the conversation going.',
        component: FollowUpsDemo,
        height: 400,
        code: `import { FollowUps } from '@/components/ai/PromptSuggestions';

<FollowUps
  show={message.status === 'done'}
  items={message.suggestions}
  onSelect={(text) => send(text)}
/>`,
      },
    ],
    props: [
      { name: 'categories', type: '{ id, label, icon, items: { title, prompt }[] }[]', description: 'PromptSuggestions: tabs and their starter cards.' },
      { name: 'onSelect', type: '(prompt: string) => void', description: 'Called with the chosen prompt or follow-up.' },
      { name: 'items', type: 'string[]', description: 'FollowUps: the suggestion chips.' },
      { name: 'show', type: 'boolean', description: 'FollowUps: reveals the chips with a staggered entrance.' },
    ],
  },
];
