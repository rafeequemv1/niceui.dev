import { useMemo, useState } from 'react';
import { ChevronRight, Search, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { Section } from './types';

type SidebarProps = {
  sections: Section[];
  activePath: string;
  onNavigate: (to: string) => void;
};

export function Sidebar({ sections, activePath, onNavigate }: SidebarProps) {
  const [query, setQuery] = useState('');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sections;
    return sections
      .map((s) => ({ ...s, entries: s.entries.filter((e) => e.name.toLowerCase().includes(q)) }))
      .filter((s) => s.entries.length > 0);
  }, [query, sections]);

  return (
    <div className="flex h-full flex-col">
      <div className="px-3 pb-3">
        <label className="group flex h-9 items-center gap-2 rounded-lg bg-ink-900 px-3 shadow-hairline transition-shadow focus-within:shadow-glow">
          <Search className="h-4 w-4 text-ink-500 transition-colors group-focus-within:text-brand-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search components"
            className="w-full bg-transparent text-sm text-ink-100 placeholder:text-ink-500 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-ink-500 hover:text-ink-200" aria-label="Clear search">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </label>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-10">
        {filtered.length === 0 && <p className="px-3 py-6 text-sm text-ink-500">No matches for "{query}"</p>}
        {filtered.map((section) => {
          const isCollapsed = collapsed[section.id] && !query;
          return (
            <div key={section.id} className="mb-4">
              <button
                onClick={() => setCollapsed((c) => ({ ...c, [section.id]: !c[section.id] }))}
                className="flex w-full items-center justify-between rounded-md px-3 py-1.5 text-xs font-medium text-ink-400 transition-colors hover:text-ink-100"
              >
                <span className="flex items-center gap-2">
                  {section.title}
                  {section.id !== 'intro' && (
                    <span className="rounded bg-white/5 px-1.5 py-px font-mono text-[10px] text-ink-500">{section.entries.length}</span>
                  )}
                </span>
                <ChevronRight className={cn('h-3.5 w-3.5 transition-transform duration-300', !isCollapsed && 'rotate-90')} />
              </button>
              <div
                className={cn(
                  'grid transition-[grid-template-rows] duration-300 ease-smooth',
                  isCollapsed ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]',
                )}
              >
                <ul className="overflow-hidden">
                  {section.entries.map((entry) => {
                    const path = `/${section.id}/${entry.slug}`;
                    const active = activePath === path;
                    return (
                      <li key={entry.slug}>
                        <button
                          onClick={() => onNavigate(path)}
                          className={cn(
                            'focus-ring group relative flex w-full items-center justify-between rounded-md py-1.5 pl-5 pr-3 text-left text-sm transition-colors',
                            active ? 'bg-white/[0.06] text-ink-50' : 'text-ink-400 hover:bg-white/[0.03] hover:text-ink-100',
                          )}
                        >
                          <span
                            className={cn(
                              'absolute left-2 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-brand-400 transition-all duration-300',
                              active ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0',
                            )}
                          />
                          <span className="truncate">{entry.name}</span>
                          {entry.badge && (
                            <span
                              className={cn(
                                'ml-2 shrink-0 rounded-full px-1.5 py-px text-[10px] font-medium',
                                entry.badge === 'New' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-amber-500/10 text-amber-300',
                              )}
                            >
                              {entry.badge}
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          );
        })}
      </nav>
    </div>
  );
}
