'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  ChevronLeft,
  Crown,
  ExternalLink,
  Loader,
  AlertTriangle,
  Check,
  Palette,
  HardDrive,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BlotPackSelector } from '@/components/billing/blot-pack-selector';
import { LowBlotsBanner } from '@/components/billing/low-blots-banner';
import {
  useBalance,
  useCustomerPortal,
  useSubscriptionCheckout,
} from '@/hooks/use-billing';
import { PLAN_TIERS, TIERS, type TierName } from '@/lib/constants';
import { cn } from '@/lib/utils';

type Interval = 'monthly' | 'yearly';

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 GB';
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const PLAN_FEATURES: Record<string, string[]> = {
  free: [
    '50 Blots/month',
    '3 projects max',
    '25 GB storage',
    'Personal use only',
  ],
  creator: [
    'Up to 800 Blots/month',
    'Unlimited projects',
    '25 GB storage',
    'Commercial license',
    'Priority support',
  ],
  studio: [
    'Up to 5,000 Blots/month',
    'Unlimited projects',
    '50 GB storage',
    'Commercial license',
    'Priority support',
    'Team collaboration',
  ],
};

function BillingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedTier, setSelectedTier] = useState<TierName>('creator');
  const [selectedBlots, setSelectedBlots] = useState<number>(500);
  const [selectedInterval, setSelectedInterval] = useState<Interval>('monthly');

  const { data: balance, isLoading: balanceLoading } = useBalance();
  const portal = useCustomerPortal();
  const subscriptionCheckout = useSubscriptionCheckout();

  // Handle URL params for success/canceled
  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');

    if (success === 'pack') {
      toast.success('Blot pack purchased successfully!');
      router.replace('/billing');
    } else if (success === 'subscription') {
      toast.success(`Welcome to ${balance?.plan || 'your new plan'}!`);
      router.replace('/billing');
    } else if (canceled === 'true') {
      router.replace('/billing');
    }
  }, [searchParams, router, balance?.plan]);

  const handleBack = () => {
    router.push('/studio');
  };

  const handleManageSubscription = () => {
    portal.mutate();
  };

  const handleUpgrade = () => {
    subscriptionCheckout.mutate({
      tier: selectedTier,
      blots: selectedBlots,
      interval: selectedInterval,
    });
  };

  // Loading state
  if (balanceLoading || !balance) {
    return (
      <div className="min-h-full p-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <Skeleton variant="text" className="h-8 w-48" />
          <Skeleton variant="card" className="h-48 w-full" />
          <Skeleton variant="card" className="h-64 w-full" />
        </div>
      </div>
    );
  }

  const storagePercentage = Math.min(
    100,
    (balance.storageUsed / balance.storageLimit) * 100
  );
  const blotPercentage =
    balance.planBlots > 0
      ? Math.min(100, (balance.subscription / balance.planBlots) * 100)
      : 0;

  const isFreePlan = balance.plan === 'free';
  const showPaymentFailedWarning = false; // TODO: Add payment_failed_at to balance response

  return (
    <div className="min-h-full p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="text-zinc-400 hover:text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-white">Billing</h1>
        </div>

        <div className="space-y-8">
          {/* Low Blots Banner */}
          <LowBlotsBanner
            balance={balance.total}
            onBuyPack={() =>
              document
                .getElementById('packs')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
            onUpgrade={() =>
              document
                .getElementById('plans')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
          />

          {/* Payment Failed Warning */}
          {showPaymentFailedWarning && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-red-400">Payment Failed</p>
                  <p className="text-sm text-red-400/80 mt-1">
                    Your last payment failed. Please update your payment method
                    to continue using your subscription.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 border-red-500/30 text-red-400 hover:bg-red-500/10"
                    onClick={handleManageSubscription}
                    disabled={portal.isPending}
                  >
                    Update Payment Method
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Section A: Current Plan Card */}
          <section className="bg-zinc-900 rounded-lg border border-zinc-800 p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold text-white capitalize">
                      {balance.plan} Plan
                    </h2>
                    <span
                      className={cn(
                        'px-2 py-0.5 text-xs font-medium rounded-full',
                        balance.plan === 'free'
                          ? 'bg-zinc-700 text-zinc-300'
                          : balance.plan === 'creator'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-purple-500/20 text-purple-400'
                      )}
                    >
                      {balance.plan === 'free'
                        ? 'Free'
                        : balance.plan === 'creator'
                          ? 'Creator'
                          : 'Studio'}
                    </span>
                  </div>
                  {balance.resetsAt && (
                    <p className="text-sm text-zinc-400 mt-1">
                      Renews {formatDate(balance.resetsAt)}
                    </p>
                  )}
                </div>
              </div>
              {!isFreePlan && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleManageSubscription}
                  disabled={portal.isPending}
                >
                  {portal.isPending ? (
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

            {/* Blot Balance */}
            <div className="p-4 bg-zinc-800/50 rounded-lg mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-400">
                  <Palette className="w-4 h-4" />
                  Blots Available
                </div>
                <span className="text-2xl font-bold text-blue-400">
                  {balance.total.toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-zinc-500 mb-3">
                {balance.subscription.toLocaleString()} subscription +{' '}
                {balance.pack.toLocaleString()} packs
              </p>
              <div className="w-full h-2 bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${blotPercentage}%` }}
                />
              </div>
              {balance.resetsAt && (
                <p className="text-xs text-zinc-500 mt-2">
                  Subscription Blots reset on {formatDate(balance.resetsAt)}
                </p>
              )}
            </div>

            {/* Storage */}
            <div className="p-4 bg-zinc-800/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-400">
                  <HardDrive className="w-4 h-4" />
                  Storage Used
                </div>
                <span className="text-sm text-white">
                  {formatBytes(balance.storageUsed)} /{' '}
                  {formatBytes(balance.storageLimit)}
                </span>
              </div>
              <div className="w-full h-2 bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    storagePercentage > 90
                      ? 'bg-red-500'
                      : storagePercentage > 70
                        ? 'bg-amber-500'
                        : 'bg-purple-500'
                  )}
                  style={{ width: `${storagePercentage}%` }}
                />
              </div>
            </div>
          </section>

          {/* Section B: Subscription Plans (if on Free) */}
          {isFreePlan && (
            <section id="plans" className="bg-zinc-900 rounded-lg border border-zinc-800 p-6">
              <h2 className="text-lg font-semibold text-white mb-2">
                Upgrade Your Plan
              </h2>
              <p className="text-sm text-zinc-400 mb-6">
                Get more Blots and unlock commercial licensing.
              </p>

              {/* Tier Selector */}
              <div className="flex gap-2 mb-4">
                <Button
                  variant={selectedTier === 'creator' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => {
                    setSelectedTier('creator');
                    setSelectedBlots(500);
                  }}
                >
                  Creator
                </Button>
                <Button
                  variant={selectedTier === 'studio' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => {
                    setSelectedTier('studio');
                    setSelectedBlots(4000);
                  }}
                >
                  Studio
                </Button>
              </div>

              {/* Interval Toggle */}
              <div className="flex items-center gap-3 mb-6">
                <span
                  className={cn(
                    'text-sm',
                    selectedInterval === 'monthly'
                      ? 'text-white'
                      : 'text-zinc-400'
                  )}
                >
                  Monthly
                </span>
                <button
                  onClick={() =>
                    setSelectedInterval((i) =>
                      i === 'monthly' ? 'yearly' : 'monthly'
                    )
                  }
                  className="relative w-11 h-6 bg-zinc-700 rounded-full"
                >
                  <div
                    className={cn(
                      'absolute w-5 h-5 bg-blue-500 rounded-full top-0.5 transition-all',
                      selectedInterval === 'yearly' ? 'left-5' : 'left-0.5'
                    )}
                  />
                </button>
                <span
                  className={cn(
                    'text-sm',
                    selectedInterval === 'yearly'
                      ? 'text-white'
                      : 'text-zinc-400'
                  )}
                >
                  Yearly{' '}
                  <span className="text-green-500 ml-1">Save 17%</span>
                </span>
              </div>

              {/* Plan Options */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {PLAN_TIERS[selectedTier].map((plan) => {
                  const isSelected = selectedBlots === plan.blots;
                  const price =
                    selectedInterval === 'monthly' ? plan.monthly : plan.yearly;

                  return (
                    <button
                      key={plan.blots}
                      onClick={() => setSelectedBlots(plan.blots)}
                      className={cn(
                        'relative p-4 rounded-lg border transition-all text-left',
                        isSelected
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-zinc-700 bg-zinc-800/30 hover:border-zinc-600'
                      )}
                    >
                      {plan.popular && (
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-blue-500 text-white text-xs rounded">
                          Popular
                        </div>
                      )}
                      <div className="text-center">
                        <p className="text-2xl font-bold text-white">
                          {plan.blots.toLocaleString()}
                        </p>
                        <p className="text-sm text-zinc-400">Blots/month</p>
                        <p className="text-xl font-bold text-white mt-3">
                          ${price}
                        </p>
                        <p className="text-xs text-zinc-500">
                          per {selectedInterval === 'monthly' ? 'month' : 'year'}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2">
                          <Check className="w-5 h-5 text-blue-500" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Features */}
              <div className="mb-6 p-4 bg-zinc-800/30 rounded-lg">
                <p className="text-sm font-medium text-white mb-3">
                  {TIERS[selectedTier].name} includes:
                </p>
                <ul className="space-y-2">
                  {PLAN_FEATURES[selectedTier].map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-zinc-400">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Upgrade Button */}
              <Button
                onClick={handleUpgrade}
                loading={subscriptionCheckout.isPending}
                className="w-full"
              >
                Upgrade to {TIERS[selectedTier].name}
              </Button>
            </section>
          )}

          {/* Section C: Manage Subscription (if paid) */}
          {!isFreePlan && (
            <section className="bg-zinc-900 rounded-lg border border-zinc-800 p-6">
              <h2 className="text-lg font-semibold text-white mb-2">
                Manage Subscription
              </h2>
              <p className="text-sm text-zinc-400 mb-4">
                Update your payment method, change plans, or cancel your
                subscription.
              </p>
              <Button
                variant="secondary"
                onClick={handleManageSubscription}
                disabled={portal.isPending}
              >
                {portal.isPending ? (
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <ExternalLink className="w-4 h-4 mr-2" />
                )}
                Open Customer Portal
              </Button>
            </section>
          )}

          {/* Section D: Blot Packs */}
          <section id="packs" className="bg-zinc-900 rounded-lg border border-zinc-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-2">
              Need More Blots?
            </h2>
            <p className="text-sm text-zinc-400 mb-6">
              One-time purchases. Never expire.
            </p>
            <BlotPackSelector />
          </section>
        </div>
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-full p-8">
          <div className="max-w-3xl mx-auto space-y-8">
            <Skeleton variant="text" className="h-8 w-48" />
            <Skeleton variant="card" className="h-48 w-full" />
            <Skeleton variant="card" className="h-64 w-full" />
          </div>
        </div>
      }
    >
      <BillingContent />
    </Suspense>
  );
}
