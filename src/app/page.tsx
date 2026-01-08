'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user';

export default function RootPage() {
  const router = useRouter();
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (isLoading) return;

    // Redirect authenticated users to dashboard
    if (user) {
      router.replace('/dashboard');
    } else {
      // Redirect unauthenticated users to landing page
      router.replace('/landing');
    }
  }, [user, isLoading, router]);

  // Show loading state while checking auth
  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
      <div className="text-zinc-400">Loading...</div>
    </div>
  );
}
