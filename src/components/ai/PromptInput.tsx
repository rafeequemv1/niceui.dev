import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUp, Check, ChevronDown, FileText, Image, Paperclip, Sparkles, Square, X, Zap, Brain } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useClickOutside, useEscape, usePresence } from '@/components/ui/motion/hooks';

export type Attachment = { id: string; name: string; size: string; kind: 'image' | 'file' };
export type Model = { id: string; name: string; hint: string; icon: typeof Zap };

export const MODELS: Model[] = [
  { id: 'nice-pro', name: 'Nice Pro', hint: 'Best for complex tasks', icon: Sparkles },
  { id: 'nice-fast', name: 'Nice Fast', hint: 'Quick everyday answers', icon: Zap },
  { id: 'nice-reason', name: 'Nice Reason', hint: 'Thinks before answering', icon: Brain },
];

const SAMPLE_FILES: Omit<Attachment, 'id'>[] = [
  { name: 'q3-revenue.csv', size: '48 KB', kind: 'file' },
  { name: 'dashboard.png', size: '1.2 MB', kind: 'image' },
  { name: 'product-spec.pdf', size: '312 KB', kind: 'file' },
];

export type PromptInputProps = {
  onSubmit: (text: string, attachments: Attachment[]) => void;
  generating?: boolean;
  onStop?: () => void;
  placeholder?: string;
  maxRows?: number;
  className?: string;
};

