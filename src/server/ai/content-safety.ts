import { getOpenAIClient } from './openai-client';
import { AUDIENCE_DERIVATIONS } from '@/lib/constants';
import type { Audience, SafetyLevel } from '@/types/domain';
import { FORBIDDEN_BY_AUDIENCE, SAFE_SUGGESTIONS } from '@/lib/constants/forbidden-content';

export interface SafetyResult {
  safe: boolean;
  blocked: string[];
  suggestions?: string[];
}

/**
 * Safety thresholds per level
 * Lower values = stricter filtering
 */
const THRESHOLDS: Record<SafetyLevel, Record<string, number>> = {
  strict: { 
    violence: 0.05, 
    'violence/graphic': 0.01, 
    sexual: 0.01, 
    hate: 0.05, 
    'self-harm': 0.05 
  },
  moderate: { 
    violence: 0.20, 
    'violence/graphic': 0.10, 
    sexual: 0.10, 
    hate: 0.20, 
    'self-harm': 0.15 
  },
  standard: { 
    violence: 0.50, 
    'violence/graphic': 0.30, 
    sexual: 0.30, 
    hate: 0.40, 
    'self-harm': 0.30 
  },
};

/**
 * Multi-layer content safety check
 * Layer 1: Keyword blocklist (instant, free)
 * Layer 2: OpenAI Moderation API (free)
 */
export async function checkContentSafety(
  input: string, 
  audience: Audience
): Promise<SafetyResult> {
  const rules = AUDIENCE_DERIVATIONS[audience];
  const forbidden = FORBIDDEN_BY_AUDIENCE[audience];
  
  // Layer 1: Keyword blocklist (instant, free)
  const lowerInput = input.toLowerCase();
  const blocked = forbidden.filter(word => lowerInput.includes(word.toLowerCase()));
  
  if (blocked.length > 0) {
    return { 
      safe: false, 
      blocked, 
      suggestions: SAFE_SUGGESTIONS[audience] 
    };
  }
  
  // Layer 2: OpenAI Moderation API (free)
  try {
    const moderation = await getOpenAIClient().moderations.create({ input });
    const result = moderation.results[0];
    const thresholds = THRESHOLDS[rules.safetyLevel];
    
    const violations: string[] = [];
    
    if (result.category_scores.violence > thresholds.violence) {
      violations.push('violence');
    }
    if (result.category_scores['violence/graphic'] > thresholds['violence/graphic']) {
      violations.push('graphic violence');
    }
    if (result.category_scores.sexual > thresholds.sexual) {
      violations.push('sexual content');
    }
    if (result.category_scores['sexual/minors'] > 0.01) {
      violations.push('child safety');
    }
    if (result.category_scores.hate > thresholds.hate) {
      violations.push('hate content');
    }
    if (result.category_scores['self-harm'] > thresholds['self-harm']) {
      violations.push('self-harm');
    }
    
    if (violations.length > 0) {
      return { 
        safe: false, 
        blocked: violations, 
        suggestions: SAFE_SUGGESTIONS[audience] 
      };
    }
  } catch (error) {
    console.error('Moderation API error:', error);
    // Continue without moderation if API fails
    // Fail-open to avoid blocking users when API is down
  }
  
  return { safe: true, blocked: [] };
}

/**
 * Quick check using only keyword blocklist
 * Use for instant client-side validation
 */
export function quickSafetyCheck(input: string, audience: Audience): SafetyResult {
  const forbidden = FORBIDDEN_BY_AUDIENCE[audience];
  const lowerInput = input.toLowerCase();
  const blocked = forbidden.filter(word => lowerInput.includes(word.toLowerCase()));
  
  if (blocked.length > 0) {
    return { 
      safe: false, 
      blocked, 
      suggestions: SAFE_SUGGESTIONS[audience] 
    };
  }
  
  return { safe: true, blocked: [] };
}
