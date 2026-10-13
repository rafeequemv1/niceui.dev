import { Hero, Nav } from './cadence/Hero';
import { NetworkMarquee } from './cadence/NetworkMarquee';
import { Composer } from './cadence/Composer';
import { Scheduling } from './cadence/Scheduling';
import { Analytics } from './cadence/Analytics';
import { Workflow } from './cadence/Workflow';
import { Pricing, Testimonials } from './cadence/Social';
import { FAQ, FinalCTA, Footer } from './cadence/Closing';

const STYLES = `
@keyframes cad-pop { from { opacity: 0; transform: translateY(8px) scale(0.94); filter: blur(4px); } to { opacity: 1; transform: none; filter: none; } }
@keyframes cad-drift { 0%,100% { transform: translate(0,0) rotate(0deg); } 33% { transform: translate(6px,-10px) rotate(3deg); } 66% { transform: translate(-6px,-4px) rotate(-3deg); } }
@keyframes cad-draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
@keyframes cad-word { from { opacity: 0; transform: translateY(0.4em); filter: blur(8px); } to { opacity: 1; transform: none; filter: none; } }
@keyframes cad-underline { from { stroke-dashoffset: 320; } to { stroke-dashoffset: 0; } }
@keyframes cad-roll { from { opacity: 0; transform: translateY(70%); filter: blur(4px); } to { opacity: 1; transform: none; filter: none; } }
.cad-pop { animation: cad-pop 600ms cubic-bezier(0.16,1,0.3,1) both; }
.cad-drift { animation: cad-drift 7s ease-in-out infinite; }
.cad-draw { stroke-dashoffset: 1; animation: cad-draw 2.2s cubic-bezier(0.65,0,0.35,1) 200ms forwards; }
.cad-word { animation: cad-word 900ms cubic-bezier(0.16,1,0.3,1) both; }
.cad-underline { stroke-dasharray: 320; stroke-dashoffset: 320; animation: cad-underline 1.2s cubic-bezier(0.65,0,0.35,1) 900ms forwards; }
.cad-roll { animation: cad-roll 500ms cubic-bezier(0.16,1,0.3,1) both; }
@media (prefers-reduced-motion: reduce) {
  .cad-pop, .cad-drift, .cad-word, .cad-roll { animation: none; }
  .cad-draw, .cad-underline { animation: none; stroke-dashoffset: 0; }
}
`;

export function LandingPageCadence() {
  return (
    <div className="relative min-h-screen bg-[#FBFAF7] font-sans text-stone-900 antialiased selection:bg-[#FF5A36]/20">
      <style>{STYLES}</style>
      <Nav />
      <main>
        <Hero />
        <NetworkMarquee />
        <Composer />
        <Scheduling />
        <Analytics />
        <Workflow />
        <Testimonials />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
