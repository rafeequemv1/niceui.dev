import { useEffect, useRef, useState } from 'react';
import { Check, Hash, ImageIcon, Smile, Sparkles, Wand2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Reveal } from '@/pages/landing/shared/motion';
import { NetworkBadge, networkMap, type NetworkId } from './logos';
import { SectionHeading } from './shared';
import { InstagramPreview, LinkedInPreview, TikTokPreview, XPreview } from './Previews';

const COMPOSER_NETS: NetworkId[] = ['x', 'instagram', 'linkedin', 'tiktok'];

type Tone = 'Witty' | 'Professional' | 'Casual';

const REWRITES: Record<Tone, string> = {
  Witty:
    'Our new cold brew is so smooth it should come with a warning label. Steeped 18 hours, gone in 18 seconds. First 50 cups are on us this Saturday — set an alarm. #coldbrew',
  Professional:
    'Introducing our 18-hour slow-steeped cold brew: a smoother body, lower acidity and beans sourced directly from our partner farm in Huila, Colombia. Available in every store from Saturday. #specialtycoffee',
  Casual:
    'ok we finally did it. cold brew, steeped for 18 hours, ridiculously smooth. swing by saturday — first 50 cups are on the house #coffeetime',
};

const DEFAULT_TEXT =
  'Big news: our 18-hour cold brew lands this Saturday. Smoother, bolder and brewed in small batches. First 50 cups are on us!';

const HASHTAGS = ['#coldbrew', '#coffeelover', '#smallbatch', '#weekendvibes', '#localcafe', '#specialtycoffee'];

function Counter({ id, len }: { id: NetworkId; len: number }) {
  const limit = networkMap[id].limit;
  const ratio = Math.min(1, len / limit);
  const left = limit - len;
  const r = 9;
  const c = 2 * Math.PI * r;
  const tone = left < 0 ? '#E11D48' : ratio > 0.85 ? '#D97706' : '#FF5A36';
  return (
    <div className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-2.5 py-2">
      <NetworkBadge id={id} size="xs" />
      <svg viewBox="0 0 24 24" className="h-5 w-5 -rotate-90">
        <circle cx="12" cy="12" r={r} fill="none" stroke="#E7E5E4" strokeWidth="3" />
        <circle
          cx="12"
          cy="12"
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - ratio)}
          className="transition-all duration-300 ease-smooth"
        />
      </svg>
      <span className={cn('font-mono text-xs tabular-nums', left < 0 ? 'text-rose-600' : 'text-stone-600')}>
        {left.toLocaleString()}
      </span>
    </div>
  );
}

