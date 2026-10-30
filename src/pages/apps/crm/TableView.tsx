import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, Check, Minus, Plus, Type } from 'lucide-react';
import { cn } from '@/lib/cn';
import { DIRECT, FieldEditor, FieldValue, TextEditor, type Field } from './fields';

export type Sort = { key: string; dir: 1 | -1 } | null;
type Row = { id: string; name: string };

type Props<T extends Row> = {
  rows: T[];
  fields: Field[];
  leading: (r: T) => ReactNode;
  selected: Set<string>;
  setSelected: (s: Set<string>) => void;
  sort: Sort;
  onSort: (key: string) => void;
  onUpdate: (id: string, key: string, value: unknown) => void;
  onOpen: (id: string) => void;
  onNew: () => void;
  autoEdit: string | null;
  clearAutoEdit: () => void;
  nameLabel: string;
};

function Box({ on, partial, onClick, label }: { on: boolean; partial?: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={partial ? 'mixed' : on}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn('grid h-3.5 w-3.5 place-items-center rounded-[4px] border transition-colors', on || partial ? 'border-[var(--accent)] bg-[var(--accent)] text-white' : 'border-[var(--line2)] bg-[var(--bg)] hover:border-[var(--mute)]')}
    >
      {on && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
      {partial && !on && <Minus className="h-2.5 w-2.5" strokeWidth={3} />}
    </button>
  );
}

