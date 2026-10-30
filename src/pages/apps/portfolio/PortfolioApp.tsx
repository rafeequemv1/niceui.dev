import { useEffect, useState, type FormEvent } from 'react';
import { ArrowRight, ArrowUpRight, Check, Mail, Menu, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Reveal } from '@/pages/landing/shared/motion';
import { artwork } from '@/components/gallery/art';

const WORK = [
  { id: 0, title: 'Tidewater Bank', kind: 'Brand identity', year: 2026, img: 3, summary: 'A calmer identity for a 140-year-old regional bank: a new wordmark, a tide-line motif and a colour system built for screens first.', role: 'Creative direction, identity, motion', results: ['+38% brand recall', '12 markets', '6-week rollout'] },
  { id: 1, title: 'Halo Health', kind: 'Product design', year: 2025, img: 2, summary: 'A patient app that turns lab results into plain language, with a care timeline families can share.', role: 'Product strategy, UX, design system', results: ['4.8★ App Store', '−41% support tickets', '220k patients'] },
  { id: 2, title: 'Northfield Press', kind: 'Editorial web', year: 2025, img: 8, summary: 'A reading-first magazine site with variable type, slow scroll stories and an archive that feels like a library.', role: 'Art direction, web design', results: ['2.4× time on page', 'Webby honoree', '18 long reads'] },
  { id: 3, title: 'Ember Coffee', kind: 'Packaging', year: 2024, img: 11, summary: 'Seasonal packaging where each origin gets its own landscape, printed with two inks to keep costs honest.', role: 'Packaging, illustration', results: ['Sold out in 9 days', '3 retail partners', 'Pentawards shortlist'] },
  { id: 4, title: 'Atlas Maps', kind: 'Product design', year: 2024, img: 0, summary: 'Offline-first trail maps for hikers, designed for gloves, glare and low batteries.', role: 'UX research, interface design', results: ['1.1M downloads', '30% less battery', 'Apple feature'] },
  { id: 5, title: 'Fable Studio', kind: 'Brand identity', year: 2023, img: 9, summary: 'An identity for an animation studio built around a single flickering frame.', role: 'Identity, motion system', results: ['Cannes Lions bronze', '40 assets', 'Full guidelines'] },
];

const TIMELINE = [
  { year: '2023 — now', role: 'Founder, Studio Ora', note: 'Independent practice for brand and product work.' },
  { year: '2019 — 2023', role: 'Design Lead, Lumen', note: 'Led a team of eight across web, app and brand.' },
  { year: '2016 — 2019', role: 'Senior Designer, Field & Co', note: 'Identity systems for culture and finance clients.' },
  { year: '2014 — 2016', role: 'Designer, Northfield Press', note: 'Editorial layouts, type and art direction.' },
];

const SERVICES = [
  { n: '01', t: 'Brand identity', d: 'Strategy, naming support, logo systems, type, colour and guidelines that teams actually use.' },
  { n: '02', t: 'Product design', d: 'Research, flows and interfaces for web and mobile, shipped as a living design system.' },
  { n: '03', t: 'Editorial & web', d: 'Art-directed websites and digital publications with a strong typographic voice.' },
  { n: '04', t: 'Motion', d: 'Logo animation, product films and motion guidelines for brands that move.' },
];

const FILTERS = ['All', 'Brand identity', 'Product design', 'Editorial web', 'Packaging'] as const;

