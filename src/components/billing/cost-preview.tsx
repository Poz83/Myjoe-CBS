'use client';

import { AlertTriangle, Palette } from 'lucide-react';
import Link from 'next/link';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useBlots } from '@/hooks/use-blots';

interface CostPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionName: string;
  cost: number;
  onConfirm: () => void;
  onCancel?: () => void;
}

export function CostPreview({
  open,
  onOpenChange,
  actionName,
  cost,
  onConfirm,
  onCancel,
}: CostPreviewProps) {
  const { blots, isLoading } = useBlots();

  const balanceAfter = blots - cost;
  const insufficient = balanceAfter < 0;

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Confirm Action">
      <div className="space-y-6">
        {/* Action Details */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-zinc-400">Action</span>
            <span className="font-medium text-white">{actionName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-400">Cost</span>
            <span className="font-medium text-blue-400 flex items-center gap-1.5">
              <Palette className="w-4 h-4" />
              {cost} Blots
            </span>
          </div>
        </div>

        <div className="border-t border-zinc-800" />

        {/* Balance Info */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-zinc-400">Current Balance</span>
            {isLoading ? (
              <span className="text-zinc-500">Loading...</span>
            ) : (
              <span className="font-medium text-white">{blots.toLocaleString()} Blots</span>
            )}
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-400">Balance After</span>
            <span
              className={`font-medium ${
                insufficient ? 'text-red-500' : balanceAfter < 50 ? 'text-amber-500' : 'text-white'
              }`}
            >
              {insufficient ? '−' : ''}{Math.abs(balanceAfter).toLocaleString()} Blots
            </span>
          </div>
        </div>

        {/* Insufficient Warning */}
        {insufficient && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-400">Insufficient Blots</p>
                <p className="text-sm text-red-400/80 mt-1">
                  You need {Math.abs(balanceAfter)} more Blots to complete this action.
                </p>
                <Link
                  href="/billing"
                  className="text-sm text-blue-400 hover:text-blue-300 mt-2 inline-block"
                >
                  Purchase more Blots
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={handleCancel} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={insufficient || isLoading}
            className="flex-1"
          >
            Confirm
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