export function TableView<T extends Row>({ rows, fields, leading, selected, setSelected, sort, onSort, onUpdate, onOpen, onNew, autoEdit, clearAutoEdit, nameLabel }: Props<T>) {
  const [active, setActive] = useState<{ r: number; c: number } | null>(null);
  const [editing, setEditing] = useState<{ id: string; c: number } | null>(null);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!autoEdit) return;
    const r = rows.findIndex((x) => x.id === autoEdit);
    if (r >= 0) {
      setActive({ r, c: 0 });
      setEditing({ id: autoEdit, c: 0 });
      wrap.current?.scrollTo({ top: 0 });
    }
    clearAutoEdit();
  }, [autoEdit, rows, clearAutoEdit]);

  const all = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const some = rows.some((r) => selected.has(r.id));
  const toggle = (id: string) => {
    const n = new Set(selected);
    if (n.has(id)) n.delete(id);
    else n.add(id);
    setSelected(n);
  };

  const startEdit = (r: number, c: number) => {
    const row = rows[r];
    if (!row) return;
    if (c > 0 && DIRECT.includes(fields[c - 1].type)) return;
    setEditing({ id: row.id, c });
  };
  const stopEdit = () => {
    setEditing(null);
    requestAnimationFrame(() => wrap.current?.focus({ preventScroll: true }));
  };

  const onKey = (e: KeyboardEvent) => {
    if (editing) return;
    const cur = active ?? { r: 0, c: 0 };
    const move = (r: number, c: number) => {
      e.preventDefault();
      setActive({ r: Math.max(0, Math.min(rows.length - 1, r)), c: Math.max(0, Math.min(fields.length, c)) });
    };
    if (e.key === 'ArrowDown') move(cur.r + 1, cur.c);
    else if (e.key === 'ArrowUp') move(cur.r - 1, cur.c);
    else if (e.key === 'ArrowRight') move(cur.r, cur.c + 1);
    else if (e.key === 'ArrowLeft') move(cur.r, cur.c - 1);
    else if (e.key === 'Enter' && active) {
      e.preventDefault();
      startEdit(active.r, active.c);
    } else if (e.key === ' ' && active && rows[active.r]) {
      e.preventDefault();
      toggle(rows[active.r].id);
    } else if (e.key === 'Escape') setActive(null);
  };

  useEffect(() => {
    if (!active || !wrap.current) return;
    const cell = wrap.current.querySelector<HTMLElement>(`[data-cell="${active.r}-${active.c}"]`);
    cell?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [active]);

  const head = 'sticky top-0 h-8 border-b border-r border-[var(--line)] bg-[var(--bg)] px-2 text-left font-normal text-[var(--mute)]';
  const SortIcon = ({ k }: { k: string }) => (sort?.key === k ? sort.dir === 1 ? <ArrowUp className="h-3 w-3 text-[var(--accent)]" /> : <ArrowDown className="h-3 w-3 text-[var(--accent)]" /> : null);

  return (
    <div
      ref={wrap}
      tabIndex={0}
      onKeyDown={onKey}
      aria-label={`${nameLabel} table. Arrow keys move, Enter edits, Space selects.`}
      className="relative min-h-0 flex-1 overflow-auto overscroll-contain focus:outline-none [scrollbar-width:thin]"
    >
      <table className="w-max min-w-full border-separate border-spacing-0 text-[13px]">
        <thead>
          <tr>
            <th className={cn(head, 'left-0 z-30 w-9 min-w-9 px-0')}>
              <span className="grid place-items-center">
                <Box on={all} partial={some && !all} onClick={() => setSelected(all ? new Set() : new Set(rows.map((r) => r.id)))} label="Select all" />
              </span>
            </th>
            <th className={cn(head, 'left-9 z-30 w-[220px] min-w-[220px]')}>
              <button onClick={() => onSort('name')} className="flex w-full items-center gap-1.5 hover:text-[var(--strong)]">
                <Type className="h-3.5 w-3.5" /> {nameLabel} <SortIcon k="name" />
              </button>
            </th>
            {fields.map((f) => (
              <th key={f.key} className={cn(head, 'z-20')} style={{ width: f.w, minWidth: f.w }}>
                <button onClick={() => onSort(f.key)} className="flex w-full items-center gap-1.5 whitespace-nowrap hover:text-[var(--strong)]">
                  <f.icon className="h-3.5 w-3.5 shrink-0" /> {f.label} <SortIcon k={f.key} />
                </button>
              </th>
            ))}
            <th className={cn(head, 'z-20 w-full min-w-[60px] border-r-0')}>
              <span className="grid h-6 w-6 place-items-center rounded-md text-[var(--faint)]" aria-hidden>
                <Plus className="h-3.5 w-3.5" />
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => {
            const sel = selected.has(row.id);
            const tint = sel ? 'shadow-[inset_0_0_0_999px_var(--accent-soft)]' : '';
            const cellBase = 'relative h-9 border-b border-r border-[var(--line)] px-2 align-middle';
            const isActive = (c: number) => active?.r === r && active?.c === c;
            const ring = 'outline outline-1 -outline-offset-1 outline-[color:var(--accent)]';
            return (
              <tr key={row.id} className="group">
                <td className={cn(cellBase, 'sticky left-0 z-10 w-9 min-w-9 bg-[var(--bg)] px-0 group-hover:bg-[var(--side)]', tint)}>
                  <span className="grid place-items-center">
                    <Box on={sel} onClick={() => toggle(row.id)} label={`Select ${row.name || 'row'}`} />
                  </span>
                </td>
                <td
                  data-cell={`${r}-0`}
                  onClick={() => setActive({ r, c: 0 })}
                  onDoubleClick={() => startEdit(r, 0)}
                  className={cn(cellBase, 'sticky left-9 z-10 w-[220px] min-w-[220px] max-w-[220px] bg-[var(--bg)] group-hover:bg-[var(--side)]', tint, isActive(0) && ring)}
                >
                  {editing?.id === row.id && editing.c === 0 ? (
                    <div className="absolute left-1 top-0.5 z-40">
                      <TextEditor
                        initial={row.name}
                        onCommit={(s) => {
                          onUpdate(row.id, 'name', s || 'Untitled');
                          stopEdit();
                        }}
                        onCancel={stopEdit}
                      />
                    </div>
                  ) : (
                    <span className="flex min-w-0 items-center gap-2">
                      {leading(row)}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpen(row.id);
                        }}
                        className="min-w-0 truncate rounded-sm font-medium text-[var(--strong)] hover:underline decoration-[var(--line2)] underline-offset-2"
                      >
                        {row.name || 'Untitled'}
                      </button>
                    </span>
                  )}
                </td>
                {fields.map((f, i) => {
                  const c = i + 1;
                  const value = (row as Record<string, unknown>)[f.key];
                  const ed = editing?.id === row.id && editing.c === c;
                  return (
                    <td
                      key={f.key}
                      data-cell={`${r}-${c}`}
                      onClick={() => setActive({ r, c })}
                      onDoubleClick={() => startEdit(r, c)}
                      className={cn(cellBase, 'max-w-0 bg-[var(--bg)] text-[var(--fg)] group-hover:bg-[var(--side)]', tint, isActive(c) && ring)}
                      style={{ width: f.w, minWidth: f.w, maxWidth: f.w }}
                    >
                      <span className="flex min-w-0 items-center overflow-hidden">
                        <FieldValue field={f} value={value} onChange={(v) => onUpdate(row.id, f.key, v)} />
                      </span>
                      {ed && (
                        <div className="absolute left-0 top-0.5 z-40">
                          <FieldEditor
                            field={f}
                            value={value}
                            onCommit={(v) => {
                              onUpdate(row.id, f.key, v);
                              stopEdit();
                            }}
                            onCancel={stopEdit}
                          />
                        </div>
                      )}
                    </td>
                  );
                })}
                <td className={cn(cellBase, 'border-r-0 bg-[var(--bg)] group-hover:bg-[var(--side)]', tint)} />
              </tr>
            );
          })}
          <tr>
            <td colSpan={fields.length + 3} className="sticky left-0 h-9 border-b border-[var(--line)] bg-[var(--bg)] px-2">
              <button onClick={onNew} className="flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[var(--mute)] hover:bg-[var(--hover)] hover:text-[var(--strong)]">
                <Plus className="h-3.5 w-3.5" /> New
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      {!rows.length && <p className="px-4 py-10 text-center text-[13px] text-[var(--mute)]">No records match this view.</p>}
    </div>
  );
}
