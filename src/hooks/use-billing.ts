'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Balance {
  subscription: number;
  pack: number;
  total: number;
  planBlots: number;
  plan: string;
  resetsAt: string | null;
  storageUsed: number;
  storageLimit: number;
}

interface Transaction {
  id: string;
  type: string;
  delta: number;
  subscriptionDelta: number;
  packDelta: number;
  description: string | null;
  createdAt: string;
}

interface UsagePoint {
  date: string;
  blots: number;
}

export function useBalance() {
  return useQuery({
    queryKey: ['balance'],
    queryFn: async (): Promise<Balance> => {
      const res = await fetch('/api/billing/balance');
      if (!res.ok) throw new Error('Failed to fetch balance');
      return res.json();
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
      return res.json();
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

export function usePackCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (packId: string) => {
      const res = await fetch('/api/billing/checkout/pack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packId }),
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
