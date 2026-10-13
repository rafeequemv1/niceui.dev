import { useState, type ComponentType } from 'react';
import { CreditCard, Github, Mail, MessageSquare, RefreshCw, X } from 'lucide-react';
import { cn } from '@/lib/cn';

export type StackNotification = { id: number; app: string; title: string; body: string; time: string; icon: ComponentType<{ className?: string }>; tint: string };

const SEED: StackNotification[] = [
  { id: 1, app: 'Messages', title: 'Mira Chen', body: 'Pushed the new onboarding flow — take a look?', time: 'now', icon: MessageSquare, tint: 'bg-emerald-500' },
  { id: 2, app: 'GitHub', title: 'PR #482 approved', body: 'feat: morphing tabs with spring indicator', time: '4m', icon: Github, tint: 'bg-ink-700' },
  { id: 3, app: 'Mail', title: 'Stripe', body: 'Your payout of $12,480.00 is on the way.', time: '18m', icon: Mail, tint: 'bg-brand-500' },
  { id: 4, app: 'Wallet', title: 'Card used', body: 'Linear · $96.00 on Visa •• 4242', time: '1h', icon: CreditCard, tint: 'bg-amber-500' },
];

const CARD_H = 76;
const GAP = 10;

export type NotificationStackProps = { items: StackNotification[]; onDismiss: (id: number) => void; maxPeek?: number };

export function NotificationStack({ items, onDismiss, maxPeek = 3 }: NotificationStackProps) {
  const [expanded, setExpanded] = useState(false);
  const [leaving, setLeaving] = useState<number[]>([]);
  const visible = items.filter((n) => !leaving.includes(n.id));
  const height = expanded ? visible.length * (CARD_H + GAP) - GAP : CARD_H + Math.min(visible.length - 1, maxPeek - 1) * 10;

  const dismiss = (id: number) => {
    setLeaving((l) => [...l, id]);
    window.setTimeout(() => {
      onDismiss(id);
      setLeaving((l) => l.filter((x) => x !== id));
    }, 280);
  };

  return (
    <div className="w-full max-w-sm">
      <div className={cn('mb-3 flex items-center justify-between px-1 transition-opacity duration-300', expanded ? 'opacity-100' : 'pointer-events-none opacity-0')}>
        <p className="text-sm font-medium text-ink-100">Notifications</p>
        <button onClick={() => setExpanded(false)} className="focus-ring rounded-full bg-ink-850 px-3 py-1 text-xs font-medium text-ink-300 shadow-hairline transition-colors hover:text-ink-50">
          Show less
        </button>
      </div>
      <div className="relative transition-[height] duration-500 ease-smooth" style={{ height: Math.max(height, 0) }}>
        {items.map((n) => {
          const i = visible.indexOf(n);
          const gone = i === -1;
          const depth = Math.min(i, maxPeek);
          const y = expanded ? i * (CARD_H + GAP) : depth * 10;
          const scale = expanded ? 1 : 1 - depth * 0.05;
          const hidden = !expanded && i >= maxPeek;
          const Icon = n.icon;
          return (
            <div
              key={n.id}
              role="button"
              tabIndex={0}
              onClick={() => !expanded && setExpanded(true)}
              onKeyDown={(e) => e.key === 'Enter' && setExpanded((x) => !x)}
              className={cn(
                'group absolute inset-x-0 top-0 flex cursor-pointer items-center gap-3 rounded-2xl bg-ink-850/95 px-3.5 shadow-pop backdrop-blur-xl transition-all duration-500 ease-spring',
                expanded && 'cursor-default',
              )}
              style={{
                height: CARD_H,
                zIndex: 50 - (gone ? 0 : i),
                transform: gone ? `translateX(110%) scale(0.95)` : `translateY(${y}px) scale(${scale})`,
                transformOrigin: 'top center',
                opacity: gone || hidden ? 0 : expanded || depth === 0 ? 1 : 1 - depth * 0.25,
              }}
            >
              <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white', n.tint)}>
                <Icon className="h-5 w-5" />
              </span>
              <div className={cn('min-w-0 flex-1 transition-opacity duration-300', !expanded && depth > 0 && 'opacity-0')}>
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium text-ink-50">{n.title}</p>
                  <span className="shrink-0 text-[11px] text-ink-500">{n.time}</span>
                </div>
                <p className="truncate text-xs text-ink-400">{n.body}</p>
              </div>
              {(expanded || depth === 0) && (
                <button
                  aria-label="Dismiss"
                  onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                  className="focus-ring absolute -left-1.5 -top-1.5 flex h-6 w-6 scale-75 items-center justify-center rounded-full bg-ink-700 text-ink-200 opacity-0 shadow-hairline transition-all duration-200 hover:bg-ink-600 group-hover:scale-100 group-hover:opacity-100 focus-visible:scale-100 focus-visible:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>
      {!expanded && visible.length > 1 && (
        <p className="mt-4 animate-fade-in text-center text-xs text-ink-500">{visible.length} notifications · tap to expand</p>
      )}
    </div>
  );
}

export function NotificationStackDemo() {
  const [items, setItems] = useState(SEED);
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center gap-6">
      {items.length > 0 ? (
        <NotificationStack items={items} onDismiss={(id) => setItems((xs) => xs.filter((x) => x.id !== id))} />
      ) : (
        <div className="flex animate-scale-in flex-col items-center gap-3 text-sm text-ink-400">
          All caught up
          <button onClick={() => setItems(SEED)} className="focus-ring flex items-center gap-2 rounded-full bg-ink-850 px-3.5 py-1.5 text-xs font-medium text-ink-200 shadow-hairline transition-colors hover:text-ink-50">
            <RefreshCw className="h-3.5 w-3.5" /> Reset
          </button>
        </div>
      )}
    </div>
  );
}
