import { useMemo, useRef, useState } from 'react';
import { MessageSquare, MoreHorizontal, PanelLeftClose, Pencil, Pin, PinOff, Plus, Search, Sparkle, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useClickOutside } from '@/components/ui/motion/hooks';
import type { Conversation } from './types';

type Props = {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string | null) => void;
  onRename: (id: string, title: string) => void;
  onPin: (id: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
};

const DAY = 86_400_000;

function group(list: Conversation[]) {
  const now = Date.now();
  const sorted = [...list].sort((a, b) => b.updatedAt - a.updatedAt);
  const groups: { label: string; items: Conversation[] }[] = [
    { label: 'Pinned', items: sorted.filter((c) => c.pinned) },
    { label: 'Today', items: sorted.filter((c) => !c.pinned && now - c.updatedAt < DAY) },
    { label: 'Previous 7 days', items: sorted.filter((c) => !c.pinned && now - c.updatedAt >= DAY && now - c.updatedAt < 7 * DAY) },
    { label: 'Older', items: sorted.filter((c) => !c.pinned && now - c.updatedAt >= 7 * DAY) },
  ];
  return groups.filter((g) => g.items.length > 0);
}

export function Sidebar({ conversations, activeId, onSelect, onRename, onPin, onDelete, onClose }: Props) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? conversations.filter((c) => c.title.toLowerCase().includes(q)) : conversations;
  }, [conversations, query]);
  const groups = group(filtered);

  return (
    <aside className="flex h-full w-[272px] flex-col border-r border-white/[0.06] bg-ink-950">
      <div className="flex items-center justify-between px-3 pb-2 pt-3">
        <div className="flex items-center gap-2 px-1">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-brand-400 to-sky-600 text-white"><Sparkle className="h-3.5 w-3.5 fill-current" /></span>
          <span className="text-sm font-semibold tracking-tight text-white">Nova</span>
        </div>
        <button onClick={onClose} aria-label="Close sidebar" className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-white/5 hover:text-white">
          <PanelLeftClose className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-2 px-3">
        <button onClick={() => onSelect(null)} className="group flex w-full items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm font-medium text-ink-100 transition-all hover:border-white/15 hover:bg-white/[0.06]">
          <Plus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" /> New chat
          <kbd className="ml-auto rounded border border-white/10 px-1.5 font-mono text-[10px] text-ink-500">⌘K</kbd>
        </button>
        <label className="flex items-center gap-2 rounded-xl bg-white/[0.03] px-3 py-2 text-ink-500 focus-within:ring-1 focus-within:ring-white/15">
          <Search className="h-3.5 w-3.5" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search chats" className="w-full bg-transparent text-sm text-ink-100 outline-none placeholder:text-ink-500" />
          {query && <button onClick={() => setQuery('')} aria-label="Clear search"><X className="h-3.5 w-3.5 hover:text-white" /></button>}
        </label>
      </div>

      <nav className="mt-3 flex-1 space-y-4 overflow-y-auto px-2 pb-4">
        {groups.length === 0 && <p className="px-3 py-6 text-center text-xs text-ink-500">{query ? 'No chats match your search' : 'No conversations yet'}</p>}
        {groups.map((g) => (
          <div key={g.label}>
            <div className="px-3 pb-1 text-[11px] font-medium uppercase tracking-wider text-ink-600">{g.label}</div>
            {g.items.map((c) => (
              <ChatRow key={c.id} c={c} active={c.id === activeId} onSelect={() => onSelect(c.id)} onRename={(t) => onRename(c.id, t)} onPin={() => onPin(c.id)} onDelete={() => onDelete(c.id)} />
            ))}
          </div>
        ))}
      </nav>

      <div className="border-t border-white/[0.06] p-3">
        <div className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-white/5">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-amber-300 to-rose-400 text-xs font-semibold text-ink-950">AL</span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-ink-100">Alex Lindqvist</div>
            <div className="text-[11px] text-ink-500">Pro plan</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function ChatRow({ c, active, onSelect, onRename, onPin, onDelete }: { c: Conversation; active: boolean; onSelect: () => void; onRename: (t: string) => void; onPin: () => void; onDelete: () => void }) {
  const [menu, setMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [draft, setDraft] = useState(c.title);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside([ref], menu, () => { setMenu(false); setConfirm(false); });

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => { onRename(draft); setEditing(false); }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { onRename(draft); setEditing(false); }
          if (e.key === 'Escape') { setDraft(c.title); setEditing(false); }
        }}
        className="w-full rounded-lg bg-ink-800 px-3 py-2 text-sm text-white outline-none ring-1 ring-brand-500/50"
      />
    );
  }

  return (
    <div ref={ref} className="group relative">
      <button
        onClick={onSelect}
        className={cn('flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors', active ? 'bg-white/[0.08] text-white' : 'text-ink-300 hover:bg-white/[0.04] hover:text-ink-100')}
      >
        <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-50" />
        <span className="truncate pr-6">{c.title}</span>
      </button>
      <button
        onClick={() => setMenu((m) => !m)}
        aria-label="Chat options"
        className={cn('absolute right-1 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-md text-ink-400 transition-opacity hover:bg-white/10 hover:text-white', menu ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus:opacity-100')}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {menu && (
        <div className="absolute right-0 top-9 z-30 w-44 rounded-xl border border-white/10 bg-ink-900 p-1 shadow-pop animate-scale-in">
          <MenuItem icon={Pencil} label="Rename" onClick={() => { setMenu(false); setDraft(c.title); setEditing(true); }} />
          <MenuItem icon={c.pinned ? PinOff : Pin} label={c.pinned ? 'Unpin' : 'Pin'} onClick={() => { setMenu(false); onPin(); }} />
          {confirm ? (
            <MenuItem icon={Trash2} label="Confirm delete" danger onClick={() => { setMenu(false); onDelete(); }} />
          ) : (
            <MenuItem icon={Trash2} label="Delete" danger onClick={() => setConfirm(true)} />
          )}
        </div>
      )}
    </div>
  );
}

function MenuItem({ icon: Icon, label, onClick, danger }: { icon: typeof Pin; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick} className={cn('flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm transition-colors', danger ? 'text-rose-400 hover:bg-rose-500/10' : 'text-ink-200 hover:bg-white/5')}>
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );
}
