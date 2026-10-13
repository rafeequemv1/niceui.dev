import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ComponentType } from 'react';
import { ArrowRight, Bell, CheckCircle2, Command, Copy, FileText, Folder, Plus, Search, Settings, Share2, User } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useEscape, usePresence } from '@/components/ui/motion/hooks';

export type CommandItem = { id: string; label: string; group: string; icon: ComponentType<{ className?: string }>; shortcut?: string[] };

const COMMANDS: CommandItem[] = [
  { id: 'new', label: 'Create new project', group: 'Actions', icon: Plus, shortcut: ['⌘', 'N'] },
  { id: 'dup', label: 'Duplicate current file', group: 'Actions', icon: Copy, shortcut: ['⌘', 'D'] },
  { id: 'share', label: 'Share with team', group: 'Actions', icon: Share2, shortcut: ['⇧', 'S'] },
  { id: 'docs', label: 'Open documentation', group: 'Navigation', icon: FileText },
  { id: 'proj', label: 'Go to Projects', group: 'Navigation', icon: Folder, shortcut: ['G', 'P'] },
  { id: 'notif', label: 'View notifications', group: 'Navigation', icon: Bell, shortcut: ['G', 'N'] },
  { id: 'profile', label: 'Edit profile', group: 'Settings', icon: User },
  { id: 'prefs', label: 'Preferences', group: 'Settings', icon: Settings, shortcut: ['⌘', ','] },
];

/** Subsequence fuzzy match. Returns a score (higher is better) or -1. */
export function fuzzyScore(text: string, query: string) {
  const t = text.toLowerCase();
  const q = query.toLowerCase().replace(/\s+/g, '');
  if (!q) return 0;
  let ti = 0, score = 0, streak = 0;
  for (const ch of q) {
    const idx = t.indexOf(ch, ti);
    if (idx === -1) return -1;
    streak = idx === ti ? streak + 1 : 0;
    score += 1 + streak * 2 - (idx - ti) * 0.1;
    ti = idx + 1;
  }
  return score;
}

export type CommandPaletteProps = { open: boolean; onClose: () => void; commands?: CommandItem[]; onRun?: (c: CommandItem) => void };

