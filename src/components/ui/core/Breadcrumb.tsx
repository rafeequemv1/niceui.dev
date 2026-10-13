import { useEffect, useState, type ReactNode } from 'react';
import { ChevronRight, Folder, Home, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/cn';

export type Crumb = { label: string; icon?: ReactNode };

export type BreadcrumbProps = {
  items: Crumb[];
  /** Number of items before collapsing the middle. */
  maxVisible?: number;
  onNavigate?: (index: number) => void;
};

function Sep() {
  return <ChevronRight className="h-3.5 w-3.5 shrink-0 text-ink-600" aria-hidden />;
}

export function Breadcrumb({ items, maxVisible = 3, onNavigate }: BreadcrumbProps) {
  const [expanded, setExpanded] = useState(false);
  const collapse = !expanded && items.length > maxVisible;

  useEffect(() => {
    if (items.length <= maxVisible) setExpanded(false);
  }, [items.length, maxVisible]);

  const hiddenFrom = 1;
  const hiddenTo = items.length - (maxVisible - 1);

  const renderItem = (c: Crumb, i: number, delay = 0, animate = false) => {
    const last = i === items.length - 1;
    return (
      <li
        key={`${i}-${c.label}`}
        className={cn('flex items-center gap-1.5', animate && 'origin-left animate-scale-in')}
        style={animate ? { animationDelay: `${delay}ms` } : undefined}
      >
        {i > 0 && <Sep />}
        {last ? (
          <span aria-current="page" className="flex items-center gap-1.5 rounded-md bg-white/5 px-2 py-1 font-medium text-ink-50 [&_svg]:h-3.5 [&_svg]:w-3.5">
            {c.icon}
            {c.label}
          </span>
        ) : (
          <button
            onClick={() => onNavigate?.(i)}
            className="focus-ring group flex items-center gap-1.5 rounded-md px-2 py-1 text-ink-400 transition-colors hover:bg-white/5 hover:text-ink-100 active:scale-[0.97] [&_svg]:h-3.5 [&_svg]:w-3.5"
          >
            {c.icon}
            <span className="relative">
              {c.label}
              <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-ink-300 transition-transform duration-300 ease-smooth group-hover:scale-x-100" />
            </span>
          </button>
        )}
      </li>
    );
  };

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm">
        {collapse ? (
          <>
            {renderItem(items[0], 0)}
            <li className="flex items-center gap-1.5">
              <Sep />
              <button
                onClick={() => setExpanded(true)}
                aria-label={`Show ${hiddenTo - hiddenFrom} more`}
                className="focus-ring flex h-7 w-8 items-center justify-center rounded-md text-ink-400 transition-all duration-300 ease-spring hover:scale-110 hover:bg-white/5 hover:text-ink-100 active:scale-95"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </li>
            {items.slice(hiddenTo).map((c, j) => renderItem(c, hiddenTo + j))}
          </>
        ) : (
          items.map((c, i) => {
            const wasHidden = items.length > maxVisible && i >= hiddenFrom && i < hiddenTo;
            return renderItem(c, i, (i - hiddenFrom) * 70, wasHidden);
          })
        )}
      </ol>
    </nav>
  );
}

const PATH: Crumb[] = [
  { label: 'Acme', icon: <Home /> },
  { label: 'Projects', icon: <Folder /> },
  { label: 'web-app' },
  { label: 'Deployments' },
  { label: 'dpl_8f2kQx' },
  { label: 'Build logs' },
];

export function BreadcrumbDemo() {
  const [depth, setDepth] = useState(PATH.length);
  const [k, setK] = useState(0);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-6">
      <div className="w-full rounded-2xl bg-ink-900 px-4 py-3 shadow-card">
        <Breadcrumb key={k} items={PATH.slice(0, depth)} onNavigate={(i) => setDepth(i + 1)} />
      </div>
      <div className="flex items-center gap-3 text-xs text-ink-400">
        <span>Click “…” to expand, or a crumb to navigate up.</span>
        <button
          onClick={() => {
            setDepth(PATH.length);
            setK((n) => n + 1);
          }}
          className="focus-ring rounded-md px-2 py-1 font-medium text-brand-300 transition hover:bg-brand-500/10 active:scale-95"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
