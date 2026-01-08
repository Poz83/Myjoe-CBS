import Link from 'next/link';
import { FileQuestion, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-8">
      <div className="max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center">
            <FileQuestion className="w-8 h-8 text-zinc-400" aria-hidden="true" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Page not found</h1>
          <p className="text-zinc-400">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
        >
          <Home className="w-4 h-4" aria-hidden="true" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}