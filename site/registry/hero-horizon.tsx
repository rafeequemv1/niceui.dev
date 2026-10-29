import * as React from "react";

export interface HeroHorizonProps {
  eyebrow?: string;
  title?: string;
  accent?: string;
  rest?: string;
  description?: string;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
}

export function HeroHorizon({
  eyebrow = "Now in public beta",
  title = "Ship faster,",
  accent = "beautifully",
  rest = "built.",
  description = "The platform for teams who care about craft. Everything you need to launch, nothing you do not.",
  primary = { label: "Get started", href: "#" },
  secondary = { label: "Read the docs", href: "#" },
}: HeroHorizonProps) {
  return (
    <section className="relative overflow-hidden bg-black px-6 pt-28 text-center text-zinc-100">
      <p className="inline-flex items-center gap-2.5 rounded-full border border-white/10 px-3.5 py-1.5 font-mono text-xs text-zinc-400">
        <span className="size-1.5 rounded-full bg-sky-300 shadow-[0_0_12px_#7dd3fc]" />
        {eyebrow}
      </p>
      <h1 className="mx-auto mt-8 max-w-4xl text-5xl font-medium leading-[.98] tracking-[-0.055em] sm:text-7xl md:text-8xl">
        {title}
        <br />
        <span className="font-serif font-normal italic text-sky-300">{accent}</span> {rest}
      </h1>
      <p className="mx-auto mt-7 max-w-md text-[17px] leading-relaxed text-zinc-400">{description}</p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <a
          href={primary.href}
          className="inline-flex h-11 items-center rounded-full bg-sky-300 px-5 text-sm font-medium text-sky-950 shadow-[0_0_0_1px_rgba(125,211,252,.4),0_8px_32px_-8px_rgba(56,189,248,.6)] transition hover:bg-sky-200"
        >
          {primary.label}
        </a>
        <a
          href={secondary.href}
          className="inline-flex h-11 items-center rounded-full border border-white/15 px-5 text-sm font-medium transition hover:border-white/30"
        >
          {secondary.label}
        </a>
      </div>
      <div aria-hidden className="relative mt-12 h-64 [mask-image:linear-gradient(black_55%,transparent)]">
        <div className="absolute left-1/2 top-24 size-[1500px] -translate-x-1/2 rounded-full border-t border-sky-200/90 bg-black shadow-[0_-1px_40px_rgba(125,211,252,.55),inset_0_30px_60px_-30px_rgba(125,211,252,.25)]" />
        <div className="absolute left-1/2 top-8 h-64 w-[900px] -translate-x-1/2 bg-[radial-gradient(50%_60%_at_50%_70%,rgba(56,189,248,.35),transparent_70%)] blur-xl" />
      </div>
    </section>
  );
}
