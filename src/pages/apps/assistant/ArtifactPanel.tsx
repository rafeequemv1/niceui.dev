import { useState, type ReactNode } from 'react';
import { Check, Code2, Copy, Download, Eye, Monitor, RotateCw, Smartphone, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { CodeBlock } from '@/components/ui/CodeBlock';
import type { Artifact } from './types';

export function ArtifactPanel({ artifact, onClose }: { artifact: Artifact; onClose: () => void }) {
  const [tab, setTab] = useState<'preview' | 'code'>('preview');
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [reload, setReload] = useState(0);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(artifact.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const download = () => {
    const url = URL.createObjectURL(new Blob([artifact.code], { type: 'text/html' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${artifact.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="flex h-full min-w-0 flex-col bg-ink-950 animate-slide-in-right">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-white/[0.06] px-3">
        <div className="min-w-0 flex-1 px-1">
          <div className="truncate text-sm font-medium text-white">{artifact.title}</div>
          <div className="font-mono text-[11px] text-ink-500">{artifact.language} · {artifact.code.split('\n').length} lines</div>
        </div>
        <div className="flex rounded-lg bg-white/[0.04] p-0.5">
          {([['preview', Eye], ['code', Code2]] as const).map(([id, Icon]) => (
            <button key={id} onClick={() => setTab(id)} className={cn('flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-all', tab === id ? 'bg-ink-800 text-white shadow-hairline' : 'text-ink-400 hover:text-ink-100')}>
              <Icon className="h-3.5 w-3.5" />{id}
            </button>
          ))}
        </div>
        <Tool label={copied ? 'Copied' : 'Copy code'} onClick={copy}>{copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}</Tool>
        <Tool label="Download" onClick={download}><Download className="h-4 w-4" /></Tool>
        <Tool label="Close" onClick={onClose}><X className="h-4 w-4" /></Tool>
      </header>

      {tab === 'preview' ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex items-center gap-2 border-b border-white/[0.06] px-3 py-2">
            <div className="flex gap-1.5">{['bg-rose-400/70', 'bg-amber-400/70', 'bg-emerald-400/70'].map((c) => <span key={c} className={cn('h-2.5 w-2.5 rounded-full', c)} />)}</div>
            <div className="mx-2 flex-1 truncate rounded-md bg-white/[0.04] px-3 py-1 font-mono text-[11px] text-ink-500">nova.app/artifact/{artifact.id}</div>
            <Tool label="Desktop" active={device === 'desktop'} onClick={() => setDevice('desktop')}><Monitor className="h-3.5 w-3.5" /></Tool>
            <Tool label="Mobile" active={device === 'mobile'} onClick={() => setDevice('mobile')}><Smartphone className="h-3.5 w-3.5" /></Tool>
            <Tool label="Reload" onClick={() => setReload((r) => r + 1)}><RotateCw className="h-3.5 w-3.5" /></Tool>
          </div>
          <div className="flex min-h-0 flex-1 justify-center overflow-auto bg-ink-900/50 p-4 dot-bg">
            <iframe
              key={reload}
              title={artifact.title}
              srcDoc={artifact.code}
              sandbox="allow-scripts"
              className={cn('h-full rounded-xl border border-white/10 bg-white shadow-card transition-all duration-500 ease-spring', device === 'mobile' ? 'w-[375px] max-w-full' : 'w-full')}
            />
          </div>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-auto p-4">
          <CodeBlock code={artifact.code} filename={`${artifact.id}.html`} language="html" maxHeight={10_000} />
        </div>
      )}
    </section>
  );
}

function Tool({ label, onClick, active, children }: { label: string; onClick: () => void; active?: boolean; children: ReactNode }) {
  return (
    <button onClick={onClick} title={label} aria-label={label} className={cn('grid h-8 w-8 place-items-center rounded-lg transition-colors', active ? 'bg-white/10 text-white' : 'text-ink-400 hover:bg-white/5 hover:text-white')}>
      {children}
    </button>
  );
}
