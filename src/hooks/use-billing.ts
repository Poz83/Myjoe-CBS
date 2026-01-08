'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Plan } from '@/lib/supabase/types';

// ============================================================================
// Types - Updated for Corbin Method (single blot pool)
// ============================================================================

export interface Balance {
  /** Current blot balance (single pool) */
  blots: number;
  /** Blot allocation for current plan (used for reset amount) */
  planBlots: number;
  /** Current plan tier */
  plan: Plan;
  /** When blots reset (for subscribers) */
  resetsAt: string | null;
  /** Storage used in bytes */
  storageUsed: number;
  /** Storage limit in bytes */
  storageLimit: number;
  /** Commercial projects used (for free tier tracking) */
  commercialProjectsUsed: number;
}

export interface Transaction {
  id: string;
  type: 'subscription_reset' | 'subscription_upgrade' | 'generation' | 'edit' | 'hero' | 'calibration' | 'refund';
  /** Net change in blots (positive = credit, negative = debit) */
  delta: number;
  description: string | null;
  createdAt: string;
  jobId: string | null;
}

export interface UsagePoint {
  date: string;
  blots: number;
}

// ============================================================================
// Hooks
// ============================================================================

export function useBalance() {
  return useQuery({
    queryKey: ['balance'],
    queryFn: async (): Promise<Balance> => {
      const res = await fetch('/api/billing/balance');
      if (!res.ok) throw new Error('Failed to fetch balance');
      const data = await res.json();

      return {
        blots: data.blots ?? 0,
        planBlots: data.planBlots ?? 0,
        plan: data.plan ?? 'free',
        resetsAt: data.resetsAt ?? null,
        storageUsed: data.storageUsed ?? 0,
        storageLimit: data.storageLimit ?? 0,
        commercialProjectsUsed: data.commercialProjectsUsed ?? 0,
      };
    },
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

export function useTransactions(limit = 10) {
  return useQuery({
    queryKey: ['transactions', limit],
    queryFn: async (): Promise<{ transactions: Transaction[] }> => {
      const res = await fetch(`/api/billing/transactions?limit=${limit}`);
      if (!res.ok) throw new Error('Failed to fetch transactions');
      const data = await res.json();

      return {
        transactions: (data.transactions || []).map((tx: Record<string, unknown>) => ({
          id: tx.id,
          type: tx.type,
          delta: tx.delta ?? 0,
          description: tx.description ?? null,
          createdAt: tx.createdAt ?? tx.created_at,
          jobId: tx.jobId ?? tx.job_id ?? null,
        })),
      };
    },
    staleTime: 60_000,
  });
}

export function useUsage() {
  return useQuery({
    queryKey: ['usage'],
    queryFn: async (): Promise<{ usage: UsagePoint[] }> => {
      const res = await fetch('/api/billing/usage');
      if (!res.ok) throw new Error('Failed to fetch usage');
      return res.json();
    },
    staleTime: 5 * 60_000,
  });
}

export function useCustomerPortal() {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/billing/portal', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to create portal session');
      return res.json();
    },
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
    },
  });
}

interface SubscriptionCheckoutParams {
  tier: 'creator' | 'studio';
  blots: number;
  interval: 'monthly' | 'yearly';
}

export function useSubscriptionCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tier, blots, interval }: SubscriptionCheckoutParams) => {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, blots, interval }),
      });
      if (!res.ok) throw new Error('Failed to create checkout');
      return res.json();
    },
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['balance'] });
    },
  });
}

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Simple hook to get current blot balance
 */
export function useBlotBalance() {
  const { data, isLoading, refetch } = useBalance();
  
  return {
    blots: data?.blots ?? 0,
    planBlots: data?.planBlots ?? 0,
    plan: data?.plan ?? 'free',
    isLoading,
    refetch,
  };
}

/**
 * Check if user can afford a specific action
 */
export function useCanAfford(cost: number) {
  const { blots, isLoading } = useBlotBalance();
  
  return {
    canAfford: blots >= cost,
    shortfall: Math.max(0, cost - blots),
    isLoading,
  };
}

/**
 * Get storage usage info
 */
export function useStorageUsage() {
  const { data, isLoading } = useBalance();
  
  const used = data?.storageUsed ?? 0;
  const limit = data?.storageLimit ?? 0;
  const percentage = limit > 0 ? (used / limit) * 100 : 0;
  
  return {
    used,
    limit,
    percentage,
    isNearLimit: percentage >= 80,
    isAtLimit: percentage >= 95,
    isLoading,
  };
}
