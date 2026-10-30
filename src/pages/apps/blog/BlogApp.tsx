import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, Bookmark, Check, Clock, Link2, Search } from 'lucide-react';
import { cn } from '@/lib/cn';
import { artwork } from '@/components/gallery/art';

type Post = { id: number; title: string; dek: string; cat: string; author: string; role: string; date: string; mins: number; img: number };

const CATS = ['All', 'Design', 'Engineering', 'AI', 'Culture'] as const;

const POSTS: Post[] = [
  { id: 0, title: 'The quiet interface: designing software that gets out of the way', dek: 'Why the best tools of the next decade will feel less like apps and more like good assistants.', cat: 'Design', author: 'Maya Ocampo', role: 'Design Lead', date: 'Oct 28, 2026', mins: 9, img: 7 },
  { id: 1, title: 'Shipping agents to production without losing sleep', dek: 'Evals, guardrails and the observability stack we wish we had on day one.', cat: 'AI', author: 'Jonah Reyes', role: 'Staff Engineer', date: 'Oct 24, 2026', mins: 12, img: 1 },
  { id: 2, title: 'A field guide to variable fonts on the web', dek: 'Performance, fallbacks and the three axes that matter most.', cat: 'Design', author: 'Lena Fischer', role: 'Type Designer', date: 'Oct 19, 2026', mins: 7, img: 8 },
  { id: 3, title: 'Edge functions are boring now, and that is good', dek: 'What changed when cold starts stopped being the story.', cat: 'Engineering', author: 'Priya Natarajan', role: 'Platform Engineer', date: 'Oct 15, 2026', mins: 8, img: 2 },
  { id: 4, title: 'Remote studios and the return of the long lunch', dek: 'Small rituals that keep distributed teams feeling like teams.', cat: 'Culture', author: 'Tomás Lindqvist', role: 'Studio Director', date: 'Oct 11, 2026', mins: 6, img: 3 },
  { id: 5, title: 'Prompting is product design', dek: 'Treat your system prompt like an onboarding flow and watch quality climb.', cat: 'AI', author: 'Aisha Rahman', role: 'Product Manager', date: 'Oct 6, 2026', mins: 10, img: 5 },
  { id: 6, title: 'Postgres as a queue, revisited', dek: 'Two years later: what held up, what broke, and the 40 lines that saved us.', cat: 'Engineering', author: 'Noah Kim', role: 'Backend Engineer', date: 'Sep 30, 2026', mins: 11, img: 10 },
];

const SECTIONS = [
  { id: 'start', h: 'Start with the job, not the screen', p: ['Most products begin life as a list of screens. The best ones begin as a list of jobs: the handful of moments where someone needs something done and would rather not think about how.', 'When you design for the job, the interface often shrinks. A form becomes a sentence. A settings page becomes a sensible default and one honest toggle.'] },
  { id: 'defaults', h: 'Defaults are the product', p: ['Ninety percent of people never change a default. That makes every default a decision you are making on their behalf, at scale.', 'We audited ours last spring and found eleven that existed only because someone once asked for them. Removing seven made the product measurably faster to learn.'] },
  { id: 'motion', h: 'Motion that explains, not decorates', p: ['Animation earns its place when it answers a question: where did that go, what just changed, what can I do next. Everything else is noise with a frame rate.', 'Our rule of thumb is simple. If you would not miss it after a week, cut it.'] },
  { id: 'quiet', h: 'The case for quiet', p: ['Quiet software is not minimal for its own sake. It is software that respects attention, which turns out to be the scarcest thing any of us have.', 'The next decade of interfaces will be judged less by what they show and more by what they let you ignore.'] },
];

