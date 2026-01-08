/**
 * Performance logging utility for tracking API calls, component renders, and page load times
 */

type PerformanceMetric = {
  name: string;
  duration: number;
  timestamp: number;
  type: 'api' | 'component' | 'hydration' | 'page-load';
  metadata?: Record<string, unknown>;
};

class PerformanceLogger {
  private metrics: PerformanceMetric[] = [];
  private readonly maxMetrics = 100; // Keep last 100 metrics
  private readonly slowThreshold = 1000; // Log slow operations > 1s

  /**
   * Log an API call duration
   */
  logApiCall(
    endpoint: string,
    duration: number,
    metadata?: Record<string, unknown>
  ): void {
    this.log({
      name: endpoint,
      duration,
      timestamp: Date.now(),
      type: 'api',
      metadata,
    });

    // Log slow API calls to console in dev
    if (process.env.NODE_ENV === 'development' && duration > this.slowThreshold) {
      console.warn(`[Performance] Slow API call: ${endpoint} took ${duration}ms`, metadata);
    }
  }

  /**
   * Log a component render time
   */
  logComponentRender(
    componentName: string,
    duration: number,
    metadata?: Record<string, unknown>
  ): void {
    this.log({
      name: componentName,
      duration,
      timestamp: Date.now(),
      type: 'component',
      metadata,
    });
  }

  /**
   * Log hydration time
   */
  logHydration(duration: number): void {
    this.log({
      name: 'hydration',
      duration,
      timestamp: Date.now(),
      type: 'hydration',
    });

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] Hydration took ${duration}ms`);
    }
  }

  /**
   * Log page load time
   */
  logPageLoad(pageName: string, duration: number): void {
    this.log({
      name: pageName,
      duration,
      timestamp: Date.now(),
      type: 'page-load',
    });

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] Page load: ${pageName} took ${duration}ms`);
    }
  }

  /**
   * Internal log method
   */
  private log(metric: PerformanceMetric): void {
    this.metrics.push(metric);

    // Keep only last N metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // In production, send slow metrics to Sentry
    if (
      process.env.NODE_ENV === 'production' &&
      metric.duration > this.slowThreshold &&
      typeof window !== 'undefined' &&
      (window as any).Sentry
    ) {
      try {
        (window as any).Sentry.addBreadcrumb({
          category: 'performance',
          message: `Slow ${metric.type}: ${metric.name}`,
          level: 'warning',
          data: {
            duration: metric.duration,
            ...metric.metadata,
          },
        });
      } catch (error) {
        // Silently fail if Sentry is not available
      }
    }
  }

  /**
   * Get all metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get metrics by type
   */
  getMetricsByType(type: PerformanceMetric['type']): PerformanceMetric[] {
    return this.metrics.filter((m) => m.type === type);
  }

  /**
   * Get average duration for a metric name
   */
  getAverageDuration(name: string, type?: PerformanceMetric['type']): number {
    const filtered = type
      ? this.metrics.filter((m) => m.name === name && m.type === type)
      : this.metrics.filter((m) => m.name === name);

    if (filtered.length === 0) return 0;

    const sum = filtered.reduce((acc, m) => acc + m.duration, 0);
    return sum / filtered.length;
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
  }

  /**
   * Get performance summary
   */
  getSummary(): {
    totalMetrics: number;
    averageApiCallTime: number;
    averageComponentRenderTime: number;
    slowApiCalls: PerformanceMetric[];
    slowComponentRenders: PerformanceMetric[];
  } {
    const apiCalls = this.getMetricsByType('api');
    const componentRenders = this.getMetricsByType('component');

    const averageApiCallTime =
      apiCalls.length > 0
        ? apiCalls.reduce((sum, m) => sum + m.duration, 0) / apiCalls.length
        : 0;

    const averageComponentRenderTime =
      componentRenders.length > 0
        ? componentRenders.reduce((sum, m) => sum + m.duration, 0) / componentRenders.length
        : 0;

    return {
      totalMetrics: this.metrics.length,
      averageApiCallTime,
      averageComponentRenderTime,
      slowApiCalls: apiCalls.filter((m) => m.duration > this.slowThreshold),
      slowComponentRenders: componentRenders.filter((m) => m.duration > this.slowThreshold),
    };
  }
}

// Singleton instance
export const performanceLogger = new PerformanceLogger();

/**
 * Hook to measure component render time
 */
export function usePerformanceMeasure(componentName: string) {
  if (typeof window === 'undefined') return;

  React.useEffect(() => {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;
      performanceLogger.logComponentRender(componentName, duration);
    };
  });
}

// Import React for hook
import React from 'react';

/**
 * Wrapper to measure API call duration
 */
export async function measureApiCall<T>(
  endpoint: string,
  apiCall: () => Promise<T>,
  metadata?: Record<string, unknown>
): Promise<T> {
  const startTime = performance.now();
  try {
    const result = await apiCall();
    const duration = performance.now() - startTime;
    performanceLogger.logApiCall(endpoint, duration, {
      ...metadata,
      success: true,
    });
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    performanceLogger.logApiCall(endpoint, duration, {
      ...metadata,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

/**
 * Measure page load time
 */
export function measurePageLoad(pageName: string): void {
  if (typeof window === 'undefined') return;

  // Use Navigation Timing API if available
  if ('performance' in window && 'getEntriesByType' in window.performance) {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      const loadTime = navigation.loadEventEnd - navigation.fetchStart;
      performanceLogger.logPageLoad(pageName, loadTime);
    }
  } else {
    // Fallback to window load event
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      performanceLogger.logPageLoad(pageName, loadTime);
    });
  }
}
