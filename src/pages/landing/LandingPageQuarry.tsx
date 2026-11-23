import { QuarryCta, QuarryFaq, QuarryFooter, QuarryPricing } from './quarry/Closing';
import { QuarryNav } from './quarry/Nav';
import { QuarryAgent, QuarryFeatures, QuarryHero, QuarryStack, QuarryTemplates } from './quarry/Sections';

/** An elegant, minimal dark landing page for a UI library, with a mega menu. */
export function LandingPageQuarry() {
  return (
    <div className="min-h-screen overflow-x-clip bg-[#0e0e0d] font-sans text-[#f2efe9] antialiased selection:bg-[#c8d5b9]/30">
      <QuarryNav />
      <main>
        <QuarryHero />
        <QuarryStack />
        <QuarryFeatures />
        <QuarryTemplates />
        <QuarryAgent />
        <QuarryPricing />
        <QuarryFaq />
        <QuarryCta />
      </main>
      <QuarryFooter />
    </div>
  );
}
