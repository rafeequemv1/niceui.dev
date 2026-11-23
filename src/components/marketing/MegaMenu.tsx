import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowUpRight, ChevronDown, Menu, X, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { artwork } from '@/components/gallery/art';

export type MegaPreview = { art: number; kind?: 'mesh' | 'landscape'; title: string; meta?: string };
export type MegaLink = { label: string; href?: string; icon?: LucideIcon; description?: string; badge?: string; preview?: MegaPreview };
export type MegaMenuPanel =
  | { kind: 'grid'; heading?: string; columns: MegaLink[][]; preview?: MegaPreview }
  | { kind: 'list'; heading?: string; links: MegaLink[]; feature?: MegaPreview };
export type MegaItem = { label: string; href?: string; menu?: MegaMenuPanel };

/* ——— preview card ——— */

function PreviewCard({ preview, className }: { preview: MegaPreview; className?: string }) {
  const [shown, setShown] = useState(preview);
  const [fade, setFade] = useState(false);
  useEffect(() => {
    if (preview.title === shown.title) return;
    setFade(true);
    const id = window.setTimeout(() => {
      setShown(preview);
      setFade(false);
    }, 140);
    return () => window.clearTimeout(id);
  }, [preview, shown.title]);
  const src = artwork(shown.art, 560, 440, shown.kind ?? 'mesh');
  return (
    <div className={cn('relative overflow-hidden rounded-xl border border-white/[.08] bg-[#1b1b1a]', className)}>
      {src && <img src={src} alt="" className={cn('absolute inset-0 h-full w-full object-cover transition-all duration-300', fade ? 'scale-105 opacity-0' : 'scale-100 opacity-100')} />}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(0,0,0,.65))]" />
      <div className={cn('absolute inset-x-4 bottom-4 transition-all duration-300', fade ? 'translate-y-2 opacity-0' : 'opacity-100')}>
        {shown.meta && <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/60">{shown.meta}</p>}
        <p className="mt-1 font-serif text-[24px] leading-[1.05] text-white">{shown.title}</p>
      </div>
    </div>
  );
}

/* ——— panel contents ——— */

function GridPanel({ menu, onPick }: { menu: Extract<MegaMenuPanel, { kind: 'grid' }>; onPick: () => void }) {
  const all = menu.columns.flat();
  const [hot, setHot] = useState<MegaLink>(all[0]);
  const preview = hot.preview ?? menu.preview ?? all[0].preview;
  return (
    <div className="flex gap-6 p-5">
      <div>
        {menu.heading && <p className="mb-3 px-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">{menu.heading}</p>}
        <div className="flex gap-2">
          {menu.columns.map((col, ci) => (
            <ul key={ci} className="w-[172px]">
              {col.map((l) => {
                const Icon = l.icon;
                return (
                  <li key={l.label}>
                    <a
                      href={l.href ?? '#'}
                      onPointerEnter={() => setHot(l)}
                      onFocus={() => setHot(l)}
                      onClick={onPick}
                      className={cn('group flex items-center gap-2.5 rounded-lg px-2 py-[7px] text-[13px] outline-none transition-colors', hot === l ? 'bg-white/[.06] text-white' : 'text-white/70 hover:text-white focus-visible:bg-white/[.06]')}
                    >
                      {Icon && <Icon className={cn('h-[15px] w-[15px] shrink-0 transition-colors', hot === l ? 'text-[#c8d5b9]' : 'text-white/40')} strokeWidth={1.7} />}
                      <span className="truncate">{l.label}</span>
                      {l.badge && <span className="ml-auto rounded bg-[#c8d5b9]/15 px-1.5 py-px font-mono text-[9px] uppercase tracking-wider text-[#c8d5b9]">{l.badge}</span>}
                    </a>
                  </li>
                );
              })}
            </ul>
          ))}
        </div>
      </div>
      {preview && <PreviewCard preview={preview} className="hidden w-[230px] self-stretch lg:block" />}
    </div>
  );
}

