import { useEffect, useMemo, useRef, useState } from 'react';
import { AudioLines, Captions, FileVideo2, LoaderCircle, RotateCcw, Scissors, Search, Sparkles, Type } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Reveal } from '@/pages/landing/shared/motion';
import { hash } from './dither';
import { SectionHead, Serif } from './ui';

type Word = { text: string; dur: number; filler: boolean; flub: boolean };

const LINE =
  'So, {um} the first thing you learn on a shoot is that {like} the light never waits for you. We shot the whole opening on a ~Tuesday~, {uh} right before the storm rolled in, and {you} {know} that’s the shot everyone remembers.';

const WORDS: Word[] = LINE.split(' ').map((raw) => {
  const filler = raw.startsWith('{');
  const flub = raw.startsWith('~');
  const text = raw.replace(/[{}~]/g, '');
  return { text, filler, flub, dur: filler ? 0.5 : 0.16 + text.replace(/\W/g, '').length * 0.045 };
});
const FILLER_IDS = WORDS.map((w, i) => (w.filler ? i : -1)).filter((i) => i >= 0);
const FLUB = WORDS.findIndex((w) => w.flub);
const TOTAL = WORDS.reduce((s, w) => s + w.dur, 0);

const points = [
  { icon: Type, title: 'Delete a sentence, lose the shot', body: 'Strike words in the script and the picture, audio and captions ripple with it.' },
  { icon: AudioLines, title: 'Overdub a flub', body: 'Type the word you meant. Rushes says it in your voice, matched to the room.' },
  { icon: Search, title: 'Search what was said', body: 'Every take is transcribed, so “that line about the storm” is one search away.' },
];

