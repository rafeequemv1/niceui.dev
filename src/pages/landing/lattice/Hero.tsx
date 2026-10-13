import { useEffect, useState } from 'react';
import { ArrowRight, Command, Menu, MousePointer2, Shapes, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Editor } from './Editor';
import { LButton, SelectionBox, scrollToSection } from './ui';

const nav = [
  { label: 'Product', id: 'ai' },
  { label: 'Multiplayer', id: 'multiplayer' },
  { label: 'Prototyping', id: 'prototype' },
  { label: 'Dev Mode', id: 'dev' },
  { label: 'Pricing', id: 'pricing' },
];

export function LatticeNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const main = document.querySelector('main');
    const onScroll = () => setScrolled((main?.scrollTop ?? 0) > 16 || window.scrollY > 16);
    main?.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      main?.removeEventListener('scroll', onScroll);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const go = (id: string) => {
    setOpen(false);
    scrollToSection(id);
  };

  return (
    <header className={cn('sticky top-0 z-50 transition-all duration-300', scrolled ? 'border-b border-zinc-200/80 bg-white/80 backdrop-blur-xl' : 'border-b border-transparent')}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <button onClick={() => go('top')} className="flex items-center gap-2.5">
          <span className="relative grid h-8 w-8 place-items-center rounded-lg bg-zinc-950 text-white">
            <Shapes className="h-4 w-4" />
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#0d99ff]" />
          </span>
          <span className="text-[17px] font-semibold tracking-tight text-zinc-950">Lattice</span>
        </button>
        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <button key={n.id} onClick={() => go(n.id)} className="rounded-lg px-3.5 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-950">{n.label}</button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <LButton variant="ghost" className="hidden h-9 sm:inline-flex" onClick={() => go('cta')}>Log in</LButton>
          <LButton className="h-9 px-4" onClick={() => go('cta')}>Get started</LButton>
          <button onClick={() => setOpen((o) => !o)} aria-label="Toggle menu" className="grid h-9 w-9 place-items-center rounded-lg text-zinc-900 hover:bg-zinc-100 md:hidden">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      <div className={cn('grid border-zinc-200 bg-white transition-all duration-300 md:hidden', open ? 'grid-rows-[1fr] border-t' : 'grid-rows-[0fr]')}>
        <div className="overflow-hidden">
          <div className="flex flex-col p-3">
            {nav.map((n) => (
              <button key={n.id} onClick={() => go(n.id)} className="rounded-lg px-3 py-3 text-left text-base font-medium text-zinc-900 hover:bg-zinc-100">{n.label}</button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

const logos = ['Northwind', 'Lumon', 'Hooli', 'Pied Piper', 'Initech', 'Vandelay', 'Soylent', 'Wonka Labs'];

export function LatticeHero() {
  return (
    <section id="lattice-top" className="relative overflow-hidden pb-20 pt-16 md:pt-24">
      <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" style={{ backgroundImage: 'linear-gradient(#e4e4e7 1px, transparent 1px), linear-gradient(90deg, #e4e4e7 1px, transparent 1px)', backgroundSize: '56px 56px' }} />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-4xl text-center">
          <button onClick={() => scrollToSection('ai')} className="group inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white py-1 pl-1 pr-3 text-sm text-zinc-700 shadow-sm transition-colors hover:border-zinc-300 animate-fade-down">
            <span className="rounded-full bg-zinc-950 px-2 py-0.5 text-xs font-medium text-white">Lattice AI 2.0</span>
            Generate full flows from a sentence
            <ArrowRight className="h-3.5 w-3.5 text-zinc-400 transition-transform group-hover:translate-x-0.5" />
          </button>
          <h1 className="mt-10 text-5xl font-semibold leading-[1.02] tracking-[-0.045em] text-zinc-950 sm:text-7xl lg:text-[88px]">
            <span className="inline-block animate-fade-up">Design at the</span>{' '}
            <span className="inline-block animate-fade-up" style={{ animationDelay: '120ms', animationFillMode: 'both' }}>
              <SelectionBox label="speed.tsx">speed</SelectionBox>
            </span>{' '}
            <span className="inline-block animate-fade-up" style={{ animationDelay: '240ms', animationFillMode: 'both' }}>of thought.</span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-zinc-600 animate-fade-up md:text-xl" style={{ animationDelay: '360ms', animationFillMode: 'both' }}>
            Lattice is the multiplayer canvas where designers, engineers and AI build products together. Sketch, generate, prototype and ship, without ever leaving the file.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 animate-fade-up" style={{ animationDelay: '480ms', animationFillMode: 'both' }}>
            <LButton className="h-12 px-6" onClick={() => scrollToSection('cta')}>Start designing free <ArrowRight className="h-4 w-4" /></LButton>
            <LButton variant="light" className="h-12 px-6" onClick={() => scrollToSection('ai')}>
              <Command className="h-4 w-4" /> See what AI can do
            </LButton>
          </div>
          <p className="mt-5 text-sm text-zinc-500 animate-fade-in" style={{ animationDelay: '600ms', animationFillMode: 'both' }}>Free forever for individuals. No credit card.</p>
        </div>

        <div className="relative mx-auto mt-16 max-w-6xl animate-fade-up" style={{ animationDelay: '500ms', animationFillMode: 'both' }}>
          <div className="pointer-events-none absolute -inset-x-10 -top-10 bottom-10 -z-10 rounded-[40px] bg-gradient-to-b from-[#0d99ff]/15 via-orange-200/20 to-transparent blur-3xl" />
          <div className="absolute -left-3 -top-8 z-10 hidden items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs text-zinc-700 shadow-md ring-1 ring-zinc-200 md:flex animate-float">
            <MousePointer2 className="h-3.5 w-3.5 fill-[#0d99ff] text-[#0d99ff]" /> Try it: drag, resize, press R, or hit Generate
          </div>
          <Editor />
        </div>

        <div className="mt-20">
          <p className="text-center text-sm text-zinc-500">Trusted by product teams at 40,000+ companies</p>
          <div className="relative mt-8 flex overflow-hidden mask-fade-x">
            <div className="flex shrink-0 animate-marquee items-center gap-14 pr-14 [animation-duration:36s]">
              {[...logos, ...logos].map((l, i) => (
                <span key={i} className="whitespace-nowrap text-xl font-semibold tracking-tight text-zinc-300 transition-colors hover:text-zinc-900">{l}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
