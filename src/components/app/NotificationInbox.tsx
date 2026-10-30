import { useEffect, useRef, useState } from 'react';
import { Archive, AtSign, Bell, CheckCheck, GitPullRequest, MessageSquare, UserPlus } from 'lucide-react';
import { cn } from '@/lib/cn';

type Note = { id: number; kind: 'mention' | 'comment' | 'review' | 'invite'; who: string; text: string; time: string; day: 'Today' | 'Yesterday'; read: boolean };

const ICON = { mention: AtSign, comment: MessageSquare, review: GitPullRequest, invite: UserPlus };
const START: Note[] = [
  { id: 1, kind: 'mention', who: 'Jonas Weber', text: 'mentioned you in “Q4 launch plan”', time: '9:42', day: 'Today', read: false },
  { id: 2, kind: 'review', who: 'Priya Raman', text: 'requested your review on #482 Billing settings', time: '8:15', day: 'Today', read: false },
  { id: 3, kind: 'comment', who: 'Lena Brandt', text: 'commented: “Shipping the new onboarding Thursday?”', time: 'Mon', day: 'Yesterday', read: true },
  { id: 4, kind: 'invite', who: 'Diego Alvarez', text: 'joined the Design team', time: 'Mon', day: 'Yesterday', read: true },
];

type Tab = 'all' | 'mentions' | 'unread';

export function NotificationInbox({ initial = START, defaultOpen = true, live = true }: { initial?: Note[]; defaultOpen?: boolean; live?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const [tab, setTab] = useState<Tab>('all');
  const [notes, setNotes] = useState(initial);
  const [undo, setUndo] = useState<Note | null>(null);
  const undoTimer = useRef(0);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!live || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setTimeout(() => setNotes((n) => [{ id: 99, kind: 'mention', who: 'Aiko Tanaka', text: 'mentioned you in “Design review notes”', time: 'now', day: 'Today', read: false }, ...n]), 2200);
    return () => clearTimeout(id);
  }, [live]);
  useEffect(() => () => clearTimeout(undoTimer.current), []);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !wrap.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const unread = notes.filter((n) => !n.read).length;
  const shown = notes.filter((n) => (tab === 'mentions' ? n.kind === 'mention' : tab === 'unread' ? !n.read : true));
  const archive = (n: Note) => {
    setNotes((list) => list.filter((x) => x.id !== n.id));
    setUndo(n);
    clearTimeout(undoTimer.current);
    undoTimer.current = window.setTimeout(() => setUndo(null), 4000);
  };

  return (
    <div ref={wrap} className="relative flex w-full max-w-sm flex-col items-end">
      <button onClick={() => setOpen((o) => !o)} aria-label={`Notifications, ${unread} unread`} aria-expanded={open} className="focus-ring relative grid h-10 w-10 place-items-center rounded-xl bg-ink-900 text-ink-200 shadow-card transition-colors hover:text-ink-50">
        <Bell className="h-[18px] w-[18px]" />
        {unread > 0 && <span key={unread} className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand-500 px-1 text-[10px] font-semibold text-white ring-2 ring-ink-950 animate-scale-in">{unread}</span>}
      </button>

      <div className={cn('mt-2 w-full origin-top-right overflow-hidden rounded-2xl bg-ink-900 shadow-pop transition-all duration-300 ease-smooth', open ? 'scale-100 opacity-100' : 'pointer-events-none h-0 scale-95 opacity-0')}>
        <div className="flex items-center justify-between px-4 pt-4">
          <h3 className="text-sm font-semibold text-ink-50">Notifications</h3>
          <button onClick={() => setNotes((n) => n.map((x) => ({ ...x, read: true })))} disabled={!unread} className="focus-ring inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-ink-400 hover:text-ink-100 disabled:opacity-40">
            <CheckCheck className="h-3.5 w-3.5" /> Mark all read
          </button>
        </div>
        <div role="tablist" className="mt-3 flex gap-4 border-b border-white/5 px-4">
          {(['all', 'mentions', 'unread'] as Tab[]).map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={cn('focus-ring relative pb-2.5 text-xs font-medium capitalize transition-colors', tab === t ? 'text-ink-50' : 'text-ink-500 hover:text-ink-200')}>
              {t}
              {t === 'unread' && unread > 0 && <span className="ml-1 text-brand-300">{unread}</span>}
              {tab === t && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-brand-400" />}
            </button>
          ))}
        </div>
        <div className="max-h-[300px] overflow-y-auto py-1 [scrollbar-width:thin]">
          {(['Today', 'Yesterday'] as const).map((day) => {
            const items = shown.filter((n) => n.day === day);
            if (!items.length) return null;
            return (
              <div key={day}>
                <p className="px-4 pb-1 pt-3 text-[10px] font-medium uppercase tracking-wider text-ink-500">{day}</p>
                {items.map((n) => {
                  const Icon = ICON[n.kind];
                  return (
                    <div key={n.id} className="group flex items-start gap-3 px-4 py-2.5 transition-colors hover:bg-white/[0.03] animate-fade-down">
                      <span className="relative mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/5 text-ink-300">
                        <Icon className="h-4 w-4" />
                        {!n.read && <span className="absolute -left-1 top-0 h-2 w-2 rounded-full bg-brand-400" />}
                      </span>
                      <button onClick={() => setNotes((l) => l.map((x) => (x.id === n.id ? { ...x, read: true } : x)))} className="focus-ring min-w-0 flex-1 rounded text-left">
                        <p className={cn('text-sm leading-snug', n.read ? 'text-ink-400' : 'text-ink-100')}>
                          <b className="font-medium text-ink-50">{n.who}</b> {n.text}
                        </p>
                        <p className="mt-0.5 text-[11px] text-ink-500">{n.time}</p>
                      </button>
                      <button onClick={() => archive(n)} aria-label="Archive" className="focus-ring grid h-7 w-7 shrink-0 place-items-center rounded-md text-ink-500 opacity-0 transition-opacity hover:bg-white/5 hover:text-ink-100 focus:opacity-100 group-hover:opacity-100">
                        <Archive className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            );
          })}
          {!shown.length && <p className="px-4 py-10 text-center text-sm text-ink-500">Nothing here.</p>}
        </div>
        <div className={cn('flex items-center justify-between border-t border-white/5 px-4 text-xs transition-all duration-300', undo ? 'max-h-12 py-2.5 opacity-100' : 'max-h-0 py-0 opacity-0')}>
          <span className="text-ink-400">Notification archived</span>
          <button
            onClick={() => {
              if (undo) setNotes((n) => [undo, ...n].sort((a, b) => b.id - a.id));
              setUndo(null);
            }}
            className="focus-ring rounded font-medium text-brand-300 hover:text-brand-200"
          >
            Undo
          </button>
        </div>
      </div>
    </div>
  );
}

export function NotificationInboxDemo() {
  return <NotificationInbox />;
}
