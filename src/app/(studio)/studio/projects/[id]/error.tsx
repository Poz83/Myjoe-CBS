'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProjectError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  const isNotFound = error.message?.includes('not found');
  const isAccessDenied = error.message?.includes('access') || error.message?.includes('forbidden');

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">
            {isNotFound
              ? 'Project not found'
              : isAccessDenied
              ? 'Access denied'
              : 'Error loading project'}
          </h1>
          <p className="text-zinc-400">
            {isNotFound
              ? "This project doesn't exist or has been deleted."
              : isAccessDenied
              ? "You don't have permission to access this project."
              : 'We encountered an error while loading this project.'}
          </p>
        </div>

        {error.digest && (
          <p className="text-xs text-zinc-600 font-mono">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {!isNotFound && !isAccessDenied && (
            <button
              onClick={reset}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try again
            </button>
          )}

          <Link
            href="/studio/projects"
            className="flex items-center gap-2 px-4 py-2 border border-zinc-700 hover:border-zinc-600 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </Link>
        </div>
      </div>
    </div>
  );
}
