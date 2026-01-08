'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Legacy billing page - redirects to new dashboard billing route
 * This ensures old links and bookmarks still work
 */
export default function LegacyBillingPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to new billing page location
    router.replace('/dashboard/billing');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <div className="text-zinc-400">Redirecting to billing...</div>
    </div>
  );
}