export function BlogApp() {
  const [cat, setCat] = useState<(typeof CATS)[number]>('All');
  const [q, setQ] = useState('');
  const [post, setPost] = useState<Post | null>(null);
  const [saved, setSaved] = useState<Set<number>>(new Set([1]));
  const [joined, setJoined] = useState(false);
  const top = useRef<HTMLDivElement>(null);

  const list = useMemo(() => POSTS.filter((p) => (cat === 'All' || p.cat === cat) && (!q || (p.title + p.dek).toLowerCase().includes(q.toLowerCase()))), [cat, q]);
  const [featured, ...rest] = list;

  const open = (p: Post) => {
    setPost(p);
    requestAnimationFrame(() => top.current?.scrollIntoView({ block: 'start' }));
  };
  const toggleSave = (id: number) =>
    setSaved((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  return (
    <div ref={top} className="relative min-h-screen overflow-x-clip bg-[#0a0a0b] font-sans text-zinc-200 antialiased selection:bg-amber-300/30">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0a0a0b]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
          <button onClick={() => setPost(null)} className="text-[20px] font-semibold tracking-[-0.03em] text-white">
            Field <em className="font-serif font-normal italic text-amber-300">Notes</em>
          </button>
          {!post && (
            <label className="hidden h-9 min-w-0 flex-1 items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 text-[13px] sm:flex sm:max-w-xs">
              <Search className="h-3.5 w-3.5 text-zinc-500" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search articles" aria-label="Search articles" className="min-w-0 flex-1 bg-transparent text-zinc-100 outline-none placeholder:text-zinc-500" />
            </label>
          )}
          <a href="#bl-news" className="rounded-full bg-white px-4 py-2 text-[13px] font-medium text-zinc-900 hover:bg-zinc-200">
            Subscribe
          </a>
        </div>
      </header>

      {post ? <Article post={post} onBack={() => setPost(null)} onOpen={open} saved={saved.has(post.id)} onSave={() => toggleSave(post.id)} /> : (
        <main className="mx-auto max-w-6xl px-5 pb-10 pt-10 sm:px-8">
          <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Categories">
            {CATS.map((c) => (
              <button key={c} role="tab" aria-selected={cat === c} onClick={() => setCat(c)} className={cn('rounded-full px-3.5 py-1.5 text-[13px] transition-colors', cat === c ? 'bg-white text-zinc-900' : 'text-zinc-400 ring-1 ring-white/10 hover:text-white')}>
                {c}
              </button>
            ))}
          </div>

          {!featured && <p className="py-20 text-center text-zinc-500">No articles match “{q}”.</p>}

          {featured && (
            <button onClick={() => open(featured)} className="group mt-8 grid w-full gap-6 text-left md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] md:items-center">
              <div className="aspect-[16/10] overflow-hidden rounded-[22px] bg-zinc-900">
                <img src={artwork(featured.img, 1100, 690)} alt="" className="h-full w-full object-cover transition-transform duration-700 ease-smooth group-hover:scale-[1.03]" />
              </div>
              <div>
                <Meta p={featured} />
                <h1 className="mt-4 text-[32px] font-semibold leading-[1.08] tracking-[-0.035em] text-white sm:text-[42px]">{featured.title}</h1>
                <p className="mt-4 text-[16px] leading-relaxed text-zinc-400">{featured.dek}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-[14px] font-medium text-amber-300">
                  Read the story <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </button>
          )}

          {rest.length > 0 && (
            <div className="mt-14 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((p) => (
                <Card key={p.id} p={p} onOpen={open} saved={saved.has(p.id)} onSave={() => toggleSave(p.id)} />
              ))}
            </div>
          )}
        </main>
      )}

      <section id="bl-news" className="mx-auto max-w-6xl px-5 pb-10 sm:px-8">
        <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-gradient-to-br from-amber-300/10 via-transparent to-transparent p-8 sm:p-12">
          <h2 className="max-w-lg text-[28px] font-semibold leading-tight tracking-[-0.03em] text-white sm:text-[36px]">
            One thoughtful email, <em className="font-serif font-normal italic text-amber-300">every Sunday.</em>
          </h2>
          <p className="mt-3 max-w-md text-[15px] text-zinc-400">New essays on design, engineering and AI. No noise, unsubscribe anytime.</p>
          {joined ? (
            <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-4 py-2 text-[14px] text-emerald-300 animate-scale-in">
              <Check className="h-4 w-4" /> You're in. See you Sunday.
            </p>
          ) : (
            <form
              onSubmit={(e: FormEvent) => {
                e.preventDefault();
                setJoined(true);
              }}
              className="mt-6 flex max-w-md flex-col gap-2 sm:flex-row"
            >
              <input required type="email" placeholder="you@company.com" aria-label="Email" className="h-11 min-w-0 flex-1 rounded-full border border-white/10 bg-white/5 px-4 text-[14px] text-white outline-none placeholder:text-zinc-500 focus:border-amber-300/60" />
              <button className="h-11 rounded-full bg-amber-300 px-5 text-[14px] font-medium text-zinc-900 hover:bg-amber-200">Subscribe</button>
            </form>
          )}
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-col gap-2 border-t border-white/5 px-5 py-8 text-[13px] text-zinc-500 sm:flex-row sm:justify-between sm:px-8">
        <span>© 2026 Field Notes</span>
        <span>RSS · Archive · About · Write for us</span>
      </footer>
    </div>
  );
}

