import { useCallback, useEffect, useMemo, useState } from 'react';
import { ImageOff, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/cn';
import { artwork } from '@/components/gallery/art';

export type ImageLoaderProps = {
  src: string;
  /** A tiny version of the image (e.g. 24px wide) shown blurred while the full one loads. */
  placeholder?: string;
  alt: string;
  /** Reveal style once loaded. */
  reveal?: 'blur' | 'fade' | 'scale';
  /** Show a shimmer skeleton when there is no placeholder. */
  skeleton?: boolean;
  className?: string;
  /** Demo helper: wait this long before swapping in `src` (simulates a slow network). */
  delay?: number;
  /** Demo helper: fail the first attempt to show the error state. */
  failFirst?: boolean;
};

/** Blur-up image loading: blurred preview or skeleton → sharp image, with an error state and retry. */
export function ImageLoader({ src, placeholder, alt, reveal = 'blur', skeleton = true, className, delay = 0, failFirst }: ImageLoaderProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    setStatus('loading');
    setUrl(null);
    const t = window.setTimeout(() => {
      if (failFirst && attempt === 0) {
        setStatus('error');
        return;
      }
      setUrl(src);
    }, delay);
    return () => window.clearTimeout(t);
  }, [src, delay, failFirst, attempt]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);
  const loaded = status === 'loaded';

  return (
    <div className={cn('relative isolate overflow-hidden rounded-2xl bg-ink-900', className)} aria-busy={status === 'loading'}>
      {placeholder ? (
        <img
          src={placeholder}
          alt=""
          aria-hidden
          className={cn('absolute inset-0 h-full w-full scale-110 object-cover blur-xl transition-opacity duration-700', loaded ? 'opacity-0' : 'opacity-100')}
        />
      ) : (
        skeleton &&
        !loaded &&
        status !== 'error' && (
          <div aria-hidden className="il-shimmer absolute inset-0 bg-[linear-gradient(100deg,#0b0c0e_30%,#1c1e22_50%,#0b0c0e_70%)] bg-[length:200%_100%]" />
        )
      )}

      {url && (
        <img
          src={url}
          alt={alt}
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          className={cn(
            'relative h-full w-full object-cover transition-[opacity,transform,filter] duration-700 ease-smooth motion-reduce:transition-none',
            loaded ? 'scale-100 opacity-100 blur-0' : reveal === 'scale' ? 'scale-105 opacity-0' : reveal === 'blur' ? 'opacity-0 blur-md' : 'opacity-0',
          )}
        />
      )}

      {status === 'loading' && (
        <span className="absolute bottom-3 left-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] text-ink-200 backdrop-blur" role="status">
          Loading…
        </span>
      )}

      {status === 'error' && (
        <div role="alert" className="absolute inset-0 grid place-items-center bg-ink-900">
          <div className="flex flex-col items-center gap-3 text-center">
            <ImageOff className="h-6 w-6 text-ink-400" />
            <p className="text-sm text-ink-300">Couldn&rsquo;t load this image</p>
            <button type="button" onClick={retry} className="focus-ring inline-flex items-center gap-1.5 rounded-full bg-ink-800 px-3 py-1.5 text-xs text-ink-100 hover:bg-ink-700">
              <RotateCcw className="h-3.5 w-3.5" /> Retry
            </button>
          </div>
        </div>
      )}
      <style>{`@keyframes il-shimmer{from{background-position:200% 0}to{background-position:-200% 0}}.il-shimmer{animation:il-shimmer 1.4s linear infinite}@media (prefers-reduced-motion:reduce){.il-shimmer{animation:none}}`}</style>
    </div>
  );
}

export function ImageLoaderDemo() {
  const [run, setRun] = useState(0);
  const imgs = useMemo(
    () => [
      { id: 0, kind: 'landscape' as const, reveal: 'blur' as const, label: 'Blur-up', tiny: true },
      { id: 7, kind: 'mesh' as const, reveal: 'scale' as const, label: 'Skeleton + scale', tiny: false },
      { id: 3, kind: 'landscape' as const, reveal: 'fade' as const, label: 'Error + retry', tiny: true, fail: true },
    ],
    [],
  );
  const [srcs, setSrcs] = useState<{ full: string; tiny: string }[]>([]);
  useEffect(() => {
    setSrcs(imgs.map((m) => ({ full: artwork(m.id, 720, 480, m.kind), tiny: artwork(m.id, 24, 16, m.kind) })));
  }, [imgs]);

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-3">
        {imgs.map((m, i) => (
          <figure key={`${m.id}-${run}`} className="flex flex-col gap-2">
            {srcs[i] && (
              <ImageLoader
                src={srcs[i].full}
                placeholder={m.tiny ? srcs[i].tiny : undefined}
                alt={m.label}
                reveal={m.reveal}
                delay={900 + i * 700}
                failFirst={m.fail}
                className="aspect-[3/2] w-full"
              />
            )}
            <figcaption className="text-xs text-ink-400">{m.label}</figcaption>
          </figure>
        ))}
      </div>
      <button type="button" onClick={() => setRun((r) => r + 1)} className="focus-ring inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-4 py-2 text-xs text-ink-200 shadow-card hover:text-ink-50">
        <RotateCcw className="h-3.5 w-3.5" /> Replay loading
      </button>
    </div>
  );
}
