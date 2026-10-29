import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, File, FileText, Image, Music, Upload, X } from 'lucide-react';
import { cn } from '@/lib/cn';

export type UploadItem = { id: number; name: string; size: number; type: string; progress: number; leaving?: boolean };

const fmtSize = (b: number) => (b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1e3))} KB`);
const iconFor = (t: string) => (t.startsWith('image') ? Image : t.startsWith('audio') ? Music : t.includes('pdf') || t.startsWith('text') ? FileText : File);

let nextId = 1;

export type FileUploadProps = { accept?: string; maxSizeMb?: number; multiple?: boolean; defaultItems?: UploadItem[] };

export function FileUpload({ accept, maxSizeMb = 25, multiple = true, defaultItems = [] }: FileUploadProps) {
  const [items, setItems] = useState<UploadItem[]>(defaultItems);
  const [over, setOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const depth = useRef(0);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!items.some((i) => i.progress < 100 && !i.leaving)) return;
    const id = window.setInterval(() => {
      setItems((xs) => xs.map((x) => (x.progress < 100 ? { ...x, progress: Math.min(100, x.progress + 4 + Math.random() * 14 * (2e6 / Math.max(x.size, 4e5))) } : x)));
    }, 180);
    return () => window.clearInterval(id);
  }, [items]);

  const add = (files: FileList | null) => {
    if (!files) return;
    const list = Array.from(files);
    const tooBig = list.filter((f) => f.size > maxSizeMb * 1e6);
    setError(tooBig.length ? `${tooBig[0].name} is over ${maxSizeMb} MB` : null);
    const ok = list.filter((f) => f.size <= maxSizeMb * 1e6).map((f) => ({ id: nextId++, name: f.name, size: f.size, type: f.type, progress: 0 }));
    setItems((xs) => [...ok, ...xs]);
  };

  const remove = (id: number) => {
    setItems((xs) => xs.map((x) => (x.id === id ? { ...x, leaving: true } : x)));
    window.setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== id)), 300);
  };

  return (
    <div className="w-full max-w-md space-y-3">
      <div
        role="button"
        tabIndex={0}
        onClick={() => input.current?.click()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && input.current?.click()}
        onDragEnter={(e) => { e.preventDefault(); depth.current++; setOver(true); }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={() => { depth.current--; if (depth.current <= 0) setOver(false); }}
        onDrop={(e) => { e.preventDefault(); depth.current = 0; setOver(false); add(e.dataTransfer.files); }}
        className={cn(
          'focus-ring group relative flex cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border border-dashed px-6 py-9 text-center transition-all duration-300 ease-smooth',
          over ? 'scale-[1.02] border-brand-400 bg-brand-500/10 shadow-glow' : 'border-white/10 bg-ink-900 hover:border-white/20 hover:bg-ink-850',
        )}
      >
        <div className={cn('pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(56,189,248,0.25),transparent_60%)] transition-opacity duration-500', over ? 'opacity-100' : 'opacity-0')} />
        <span className={cn('relative flex h-12 w-12 items-center justify-center rounded-2xl bg-ink-800 text-ink-200 shadow-hairline transition-all duration-500 ease-spring', over ? '-translate-y-1 scale-110 bg-brand-500 text-white' : 'group-hover:-translate-y-0.5')}>
          <Upload className={cn('h-5 w-5 transition-transform duration-500 ease-spring', over && '-translate-y-0.5')} />
        </span>
        <div className="relative">
          <p className="text-sm font-medium text-ink-100">{over ? 'Drop to upload' : 'Drag files here or click to browse'}</p>
          <p className="mt-1 text-xs text-ink-500">PNG, JPG, PDF or MP3 · up to {maxSizeMb} MB</p>
        </div>
        <input ref={input} type="file" multiple={multiple} accept={accept} className="hidden" onChange={(e) => { add(e.target.files); e.target.value = ''; }} />
      </div>
      {error && <p key={error} className="animate-wiggle text-xs text-rose-400">{error}</p>}
      <div>
        {items.map((it) => {
          const Icon = iconFor(it.type);
          const done = it.progress >= 100;
          return (
            <div key={it.id} className={cn('grid transition-all duration-300 ease-smooth', it.leaving ? 'grid-rows-[0fr] scale-95 opacity-0' : 'grid-rows-[1fr]')}>
              <div className="overflow-hidden">
                <div className="mb-2 flex animate-fade-up items-center gap-3 rounded-xl bg-ink-900 p-3 shadow-card">
                  <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-500', done ? 'bg-emerald-500/15 text-emerald-300' : 'bg-ink-800 text-ink-300')}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="truncate font-medium text-ink-100">{it.name}</span>
                      <span className="shrink-0 tabular-nums text-ink-500">{done ? fmtSize(it.size) : `${Math.floor(it.progress)}%`}</span>
                    </div>
                    <div className={cn('mt-2 h-1 overflow-hidden rounded-full bg-ink-800 transition-opacity duration-500', done && 'opacity-0')}>
                      <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-sky-400 transition-[width] duration-200" style={{ width: `${it.progress}%` }} />
                    </div>
                  </div>
                  {done ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 animate-scale-in text-emerald-400" />
                  ) : null}
                  <button aria-label={`Remove ${it.name}`} onClick={() => remove(it.id)} className="focus-ring flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-white/5 hover:text-ink-100">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function FileUploadDemo() {
  return (
    <div className="flex min-h-[360px] items-start justify-center">
      <FileUpload
        defaultItems={[
          { id: -1, name: 'launch-keynote.pdf', size: 8_420_000, type: 'application/pdf', progress: 36 },
          { id: -2, name: 'hero-shot@2x.png', size: 2_810_000, type: 'image/png', progress: 100 },
        ]}
      />
    </div>
  );
}
