'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Palette, ExternalLink, Loader, Sparkles } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

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
  const router = useRouter();
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleGoToBilling = () => {
    onOpenChange(false);
    router.push('/billing');
  };

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

        {/* Upgrade CTA */}
        <div className="space-y-3">
          <p className="text-sm text-zinc-400 text-center">
            {plan === 'free'
              ? 'Upgrade to a paid plan to get more Blots and unlock commercial usage.'
              : 'Adjust your plan to get more Blots each month.'}
          </p>

          <Button
            onClick={handleGoToBilling}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {plan === 'free' ? 'View Plans' : 'Manage Plan'}
          </Button>
        </div>

        {error && <p className="text-sm text-red-400 text-center">{error}</p>}

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
              Billing Portal
            </Button>
          </div>
        )}
      </div>
    </Dialog>
  );
}
