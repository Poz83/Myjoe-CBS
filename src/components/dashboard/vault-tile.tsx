'use client';

import Link from 'next/link';
import { Archive } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StorageProgress } from '@/components/storage/storage-progress';
import { useStorageQuota } from '@/hooks/use-storage-quota';

interface VaultTileProps {
  className?: string;
}

export function VaultTile({ className }: VaultTileProps) {
  const { used, limit, remaining, percentageUsed, isLoading } = useStorageQuota();

  return (
    <Link
      href="/dashboard/vault"
      className={cn(
        'group relative p-6 rounded-2xl border border-white/5 bg-gradient-to-br from-indigo-500/20 to-indigo-600/5 transition-all duration-300',
        'hover:border-white/10 hover:scale-[1.02] cursor-pointer',
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-indigo-400">
          <Archive className="w-6 h-6" />
        </div>
        <div className="flex-shrink-0">
          <StorageProgress
            used={used}
            limit={limit}
            size="sm"
          />
        </div>
      </div>

      <h3 className="text-lg font-semibold text-white mb-1">Vault</h3>
      <p className="text-sm text-zinc-500 mb-3">Your creative storage</p>

      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-zinc-600 rounded-full animate-pulse"></div>
          <span className="text-xs text-zinc-600">Loading storage...</span>
        </div>
      ) : (
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-400">
            {((remaining / (1024 * 1024 * 1024))).toFixed(1)}GB free
          </span>
          <span className="text-zinc-500">
            {percentageUsed.toFixed(0)}% used
          </span>
        </div>
      )}
    </Link>
  );
}