function Meta({ p }: { p: Post }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-zinc-500">
      <span className="rounded-full bg-amber-300/10 px-2 py-0.5 font-medium text-amber-300">{p.cat}</span>
      <span>{p.date}</span>
      <span className="flex items-center gap-1">
        <Clock className="h-3 w-3" /> {p.mins} min read
      </span>
    </div>
  );
}

function Card({ p, onOpen, saved, onSave }: { p: Post; onOpen: (p: Post) => void; saved: boolean; onSave: () => void }) {
  return (
    <article className="group relative">
      <button onClick={() => onOpen(p)} className="block w-full text-left">
        <div className="aspect-[16/10] overflow-hidden rounded-[18px] bg-zinc-900">
          <img src={artwork(p.img, 720, 450)} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 ease-smooth group-hover:scale-[1.04]" />
        </div>
        <div className="mt-4">
          <Meta p={p} />
          <h3 className="mt-2.5 text-[19px] font-semibold leading-snug tracking-[-0.02em] text-white transition-colors group-hover:text-amber-200">{p.title}</h3>
          <p className="mt-2 line-clamp-2 text-[14px] leading-relaxed text-zinc-400">{p.dek}</p>
          <p className="mt-3 text-[13px] text-zinc-500">{p.author}</p>
        </div>
      </button>
      <button onClick={onSave} aria-label={saved ? 'Remove bookmark' : 'Bookmark'} aria-pressed={saved} className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/50 backdrop-blur transition-colors hover:bg-black/70">
        <Bookmark className={cn('h-4 w-4', saved ? 'fill-amber-300 text-amber-300' : 'text-white')} />
      </button>
    </article>
  );
}

