import type { DocEntry } from '@/docs/types';
import { VoiceOrbDemo } from '@/components/ai/VoiceOrb';
import { MessageBubbleDemo } from '@/components/ai/MessageBubble';
import { PromptInputDemo } from '@/components/ai/PromptInput';
import { StreamingResponseDemo } from '@/components/ai/StreamingResponse';
import { CodeHighlightDemo, CodeTabsDemo } from '@/components/ai/AICodeBlock';

export const conversationEntries: DocEntry[] = [
  {
    slug: 'voice-orb',
    name: 'Voice Orb',
    description: 'A living gradient orb that breathes, listens, thinks and speaks with simulated voice amplitude.',
    demos: [
      {
        title: 'Voice states',
        description: 'Switch states to see the layers react. Click the orb to toggle listening.',
        component: VoiceOrbDemo,
        height: 440,
        code: `import { VoiceOrb, type OrbState } from '@/components/ai/VoiceOrb';

export function VoiceMode() {
  const [state, setState] = useState<OrbState>('idle');

  return (
    <div className="flex flex-col items-center gap-6">
      <button onClick={() => setState(state === 'idle' ? 'listening' : 'idle')}>
        <VoiceOrb state={state} size={180} />
      </button>
      <p className="text-sm text-ink-300">
        {state === 'listening' ? 'Listening…' : 'Tap to talk'}
      </p>
    </div>
  );
}`,
      },
    ],
    props: [
      { name: 'state', type: "'idle' | 'listening' | 'thinking' | 'speaking'", default: "'idle'", description: 'Drives amplitude, rotation speed and glow intensity.' },
      { name: 'size', type: 'number', default: '200', description: 'Diameter of the orb in pixels.' },
      { name: 'className', type: 'string', description: 'Extra classes for the outer wrapper.' },
    ],
  },
  {
    slug: 'message-bubble',
    name: 'Message Bubble',
    description: 'User and assistant chat bubbles with timestamps, read receipts and hover actions.',
    demos: [
      {
        title: 'Conversation',
        description: 'Watch the last receipt go from sending to read. Hover the assistant reply to rate or regenerate.',
        component: MessageBubbleDemo,
        height: 420,
        code: `import { MessageBubble } from '@/components/ai/MessageBubble';

export function Thread({ messages, onRegenerate }) {
  return (
    <div className="flex flex-col gap-1">
      {messages.map((m) => (
        <MessageBubble
          key={m.id}
          role={m.role}
          time={m.time}
          status={m.role === 'user' ? m.status : undefined}
          copyText={m.text}
          onRegenerate={m.role === 'assistant' ? () => onRegenerate(m.id) : undefined}
        >
          {m.text}
        </MessageBubble>
      ))}
    </div>
  );
}`,
      },
    ],
    props: [
      { name: 'role', type: "'user' | 'assistant'", description: 'Alignment, colors and available actions.' },
      { name: 'time', type: 'string', description: 'Timestamp rendered under the bubble.' },
      { name: 'status', type: "'sending' | 'sent' | 'delivered' | 'read'", description: 'Read receipt for user messages.' },
      { name: 'copyText', type: 'string', description: 'Text copied by the copy action.' },
      { name: 'onRegenerate', type: '() => void', description: 'Shows a regenerate action on assistant messages.' },
      { name: 'actions', type: 'boolean', default: 'true', description: 'Reveal the hover action bar.' },
    ],
  },
  {
    slug: 'prompt-input',
    name: 'Prompt Input',
    description: 'An auto-growing composer with attachments, a model picker and a send button that morphs into stop.',
    demos: [
      {
        title: 'Composer',
        description: 'Attach files with the paperclip, pick a model, and send with ⌘/Ctrl + Enter.',
        component: PromptInputDemo,
        height: 400,
        code: `import { PromptInput } from '@/components/ai/PromptInput';

export function Composer() {
  const [generating, setGenerating] = useState(false);

  const send = async (text, attachments) => {
    setGenerating(true);
    await api.chat({ text, attachments });
    setGenerating(false);
  };

  return (
    <PromptInput
      onSubmit={send}
      generating={generating}
      onStop={() => api.abort()}
      placeholder="Summarize the Q3 revenue report…"
    />
  );
}`,
      },
    ],
    props: [
      { name: 'onSubmit', type: '(text: string, attachments: Attachment[]) => void', description: 'Called on send button or ⌘/Ctrl + Enter.' },
      { name: 'generating', type: 'boolean', default: 'false', description: 'Morphs the send button into a stop button.' },
      { name: 'onStop', type: '() => void', description: 'Called when stop is pressed while generating.' },
      { name: 'placeholder', type: 'string', default: "'Ask anything…'", description: 'Textarea placeholder.' },
      { name: 'maxRows', type: 'number', default: '8', description: 'Rows before the textarea starts scrolling.' },
    ],
  },
  {
    slug: 'streaming-response',
    name: 'Streaming Response',
    description: 'Assistant text that streams in word by word with a blinking caret and lightweight markdown.',
    demos: [
      {
        title: 'Token streaming',
        description: 'Headings, bullets, bold and inline code render as they arrive. Replay when finished.',
        component: StreamingResponseDemo,
        height: 460,
        code: `import { StreamingResponse } from '@/components/ai/StreamingResponse';
import { useStream, Markdown } from '@/components/ai/stream';

// Drop-in card
<StreamingResponse text={answer} speed={30} />

// Or build your own
function Answer({ text }) {
  const { output, done } = useStream(text, { speed: 24 });
  return <Markdown text={output} caret={!done} />;
}`,
      },
    ],
    props: [
      { name: 'text', type: 'string', description: 'Full markdown text to stream.' },
      { name: 'speed', type: 'number', default: '30', description: 'Average milliseconds per word.' },
      { name: 'showReplay', type: 'boolean', default: 'true', description: 'Show a replay button after streaming completes.' },
      { name: 'className', type: 'string', description: 'Extra classes for the card.' },
    ],
  },
  {
    slug: 'code-block',
    name: 'Code Block',
    description: 'Syntax-highlighted code for assistant answers, with highlighted lines and multi-file tabs.',
    demos: [
      {
        title: 'Highlighted changes',
        description: 'Draw attention to the lines the assistant changed.',
        component: CodeHighlightDemo,
        height: 520,
        code: `import { CodeBlock } from '@/components/ui/CodeBlock';

<CodeBlock
  code={snippet}
  filename="app/api/chat/route.ts"
  highlightLines={[4, 5, 6, 7, 11, 12]}
  maxHeight={320}
/>`,
      },
      {
        title: 'Multi-file tabs',
        component: CodeTabsDemo,
        height: 420,
        code: `import { CodeTabs } from '@/components/ai/AICodeBlock';

<CodeTabs
  files={[
    { name: 'useChat.ts', code: hookSource, highlight: [6] },
    { name: 'Chat.tsx', code: componentSource },
    { name: 'setup.sh', code: 'npm install @upstash/ratelimit' },
  ]}
/>`,
      },
    ],
    props: [
      { name: 'code', type: 'string', description: 'Source code to render.' },
      { name: 'filename', type: 'string', description: 'Shown in the header instead of the language.' },
      { name: 'highlightLines', type: 'number[]', default: '[]', description: '1-based line numbers to highlight.' },
      { name: 'files', type: 'CodeFile[]', description: 'CodeTabs only: list of { name, code, highlight }.' },
      { name: 'showLineNumbers', type: 'boolean', default: 'true', description: 'Toggle the gutter.' },
    ],
  },
];
