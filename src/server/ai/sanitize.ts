/**
 * Prompt sanitization and validation
 * Protects against prompt injection and validates user input
 */

export function sanitizePrompt(input: string): string {
  let clean = input;
  
  // Remove common prompt injection patterns
  const injections = [
    /ignore (previous|all|above) instructions/gi,
    /disregard (everything|all|previous)/gi,
    /forget (everything|all|previous)/gi,
    /new (instructions|rules|prompt):/gi,
    /system\s*:/gi,
    /assistant\s*:/gi,
    /\[INST\][\s\S]*?\[\/INST\]/g,
    /<\|.*?\|>/g,
    /```[\s\S]*?```/g,
  ];
  
  for (const pattern of injections) {
    clean = clean.replace(pattern, '');
  }
  
  // Remove potentially dangerous characters
  clean = clean
    .replace(/[<>{}[\]\\]/g, '')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Enforce max length
  return clean.slice(0, 500);
}

/**
 * Validates that user input describes something visual
 * Returns validation result with optional reason for failure
 */
export function validateIdea(idea: string): { valid: boolean; reason?: string } {
  if (idea.length < 3) {
    return { valid: false, reason: 'Please provide more detail' };
  }
  
  if (idea.length > 500) {
    return { valid: false, reason: 'Please shorten your description (max 500 characters)' };
  }
  
  // Check for visual content keywords
  const hasVisual = /\b(animal|character|scene|place|object|person|creature|plant|flower|vehicle|building|dragon|princess|robot|dinosaur|cat|dog|bird|fish|house|castle|forest|ocean|space|garden|unicorn|fairy|mermaid|rocket|train|car|truck|butterfly|bee|bear|lion|tiger|elephant|monkey|horse|bunny|rabbit|owl|fox|deer|tree|mountain|beach|park|city|farm|zoo|circus|playground|kitchen|bedroom|bathroom|school|library|museum|restaurant|store|market|picnic|party|birthday|christmas|halloween|easter|valentine|nature|landscape|portrait|pattern|mandala|geometric|abstract|floral|botanical)\b/i.test(idea);
  
  if (!hasVisual) {
    return { valid: false, reason: 'Please describe something visual (e.g., an animal, character, scene, or object)' };
  }
  
  return { valid: true };
}

/**
 * Combines sanitization and validation into a single step
 */
export function processUserInput(input: string): { 
  sanitized: string; 
  valid: boolean; 
  reason?: string 
} {
  const sanitized = sanitizePrompt(input);
  const validation = validateIdea(sanitized);
  
  return {
    sanitized,
    ...validation
  };
}