export function PortfolioApp() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const [open, setOpen] = useState<number | null>(null);
  const [anchor, setAnchor] = useState(0);
  const [menu, setMenu] = useState(false);
  const [sent, setSent] = useState(false);
  const shown = WORK.filter((w) => filter === 'All' || w.kind === filter);
  const project = open === null ? null : WORK[open];

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
      if (e.key === 'ArrowRight') setOpen((o) => (o === null ? o : (o + 1) % WORK.length));
      if (e.key === 'ArrowLeft') setOpen((o) => (o === null ? o : (o + WORK.length - 1) % WORK.length));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const go = (id: string) => {
    setMenu(false);
    document.getElementById(`pf-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#f6f3ee] font-sans text-stone-900 antialiased selection:bg-orange-200">
      {/* nav */}
      <header className="sticky top-0 z-40 border-b border-stone-900/5 bg-[#f6f3ee]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <button onClick={() => go('top')} className="flex items-center gap-2 text-[15px] font-semibold tracking-[-0.02em]">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-stone-900 font-serif text-[15px] italic text-[#f6f3ee]">o</span>
            Ora Lindqvist
          </button>
          <nav className="hidden items-center gap-1 sm:flex">
            {['work', 'about', 'services', 'contact'].map((s) => (
              <button key={s} onClick={() => go(s)} className="rounded-full px-3.5 py-1.5 text-[14px] capitalize text-stone-600 transition-colors hover:bg-stone-900/5 hover:text-stone-900">
                {s}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-[12px] font-medium text-emerald-800 md:flex">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-600" /> Booking Q1 2027
            </span>
            <button onClick={() => setMenu((m) => !m)} aria-label="Menu" aria-expanded={menu} className="grid h-9 w-9 place-items-center rounded-full hover:bg-stone-900/5 sm:hidden">
              {menu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {menu && (
          <div className="border-t border-stone-900/5 px-5 pb-4 sm:hidden">
            {['work', 'about', 'services', 'contact'].map((s) => (
              <button key={s} onClick={() => go(s)} className="block w-full py-3 text-left text-[18px] capitalize">
                {s}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* hero */}
      <section id="pf-top" className="mx-auto max-w-6xl px-5 pb-16 pt-16 sm:px-8 sm:pt-24">
        <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-stone-500 animate-fade-up">Independent designer · Lisbon</p>
        <h1 className="mt-6 max-w-5xl text-[44px] font-medium leading-[1.02] tracking-[-0.045em] animate-fade-up sm:text-[76px] lg:text-[92px]" style={{ animationDelay: '100ms' }}>
          I design brands and products that feel <em className="font-serif font-normal italic text-orange-700">quietly</em> inevitable.
        </h1>
        <div className="mt-10 flex flex-col gap-6 animate-fade-up sm:flex-row sm:items-end sm:justify-between" style={{ animationDelay: '220ms' }}>
          <p className="max-w-md text-[17px] leading-relaxed text-stone-600">Twelve years of identity, product and editorial work for banks, health companies, publishers and the odd coffee roaster.</p>
          <div className="flex gap-3">
            <button onClick={() => go('work')} className="inline-flex h-12 items-center gap-2 rounded-full bg-stone-900 px-6 text-[15px] font-medium text-[#f6f3ee] transition-transform active:scale-[0.97]">
              See selected work <ArrowRight className="h-4 w-4" />
            </button>
            <button onClick={() => go('contact')} className="inline-flex h-12 items-center rounded-full px-5 text-[15px] font-medium ring-1 ring-stone-900/15 hover:bg-stone-900/5">
              Say hello
            </button>
          </div>
        </div>
      </section>

      {/* work */}
      <section id="pf-work" className="mx-auto max-w-6xl scroll-mt-16 px-5 py-16 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-[34px] font-medium tracking-[-0.04em] sm:text-[44px]">
            Selected <em className="font-serif font-normal italic">work</em>
          </h2>
          <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Filter work">
            {FILTERS.map((f) => (
              <button key={f} role="tab" aria-selected={filter === f} onClick={() => setFilter(f)} className={cn('rounded-full px-3 py-1.5 text-[13px] transition-colors', filter === f ? 'bg-stone-900 text-[#f6f3ee]' : 'text-stone-600 ring-1 ring-stone-900/10 hover:text-stone-900')}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {shown.map((w, i) => (
            <Reveal key={w.id} delay={(i % 2) * 90}>
              <button onClick={(e) => { setAnchor(e.currentTarget.getBoundingClientRect().top + window.scrollY); setOpen(w.id); }} className="group block w-full text-left" aria-label={`Open case study: ${w.title}`}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] bg-stone-200">
                  <img src={artwork(w.img, 960, 720)} alt="" className="h-full w-full object-cover transition-transform duration-700 ease-smooth group-hover:scale-[1.04]" />
                  <span className="absolute right-4 top-4 grid h-10 w-10 translate-y-2 place-items-center rounded-full bg-[#f6f3ee] opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
                <div className="mt-4 flex items-baseline justify-between gap-4">
                  <h3 className="text-[20px] font-medium tracking-[-0.02em]">{w.title}</h3>
                  <span className="font-mono text-[12px] text-stone-500">
                    {w.kind} · {w.year}
                  </span>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </section>

      {/* about */}
      <section id="pf-about" className="scroll-mt-16 border-y border-stone-900/10 bg-white/50">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <Reveal>
            <h2 className="text-[34px] font-medium leading-[1.05] tracking-[-0.04em] sm:text-[44px]">
              Twelve years, <em className="font-serif font-normal italic">one</em> obsession: clarity.
            </h2>
            <p className="mt-6 max-w-md text-[16px] leading-relaxed text-stone-600">I work with a small group of collaborators on a few projects a year, so every client gets a senior designer from first sketch to final file.</p>
            <div className="mt-8 grid max-w-md grid-cols-3 gap-4">
              {[
                ['60+', 'brands'],
                ['14', 'awards'],
                ['9', 'countries'],
              ].map(([a, b]) => (
                <div key={b}>
                  <p className="text-[32px] font-medium tracking-[-0.04em]">{a}</p>
                  <p className="text-[13px] text-stone-500">{b}</p>
                </div>
              ))}
            </div>
          </Reveal>
          <ol className="relative border-l border-stone-900/15 pl-6">
            {TIMELINE.map((t, i) => (
              <Reveal key={t.year} delay={i * 80}>
                <li className="relative pb-8 last:pb-0">
                  <span className={cn('absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-[#f6f3ee]', i === 0 ? 'bg-orange-600' : 'bg-stone-400')} />
                  <p className="font-mono text-[12px] text-stone-500">{t.year}</p>
                  <p className="mt-1 text-[17px] font-medium">{t.role}</p>
                  <p className="mt-1 text-[14px] text-stone-600">{t.note}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* services */}
      <section id="pf-services" className="mx-auto max-w-6xl scroll-mt-16 px-5 py-20 sm:px-8">
        <h2 className="text-[34px] font-medium tracking-[-0.04em] sm:text-[44px]">
          What I <em className="font-serif font-normal italic">do</em>
        </h2>
        <div className="mt-10 divide-y divide-stone-900/10 border-y border-stone-900/10">
          {SERVICES.map((s) => (
            <div key={s.n} className="group grid gap-2 py-6 transition-colors sm:grid-cols-[80px_minmax(0,1fr)_minmax(0,1.3fr)] sm:items-baseline">
              <span className="font-mono text-[13px] text-stone-400">{s.n}</span>
              <h3 className="text-[22px] font-medium tracking-[-0.02em] transition-transform duration-300 group-hover:translate-x-1">{s.t}</h3>
              <p className="text-[15px] leading-relaxed text-stone-600">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* contact */}
      <section id="pf-contact" className="scroll-mt-16 px-3 pb-3 sm:px-4">
        <div className="mx-auto grid max-w-[1400px] gap-10 rounded-[28px] bg-stone-900 px-6 py-14 text-[#f6f3ee] sm:px-12 lg:grid-cols-2">
          <div>
            <h2 className="text-[38px] font-medium leading-[1.02] tracking-[-0.045em] sm:text-[56px]">
              Have a project <em className="font-serif font-normal italic text-orange-300">in mind?</em>
            </h2>
            <p className="mt-5 max-w-sm text-[16px] leading-relaxed text-stone-400">Tell me a little about it. I reply to every message within two working days.</p>
            <a href="#" onClick={(e) => e.preventDefault()} className="mt-8 inline-flex items-center gap-2 text-[16px] underline decoration-stone-600 underline-offset-4 hover:decoration-orange-300">
              <Mail className="h-4 w-4" /> hello@studio-ora.design
            </a>
          </div>
          {sent ? (
            <div className="flex flex-col items-start justify-center rounded-2xl bg-white/5 p-8 animate-scale-in">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-400 text-stone-900">
                <Check className="h-5 w-5" />
              </span>
              <p className="mt-4 text-[20px] font-medium">Thanks, message received.</p>
              <p className="mt-1 text-[14px] text-stone-400">I'll be in touch soon.</p>
              <button onClick={() => setSent(false)} className="mt-6 text-[13px] text-stone-400 underline underline-offset-4">Send another</button>
            </div>
          ) : (
            <form onSubmit={submit} className="grid gap-3">
              {[
                ['name', 'Your name', 'text'],
                ['email', 'Email', 'email'],
              ].map(([n, l, t]) => (
                <label key={n} className="grid gap-1.5 text-[13px] text-stone-400">
                  {l}
                  <input required name={n} type={t} className="h-11 rounded-xl border border-white/10 bg-white/5 px-3.5 text-[15px] text-white outline-none focus:border-orange-300" />
                </label>
              ))}
              <label className="grid gap-1.5 text-[13px] text-stone-400">
                About the project
                <textarea required rows={4} className="resize-none rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-[15px] text-white outline-none focus:border-orange-300" />
              </label>
              <button type="submit" className="mt-2 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#f6f3ee] text-[15px] font-medium text-stone-900 transition-transform active:scale-[0.98]">
                Send message <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 px-5 py-8 text-[13px] text-stone-500 sm:flex-row sm:items-center sm:px-8">
        <span>© 2026 Ora Lindqvist · Studio Ora</span>
        <span className="flex gap-5">
          {['Instagram', 'Dribbble', 'LinkedIn', 'Read.cv'].map((s) => (
            <a key={s} href="#" onClick={(e) => e.preventDefault()} className="hover:text-stone-900">
              {s}
            </a>
          ))}
        </span>
      </footer>

      {/* case study overlay */}
      {project && (
        <div className="absolute inset-0 z-50 bg-stone-900/40 p-3 backdrop-blur-sm animate-fade-in sm:p-8" onClick={() => setOpen(null)} role="dialog" aria-modal="true" aria-label={project.title}>
          <article style={{ marginTop: Math.max(0, anchor - 120) }} className="mx-auto max-w-4xl overflow-hidden rounded-[24px] bg-[#f6f3ee] animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="relative aspect-[16/9] bg-stone-200">
              <img src={artwork(project.img, 1280, 720)} alt="" className="h-full w-full object-cover" />
              <button onClick={() => setOpen(null)} aria-label="Close" className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-[#f6f3ee] shadow">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-8 p-6 sm:p-10 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
              <div>
                <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-stone-500">
                  {project.kind} · {project.year}
                </p>
                <h3 className="mt-3 text-[34px] font-medium tracking-[-0.04em]">{project.title}</h3>
                <p className="mt-4 text-[16px] leading-relaxed text-stone-600">{project.summary}</p>
                <p className="mt-4 text-[14px] text-stone-500">Role: {project.role}</p>
              </div>
              <ul className="space-y-3">
                {project.results.map((r) => (
                  <li key={r} className="rounded-2xl bg-white px-4 py-3 text-[15px] font-medium ring-1 ring-stone-900/5">
                    {r}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-center justify-between border-t border-stone-900/10 px-6 py-4 text-[13px] text-stone-500 sm:px-10">
              <button onClick={() => setOpen((project.id + WORK.length - 1) % WORK.length)} className="hover:text-stone-900">← Previous</button>
              <span>Esc to close</span>
              <button onClick={() => setOpen((project.id + 1) % WORK.length)} className="hover:text-stone-900">Next →</button>
            </div>
          </article>
        </div>
      )}
    </div>
  );
}
