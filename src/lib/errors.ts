/**
 * Base application error class
 * All custom errors should extend this class
 */
export class AppError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    
    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Error thrown when content is blocked by safety filters
 * Includes suggestions for alternative content
 */
export class SafetyBlockedError extends AppError {
  suggestions: string[];
  
  constructor(message: string, suggestions: string[] = []) {
    super(message, 400);
    this.name = 'SafetyBlockedError';
    this.suggestions = suggestions;
  }
}

/**
 * Error thrown when user has insufficient blots
 */
export class InsufficientBlotsError extends AppError {
  required: number;
  available: number;
  
  constructor(required: number, available: number) {
    super(`Insufficient blots: need ${required}, have ${available}`, 402);
    this.name = 'InsufficientBlotsError';
    this.required = required;
    this.available = available;
  }
}

/**
 * Error thrown when user exceeds storage quota
 */
export class StorageQuotaError extends AppError {
  constructor(message: string = 'Storage quota exceeded') {
    super(message, 413);
    this.name = 'StorageQuotaError';
  }
}

/**
 * Error thrown for authentication/authorization issues
 */
export class AuthError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
    this.name = 'AuthError';
  }
}

/**
 * Error thrown when a resource is not found
 */
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Error thrown when access is forbidden (user authenticated but not authorized)
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Access forbidden') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}