# Authentication Troubleshooting Guide

## Common Issues & Solutions

### Issue: "Authentication failed" Error

Since your redirect URL (`http://localhost:3000/auth/callback`) is already configured in Supabase, here are other potential causes:

#### 1. **OAuth Code Expiration**
OAuth codes expire quickly (usually within 5-10 minutes). If you take too long between clicking "Sign in" and completing the flow, the code becomes invalid.

**Solution:**
- Try signing in again immediately
- Complete the Google authentication flow quickly

#### 2. **Google OAuth Configuration**
The Google OAuth credentials in Supabase might be incorrect or the Google Cloud Console redirect URI might not match.

**Check:**
1. Go to Supabase Dashboard → Authentication → Providers → Google
2. Verify Client ID and Client Secret are set correctly
3. Go to Google Cloud Console → APIs & Services → Credentials
4. Verify the OAuth client has this redirect URI:
   ```
   https://rziohajwncqcgzorjqff.supabase.co/auth/v1/callback
   ```

#### 3. **PKCE (Proof Key for Code Exchange) Mismatch**
Supabase uses PKCE for security. If there's a mismatch in the code verifier, the exchange will fail.

**Solution:**
- Clear browser cookies and try again
- Ensure you're not using multiple tabs/windows for the same auth flow

#### 4. **Environment Variables**
Missing or incorrect environment variables can cause failures.

**Check:**
```bash
# Verify these are set in .env.local
NEXT_PUBLIC_SUPABASE_URL=https://rziohajwncqcgzorjqff.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
```

#### 5. **Redirect URL with Query Parameters**
If you're passing a `redirect` parameter, Supabase might be strict about the exact URL match.

**Current behavior:**
- We construct: `http://localhost:3000/auth/callback?redirect=/dashboard`
- Supabase redirects back with: `http://localhost:3000/auth/callback?redirect=/dashboard&code=...`

**Solution:**
- The wildcard `http://localhost:3000/**` in your redirect URLs should handle this
- If not, try using just `http://localhost:3000/auth/callback` without query params initially

## Debugging Steps

### Step 1: Check Server Console
When you see the error, check your Next.js server console (where you run `npm run dev`). You should see detailed logs like:

```
Auth callback received: { ... }
Code exchange failed: { ... }
```

Look for:
- The exact error message
- The status code
- The full URL being used

### Step 2: Check Browser Console
Open browser DevTools → Console and look for:
- Any JavaScript errors
- Network request failures
- OAuth redirect issues

### Step 3: Check Network Tab
In browser DevTools → Network:
1. Filter by "auth" or "callback"
2. Look for the callback request
3. Check the request URL and response
4. Verify the `code` parameter is present

### Step 4: Verify Google OAuth Flow
1. Click "Sign in with Google"
2. Check if you're redirected to Google
3. Complete authentication
4. Check the redirect URL when coming back

## Quick Fixes to Try

### Fix 1: Clear Everything and Retry
```bash
# Clear browser cookies for localhost:3000
# Then try signing in again
```

### Fix 2: Check Supabase Dashboard
1. Go to: https://supabase.com/dashboard/project/rziohajwncqcgzorjqff/auth/providers
2. Click on Google provider
3. Verify:
   - Provider is enabled
   - Client ID is set
   - Client Secret is set
   - No error messages shown

### Fix 3: Verify Redirect URL Format
In Supabase Dashboard → Authentication → URL Configuration:
- Site URL: `http://localhost:3000`
- Redirect URLs should include:
  - `http://localhost:3000/**` (wildcard - covers all paths)
  - `http://localhost:3000/auth/callback` (specific)

### Fix 4: Test Without Redirect Parameter
Temporarily modify the login to not pass redirect parameter:

```typescript
// In src/lib/supabase/auth.ts
// Try without redirect parameter first
await signInWithGoogle(); // instead of signInWithGoogle(redirect)
```

## What to Check in Server Logs

When the error occurs, look for these log entries:

1. **"Auth callback received"** - Shows what parameters were received
2. **"Code exchange failed"** - Shows the exact error from Supabase
3. **"OAuth error from Supabase"** - Shows if Supabase returned an error

The logs will show:
- Error message
- Status code
- Full URL
- Code (first 20 chars)

## Still Not Working?

If none of the above fixes work, please share:

1. **Server console output** - The full error log from your Next.js server
2. **Browser console errors** - Any errors in the browser DevTools
3. **Network request details** - The callback request from Network tab
4. **Supabase Dashboard status** - Screenshot of the Google provider settings

## Additional Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Google OAuth Setup Guide](./GOOGLE_OAUTH_SETUP.md)
- [Supabase Setup Guide](./SUPABASE_SETUP.md)
