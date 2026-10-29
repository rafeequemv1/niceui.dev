import { useState, type ComponentType } from 'react';
import { ChevronRight, File, FileCode, FileText, Folder, FolderOpen, Image } from 'lucide-react';
import { cn } from '@/lib/cn';

export type TreeNode = { name: string; children?: TreeNode[] };

const ICONS: Record<string, { icon: ComponentType<{ className?: string }>; color: string }> = {
  tsx: { icon: FileCode, color: 'text-sky-400' },
  ts: { icon: FileCode, color: 'text-brand-400' },
  css: { icon: FileCode, color: 'text-teal-300' },
  json: { icon: FileText, color: 'text-amber-300' },
  md: { icon: FileText, color: 'text-ink-300' },
  png: { icon: Image, color: 'text-emerald-400' },
  svg: { icon: Image, color: 'text-amber-400' },
};

function fileIcon(name: string) {
  const ext = name.split('.').pop() ?? '';
  return ICONS[ext] ?? { icon: File, color: 'text-ink-400' };
}

export type FileTreeProps = {
  data: TreeNode[];
  defaultExpanded?: string[];
  onSelect?: (path: string) => void;
  className?: string;
};

export function FileTree({ data, defaultExpanded = [], onSelect, className }: FileTreeProps) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(defaultExpanded));
  const [selected, setSelected] = useState<string | null>(null);

  const toggle = (path: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });

  const render = (nodes: TreeNode[], parent: string, depth: number, visible: boolean) => (
    <ul role={depth === 0 ? 'tree' : 'group'}>
      {nodes.map((node, i) => {
        const path = `${parent}/${node.name}`;
        const isDir = !!node.children;
        const open = expanded.has(path);
        const { icon: Icon, color } = isDir ? { icon: open ? FolderOpen : Folder, color: 'text-brand-300' } : fileIcon(node.name);
        return (
          <li key={path} role="treeitem" aria-expanded={isDir ? open : undefined} aria-selected={selected === path}>
            <button
              onClick={() => {
                if (isDir) toggle(path);
                setSelected(path);
                onSelect?.(path);
              }}
              tabIndex={visible ? 0 : -1}
              style={{ paddingLeft: depth * 16 + 8, transitionDelay: visible ? `${i * 25}ms` : '0ms' }}
              className={cn(
                'focus-ring relative flex h-8 w-full items-center gap-1.5 rounded-lg pr-2 text-left text-[13px] transition-all duration-300 ease-smooth',
                visible ? 'translate-x-0 opacity-100' : '-translate-x-1 opacity-0',
                selected === path ? 'bg-brand-500/15 text-ink-50 shadow-[inset_0_0_0_1px_rgba(56,189,248,0.25)]' : 'text-ink-300 hover:bg-white/[0.04] hover:text-ink-100',
              )}
            >
              <ChevronRight
                className={cn('h-3.5 w-3.5 shrink-0 text-ink-500 transition-transform duration-300 ease-spring', !isDir && 'invisible', open && 'rotate-90')}
              />
              <Icon className={cn('h-4 w-4 shrink-0', color)} />
              <span className="truncate">{node.name}</span>
            </button>
            {isDir && (
              <div className={cn('grid transition-[grid-template-rows] duration-300 ease-smooth', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
                <div className="relative min-h-0 overflow-hidden">
                  <span
                    className="absolute bottom-1 top-0 w-px bg-white/[0.07] transition-colors"
                    style={{ left: depth * 16 + 15 }}
                    aria-hidden
                  />
                  {render(node.children!, path, depth + 1, visible && open)}
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  return <div className={cn('select-none', className)}>{render(data, '', 0, true)}</div>;
}

const TREE: TreeNode[] = [
  {
    name: 'src',
    children: [
      {
        name: 'components',
        children: [{ name: 'Button.tsx' }, { name: 'Dock.tsx' }, { name: 'ToastStack.tsx' }],
      },
      { name: 'lib', children: [{ name: 'cn.ts' }, { name: 'motion.ts' }] },
      { name: 'App.tsx' },
      { name: 'index.css' },
    ],
  },
  { name: 'public', children: [{ name: 'favicon.svg' }, { name: 'og-image.png' }] },
  { name: 'package.json' },
  { name: 'README.md' },
  { name: '.gitignore' },
];

export function FileTreeDemo() {
  const [path, setPath] = useState('/src/components/Dock.tsx');
  return (
    <div className="mx-auto w-full max-w-sm overflow-hidden rounded-2xl bg-ink-900 shadow-card">
      <div className="flex items-center gap-1.5 border-b border-white/5 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-ink-700" />
        <span className="h-2.5 w-2.5 rounded-full bg-ink-700" />
        <span className="h-2.5 w-2.5 rounded-full bg-ink-700" />
        <span className="ml-2 text-xs font-medium text-ink-400">lumen-app</span>
      </div>
      <FileTree data={TREE} defaultExpanded={['/src', '/src/components']} onSelect={setPath} className="max-h-[300px] overflow-y-auto p-2" />
      <div className="border-t border-white/5 px-4 py-2 font-mono text-[11px] text-ink-500">
        <span key={path} className="inline-block animate-fade-in">{path}</span>
      </div>
    </div>
  );
}
