import { createClient } from './client';

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle(redirectTo?: string) {
  const supabase = createClient();
  const redirectUrl = redirectTo 
    ? `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`
    : `${window.location.origin}/auth/callback`;

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
    },
  });

  if (error) {
    throw error;
  }
}

/**
 * Sign in with magic link (email)
 */
export async function signInWithMagicLink(email: string, redirectTo?: string) {
  const supabase = createClient();
  const redirectUrl = redirectTo 
    ? `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`
    : `${window.location.origin}/auth/callback`;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectUrl,
    },
  });

  if (error) {
    throw error;
  }
}

/**
 * Sign out
 */
export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    throw error;
  }
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    throw error;
  }
  
  return user;
}

/**
 * Get current session
 */
export async function getCurrentSession() {
  const supabase = createClient();
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    throw error;
  }
  
  return session;
}
