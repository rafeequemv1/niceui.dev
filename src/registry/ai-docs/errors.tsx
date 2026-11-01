import type { DocEntry } from '@/docs/types';
import { RateLimitNoticeDemo } from '@/components/ai/errors/RateLimitNotice';
import { ToolFailureDemo } from '@/components/ai/errors/ToolFailure';
import { ConnectionStatusDemo } from '@/components/ai/errors/ConnectionStatus';
import { ContextFullDemo } from '@/components/ai/errors/ContextFull';
import { RefusalMessageDemo } from '@/components/ai/errors/RefusalMessage';
import { SpendCapDemo } from '@/components/ai/errors/SpendCap';

export const errorEntries: DocEntry[] = [
  {
    slug: 'rate-limit-notice',
    name: 'Rate Limit',
    description: 'A usage-limit notice with a live reset countdown, a usage meter, and options to switch model or upgrade.',
    badge: 'New',
    demos: [
      {
        title: 'Limit reached mid-chat',
        description: 'Switch to the smaller model or upgrade; either resends the blocked message.',
        component: RateLimitNoticeDemo,
        height: 520,
        code: `import { RateLimitNotice } from '@/components/ai/errors/RateLimitNotice';

<RateLimitNotice
  used={usage.used}
  limit={usage.limit}
  resetAt={usage.resetAt}
  model="Nova Pro"
  fallbackModel="Nova Mini"
  onSwitchModel={() => resend({ model: 'nova-mini' })}
  onUpgrade={openBilling}
/>`,
      },
    ],
    props: [
      { name: 'used', type: 'number', description: 'Messages or tokens used in the current window.' },
      { name: 'limit', type: 'number', description: 'Window limit; drives the meter.' },
      { name: 'resetAt', type: 'number', description: 'Reset time as a millisecond timestamp; the countdown ticks live.' },
      { name: 'model', type: 'string', description: 'The model that hit its limit.' },
      { name: 'fallbackModel', type: 'string', description: 'Shows a "Continue with" action when set.' },
      { name: 'onSwitchModel', type: '() => void', description: 'Called by the continue action.' },
      { name: 'onUpgrade', type: '() => void', description: 'Called by the upgrade action.' },
    ],
  },
  {
    slug: 'tool-failure-retry',
    name: 'Tool Failure',
    description: 'A failed tool call with collapsible error details, retry with exponential backoff, editable arguments and skip.',
    badge: 'New',
    demos: [
      {
        title: 'Flaky upstream',
        description: 'Retry and watch the backoff count down; the third attempt succeeds. Or edit the arguments, or skip.',
        component: ToolFailureDemo,
        height: 480,
        code: `import { ToolFailure } from '@/components/ai/errors/ToolFailure';

<ToolFailure
  tool={call.name}
  args={JSON.stringify(call.args, null, 2)}
  error={{ code: '503', message: 'Upstream timed out', detail: call.log }}
  state={call.state}
  attempt={call.attempt}
  retryAt={call.nextRetryAt}
  onRetry={() => retry(call.id)}
  onEditArgs={(args) => retry(call.id, JSON.parse(args))}
  onSkip={() => skip(call.id)}
/>`,
      },
    ],
    props: [
      { name: 'tool', type: 'string', description: 'Tool name shown in mono.' },
      { name: 'args', type: 'string', description: 'Arguments as text; editable from the card.' },
      { name: 'error', type: '{ code: string; message: string; detail?: string }', description: 'Summary line and an optional log shown when expanded.' },
      { name: 'state', type: "'failed' | 'waiting' | 'running' | 'success' | 'skipped'", description: 'Drives the icon, colours and actions.' },
      { name: 'attempt', type: 'number', description: 'Current attempt number.' },
      { name: 'retryAt', type: 'number | null', description: "Next automatic retry while state is 'waiting'." },
      { name: 'onRetry / onEditArgs / onSkip', type: 'callbacks', description: 'Retry now, retry with new arguments, or continue without the tool.' },
    ],
  },
  {
    slug: 'connection-status',
    name: 'Connection Status',
    description: 'An offline → reconnecting → back-online bar above the composer, with messages that queue and send on reconnect.',
    badge: 'New',
    demos: [
      {
        title: 'Dropped connection',
        description: 'The first reconnect fails, the second succeeds and the queued messages send. Drop it again to replay.',
        component: ConnectionStatusDemo,
        height: 540,
        code: `import { ConnectionStatus } from '@/components/ai/errors/ConnectionStatus';

<ConnectionStatus
  state={socket.state}
  attempt={socket.attempt}
  nextAttemptAt={socket.nextAttemptAt}
  queued={outbox.length}
  onRetryNow={socket.reconnect}
/>`,
      },
    ],
    props: [
      { name: 'state', type: "'online' | 'offline' | 'reconnecting'", description: 'The bar hides itself shortly after returning online.' },
      { name: 'attempt', type: 'number', default: '1', description: 'Reconnect attempt number.' },
      { name: 'nextAttemptAt', type: 'number | null', description: 'Next attempt time; shows a countdown while offline.' },
      { name: 'queued', type: 'number', default: '0', description: 'Messages waiting to send.' },
      { name: 'onRetryNow', type: '() => void', description: 'Shows a "Try now" action while offline.' },
    ],
  },
  {
    slug: 'context-full',
    name: 'Context Full',
    description: 'A context-window warning that compacts the chat into a summary, or starts a new chat carrying that summary.',
    badge: 'New',
    demos: [
      {
        title: 'Out of memory',
        description: 'Compact to watch usage fall, or start a new chat with a summary of this one.',
        component: ContextFullDemo,
        height: 480,
        code: `import { ContextFull } from '@/components/ai/errors/ContextFull';

<ContextFull
  used={context.tokens}
  limit={model.contextWindow}
  compacting={compacting}
  onCompact={compactConversation}
  onNewChat={() => startChat({ summary: await summarize(thread) })}
/>`,
      },
    ],
    props: [
      { name: 'used', type: 'number', description: 'Tokens currently in context.' },
      { name: 'limit', type: 'number', description: "The model's context window." },
      { name: 'compacting', type: 'boolean', description: 'Shows a progress state on the compact action.' },
      { name: 'onCompact', type: '() => void', description: 'Summarise older turns in place.' },
      { name: 'onNewChat', type: '() => void', description: 'Start fresh, carrying a summary.' },
    ],
  },
  {
    slug: 'refusal-message',
    name: 'Polite Refusal',
    description: 'A calm way to decline a request: a plain reason, alternatives the assistant can do instead, and a learn-more link.',
    badge: 'New',
    demos: [
      {
        title: 'Declining, then helping',
        description: 'Pick an alternative to continue the conversation.',
        component: RefusalMessageDemo,
        height: 500,
        code: `import { RefusalMessage } from '@/components/ai/errors/RefusalMessage';

<RefusalMessage
  reason="Private contact details could put someone at risk, so I don't look them up."
  alternatives={['Find their public work email format', 'Draft a LinkedIn note']}
  onPick={(text) => send(text)}
  learnMoreHref="/policies/assistant"
/>`,
      },
    ],
    props: [
      { name: 'title', type: 'string', default: '"I can\'t help with that part"', description: 'Heading line.' },
      { name: 'reason', type: 'string', description: 'A short, plain explanation.' },
      { name: 'alternatives', type: 'string[]', description: 'Suggestion chips for what the assistant can do instead.' },
      { name: 'onPick', type: '(alt: string) => void', description: 'Called when a chip is chosen.' },
      { name: 'learnMoreHref', type: 'string', description: 'Optional link to your usage policy.' },
    ],
  },
  {
    slug: 'spend-cap',
    name: 'Spend Cap',
    description: 'An agent run paused at its budget cap, with a cost breakdown, a raise-cap control that asks to confirm, and stop.',
    badge: 'New',
    demos: [
      {
        title: 'Budget reached',
        description: 'Raise the cap, confirm, and watch the run finish, or stop and keep what it has.',
        component: SpendCapDemo,
        height: 620,
        code: `import { SpendCap } from '@/components/ai/errors/SpendCap';

<SpendCap
  cap={run.cap}
  breakdown={run.costs}
  stepsDone={run.done}
  stepsTotal={run.total}
  onContinue={(cap) => resume(run.id, { cap })}
  onStop={() => stop(run.id)}
/>`,
      },
    ],
    props: [
      { name: 'cap', type: 'number', description: 'The cap that was reached, in dollars.' },
      { name: 'breakdown', type: '{ label: string; amount: number }[]', description: 'Cost lines shown as bars.' },
      { name: 'stepsDone / stepsTotal', type: 'number', description: 'Progress of the paused run.' },
      { name: 'onContinue', type: '(newCap: number) => void', description: 'Called after the raise is confirmed.' },
      { name: 'onStop', type: '() => void', description: 'End the run and keep partial results.' },
    ],
  },
];
