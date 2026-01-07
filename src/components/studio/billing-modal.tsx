'use client';

import { useState } from 'react';
import { Palette, ExternalLink, Loader } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BLOT_PACKS, type PackId } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface BillingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentBalance: number;
  plan?: string;
  hasStripeCustomer?: boolean;
}

export function BillingModal({
  open,
  onOpenChange,
  currentBalance,
  plan = 'free',
  hasStripeCustomer = false,
}: BillingModalProps) {
  const [loadingPack, setLoadingPack] = useState<PackId | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBuyPack = async (packId: PackId) => {
    setError(null);
    setLoadingPack(packId);

    try {
      const response = await fetch('/api/billing/checkout/pack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start checkout');
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoadingPack(null);
    }
  };

  const handleManageSubscription = async () => {
    setError(null);
    setLoadingPortal(true);

    try {
      const response = await fetch('/api/billing/portal', { method: 'POST' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to open billing portal');
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoadingPortal(false);
    }
  };

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(0)}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Get More Blots" className="max-w-md">
      <div className="space-y-6">
        {/* Current Balance */}
        <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Palette className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Current Balance</p>
              <p className="text-xl font-bold text-white">{currentBalance.toLocaleString()} Blots</p>
            </div>
          </div>
          <span className="px-2 py-1 bg-zinc-700 text-zinc-300 text-xs font-medium rounded capitalize">
            {plan} plan
          </span>
        </div>

        {/* Pack Selection */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-zinc-300">Buy Blot Packs</h3>

          {(Object.entries(BLOT_PACKS) as [PackId, typeof BLOT_PACKS[PackId]][]).map(([packId, pack]) => {
            const isLoading = loadingPack === packId;
            const isPopular = 'popular' in pack && pack.popular;

            return (
              <button
                key={packId}
                onClick={() => handleBuyPack(packId)}
                disabled={!!loadingPack}
                className={cn(
                  'w-full flex items-center gap-4 p-4 rounded-lg border transition-all',
                  isPopular ? 'bg-blue-500/5 border-blue-500/30 hover:bg-blue-500/10' : 'bg-zinc-800/30 border-zinc-700 hover:border-zinc-600',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500/40'
                )}
              >
                <span className="text-3xl">{pack.emoji}</span>
                <div className="flex-1 text-left">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-white">{pack.name}</span>
                    <span className="text-sm text-zinc-400">{pack.blots} blots</span>
                  </div>
                </div>
                {isLoading ? (
                  <Loader className="w-4 h-4 animate-spin text-zinc-400" />
                ) : (
                  <span className="font-semibold text-white">{formatPrice(pack.priceCents)}</span>
                )}
              </button>
            );
          })}
        </div>

        {error && <p className="text-sm text-red-400 text-center">{error}</p>}

        {hasStripeCustomer && (
          <div className="pt-4 border-t border-zinc-800">
            <Button variant="ghost" className="w-full justify-center text-zinc-400 hover:text-white" onClick={handleManageSubscription} disabled={loadingPortal}>
              {loadingPortal ? <Loader className="w-4 h-4 animate-spin mr-2" /> : <ExternalLink className="w-4 h-4 mr-2" />}
              Manage Subscription
            </Button>
          </div>
        )}
      </div>
    </Dialog>
  );
}
