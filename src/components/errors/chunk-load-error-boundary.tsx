'use client';

import { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
import * as Sentry from '@sentry/nextjs';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
}

export class ChunkLoadErrorBoundary extends Component<Props, State> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  private reloadPage = () => {
    // Some builds/type environments model `window` as `never`; globalThis is stable.
    (globalThis as unknown as Window).location.reload();
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Check if this is a chunk load error
    const isChunkLoadError =
      error.name === 'ChunkLoadError' ||
      error.message?.includes('Loading chunk') ||
      error.message?.includes('Failed to fetch dynamically imported module');

    if (isChunkLoadError) {
      return {
        hasError: true,
        error,
      };
    }

    // Let other errors bubble up to parent error boundaries
    return { hasError: false };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const isChunkLoadError =
      error.name === 'ChunkLoadError' ||
      error.message?.includes('Loading chunk') ||
      error.message?.includes('Failed to fetch dynamically imported module');

    if (isChunkLoadError) {
      console.error('ChunkLoadError caught:', error);
      Sentry.captureException(error, {
        contexts: {
          chunkLoad: {
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
          },
        },
        tags: {
          errorType: 'chunkLoad',
        },
      });
    } else {
      // Re-throw non-chunk-load errors
      throw error;
    }
  }

  handleRetry = () => {
    const { retryCount } = this.state;
    
    // Clear any existing timeout
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }

    // Limit retries to prevent infinite loops
    if (retryCount >= 3) {
      // Force a hard reload after 3 retries
      this.reloadPage();
      return;
    }

    // Increment retry count
    this.setState((prev) => ({ retryCount: prev.retryCount + 1 }));

    // Clear the error state and retry
    this.setState({ hasError: false, error: null });

    // Force a reload of the page to clear any cached chunks
    this.retryTimeoutId = setTimeout(() => {
      this.reloadPage();
    }, 100);
  };

  handleHardReload = () => {
    // Clear cache and reload
    if ('caches' in globalThis) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name);
        });
        this.reloadPage();
      });
    } else {
      this.reloadPage();
    }
  };

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-8">
          <div className="max-w-md text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-yellow-500" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white">Page didn't load</h1>
              <p className="text-zinc-400">
                This usually happens when your connection is slow or files are cached. Try refreshing the page.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 text-left">
                <p className="text-xs text-zinc-500 font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={this.handleRetry}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                {this.state.retryCount > 0 ? `Retry (${this.state.retryCount}/3)` : 'Retry'}
              </button>

              <button
                onClick={this.handleHardReload}
                className="flex items-center gap-2 px-4 py-2 border border-zinc-700 hover:border-zinc-600 text-white rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Clear Cache & Reload
              </button>

              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-4 py-2 border border-zinc-700 hover:border-zinc-600 text-white rounded-lg transition-colors"
              >
                <Home className="w-4 h-4" />
                Go Home
              </Link>
            </div>

            {this.state.retryCount >= 2 && (
              <p className="text-xs text-zinc-500">
                Still having trouble? Try clearing your browser cache or using a different browser.
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
