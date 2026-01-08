import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');
  const next = requestUrl.searchParams.get('next') || requestUrl.searchParams.get('redirect') || '/dashboard';

  // Check for OAuth errors from Supabase
  if (error) {
    console.error('OAuth error from Supabase:', {
      error,
      errorDescription,
      url: requestUrl.toString(),
    });
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'auth_failed');
    return NextResponse.redirect(loginUrl);
  }

  // If no code provided, redirect to login with error
  if (!code) {
    console.error('No code parameter in callback URL:', requestUrl.toString());
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'no_code');
    return NextResponse.redirect(loginUrl);
  }

  try {
    const supabase = await createClient();
    
    // Log the incoming request for debugging
    console.log('Auth callback received:', {
      hasCode: !!code,
      codeLength: code?.length,
      hasError: !!error,
      error,
      errorDescription,
      next,
      fullUrl: requestUrl.toString(),
      origin: requestUrl.origin,
      pathname: requestUrl.pathname,
    });
    
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      // Log detailed error information
      console.error('Code exchange failed:', {
        error: exchangeError,
        message: exchangeError.message,
        status: exchangeError.status,
        code: code.substring(0, 20) + '...', // Log first 20 chars for debugging
        fullUrl: requestUrl.toString(),
        // Additional debugging info
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      });
      
      // If code exchange fails, redirect to login with error
      // Preserve redirect parameter if it was provided
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'auth_failed');
      if (next && next !== '/dashboard') {
        loginUrl.searchParams.set('redirect', next);
      }
      return NextResponse.redirect(loginUrl);
    }

    // Validate that we got a session
    if (!data.session) {
      console.error('Code exchange succeeded but no session returned');
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'auth_failed');
      return NextResponse.redirect(loginUrl);
    }

    // Success - redirect to the intended destination
    // Ensure next is a valid path (prevent open redirect)
    const nextUrl = next.startsWith('/') ? next : '/dashboard';
    return NextResponse.redirect(new URL(nextUrl, request.url));
  } catch (error) {
    // Handle unexpected errors
    console.error('Auth callback unexpected error:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      url: requestUrl.toString(),
    });
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'auth_failed');
    return NextResponse.redirect(loginUrl);
  }
}
