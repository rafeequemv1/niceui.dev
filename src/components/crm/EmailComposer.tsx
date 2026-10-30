import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { CalendarClock, Check, ChevronDown, Eye, FileText, LoaderCircle, MailOpen, PenLine, Send, Sparkles, Undo2, X } from 'lucide-react';
import { cn } from '@/lib/cn';

export type Recipient = { name: string; email: string };
export type EmailTemplate = { id: string; name: string; subject: string; body: string };
export type RewriteTone = 'shorter' | 'friendlier' | 'formal';

const TOKEN = /(\{\{\s*\w+\s*\}\})/g;
const IS_TOKEN = /^\{\{\s*\w+\s*\}\}$/;
const keyOf = (t: string) => t.replace(/[{}\s]/g, '');

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

/** Highlights {{merge_fields}} without changing text metrics, so it can sit under a textarea. */
function Highlighted({ text, data }: { text: string; data: Record<string, string> }) {
  return (
    <>
      {text.split(TOKEN).map((part, i) =>
        IS_TOKEN.test(part) ? (
          <span key={i} className={cn('rounded-[4px]', data[keyOf(part)] ? 'bg-brand-500/20 text-brand-200' : 'bg-amber-500/20 text-amber-200')}>
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

function Resolved({ text, data }: { text: string; data: Record<string, string> }) {
  return (
    <>
      {text.split(TOKEN).map((part, i) => {
        if (!IS_TOKEN.test(part)) return <span key={i}>{part}</span>;
        const v = data[keyOf(part)];
        return v ? (
          <span key={i} className="text-ink-50 underline decoration-brand-400/50 decoration-dotted underline-offset-4">
            {v}
          </span>
        ) : (
          <span key={i} className="rounded-[4px] bg-amber-500/15 px-1 text-amber-200">
            missing {keyOf(part)}
          </span>
        );
      })}
    </>
  );
}

function Chip({ r, onRemove }: { r: Recipient; onRemove?: () => void }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-white/[0.06] py-0.5 pl-0.5 pr-1.5 text-[12px] text-ink-100 ring-1 ring-white/10 animate-scale-in">
      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-500/20 text-[9px] font-semibold text-brand-200">{initials(r.name)}</span>
      <span className="truncate">{r.name}</span>
      {onRemove && (
        <button onClick={onRemove} aria-label={`Remove ${r.name}`} className="focus-ring rounded-full text-ink-500 transition-colors hover:text-ink-100">
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}

function RecipientRow({ label, list, setList, autoFocus }: { label: string; list: Recipient[]; setList: (r: Recipient[]) => void; autoFocus?: boolean }) {
  const [draft, setDraft] = useState('');
  const [bad, setBad] = useState(false);
  const add = () => {
    const v = draft.trim().replace(/,$/, '');
    if (!v) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      setBad(true);
      return;
    }
    const name = v
      .split('@')[0]
      .split(/[._-]/)
      .map((s) => s[0]?.toUpperCase() + s.slice(1))
      .join(' ');
    setList([...list, { name, email: v }]);
    setDraft('');
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === 'Tab') {
      if (draft.trim()) {
        e.preventDefault();
        add();
      }
    } else if (e.key === 'Backspace' && !draft && list.length) setList(list.slice(0, -1));
  };
  return (
    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
      <span className="w-6 shrink-0 text-[12px] text-ink-500">{label}</span>
      {list.map((r, i) => (
        <Chip key={r.email} r={r} onRemove={() => setList(list.filter((_, j) => j !== i))} />
      ))}
      <input
        value={draft}
        autoFocus={autoFocus}
        onChange={(e) => {
          setDraft(e.target.value);
          setBad(false);
        }}
        onKeyDown={onKey}
        onBlur={add}
        aria-label={`${label} recipients`}
        placeholder={list.length ? '' : 'name@company.com'}
        className={cn('h-6 min-w-[120px] flex-1 bg-transparent text-[12.5px] text-ink-100 outline-none placeholder:text-ink-600', bad && 'text-rose-300')}
      />
    </div>
  );
}

function Toggle({ on, onChange, label, icon }: { on: boolean; onChange: (v: boolean) => void; label: string; icon: ReactNode }) {
  return (
    <button role="switch" aria-checked={on} onClick={() => onChange(!on)} className="focus-ring flex items-center gap-2 rounded-md px-1 text-[12px] text-ink-400 transition-colors hover:text-ink-100">
      {icon}
      <span className="hidden sm:inline">{label}</span>
      <span className={cn('relative h-4 w-7 rounded-full transition-colors duration-300', on ? 'bg-brand-500' : 'bg-white/10')}>
        <span className={cn('absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-all duration-300 ease-spring', on ? 'left-[14px]' : 'left-0.5')} />
      </span>
    </button>
  );
}

const SCHEDULES = ['In 2 hours', 'Tomorrow, 9:00 AM', 'Monday, 8:30 AM'];

export type EmailComposerProps = {
  to: Recipient[];
  cc?: Recipient[];
  templates: EmailTemplate[];
  data: Record<string, string>;
  /** Returns the rewritten body for a tone. */
  rewrite?: (body: string, tone: RewriteTone, templateId: string) => string;
  onSend?: (email: { to: Recipient[]; cc: Recipient[]; subject: string; body: string; scheduledFor?: string; track: boolean }) => void;
  className?: string;
};

export function EmailComposer({ to: to0, cc: cc0 = [], templates, data, rewrite, onSend, className }: EmailComposerProps) {
  const [to, setTo] = useState(to0);
  const [cc, setCc] = useState(cc0);
  const [showCc, setShowCc] = useState(cc0.length > 0);
  const [tpl, setTpl] = useState(templates[0]);
  const [subject, setSubject] = useState(templates[0].subject);
  const [body, setBody] = useState(templates[0].body);
  const [preview, setPreview] = useState(false);
  const [menu, setMenu] = useState<'tpl' | 'when' | null>(null);
  const [busy, setBusy] = useState<RewriteTone | null>(null);
  const [undo, setUndo] = useState<string | null>(null);
  const [when, setWhen] = useState<string | null>(null);
  const [track, setTrack] = useState(true);
  const [sent, setSent] = useState<'idle' | 'sending' | 'sent'>('idle');
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => {
    if (!menu) return;
    const close = (e: PointerEvent) => {
      if (!(e.target as Element).closest?.(`[data-menu-root="${menu}"]`)) setMenu(null);
    };
    const esc = (e: globalThis.KeyboardEvent) => e.key === 'Escape' && setMenu(null);
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [menu]);

  const fields = [...new Set([...(subject + body).matchAll(TOKEN)].map((m) => keyOf(m[0])))];
  const missing = fields.filter((f) => !data[f]);

  const pick = (t: EmailTemplate) => {
    setTpl(t);
    setSubject(t.subject);
    setBody(t.body);
    setUndo(null);
    setMenu(null);
  };
  const doRewrite = (tone: RewriteTone) => {
    if (!rewrite || busy) return;
    setBusy(tone);
    timers.current.push(
      window.setTimeout(() => {
        setUndo(body);
        setBody(rewrite(body, tone, tpl.id));
        setBusy(null);
      }, 900),
    );
  };
  const send = () => {
    if (!to.length || sent !== 'idle') return;
    setSent('sending');
    timers.current.push(
      window.setTimeout(() => {
        setSent('sent');
        onSend?.({ to, cc, subject, body, scheduledFor: when ?? undefined, track });
      }, 1100),
    );
  };

  if (sent === 'sent')
    return (
      <div className={cn('w-full rounded-2xl bg-ink-900 p-6 text-center shadow-card animate-scale-in', className)}>
        <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-emerald-500/15 text-emerald-300">
          <Check className="h-5 w-5" />
        </span>
        <p className="mt-3 text-sm font-medium text-ink-50">{when ? `Scheduled for ${when}` : 'Email sent'}</p>
        <p className="mt-1 text-xs text-ink-400">
          To {to.map((r) => r.name).join(', ')}
          {track ? ' · tracking opens' : ''}
        </p>
        <button onClick={() => setSent('idle')} className="focus-ring mt-4 inline-flex h-8 items-center gap-1.5 rounded-lg bg-white/5 px-3 text-xs text-ink-200 transition-colors hover:bg-white/10">
          <PenLine className="h-3.5 w-3.5" /> New email
        </button>
      </div>
    );

  return (
    <div className={cn('w-full overflow-visible rounded-2xl bg-ink-900 shadow-card', className)}>
      <div className="space-y-2 border-b border-white/5 px-4 py-3">
        <div className="flex items-start gap-2">
          <RecipientRow label="To" list={to} setList={setTo} />
          {!showCc && (
            <button onClick={() => setShowCc(true)} className="focus-ring mt-0.5 shrink-0 rounded px-1 text-[12px] text-ink-500 hover:text-ink-200">
              Cc
            </button>
          )}
        </div>
        {showCc && <RecipientRow label="Cc" list={cc} setList={setCc} autoFocus={cc.length === 0} />}
        <div className="flex items-center gap-2 border-t border-white/5 pt-2">
          <span className="w-6 shrink-0 text-[12px] text-ink-500">Subj</span>
          {preview ? (
            <p className="min-w-0 flex-1 truncate text-[13.5px] font-medium text-ink-50">
              <Resolved text={subject} data={data} />
            </p>
          ) : (
            <input value={subject} onChange={(e) => setSubject(e.target.value)} aria-label="Subject" className="min-w-0 flex-1 bg-transparent text-[13.5px] font-medium text-ink-50 outline-none" />
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 border-b border-white/5 px-3 py-2">
        <div className="relative" data-menu-root="tpl">
          <button onClick={() => setMenu(menu === 'tpl' ? null : 'tpl')} aria-haspopup="listbox" aria-expanded={menu === 'tpl'} className="focus-ring flex h-7 items-center gap-1.5 rounded-lg bg-white/[0.04] px-2.5 text-[12px] text-ink-200 ring-1 ring-white/10 transition-colors hover:bg-white/[0.07]">
            <FileText className="h-3.5 w-3.5 text-ink-400" />
            <span className="max-w-[140px] truncate">{tpl.name}</span>
            <ChevronDown className={cn('h-3 w-3 text-ink-500 transition-transform', menu === 'tpl' && 'rotate-180')} />
          </button>
          {menu === 'tpl' && (
            <ul role="listbox" aria-label="Templates" className="absolute left-0 top-[calc(100%+6px)] z-20 w-60 rounded-xl bg-ink-850 p-1 shadow-pop animate-scale-in">
              {templates.map((t) => (
                <li key={t.id}>
                  <button role="option" aria-selected={t.id === tpl.id} onClick={() => pick(t)} className={cn('focus-ring flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-white/5', t.id === tpl.id && 'bg-white/[0.04]')}>
                    <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-500" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12.5px] text-ink-100">{t.name}</span>
                      <span className="block truncate text-[11px] text-ink-500">{t.subject}</span>
                    </span>
                    {t.id === tpl.id && <Check className="mt-0.5 h-3.5 w-3.5 text-brand-300" />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <span className="mx-1 hidden h-4 w-px bg-white/10 sm:block" />
        <span className="flex items-center gap-1 text-[11.5px] text-ink-500">
          <Sparkles className="h-3.5 w-3.5 text-brand-300" />
          <span className="hidden sm:inline">Rewrite</span>
        </span>
        {(['shorter', 'friendlier', 'formal'] as RewriteTone[]).map((tone) => (
          <button
            key={tone}
            onClick={() => doRewrite(tone)}
            disabled={!!busy}
            className={cn('focus-ring flex h-7 items-center gap-1 rounded-full px-2.5 text-[11.5px] capitalize ring-1 transition-all disabled:cursor-wait', busy === tone ? 'bg-brand-500/15 text-brand-200 ring-brand-500/30' : 'text-ink-300 ring-white/10 hover:bg-white/5 hover:text-ink-100')}
          >
            {busy === tone && <LoaderCircle className="h-3 w-3 animate-spin" />}
            {tone}
          </button>
        ))}
        {undo !== null && !busy && (
          <button
            onClick={() => {
              setBody(undo);
              setUndo(null);
            }}
            className="focus-ring flex h-7 items-center gap-1 rounded-full px-2 text-[11.5px] text-ink-400 hover:text-ink-100 animate-fade-in"
          >
            <Undo2 className="h-3 w-3" /> Undo
          </button>
        )}
        <button onClick={() => setPreview((p) => !p)} aria-pressed={preview} className={cn('focus-ring ml-auto flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-[12px] transition-colors', preview ? 'bg-brand-500/15 text-brand-200' : 'text-ink-400 hover:bg-white/5 hover:text-ink-100')}>
          {preview ? <PenLine className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {preview ? 'Edit' : 'Preview'}
        </button>
      </div>

      <div className={cn('relative px-4 py-3 transition-opacity duration-300', busy && 'opacity-50')}>
        {busy && <div className="pointer-events-none absolute inset-0 animate-shimmer bg-[linear-gradient(110deg,transparent_30%,rgba(125,211,252,0.07)_50%,transparent_70%)] bg-[length:200%_100%]" />}
        {preview ? (
          <p className="min-h-[168px] whitespace-pre-wrap break-words text-[13.5px] leading-6 text-ink-300 animate-fade-in">
            <Resolved text={body} data={data} />
          </p>
        ) : (
          <div className="relative min-h-[168px]">
            <div aria-hidden className="pointer-events-none whitespace-pre-wrap break-words text-[13.5px] leading-6 text-ink-300">
              <Highlighted text={body + '\n'} data={data} />
            </div>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} aria-label="Email body" spellCheck={false} className="absolute inset-0 h-full w-full resize-none overflow-hidden bg-transparent text-[13.5px] leading-6 text-transparent caret-ink-100 outline-none selection:bg-brand-500/30" />
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-white/5 px-3 py-2.5">
        <span className={cn('flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px]', missing.length ? 'bg-amber-500/10 text-amber-200' : 'bg-white/[0.04] text-ink-400')}>
          <span className={cn('h-1.5 w-1.5 rounded-full', missing.length ? 'bg-amber-400' : 'bg-emerald-400')} />
          {fields.length} fields · {missing.length ? `${missing.length} missing` : 'all resolved'}
        </span>
        <Toggle on={track} onChange={setTrack} label="Track opens" icon={<MailOpen className="h-3.5 w-3.5" />} />
        {when && (
          <span className="flex items-center gap-1 rounded-full bg-brand-500/10 px-2 py-1 text-[11px] text-brand-200 animate-scale-in">
            <CalendarClock className="h-3 w-3" /> {when}
            <button onClick={() => setWhen(null)} aria-label="Clear schedule" className="focus-ring rounded-full hover:text-white">
              <X className="h-3 w-3" />
            </button>
          </span>
        )}
        <div className="relative ml-auto flex" data-menu-root="when">
          <button onClick={send} disabled={!to.length || sent !== 'idle'} className="focus-ring flex h-8 items-center gap-1.5 rounded-l-lg bg-brand-500 pl-3 pr-2.5 text-[12.5px] font-medium text-white transition-colors hover:bg-brand-400 disabled:opacity-50">
            {sent === 'sending' ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            {when ? 'Schedule' : 'Send'}
          </button>
          <button onClick={() => setMenu(menu === 'when' ? null : 'when')} aria-label="Schedule send" aria-haspopup="menu" aria-expanded={menu === 'when'} className="focus-ring grid h-8 w-8 place-items-center rounded-r-lg border-l border-white/20 bg-brand-500 text-white transition-colors hover:bg-brand-400">
            <CalendarClock className="h-3.5 w-3.5" />
          </button>
          {menu === 'when' && (
            <ul role="menu" className="absolute bottom-[calc(100%+6px)] right-0 z-20 w-48 rounded-xl bg-ink-850 p-1 shadow-pop animate-scale-in">
              {SCHEDULES.map((s) => (
                <li key={s}>
                  <button
                    role="menuitem"
                    onClick={() => {
                      setWhen(s);
                      setMenu(null);
                    }}
                    className="focus-ring flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[12.5px] text-ink-200 hover:bg-white/5"
                  >
                    {s}
                    {when === s && <Check className="h-3.5 w-3.5 text-brand-300" />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

/* ——— demo ——— */

const DEMO_TEMPLATES: EmailTemplate[] = [
  {
    id: 'intro',
    name: 'Follow-up after demo',
    subject: 'Great meeting you, {{first_name}}',
    body: 'Hi {{first_name}},\n\nThanks for walking us through how {{company}} runs its pipeline today. From what you shared, the {{plan}} plan covers your {{seats}} reps with room to grow.\n\nWould Thursday work to bring in your ops lead?\n\nBest,\n{{sender}}',
  },
  {
    id: 'nudge',
    name: 'Gentle nudge',
    subject: 'Still thinking it over, {{first_name}}?',
    body: 'Hi {{first_name}},\n\nJust floating this back up. Happy to send a short video of the workflow we discussed for {{company}}, or jump on a 15-minute call.\n\nCheers,\n{{sender}}',
  },
  {
    id: 'renewal',
    name: 'Renewal check-in',
    subject: '{{company}} renewal on {{renewal_date}}',
    body: 'Hi {{first_name}},\n\nYour {{plan}} plan renews on {{renewal_date}}. Before then, I would love 20 minutes to review what is working and what we can improve.\n\nBest,\n{{sender}}',
  },
];

const REWRITES: Record<string, Record<RewriteTone, string>> = {
  intro: {
    shorter: 'Hi {{first_name}},\n\nThanks for the walkthrough. The {{plan}} plan fits your {{seats}} reps at {{company}}.\n\nThursday to loop in your ops lead?\n\n{{sender}}',
    friendlier: 'Hey {{first_name}}!\n\nReally enjoyed seeing how {{company}} runs its pipeline. Honestly, the {{plan}} plan feels like a great fit for your {{seats}} reps, with plenty of room to grow.\n\nFancy grabbing Thursday with your ops lead too?\n\nTalk soon,\n{{sender}}',
    formal: 'Dear {{first_name}},\n\nThank you for presenting the current pipeline process at {{company}}. Based on our discussion, the {{plan}} plan would accommodate your {{seats}} representatives and future growth.\n\nWould Thursday be convenient to include your operations lead?\n\nKind regards,\n{{sender}}',
  },
};

export function EmailComposerDemo() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <EmailComposer
        to={[{ name: 'Maya Chen', email: 'maya@halcyonlabs.io' }]}
        templates={DEMO_TEMPLATES}
        data={{ first_name: 'Maya', company: 'Halcyon Labs', plan: 'Growth', seats: '25', sender: 'Jordan' }}
        rewrite={(body, tone, id) => REWRITES[id]?.[tone] ?? body}
      />
    </div>
  );
}
