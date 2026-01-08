import { NextResponse } from 'next/server';

/**
 * Simple in-memory rate limiter for API routes.
 * For production, consider using @upstash/ratelimit with Redis for distributed rate limiting.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limits (per-instance, resets on deployment)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupStaleEntries() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;

  lastCleanup = now;
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}

export interface RateLimitConfig {
  /** Maximum requests allowed in the window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
  retryAfterMs?: number;
}

/**
 * Check rate limit for a given identifier (e.g., user ID, IP address)
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  cleanupStaleEntries();

  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // No existing entry or window has expired
  if (!entry || entry.resetTime < now) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs,
    };
  }

  // Within window, check if under limit
  if (entry.count < config.maxRequests) {
    entry.count++;
    return {
      success: true,
      remaining: config.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  // Rate limited
  return {
    success: false,
    remaining: 0,
    resetTime: entry.resetTime,
    retryAfterMs: entry.resetTime - now,
  };
}

/**
 * Pre-configured rate limit configs for different use cases
 */
export const RATE_LIMITS = {
  /** Standard API endpoints: 100 requests per minute */
  standard: { maxRequests: 100, windowMs: 60 * 1000 },

  /** Expensive operations (generation, export): 20 requests per minute */
  expensive: { maxRequests: 20, windowMs: 60 * 1000 },

  /** Very expensive operations (batch generation): 5 requests per minute */
  veryExpensive: { maxRequests: 5, windowMs: 60 * 1000 },

  /** Checkout/payment: 10 requests per minute */
  checkout: { maxRequests: 10, windowMs: 60 * 1000 },

  /** Webhook endpoints: 200 requests per minute per IP */
  webhook: { maxRequests: 200, windowMs: 60 * 1000 },

  /** Auth endpoints: 10 requests per minute */
  auth: { maxRequests: 10, windowMs: 60 * 1000 },
} as const;

/**
 * Create a rate limit error response
 */
export function rateLimitResponse(result: RateLimitResult): NextResponse {
  const retryAfterSeconds = Math.ceil((result.retryAfterMs || 60000) / 1000);

  return NextResponse.json(
    {
      error: 'Too many requests',
      message: `Rate limit exceeded. Please try again in ${retryAfterSeconds} seconds.`,
      retryAfter: retryAfterSeconds,
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfterSeconds),
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': String(Math.ceil(result.resetTime / 1000)),
      },
    }
  );
}

/**
 * Wrapper function for easy rate limiting in API routes
 *
 * Usage:
 * ```
 * const rateLimitResult = rateLimit(userId, 'expensive');
 * if (rateLimitResult) return rateLimitResult;
 * // Continue with request...
 * ```
 */
export function rateLimit(
  identifier: string,
  limitType: keyof typeof RATE_LIMITS
): NextResponse | null {
  const config = RATE_LIMITS[limitType];
  const result = checkRateLimit(identifier, config);

  if (!result.success) {
    return rateLimitResponse(result);
  }

  return null;
}
