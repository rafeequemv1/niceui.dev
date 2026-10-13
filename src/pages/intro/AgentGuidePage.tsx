import { ArrowRight, Bot, Brain, Cpu, MessageSquare, Sparkles, Terminal, Wrench, Zap } from 'lucide-react';
import { CodeBlock } from '@/components/ui/CodeBlock';

type GuideProps = { onNavigate?: (to: string) => void };

const patterns = [
  { icon: MessageSquare, title: 'Streaming responses', desc: 'Render tokens as they arrive. Use a word-by-word reveal with a blinking caret to show the model is working.', to: '/ai/streaming-response' },
  { icon: Wrench, title: 'Tool calls & approvals', desc: 'Surface tool invocations as cards with args, a confirm/deny gate, and result previews.', to: '/ai/tool-approval' },
  { icon: Cpu, title: 'Agent activity timeline', desc: 'Show a live vertical timeline of steps: thinking, searching, reading, writing — with elapsed timers.', to: '/ai/agent-activity' },
  { icon: Brain, title: 'Loading states', desc: 'Replace generic spinners with context-aware loaders: "Thinking...", "Searching docs...", "Writing code...".', to: '/ai/agent-loading' },
];

const streamingCode = `// Word-by-word streaming with a caret
function useStreamResponse(text: string, speed = 40) {
  const [shown, setShown] = useState("");
  useEffect(() => {
    setShown("");
    const words = text.split(" ");
    let i = 0;
    const timer = setInterval(() => {
      if (i >= words.length) return clearInterval(timer);
      setShown(words.slice(0, ++i).join(" "));
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);
  return shown;
}`;

const toolCode = `// Tool approval card pattern
function ToolApproval({ call, onApprove, onDeny }) {
  const [state, setState] = useState("pending");
  return (
    <div className="surface p-4">
      <div className="flex items-center gap-2">
        <Terminal className="h-4 w-4 text-brand-400" />
        <span className="font-mono text-sm">{call.name}</span>
      </div>
      <pre className="mt-2 rounded-lg bg-ink-950 p-3 text-xs">
        {JSON.stringify(call.args, null, 2)}
      </pre>
      {state === "pending" ? (
        <div className="mt-3 flex gap-2">
          <Button variant="primary" onClick={() => { setState("approved"); onApprove(); }}>
            Approve
          </Button>
          <Button variant="danger" onClick={() => { setState("denied"); onDeny(); }}>
            Deny
          </Button>
        </div>
      ) : (
        <div className="mt-3 text-sm text-ink-400">
          {state === "approved" ? "Approved — running..." : "Denied"}
        </div>
      )}
    </div>
  );
}`;

const checklist = [
  'Always show the agent is working — never a blank screen during processing',
  'Let users approve or deny tool calls before they execute',
  'Cite sources inline with hoverable reference chips',
  'Stream text token-by-token with a visible caret',
  'Provide a clear way to stop or interrupt generation',
  'Show elapsed time per step so users understand cost',
];

export function AgentGuidePage({ onNavigate }: GuideProps) {
  const go = (to: string) => onNavigate?.(to);
  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-10 sm:px-8 lg:pt-14">
      <div className="animate-fade-up">
        <div className="text-xs font-medium uppercase tracking-[0.14em] text-brand-400">AI</div>
        <h1 className="mt-3 text-3xl font-semibold text-ink-50 sm:text-4xl">Agent guide</h1>
        <p className="mt-3 max-w-2xl text-base text-ink-400">
          How to build AI agent interfaces that feel trustworthy, responsive, and human. These patterns power every component in the AI Agents section.
        </p>
      </div>

      {/* Patterns */}
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {patterns.map((p, i) => (
          <button
            key={p.title}
            onClick={() => go(p.to)}
            className="group surface p-5 text-left transition-all hover:shadow-pop animate-fade-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/10">
              <p.icon className="h-5 w-5 text-brand-400" />
            </div>
            <h3 className="flex items-center gap-2 font-medium text-ink-50">
              {p.title}
              <ArrowRight className="h-3.5 w-3.5 text-ink-500 transition-all group-hover:translate-x-0.5 group-hover:text-brand-400" />
            </h3>
            <p className="mt-1.5 text-sm text-ink-400">{p.desc}</p>
          </button>
        ))}
      </div>

      {/* Streaming code */}
      <section className="mt-12">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-ink-50">
          <Sparkles className="h-5 w-5 text-brand-400" />
          Streaming responses
        </h2>
        <p className="mt-2 text-sm text-ink-400">
          The core hook behind every streaming component. It reveals text word-by-word with a configurable speed.
        </p>
        <div className="mt-4">
          <CodeBlock code={streamingCode} filename="useStreamResponse.ts" maxHeight={280} />
        </div>
      </section>

      {/* Tool approval code */}
      <section className="mt-10">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-ink-50">
          <Wrench className="h-5 w-5 text-brand-400" />
          Tool approval pattern
        </h2>
        <p className="mt-2 text-sm text-ink-400">
          Give users control over what the agent can do. Every tool call becomes a card with arguments, an approve/deny gate, and a resolved state.
        </p>
        <div className="mt-4">
          <CodeBlock code={toolCode} filename="ToolApproval.tsx" maxHeight={400} />
        </div>
      </section>

      {/* Checklist */}
      <section className="mt-12">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-ink-50">
          <Zap className="h-5 w-5 text-brand-400" />
          Agent UX checklist
        </h2>
        <div className="mt-4 space-y-2">
          {checklist.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-xl bg-ink-900 p-3.5 shadow-hairline animate-fade-up"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-xs text-emerald-300">
                {i + 1}
              </span>
              <span className="text-sm text-ink-300">{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="mt-12 flex flex-wrap gap-3">
        <button
          onClick={() => go('/ai/chat-app')}
          className="focus-ring group flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-medium text-white shadow-glow transition-all hover:bg-brand-400 active:scale-[0.97]"
        >
          <Bot className="h-4 w-4" />
          Explore AI components
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}
