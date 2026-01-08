'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function AuthHandler() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined' || !window.location.hash) return;

    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');

    if (!accessToken || !refreshToken) return;

    // Clear hash immediately for cleaner URL
    history.replaceState(null, '', window.location.pathname);

    const supabase = createClient();

    // Set session and redirect in parallel
    supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    // Redirect immediately - session will be ready
    router.push('/dashboard');
  }, [router]);

  return null;
}
