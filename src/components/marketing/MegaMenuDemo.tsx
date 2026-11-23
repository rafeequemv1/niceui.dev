import { MegaMenu } from '@/components/marketing/MegaMenu';
import { QUARRY_MENU } from '@/pages/landing/quarry/Nav';
import { Wordmark } from '@/pages/landing/quarry/ui';

/** The mega menu on its own: hover Library, Parts, Templates or Tools. */
export function MegaMenuDemo() {
  return (
    <div className="h-[560px] w-full bg-[#0e0e0d] font-sans">
      <div className="border-b border-white/[.05] px-5 md:px-8">
        <MegaMenu
          items={QUARRY_MENU}
          defaultOpen={0}
          brand={<Wordmark />}
          actions={
            <a href="#" className="rounded-lg bg-[#f2efe9] px-3.5 py-2 text-[13.5px] font-medium text-[#141413] hover:bg-white">
              Get started
            </a>
          }
        />
      </div>
      <div className="px-8 pt-16 md:hidden">
        <p className="text-[13px] text-white/50">Open the menu button for the mobile sheet.</p>
      </div>
    </div>
  );
}
