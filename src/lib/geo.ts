/**
 * Geo IP Detection Utilities
 *
 * Detects user's country from various sources:
 * 1. Vercel's x-vercel-ip-country header (on Vercel deployment)
 * 2. Cloudflare's cf-ipcountry header (if using Cloudflare)
 * 3. Fallback to ipinfo.io API (limited free tier)
 */

import { headers } from 'next/headers';

// ISO 3166-1 alpha-2 country code
export type CountryCode = string;

export interface GeoData {
  country: CountryCode | null;
  region?: string;
  city?: string;
}

/**
 * Get country code from request headers (server-side only).
 * Works on Vercel and Cloudflare deployments.
 */
export async function getCountryFromHeaders(): Promise<CountryCode | null> {
  try {
    const headersList = await headers();

    // Vercel deployment
    const vercelCountry = headersList.get('x-vercel-ip-country');
    if (vercelCountry) return vercelCountry;

    // Cloudflare deployment
    const cfCountry = headersList.get('cf-ipcountry');
    if (cfCountry) return cfCountry;

    // Generic x-country header (some proxies)
    const genericCountry = headersList.get('x-country');
    if (genericCountry) return genericCountry;

    return null;
  } catch {
    // Headers not available (client-side or error)
    return null;
  }
}

/**
 * Get geo data from ipinfo.io API (fallback).
 * Free tier: 50,000 requests/month
 */
export async function getGeoFromIpInfo(ip: string): Promise<GeoData> {
  try {
    const response = await fetch(`https://ipinfo.io/${ip}/json`, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!response.ok) {
      return { country: null };
    }

    const data = await response.json();
    return {
      country: data.country || null,
      region: data.region,
      city: data.city,
    };
  } catch {
    return { country: null };
  }
}

/**
 * Get client IP from request headers (server-side only).
 */
export async function getClientIp(): Promise<string | null> {
  try {
    const headersList = await headers();

    // Check various headers in order of preference
    const forwardedFor = headersList.get('x-forwarded-for');
    if (forwardedFor) {
      // x-forwarded-for can contain multiple IPs, take the first
      return forwardedFor.split(',')[0].trim();
    }

    const realIp = headersList.get('x-real-ip');
    if (realIp) return realIp;

    const cfConnectingIp = headersList.get('cf-connecting-ip');
    if (cfConnectingIp) return cfConnectingIp;

    return null;
  } catch {
    return null;
  }
}

/**
 * Get user's country code (server-side).
 * Tries headers first, then falls back to IP lookup.
 */
export async function getUserCountry(): Promise<CountryCode | null> {
  // Try headers first (fastest)
  const headerCountry = await getCountryFromHeaders();
  if (headerCountry) return headerCountry;

  // Fallback to IP lookup
  const ip = await getClientIp();
  if (ip) {
    const geoData = await getGeoFromIpInfo(ip);
    return geoData.country;
  }

  return null;
}

// Supported countries for the service (English-speaking + EU)
export const SUPPORTED_COUNTRIES: Record<CountryCode, string> = {
  // Primary English-speaking
  GB: 'United Kingdom',
  US: 'United States',
  CA: 'Canada',
  AU: 'Australia',
  NZ: 'New Zealand',
  IE: 'Ireland',
  IN: 'India',
  ZA: 'South Africa',
  SG: 'Singapore',
  // EU countries
  AT: 'Austria',
  BE: 'Belgium',
  BG: 'Bulgaria',
  HR: 'Croatia',
  CY: 'Cyprus',
  CZ: 'Czech Republic',
  DK: 'Denmark',
  EE: 'Estonia',
  FI: 'Finland',
  FR: 'France',
  DE: 'Germany',
  GR: 'Greece',
  HU: 'Hungary',
  IT: 'Italy',
  LV: 'Latvia',
  LT: 'Lithuania',
  LU: 'Luxembourg',
  MT: 'Malta',
  NL: 'Netherlands',
  PL: 'Poland',
  PT: 'Portugal',
  RO: 'Romania',
  SK: 'Slovakia',
  SI: 'Slovenia',
  ES: 'Spain',
  SE: 'Sweden',
};

export function isEUCountry(countryCode: CountryCode): boolean {
  const euCountries = [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
    'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
    'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
  ];
  return euCountries.includes(countryCode);
}

export function isUKCountry(countryCode: CountryCode): boolean {
  return countryCode === 'GB';
}

export function requiresGDPR(countryCode: CountryCode | null): boolean {
  if (!countryCode) return true; // Default to requiring GDPR for safety
  return isEUCountry(countryCode) || isUKCountry(countryCode);
}
