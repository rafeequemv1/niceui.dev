import { useEffect, useRef, useState } from 'react';
import { Brain, Check, Pencil, Plus, Sparkles, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/cn';

export type MemoryGroup = 'Preferences' | 'Projects' | 'Facts';
export type Memory = { id: string; text: string; group: MemoryGroup };

export type MemoryPanelProps = {
  initial: Memory[];
  /** Pass a new memory to have the panel learn it, with the "Memory updated" pill. */
  incoming?: Memory | null;
  onChange?: (memories: Memory[]) => void;
  className?: string;
};

const GROUPS: MemoryGroup[] = ['Preferences', 'Projects', 'Facts'];
const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function MemoryPanel({ initial, incoming, onChange, className }: MemoryPanelProps) {
  const [items, setItems] = useState(initial);
  const [enabled, setEnabled] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [fresh, setFresh] = useState<string | null>(null);
  const [pill, setPill] = useState(false);
  const [forgot, setForgot] = useState<{ memory: Memory; index: number } | null>(null);
  const [adding, setAdding] = useState(false);
  const [newText, setNewText] = useState('');
  const [newGroup, setNewGroup] = useState<MemoryGroup>('Preferences');
  const timers = useRef<number[]>([]);
  const later = (ms: number, f: () => void) => void timers.current.push(window.setTimeout(f, ms));
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => onChange?.(items), [items]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!incoming || !enabled) return;
    setItems((all) => (all.some((m) => m.id === incoming.id) ? all : [...all, incoming]));
    setFresh(incoming.id);
    setPill(true);
    later(2800, () => setPill(false));
    later(4200, () => setFresh((f) => (f === incoming.id ? null : f)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incoming]);

  const forget = (m: Memory) => {
    const index = items.findIndex((x) => x.id === m.id);
    setItems((all) => all.filter((x) => x.id !== m.id));
    setForgot({ memory: m, index });
    later(4500, () => setForgot((f) => (f?.memory.id === m.id ? null : f)));
  };
  const undo = () => {
    if (!forgot) return;
    setItems((all) => {
      const next = [...all];
      next.splice(Math.min(forgot.index, next.length), 0, forgot.memory);
      return next;
    });
    setForgot(null);
  };
  const save = (id: string) => {
    const text = draft.trim();
    if (text) setItems((all) => all.map((m) => (m.id === id ? { ...m, text } : m)));
    setEditing(null);
  };
  const add = () => {
    const text = newText.trim();
    if (!text) return;
    const m = { id: `m${Date.now()}`, text, group: newGroup };
    setItems((all) => [...all, m]);
    setFresh(m.id);
    setNewText('');
    setAdding(false);
    later(2500, () => setFresh((f) => (f === m.id ? null : f)));
  };

  return (
    <div className={cn('relative w-full overflow-hidden rounded-2xl bg-ink-900 shadow-card', className)}>
      <div className="flex items-center gap-3 border-b border-white/5 px-4 py-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-ink-200 shadow-hairline">
          <Brain className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-ink-100">Memory</p>
            <span
              className={cn(
                'flex items-center gap-1 rounded-full bg-brand-500/15 px-2 py-0.5 text-[10px] font-medium text-brand-200 shadow-[0_0_0_1px_rgba(56,189,248,0.3)] transition-all duration-500 ease-spring',
                pill ? 'scale-100 opacity-100' : 'pointer-events-none scale-75 opacity-0',
              )}
              role="status"
            >
              <Sparkles className="h-2.5 w-2.5" /> Memory updated
            </span>
          </div>
          <p className="truncate text-xs text-ink-500">{enabled ? `${items.length} things I remember about you` : 'Off · nothing new is saved or used'}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Use memory"
          onClick={() => setEnabled((e) => !e)}
          className={cn('focus-ring relative h-5 w-9 shrink-0 rounded-full transition-colors duration-300', enabled ? 'bg-brand-500' : 'bg-ink-700')}
        >
          <span className={cn('absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-300 ease-spring', enabled && 'translate-x-4')} />
        </button>
      </div>

      <div className={cn('max-h-[360px] overflow-y-auto px-2 py-2 transition-all duration-500 [scrollbar-width:thin]', !enabled && 'pointer-events-none opacity-40 grayscale')}>
        {GROUPS.map((g) => {
          const list = items.filter((m) => m.group === g);
          if (!list.length) return null;
          return (
            <div key={g} className="mb-1">
              <p className="flex items-center justify-between px-2 pb-1 pt-2 text-[10.5px] font-medium uppercase tracking-[0.12em] text-ink-500">
                {g}
                <span className="font-mono tabular-nums tracking-normal">{list.length}</span>
              </p>
              <ul>
                {list.map((m) => (
                  <li
                    key={m.id}
                    className={cn(
                      'group flex items-center gap-2 rounded-lg px-2 py-1.5 transition-all duration-700',
                      fresh === m.id ? 'bg-brand-500/[0.09] shadow-[0_0_0_1px_rgba(56,189,248,0.35)]' : 'hover:bg-white/[0.03]',
                      fresh === m.id && !reducedMotion() && 'animate-fade-up',
                    )}
                  >
                    <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', fresh === m.id ? 'bg-brand-400' : 'bg-ink-600')} />
                    {editing === m.id ? (
                      <input
                        autoFocus
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') save(m.id);
                          if (e.key === 'Escape') setEditing(null);
                        }}
                        onBlur={() => save(m.id)}
                        aria-label="Edit memory"
                        className="min-w-0 flex-1 rounded-md bg-ink-950/70 px-2 py-1 text-sm text-ink-50 shadow-[0_0_0_1px_rgba(56,189,248,0.5)] outline-none"
                      />
                    ) : (
                      <span className="min-w-0 flex-1 text-sm text-ink-200">{m.text}</span>
                    )}
                    {fresh === m.id && editing !== m.id && <span className="shrink-0 rounded-full bg-brand-500/15 px-1.5 py-px text-[10px] font-medium text-brand-300">New</span>}
                    {editing !== m.id && (
                      <span className="flex shrink-0 items-center opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(m.id);
                            setDraft(m.text);
                          }}
                          aria-label={`Edit “${m.text}”`}
                          className="focus-ring flex h-6 w-6 items-center justify-center rounded-md text-ink-500 transition-colors hover:bg-white/5 hover:text-ink-100"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => forget(m)}
                          aria-label={`Forget “${m.text}”`}
                          className="focus-ring flex h-6 w-6 items-center justify-center rounded-md text-ink-500 transition-colors hover:bg-rose-500/10 hover:text-rose-300"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="border-t border-white/5 p-2">
        {adding ? (
          <div className="space-y-2 rounded-xl bg-ink-950/50 p-2 shadow-hairline">
            <input
              autoFocus
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') add();
                if (e.key === 'Escape') setAdding(false);
              }}
              placeholder="Something I should remember…"
              aria-label="New memory"
              className="w-full rounded-lg bg-transparent px-2 py-1.5 text-sm text-ink-50 outline-none placeholder:text-ink-500"
            />
            <div className="flex flex-wrap items-center gap-1.5">
              {GROUPS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setNewGroup(g)}
                  className={cn('focus-ring rounded-full px-2 py-0.5 text-[11px] transition-colors', newGroup === g ? 'bg-white/10 text-ink-50' : 'text-ink-500 hover:text-ink-200')}
                >
                  {g}
                </button>
              ))}
              <span className="ml-auto flex gap-1">
                <button type="button" onClick={() => setAdding(false)} aria-label="Cancel" className="focus-ring flex h-6 w-6 items-center justify-center rounded-md text-ink-500 hover:text-ink-100">
                  <X className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={add} aria-label="Save memory" className="focus-ring flex h-6 w-6 items-center justify-center rounded-md bg-ink-50 text-ink-950 transition-transform active:scale-90">
                  <Check className="h-3.5 w-3.5" />
                </button>
              </span>
            </div>
          </div>
        ) : (
          <button
            type="button"
            disabled={!enabled}
            onClick={() => setAdding(true)}
            className="focus-ring flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs text-ink-400 transition-colors hover:bg-white/[0.03] hover:text-ink-100 disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" /> Add a memory
          </button>
        )}
      </div>

      <div
        className={cn(
          'absolute inset-x-3 bottom-3 flex items-center gap-3 rounded-xl bg-ink-800 px-3 py-2.5 shadow-pop transition-all duration-300 ease-spring',
          forgot ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0',
        )}
        role="status"
      >
        <Trash2 className="h-3.5 w-3.5 shrink-0 text-ink-400" />
        <p className="min-w-0 flex-1 truncate text-xs text-ink-200">Forgot “{forgot?.memory.text}”</p>
        <button type="button" tabIndex={forgot ? 0 : -1} onClick={undo} className="focus-ring shrink-0 rounded-md px-2 py-1 text-xs font-medium text-brand-300 transition-colors hover:bg-brand-500/10">
          Undo
        </button>
        {forgot && <span key={forgot.memory.id} className="absolute inset-x-3 bottom-1 h-px origin-left bg-brand-400/50 [animation:memory-drain_4.5s_linear_forwards]" />}
      </div>
      <style>{'@keyframes memory-drain{from{transform:scaleX(1)}to{transform:scaleX(0)}}'}</style>
    </div>
  );
}

