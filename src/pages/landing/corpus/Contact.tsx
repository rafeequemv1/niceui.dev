import { type ChangeEvent, type FormEvent, type ReactNode, useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, Github, Linkedin, Loader2, Twitter } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Reveal } from '@/pages/landing/shared/motion';
import { Button, Container, Eyebrow, Logo, scrollToId } from './ui';

const INTERESTS = ['Text', 'Code', 'Vision', 'Audio', 'RLHF', 'Evals'];

type Errors = Partial<Record<'name' | 'email' | 'company', string>>;

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-zinc-400">{label}</span>
      <div className="mt-2">{children}</div>
      <span className={cn('mt-1.5 block h-4 text-xs text-amber-300 transition-opacity', error ? 'opacity-100' : 'opacity-0')}>{error}</span>
    </label>
  );
}

const inputCls = (err?: string) =>
  cn('w-full rounded-xl border bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-zinc-500 transition focus:bg-white/[0.05] focus:outline-none', err ? 'border-amber-300/50' : 'border-white/10 focus:border-teal-300/50');

export function CorpusContact() {
  const [form, setForm] = useState({ name: '', email: '', company: '', message: '' });
  const [interests, setInterests] = useState<string[]>(['RLHF']);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  useEffect(() => {
    if (status !== 'sending') return;
    const t = window.setTimeout(() => setStatus('sent'), 1500);
    return () => window.clearTimeout(t);
  }, [status]);

  const validate = (): Errors => {
    const e: Errors = {};
    if (form.name.trim().length < 2) e.name = 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid work email.';
    else if (/@(gmail|yahoo|hotmail|outlook)\./i.test(form.email)) e.email = 'Please use your work email.';
    if (!form.company.trim()) e.company = 'Which lab or company?';
    return e;
  };

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length === 0) setStatus('sending');
  };

  const set = (k: keyof typeof form) => (ev: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: ev.target.value }));
    if (k in errors) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  return (
    <section id="contact" className="relative scroll-mt-20 overflow-hidden border-t border-white/[0.06] py-24 sm:py-32">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute bottom-[-30%] left-1/2 h-[700px] w-[1200px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(94,234,212,0.14),transparent)]" />
        <div className="dither-grid absolute inset-0 [mask-image:linear-gradient(to_top,black,transparent_70%)]" />
      </div>
      <Container className="relative grid gap-12 lg:grid-cols-2 lg:items-start">
        <Reveal>
          <Eyebrow>08 — Get started</Eyebrow>
          <h2 className="mt-5 font-serif text-5xl leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Train on data you can <em className="bg-gradient-to-r from-teal-200 to-amber-200 bg-clip-text italic text-transparent">stand behind.</em>
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-zinc-400">Tell us what you're building. A research lead — not a sales script — will reply within one business day with samples and a scoping plan.</p>
          <div className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-white/[0.07] pt-8">
            {[['< 24h', 'response'], ['1K', 'free sample rows'], ['$50M', 'indemnity cap']].map(([v, l]) => (
              <div key={l}>
                <div className="font-serif text-3xl text-white">{v}</div>
                <div className="mt-1 font-mono text-[10.5px] uppercase tracking-wider text-zinc-500">{l}</div>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0A0D0E]/80 p-6 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)] backdrop-blur sm:p-8">
            {status === 'sent' ? (
              <div className="flex min-h-[480px] animate-scale-in flex-col items-center justify-center text-center">
                <span className="relative grid h-16 w-16 place-items-center">
                  <span className="absolute inset-0 animate-pulse-ring rounded-full bg-teal-300/40" />
                  <CheckCircle2 className="relative h-12 w-12 text-teal-300" strokeWidth={1.25} />
                </span>
                <h3 className="mt-6 font-serif text-3xl text-white">Thank you, {form.name.split(' ')[0]}.</h3>
                <p className="mt-3 max-w-sm leading-relaxed text-zinc-400">We've received your request. Expect a note from a Corpus research lead at <span className="text-white">{form.email}</span> shortly.</p>
                <Button variant="outline" className="mt-8" onClick={() => { setStatus('idle'); setForm({ name: '', email: '', company: '', message: '' }); }}>
                  Send another
                </Button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="space-y-2">
                <div className="grid gap-x-4 sm:grid-cols-2">
                  <Field label="Full name" error={errors.name}>
                    <input value={form.name} onChange={set('name')} placeholder="Ada Lovelace" className={inputCls(errors.name)} />
                  </Field>
                  <Field label="Work email" error={errors.email}>
                    <input type="email" value={form.email} onChange={set('email')} placeholder="ada@lab.ai" className={inputCls(errors.email)} />
                  </Field>
                </div>
                <Field label="Lab / company" error={errors.company}>
                  <input value={form.company} onChange={set('company')} placeholder="Helix Labs" className={inputCls(errors.company)} />
                </Field>
                <div className="pb-5">
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-zinc-400">Interested in</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {INTERESTS.map((x) => {
                      const on = interests.includes(x);
                      return (
                        <button key={x} type="button" aria-pressed={on} onClick={() => setInterests((s) => (on ? s.filter((v) => v !== x) : [...s, x]))} className={cn('rounded-full border px-3.5 py-1.5 text-sm transition-all duration-300 active:scale-95', on ? 'border-teal-300/50 bg-teal-300/15 text-teal-100' : 'border-white/10 text-zinc-400 hover:border-white/25 hover:text-white')}>
                          {x}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <Field label="What are you training?">
                  <textarea value={form.message} onChange={set('message')} rows={4} placeholder="e.g. 200K expert-ranked coding preference pairs, Rust + Go, by Q3" className={cn(inputCls(), 'resize-none')} />
                </Field>
                <Button type="submit" disabled={status === 'sending'} className="w-full py-3">
                  {status === 'sending' ? (<><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>) : (<>Request samples & scoping <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></>)}
                </Button>
                <p className="pt-2 text-center text-xs text-zinc-500">By submitting you agree to our privacy policy. We never share your details.</p>
              </form>
            )}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

const FOOT = [
  { h: 'Data', l: [['Catalog', 'catalog'], ['Sample explorer', 'explorer'], ['Custom collection', 'pricing'], ['Evaluations', 'catalog']] },
  { h: 'Platform', l: [['Pipeline', 'pipeline'], ['Delivery & API', 'delivery'], ['Provenance', 'trust'], ['Pricing', 'pricing']] },
  { h: 'Company', l: [['Contact', 'contact'], ['Trust center', 'trust'], ['Annotator program', 'pipeline'], ['Careers', 'contact']] },
];

export function CorpusFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-white/[0.06] bg-[#050607]">
      <div aria-hidden className="dither-diagonal pointer-events-none absolute inset-0 opacity-60" />
      <Container className="relative py-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
          <div>
            <Logo />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-zinc-400">Licensed, curated training data for frontier AI. Every record accounted for.</p>
            <div className="mt-6 flex gap-2">
              {[Twitter, Github, Linkedin].map((Icon, i) => (
                <button key={i} type="button" aria-label="Social link" className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-zinc-400 transition hover:border-white/25 hover:text-white">
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {FOOT.map((c) => (
              <div key={c.h}>
                <div className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-zinc-500">{c.h}</div>
                <ul className="mt-4 space-y-2.5">
                  {c.l.map(([label, id]) => (
                    <li key={label}>
                      <button type="button" onClick={() => scrollToId(id)} className="text-sm text-zinc-400 transition-colors hover:text-white">{label}</button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-16 select-none font-serif text-[22vw] leading-[0.8] tracking-tighter text-white/[0.04] lg:text-[16rem]">Corpus</div>
        <div className="mt-8 flex flex-col gap-4 border-t border-white/[0.06] pt-8 font-mono text-[11px] text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Corpus Data, Inc. All rights reserved.</span>
          <span className="inline-flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-300" /> All systems operational · SOC 2 Type II · ISO 27001
          </span>
        </div>
      </Container>
    </footer>
  );
}
