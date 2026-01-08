/**
 * Simple structured logger for production use
 * Replace console.log with consistent, searchable logging
 */

export interface LogContext {
  [key: string]: unknown;
}

export const logger = {
  info: (message: string, context?: LogContext) => {
    console.log(`[INFO] ${message}`, context ? JSON.stringify(context) : '');
  },

  error: (message: string, context?: LogContext) => {
    console.error(`[ERROR] ${message}`, context ? JSON.stringify(context) : '');
  },

  warn: (message: string, context?: LogContext) => {
    console.warn(`[WARN] ${message}`, context ? JSON.stringify(context) : '');
  },

  debug: (message: string, context?: LogContext) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, context ? JSON.stringify(context) : '');
    }
  }
};