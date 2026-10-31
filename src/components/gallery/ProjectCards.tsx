import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { artwork } from './art';

export type Project = { title: string; client: string; year: number; tags: string[]; images: string[] };

function ProjectCard({ project, autoplay }: { project: Project; autoplay?: boolean }) {
  const [hover, setHover] = useState(false);
  const [i, setI] = useState(0);
  const on = hover || autoplay;
  useEffect(() => {
    if (!on || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return setI(0);
    const id = window.setInterval(() => setI((v) => (v + 1) % project.images.length), 900);
    return () => clearInterval(id);
  }, [on, project.images.length]);

  return (
    <a
      href="#"
      onClick={(e) => e.preventDefault()}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      className="focus-ring group block rounded-2xl"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-ink-900 shadow-card">
        {project.images.map((src, k) => (
          <img key={k} src={src} alt="" className={cn('absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-smooth', k === i ? 'scale-100 opacity-100' : 'scale-105 opacity-0')} />
        ))}
        <div className="absolute inset-x-3 top-3 flex gap-1">
          {project.images.map((_, k) => (
            <span key={k} className={cn('h-0.5 flex-1 rounded-full transition-colors', k === i && on ? 'bg-white' : 'bg-white/25')} />
          ))}
        </div>
        <span className={cn('absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-white text-ink-950 transition-all duration-500 ease-spring', on ? 'scale-100 opacity-100' : 'scale-50 opacity-0')}>
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[15px] font-medium tracking-tight text-ink-50">{project.title}</h3>
          <p className="text-[12.5px] text-ink-400">{project.client}</p>
        </div>
        <span className="shrink-0 font-mono text-[11px] text-ink-500">{project.year}</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {project.tags.map((t) => (
          <span key={t} className="rounded-full border border-white/10 px-2 py-0.5 text-[10.5px] text-ink-300">{t}</span>
        ))}
      </div>
    </a>
  );
}

export function ProjectCards({ projects, className }: { projects: Project[]; className?: string }) {
  return (
    <div className={cn('grid w-full gap-5 sm:grid-cols-3', className)}>
      {projects.map((p, i) => (
        <ProjectCard key={p.title} project={p} autoplay={i === 0} />
      ))}
    </div>
  );
}

export function ProjectCardsDemo() {
  const projects = useMemo(
    () => [
      { title: 'Low Tide Campaign', client: 'Comporta Hotels', year: 2026, tags: ['Film', 'Art direction'], images: [0, 6, 9].map((id) => artwork(id, 640, 480)) },
      { title: 'Neon Bloom Identity', client: 'Kyoto Arts Week', year: 2025, tags: ['Branding', 'Motion'], images: [1, 8, 4].map((id) => artwork(id, 640, 480)) },
      { title: 'Glass Lagoon Series', client: 'Faroe Tourism', year: 2025, tags: ['Photography'], images: [2, 7, 10].map((id) => artwork(id, 640, 480)) },
    ],
    [],
  );
  return <ProjectCards projects={projects} />;
}
