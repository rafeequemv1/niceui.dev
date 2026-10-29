import type { DocEntry } from '@/docs/types';
import { AnswerEngineDemo } from '@/components/ai/AnswerEngine';
import { GenerativeUIDemo } from '@/components/ai/GenerativeUI';
import { ChatWidgetDemo } from '@/components/ai/ChatWidget';
import { AICommandPaletteDemo } from '@/components/ai/AICommandPalette';
import { CodeInterpreterDemo } from '@/components/ai/CodeInterpreter';

export const agentGenEntries: DocEntry[] = [
  {
    slug: 'answer-engine',
    name: 'Answer Engine',
    description: 'A search-style answer: source cards first, then a streamed answer with inline citations and related questions.',
    badge: 'New',
    demos: [
      {
        title: 'Cited answer',
        description: 'Hover a citation to light up its source. Click a related question to ask it.',
        component: AnswerEngineDemo,
        height: 560,
        code: `import { AnswerEngine } from '@/components/ai/AnswerEngine';

export function Answer({ result, onAsk }) {
  return (
    <AnswerEngine
      data={{
        query: result.query,
        sources: result.sources, // { title, domain, color }[]
        answer: result.text,     // cite with [1], [2] …
        related: result.followUps,
      }}
      onAsk={onAsk}
    />
  );
}`,
      },
    ],
    props: [
      { name: 'data', type: 'AnswerData', description: 'Query, sources, answer text with [n] citations, and related questions.' },
      { name: 'onAsk', type: '(question: string) => void', description: 'Called when a related question is clicked.' },
      { name: 'className', type: 'string', description: 'Extra classes for the card.' },
    ],
  },
  {
    slug: 'generative-ui',
    name: 'Generative UI',
    description: 'Tool calls that render interactive cards instead of text: weather, a stock chart, flight options and a calendar event.',
    badge: 'New',
    demos: [
      {
        title: 'Tool-rendered cards',
        description: 'Pick a request. Each tool shows a skeleton, then its card. Scrub the chart, pick a flight, add the event.',
        component: GenerativeUIDemo,
        height: 480,
        code: `import { ToolCard, WeatherCard, StockCard, FlightOptions, EventCard } from '@/components/ai/GenerativeUI';

const renderers = { get_weather: WeatherCard, get_quote: StockCard, search_flights: FlightOptions, create_event: EventCard };

export function ToolPart({ part }) {
  const Card = renderers[part.toolName];
  return (
    <ToolCard tool={part.toolName} loading={part.state !== 'output-available'}>
      <Card {...part.output} />
    </ToolCard>
  );
}`,
      },
    ],
    props: [
      { name: 'tool', type: 'string', description: 'Tool name shown in the "Calling…" line (ToolCard).' },
      { name: 'loading', type: 'boolean', description: 'Shows a skeleton until the tool result arrives (ToolCard).' },
      { name: 'children', type: 'ReactNode', description: 'The card rendered from the tool output (ToolCard).' },
      { name: 'city', type: 'string', default: "'Lisbon'", description: 'Location label for WeatherCard.' },
    ],
  },
  {
    slug: 'chat-widget',
    name: 'Chat Widget',
    description: 'A support assistant launcher with an unread badge, quick replies, streamed answers and a hand-off to a human.',
    badge: 'New',
    demos: [
      {
        title: 'Support assistant',
        description: 'Pick a quick reply to see Aria type and answer, or choose “Talk to a human” for the hand-off.',
        component: ChatWidgetDemo,
        height: 560,
        code: `import { ChatWidget } from '@/components/ai/ChatWidget';

// The widget positions itself inside the nearest positioned parent.
export function SiteShell({ children }) {
  return (
    <div className="relative min-h-screen">
      {children}
      <div className="fixed inset-0 pointer-events-none">
        <ChatWidget title="Aria" />
      </div>
    </div>
  );
}`,
      },
    ],
    props: [
      { name: 'title', type: 'string', default: "'Aria'", description: 'Assistant name in the header and greeting.' },
      { name: 'defaultOpen', type: 'boolean', default: 'false', description: 'Start with the panel open.' },
      { name: 'className', type: 'string', description: 'Extra classes for the overlay layer.' },
    ],
  },
  {
    slug: 'ai-command-palette',
    name: 'AI Command Palette',
    description: 'A ⌘K palette that runs commands and turns any question into a streamed AI answer with insert and copy actions.',
    badge: 'New',
    demos: [
      {
        title: 'Commands and Ask AI',
        description: 'Use ↑↓ and Enter for commands. Type a question and press Tab to ask AI; Esc goes back.',
        component: AICommandPaletteDemo,
        height: 480,
        code: `import { AICommandPalette } from '@/components/ai/AICommandPalette';

<AICommandPalette
  commands={commands}           // { id, label, group, icon, shortcut? }[]
  answerFor={(q) => ask(q)}     // returns the answer text to stream
/>`,
      },
    ],
    props: [
      { name: 'commands', type: 'PaletteCommand[]', description: 'Command list grouped by `group`.' },
      { name: 'answerFor', type: '(question: string) => string', description: 'Returns the markdown answer for a question.' },
      { name: 'demoQuestion', type: 'string', description: 'Types this question on mount to show the AI mode.' },
      { name: 'className', type: 'string', description: 'Extra classes for the palette.' },
    ],
  },
  {
    slug: 'code-interpreter',
    name: 'Code Interpreter',
    description: 'A notebook-style run cell: highlighted Python, a live timer, stdout, a rendered chart and a downloadable CSV.',
    badge: 'New',
    demos: [
      {
        title: 'Run cell',
        description: 'Re-run the cell, download the CSV, or flip on the error variant and let the agent fix it.',
        component: CodeInterpreterDemo,
        height: 600,
        code: `import { CodeInterpreter } from '@/components/ai/CodeInterpreter';

<CodeInterpreter autoRun />`,
      },
    ],
    props: [
      { name: 'autoRun', type: 'boolean', default: 'true', description: 'Run the cell once on mount.' },
      { name: 'className', type: 'string', description: 'Extra classes for the cell.' },
    ],
  },
];
