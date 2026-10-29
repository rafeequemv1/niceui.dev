import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Preview } from './Preview';
import type { DocEntry, Section } from './types';

type Neighbor = { section: Section; entry: DocEntry } | null;

type DocPageProps = {
  section: Section;
  entry: DocEntry;
  prev: Neighbor;
  next: Neighbor;
  onNavigate: (to: string) => void;
  /** Embedded in niceui.dev pages: render only the demos and API reference. */
  embed?: boolean;
};

export function DocPage({ section, entry, prev, next, onNavigate, embed = false }: DocPageProps) {
  if (entry.page) {
    const Page = entry.page;
    return (
      <div key={entry.slug} className="animate-fade-in">
        <Page onNavigate={onNavigate} />
      </div>
    );
  }

  return (
    <article key={entry.slug} className={embed ? 'pb-2' : 'mx-auto max-w-4xl px-4 pb-24 pt-10 sm:px-8 lg:pt-14'}>
      <div className={embed ? 'hidden' : 'animate-fade-up'}>
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-brand-400">
          {section.title}
          {entry.badge && (
            <span className="rounded-full bg-brand-500/10 px-2 py-0.5 text-[10px] tracking-wider text-brand-300 ring-1 ring-brand-500/30">
              {entry.badge}
            </span>
          )}
        </div>
        <h1 className="mt-3 text-3xl font-semibold text-ink-50 sm:text-4xl">{entry.name}</h1>
        <p className="mt-3 max-w-2xl text-base text-ink-400">{entry.description}</p>
      </div>

      <div className={embed ? 'space-y-12' : 'mt-10 space-y-12'}>
        {entry.demos?.map((demo, i) => (
          <div key={i} className="animate-fade-up" style={{ animationDelay: `${80 + i * 60}ms` }}>
            <Preview demo={demo} />
          </div>
        ))}
      </div>

      {entry.props && entry.props.length > 0 && (
        <section className="mt-14 animate-fade-up">
          <h2 className="text-xl font-semibold text-ink-50">API reference</h2>
          <div className="mt-4 overflow-x-auto rounded-2xl bg-ink-900 shadow-card">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-ink-500">
                  <th className="px-5 py-3 font-medium">Prop</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Default</th>
                  <th className="px-5 py-3 font-medium">Description</th>
                </tr>
              </thead>
              <tbody>
                {entry.props.map((p) => (
                  <tr key={p.name} className="border-b border-white/5 last:border-0 transition-colors hover:bg-white/[0.02]">
                    <td className="px-5 py-3 font-mono text-[13px] text-brand-300">{p.name}</td>
                    <td className="px-5 py-3 font-mono text-[12px] text-ink-300">{p.type}</td>
                    <td className="px-5 py-3 font-mono text-[12px] text-ink-500">{p.default ?? '—'}</td>
                    <td className="px-5 py-3 text-ink-400">{p.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <nav className={embed ? 'hidden' : 'mt-16 grid gap-3 border-t border-white/5 pt-8 sm:grid-cols-2'}>
        {prev ? (
          <button
            onClick={() => onNavigate(`/${prev.section.id}/${prev.entry.slug}`)}
            className="focus-ring group rounded-xl p-4 text-left shadow-hairline transition-all hover:bg-white/[0.03]"
          >
            <span className="flex items-center gap-1.5 text-xs text-ink-500">
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" /> Previous
            </span>
            <span className="mt-1 block font-medium text-ink-100">{prev.entry.name}</span>
          </button>
        ) : (
          <span />
        )}
        {next && (
          <button
            onClick={() => onNavigate(`/${next.section.id}/${next.entry.slug}`)}
            className="focus-ring group rounded-xl p-4 text-right shadow-hairline transition-all hover:bg-white/[0.03]"
          >
            <span className="flex items-center justify-end gap-1.5 text-xs text-ink-500">
              Next <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
            <span className="mt-1 block font-medium text-ink-100">{next.entry.name}</span>
          </button>
        )}
      </nav>
    </article>
  );
}
