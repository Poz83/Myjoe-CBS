# Blot Calculator Component

## Create: src/components/features/billing/blot-calculator.tsx

```tsx
'use client';

import { useState, useMemo } from 'react';
import { Calculator, Book, Sparkles, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

const BLOT_PER_BOOK = 212; // 40 pages + hero + calibration

const TIERS = {
  creator: {
    name: 'Creator',
    options: [
      { blots: 250, monthly: 9, perBlot: 0.036 },
      { blots: 500, monthly: 15, perBlot: 0.030 },
      { blots: 800, monthly: 24, perBlot: 0.030 },
    ],
  },
  studio: {
    name: 'Studio',
    options: [
      { blots: 2000, monthly: 49, perBlot: 0.0245 },
      { blots: 3500, monthly: 79, perBlot: 0.0226 },
      { blots: 5000, monthly: 99, perBlot: 0.0198 },
    ],
  },
};

export function BlotCalculator() {
  const [booksPerMonth, setBooksPerMonth] = useState(2);
  const [pagesPerBook, setPagesPerBook] = useState(40);
  const [includeHero, setIncludeHero] = useState(true);
  
  // Calculate Blots needed
  const blotsNeeded = useMemo(() => {
    const perBook = (pagesPerBook * 5) + (includeHero ? 8 : 0) + 4; // pages + hero + calibration
    return booksPerMonth * perBook;
  }, [booksPerMonth, pagesPerBook, includeHero]);
  
  // Find best plan
  const recommendation = useMemo(() => {
    const allOptions = [
      ...TIERS.creator.options.map(o => ({ ...o, tier: 'creator' as const })),
      ...TIERS.studio.options.map(o => ({ ...o, tier: 'studio' as const })),
    ];
    
    // Find cheapest plan that covers the need
    const suitable = allOptions.filter(o => o.blots >= blotsNeeded);
    if (suitable.length === 0) {
      // Need more than max, recommend Studio-5000 + packs
      return { 
        ...allOptions[allOptions.length - 1], 
        tier: 'studio' as const,
        needsPacks: true,
        extraBlots: blotsNeeded - 5000,
      };
    }
    
    // Return cheapest suitable option
    return suitable.reduce((a, b) => a.monthly < b.monthly ? a : b);
  }, [blotsNeeded]);
  
  const costPerBook = recommendation.monthly / booksPerMonth;
  const savings = recommendation.tier === 'studio' 
    ? ((0.036 * blotsNeeded) - recommendation.monthly).toFixed(2)
    : null;

  return (
    <Card className="p-6 bg-zinc-900 border-zinc-800 max-w-xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="h-5 w-5 text-blue-400" />
        <h3 className="text-lg font-semibold">Find Your Perfect Plan</h3>
      </div>
      
      {/* Books per month slider */}
      <div className="space-y-6">
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm text-zinc-400">Books per month</label>
            <span className="text-sm font-medium">{booksPerMonth} books</span>
          </div>
          <Slider
            value={[booksPerMonth]}
            onValueChange={([v]) => setBooksPerMonth(v)}
            min={1}
            max={25}
            step={1}
            className="py-2"
          />
          <div className="flex justify-between text-xs text-zinc-500 mt-1">
            <span>1</span>
            <span>25</span>
          </div>
        </div>
        
        {/* Pages per book slider */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm text-zinc-400">Pages per book</label>
            <span className="text-sm font-medium">{pagesPerBook} pages</span>
          </div>
          <Slider
            value={[pagesPerBook]}
            onValueChange={([v]) => setPagesPerBook(v)}
            min={10}
            max={45}
            step={5}
            className="py-2"
          />
          <div className="flex justify-between text-xs text-zinc-500 mt-1">
            <span>10</span>
            <span>45</span>
          </div>
        </div>
        
        {/* Hero toggle */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={includeHero}
            onChange={(e) => setIncludeHero(e.target.checked)}
            className="rounded border-zinc-700 bg-zinc-800 text-blue-500"
          />
          <span className="text-sm">Include Hero character (+8 Blots/book)</span>
        </label>
      </div>
      
      {/* Divider */}
      <div className="border-t border-zinc-800 my-6" />
      
      {/* Results */}
      <div className="space-y-4">
        {/* Blots needed */}
        <div className="flex justify-between items-center">
          <span className="text-zinc-400">Blots needed</span>
          <span className="text-xl font-bold text-blue-400">
            {blotsNeeded.toLocaleString()} Blots/mo
          </span>
        </div>
        
        {/* Recommendation */}
        <div className={cn(
          "p-4 rounded-lg border",
          recommendation.tier === 'studio' 
            ? "bg-purple-500/10 border-purple-500/30" 
            : "bg-blue-500/10 border-blue-500/30"
        )}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-yellow-400" />
            <span className="text-sm font-medium">Recommended</span>
          </div>
          
          <div className="flex justify-between items-end">
            <div>
              <p className="text-lg font-semibold">
                {TIERS[recommendation.tier].name} — {recommendation.blots.toLocaleString()} Blots
              </p>
              <p className="text-sm text-zinc-400">
                ${recommendation.perBlot.toFixed(3)} per Blot
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">${recommendation.monthly}</p>
              <p className="text-sm text-zinc-400">/month</p>
            </div>
          </div>
          
          {recommendation.needsPacks && (
            <p className="text-sm text-amber-400 mt-2">
              + Buy {Math.ceil(recommendation.extraBlots / 500)} Boost packs (~${Math.ceil(recommendation.extraBlots / 500) * 20})
            </p>
          )}
        </div>
        
        {/* Cost per book */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-3 bg-zinc-800/50 rounded-lg">
            <p className="text-2xl font-bold text-green-400">
              ${costPerBook.toFixed(2)}
            </p>
            <p className="text-xs text-zinc-400">per book</p>
          </div>
          <div className="p-3 bg-zinc-800/50 rounded-lg">
            <p className="text-2xl font-bold">
              {Math.floor(recommendation.blots / BLOT_PER_BOOK)}
            </p>
            <p className="text-xs text-zinc-400">books possible</p>
          </div>
        </div>
        
        {savings && parseFloat(savings) > 0 && (
          <p className="text-sm text-green-400 text-center">
            💰 You save ${savings}/mo vs Creator pricing
          </p>
        )}
        
        <Button className="w-full" size="lg">
          Get {TIERS[recommendation.tier].name} Plan
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
```

