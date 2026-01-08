'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Link from 'next/link';

const COOKIE_CONSENT_KEY = 'myjoe_cookie_consent';

export interface CookiePreferences {
  essential: boolean; // Always true, required for site to function
  analytics: boolean; // PostHog, performance tracking
  marketing: boolean; // Future marketing tools
  timestamp: string;
}

function getStoredConsent(): CookiePreferences | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function storeConsent(preferences: CookiePreferences): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(preferences));
  // Dispatch event for PostHog to react
  window.dispatchEvent(new CustomEvent('cookieConsentUpdated', { detail: preferences }));
}

export function hasAnalyticsConsent(): boolean {
  const consent = getStoredConsent();
  return consent?.analytics ?? false;
}

export function getCookieConsent(): CookiePreferences | null {
  return getStoredConsent();
}

export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false,
    timestamp: '',
  });

  useEffect(() => {
    const stored = getStoredConsent();
    if (!stored) {
      // Small delay to avoid layout shift on initial load
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const consent: CookiePreferences = {
      essential: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    };
    storeConsent(consent);
    setShowBanner(false);
  };

  const handleRejectNonEssential = () => {
    const consent: CookiePreferences = {
      essential: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    };
    storeConsent(consent);
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    const consent: CookiePreferences = {
      ...preferences,
      essential: true, // Always required
      timestamp: new Date().toISOString(),
    };
    storeConsent(consent);
    setShowBanner(false);
    setShowCustomize(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="mx-auto max-w-4xl rounded-xl border border-zinc-800 bg-zinc-900/95 p-4 shadow-2xl backdrop-blur-sm md:p-6">
        {!showCustomize ? (
          <>
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white">We value your privacy</h3>
                <p className="mt-1 text-sm text-zinc-400">
                  We use cookies to improve your experience and analyse how our site is used.
                  By clicking &quot;Accept all&quot;, you consent to our use of cookies.
                  See our{' '}
                  <Link href="/privacy" className="text-purple-400 hover:underline">
                    Privacy Policy
                  </Link>{' '}
                  for more information.
                </p>
              </div>
              <button
                onClick={handleRejectNonEssential}
                className="shrink-0 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                aria-label="Close and reject non-essential cookies"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleAcceptAll}
                className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
              >
                Accept all
              </button>
              <button
                onClick={handleRejectNonEssential}
                className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
              >
                Reject non-essential
              </button>
              <button
                onClick={() => setShowCustomize(true)}
                className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
              >
                Customise
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white">Cookie preferences</h3>
              <p className="mt-1 text-sm text-zinc-400">
                Choose which cookies you want to accept. Essential cookies cannot be disabled
                as they are required for the site to function.
              </p>
            </div>

            <div className="mb-6 space-y-4">
              {/* Essential - Always on */}
              <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-800/50 p-3">
                <div>
                  <p className="font-medium text-white">Essential</p>
                  <p className="text-sm text-zinc-400">Required for the site to function properly</p>
                </div>
                <div className="rounded bg-zinc-700 px-2 py-1 text-xs text-zinc-300">
                  Always on
                </div>
              </div>

              {/* Analytics */}
              <label className="flex cursor-pointer items-center justify-between rounded-lg border border-zinc-800 p-3 hover:border-zinc-700">
                <div>
                  <p className="font-medium text-white">Analytics</p>
                  <p className="text-sm text-zinc-400">Help us understand how visitors use our site</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                  className="h-5 w-5 rounded border-zinc-600 bg-zinc-800 text-purple-600 focus:ring-purple-600"
                />
              </label>

              {/* Marketing */}
              <label className="flex cursor-pointer items-center justify-between rounded-lg border border-zinc-800 p-3 hover:border-zinc-700">
                <div>
                  <p className="font-medium text-white">Marketing</p>
                  <p className="text-sm text-zinc-400">Used for targeted advertising and promotions</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                  className="h-5 w-5 rounded border-zinc-600 bg-zinc-800 text-purple-600 focus:ring-purple-600"
                />
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleSavePreferences}
                className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
              >
                Save preferences
              </button>
              <button
                onClick={() => setShowCustomize(false)}
                className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
              >
                Back
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
