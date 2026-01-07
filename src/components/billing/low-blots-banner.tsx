'use client';

import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LowBlotsBannerProps {
  balance: number;
  onBuyPack?: () => void;
  onUpgrade?: () => void;
}

export function LowBlotsBanner({ balance, onBuyPack, onUpgrade }: LowBlotsBannerProps) {
  if (balance >= 50) return null;

  return (
    <div className="mb-6 bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
        <div>
          <p className="font-medium text-amber-400">Running Low on Blots</p>
          <p className="text-sm text-amber-400/80">
            You have {balance} Blots remaining
          </p>
        </div>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        {onBuyPack && (
          <Button variant="secondary" size="sm" onClick={onBuyPack}>
            Buy Pack
          </Button>
        )}
        {onUpgrade && (
          <Button size="sm" onClick={onUpgrade}>
            Upgrade Plan
          </Button>
        )}
      </div>
    </div>
  );
}
