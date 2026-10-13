import { useEffect, useRef, useState, type DragEvent, type KeyboardEvent } from 'react';
import { ArrowUp, Brain, Check, ChevronDown, Clapperboard, Code2, Globe, ImageIcon, Paperclip, Square } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useClickOutside } from '@/components/ui/motion/hooks';
import { models } from './data';
import { AttachmentChip } from './Message';
import type { Attachment, Mode, Model, ModelId } from './types';

const modes: { id: Exclude<Mode, 'auto'>; label: string; icon: typeof Globe; placeholder: string }[] = [
  { id: 'search', label: 'Search', icon: Globe, placeholder: 'Search the web for anything…' },
  { id: 'image', label: 'Image', icon: ImageIcon, placeholder: 'Describe the image you want…' },
  { id: 'video', label: 'Video', icon: Clapperboard, placeholder: 'Describe a shot, camera move and mood…' },
  { id: 'code', label: 'Code', icon: Code2, placeholder: 'Describe the component or app to build…' },
];

type Props = {
  onSend: (text: string, attachments: Attachment[], mode: Mode) => void;
  onStop: () => void;
  isStreaming: boolean;
  model: Model;
  onModel: (id: ModelId) => void;
  extended: boolean;
  onExtended: (v: boolean) => void;
  autoFocus?: boolean;
};

export function Composer({ onSend, onStop, isStreaming, model, onModel, extended, onExtended, autoFocus }: Props) {
  const [text, setText] = useState('');
  const [files, setFiles] = useState<Attachment[]>([]);
  const [mode, setMode] = useState<Mode>('auto');
  const [picker, setPicker] = useState(false);
  const [dragging, setDragging] = useState(false);
  const ta = useRef<HTMLTextAreaElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  useClickOutside([pickerRef], picker, () => setPicker(false));

  useEffect(() => {
    const el = ta.current;
    if (!el) return;
    el.style.height = '0px';
    el.style.height = `${Math.min(220, el.scrollHeight)}px`;
  }, [text]);

  useEffect(() => {
    if (autoFocus) ta.current?.focus();
  }, [autoFocus]);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const next = Array.from(list).slice(0, 6).map<Attachment>((f) => ({
      id: crypto.randomUUID(),
      name: f.name,
      size: f.size,
      kind: f.type.startsWith('image/') ? 'image' : 'file',
      url: f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined,
    }));
    setFiles((cur) => [...cur, ...next].slice(0, 6));
  };

  const canSend = (text.trim().length > 0 || files.length > 0) && !isStreaming;
  const submit = () => {
    if (!canSend) return;
    onSend(text.trim() || 'Summarize these files', files, mode);
    setText('');
    setFiles([]);
    setMode('auto');
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const activeMode = modes.find((m) => m.id === mode);

  return (
    <div className="w-full">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          'relative rounded-[22px] border bg-ink-900/90 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all duration-300',
          dragging ? 'border-brand-400 ring-4 ring-brand-500/15' : 'border-white/[0.08] focus-within:border-white/20',
        )}
      >
        {dragging && <div className="absolute inset-0 z-10 grid place-items-center rounded-[22px] bg-ink-950/80 text-sm font-medium text-brand-200">Drop files to attach</div>}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 px-3 pt-3">
            {files.map((f) => <AttachmentChip key={f.id} a={f} onRemove={() => setFiles((cur) => cur.filter((x) => x.id !== f.id))} />)}
          </div>
        )}
        <textarea
          ref={ta}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKey}
          rows={1}
          aria-label="Message"
          placeholder={activeMode?.placeholder ?? 'Ask Nova anything, or drop a file…'}
          className="block max-h-[220px] w-full resize-none bg-transparent px-4 pb-2 pt-4 text-[15px] leading-relaxed text-ink-50 outline-none placeholder:text-ink-500"
        />
        <div className="flex items-center gap-1 px-2 pb-2">
          <input ref={fileInput} type="file" multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />
          <button onClick={() => fileInput.current?.click()} aria-label="Attach files" title="Attach files" className="grid h-9 w-9 place-items-center rounded-xl text-ink-400 transition-colors hover:bg-white/5 hover:text-ink-100">
            <Paperclip className="h-4 w-4" />
          </button>
          <div className="flex gap-1 overflow-x-auto">
            {modes.map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(mode === m.id ? 'auto' : m.id)}
                className={cn(
                  'flex h-9 shrink-0 items-center gap-1.5 rounded-xl px-2.5 text-xs font-medium transition-all duration-200',
                  mode === m.id ? 'bg-brand-500/15 text-brand-200 ring-1 ring-brand-500/40' : 'text-ink-400 hover:bg-white/5 hover:text-ink-100',
                )}
              >
                <m.icon className="h-3.5 w-3.5" /><span className="hidden sm:inline">{m.label}</span>
              </button>
            ))}
          </div>

          <div ref={pickerRef} className="relative ml-auto">
            <button onClick={() => setPicker((p) => !p)} className="flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-xs font-medium text-ink-300 transition-colors hover:bg-white/5 hover:text-white">
              <span className="hidden sm:inline">{model.name}</span><span className="sm:hidden">{model.name.split(' ').pop()}</span>
              {model.thinks && extended && <Brain className="h-3.5 w-3.5 text-brand-400" />}
              <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', picker && 'rotate-180')} />
            </button>
            {picker && (
              <div className="absolute bottom-11 right-0 z-30 w-72 origin-bottom-right rounded-2xl border border-white/10 bg-ink-900 p-1.5 shadow-pop animate-scale-in">
                {models.map((m) => (
                  <button key={m.id} onClick={() => { onModel(m.id); setPicker(false); }} className="flex w-full items-start gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-white/5">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-ink-50">{m.name}</div>
                      <div className="text-xs text-ink-400">{m.blurb}</div>
                    </div>
                    {model.id === m.id && <Check className="mt-0.5 h-4 w-4 text-brand-400" />}
                  </button>
                ))}
                <div className="mx-1 my-1.5 h-px bg-white/5" />
                <button
                  disabled={!model.thinks}
                  onClick={() => onExtended(!extended)}
                  className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-white/5 disabled:opacity-40"
                >
                  <Brain className="h-4 w-4 text-ink-300" />
                  <div className="flex-1">
                    <div className="text-sm text-ink-50">Extended thinking</div>
                    <div className="text-xs text-ink-400">{model.thinks ? 'Reason step by step before answering' : 'Not available on Haiku'}</div>
                  </div>
                  <span className={cn('relative h-5 w-9 rounded-full transition-colors', extended && model.thinks ? 'bg-brand-500' : 'bg-ink-700')}>
                    <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform duration-300 ease-spring', extended && model.thinks ? 'translate-x-4' : 'translate-x-0.5')} />
                  </span>
                </button>
              </div>
            )}
          </div>

          {isStreaming ? (
            <button onClick={onStop} aria-label="Stop generating" className="grid h-9 w-9 place-items-center rounded-xl bg-white text-ink-950 transition-transform hover:scale-105 active:scale-95">
              <Square className="h-3.5 w-3.5 fill-current" />
            </button>
          ) : (
            <button onClick={submit} disabled={!canSend} aria-label="Send message" className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500 text-white transition-all hover:bg-brand-400 active:scale-95 disabled:bg-ink-700 disabled:text-ink-500">
              <ArrowUp className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      <p className="mt-2 text-center text-[11px] text-ink-600">Nova can make mistakes. All responses in this template are simulated.</p>
    </div>
  );
}