export function Composer() {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [active, setActive] = useState<NetworkId[]>(['x', 'instagram', 'linkedin', 'tiktok']);
  const [tone, setTone] = useState<Tone>('Witty');
  const [streaming, setStreaming] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearInterval(timer.current), []);

  const toggle = (id: NetworkId) =>
    setActive((cur) => (cur.includes(id) ? (cur.length > 1 ? cur.filter((x) => x !== id) : cur) : [...cur, id]));

  const rewrite = () => {
    if (streaming) return;
    const target = REWRITES[tone];
    let i = 0;
    setStreaming(true);
    setText('');
    window.clearInterval(timer.current);
    timer.current = window.setInterval(() => {
      i += 3;
      setText(target.slice(0, i));
      if (i >= target.length) {
        window.clearInterval(timer.current);
        setStreaming(false);
      }
    }, 22);
  };

  const addTag = (tag: string) => {
    if (streaming) return;
    setText((t) => (t.includes(tag) ? t.replace(new RegExp(`\\s?${tag}\\b`), '') : `${t.trimEnd()} ${tag}`));
  };

  const ordered = COMPOSER_NETS.filter((n) => active.includes(n));

  return (
    <section id="composer" className="scroll-mt-20 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Composer"
          title="Write once."
          accent="Look native everywhere."
          body="Draft a single post and watch it adapt to every network in real time — character limits, truncation, hashtags and all. Then let AI tune the voice."
        />

        <div className="mt-16 grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
          <Reveal>
            <div className="rounded-3xl border border-stone-200 bg-white p-4 shadow-[0_24px_48px_-24px_rgba(28,25,23,0.25)] sm:p-6 lg:sticky lg:top-24">
              <div className="flex flex-wrap gap-2">
                {COMPOSER_NETS.map((id) => {
                  const on = active.includes(id);
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => toggle(id)}
                      aria-pressed={on}
                      className={cn(
                        'group flex items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-3 text-sm transition-all duration-300 ease-spring active:scale-95',
                        on ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 bg-white text-stone-500 hover:border-stone-400',
                      )}
                    >
                      <NetworkBadge id={id} size="sm" className={cn('transition-all duration-300', !on && 'opacity-40 grayscale')} />
                      {networkMap[id].name}
                      <span
                        className={cn(
                          'flex h-4 w-4 items-center justify-center rounded-full transition-all duration-300',
                          on ? 'scale-100 bg-[#FF5A36]' : 'scale-0',
                        )}
                      >
                        <Check className="h-3 w-3 text-white" strokeWidth={3} />
                      </span>
                    </button>
                  );
                })}
              </div>

              <div
                className={cn(
                  'relative mt-4 rounded-2xl border bg-stone-50/60 transition-all duration-300',
                  streaming ? 'border-[#FF5A36]/50 ring-4 ring-[#FF5A36]/10' : 'border-stone-200 focus-within:border-stone-400',
                )}
              >
                <label htmlFor="cad-composer" className="sr-only">Post text</label>
                <textarea
                  id="cad-composer"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  readOnly={streaming}
                  rows={6}
                  placeholder="What do you want to share?"
                  className="block w-full resize-none bg-transparent p-4 text-[15px] leading-relaxed text-stone-900 placeholder:text-stone-400 focus:outline-none"
                />
                {streaming && (
                  <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
                    <div className="absolute inset-0 animate-shimmer bg-[linear-gradient(110deg,transparent_30%,rgba(255,90,54,0.08)_50%,transparent_70%)] bg-[length:200%_100%]" />
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-stone-200/80 px-3 py-2">
                  <div className="flex gap-1 text-stone-400">
                    <span className="rounded-lg p-1.5 hover:bg-stone-200/60 hover:text-stone-700"><ImageIcon className="h-4 w-4" /></span>
                    <span className="rounded-lg p-1.5 hover:bg-stone-200/60 hover:text-stone-700"><Smile className="h-4 w-4" /></span>
                    <span className="rounded-lg p-1.5 hover:bg-stone-200/60 hover:text-stone-700"><Hash className="h-4 w-4" /></span>
                  </div>
                  <span className="font-mono text-xs text-stone-400">{text.length} chars</span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {ordered.map((id) => (
                  <Counter key={id} id={id} len={text.length} />
                ))}
              </div>

              <div className="mt-6 rounded-2xl bg-gradient-to-br from-[#FFF3EE] to-amber-50 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-stone-900">
                  <Sparkles className="h-4 w-4 text-[#FF5A36]" /> AI rewrite
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {(Object.keys(REWRITES) as Tone[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTone(t)}
                      className={cn(
                        'rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200',
                        tone === t ? 'bg-white text-stone-900 shadow-sm ring-1 ring-stone-900/10' : 'text-stone-600 hover:bg-white/60',
                      )}
                    >
                      {t}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={rewrite}
                    disabled={streaming}
                    className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-[#FF5A36] px-4 py-2 text-xs font-medium text-white shadow-[0_8px_20px_-8px_rgba(255,90,54,0.8)] transition-all duration-300 ease-spring hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-70"
                  >
                    <Wand2 className={cn('h-3.5 w-3.5', streaming && 'animate-spin-slow')} />
                    {streaming ? 'Writing…' : 'Rewrite'}
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <div className="text-xs font-medium uppercase tracking-wider text-stone-500">Suggested hashtags</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {HASHTAGS.map((tag) => {
                    const on = new RegExp(`${tag}\\b`).test(text);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => addTag(tag)}
                        className={cn(
                          'rounded-full border px-3 py-1 text-xs transition-all duration-200 active:scale-95',
                          on ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-stone-200 text-stone-600 hover:border-stone-400 hover:text-stone-900',
                        )}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="columns-1 gap-4 sm:columns-2">
              {ordered.map((id) => {
                const props = { text: text || ' ', streaming };
                if (id === 'x') return <XPreview key={id} {...props} />;
                if (id === 'instagram') return <InstagramPreview key={id} {...props} />;
                if (id === 'linkedin') return <LinkedInPreview key={id} {...props} />;
                return <TikTokPreview key={id} {...props} />;
              })}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
