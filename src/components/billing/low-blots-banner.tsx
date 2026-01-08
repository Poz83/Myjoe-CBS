'use client';

import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface LowBlotsBannerProps {
  balance: number;
  onUpgrade?: () => void;
  showLinks?: boolean;
}

export function LowBlotsBanner({
  balance,
  onUpgrade,
  showLinks = false,
}: LowBlotsBannerProps) {
  if (balance >= 50) return null;

  return (
    <div className="mb-6 bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
        <div>
          <p className="font-medium text-amber-400">Running Low on Blots</p>
          <p className="text-sm text-amber-400/80">
            You have {balance} Blots remaining. Upgrade your plan for more.
          </p>
        </div>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        {showLinks ? (
          <Link
            href="/dashboard/billing"
            className="inline-flex items-center justify-center h-8 px-3 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-500 transition-colors"
          >
            Upgrade Plan
          </Link>
        ) : (
          onUpgrade && (
            <Button size="sm" onClick={onUpgrade}>
              Upgrade Plan
            </Button>
          )
        )}
      </div>
    </div>
  );
}
