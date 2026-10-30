import { useEffect, useRef, useState, type DragEvent } from 'react';
import { AlertTriangle, ArrowRight, Check, CircleCheck, Copy, FileSpreadsheet, RotateCcw, Upload } from 'lucide-react';
import { cn } from '@/lib/cn';

type Step = 'upload' | 'map' | 'review' | 'import' | 'done';
const STEPS: { id: Step; label: string }[] = [
  { id: 'upload', label: 'Upload' },
  { id: 'map', label: 'Map columns' },
  { id: 'review', label: 'Review' },
  { id: 'import', label: 'Import' },
];
const FIELDS = ['Name', 'Email', 'Company', 'Phone', 'Stage', 'Job title', "Don't import"];

export type CsvColumn = { header: string; sample: string; field: string; confidence: number };
const COLUMNS: CsvColumn[] = [
  { header: 'Full name', sample: 'Amara Okafor', field: 'Name', confidence: 98 },
  { header: 'E-mail', sample: 'amara@lumenpay.io', field: 'Email', confidence: 99 },
  { header: 'Org', sample: 'Lumenpay', field: 'Company', confidence: 86 },
  { header: 'Phone #', sample: '+1 415 555 0142', field: 'Phone', confidence: 92 },
  { header: 'Status', sample: 'Customer', field: 'Stage', confidence: 71 },
  { header: 'notes', sample: 'met at summit', field: "Don't import", confidence: 0 },
];
const PREVIEW = [
  ['Amara Okafor', 'amara@lumenpay.io', 'Lumenpay', '+1 415 555 0142', 'Customer', 'met at summit'],
  ['Jonas Weber', 'jonas@kestrel.dev', 'Kestrel Labs', '+49 30 5550 1180', 'Qualified', ''],
  ['Priya Raman', 'priya@northbeam', 'Northbeam', '+44 20 7946 0921', 'Lead', 'intro via Ana'],
  ['Mateo Silva', 'mateo@harborline.com', 'Harborline', '+55 11 5550 3307', 'Qualified', ''],
];
const INVALID = [
  { row: 14, email: 'priya@northbeam' },
  { row: 87, email: 'tom@@fieldframe.io' },
  { row: 203, email: 'n/a' },
];
const TOTAL = 248;
const DUPES = 6;

function useReduced() {
  const [r, setR] = useState(false);
  useEffect(() => setR(window.matchMedia('(prefers-reduced-motion: reduce)').matches), []);
  return r;
}

export type CsvImportProps = { autoPlay?: boolean; onComplete?: (summary: { created: number; updated: number; skipped: number }) => void; className?: string };

