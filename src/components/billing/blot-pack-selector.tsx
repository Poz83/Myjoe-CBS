'use client';

import { BLOT_PACKS, type PackId } from '@/lib/constants';
import { usePackCheckout } from '@/hooks/use-billing';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BlotPackSelectorProps {
  onPurchaseStart?: () => void;
  className?: string;
}

const PACKS = Object.entries(BLOT_PACKS).map(([id, pack]) => ({
  id: id as PackId,
  popular: false as boolean,
  ...pack,
}));

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}

export function BlotPackSelector({ onPurchaseStart, className }: BlotPackSelectorProps) {
  const { mutate: checkout, isPending, variables } = usePackCheckout();

  const handlePurchase = (packId: PackId) => {
    onPurchaseStart?.();
    checkout(packId);
  };

  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 gap-4', className)}>
      {PACKS.map((pack) => {
        const isLoading = isPending && variables === pack.id;

        return (
          <div
            key={pack.id}
            className={cn(
              'relative bg-zinc-800/50 border rounded-xl p-6 text-center',
              pack.popular ? 'border-blue-500/50' : 'border-zinc-700'
            )}
          >
            {/* Popular Badge */}
            {pack.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                  Popular
                </span>
              </div>
            )}

            {/* Emoji */}
            <div className="text-4xl mb-3">{pack.emoji}</div>

            {/* Pack Name */}
            <h3 className="text-lg font-semibold text-white mb-2">{pack.name}</h3>

            {/* Blots Count */}
            <div className="text-3xl font-bold text-blue-400 mb-4">
              {pack.blots.toLocaleString()}
              <span className="text-sm font-normal text-zinc-400 ml-1">Blots</span>
            </div>

            {/* Price Button */}
            <Button
              onClick={() => handlePurchase(pack.id)}
              loading={isLoading}
              disabled={isPending}
              className="w-full"
              variant={pack.popular ? 'primary' : 'secondary'}
            >
              {formatPrice(pack.priceCents)}
            </Button>
          </div>
        );
      })}
    </div>
  );
}
