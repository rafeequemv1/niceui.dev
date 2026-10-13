import { AiFeatures } from './lattice/AiFeatures';
import { LatticeCta, LatticeFooter, LatticePricing, Wall } from './lattice/Closing';
import { DevMode, Multiplayer, Prototyping } from './lattice/Collaboration';
import { LatticeHero, LatticeNav } from './lattice/Hero';

export function LandingPageLattice() {
  return (
    <div className="min-h-screen bg-white font-sans text-zinc-950 antialiased selection:bg-[#0d99ff]/20 selection:text-zinc-950">
      <LatticeNav />
      <LatticeHero />
      <AiFeatures />
      <Multiplayer />
      <Prototyping />
      <DevMode />
      <LatticePricing />
      <Wall />
      <LatticeCta />
      <LatticeFooter />
    </div>
  );
}
