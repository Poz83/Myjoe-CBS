'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { ChevronLeft, Crown, ExternalLink, Loader, Check, Palette, HardDrive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useBalance, useCustomerPortal, useSubscriptionCheckout } from '@/hooks/use-billing';
import { PLAN_TIERS, TIERS, type TierName } from '@/lib/constants';
import { cn } from '@/lib/utils';

const formatBytes = (b: number) => b === 0 ? '0 GB' : `${(b / 1073741824).toFixed(1)} GB`;
const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const FEATURES: Record<string, string[]> = {
  free: ['75 Blots to try', '3 projects max', 'Watermark on exports'],
  creator: ['500-4,500 Blots/month', 'Unlimited projects', 'Commercial license'],
  studio: ['7,500-15,000 Blots/month', 'Priority support', '50 GB storage'],
};

function BillingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tier, setTier] = useState<TierName>('creator');
  const [blots, setBlots] = useState(500);
  const [interval, setInterval] = useState<'monthly' | 'yearly'>('monthly');

  const { data: balance, isLoading } = useBalance();
  const portal = useCustomerPortal();
  const checkout = useSubscriptionCheckout();

  useEffect(() => {
    if (searchParams.get('success') === 'subscription') {
      toast.success('Welcome to your new plan!');
      router.replace('/dashboard/billing');
    }
  }, [searchParams, router]);

  if (isLoading || !balance) {
    return <div className="max-w-2xl mx-auto p-8"><Skeleton variant="card" className="h-96" /></div>;
  }

  const isFreePlan = balance.plan === 'free';

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-zinc-500 hover:text-white mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      <h1 className="text-2xl font-bold text-white mb-8">Billing</h1>

      {/* Current Plan */}
      <div className="bg-zinc-900/50 rounded-xl border border-white/5 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Crown className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white capitalize">{balance.plan} Plan</h2>
              {balance.resetsAt && <p className="text-xs text-zinc-500">Renews {formatDate(balance.resetsAt)}</p>}
            </div>
          </div>
          {!isFreePlan && (
            <Button variant="secondary" size="sm" onClick={() => portal.mutate()} disabled={portal.isPending}>
              {portal.isPending ? <Loader className="w-4 h-4 animate-spin" /> : <><ExternalLink className="w-4 h-4 mr-1" /> Manage</>}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-zinc-800/50 rounded-lg">
            <div className="flex items-center gap-2 text-zinc-400 text-sm mb-1"><Palette className="w-4 h-4" /> Blots</div>
            <p className="text-2xl font-bold text-blue-400">{balance.blots.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-zinc-800/50 rounded-lg">
            <div className="flex items-center gap-2 text-zinc-400 text-sm mb-1"><HardDrive className="w-4 h-4" /> Storage</div>
            <p className="text-sm text-white">{formatBytes(balance.storageUsed)} / {formatBytes(balance.storageLimit)}</p>
          </div>
        </div>
      </div>

      {/* Upgrade */}
      {isFreePlan && (
        <div className="bg-zinc-900/50 rounded-xl border border-white/5 p-6">
          <h2 className="font-semibold text-white mb-4">Upgrade</h2>

          <div className="flex gap-2 mb-4">
            {(['creator', 'studio'] as const).map((t) => (
              <button key={t} onClick={() => { setTier(t); setBlots(t === 'creator' ? 500 : 4000); }}
                className={cn('px-4 py-2 rounded-lg text-sm capitalize transition-all', tier === t ? 'bg-blue-500 text-white' : 'bg-zinc-800 text-zinc-400')}>
                {t}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 mb-4 text-sm">
            <span className={interval === 'monthly' ? 'text-white' : 'text-zinc-500'}>Monthly</span>
            <button onClick={() => setInterval(i => i === 'monthly' ? 'yearly' : 'monthly')} className="w-10 h-5 bg-zinc-700 rounded-full relative">
              <div className={cn('w-4 h-4 bg-blue-500 rounded-full absolute top-0.5 transition-all', interval === 'yearly' ? 'left-5' : 'left-0.5')} />
            </button>
            <span className={interval === 'yearly' ? 'text-white' : 'text-zinc-500'}>Yearly <span className="text-green-500">-20%</span></span>
          </div>

          <select value={blots} onChange={(e) => setBlots(Number(e.target.value))}
            className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white mb-4">
            {PLAN_TIERS[tier].map((p) => (
              <option key={p.blots} value={p.blots}>{p.blots.toLocaleString()} Blots - ${interval === 'monthly' ? p.monthly : (p.yearly / 12).toFixed(0)}/mo</option>
            ))}
          </select>

          <ul className="space-y-2 mb-6">
            {FEATURES[tier].map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-zinc-400"><Check className="w-4 h-4 text-green-500" />{f}</li>
            ))}
          </ul>

          <Button className="w-full" onClick={() => checkout.mutate({ tier, blots, interval })} loading={checkout.isPending}>
            Upgrade to {TIERS[tier].name}
          </Button>
        </div>
      )}
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto p-8"><Skeleton variant="card" className="h-96" /></div>}>
      <BillingContent />
    </Suspense>
  );
}
