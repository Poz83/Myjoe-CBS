'use client';

import { useState } from 'react';
import { Palette, Droplets, Package, Archive, ExternalLink, Loader } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BLOT_PACKS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface BillingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentBalance: number;
  plan?: string;
  hasStripeCustomer?: boolean;
}

type PackId = 'splash' | 'bucket' | 'barrel';

const PACK_CONFIG: Record<PackId, { icon: React.ComponentType<{ className?: string }>; color: string; description: string }> = {
  splash: {
    icon: Droplets,
    color: 'from-blue-500 to-blue-600',
    description: 'Perfect for a quick top-up',
  },
  bucket: {
    icon: Package,
    color: 'from-purple-500 to-purple-600',
    description: 'Most popular choice',
  },
  barrel: {
    icon: Archive,
    color: 'from-amber-500 to-amber-600',
    description: 'Best value for power users',
  },
};

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

      // Redirect to Stripe checkout
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
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to open billing portal');
      }

      // Redirect to Stripe portal
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoadingPortal(false);
    }
  };

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(0)}`;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Get More Blots"
      className="max-w-md"
    >
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
          <div className="text-right">
            <span className="px-2 py-1 bg-zinc-700 text-zinc-300 text-xs font-medium rounded capitalize">
              {plan} plan
            </span>
          </div>
        </div>

        {/* Pack Selection */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-zinc-300">Buy Blot Packs</h3>

          {(Object.entries(BLOT_PACKS) as [PackId, typeof BLOT_PACKS[PackId]][]).map(([packId, pack]) => {
            const config = PACK_CONFIG[packId];
            const Icon = config.icon;
            const isLoading = loadingPack === packId;

            return (
              <button
                key={packId}
                onClick={() => handleBuyPack(packId)}
                disabled={!!loadingPack}
                className={cn(
                  'w-full flex items-center gap-4 p-4 rounded-lg border transition-all',
                  'bg-zinc-800/30 border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/50',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500/40'
                )}
              >
                <div className={cn(
                  'w-12 h-12 rounded-lg bg-gradient-to-br flex items-center justify-center',
                  config.color
                )}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-white capitalize">{packId}</span>
                    <span className="text-sm text-zinc-400">{pack.blots} blots</span>
                  </div>
                  <p className="text-sm text-zinc-500">{config.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {isLoading ? (
                    <Loader className="w-4 h-4 animate-spin text-zinc-400" />
                  ) : (
                    <span className="font-semibold text-white">{formatPrice(pack.priceCents)}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-sm text-red-400 text-center">{error}</p>
        )}

        {/* Manage Subscription */}
        {hasStripeCustomer && (
          <div className="pt-4 border-t border-zinc-800">
            <Button
              variant="ghost"
              className="w-full justify-center text-zinc-400 hover:text-white"
              onClick={handleManageSubscription}
              disabled={loadingPortal}
            >
              {loadingPortal ? (
                <Loader className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <ExternalLink className="w-4 h-4 mr-2" />
              )}
              Manage Subscription
            </Button>
          </div>
        )}
      </div>
    </Dialog>
  );
}
