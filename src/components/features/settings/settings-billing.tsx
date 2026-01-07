'use client';

import { useState } from 'react';
import { Palette, ExternalLink, Loader, Check, Crown, CreditCard, Download, Wand2, Plus, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BLOT_PACKS, PLAN_TIERS, PLAN_LIMITS, type PackId, type TierName } from '@/lib/constants';
import { LowBlotsBanner } from '@/components/billing/low-blots-banner';
import { useBalance, useTransactions, useUsage, usePackCheckout, useCustomerPortal } from '@/hooks/use-billing';
import { cn } from '@/lib/utils';

type Interval = 'monthly' | 'yearly';

const formatPrice = (cents: number) => `$${(cents / 100).toFixed(0)}`;
const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 GB';
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};
const formatDate = (date: string) => new Date(date).toLocaleDateString();

export function SettingsBilling() {
  const [selectedTier, setSelectedTier] = useState<TierName>('creator');
  const [selectedInterval, setSelectedInterval] = useState<Interval>('monthly');

  const { data: balance, isLoading: balanceLoading } = useBalance();
  const { data: txData } = useTransactions(5);
  const { data: usageData } = useUsage();
  const packCheckout = usePackCheckout();
  const portal = useCustomerPortal();

  const handleBuyPack = (packId: PackId) => packCheckout.mutate(packId);
  const handleManageSubscription = () => portal.mutate();

  if (balanceLoading || !balance) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-zinc-800/30 rounded-lg animate-pulse" />
        <div className="h-24 bg-zinc-800/30 rounded-lg animate-pulse" />
      </div>
    );
  }

  const storagePercentage = Math.min(100, (balance.storageUsed / balance.storageLimit) * 100);
  const blotPercentage = balance.planBlots > 0 ? Math.min(100, (balance.subscription / balance.planBlots) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Low Blots Banner */}
      <LowBlotsBanner
        balance={balance.total}
        onBuyPack={() => document.getElementById('packs')?.scrollIntoView({ behavior: 'smooth' })}
      />

      {/* Current Plan */}
      <div className="p-6 bg-blue-500/5 rounded-lg border border-blue-500/20">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Crown className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white capitalize">{balance.plan} Plan</h3>
              {balance.resetsAt && (
                <p className="text-sm text-zinc-400">Renews {formatDate(balance.resetsAt)}</p>
              )}
            </div>
          </div>
          {balance.plan !== 'free' && (
            <Button variant="secondary" size="sm" onClick={handleManageSubscription} disabled={portal.isPending}>
              {portal.isPending ? <Loader className="w-4 h-4 animate-spin" /> : (
                <><ExternalLink className="w-4 h-4 mr-2" />Manage</>
              )}
            </Button>
          )}
        </div>

        {/* Blots Balance */}
        <div className="mt-6 p-4 bg-zinc-800/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-zinc-400">Blots Available</span>
            <span className="text-2xl font-bold text-blue-400">{balance.total.toLocaleString()}</span>
          </div>
          <p className="text-sm text-zinc-500 mb-3">
            {balance.subscription} subscription + {balance.pack} packs
          </p>
          <div className="w-full h-2 bg-zinc-700 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${blotPercentage}%` }} />
          </div>
          {balance.resetsAt && (
            <p className="text-xs text-zinc-500 mt-2">Subscription Blots reset on {formatDate(balance.resetsAt)}</p>
          )}
        </div>
      </div>

      {/* Plans Section */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Available Plans</h3>
        <div className="flex gap-2 mb-4">
          <Button variant={selectedTier === 'creator' ? 'primary' : 'secondary'} size="sm" onClick={() => setSelectedTier('creator')}>Creator</Button>
          <Button variant={selectedTier === 'studio' ? 'primary' : 'secondary'} size="sm" onClick={() => setSelectedTier('studio')}>Studio</Button>
        </div>
        <div className="flex items-center gap-3 mb-6">
          <span className={cn('text-sm', selectedInterval === 'monthly' ? 'text-white' : 'text-zinc-400')}>Monthly</span>
          <button onClick={() => setSelectedInterval(i => i === 'monthly' ? 'yearly' : 'monthly')} className="relative w-11 h-6 bg-zinc-700 rounded-full">
            <div className={cn('absolute w-5 h-5 bg-blue-500 rounded-full top-0.5 transition-all', selectedInterval === 'yearly' ? 'left-5' : 'left-0.5')} />
          </button>
          <span className={cn('text-sm', selectedInterval === 'yearly' ? 'text-white' : 'text-zinc-400')}>Yearly <span className="text-green-500 ml-1">Save 17%</span></span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {PLAN_TIERS[selectedTier].map((plan) => (
            <div key={plan.blots} className={cn('relative p-4 rounded-lg border transition-colors', plan.popular ? 'border-blue-500 bg-blue-500/5' : 'border-zinc-700 bg-zinc-800/30')}>
              {plan.popular && <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-blue-500 text-white text-xs rounded">Popular</div>}
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{plan.blots}</p>
                <p className="text-sm text-zinc-400">Blots/month</p>
                <p className="text-2xl font-bold text-white mt-3">${selectedInterval === 'monthly' ? plan.monthly : plan.yearly}</p>
                <p className="text-xs text-zinc-500">per {selectedInterval === 'monthly' ? 'month' : 'year'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Blot Packs */}
      <div id="packs">
        <h3 className="text-lg font-semibold text-white mb-2">Top-Up Your Blots</h3>
        <p className="text-sm text-zinc-400 mb-4">One-time purchases. Never expire.</p>
        <div className="grid grid-cols-2 gap-4">
          {(Object.entries(BLOT_PACKS) as [PackId, typeof BLOT_PACKS[PackId]][]).map(([packId, pack]) => (
            <button
              key={packId}
              onClick={() => handleBuyPack(packId)}
              disabled={packCheckout.isPending}
              className={cn(
                'relative flex flex-col items-center gap-3 p-6 rounded-lg border transition-all',
                'popular' in pack && pack.popular ? 'border-blue-500/50 bg-blue-500/5 hover:bg-blue-500/10' : 'border-zinc-700 bg-zinc-800/30 hover:bg-zinc-800/50',
                'disabled:opacity-50'
              )}
            >
              {'popular' in pack && pack.popular && <div className="absolute -top-2 text-xs bg-blue-500 px-2 py-0.5 rounded text-white">Popular</div>}
              <span className="text-4xl">{pack.emoji}</span>
              <div className="text-center">
                <p className="font-semibold text-white">{pack.name}</p>
                <p className="text-sm text-zinc-400">{pack.blots} blots</p>
              </div>
              {packCheckout.isPending ? (
                <Loader className="w-4 h-4 animate-spin text-zinc-400" />
              ) : (
                <span className="text-lg font-bold text-white">{formatPrice(pack.priceCents)}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Usage & Storage */}
      <div className="p-6 bg-zinc-800/30 rounded-lg border border-zinc-700 space-y-6">
        <h3 className="text-base font-semibold text-white">Usage & Storage</h3>

        {/* Simple Bar Chart */}
        {usageData?.usage && (
          <div>
            <p className="text-sm text-zinc-400 mb-3">Blots Consumed (Last 30 Days)</p>
            <div className="flex items-end gap-0.5 h-20">
              {usageData.usage.map((d, i) => {
                const maxBlots = Math.max(...usageData.usage.map(u => u.blots), 1);
                const height = (d.blots / maxBlots) * 100;
                return (
                  <div key={i} className="flex-1 bg-blue-500/80 rounded-t hover:bg-blue-400 transition-colors" style={{ height: `${Math.max(height, 2)}%` }} title={`${d.date}: ${d.blots} blots`} />
                );
              })}
            </div>
          </div>
        )}

        {/* Storage */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">Storage Used</span>
            <span className="text-sm text-white">{formatBytes(balance.storageUsed)} / {formatBytes(balance.storageLimit)}</span>
          </div>
          <div className="w-full h-2 bg-zinc-700 rounded-full overflow-hidden">
            <div className={cn('h-full rounded-full', storagePercentage > 90 ? 'bg-red-500' : storagePercentage > 70 ? 'bg-amber-500' : 'bg-purple-500')} style={{ width: `${storagePercentage}%` }} />
          </div>
        </div>

        {/* Recent Transactions */}
        {txData?.transactions && txData.transactions.length > 0 && (
          <div>
            <p className="text-sm text-zinc-400 mb-3">Recent Transactions</p>
            <div className="space-y-2">
              {txData.transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg border border-zinc-700/50">
                  <div className="flex items-center gap-3">
                    <div className={cn('p-2 rounded-lg', tx.type === 'generation' || tx.type === 'edit' ? 'bg-blue-500/10' : tx.type === 'pack_purchase' ? 'bg-green-500/10' : 'bg-purple-500/10')}>
                      {tx.type === 'generation' || tx.type === 'edit' ? <Wand2 className="w-4 h-4 text-blue-400" /> : tx.type === 'pack_purchase' ? <Plus className="w-4 h-4 text-green-400" /> : <RotateCw className="w-4 h-4 text-purple-400" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{tx.description || tx.type}</p>
                      <p className="text-xs text-zinc-500">{formatDate(tx.createdAt)}</p>
                    </div>
                  </div>
                  <span className={cn('text-sm font-medium', tx.delta > 0 ? 'text-green-400' : 'text-red-400')}>
                    {tx.delta > 0 ? '+' : ''}{tx.delta}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Payment Methods */}
      <div className="p-6 bg-zinc-800/30 rounded-lg border border-zinc-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-white">Payment Methods</h3>
          <Button variant="ghost" size="sm" onClick={handleManageSubscription} disabled={portal.isPending}>
            Manage in Stripe
          </Button>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-lg border border-zinc-700/50">
          <CreditCard className="w-5 h-5 text-zinc-400" />
          <p className="text-sm text-zinc-400">Manage payment methods via Stripe Customer Portal</p>
        </div>
      </div>

      {/* Invoices */}
      <div className="p-6 bg-zinc-800/30 rounded-lg border border-zinc-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-white">Invoices</h3>
          <Button variant="ghost" size="sm" onClick={handleManageSubscription} disabled={portal.isPending}>
            <Download className="w-4 h-4 mr-2" />View All
          </Button>
        </div>
        <p className="text-sm text-zinc-400">Access your billing history and download invoices from the Stripe portal.</p>
      </div>
    </div>
  );
}
