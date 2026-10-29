import { Bento } from './rushes/Bento';
import { Cta, Faq, Pricing, RushesFooter, Stats, Testimonials, Workflow } from './rushes/Closing';
import { RushesHero, RushesNav } from './rushes/Hero';
import { ScriptSection } from './rushes/Script';

const keyframes = `
@keyframes rushes-sweep { from { left: 0 } to { left: 100% } }
`;

export function LandingPageRushes() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-white font-sans text-zinc-950 antialiased [color-scheme:light] selection:bg-[#ff4f1f]/20 selection:text-zinc-950">
      <style>{keyframes}</style>
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-full max-w-7xl -translate-x-1/2 border-x border-zinc-100 xl:block" />
      <div className="relative">
        <RushesNav />
        <RushesHero />
        <ScriptSection />
        <Bento />
        <Workflow />
        <Stats />
        <Testimonials />
        <Pricing />
        <Faq />
        <Cta />
        <RushesFooter />
      </div>
    </div>
  );
}