## Simplified Version (No Sliders)

```tsx
'use client';

import { useState } from 'react';
import { Book, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const PLANS = [
  { books: 1, label: '1 book/mo', blots: 250, tier: 'Creator', price: 9 },
  { books: 2, label: '2 books/mo', blots: 500, tier: 'Creator', price: 15 },
  { books: 4, label: '3-4 books/mo', blots: 800, tier: 'Creator', price: 24 },
  { books: 10, label: '8-10 books/mo', blots: 2000, tier: 'Studio', price: 49 },
  { books: 16, label: '15-16 books/mo', blots: 3500, tier: 'Studio', price: 79 },
  { books: 23, label: '20+ books/mo', blots: 5000, tier: 'Studio', price: 99 },
];

export function SimpleBlotCalculator() {
  const [selected, setSelected] = useState(1);
  const plan = PLANS[selected];

  return (
    <Card className="p-6 bg-zinc-900 border-zinc-800 max-w-md mx-auto">
      <h3 className="text-lg font-semibold mb-4">How many books do you make?</h3>
      
      <div className="grid grid-cols-2 gap-2 mb-6">
        {PLANS.map((p, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={cn(
              "p-3 rounded-lg border text-left transition",
              selected === i 
                ? "border-blue-500 bg-blue-500/10" 
                : "border-zinc-800 hover:border-zinc-700"
            )}
          >
            <Book className="h-4 w-4 text-zinc-400 mb-1" />
            <span className="text-sm font-medium">{p.label}</span>
          </button>
        ))}
      </div>
      
      <div className="p-4 bg-zinc-800/50 rounded-lg mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-zinc-400">You need</span>
          <span className="font-semibold">{plan.blots.toLocaleString()} Blots/mo</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-zinc-400">Best plan</span>
          <span className="font-semibold">{plan.tier}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-zinc-400">Cost per book</span>
          <span className="font-semibold text-green-400">
            ${(plan.price / plan.books).toFixed(2)}
          </span>
        </div>
      </div>
      
      <Button className="w-full">
        Get {plan.tier} — ${plan.price}/mo
        <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
    </Card>
  );
}
```

## Usage on Pricing Page

```tsx
// In pricing page, add above the tier cards:
<BlotCalculator />

// Or use the simple version:
<SimpleBlotCalculator />
```
