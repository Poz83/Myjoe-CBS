# Google OAuth Setup for Supabase

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Name: `Myjoe` (or your preferred name)
4. Click **"Create"**

## Step 2: Enable Google+ API

1. In Google Cloud Console, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google+ API"** (or use **"Google Identity"**)
3. Click **"Enable"**

## Step 3: Create OAuth Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. If prompted, configure OAuth consent screen first:
   - **User Type:** External (unless you have Google Workspace)
   - **App name:** Myjoe
   - **User support email:** Your email
   - **Developer contact:** Your email
   - Click **"Save and Continue"**
   - Scopes: Click **"Save and Continue"** (default scopes are fine)
   - Test users: Add your email, click **"Save and Continue"**
   - Click **"Back to Dashboard"**

4. Create OAuth Client ID:
   - **Application type:** Web application
   - **Name:** Myjoe Web Client
   - **Authorized redirect URIs:** Add:
     ```
     https://rziohajwncqcgzorjqff.supabase.co/auth/v1/callback
     ```
   - For local development, also add:
     ```
     http://localhost:3000/auth/callback
     ```
   - Click **"Create"**

5. Copy the credentials:
   - **Client ID** (starts with something like `123456789-abc...`)
   - **Client Secret** (starts with `GOCSPX-...`)

## Step 4: Configure Supabase

1. Go back to Supabase Dashboard → Authentication → Providers → Google
2. Paste the **Client ID** into the "Client IDs" field
3. Paste the **Client Secret** into the "Client Secret" field
4. Click **"Save"**

## Step 5: Test

1. Go to your app's `/login` page
2. Click "Sign in with Google"
3. You should be redirected to Google for authentication
4. After authorizing, you'll be redirected back to your app

## Troubleshooting

### "redirect_uri_mismatch" error
- Make sure the redirect URI in Google Cloud Console exactly matches:
  `https://rziohajwncqcgzorjqff.supabase.co/auth/v1/callback`
- Check for trailing slashes or typos

### "Access blocked" error
- Make sure OAuth consent screen is configured
- Add your email as a test user (if app is in testing mode)
- Verify the app is published (if you want public access)

### Client Secret not working
- Make sure you copied the full secret (it's long)
- Check for extra spaces when pasting
- Regenerate if needed in Google Cloud Console

## Production Checklist

- [ ] OAuth consent screen published (for public access)
- [ ] Production redirect URI added
- [ ] Client ID and Secret saved securely
- [ ] Test authentication flow works
- [ ] Error handling tested
