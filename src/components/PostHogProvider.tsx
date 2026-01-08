"use client"

import posthog from "posthog-js"
import { PostHogProvider as PHProvider } from "posthog-js/react"
import { useEffect, useState } from "react"
import { hasAnalyticsConsent, type CookiePreferences } from "./cookie-consent-banner"

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize PostHog in disabled mode
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: "/ingest",
      ui_host: "https://eu.posthog.com",
      defaults: '2025-05-24',
      capture_exceptions: true,
      debug: process.env.NODE_ENV === "development",
      // GDPR: Start with tracking disabled until consent
      persistence: hasAnalyticsConsent() ? 'localStorage+cookie' : 'memory',
      autocapture: hasAnalyticsConsent(),
      disable_session_recording: !hasAnalyticsConsent(),
    });

    // Enable/disable based on stored consent
    if (hasAnalyticsConsent()) {
      posthog.opt_in_capturing();
    } else {
      posthog.opt_out_capturing();
    }

    setIsInitialized(true);

    // Listen for consent updates
    const handleConsentUpdate = (event: CustomEvent<CookiePreferences>) => {
      const consent = event.detail;

      if (consent.analytics) {
        posthog.opt_in_capturing();
        // Update persistence for future sessions
        posthog.set_config({
          persistence: 'localStorage+cookie',
          autocapture: true,
          disable_session_recording: false,
        });
      } else {
        posthog.opt_out_capturing();
        posthog.set_config({
          persistence: 'memory',
          autocapture: false,
          disable_session_recording: true,
        });
        // Clear any existing data
        posthog.reset();
      }
    };

    window.addEventListener('cookieConsentUpdated', handleConsentUpdate as EventListener);

    return () => {
      window.removeEventListener('cookieConsentUpdated', handleConsentUpdate as EventListener);
    };
  }, []);

  // Only render children after PostHog is initialized
  if (!isInitialized) {
    return <>{children}</>;
  }

  return (
    <PHProvider client={posthog}>
      {children}
    </PHProvider>
  );
}