const SEED: Memory[] = [
  { id: 'p1', group: 'Preferences', text: 'Prefers short, direct answers' },
  { id: 'p2', group: 'Preferences', text: 'Writes in British English' },
  { id: 'p3', group: 'Preferences', text: 'Uses TypeScript and Tailwind' },
  { id: 'j1', group: 'Projects', text: 'Building Halo, a habit tracker for teams' },
  { id: 'j2', group: 'Projects', text: 'Launch email goes to 4,200 beta users' },
  { id: 'f1', group: 'Facts', text: 'Based in Lisbon (UTC+0)' },
  { id: 'f2', group: 'Facts', text: 'Team of six, two of them designers' },
];
const LEARNED: Memory = { id: 'j3', group: 'Projects', text: 'Halo launches on March 12' };

export function MemoryPanelDemo() {
  const reduce = reducedMotion();
  const [said, setSaid] = useState(reduce);
  const [incoming, setIncoming] = useState<Memory | null>(reduce ? LEARNED : null);
  useEffect(() => {
    if (reduce) return;
    const a = window.setTimeout(() => setSaid(true), 900);
    const b = window.setTimeout(() => setIncoming(LEARNED), 1900);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [reduce]);

  return (
    <div className="mx-auto grid w-full max-w-3xl items-start gap-4 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]">
      <div className="space-y-2.5 rounded-2xl bg-ink-950/40 p-3 shadow-hairline">
        <p className="ml-auto w-fit max-w-[90%] rounded-2xl rounded-br-md bg-ink-800 px-3 py-2 text-sm text-ink-100">Draft the launch email. Keep it short, please.</p>
        <p className="w-fit max-w-[90%] rounded-2xl rounded-bl-md bg-ink-900 px-3 py-2 text-sm text-ink-300 shadow-hairline">Here’s a 90-word draft for the beta list, in British English.</p>
        <div className="flex min-h-[40px] justify-end">
          {said && <p className={cn('w-fit max-w-[90%] rounded-2xl rounded-br-md bg-ink-800 px-3 py-2 text-sm text-ink-100', !reduce && 'animate-fade-up')}>Also, the launch moved to March 12.</p>}
        </div>
        <p className="flex items-center gap-1.5 px-1 text-[11px] text-ink-500">
          <Brain className="h-3 w-3" /> {incoming ? 'Saved to memory · Projects' : 'Listening for things worth remembering'}
        </p>
      </div>
      <MemoryPanel initial={SEED} incoming={incoming} />
    </div>
  );
}