function ModelSelect({ value, onChange }: { value: Model; onChange: (m: Model) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  const { mounted, visible } = usePresence(open, 160);
  useClickOutside([ref], open, close);
  useEscape(open, close);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="focus-ring flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-ink-300 transition-colors hover:bg-white/5 hover:text-ink-50"
      >
        <value.icon className="h-3.5 w-3.5 text-brand-300" />
        {value.name}
        <ChevronDown className={cn('h-3.5 w-3.5 text-ink-500 transition-transform duration-300 ease-spring', open && 'rotate-180')} />
      </button>
      {mounted && (
        <div
          className={cn(
            'absolute bottom-full left-0 z-20 mb-2 w-60 origin-bottom-left rounded-xl bg-ink-850 p-1 shadow-pop transition-all',
            visible ? 'scale-100 opacity-100 duration-300 ease-spring' : 'scale-95 translate-y-1 opacity-0 duration-150',
          )}
        >
          {MODELS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                onChange(m);
                close();
              }}
              className="focus-ring flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-white/5"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white/5 text-brand-300">
                <m.icon className="h-3.5 w-3.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm text-ink-100">{m.name}</span>
                <span className="block text-xs text-ink-500">{m.hint}</span>
              </span>
              {m.id === value.id && <Check className="h-4 w-4 animate-scale-in text-brand-300" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function PromptInput({ onSubmit, generating = false, onStop, placeholder = 'Ask anything…', maxRows = 8, className }: PromptInputProps) {
  const [text, setText] = useState('');
  const [files, setFiles] = useState<Attachment[]>([]);
  const [model, setModel] = useState(MODELS[0]);
  const [focused, setFocused] = useState(false);
  const area = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = area.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, maxRows * 22 + 16)}px`;
  }, [text, maxRows]);

  const canSend = text.trim().length > 0 || files.length > 0;
  const submit = () => {
    if (generating) return onStop?.();
    if (!canSend) return;
    onSubmit(text.trim(), files);
    setText('');
    setFiles([]);
  };

  const attach = () => {
    const next = SAMPLE_FILES[files.length % SAMPLE_FILES.length];
    setFiles((f) => [...f, { ...next, id: `${Date.now()}` }]);
  };

  return (
    <div
      className={cn(
        'w-full rounded-2xl bg-ink-900 shadow-card transition-shadow duration-300',
        focused && 'shadow-[0_0_0_1px_rgba(56,189,248,0.35),0_8px_32px_-8px_rgba(56,189,248,0.25)]',
        className,
      )}
    >
      <div className={cn('grid transition-[grid-template-rows] duration-300 ease-smooth', files.length ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
        <div className="overflow-hidden">
          <div className="flex flex-wrap gap-2 px-3 pt-3">
            {files.map((f) => (
              <span key={f.id} className="group flex animate-scale-in items-center gap-2 rounded-lg bg-ink-850 py-1.5 pl-2 pr-1.5 shadow-hairline">
                <span className={cn('flex h-6 w-6 items-center justify-center rounded-md', f.kind === 'image' ? 'bg-sky-500/15 text-sky-300' : 'bg-brand-500/15 text-brand-300')}>
                  {f.kind === 'image' ? <Image className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
                </span>
                <span className="text-xs">
                  <span className="block max-w-[120px] truncate text-ink-100">{f.name}</span>
                  <span className="block text-[10px] text-ink-500">{f.size}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setFiles((all) => all.filter((x) => x.id !== f.id))}
                  className="focus-ring ml-1 flex h-5 w-5 items-center justify-center rounded text-ink-500 transition-colors hover:bg-white/10 hover:text-ink-100"
                  aria-label={`Remove ${f.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
      <textarea
        ref={area}
        rows={1}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            submit();
          }
        }}
        placeholder={placeholder}
        className="block w-full resize-none bg-transparent px-4 pt-3.5 text-sm leading-[22px] text-ink-50 outline-none placeholder:text-ink-500"
      />
      <div className="flex items-center justify-between gap-2 p-2">
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={attach}
            className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 transition-all hover:bg-white/5 hover:text-ink-50 active:scale-90"
            aria-label="Attach file"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <ModelSelect value={model} onChange={setModel} />
        </div>
        <div className="flex items-center gap-2">
          <kbd className="hidden rounded-md bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-ink-500 sm:block">⌘ ↵</kbd>
          <button
            type="button"
            onClick={submit}
            disabled={!generating && !canSend}
            aria-label={generating ? 'Stop generating' : 'Send message'}
            className={cn(
              'focus-ring relative flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 ease-spring active:scale-90',
              generating ? 'bg-ink-50 text-ink-950' : canSend ? 'bg-brand-500 text-white shadow-glow hover:bg-brand-400' : 'bg-ink-800 text-ink-500',
            )}
          >
            <ArrowUp className={cn('absolute h-4 w-4 transition-all duration-300 ease-spring', generating ? 'rotate-90 scale-0 opacity-0' : 'scale-100')} />
            <Square className={cn('absolute h-3 w-3 fill-current transition-all duration-300 ease-spring', generating ? 'scale-100 opacity-100' : 'scale-0 opacity-0')} />
            {generating && <span className="absolute inset-0 animate-pulse-ring rounded-full border border-ink-50/40" />}
          </button>
        </div>
      </div>
    </div>
  );
}

export function PromptInputDemo() {
  const [generating, setGenerating] = useState(false);
  const [last, setLast] = useState<{ text: string; files: number } | null>(null);
  const timer = useRef<number>();

  const send = (text: string, files: Attachment[]) => {
    setLast({ text: text || 'Sent attachments', files: files.length });
    setGenerating(true);
    timer.current = window.setTimeout(() => setGenerating(false), 3000);
  };
  const stop = () => {
    window.clearTimeout(timer.current);
    setGenerating(false);
  };
  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
      <div className="h-10">
        {last && (
          <div key={last.text} className="flex animate-fade-up items-center gap-2 text-xs text-ink-400">
            <span className={cn('h-1.5 w-1.5 rounded-full', generating ? 'animate-pulse bg-brand-400' : 'bg-emerald-400')} />
            <span className="truncate">
              {generating ? 'Generating response to' : 'Answered'} “{last.text}”{last.files ? ` · ${last.files} file${last.files > 1 ? 's' : ''}` : ''}
            </span>
          </div>
        )}
      </div>
      <PromptInput onSubmit={send} generating={generating} onStop={stop} placeholder="Summarize the Q3 revenue report…" />
    </div>
  );
}
