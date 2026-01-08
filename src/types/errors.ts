/**
 * Custom error types for better error categorization and debugging
 */

export enum ErrorCode {
  VALIDATION = 'VALIDATION',
  NETWORK = 'NETWORK',
  AI_GENERATION = 'AI_GENERATION',
  QUALITY_CHECK = 'QUALITY_CHECK',
  SAFETY_CHECK = 'SAFETY_CHECK',
  IMAGE_PROCESSING = 'IMAGE_PROCESSING'
}

export class GenerationError extends Error {
  constructor(
    message: string,
    public readonly code: ErrorCode,
    public readonly attempt?: number,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'GenerationError';
  }
}

export class ValidationError extends GenerationError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, ErrorCode.VALIDATION, undefined, context);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends GenerationError {
  constructor(message: string, attempt?: number, context?: Record<string, unknown>) {
    super(message, ErrorCode.NETWORK, attempt, context);
    this.name = 'NetworkError';
  }
}

export class AIGenerationError extends GenerationError {
  constructor(message: string, attempt?: number, context?: Record<string, unknown>) {
    super(message, ErrorCode.AI_GENERATION, attempt, context);
    this.name = 'AIGenerationError';
  }
}