'use client';

import { useState, useEffect } from 'react';
import { X, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const ONBOARDING_KEY = 'myjoe_onboarding_complete';

// Referral source options
const REFERRAL_SOURCES = [
  { value: 'google', label: 'Google Search' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'twitter', label: 'Twitter/X' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'friend', label: 'Friend or Colleague' },
  { value: 'blog', label: 'Blog or Article' },
  { value: 'podcast', label: 'Podcast' },
  { value: 'kdp_forum', label: 'KDP/Self-Publishing Forum' },
  { value: 'other', label: 'Other' },
] as const;

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
  userId: string;
  country?: string | null;
}

export function OnboardingModal({ isOpen, onComplete, userId, country }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [referralSource, setReferralSource] = useState('');
  const [referralOther, setReferralOther] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check if already completed
    if (localStorage.getItem(ONBOARDING_KEY) === 'true') {
      onComplete();
    }
  }, [onComplete]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!termsAccepted || !privacyAccepted) return;

    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const now = new Date().toISOString();

      await supabase
        .from('profiles')
        .update({
          country: country || null,
          referral_source: referralSource === 'other' ? referralOther : referralSource,
          marketing_consent: marketingConsent,
          accepted_terms_at: now,
          accepted_privacy_at: now,
        })
        .eq('owner_id', userId);

      // Mark onboarding as complete
      localStorage.setItem(ONBOARDING_KEY, 'true');
      onComplete();
    } catch (error) {
      console.error('Failed to save onboarding data:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Welcome to Myjoe</h2>
          <div className="text-sm text-zinc-500">Step {step} of 2</div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <p className="text-zinc-400 mb-6">
                  We&apos;d love to know how you found us! This helps us improve and reach more creators like you.
                </p>

                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  How did you hear about Myjoe?
                </label>
                <select
                  value={referralSource}
                  onChange={(e) => setReferralSource(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="">Select an option...</option>
                  {REFERRAL_SOURCES.map((source) => (
                    <option key={source.value} value={source.value}>
                      {source.label}
                    </option>
                  ))}
                </select>

                {referralSource === 'other' && (
                  <input
                    type="text"
                    placeholder="Please specify..."
                    value={referralOther}
                    onChange={(e) => setReferralOther(e.target.value)}
                    className="mt-3 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                )}
              </div>

              {/* Marketing consent */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={marketingConsent}
                  onChange={(e) => setMarketingConsent(e.target.checked)}
                  className="mt-1 h-5 w-5 rounded border-zinc-600 bg-zinc-800 text-purple-600 focus:ring-purple-600"
                />
                <span className="text-sm text-zinc-400">
                  I&apos;d like to receive product updates, tips, and occasional promotional emails.
                  You can unsubscribe at any time.
                </span>
              </label>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <p className="text-zinc-400">
                Please review and accept our terms to continue.
              </p>

              {/* Terms checkbox */}
              <label className="flex items-start gap-3 cursor-pointer rounded-lg border border-zinc-800 p-4 hover:border-zinc-700">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 h-5 w-5 rounded border-zinc-600 bg-zinc-800 text-purple-600 focus:ring-purple-600"
                />
                <div>
                  <span className="text-white font-medium">Terms of Service</span>
                  <p className="text-sm text-zinc-500 mt-1">
                    I agree to the{' '}
                    <Link href="/terms" target="_blank" className="text-purple-400 hover:underline">
                      Terms of Service
                    </Link>
                  </p>
                </div>
              </label>

              {/* Privacy checkbox */}
              <label className="flex items-start gap-3 cursor-pointer rounded-lg border border-zinc-800 p-4 hover:border-zinc-700">
                <input
                  type="checkbox"
                  checked={privacyAccepted}
                  onChange={(e) => setPrivacyAccepted(e.target.checked)}
                  className="mt-0.5 h-5 w-5 rounded border-zinc-600 bg-zinc-800 text-purple-600 focus:ring-purple-600"
                />
                <div>
                  <span className="text-white font-medium">Privacy Policy</span>
                  <p className="text-sm text-zinc-500 mt-1">
                    I have read and agree to the{' '}
                    <Link href="/privacy" target="_blank" className="text-purple-400 hover:underline">
                      Privacy Policy
                    </Link>
                  </p>
                </div>
              </label>

              <p className="text-xs text-zinc-500">
                By continuing, you acknowledge that your data will be processed in accordance with
                UK GDPR and applicable data protection laws. You can exercise your data rights at
                any time by contacting privacy@myjoe.app.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-zinc-800 px-6 py-4">
          {step === 1 ? (
            <>
              <div /> {/* Spacer */}
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
              >
                Continue
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setStep(1)}
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!termsAccepted || !privacyAccepted || isSubmitting}
                className="rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Saving...' : 'Get Started'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to check if user needs onboarding.
 * Returns true if user hasn't completed onboarding yet.
 */
export function useNeedsOnboarding(): boolean {
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_KEY) === 'true';
    setNeedsOnboarding(!completed);
  }, []);

  return needsOnboarding;
}

/**
 * Reset onboarding state (for testing).
 */
export function resetOnboarding(): void {
  localStorage.removeItem(ONBOARDING_KEY);
}