function ListPanel({ menu, onPick }: { menu: Extract<MegaMenuPanel, { kind: 'list' }>; onPick: () => void }) {
  const [hot, setHot] = useState(0);
  const preview = menu.links[hot]?.preview ?? menu.feature;
  return (
    <div className="flex gap-5 p-4">
      <div>
        {menu.heading && <p className="mb-2 px-3 pt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">{menu.heading}</p>}
        <ul className="w-[268px] space-y-0.5">
          {menu.links.map((l, i) => {
            const Icon = l.icon;
            return (
              <li key={l.label}>
                <a
                  href={l.href ?? '#'}
                  onPointerEnter={() => setHot(i)}
                  onFocus={() => setHot(i)}
                  onClick={onPick}
                  className={cn('flex gap-3 rounded-lg px-3 py-2.5 outline-none transition-colors', hot === i ? 'bg-white/[.06]' : 'hover:bg-white/[.04]')}
                >
                  {Icon && (
                    <span className={cn('mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md border transition-colors', hot === i ? 'border-[#c8d5b9]/30 text-[#c8d5b9]' : 'border-white/[.08] text-white/50')}>
                      <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block text-[13px] font-medium text-white">{l.label}</span>
                    {l.description && <span className="mt-0.5 block text-[12px] leading-snug text-white/50">{l.description}</span>}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
      {preview && <PreviewCard preview={preview} className="hidden w-[260px] self-stretch lg:block" />}
    </div>
  );
}

function Panel({ menu, onPick }: { menu: MegaMenuPanel; onPick: () => void }) {
  return menu.kind === 'grid' ? <GridPanel menu={menu} onPick={onPick} /> : <ListPanel menu={menu} onPick={onPick} />;
}

/* ——— the menu ——— */

export type MegaMenuProps = {
  items: MegaItem[];
  /** Left slot, usually the logo. */
  brand?: ReactNode;
  /** Right slot, usually actions. */
  actions?: ReactNode;
  /** Index of a menu to show open on first render (handy for previews). */
  defaultOpen?: number;
  className?: string;
};

/**
 * A desktop mega menu with one shared panel that morphs its size and position
 * between menus, hover intent, a live preview card, keyboard support, and an
 * accordion sheet on small screens.
 */
export function MegaMenu({ items, brand, actions, defaultOpen, className }: MegaMenuProps) {
  const [open, setOpen] = useState<number | null>(defaultOpen ?? null);
  const [last, setLast] = useState<number | null>(defaultOpen ?? null);
  const [sheet, setSheet] = useState(false);
  const [acc, setAcc] = useState<number | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const triggers = useRef<Array<HTMLButtonElement | HTMLAnchorElement | null>>([]);
  const contents = useRef<Array<HTMLDivElement | null>>([]);
  const [box, setBox] = useState({ x: 0, w: 0, h: 0 });
  const timer = useRef(0);

  const show = useCallback(
    (i: number | null) => {
      window.clearTimeout(timer.current);
      setOpen(i);
      if (i !== null) setLast(i);
    },
    [],
  );
  const later = (i: number | null, ms: number) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => show(i), ms);
  };

  // size and place the shared panel for the active menu
  useLayoutEffect(() => {
    const i = open ?? last;
    if (i === null) return;
    const c = contents.current[i];
    const t = triggers.current[i];
    const nav = navRef.current;
    if (!c || !t || !nav) return;
    const w = c.offsetWidth;
    const h = c.offsetHeight;
    const nr = nav.getBoundingClientRect();
    const tr = t.getBoundingClientRect();
    const center = tr.left - nr.left + tr.width / 2;
    const x = Math.max(0, Math.min(nr.width - w, center - w / 2));
    setBox({ x, w, h });
  }, [open, last]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const t = triggers.current[open];
        show(null);
        t?.focus();
      }
    };
    const onDown = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) show(null);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onDown);
    };
  }, [open, show]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const active = open ?? last;

  return (
    <div className={cn('relative', className)}>
      <div ref={navRef} className="relative flex h-16 items-center" onPointerLeave={() => later(null, 180)} onPointerEnter={() => window.clearTimeout(timer.current)}>
        <div className="flex flex-1 items-center">{brand}</div>

        <ul className="hidden items-center gap-1 md:flex">
          {items.map((it, i) => (
            <li key={it.label}>
              {it.menu ? (
                <button
                  ref={(el) => (triggers.current[i] = el)}
                  aria-expanded={open === i}
                  aria-controls="mega-panel"
                  onPointerEnter={(e) => e.pointerType === 'mouse' && (open === null ? later(i, 70) : show(i))}
                  onClick={() => show(open === i ? null : i)}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      show(i);
                      window.setTimeout(() => contents.current[i]?.querySelector<HTMLAnchorElement>('a')?.focus(), 30);
                    }
                  }}
                  className={cn('flex h-9 items-center gap-1 rounded-lg px-3 text-[13.5px] outline-none transition-colors focus-visible:ring-1 focus-visible:ring-white/30', open === i ? 'bg-white/[.07] text-white' : 'text-white/70 hover:text-white')}
                >
                  {it.label}
                  <ChevronDown className={cn('h-3.5 w-3.5 opacity-60 transition-transform duration-300', open === i && 'rotate-180')} />
                </button>
              ) : (
                <a
                  ref={(el) => (triggers.current[i] = el)}
                  href={it.href ?? '#'}
                  onPointerEnter={() => later(null, 120)}
                  className="flex h-9 items-center rounded-lg px-3 text-[13.5px] text-white/70 outline-none transition-colors hover:text-white focus-visible:ring-1 focus-visible:ring-white/30"
                >
                  {it.label}
                </a>
              )}
            </li>
          ))}
        </ul>

        <div className="hidden flex-1 items-center justify-end gap-2 md:flex">{actions}</div>
        <button onClick={() => setSheet((s) => !s)} aria-expanded={sheet} aria-label={sheet ? 'Close menu' : 'Open menu'} className="ml-auto grid h-10 w-10 place-items-center rounded-lg text-white/80 hover:bg-white/[.06] md:hidden">
          {sheet ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* shared morphing panel */}
        <div
          id="mega-panel"
          role="region"
          aria-label={active !== null ? `${items[active].label} menu` : undefined}
          className={cn(
            'absolute top-[calc(100%+6px)] z-50 hidden origin-top overflow-hidden rounded-2xl border border-white/[.08] bg-[#131312] shadow-[0_30px_80px_-20px_rgba(0,0,0,.8)] md:block',
            'transition-[left,width,height,opacity,transform] duration-[380ms] ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none',
            open === null ? 'pointer-events-none -translate-y-1 scale-[.98] opacity-0' : 'opacity-100',
          )}
          style={{ left: box.x, width: box.w, height: box.h }}
        >
          {items.map((it, i) =>
            it.menu ? (
              <div
                key={it.label}
                ref={(el) => (contents.current[i] = el)}
                aria-hidden={active !== i}
                className={cn(
                  'absolute left-0 top-0 w-max transition-all duration-300 ease-out motion-reduce:transition-none',
                  active === i ? 'visible translate-x-0 opacity-100' : cn('invisible opacity-0', i < (active ?? 0) ? '-translate-x-6' : 'translate-x-6'),
                )}
              >
                <Panel menu={it.menu} onPick={() => show(null)} />
              </div>
            ) : null,
          )}
        </div>
      </div>

      {/* small screens: accordion sheet */}
      {sheet && (
        <div className="absolute inset-x-0 top-full z-50 max-h-[75vh] overflow-y-auto rounded-2xl border border-white/[.08] bg-[#121211] p-2 shadow-2xl md:hidden">
          {items.map((it, i) =>
            it.menu ? (
              <div key={it.label} className="border-b border-white/[.05] last:border-0">
                <button onClick={() => setAcc(acc === i ? null : i)} aria-expanded={acc === i} className="flex w-full items-center justify-between px-3 py-3.5 text-[15px] text-white">
                  {it.label}
                  <ChevronDown className={cn('h-4 w-4 text-white/50 transition-transform', acc === i && 'rotate-180')} />
                </button>
                <div className={cn('grid transition-[grid-template-rows] duration-300', acc === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
                  <div className="overflow-hidden">
                    <div className="grid grid-cols-2 gap-1 px-1 pb-3">
                      {(it.menu.kind === 'grid' ? it.menu.columns.flat() : it.menu.links).map((l) => {
                        const Icon = l.icon;
                        return (
                          <a key={l.label} href={l.href ?? '#'} className="flex items-center gap-2 rounded-lg px-2 py-2 text-[13px] text-white/70 hover:bg-white/[.05] hover:text-white">
                            {Icon && <Icon className="h-4 w-4 text-white/40" strokeWidth={1.7} />}
                            {l.label}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <a key={it.label} href={it.href ?? '#'} className="flex items-center justify-between border-b border-white/[.05] px-3 py-3.5 text-[15px] text-white last:border-0">
                {it.label}
                <ArrowUpRight className="h-4 w-4 text-white/40" />
              </a>
            ),
          )}
          {actions && <div className="flex gap-2 p-2 pt-3">{actions}</div>}
        </div>
      )}
    </div>
  );
}