export function CommandPalette({ open, onClose, commands = COMMANDS, onRun }: CommandPaletteProps) {
  const { mounted, visible } = usePresence(open, 200);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [hl, setHl] = useState({ top: 0, height: 0 });
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const listRef = useRef<HTMLDivElement>(null);
  useEscape(open, onClose);

  const filtered = useMemo(
    () =>
      commands
        .map((c) => ({ c, s: fuzzyScore(c.label, query) }))
        .filter((x) => x.s >= 0)
        .sort((a, b) => (query ? b.s - a.s : 0))
        .map((x) => x.c),
    [commands, query],
  );
  const groups = useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    filtered.forEach((c) => map.set(c.group, [...(map.get(c.group) ?? []), c]));
    return [...map.entries()];
  }, [filtered]);
  const flat = groups.flatMap(([, items]) => items);

  useEffect(() => { if (open) { setQuery(''); setActive(0); } }, [open]);
  useEffect(() => setActive(0), [query]);
  useLayoutEffect(() => {
    const el = refs.current[active];
    if (!el) return;
    setHl({ top: el.offsetTop, height: el.offsetHeight });
    el.scrollIntoView({ block: 'nearest' });
  }, [active, flat.length, mounted]);

  if (!mounted) return null;
  let idx = -1;
  return (
    <div className="absolute inset-0 z-30 flex items-start justify-center px-4 pt-10">
      <div onClick={onClose} className={cn('absolute inset-0 bg-ink-950/70 backdrop-blur-sm transition-opacity duration-200', visible ? 'opacity-100' : 'opacity-0')} />
      <div
        role="dialog"
        aria-label="Command palette"
        className={cn(
          'relative w-full max-w-md overflow-hidden rounded-2xl bg-ink-900 shadow-pop transition-all duration-200 ease-smooth',
          visible ? 'translate-y-0 scale-100 opacity-100' : '-translate-y-2 scale-[0.97] opacity-0',
        )}
      >
        <div className="flex items-center gap-3 border-b border-white/5 px-4">
          <Search className="h-4 w-4 text-ink-400" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => (a + 1) % Math.max(1, flat.length)); }
              if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => (a - 1 + flat.length) % Math.max(1, flat.length)); }
              if (e.key === 'Enter' && flat[active]) { onRun?.(flat[active]); onClose(); }
            }}
            placeholder="Type a command or search…"
            className="h-12 flex-1 bg-transparent text-sm text-ink-50 placeholder:text-ink-500 outline-none"
          />
          <kbd className="rounded-md bg-ink-800 px-1.5 py-0.5 font-mono text-[10px] text-ink-400 shadow-hairline">ESC</kbd>
        </div>
        <div ref={listRef} className="relative max-h-72 overflow-y-auto p-1.5">
          {flat.length > 0 && (
            <div
              className="pointer-events-none absolute inset-x-1.5 rounded-lg bg-white/[0.06] shadow-hairline transition-all duration-300 ease-spring"
              style={{ top: hl.top, height: hl.height }}
            />
          )}
          {flat.length === 0 && <p className="py-10 text-center text-sm text-ink-400">No commands found.</p>}
          {groups.map(([group, items]) => (
            <div key={group} className="pb-1">
              <p className="px-2.5 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wider text-ink-500">{group}</p>
              {items.map((c) => {
                idx += 1;
                const i = idx;
                const Icon = c.icon;
                return (
                  <button
                    key={c.id}
                    ref={(el) => (refs.current[i] = el)}
                    onMouseMove={() => active !== i && setActive(i)}
                    onClick={() => { onRun?.(c); onClose(); }}
                    className={cn('relative flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition-colors', active === i ? 'text-ink-50' : 'text-ink-300')}
                  >
                    <Icon className="h-4 w-4 text-ink-400" />
                    <span className="flex-1">{c.label}</span>
                    {c.shortcut ? (
                      <span className="flex gap-1">
                        {c.shortcut.map((k) => (
                          <kbd key={k} className="flex h-5 min-w-[20px] items-center justify-center rounded bg-ink-800 px-1 font-mono text-[10px] text-ink-300 shadow-hairline">{k}</kbd>
                        ))}
                      </span>
                    ) : (
                      <ArrowRight className={cn('h-3.5 w-3.5 transition-opacity', active === i ? 'opacity-100' : 'opacity-0')} />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 border-t border-white/5 px-4 py-2 text-[11px] text-ink-500">
          <span><kbd className="font-mono text-ink-300">↑↓</kbd> navigate</span>
          <span><kbd className="font-mono text-ink-300">↵</kbd> run</span>
          <span className="ml-auto">{flat.length} commands</span>
        </div>
      </div>
    </div>
  );
}

export function CommandPaletteDemo() {
  const [open, setOpen] = useState(false);
  const [ran, setRan] = useState<CommandItem | null>(null);
  const close = useCallback(() => setOpen(false), []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen((o) => !o); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  useEffect(() => {
    if (!ran) return;
    const t = window.setTimeout(() => setRan(null), 2400);
    return () => window.clearTimeout(t);
  }, [ran]);

  return (
    <div className="relative mx-auto flex h-[400px] w-full max-w-xl flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl">
      <button
        onClick={() => setOpen(true)}
        className="focus-ring group flex items-center gap-3 rounded-xl bg-ink-850 px-4 py-2.5 text-sm text-ink-300 shadow-hairline transition-all hover:bg-ink-800 hover:text-ink-50 active:scale-[0.98]"
      >
        <Search className="h-4 w-4" /> Search commands…
        <span className="ml-6 flex items-center gap-1 rounded-md bg-ink-950/60 px-1.5 py-0.5 font-mono text-[11px] text-ink-400 shadow-hairline">
          <Command className="h-3 w-3" />K
        </span>
      </button>
      <div className="h-9">
        {ran && (
          <div key={ran.id} className="flex animate-fade-up items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 shadow-hairline">
            <CheckCircle2 className="h-3.5 w-3.5" /> Ran “{ran.label}”
          </div>
        )}
      </div>
      <CommandPalette open={open} onClose={close} onRun={setRan} />
    </div>
  );
}
