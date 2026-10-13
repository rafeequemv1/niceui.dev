import { useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Bell, CreditCard, Settings, Users } from 'lucide-react';
import { cn } from '@/lib/cn';
import { animateOnce } from './utils';

export type TabItem = { id: string; label: string; icon?: ReactNode };

export type TabsProps = {
  tabs: TabItem[];
  value: string;
  onChange: (id: string) => void;
  variant?: 'pill' | 'underline';
  className?: string;
};

export function Tabs({ tabs, value, onChange, variant = 'pill', className }: TabsProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [ind, setInd] = useState({ left: 0, width: 0, ready: false });

  useLayoutEffect(() => {
    const measure = () => {
      const el = refs.current[value];
      if (el) setInd((p) => ({ left: el.offsetLeft, width: el.offsetWidth, ready: p.ready || el.offsetWidth > 0 }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (listRef.current) ro.observe(listRef.current);
    return () => ro.disconnect();
  }, [value, tabs]);

  const onKey = (e: KeyboardEvent) => {
    const i = tabs.findIndex((t) => t.id === value);
    let next = -1;
    if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
    if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = tabs.length - 1;
    if (next < 0) return;
    e.preventDefault();
    onChange(tabs[next].id);
    refs.current[tabs[next].id]?.focus();
  };

  const pill = variant === 'pill';

  return (
    <div
      ref={listRef}
      role="tablist"
      onKeyDown={onKey}
      className={cn(
        'relative inline-flex items-center',
        pill ? 'gap-0.5 rounded-xl bg-ink-900 p-1 shadow-hairline' : 'gap-1 border-b border-white/5',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'absolute',
          pill ? 'inset-y-1 rounded-lg bg-ink-800 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_2px_8px_rgba(0,0,0,0.4)]' : '-bottom-px h-0.5 rounded-full bg-brand-400',
          ind.ready && 'transition-[left,width] duration-500 ease-spring',
        )}
        style={{ left: ind.left, width: ind.width, opacity: ind.ready ? 1 : 0 }}
      />
      {tabs.map((t) => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            ref={(el) => (refs.current[t.id] = el)}
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(t.id)}
            className={cn(
              'focus-ring relative z-10 inline-flex items-center gap-2 whitespace-nowrap text-sm font-medium transition-colors duration-200 active:scale-[0.97] [&_svg]:h-4 [&_svg]:w-4',
              pill ? 'h-8 rounded-lg px-3.5' : 'h-10 rounded-md px-3',
              active ? 'text-ink-50' : 'text-ink-400 hover:text-ink-200',
            )}
          >
            {t.icon && <span className={cn('transition-colors', active && !pill && 'text-brand-300')}>{t.icon}</span>}
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

const SETTINGS = [
  { id: 'general', label: 'General', icon: <Settings /> },
  { id: 'team', label: 'Team', icon: <Users /> },
  { id: 'billing', label: 'Billing', icon: <CreditCard /> },
  { id: 'alerts', label: 'Alerts', icon: <Bell /> },
];

const PANELS: Record<string, { title: string; body: string; rows: [string, string][] }> = {
  general: { title: 'Workspace', body: 'Name, URL and default region.', rows: [['Name', 'Acme Inc.'], ['URL', 'acme.lumen.dev'], ['Region', 'Frankfurt (eu-central-1)']] },
  team: { title: 'Members', body: '8 people have access to this workspace.', rows: [['Owners', '2'], ['Admins', '3'], ['Members', '3']] },
  billing: { title: 'Plan', body: 'Pro · renews on Mar 14, 2025.', rows: [['Seats', '8 × $24'], ['Usage', '$38.20'], ['Total', '$230.20 / mo']] },
  alerts: { title: 'Notifications', body: 'Where we reach you about deployments.', rows: [['Email', 'On'], ['Slack', '#deploys'], ['SMS', 'Off']] },
};

export function TabsDemo() {
  const [tab, setTab] = useState('general');
  const [range, setRange] = useState('7d');
  const order = SETTINGS.map((s) => s.id);
  const [dir, setDir] = useState(1);
  const panel = PANELS[tab];

  const change = (id: string) => {
    setDir(order.indexOf(id) >= order.indexOf(tab) ? 1 : -1);
    setTab(id);
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-8">
      <Tabs
        variant="underline"
        value={range}
        onChange={setRange}
        tabs={[
          { id: '24h', label: 'Last 24h' },
          { id: '7d', label: '7 days' },
          { id: '30d', label: '30 days' },
          { id: '90d', label: 'Quarter' },
        ]}
      />
      <div className="w-full">
        <div className="flex justify-center">
          <Tabs tabs={SETTINGS} value={tab} onChange={change} />
        </div>
        <div className="mt-4 overflow-hidden rounded-2xl bg-ink-900 shadow-card">
          <div
            key={tab}
            className="p-5"
            ref={(el) =>
              animateOnce(
                el,
                [
                  { opacity: 0, transform: `translateX(${dir * 24}px)`, filter: 'blur(4px)' },
                  { opacity: 1, transform: 'translateX(0)', filter: 'blur(0)' },
                ],
                { duration: 420, easing: 'cubic-bezier(0.16,1,0.3,1)' },
              )
            }
          >
            <p className="text-sm font-medium text-ink-50">{panel.title}</p>
            <p className="mt-0.5 text-sm text-ink-400">{panel.body}</p>
            <dl className="mt-4 divide-y divide-white/5">
              {panel.rows.map(([k, v]) => (
                <div key={k} className="flex justify-between py-2.5 text-sm">
                  <dt className="text-ink-400">{k}</dt>
                  <dd className="font-medium text-ink-100">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
