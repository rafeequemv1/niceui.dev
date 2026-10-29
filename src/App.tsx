import { useEffect, useRef, useState } from 'react';
import { Github, Menu, X } from 'lucide-react';
import { Sidebar } from '@/docs/Sidebar';
import { DocPage } from '@/docs/DocPage';
import { NotFoundPage } from '@/components/blocks/NotFound';
import { resolveRoute, sections } from '@/registry';
import { useHashRoute } from '@/lib/router';
import { cn } from '@/lib/cn';

function App() {
  const { path, navigate } = useHashRoute();
  const [menuOpen, setMenuOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const route = resolveRoute(path);
  const activePath = path === '/' ? `/${route.current.section.id}/${route.current.entry.slug}` : path;

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
    setMenuOpen(false);
    document.title = route.found ? `${route.current.entry.name} — NiceUI` : 'Not found — NiceUI';
  }, [path, route.found, route.current.entry.name]);

  const go = (to: string) => navigate(to);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-ink-950">
      <header className="relative z-30 flex h-14 shrink-0 items-center justify-between border-b border-white/5 bg-ink-950/80 px-4 backdrop-blur-xl sm:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="focus-ring -ml-1 flex h-9 w-9 items-center justify-center rounded-lg text-ink-300 hover:bg-white/5 lg:hidden"
            aria-label="Toggle navigation"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <a href="/" className="focus-ring flex items-center gap-2.5 rounded-lg" aria-label="NiceUI home">
            <svg viewBox="0 0 28 28" className="h-6 w-6 text-white" aria-hidden="true">
              <circle cx="14" cy="14" r="13" fill="none" stroke="currentColor" strokeOpacity=".22" />
              <path d="M5 17a9 9 0 0 1 18 0" fill="none" stroke="#7dd3fc" strokeWidth="1.6" strokeLinecap="round" />
              <circle cx="14" cy="17" r="2" fill="#7dd3fc" />
            </svg>
            <span className="text-base font-medium tracking-[-0.02em] text-ink-50">niceui</span>
          </a>
        </div>
        <nav className="flex items-center gap-1 text-sm">
          <a href="/" className="focus-ring hidden rounded-lg px-3 py-1.5 text-ink-400 transition-colors hover:text-ink-50 md:block">
            Library
          </a>
          {[
            ['Docs', '/intro/home'],
            ['Landing', '/landing/saas-landing'],
            ['Components', '/components/button'],
            ['Dashboards', '/examples/analytics'],
          ].map(([label, to]) => (
            <button
              key={label}
              onClick={() => go(to)}
              className={cn(
                'focus-ring hidden rounded-lg px-3 py-1.5 transition-colors hover:text-ink-50 md:block',
                activePath.split('/')[1] === to.split('/')[1] ? 'text-ink-50' : 'text-ink-400',
              )}
            >
              {label}
            </button>
          ))}
          <span className="mx-2 hidden h-5 w-px bg-white/10 md:block" />
          <a
            href="https://github.com/rafeequemv1/niceui.dev"
            target="_blank"
            rel="noreferrer"
            className="focus-ring flex h-9 w-9 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-white/5 hover:text-ink-50"
            aria-label="GitHub"
          >
            <Github className="h-[18px] w-[18px]" />
          </a>
        </nav>
      </header>

      <div className="relative flex min-h-0 flex-1">
        <aside
          className={cn(
            'absolute inset-y-0 left-0 z-20 w-72 shrink-0 border-r border-white/5 bg-ink-950 pt-4 transition-transform duration-300 ease-smooth lg:static lg:w-64 lg:translate-x-0',
            menuOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <Sidebar sections={sections} activePath={activePath} onNavigate={go} />
        </aside>
        {menuOpen && (
          <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-sm animate-fade-in lg:hidden" onClick={() => setMenuOpen(false)} />
        )}
        <main ref={mainRef} className="min-w-0 flex-1 overflow-y-auto">
          {route.found ? (
            <DocPage
              key={activePath}
              section={route.current.section}
              entry={route.current.entry}
              prev={route.prev}
              next={route.next}
              onNavigate={go}
            />
          ) : (
            <NotFoundPage onHome={() => go('/intro/home')} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
