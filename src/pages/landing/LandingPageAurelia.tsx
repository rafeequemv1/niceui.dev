import { AureliaFooter, Faq, SignupCta } from './aurelia/Closing';
import { BentoFeatures, PressMarquee } from './aurelia/Features';
import { AureliaHero, AureliaNav } from './aurelia/Hero';
import { HowItWorks, StatsBand } from './aurelia/HowItWorks';
import { Pricing, Testimonials } from './aurelia/Pricing';
import { paperGrain } from './aurelia/primitives';

export function LandingPageAurelia() {
  return (
    <div className="relative min-h-screen bg-[#f5f1ea] font-sans text-stone-900 antialiased selection:bg-orange-200 selection:text-stone-900">
      <div className="pointer-events-none absolute inset-0" style={paperGrain} />
      <div className="relative">
        <AureliaNav />
        <AureliaHero />
        <PressMarquee />
        <BentoFeatures />
        <HowItWorks />
        <StatsBand />
        <Pricing />
        <Testimonials />
        <Faq />
        <SignupCta />
        <AureliaFooter />
      </div>
    </div>
  );
}
