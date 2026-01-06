'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { signInWithGoogle, signInWithMagicLink } from '@/lib/supabase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [magicLinkError, setMagicLinkError] = useState('');
  const [dismissedError, setDismissedError] = useState(false);

  // Reset dismissed state when error changes
  useEffect(() => {
    setDismissedError(false);
  }, [error]);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
    } catch (err) {
      console.error('Google sign in error:', err);
      setIsLoading(false);
    }
  };

  const handleMagicLinkSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setMagicLinkError('Please enter your email');
      return;
    }

    try {
      setIsLoading(true);
      setMagicLinkError('');
      await signInWithMagicLink(email);
      setMagicLinkSent(true);
    } catch (err) {
      console.error('Magic link error:', err);
      setMagicLinkError('Failed to send magic link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case 'auth_failed':
        return 'Authentication failed. Please try again.';
      case 'no_code':
        return 'No authentication code provided.';
      default:
        return 'An error occurred. Please try again.';
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-zinc-900 rounded-lg border border-zinc-800">
      {/* Logo/Branding */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Myjoe</h1>
        <h2 className="text-2xl font-semibold text-white mb-2">Welcome to Myjoe</h2>
        <p className="text-zinc-400">Create beautiful coloring books with AI</p>
      </div>

      {/* Error Message */}
      {error && !dismissedError && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-md relative">
          <p className="text-red-400 text-sm pr-6">{getErrorMessage(error)}</p>
          <button
            onClick={() => setDismissedError(true)}
            className="absolute top-2 right-2 text-red-400 hover:text-red-300 transition-colors"
            aria-label="Dismiss error"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Google Sign In */}
      <Button
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        loading={isLoading}
        className="w-full bg-white text-gray-900 hover:bg-gray-100 mb-6"
        variant="secondary"
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </Button>

      {/* Divider */}
      <div className="flex items-center mb-6">
        <div className="flex-1 border-t border-zinc-700"></div>
        <span className="px-4 text-zinc-500 text-sm">or</span>
        <div className="flex-1 border-t border-zinc-700"></div>
      </div>

      {/* Magic Link Form */}
      {magicLinkSent ? (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-md text-center">
          <p className="text-green-400 font-medium">Check your email!</p>
          <p className="text-zinc-400 text-sm mt-2">
            We've sent you a magic link to sign in.
          </p>
          <button
            onClick={() => {
              setMagicLinkSent(false);
              setEmail('');
            }}
            className="text-blue-400 text-sm mt-4 hover:underline"
          >
            Send another link
          </button>
        </div>
      ) : (
        <form onSubmit={handleMagicLinkSignIn}>
          <div className="mb-4">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="w-full"
            />
          </div>
          
          {magicLinkError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
              <p className="text-red-400 text-sm">{magicLinkError}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            loading={isLoading}
            className="w-full"
            variant="primary"
          >
            Send Magic Link
          </Button>
        </form>
      )}
    </div>
  );
}
