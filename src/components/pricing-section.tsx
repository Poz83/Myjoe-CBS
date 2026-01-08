'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, ChevronDown } from 'lucide-react';

const PLAN_TIERS = {
  creator: [
    { blots: 500, monthly: 8, yearly: 76.80, popular: false },
    { blots: 1000, monthly: 16, yearly: 153.60, popular: true },
    { blots: 2000, monthly: 32, yearly: 307.20, popular: false },
    { blots: 3000, monthly: 48, yearly: 460.80, popular: false },
    { blots: 4500, monthly: 72, yearly: 691.20, popular: false },
  ],
  studio: [
    { blots: 7500, monthly: 75, yearly: 720, popular: false },
    { blots: 10000, monthly: 100, yearly: 960, popular: true },
    { blots: 15000, monthly: 150, yearly: 1440, popular: false },
  ],
};

export function PricingSection() {
  const [creatorIndex, setCreatorIndex] = useState(1); // Default to 1000 Blots (popular)
  const [studioIndex, setStudioIndex] = useState(1); // Default to 10000 Blots (popular)
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');

  const creatorPlan = PLAN_TIERS.creator[creatorIndex];
  const studioPlan = PLAN_TIERS.studio[studioIndex];

  const formatPrice = (plan: typeof creatorPlan) => {
    if (billingInterval === 'yearly') {
      return Math.round(plan.yearly / 12);
    }
    return plan.monthly;
  };

  const pagesPerMonth = (blots: number) => Math.floor(blots / 5);

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block text-accent-cyan font-medium mb-4">PRICING</span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-zinc-400 text-lg">
            Start free, scale as you grow. No hidden fees.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="bg-zinc-800 p-1 rounded-xl inline-flex">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                billingInterval === 'monthly'
                  ? 'bg-accent-cyan text-black shadow-lg'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval('yearly')}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                billingInterval === 'yearly'
                  ? 'bg-accent-cyan text-black shadow-lg'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Annual
            </button>
          </div>
          {billingInterval === 'yearly' ? (
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-2 rounded-full text-sm font-medium animate-pulse">
              <span>🎉</span>
              <span>You save 20% with annual billing!</span>
            </div>
          ) : (
            <button
              onClick={() => setBillingInterval('yearly')}
              className="text-zinc-500 hover:text-green-400 text-sm transition-colors"
            >
              Switch to annual and <span className="text-green-400 font-medium">save 20%</span>
            </button>
          )}
        </div>

        {/* Blot Explanation */}
        <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-6 mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">🎨</span>
            <span className="font-semibold">Blots = Your Creative Currency</span>
          </div>
          <p className="text-zinc-400 text-sm max-w-xl mx-auto">
            1 coloring page = 5 Blots. A complete 40-page book uses about 212 Blots including style calibration and hero setup.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Free Tier */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
            <div className="text-zinc-400 font-medium mb-2">Free</div>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-zinc-500">/month</span>
            </div>
            <div className="text-accent-cyan font-medium mb-6">75 Blots/month</div>
            <ul className="space-y-3 mb-8">
              {[
                "15 coloring pages/month",
                "1 GB cloud storage",
                "1 commercial project to test KDP",
                "All 5 style presets",
                "PNG + PDF export"
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                  <Check className="w-4 h-4 text-green-500 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              href="/login"
              className="block w-full text-center border border-zinc-700 hover:border-zinc-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Start Free
            </Link>
          </div>

          {/* Creator Tier */}
          <div className="bg-gradient-to-b from-accent-cyan/10 to-transparent border-2 border-accent-cyan/50 rounded-2xl p-8 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent-cyan text-black text-xs font-bold px-3 py-1 rounded-full">
              MOST POPULAR
            </div>
            <div className="text-accent-cyan font-medium mb-2">Creator</div>
            <div className="flex items-baseline gap-2 mb-1">
              {billingInterval === 'yearly' && (
                <span className="text-xl text-zinc-500 line-through">${creatorPlan.monthly}</span>
              )}
              <span className="text-4xl font-bold">${formatPrice(creatorPlan)}</span>
              <span className="text-zinc-500">/month</span>
            </div>
            {billingInterval === 'yearly' ? (
              <div className="text-xs text-green-400 mb-2 flex items-center gap-1">
                <span className="bg-green-500/20 px-2 py-0.5 rounded">Save ${(creatorPlan.monthly * 12 - creatorPlan.yearly).toFixed(0)}/year</span>
                <span className="text-zinc-500">Billed ${creatorPlan.yearly.toFixed(0)} annually</span>
              </div>
            ) : (
              <div className="text-xs text-zinc-500 mb-2">Billed monthly, cancel anytime</div>
            )}

            {/* Blot Selector */}
            <div className="mb-6">
              <label className="text-xs text-zinc-400 font-medium mb-2 block">
                Select Your Plan
              </label>
              <div className="relative group">
                <select
                  value={creatorIndex}
                  onChange={(e) => setCreatorIndex(Number(e.target.value))}
                  className="w-full bg-zinc-800/80 border-2 border-zinc-700 rounded-xl px-4 pr-12 py-3.5 text-white font-medium focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 focus:border-accent-cyan/50 cursor-pointer transition-all duration-200 hover:bg-zinc-800 hover:border-accent-cyan/30 hover:shadow-lg hover:shadow-accent-cyan/10 hover:scale-[1.01] appearance-none"
                >
                  {PLAN_TIERS.creator.map((tier, i) => (
                    <option key={tier.blots} value={i}>
                      {tier.blots.toLocaleString()} Blots — {pagesPerMonth(tier.blots).toLocaleString()} pages/mo
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-accent-cyan pointer-events-none transition-all duration-200 group-hover:scale-110 group-hover:text-accent-cyan/80 animate-pulse-subtle" />
              </div>
              <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1.5">
                <span>💡</span>
                <span>Multiple package sizes available</span>
              </p>
            </div>

            <ul className="space-y-3 mb-8">
              {[
                `${pagesPerMonth(creatorPlan.blots).toLocaleString()} coloring pages/month`,
                "Unlimited projects",
                "25 GB cloud storage",
                "Full commercial license for KDP & Etsy",
                "Hero Reference Sheets for character consistency",
                "PNG + PDF + SVG export"
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                  <Check className="w-4 h-4 text-green-500 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              href="/login"
              className="block w-full text-center bg-accent-cyan hover:bg-accent-cyan/80 text-black px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Start Creating
            </Link>
          </div>

          {/* Studio Tier */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
            <div className="text-purple-400 font-medium mb-2">Studio</div>
            <div className="flex items-baseline gap-2 mb-1">
              {billingInterval === 'yearly' && (
                <span className="text-xl text-zinc-500 line-through">${studioPlan.monthly}</span>
              )}
              <span className="text-4xl font-bold">${formatPrice(studioPlan)}</span>
              <span className="text-zinc-500">/month</span>
            </div>
            {billingInterval === 'yearly' ? (
              <div className="text-xs text-green-400 mb-2 flex items-center gap-1">
                <span className="bg-green-500/20 px-2 py-0.5 rounded">Save ${(studioPlan.monthly * 12 - studioPlan.yearly).toFixed(0)}/year</span>
                <span className="text-zinc-500">Billed ${studioPlan.yearly.toFixed(0)} annually</span>
              </div>
            ) : (
              <div className="text-xs text-zinc-500 mb-2">Billed monthly, cancel anytime</div>
            )}

            {/* Blot Selector */}
            <div className="mb-6">
              <label className="text-xs text-zinc-400 font-medium mb-2 block">
                Select Your Plan
              </label>
              <div className="relative group">
                <select
                  value={studioIndex}
                  onChange={(e) => setStudioIndex(Number(e.target.value))}
                  className="w-full bg-zinc-800/80 border-2 border-zinc-700 rounded-xl px-4 pr-12 py-3.5 text-white font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 cursor-pointer transition-all duration-200 hover:bg-zinc-800 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 hover:scale-[1.01] appearance-none"
                >
                  {PLAN_TIERS.studio.map((tier, i) => (
                    <option key={tier.blots} value={i}>
                      {tier.blots.toLocaleString()} Blots — {pagesPerMonth(tier.blots).toLocaleString()} pages/mo
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400 pointer-events-none transition-all duration-200 group-hover:scale-110 group-hover:text-purple-300 animate-pulse-subtle" />
              </div>
              <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1.5">
                <span>💡</span>
                <span>Multiple package sizes available</span>
              </p>
            </div>

            <ul className="space-y-3 mb-8">
              {[
                `${pagesPerMonth(studioPlan.blots).toLocaleString()} coloring pages/month`,
                "Unlimited projects",
                "50 GB cloud storage",
                "Full commercial license for KDP & Etsy",
                "Priority email support",
                "Everything in Creator included"
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                  <Check className="w-4 h-4 text-green-500 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              href="/login"
              className="block w-full text-center border border-zinc-700 hover:border-zinc-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Go Studio
            </Link>
          </div>
        </div>

        {/* Flexible Pricing Note */}
        <div className="mt-8 text-center">
          <p className="text-zinc-400">
            Pick the exact Blot amount you need each month. <span className="text-white font-medium">Scale up or down anytime</span> — no long-term commitments.
          </p>
        </div>
      </div>
    </section>
  );
}
