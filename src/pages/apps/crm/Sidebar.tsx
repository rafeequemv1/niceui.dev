import { useState } from 'react';
import { Building2, Check, CheckSquare, ChevronsUpDown, LayoutDashboard, Moon, PanelLeft, Search, Settings, StickyNote, Sun, Target, Users, Zap, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { ME } from './data';
import { recordName, useCrm, type ObjectKey } from './store';
import { Avatar, Logo, Menu, MenuItem } from './ui';

export const OBJECTS: { key: ObjectKey; label: string; icon: LucideIcon }[] = [
  { key: 'people', label: 'People', icon: Users },
  { key: 'companies', label: 'Companies', icon: Building2 },
  { key: 'opportunities', label: 'Opportunities', icon: Target },
  { key: 'tasks', label: 'Tasks', icon: CheckSquare },
  { key: 'notes', label: 'Notes', icon: StickyNote },
  { key: 'workflows', label: 'Workflows', icon: Zap },
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
];

type Props = {
  current: ObjectKey;
  collapsed: boolean;
  onCollapse: () => void;
  onSearch: () => void;
  theme: 'light' | 'dark';
  onTheme: () => void;
  onSettings: () => void;
};

export function Sidebar({ current, collapsed, onCollapse, onSearch, theme, onTheme, onSettings }: Props) {
  const crm = useCrm();
  const [ws, setWs] = useState(false);
  const count: Partial<Record<ObjectKey, number>> = { people: crm.people.length, companies: crm.companies.length, opportunities: crm.opps.length, tasks: crm.tasks.filter((t) => !t.done).length, notes: crm.notes.length };
  const item = (active: boolean) =>
    cn('flex h-7 w-full items-center gap-2 rounded-md px-2 text-[13px] transition-colors', active ? 'bg-[var(--hover)] font-medium text-[var(--strong)]' : 'text-[var(--fg)] hover:bg-[var(--hover)]', collapsed && 'justify-center px-0');

  return (
    <nav aria-label="CRM" className={cn('flex h-full shrink-0 flex-col border-r border-[var(--line)] bg-[var(--side)] px-2 py-2 transition-[width] duration-300 ease-smooth', collapsed ? 'w-[52px]' : 'w-[228px]')}>
      <div className="relative flex items-center gap-1">
        <button onClick={() => setWs((o) => !o)} aria-haspopup="menu" aria-expanded={ws} className={cn('flex h-8 min-w-0 flex-1 items-center gap-2 rounded-md px-1.5 hover:bg-[var(--hover)]', collapsed && 'justify-center px-0')}>
          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-[5px] bg-[var(--accent)] text-[11px] font-bold text-white">M</span>
          {!collapsed && (
            <>
              <span className="truncate text-[13px] font-semibold text-[var(--strong)]">Meridian</span>
              <ChevronsUpDown className="ml-auto h-3.5 w-3.5 shrink-0 text-[var(--mute)]" />
            </>
          )}
        </button>
        {!collapsed && (
          <button onClick={onCollapse} aria-label="Collapse sidebar" className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-[var(--mute)] hover:bg-[var(--hover)] hover:text-[var(--strong)]">
            <PanelLeft className="h-4 w-4" />
          </button>
        )}
        <Menu open={ws} onClose={() => setWs(false)} className="w-[220px]">
          <p className="px-2 pb-1 pt-1.5 text-[11.5px] text-[var(--mute)]">{ME.name}’s workspaces</p>
          <MenuItem active hint={<Check className="h-3.5 w-3.5 text-[var(--accent)]" />} onClick={() => setWs(false)}>Meridian</MenuItem>
          <MenuItem onClick={() => { setWs(false); crm.toast('Sandbox workspaces are a paid feature in this demo'); }}>Meridian Sandbox</MenuItem>
          <div className="my-1 h-px bg-[var(--line)]" />
          <MenuItem icon={theme === 'light' ? Moon : Sun} onClick={() => { setWs(false); onTheme(); }}>{theme === 'light' ? 'Dark mode' : 'Light mode'}</MenuItem>
        </Menu>
      </div>

      <button onClick={onSearch} className={cn(item(false), 'mt-1 text-[var(--mute)]')} aria-label="Search (Ctrl K)" title="Search">
        <Search className="h-4 w-4 shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1 text-left">Search</span>
            <kbd className="rounded border border-[var(--line)] px-1 font-mono text-[10px] text-[var(--mute)]">⌘K</kbd>
          </>
        )}
      </button>

      {collapsed && (
        <button onClick={onCollapse} aria-label="Expand sidebar" className={cn(item(false), 'text-[var(--mute)]')} title="Expand sidebar">
          <PanelLeft className="h-4 w-4" />
        </button>
      )}

      {!collapsed && crm.favorites.length > 0 && (
        <div className="mt-4">
          <p className="px-2 pb-1 text-[11.5px] font-medium text-[var(--mute)]">Favorites</p>
          {crm.favorites.map((f) => {
            const name = recordName(crm, f) ?? '';
            const company = f.kind === 'company' ? crm.companies.find((c) => c.id === f.id) : undefined;
            return (
              <button key={f.kind + f.id} onClick={() => crm.openRecord(f)} className={item(false)}>
                {f.kind === 'person' ? <Avatar name={name} size={16} /> : company ? <Logo company={company} size={16} /> : <Target className="h-4 w-4 text-[var(--mute)]" />}
                <span className="truncate">{name}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-4">
        {!collapsed && <p className="px-2 pb-1 text-[11.5px] font-medium text-[var(--mute)]">Workspace</p>}
        {OBJECTS.map((o) => (
          <button key={o.key} onClick={() => crm.go(o.key)} aria-current={current === o.key ? 'page' : undefined} className={item(current === o.key)} title={collapsed ? o.label : undefined}>
            <o.icon className="h-4 w-4 shrink-0 text-[var(--mute)]" />
            {!collapsed && (
              <>
                <span className="flex-1 truncate text-left">{o.label}</span>
                {count[o.key] !== undefined && <span className="text-[11.5px] tabular-nums text-[var(--faint)]">{count[o.key]}</span>}
              </>
            )}
          </button>
        ))}
      </div>

      <div className="mt-auto space-y-0.5">
        <button onClick={onSettings} className={item(false)} title={collapsed ? 'Settings' : undefined}>
          <Settings className="h-4 w-4 shrink-0 text-[var(--mute)]" />
          {!collapsed && <span className="flex-1 text-left">Settings</span>}
        </button>
        <div className={cn('flex h-8 items-center gap-2 px-1.5', collapsed && 'justify-center px-0')}>
          <Avatar name={ME.name} color={ME.color} size={20} />
          {!collapsed && <span className="min-w-0 flex-1 truncate text-[13px] text-[var(--fg)]">{ME.name}</span>}
          {!collapsed && (
            <button onClick={onTheme} aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'} className="grid h-6 w-6 place-items-center rounded-md text-[var(--mute)] hover:bg-[var(--hover)] hover:text-[var(--strong)]">
              {theme === 'light' ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
