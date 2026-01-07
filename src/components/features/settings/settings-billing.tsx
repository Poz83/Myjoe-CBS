'use client';

import { useState } from 'react';
import { Palette, Droplets, Package, Archive, ExternalLink, Loader, Check, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BLOT_PACKS, PLAN_LIMITS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface SettingsBillingProps {
  currentPlan: string;
  blotBalance: number;
  monthlyAllowance: number;
  storageUsed: number;
  storageLimit: number;
  resetDate?: string;
  hasStripeCustomer: boolean;
}

type PackId = 'splash' | 'bucket' | 'barrel';

const PACK_CONFIG: Record<PackId, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  splash: { icon: Droplets, color: 'from-blue-500 to-blue-600' },
  bucket: { icon: Package, color: 'from-purple-500 to-purple-600' },
  barrel: { icon: Archive, color: 'from-amber-500 to-amber-600' },
};

const PLAN_FEATURES: Record<string, string[]> = {
  free: ['50 blots/month', '1 GB storage', '3 projects'],
  starter: ['250 blots/month', '5 GB storage', '10 projects', 'Priority support'],
  creator: ['800 blots/month', '15 GB storage', '50 projects', 'Priority support'],
  pro: ['2,500 blots/month', '50 GB storage', 'Unlimited projects', 'Priority support', 'API access'],
};

export function SettingsBilling({
  currentPlan,
  blotBalance,
  monthlyAllowance,
  storageUsed,
  storageLimit,
  resetDate,
  hasStripeCustomer,
}: SettingsBillingProps) {
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
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
      });

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

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 GB';
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(1)} GB`;
  };

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(0)}`;
  const storagePercentage = Math.min(100, (storageUsed / storageLimit) * 100);
  const blotPercentage = monthlyAllowance > 0 ? Math.min(100, (blotBalance / monthlyAllowance) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Current Plan */}
      <div className="p-6 bg-zinc-800/50 rounded-lg border border-zinc-700">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Crown className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white capitalize">{currentPlan} Plan</h3>
              {resetDate && (
                <p className="text-sm text-zinc-400">
                  Renews on {new Date(resetDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          {hasStripeCustomer && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleManageSubscription}
              disabled={loadingPortal}
            >
              {loadingPortal ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Manage
                </>
              )}
            </Button>
          )}
        </div>

        {/* Plan Features */}
        <div className="mt-4 pt-4 border-t border-zinc-700">
          <ul className="grid grid-cols-2 gap-2">
            {PLAN_FEATURES[currentPlan]?.map((feature, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                <Check className="w-4 h-4 text-green-500" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-2 gap-4">
        {/* Blots Balance */}
        <div className="p-4 bg-zinc-800/30 rounded-lg border border-zinc-700">
          <div className="flex items-center gap-3 mb-3">
            <Palette className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-medium text-zinc-300">Blots Balance</span>
          </div>
          <p className="text-2xl font-bold text-white mb-2">{blotBalance.toLocaleString()}</p>
          <div className="w-full h-2 bg-zinc-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${blotPercentage}%` }}
            />
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            {monthlyAllowance > 0 ? `of ${monthlyAllowance.toLocaleString()} monthly allowance` : 'Buy packs below'}
          </p>
        </div>

        {/* Storage */}
        <div className="p-4 bg-zinc-800/30 rounded-lg border border-zinc-700">
          <div className="flex items-center gap-3 mb-3">
            <Package className="w-5 h-5 text-purple-400" />
            <span className="text-sm font-medium text-zinc-300">Storage Used</span>
          </div>
          <p className="text-2xl font-bold text-white mb-2">{formatBytes(storageUsed)}</p>
          <div className="w-full h-2 bg-zinc-700 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                storagePercentage > 90 ? 'bg-red-500' : storagePercentage > 70 ? 'bg-amber-500' : 'bg-purple-500'
              )}
              style={{ width: `${storagePercentage}%` }}
            />
          </div>
          <p className="text-xs text-zinc-500 mt-1">of {formatBytes(storageLimit)} limit</p>
        </div>
      </div>

      {/* Buy Blot Packs */}
      <div className="space-y-4">
        <h3 className="text-base font-medium text-white">Buy Blot Packs</h3>

        <div className="grid grid-cols-3 gap-4">
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
                  'flex flex-col items-center gap-3 p-6 rounded-lg border transition-all',
                  'bg-zinc-800/30 border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/50',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500/40'
                )}
              >
                <div className={cn(
                  'w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center',
                  config.color
                )}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-white capitalize">{packId}</p>
                  <p className="text-sm text-zinc-400">{pack.blots} blots</p>
                </div>
                {isLoading ? (
                  <Loader className="w-4 h-4 animate-spin text-zinc-400" />
                ) : (
                  <span className="text-lg font-bold text-white">{formatPrice(pack.priceCents)}</span>
                )}
              </button>
            );
          })}
        </div>

        {error && (
          <p className="text-sm text-red-400 text-center">{error}</p>
        )}
      </div>

      {/* Upgrade CTA for free users */}
      {currentPlan === 'free' && (
        <div className="p-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Upgrade for More</h3>
              <p className="text-sm text-zinc-400 mt-1">
                Get more blots, storage, and features with a paid plan.
              </p>
            </div>
            <Button variant="primary">
              View Plans
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