function Article({ post, onBack, onOpen, saved, onSave }: { post: Post; onBack: () => void; onOpen: (p: Post) => void; saved: boolean; onSave: () => void }) {
  const body = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(SECTIONS[0].id);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const el = body.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const view = window.top?.innerHeight ?? window.innerHeight;
      // works standalone and inside an auto-sized preview frame
      let top = r.top;
      try {
        const frame = window.frameElement as HTMLElement | null;
        if (frame) top += frame.getBoundingClientRect().top;
      } catch {}
      const p = Math.min(1, Math.max(0, (view * 0.3 - top) / Math.max(1, r.height - view * 0.4)));
      setProgress(p);
      for (const s of [...SECTIONS].reverse()) {
        const h = document.getElementById(`bl-${s.id}`);
        if (!h) continue;
        let ht = h.getBoundingClientRect().top;
        try {
          const frame = window.frameElement as HTMLElement | null;
          if (frame) ht += frame.getBoundingClientRect().top;
        } catch {}
        if (ht < view * 0.35) {
          setActive(s.id);
          break;
        }
      }
    };
    onScroll();
    const targets: (Window | null)[] = [window];
    try {
      if (window.top && window.top !== window) targets.push(window.top);
    } catch {}
    targets.forEach((t) => t?.addEventListener('scroll', onScroll, { passive: true }));
    return () => targets.forEach((t) => t?.removeEventListener('scroll', onScroll));
  }, [post.id]);

  const related = POSTS.filter((p) => p.id !== post.id && (p.cat === post.cat || p.id % 3 === post.id % 3)).slice(0, 3);

  return (
    <main className="animate-fade-in">
      <div className="sticky top-16 z-30 h-0.5 bg-white/5" aria-hidden>
        <div className="h-full bg-amber-300 transition-[width] duration-150" style={{ width: `${progress * 100}%` }} />
      </div>
      <div className="mx-auto max-w-6xl px-5 pt-8 sm:px-8">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-[13px] text-zinc-400 hover:text-white">
          <ArrowLeft className="h-3.5 w-3.5" /> All articles
        </button>
        <div className="mx-auto mt-8 max-w-3xl text-center">
          <div className="flex justify-center">
            <Meta p={post} />
          </div>
          <h1 className="mt-5 text-[34px] font-semibold leading-[1.06] tracking-[-0.04em] text-white sm:text-[52px]">{post.title}</h1>
          <p className="mt-5 text-[18px] leading-relaxed text-zinc-400">{post.dek}</p>
        </div>
        <div className="mt-10 aspect-[21/9] overflow-hidden rounded-[24px] bg-zinc-900">
          <img src={artwork(post.img, 1400, 600)} alt="" className="h-full w-full object-cover" />
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[200px_minmax(0,1fr)_200px]">
        <nav aria-label="Contents" className="hidden lg:block">
          <div className="sticky top-28">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">Contents</p>
            <ul className="mt-3 space-y-2 border-l border-white/10">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a href={`#bl-${s.id}`} className={cn('-ml-px block border-l-2 py-0.5 pl-3 text-[13px] transition-colors', active === s.id ? 'border-amber-300 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300')}>
                    {s.h}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div ref={body} className="mx-auto w-full max-w-[680px]">
          {SECTIONS.map((s, i) => (
            <section key={s.id}>
              <h2 id={`bl-${s.id}`} className="scroll-mt-24 pt-2 text-[24px] font-semibold tracking-[-0.025em] text-white">
                {s.h}
              </h2>
              {s.p.map((t, j) => (
                <p key={j} className={cn('mt-4 text-[17px] leading-[1.8] text-zinc-300', i === 0 && j === 0 && 'first-letter:float-left first-letter:mr-2 first-letter:font-serif first-letter:text-[64px] first-letter:leading-[0.9] first-letter:text-amber-300')}>
                  {t}
                </p>
              ))}
              {i === 1 && (
                <blockquote className="my-10 border-l-2 border-amber-300 pl-6 font-serif text-[26px] italic leading-snug text-white">
                  “Every default is a decision you are making on someone's behalf, at scale.”
                </blockquote>
              )}
              <div className="h-8" />
            </section>
          ))}

          <div className="mt-6 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-amber-300 text-[15px] font-semibold text-zinc-900">
              {post.author
                .split(' ')
                .map((w) => w[0])
                .join('')}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-medium text-white">{post.author}</p>
              <p className="text-[13px] text-zinc-500">{post.role} · writes about {post.cat.toLowerCase()} and the craft of building</p>
            </div>
            <button className="hidden rounded-full px-4 py-2 text-[13px] text-zinc-200 ring-1 ring-white/15 hover:bg-white/5 sm:block">Follow</button>
          </div>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-28 space-y-2">
            <button onClick={onSave} aria-pressed={saved} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[13px] text-zinc-300 ring-1 ring-white/10 hover:bg-white/5">
              <Bookmark className={cn('h-4 w-4', saved && 'fill-amber-300 text-amber-300')} /> {saved ? 'Saved' : 'Save'}
            </button>
            <button
              onClick={() => {
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1600);
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[13px] text-zinc-300 ring-1 ring-white/10 hover:bg-white/5"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Link2 className="h-4 w-4" />} {copied ? 'Link copied' : 'Copy link'}
            </button>
          </div>
        </aside>
      </div>

      <section className="mx-auto max-w-6xl border-t border-white/5 px-5 py-12 sm:px-8">
        <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-white">Keep reading</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {related.map((p) => (
            <button key={p.id} onClick={() => onOpen(p)} className="group text-left">
              <div className="aspect-[16/10] overflow-hidden rounded-[16px] bg-zinc-900">
                <img src={artwork(p.img, 600, 375)} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
              </div>
              <p className="mt-3 text-[16px] font-medium leading-snug text-white group-hover:text-amber-200">{p.title}</p>
              <p className="mt-1 text-[12.5px] text-zinc-500">{p.mins} min read</p>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
