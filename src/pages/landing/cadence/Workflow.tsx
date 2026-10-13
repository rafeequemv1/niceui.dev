import { useEffect, useState } from 'react';
import { CalendarCheck, CheckCircle2, Eye, FileEdit, Lock, MessageSquare, ShieldCheck, Users } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Reveal, useInView } from '@/pages/landing/shared/motion';
import { NetworkBadge } from './logos';
import { Avatar, IMG, PEOPLE } from './shared';

const STAGES = [
  { label: 'Draft', Icon: FileEdit, chip: 'bg-stone-100 text-stone-700', dot: 'bg-stone-400', who: PEOPLE.amara },
  { label: 'In review', Icon: Eye, chip: 'bg-amber-50 text-amber-800', dot: 'bg-amber-500', who: PEOPLE.maya },
  { label: 'Approved', Icon: CheckCircle2, chip: 'bg-emerald-50 text-emerald-800', dot: 'bg-emerald-500', who: PEOPLE.theo },
  { label: 'Scheduled', Icon: CalendarCheck, chip: 'bg-sky-50 text-sky-800', dot: 'bg-sky-500', who: PEOPLE.amara },
];

const COMMENTS = [
  { stage: 0, who: PEOPLE.amara, text: 'First pass on the launch caption — added the Huila farm angle.', time: '9:02' },
  { stage: 1, who: PEOPLE.maya, text: 'Love it. Can we swap the hero for the latte shot? Feels warmer.', time: '9:14' },
  { stage: 1, who: PEOPLE.amara, text: 'Swapped. Also trimmed the X version to 240 chars.', time: '9:16' },
  { stage: 2, who: PEOPLE.theo, text: 'Approved. This one is going to do numbers.', time: '9:31' },
];

const PERKS = [
  { Icon: Users, title: 'Roles & permissions', body: 'Creators draft, editors review, clients approve. Everyone sees exactly what they should.' },
  { Icon: MessageSquare, title: 'Threaded feedback', body: 'Comment on the exact line or image. Resolve, mention and move on.' },
  { Icon: ShieldCheck, title: 'Brand-safe by default', body: 'Nothing goes live without sign-off, and every change is logged.' },
];

export function Workflow() {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  const [stage, setStage] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!inView || paused) return;
    const id = window.setInterval(() => setStage((s) => (s + 1) % STAGES.length), 2400);
    return () => window.clearInterval(id);
  }, [inView, paused]);

  const cur = STAGES[stage];

  return (
    <section id="workflow" className="scroll-mt-20 bg-stone-900 py-24 text-white sm:py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-16 px-4 sm:px-6 lg:grid-cols-2">
        <div>
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium tracking-wide text-stone-300">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF5A36]" /> Team workflow
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mt-4 text-4xl font-medium leading-[1.1] tracking-[-0.03em] sm:text-5xl">
              Approvals that feel <span className="font-serif font-normal italic tracking-normal text-[#FF8A6B]">effortless.</span>
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-4 max-w-lg text-lg leading-relaxed text-stone-400">
              From first draft to published, every post moves through a clear, shared pipeline. No more screenshots in group chats.
            </p>
          </Reveal>
          <div className="mt-10 space-y-6">
            {PERKS.map((p, i) => (
              <Reveal key={p.title} delay={200 + i * 80}>
                <div className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
                    <p.Icon className="h-5 w-5 text-[#FF8A6B]" />
                  </span>
                  <div>
                    <div className="font-medium">{p.title}</div>
                    <div className="mt-1 text-sm leading-relaxed text-stone-400">{p.body}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal delay={120}>
          <div
            ref={ref}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            className="rounded-3xl bg-[#FBFAF7] p-4 text-stone-900 shadow-[0_40px_80px_-24px_rgba(0,0,0,0.6)] sm:p-6"
          >
            <div className="relative grid grid-cols-4 gap-2">
              <div className="absolute left-[12.5%] right-[12.5%] top-5 h-0.5 bg-stone-200">
                <div className="h-full bg-[#FF5A36] transition-all duration-700 ease-spring" style={{ width: `${(stage / (STAGES.length - 1)) * 100}%` }} />
              </div>
              {STAGES.map((s, i) => (
                <button key={s.label} type="button" onClick={() => setStage(i)} className="group relative flex flex-col items-center gap-2">
                  <span
                    className={cn(
                      'relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-500 ease-spring',
                      i < stage && 'border-[#FF5A36] bg-[#FF5A36] text-white',
                      i === stage && 'scale-110 border-[#FF5A36] bg-white text-[#FF5A36] shadow-[0_0_0_6px_rgba(255,90,54,0.12)]',
                      i > stage && 'border-stone-200 bg-white text-stone-400 group-hover:border-stone-400',
                    )}
                  >
                    <s.Icon className="h-4 w-4" />
                  </span>
                  <span className={cn('text-center text-[11px] font-medium sm:text-xs', i <= stage ? 'text-stone-900' : 'text-stone-400')}>{s.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Avatar src={cur.who.img} name={cur.who.name} className="h-7 w-7" />
                  <div className="leading-tight">
                    <div className="text-xs font-medium">Cold brew launch</div>
                    <div className="text-[11px] text-stone-500">Owner · {cur.who.name.split(' ')[0]}</div>
                  </div>
                </div>
                <span key={stage} className={cn('inline-flex animate-scale-in items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium', cur.chip)}>
                  <span className={cn('h-1.5 w-1.5 rounded-full', cur.dot)} />
                  {cur.label}
                </span>
              </div>
              <div className="mt-4 flex gap-3">
                <img src={stage >= 1 ? IMG.latte : IMG.citrus} alt="" className="h-20 w-20 shrink-0 rounded-xl object-cover transition-all duration-500" />
                <div className="min-w-0">
                  <p className="text-sm leading-relaxed text-stone-700">
                    Our 18-hour cold brew lands Saturday. Smoother, bolder, small batch — and the first 50 cups are on us.
                  </p>
                  <div className="mt-2 flex gap-1">
                    <NetworkBadge id="instagram" size="xs" />
                    <NetworkBadge id="x" size="xs" />
                    <NetworkBadge id="linkedin" size="xs" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 min-h-[232px] space-y-3">
              {COMMENTS.filter((c) => c.stage <= stage).map((c) => (
                <div key={c.text} className="flex animate-fade-up gap-2.5">
                  <Avatar src={c.who.img} name={c.who.name} className="h-7 w-7" />
                  <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md bg-white px-3 py-2 ring-1 ring-stone-200">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-medium text-stone-900">{c.who.name}</span>
                      <span className="font-mono text-stone-400">{c.time}</span>
                    </div>
                    <div className="mt-0.5 text-xs leading-relaxed text-stone-600">{c.text}</div>
                  </div>
                </div>
              ))}
              {stage === 3 && (
                <div className="flex animate-fade-up items-center gap-2 rounded-2xl bg-sky-50 px-3 py-2.5 text-xs text-sky-900 ring-1 ring-sky-100">
                  <Lock className="h-3.5 w-3.5" />
                  Locked & scheduled for <span className="font-medium">Sat, 9:00 AM</span> on 3 networks
                </div>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
