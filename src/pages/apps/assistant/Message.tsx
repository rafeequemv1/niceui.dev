import { useState, type ReactNode } from 'react';
import { Check, Copy, FileText, Pencil, RefreshCw, Sparkle, Square, ThumbsDown, ThumbsUp } from 'lucide-react';
import { cn } from '@/lib/cn';
import { ArtifactCard, ErrorPart, ImagePart, TextPart, ThinkingPart, ToolPart, VideoPart } from './parts';
import type { Artifact, AssistantMessage, Attachment, Message } from './types';

function useCopy() {
  const [copied, setCopied] = useState(false);
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };
  return { copied, copy };
}

const fmtSize = (b: number) => (b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1e3))} KB`);

export function AttachmentChip({ a, onRemove }: { a: Attachment; onRemove?: () => void }) {
  return (
    <div className="group relative flex items-center gap-2 rounded-xl border border-white/[0.08] bg-ink-900 p-1.5 pr-3 animate-scale-in">
      {a.kind === 'image' && a.url ? (
        <img src={a.url} alt={a.name} className="h-9 w-9 rounded-lg object-cover" />
      ) : (
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-500/10 text-brand-300"><FileText className="h-4 w-4" /></span>
      )}
      <div className="min-w-0">
        <div className="max-w-[140px] truncate text-xs font-medium text-ink-100">{a.name}</div>
        <div className="text-[10px] text-ink-500">{fmtSize(a.size)}</div>
      </div>
      {onRemove && (
        <button onClick={onRemove} aria-label={`Remove ${a.name}`} className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-ink-700 text-[10px] text-white opacity-0 ring-2 ring-ink-950 transition-opacity group-hover:opacity-100 focus:opacity-100">×</button>
      )}
    </div>
  );
}

export function UserMessage({ msg, canEdit, onEdit }: { msg: Extract<Message, { role: 'user' }>; canEdit: boolean; onEdit: (text: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(msg.text);
  const { copied, copy } = useCopy();

  if (editing) {
    return (
      <div className="ml-auto w-full max-w-[85%] rounded-2xl border border-brand-500/40 bg-ink-900 p-3 animate-fade-in">
        <textarea autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} rows={3} className="w-full resize-none bg-transparent text-[15px] text-ink-50 outline-none" />
        <div className="mt-2 flex justify-end gap-2">
          <button onClick={() => { setEditing(false); setDraft(msg.text); }} className="rounded-lg px-3 py-1.5 text-xs text-ink-300 hover:bg-white/5">Cancel</button>
          <button
            disabled={!draft.trim()}
            onClick={() => { setEditing(false); onEdit(draft.trim()); }}
            className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-ink-950 hover:bg-ink-100 disabled:opacity-40"
          >
            Save & send
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex flex-col items-end gap-2 animate-fade-up">
      {msg.attachments.length > 0 && (
        <div className="flex flex-wrap justify-end gap-2">{msg.attachments.map((a) => <AttachmentChip key={a.id} a={a} />)}</div>
      )}
      <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-ink-800 px-4 py-2.5 text-[15px] leading-relaxed text-ink-50">{msg.text}</div>
      <div className="flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <IconAction label={copied ? 'Copied' : 'Copy'} onClick={() => copy(msg.text)}>{copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}</IconAction>
        {canEdit && <IconAction label="Edit" onClick={() => setEditing(true)}><Pencil className="h-3.5 w-3.5" /></IconAction>}
      </div>
    </div>
  );
}

function IconAction({ label, onClick, active, children }: { label: string; onClick: () => void; active?: boolean; children: ReactNode }) {
  return (
    <button onClick={onClick} title={label} aria-label={label} className={cn('grid h-7 w-7 place-items-center rounded-lg transition-colors', active ? 'bg-white/10 text-white' : 'text-ink-500 hover:bg-white/5 hover:text-ink-100')}>
      {children}
    </button>
  );
}

export function AssistantLogo({ spinning }: { spinning?: boolean }) {
  return (
    <span className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-sky-600 text-white shadow-[0_0_20px_-4px_rgba(51,150,255,0.6)]">
      <Sparkle className={cn('h-4 w-4 fill-current', spinning && 'animate-spin-slow')} />
    </span>
  );
}

type AssistantProps = {
  msg: AssistantMessage;
  isLast: boolean;
  openArtifact: string | null;
  onOpenArtifact: (a: Artifact) => void;
  onRegenerate: () => void;
  onRate: (r: 'up' | 'down') => void;
  onPrompt: (text: string) => void;
};

export function AssistantMessageView({ msg, isLast, openArtifact, onOpenArtifact, onRegenerate, onRate, onPrompt }: AssistantProps) {
  const { copied, copy } = useCopy();
  const streaming = msg.status === 'streaming';
  const lastText = msg.parts.map((p) => p.type).lastIndexOf('text');
  const plain = msg.parts.flatMap((p) => (p.type === 'text' ? [p.text] : [])).join('\n\n');

  return (
    <div className="flex gap-4 animate-fade-up">
      <AssistantLogo spinning={streaming} />
      <div className="min-w-0 flex-1 space-y-3 pt-1">
        {msg.parts.length === 0 && streaming && (
          <div className="flex h-6 items-center gap-1">
            {[0, 1, 2].map((i) => <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-400" style={{ animationDelay: `${i * 120}ms` }} />)}
          </div>
        )}
        {msg.parts.map((p, i) => {
          switch (p.type) {
            case 'thinking': return <ThinkingPart key={i} part={p} />;
            case 'tool': return <ToolPart key={i} part={p} />;
            case 'text': return <TextPart key={i} part={p} caret={streaming && i === lastText} />;
            case 'artifact': return <ArtifactCard key={i} part={p} active={openArtifact === p.artifact.id} onOpen={onOpenArtifact} />;
            case 'image': return <ImagePart key={i} part={p} onPrompt={onPrompt} />;
            case 'video': return <VideoPart key={i} part={p} />;
            case 'error': return <ErrorPart key={i} part={p} onRetry={onRegenerate} />;
          }
        })}
        {msg.status === 'stopped' && (
          <div className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1 text-xs text-ink-400"><Square className="h-3 w-3 fill-current" /> Generation stopped</div>
        )}
        {!streaming && (
          <div className={cn('flex items-center gap-0.5 transition-opacity', isLast ? 'opacity-100' : 'opacity-0 hover:opacity-100')}>
            <IconAction label={copied ? 'Copied' : 'Copy'} onClick={() => copy(plain)}>{copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}</IconAction>
            <IconAction label="Good response" active={msg.rating === 'up'} onClick={() => onRate('up')}><ThumbsUp className={cn('h-3.5 w-3.5', msg.rating === 'up' && 'fill-current')} /></IconAction>
            <IconAction label="Bad response" active={msg.rating === 'down'} onClick={() => onRate('down')}><ThumbsDown className={cn('h-3.5 w-3.5', msg.rating === 'down' && 'fill-current')} /></IconAction>
            {isLast && <IconAction label="Regenerate" onClick={onRegenerate}><RefreshCw className="h-3.5 w-3.5" /></IconAction>}
            <span className="ml-2 text-[11px] text-ink-600">{msg.model}</span>
            {msg.rating && <span className="ml-2 text-[11px] text-ink-500 animate-fade-in">Thanks for the feedback</span>}
          </div>
        )}
      </div>
    </div>
  );
}
