# Fix DNS Conflict: Vercel + Cloudflare R2

## Problem

You're seeing a DNS conflict because:
- **Vercel** needs to add an A record for `myjoe.app` → `216.198.79.1`
- **Cloudflare R2** has a CNAME record for `myjoe.app` → `public.r2.dev`
- You cannot have both a CNAME and an A record for the same domain

## Solution

Move R2 to a subdomain (`cdn.myjoe.app`) so the root domain (`myjoe.app`) can be used by Vercel.

## Step-by-Step Fix

### Step 1: Remove R2 Custom Domain from Root Domain

1. Go to [Cloudflare Dashboard → R2](https://dash.cloudflare.com/)
2. Click on the `myjoeprod` bucket
3. Go to **Settings** → **Domain Access**
4. Find the custom domain entry for `myjoe.app`
5. Click the **Delete** button (or hover over the lock icon if it's locked)
6. Confirm deletion

**Note:** If you see a lock icon, it means the domain is managed by R2. Follow the instructions shown - you may need to delete it from the bucket's Domain Access settings first.

### Step 2: Authorize Vercel DNS Records

1. Go back to the Vercel authorization page
2. Click **Authorize** to allow Vercel to add:
   - TXT record: `_vercel` → `vc-domain-verify=myjoe.app, eb639b7e6a736fe6218a,dc`
   - A record: `myjoe.app` → `216.198.79.1`

### Step 3: Set Up R2 Custom Domain on Subdomain

1. Go back to [Cloudflare Dashboard → R2 → myjoeprod → Settings → Domain Access](https://dash.cloudflare.com/)
2. Click **Add Custom Domain**
3. Enter: `cdn.myjoe.app`
4. Cloudflare will automatically create a CNAME record: `cdn.myjoe.app` → `public.r2.dev`
5. Wait for DNS propagation (usually 1-5 minutes)

### Step 4: Update Environment Variables

Update your `.env.local` file:

```bash
R2_PUBLIC_URL=https://cdn.myjoe.app
```

### Step 5: Update CORS Settings (if needed)

If you're using direct uploads, update your R2 bucket CORS settings to include both domains:

1. Go to [Cloudflare Dashboard → R2 → myjoeprod → Settings → CORS Policy](https://dash.cloudflare.com/)
2. Update the CORS configuration:

```json
[
  {
    "AllowedOrigins": ["https://myjoe.app", "https://cdn.myjoe.app"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

### Step 6: Verify Everything Works

1. **Verify Vercel deployment:**
   - Visit `https://myjoe.app` - should show your Vercel app

2. **Verify R2 access:**
   - Check that signed URLs use `cdn.myjoe.app` domain
   - Test uploading/downloading assets

3. **Check DNS records:**
   - Go to [Cloudflare Dashboard → DNS](https://dash.cloudflare.com/)
   - Verify you have:
     - `myjoe.app` → A record → `216.198.79.1` (Vercel)
     - `cdn.myjoe.app` → CNAME → `public.r2.dev` (R2)
     - `_vercel` → TXT record → `vc-domain-verify=...` (Vercel verification)

## DNS Record Summary

After completing these steps, your DNS should look like:

| Type | Name | Content | Proxy Status |
|------|------|---------|--------------|
| A | myjoe.app | 216.198.79.1 | DNS only |
| CNAME | cdn.myjoe.app | public.r2.dev | DNS only |
| TXT | _vercel | vc-domain-verify=... | - |

## Troubleshooting

### "Domain is locked" error
- The domain is managed by R2's Domain Access feature
- You must delete it from the R2 bucket settings first
- Go to: R2 → myjoeprod → Settings → Domain Access → Delete `myjoe.app`

### R2 URLs still using old domain
- Clear your environment variables cache
- Restart your development server
- Verify `.env.local` has `R2_PUBLIC_URL=https://cdn.myjoe.app`

### CORS errors after migration
- Make sure CORS includes both `https://myjoe.app` and `https://cdn.myjoe.app`
- Check that the Origin header matches exactly (including `https://`)

## Why This Approach?

- **Root domain (`myjoe.app`)**: Reserved for your main Vercel application
- **Subdomain (`cdn.myjoe.app`)**: Used for static assets/CDN via R2
- This is a common pattern and allows both services to coexist without conflicts
