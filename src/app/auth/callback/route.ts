import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || requestUrl.searchParams.get('redirect') || '/studio';

  // If no code provided, redirect to login with error
  if (!code) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'no_code');
    return NextResponse.redirect(loginUrl);
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      // If code exchange fails, redirect to login with error
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'auth_failed');
      return NextResponse.redirect(loginUrl);
    }

    // Success - redirect to the intended destination
    return NextResponse.redirect(new URL(next, request.url));
  } catch (error) {
    // Handle unexpected errors
    console.error('Auth callback error:', error);
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'auth_failed');
    return NextResponse.redirect(loginUrl);
  }
}