export function ScriptSection() {
  return (
    <section id="rushes-script" className="relative scroll-mt-16 py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] items-center gap-14 px-5 sm:px-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
        <div>
          <SectionHead
            tag="Text-based editing"
            title={
              <>
                Edit the words.
                <br />
                <Serif>The cut follows.</Serif>
              </>
            }
            body="Your footage arrives as a document. Read it, trim it, rewrite it. Rushes keeps every frame, waveform and caption in sync underneath."
          />
          <div className="mt-10 space-y-6">
            {points.map((p, i) => (
              <Reveal key={p.title} delay={i * 90} className="flex gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-zinc-200 bg-white text-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <p.icon className="h-[18px] w-[18px]" />
                </span>
                <div>
                  <h3 className="text-[16px] font-semibold tracking-[-0.01em] text-zinc-950">{p.title}</h3>
                  <p className="mt-1 text-[14.5px] leading-relaxed text-zinc-500">{p.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
        <Reveal delay={120}>
          <ScriptCard />
        </Reveal>
      </div>
    </section>
  );
}

function ScriptCard() {
  const [gone, setGone] = useState<Set<number>>(new Set());
  const [fixed, setFixed] = useState(false);
  const [dub, setDub] = useState<'closed' | 'open' | 'busy'>('closed');
  const [fix, setFix] = useState('Thursday');
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const toggle = (i: number) =>
    setGone((g) => {
      const n = new Set(g);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });
  const removeFillers = () =>
    FILLER_IDS.forEach((id, k) => timers.current.push(window.setTimeout(() => setGone((g) => new Set(g).add(id)), k * 110)));
  const restore = () => {
    timers.current.forEach(clearTimeout);
    setGone(new Set());
    setFixed(false);
    setDub('closed');
    setFix('Thursday');
  };
  const overdub = () => {
    setDub('busy');
    timers.current.push(
      window.setTimeout(() => {
        setFixed(true);
        setDub('closed');
      }, 1100),
    );
  };

  const dur = useMemo(() => WORDS.reduce((s, w, i) => s + (gone.has(i) ? 0 : w.dur), 0), [gone]);
  const fillersLeft = FILLER_IDS.filter((i) => !gone.has(i)).length;

  return (
    <div className="relative rounded-[28px] border border-zinc-200/80 bg-white p-2 shadow-[0_40px_80px_-40px_rgba(24,24,27,0.3)]">
      <div className="rounded-[22px] border border-zinc-100 bg-zinc-50/60">
        <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200/70 px-4 py-3">
          <FileVideo2 className="h-4 w-4 text-zinc-500" />
          <span className="text-[13px] font-medium text-zinc-900">interview_take3</span>
          <span className="font-mono text-[11px] text-zinc-400">.rushes</span>
          <div className="ml-auto flex items-center gap-1.5">
            <button onClick={removeFillers} disabled={!fillersLeft} className="inline-flex h-8 items-center gap-1.5 rounded-full bg-zinc-950 px-3 text-[12px] font-medium text-white transition-all hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-400 active:scale-95">
              <Scissors className="h-3.5 w-3.5" /> Remove {fillersLeft || ''} filler{fillersLeft === 1 ? '' : 's'}
            </button>
            <button onClick={restore} aria-label="Restore" className="grid h-8 w-8 place-items-center rounded-full text-zinc-500 ring-1 ring-zinc-200 transition-colors hover:bg-white hover:text-zinc-900">
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="relative px-5 pb-6 pt-5 sm:px-7">
          <p className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-zinc-400">Maya Ocampo · 00:41:12:03</p>
          <p className="text-[19px] leading-[1.7] tracking-[-0.01em] text-zinc-900 sm:text-[22px]">
            {WORDS.map((w, i) => {
              const off = gone.has(i);
              if (w.flub)
                return (
                  <span key={i} className="relative">
                    <button
                      onClick={() => !fixed && setDub((d) => (d === 'closed' ? 'open' : 'closed'))}
                      className={cn(
                        '-mx-1 rounded-md px-1 transition-all duration-500',
                        fixed ? 'bg-[#ff4f1f]/10 text-[#d63a0c]' : 'underline decoration-[#ff4f1f] decoration-dotted decoration-2 underline-offset-[5px] hover:bg-zinc-100',
                      )}
                    >
                      {fixed ? (
                        <span className="inline-flex items-center gap-1">
                          {fix || 'Thursday'}
                          <Sparkles className="h-3.5 w-3.5" />
                        </span>
                      ) : (
                        w.text
                      )}
                    </button>
                    {!fixed && dub === 'closed' && (
                      <button onClick={() => setDub('open')} className="ml-1 inline-flex -translate-y-[3px] items-center gap-0.5 rounded-full bg-[#ff4f1f] px-1.5 py-px align-middle font-mono text-[9.5px] font-medium uppercase tracking-wider text-white transition-transform hover:scale-105">
                        <Sparkles className="h-2.5 w-2.5" /> fix
                      </button>
                    )}
                    {dub !== 'closed' && (
                      <span className="absolute bottom-[calc(100%+10px)] left-1/2 z-10 w-[230px] -translate-x-1/2 rounded-2xl border border-zinc-200 bg-white p-2.5 text-left shadow-[0_20px_40px_-12px_rgba(0,0,0,0.25)] animate-scale-in">
                        <span className="flex items-center gap-1.5 px-1 text-[11px] font-medium text-zinc-500">
                          <AudioLines className="h-3.5 w-3.5 text-[#ff4f1f]" /> Overdub in Maya’s voice
                        </span>
                        <span className="mt-2 flex items-center gap-1.5">
                          <input value={fix} onChange={(e) => setFix(e.target.value)} disabled={dub === 'busy'} aria-label="Replacement word" className="h-8 min-w-0 flex-1 rounded-lg border border-zinc-200 px-2 text-[14px] text-zinc-900 outline-none focus:border-zinc-400" />
                          <button onClick={overdub} disabled={dub === 'busy' || !fix.trim()} className="inline-flex h-8 items-center gap-1 rounded-lg bg-zinc-950 px-2.5 text-[12px] font-medium text-white disabled:opacity-60">
                            {dub === 'busy' ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : 'Fix'}
                          </button>
                        </span>
                      </span>
                    )}{' '}
                  </span>
                );
              return (
                <span key={i}>
                  <button
                    onClick={() => toggle(i)}
                    className={cn(
                      '-mx-[3px] rounded-md px-[3px] transition-all duration-300',
                      off ? 'text-zinc-300 line-through decoration-[#ff4f1f] decoration-2' : w.filler ? 'bg-[#ff4f1f]/[0.08] text-[#d63a0c] hover:bg-[#ff4f1f]/15' : 'hover:bg-zinc-100',
                    )}
                  >
                    {w.text}
                  </button>{' '}
                </span>
              );
            })}
          </p>
        </div>

        <div className="border-t border-zinc-200/70 px-4 pb-4 pt-3 sm:px-5">
          <div className="relative flex h-14 w-full min-w-0 items-center overflow-hidden">
            {WORDS.map((w, i) => (
              <div key={i} className="flex h-full min-w-0 items-center justify-around overflow-hidden transition-all duration-700 ease-smooth" style={{ flexGrow: gone.has(i) ? 0 : w.dur, flexBasis: 0, opacity: gone.has(i) ? 0 : 1 }}>
                {Array.from({ length: Math.max(2, Math.round(w.dur * 16)) }, (_, b) => {
                  const r = hash(i * 13 + b, b * 7 + 3);
                  const env = Math.sin(((b + 0.5) / Math.max(2, Math.round(w.dur * 16))) * Math.PI);
                  const regen = w.flub && fixed;
                  return (
                    <span
                      key={b}
                      className={cn('w-[2px] shrink-0 rounded-full', w.filler ? 'bg-[#ff4f1f]/70' : regen ? 'bg-[#ff4f1f] animate-fade-in' : 'bg-zinc-800')}
                      style={{ height: `${(0.22 + env * (0.45 + r * 0.33)) * 100}%` }}
                    />
                  );
                })}
              </div>
            ))}
            <span className="pointer-events-none absolute inset-y-0 left-0 w-px bg-[#ff4f1f] [animation:rushes-sweep_9s_linear_infinite]" />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[12px] text-zinc-500">
            <span className="font-mono tabular-nums text-zinc-900">00:{dur.toFixed(2).padStart(5, '0')}</span>
            {dur < TOTAL - 0.01 && <span className="rounded-full bg-[#ff4f1f]/10 px-2 py-px font-mono text-[11px] text-[#d63a0c] animate-scale-in">−{(TOTAL - dur).toFixed(2)}s</span>}
            <span className="ml-auto flex items-center gap-3">
              {[
                [FileVideo2, 'Video'],
                [AudioLines, 'Audio'],
                [Captions, 'Captions'],
              ].map(([I, l]) => {
                const Icon = I as typeof FileVideo2;
                return (
                  <span key={l as string} className="flex items-center gap-1">
                    <Icon className="h-3.5 w-3.5" /> {l as string}
                  </span>
                );
              })}
              <span className="flex items-center gap-1 text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> in sync
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
