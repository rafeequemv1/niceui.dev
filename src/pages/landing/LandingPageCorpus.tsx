import { CorpusCatalog } from './corpus/Catalog';
import { CorpusFaq, CorpusPricing, CorpusTestimonials } from './corpus/Closing';
import { CorpusContact, CorpusFooter } from './corpus/Contact';
import { CorpusDelivery } from './corpus/Delivery';
import { CorpusExplorer } from './corpus/Explorer';
import { CorpusHero, CorpusNav } from './corpus/Hero';
import { CorpusPipeline } from './corpus/Pipeline';
import { CorpusProof } from './corpus/Proof';
import { CorpusTrust } from './corpus/Trust';

export function LandingPageCorpus() {
  return (
    <div className="relative min-h-screen bg-[#07090A] font-sans text-zinc-200 antialiased selection:bg-teal-300/25 selection:text-white">
      <div aria-hidden className="dither-noise pointer-events-none fixed inset-0 z-0 opacity-40" />
      <div className="relative">
        <CorpusNav />
        <CorpusHero />
        <CorpusProof />
        <CorpusCatalog />
        <CorpusExplorer />
        <CorpusPipeline />
        <CorpusTrust />
        <CorpusDelivery />
        <CorpusPricing />
        <CorpusTestimonials />
        <CorpusFaq />
        <CorpusContact />
        <CorpusFooter />
      </div>
    </div>
  );
}