export function CsvImport({ autoPlay = true, onComplete, className }: CsvImportProps) {
  const reduced = useReduced();
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<{ name: string; size: string } | null>(null);
  const [parse, setParse] = useState(0);
  const [over, setOver] = useState(false);
  const [cols, setCols] = useState(COLUMNS);
  const [dupes, setDupes] = useState<'merge' | 'skip' | 'create'>('merge');
  const [skipInvalid, setSkipInvalid] = useState(true);
  const [progress, setProgress] = useState(0);
  const timers = useRef<number[]>([]);
  const later = (ms: number, f: () => void) => void timers.current.push(window.setTimeout(f, ms));
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const ready = TOTAL - (skipInvalid ? INVALID.length : 0) - (dupes === 'skip' ? DUPES : 0);
  const updated = dupes === 'merge' ? DUPES : 0;
  const created = ready - updated;
  const skipped = TOTAL - ready;

  const load = () => {
    setFile({ name: 'contacts_export.csv', size: '41 KB' });
    if (reduced) return setParse(1);
    setParse(0);
    const t0 = performance.now();
    const tick = () => {
      const p = Math.min(1, (performance.now() - t0) / 900);
      setParse(p);
      if (p < 1) timers.current.push(window.setTimeout(tick, 30));
    };
    tick();
  };

  useEffect(() => {
    if (!autoPlay) return;
    if (reduced) {
      setFile({ name: 'contacts_export.csv', size: '41 KB' });
      setParse(1);
      return;
    }
    later(500, load);
  }, [autoPlay, reduced]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (step !== 'import') return;
    if (reduced) {
      setProgress(1);
      setStep('done');
      onComplete?.({ created, updated, skipped });
      return;
    }
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / 2200);
      setProgress(p);
      if (p < 1) raf = requestAnimationFrame(tick);
      else
        later(350, () => {
          setStep('done');
          onComplete?.({ created, updated, skipped });
        });
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  const reset = () => {
    timers.current.forEach(clearTimeout);
    setStep('upload');
    setFile(null);
    setParse(0);
    setProgress(0);
    setCols(COLUMNS);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setOver(false);
    load();
  };

  const stepIndex = STEPS.findIndex((s) => s.id === step);
  const done = step === 'done';

  return (
    <div className={cn('w-full overflow-hidden rounded-2xl bg-ink-900 shadow-card', className)}>
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-white/[0.06] px-4 py-3 [scrollbar-width:none]">
        {STEPS.map((s, i) => {
          const past = done || i < stepIndex;
          const cur = !done && i === stepIndex;
          return (
            <div key={s.id} className="flex shrink-0 items-center gap-1.5">
              <span className={cn('grid h-5 w-5 place-items-center rounded-full font-mono text-[10px] transition-colors', past ? 'bg-brand-500 text-white' : cur ? 'bg-brand-500/15 text-brand-200 ring-1 ring-brand-400/50' : 'bg-white/[0.05] text-ink-500')}>
                {past ? <Check className="h-3 w-3" strokeWidth={3} /> : i + 1}
              </span>
              <span className={cn('text-[12.5px]', cur ? 'font-medium text-ink-50' : past ? 'text-ink-300' : 'text-ink-500')}>{s.label}</span>
              {i < STEPS.length - 1 && <span className={cn('mx-1 h-px w-5 sm:w-8', past ? 'bg-brand-400/60' : 'bg-white/10')} />}
            </div>
          );
        })}
      </div>

      <div className="p-4 sm:p-5">
        {step === 'upload' && (
          <div className="space-y-4 animate-fade-in">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setOver(true);
              }}
              onDragLeave={() => setOver(false)}
              onDrop={onDrop}
              className={cn('flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-6 text-center transition-colors', over ? 'border-brand-400 bg-brand-500/[0.06]' : 'border-white/15 bg-white/[0.015]')}
            >
              {file ? (
                <div className="flex w-full max-w-sm items-center gap-3 rounded-xl bg-ink-850 p-3 text-left ring-1 ring-white/[0.07] animate-scale-in">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-500/15 text-emerald-300">
                    <FileSpreadsheet className="h-[18px] w-[18px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium text-ink-50">{file.name}</span>
                    <span className="block text-[11.5px] text-ink-500">{parse < 1 ? `Parsing… ${Math.round(parse * 100)}%` : `${file.size} · ${TOTAL} rows · 6 columns`}</span>
                    <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-white/[0.06]">
                      <span className={cn('block h-full rounded-full', parse < 1 ? 'bg-brand-400' : 'bg-emerald-400')} style={{ width: `${parse * 100}%` }} />
                    </span>
                  </span>
                </div>
              ) : (
                <>
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.05] text-ink-300">
                    <Upload className="h-[18px] w-[18px]" />
                  </span>
                  <p className="text-[13.5px] text-ink-100">Drop a CSV here</p>
                  <p className="text-[12px] text-ink-500">People, companies or deals · up to 50,000 rows</p>
                  <button onClick={load} className="focus-ring mt-1 rounded-lg bg-white/[0.06] px-3 py-1.5 text-[12.5px] text-ink-100 ring-1 ring-white/10 transition-colors hover:bg-white/10">
                    Use sample file
                  </button>
                </>
              )}
            </div>
            {file && parse >= 1 && (
              <div className="animate-fade-up">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-ink-500">Preview · first 4 rows</p>
                <div className="overflow-x-auto rounded-xl ring-1 ring-white/[0.06] [scrollbar-width:thin]">
                  <table className="w-max min-w-full text-left text-[12px]">
                    <thead className="bg-white/[0.03] text-ink-400">
                      <tr>
                        {COLUMNS.map((c) => (
                          <th key={c.header} className="px-3 py-2 font-medium">
                            {c.header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04] text-ink-200">
                      {PREVIEW.map((r) => (
                        <tr key={r[0]}>
                          {r.map((v, i) => (
                            <td key={i} className="whitespace-nowrap px-3 py-2">
                              {v || <span className="text-ink-600">—</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 'map' && (
          <div className="space-y-1.5 animate-fade-in">
            <p className="mb-2 text-[12.5px] text-ink-400">We matched your columns automatically. Check anything below 80%.</p>
            {cols.map((c, i) => (
              <div key={c.header} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-xl bg-white/[0.02] px-3 py-2 ring-1 ring-white/[0.05]">
                <span className="min-w-0 flex-1 basis-[140px]">
                  <span className="block truncate text-[13px] font-medium text-ink-100">{c.header}</span>
                  <span className="block truncate text-[11.5px] text-ink-500">{c.sample}</span>
                </span>
                <ArrowRight className="hidden h-3.5 w-3.5 shrink-0 text-ink-600 sm:block" />
                <select
                  value={c.field}
                  onChange={(e) => setCols((cs) => cs.map((x, j) => (j === i ? { ...x, field: e.target.value, confidence: e.target.value === "Don't import" ? 0 : 100 } : x)))}
                  aria-label={`Field for ${c.header}`}
                  className="focus-ring h-8 w-[150px] rounded-lg bg-ink-950 px-2 text-[12.5px] text-ink-100 ring-1 ring-white/10 [color-scheme:dark]"
                >
                  {FIELDS.map((f) => (
                    <option key={f}>{f}</option>
                  ))}
                </select>
                <span className={cn('w-[74px] shrink-0 text-right font-mono text-[11px]', c.confidence >= 90 ? 'text-emerald-300' : c.confidence >= 80 ? 'text-brand-300' : c.confidence > 0 ? 'text-amber-300' : 'text-ink-600')}>
                  {c.confidence === 0 ? 'skipped' : c.confidence === 100 ? 'manual' : c.confidence < 80 ? `${c.confidence}% · check` : `${c.confidence}%`}
                </span>
              </div>
            ))}
          </div>
        )}

        {step === 'review' && (
          <div className="space-y-3 animate-fade-in">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                ['Rows', TOTAL, 'text-ink-50'],
                ['Ready', ready, 'text-emerald-300'],
                ['Duplicates', DUPES, 'text-amber-300'],
                ['Invalid emails', INVALID.length, 'text-rose-300'],
              ].map(([l, v, c]) => (
                <div key={l as string} className="rounded-xl bg-white/[0.02] px-3 py-2.5 ring-1 ring-white/[0.05]">
                  <p className="text-[11px] text-ink-500">{l}</p>
                  <p className={cn('font-mono text-[18px] tabular-nums', c as string)}>{v as number}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl bg-white/[0.02] p-3 ring-1 ring-white/[0.05]">
              <p className="flex items-center gap-1.5 text-[12.5px] text-ink-100">
                <Copy className="h-3.5 w-3.5 text-amber-300" /> {DUPES} people already exist (matched by email)
              </p>
              <div className="mt-2 flex flex-wrap gap-1" role="radiogroup" aria-label="Duplicate handling">
                {(
                  [
                    ['merge', 'Merge into existing'],
                    ['skip', 'Skip'],
                    ['create', 'Create anyway'],
                  ] as const
                ).map(([id, l]) => (
                  <button key={id} role="radio" aria-checked={dupes === id} onClick={() => setDupes(id)} className={cn('focus-ring rounded-lg px-2.5 py-1 text-[12px] transition-colors', dupes === id ? 'bg-brand-500/15 text-brand-200 ring-1 ring-brand-400/40' : 'text-ink-400 ring-1 ring-white/10 hover:text-ink-100')}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-xl bg-white/[0.02] p-3 ring-1 ring-white/[0.05]">
              <p className="flex items-center gap-1.5 text-[12.5px] text-ink-100">
                <AlertTriangle className="h-3.5 w-3.5 text-rose-300" /> {INVALID.length} rows have an invalid email
              </p>
              <ul className="mt-2 space-y-1">
                {INVALID.map((r) => (
                  <li key={r.row} className="flex items-center gap-2 font-mono text-[11.5px]">
                    <span className="w-14 text-ink-500">row {r.row}</span>
                    <span className="text-rose-300 line-through decoration-rose-400/50">{r.email}</span>
                  </li>
                ))}
              </ul>
              <label className="mt-2 flex cursor-pointer items-center gap-2 text-[12px] text-ink-300">
                <input type="checkbox" checked={skipInvalid} onChange={(e) => setSkipInvalid(e.target.checked)} className="h-3.5 w-3.5 accent-sky-400" />
                Skip these rows
              </label>
            </div>
          </div>
        )}

        {step === 'import' && (
          <div className="py-6 text-center animate-fade-in">
            <p className="text-[13.5px] text-ink-100">
              Importing <span className="font-mono tabular-nums">{Math.round(progress * ready)}</span> of {ready} people…
            </p>
            <div className="mx-auto mt-3 h-1.5 max-w-sm overflow-hidden rounded-full bg-white/[0.06]">
              <div className="h-full rounded-full bg-brand-400 shadow-[0_0_12px_rgba(56,189,248,0.6)]" style={{ width: `${progress * 100}%` }} />
            </div>
            <div className="mx-auto mt-4 flex max-w-sm justify-between font-mono text-[11.5px] text-ink-500">
              <span>
                created <span className="text-ink-100">{Math.round(progress * created)}</span>
              </span>
              <span>
                updated <span className="text-ink-100">{Math.round(progress * updated)}</span>
              </span>
              <span>
                skipped <span className="text-ink-100">{Math.round(progress * skipped)}</span>
              </span>
            </div>
          </div>
        )}

        {done && (
          <div className="py-5 text-center animate-scale-in">
            <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30">
              <CircleCheck className="h-5 w-5" />
            </span>
            <p className="mt-3 text-[16px] font-semibold text-ink-50">{ready} people imported</p>
            <p className="mt-1 text-[12.5px] text-ink-400">
              {created} created · {updated} merged · {skipped} skipped
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-white/[0.06] px-4 py-3">
        <button onClick={reset} className="focus-ring flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[12.5px] text-ink-400 transition-colors hover:bg-white/5 hover:text-ink-100">
          <RotateCcw className="h-3.5 w-3.5" /> {done ? 'Import another file' : 'Start over'}
        </button>
        {step === 'upload' && (
          <button onClick={() => setStep('map')} disabled={!file || parse < 1} className="focus-ring flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-[12.5px] font-medium text-white transition-colors hover:bg-brand-400 disabled:bg-white/[0.06] disabled:text-ink-500">
            Continue <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
        {step === 'map' && (
          <button onClick={() => setStep('review')} className="focus-ring flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-[12.5px] font-medium text-white transition-colors hover:bg-brand-400">
            Review data <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
        {step === 'review' && (
          <button onClick={() => setStep('import')} className="focus-ring flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-[12.5px] font-medium text-white transition-colors hover:bg-brand-400">
            Import {ready} people <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
        {done && <button className="focus-ring rounded-lg bg-white/[0.06] px-3 py-1.5 text-[12.5px] text-ink-100 ring-1 ring-white/10 transition-colors hover:bg-white/10">View records</button>}
      </div>
    </div>
  );
}

export function CsvImportDemo() {
  return (
    <div className="mx-auto w-full max-w-[640px]">
      <CsvImport />
    </div>
  );
}
