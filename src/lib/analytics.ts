'use client';

import posthog from 'posthog-js';

// ============================================================================
// Analytics Event Names
// Use enum for consistency across the codebase
// ============================================================================

export enum AnalyticsEvent {
  // Auth events
  USER_SIGNED_UP = 'user_signed_up',
  USER_SIGNED_IN = 'user_signed_in',
  USER_SIGNED_OUT = 'user_signed_out',
  
  // Project events
  PROJECT_CREATED = 'project_created',
  PROJECT_DELETED = 'project_deleted',
  PROJECT_OPENED = 'project_opened',
  
  // Generation events
  GENERATION_STARTED = 'generation_started',
  GENERATION_COMPLETED = 'generation_completed',
  GENERATION_FAILED = 'generation_failed',
  GENERATION_CANCELLED = 'generation_cancelled',
  GENERATION_SAFETY_BLOCKED = 'generation_safety_blocked',
  
  // Page events
  PAGE_EDITED = 'page_edited',
  PAGE_REGENERATED = 'page_regenerated',
  
  // Hero events
  HERO_CREATED = 'hero_created',
  HERO_DELETED = 'hero_deleted',
  HERO_SAFETY_BLOCKED = 'hero_safety_blocked',
  
  // Calibration events
  CALIBRATION_STARTED = 'calibration_started',
  CALIBRATION_COMPLETED = 'calibration_completed',
  
  // Export events
  EXPORT_STARTED = 'export_started',
  EXPORT_COMPLETED = 'export_completed',
  EXPORT_DOWNLOADED = 'export_downloaded',
  
  // Billing events
  SUBSCRIPTION_STARTED = 'subscription_started',
  SUBSCRIPTION_UPGRADED = 'subscription_upgraded',
  SUBSCRIPTION_DOWNGRADED = 'subscription_downgraded',
  SUBSCRIPTION_CANCELLED = 'subscription_cancelled',
  BILLING_PAGE_VIEWED = 'billing_page_viewed',
  
  // UI events
  UPGRADE_PROMPT_SHOWN = 'upgrade_prompt_shown',
  UPGRADE_PROMPT_CLICKED = 'upgrade_prompt_clicked',
}

// ============================================================================
// Initialization
// ============================================================================

/**
 * Check if PostHog is ready.
 * PostHog is initialized in PostHogProvider component.
 */
function isReady(): boolean {
  if (typeof window === 'undefined') return false;
  // Check if posthog has been initialized by checking internal state
  try {
    return posthog.__loaded === true;
  } catch {
    return false;
  }
}

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Track an analytics event.
 * 
 * @param event - Event name from AnalyticsEvent enum
 * @param properties - Optional event properties
 * 
 * @example
 * track(AnalyticsEvent.PROJECT_CREATED, { projectId: '123', pageCount: 20 });
 */
export function track(
  event: AnalyticsEvent | string,
  properties?: Record<string, unknown>
): void {
  if (!isReady()) return;
  
  posthog.capture(event, properties);
}

/**
 * Identify a user for analytics.
 * Call this after user signs in.
 * 
 * @param userId - Unique user identifier
 * @param traits - Optional user properties
 * 
 * @example
 * identify(user.id, { email: user.email, plan: 'creator' });
 */
export function identify(
  userId: string,
  traits?: Record<string, unknown>
): void {
  if (!isReady()) return;
  
  posthog.identify(userId, traits);
}

/**
 * Reset user identity (call on sign out).
 */
export function reset(): void {
  if (!isReady()) return;
  
  posthog.reset();
}

/**
 * Set user properties that persist across events.
 * 
 * @param properties - User properties to set
 * 
 * @example
 * setUserProperties({ plan: 'studio', totalProjects: 5 });
 */
export function setUserProperties(properties: Record<string, unknown>): void {
  if (!isReady()) return;
  
  posthog.people.set(properties);
}

/**
 * Track a page view.
 * Useful for SPA navigation if autocapture is disabled.
 * 
 * @param path - Page path
 * @param properties - Optional page properties
 */
export function trackPageView(
  path?: string,
  properties?: Record<string, unknown>
): void {
  if (!isReady()) return;
  
  posthog.capture('$pageview', {
    $current_url: path || window.location.href,
    ...properties,
  });
}

// ============================================================================
// Feature Flags
// ============================================================================

/**
 * Check if a feature flag is enabled.
 * 
 * @param flagName - Name of the feature flag
 * @returns Boolean indicating if flag is enabled
 */
export function isFeatureEnabled(flagName: string): boolean {
  if (!isReady()) return false;
  
  return posthog.isFeatureEnabled(flagName) ?? false;
}

/**
 * Get a feature flag value (for multivariate flags).
 * 
 * @param flagName - Name of the feature flag
 * @returns Flag value or undefined
 */
export function getFeatureFlag(flagName: string): string | boolean | undefined {
  if (!isReady()) return undefined;
  
  return posthog.getFeatureFlag(flagName);
}
