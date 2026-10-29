"use client";

import * as React from "react";

export interface Tier {
  name: string;
  monthly: number;
  yearly: number;
  description: string;
  features: string[];
  cta: string;
  featured?: boolean;
}

const defaultTiers: Tier[] = [
  { name: "Starter", monthly: 0, yearly: 0, description: "For side projects.", features: ["3 projects", "Community support", "Basic analytics"], cta: "Start free" },
  { name: "Pro", monthly: 24, yearly: 19, description: "For growing products.", features: ["Unlimited projects", "Priority support", "Advanced analytics", "Custom domains"], cta: "Upgrade to Pro", featured: true },
  { name: "Team", monthly: 59, yearly: 49, description: "For teams at scale.", features: ["Everything in Pro", "SSO and audit log", "Dedicated manager"], cta: "Contact sales" },
];

export function PricingMinimal({ tiers = defaultTiers }: { tiers?: Tier[] }) {
  const [yearly, setYearly] = React.useState(true);

  return (
    <section className="bg-black px-6 py-20 text-zinc-100">
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="text-4xl font-medium tracking-[-0.045em] sm:text-5xl">
          Simple, <span className="font-serif font-normal italic text-sky-300">honest</span> pricing.
        </h2>
        <div className="mt-8 inline-flex rounded-full border border-white/15 p-[3px] text-[13px]">
          {["Monthly", "Yearly"].map((label) => {
            const on = (label === "Yearly") === yearly;
            return (
              <button
                key={label}
                onClick={() => setYearly(label === "Yearly")}
                className={["rounded-full px-4 py-1.5 transition", on ? "bg-sky-300 font-medium text-sky-950" : "text-zinc-400"].join(" ")}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="mx-auto mt-12 grid max-w-5xl gap-4 md:grid-cols-3">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={[
              "flex flex-col rounded-2xl border p-6 text-left",
              tier.featured
                ? "border-sky-300/40 bg-zinc-950 shadow-[0_30px_80px_-30px_rgba(56,189,248,.35)]"
                : "border-white/10",
            ].join(" ")}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{tier.name}</span>
              {tier.featured && (
                <span className="rounded-full border border-sky-300/30 bg-sky-300/10 px-2 py-0.5 text-[11px] text-sky-300">
                  Popular
                </span>
              )}
            </div>
            <div className="mt-5 flex items-baseline gap-1">
              <span className="text-4xl font-medium tracking-[-0.04em]">${yearly ? tier.yearly : tier.monthly}</span>
              <span className="text-sm text-zinc-500">/ mo</span>
            </div>
            <p className="mt-1.5 text-sm text-zinc-400">{tier.description}</p>
            <ul className="mt-6 flex-1 space-y-2.5 border-t border-white/10 pt-6 text-sm text-zinc-300">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7dd3fc" strokeWidth="2.5">
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <button
              className={[
                "mt-8 h-10 rounded-full text-sm font-medium transition",
                tier.featured ? "bg-sky-300 text-sky-950 hover:bg-sky-200" : "border border-white/15 hover:border-white/30",
              ].join(" ")}
            >
              {tier.cta}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
