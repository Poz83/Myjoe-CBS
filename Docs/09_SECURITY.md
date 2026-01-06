# Security & Controls

## Authentication

### Supported Methods

| Method | Provider | Use Case |
|--------|----------|----------|
| Google OAuth | Supabase Auth | Primary (fastest) |
| Magic Link | Supabase Auth | Alternative |

### Auth Flow

```
User visits /login
        │
        ▼
┌───────────────────┐
│   Show Options    │
│ [Google] [Email]  │
└─────────┬─────────┘
          │
          ▼ (Google)
┌───────────────────┐
│  Redirect to      │
│  Google OAuth     │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│  Google callback  │
│  → /auth/callback │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│  Supabase creates │
│  auth.users row   │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│  Trigger fires:   │
│  Create profile   │
│  (plan='free')    │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│  Redirect to      │
│  /studio          │
└───────────────────┘
```

### Implementation

```typescript
// src/lib/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/', '/login', '/api/webhooks'];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );
  
  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;
  
  // Check if public route
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
  
  // Redirect logged-in users away from login
  if (user && pathname === '/login') {
    return NextResponse.redirect(new URL('/studio', request.url));
  }
  
  // Redirect non-logged-in users to login
  if (!user && !isPublicRoute) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }
  
  return response;
}
```

### Auth Callback

```typescript
// src/app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/studio';
  
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }
  
  // Auth error - redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
```

---

## Row Level Security (RLS)

**CRITICAL: Every table with user data MUST have RLS enabled**

### Policy Pattern

```sql
-- Enable RLS
ALTER TABLE {table_name} ENABLE ROW LEVEL SECURITY;

-- Standard CRUD policy (owner only)
CREATE POLICY "Users can CRUD own {table_name}"
  ON {table_name}
  FOR ALL
  USING (auth.uid() = owner_id);

-- Or with soft delete
CREATE POLICY "Users can CRUD own {table_name}"
  ON {table_name}
  FOR ALL
  USING (auth.uid() = owner_id AND deleted_at IS NULL);
```

### RLS Checklist

| Table | RLS | Policy |
|-------|-----|--------|
| `profiles` | ✅ | Own profile only |
| `projects` | ✅ | Own projects only |
| `heroes` | ✅ | Own heroes only |
| `pages` | ✅ | Via project ownership |
| `page_versions` | ✅ | Via page → project |
| `jobs` | ✅ | Own jobs only |
| `job_items` | ✅ | Via job ownership |
| `assets` | ✅ | Own assets only |
| `global_config` | ✅ | Read-only for all |

### Testing RLS

```typescript
// src/tests/rls.test.ts
import { createClient } from '@supabase/supabase-js';

describe('RLS Policies', () => {
  const userA = createClient(URL, ANON_KEY, { 
    headers: { Authorization: `Bearer ${USER_A_TOKEN}` }
  });
  const userB = createClient(URL, ANON_KEY, {
    headers: { Authorization: `Bearer ${USER_B_TOKEN}` }
  });
  
  test('User cannot access other users projects', async () => {
    // User A creates project
    const { data: project } = await userA
      .from('projects')
      .insert({ name: 'Test' })
      .select()
      .single();
    
    // User B tries to access
    const { data, error } = await userB
      .from('projects')
      .select()
      .eq('id', project.id)
      .single();
    
    expect(data).toBeNull();
  });
});
```

---

## Rate Limiting

### Limits by Resource

| Resource | Limit | Window | Scope |
|----------|-------|--------|-------|
| API requests | 100 | 1 min | Per user |
| Generation jobs | 5 | 1 min | Per user |
| Page edits | 20 | 1 min | Per user |
| Export requests | 10 | 1 hour | Per user |
| Login attempts | 5 | 15 min | Per IP |
| Magic link sends | 3 | 15 min | Per email |

### Implementation

```typescript
// src/lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

export const rateLimiters = {
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1m'),
    prefix: 'ratelimit:api',
  }),
  
  generation: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1m'),
    prefix: 'ratelimit:gen',
  }),
  
  export: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1h'),
    prefix: 'ratelimit:export',
  }),
};

export async function checkRateLimit(
  limiter: keyof typeof rateLimiters,
  identifier: string
): Promise<{ success: boolean; remaining: number }> {
  const result = await rateLimiters[limiter].limit(identifier);
  return {
    success: result.success,
    remaining: result.remaining,
  };
}
```

### Usage in API Routes

```typescript
// src/app/api/generate/route.ts
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const user = await getUser();
  
  // Check rate limit
  const { success, remaining } = await checkRateLimit('generation', user.id);
  
  if (!success) {
    return Response.json(
      { error: 'Rate limit exceeded. Please wait before generating more.' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Remaining': '0',
          'Retry-After': '60',
        },
      }
    );
  }
  
  // Continue with generation...
}
```

---

## Input Validation

### API Request Validation

```typescript
// src/lib/validation.ts
import { z } from 'zod';

export const CreateProjectSchema = z.object({
  name: z.string().min(1).max(100),
  pageCount: z.number().int().min(1).max(45),
  audience: z.enum(['toddler', 'children', 'tween', 'teen', 'adult']),
  stylePreset: z.enum(['bold-simple', 'kawaii', 'whimsical', 'cartoon', 'botanical']),
  trimSize: z.enum(['8.5x11', '8.5x8.5', '6x9']).default('8.5x11'),
  heroId: z.string().uuid().nullable().optional(),
});

export const EditPageSchema = z.object({
  type: z.enum(['regenerate', 'inpaint', 'quick_action']),
  prompt: z.string().min(1).max(500).optional(),
  action: z.enum(['simplify', 'add_detail']).optional(),
  maskDataUrl: z.string().optional(),
});

// Usage
export async function POST(request: Request) {
  const body = await request.json();
  
  const result = CreateProjectSchema.safeParse(body);
  
  if (!result.success) {
    return Response.json(
      { error: 'Validation error', details: result.error.flatten() },
      { status: 400 }
    );
  }
  
  const validatedData = result.data;
  // Continue...
}
```

---

## Signed URLs (R2)

### Pattern

```typescript
// src/server/storage/signed-urls.ts
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function getSignedDownloadUrl(key: string): Promise<string> {
  // Verify ownership before signing
  const asset = await getAssetByKey(key);
  if (!asset || asset.owner_id !== getCurrentUserId()) {
    throw new Error('Access denied');
  }
  
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
  });
  
  return getSignedUrl(s3, command, { expiresIn: 3600 }); // 1 hour
}

export async function getSignedUploadUrl(
  key: string,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    ContentType: contentType,
  });
  
  return getSignedUrl(s3, command, { expiresIn: 300 }); // 5 min
}
```

---

## Kill Switches

### Global Config Table

```sql
-- Check before expensive operations
SELECT value FROM global_config WHERE key = 'generation_enabled';
```

### Implementation

```typescript
// src/lib/config.ts
import { createClient } from '@/lib/supabase/server';

type ConfigKey = 
  | 'generation_enabled'
  | 'export_enabled'
  | 'signup_enabled'
  | 'maintenance_mode';

export async function getConfig(key: ConfigKey): Promise<boolean> {
  const supabase = await createClient();
  
  const { data } = await supabase
    .from('global_config')
    .select('value')
    .eq('key', key)
    .single();
  
  return data?.value === 'true' || data?.value === true;
}

// Usage in API route
export async function POST(request: Request) {
  const generationEnabled = await getConfig('generation_enabled');
  
  if (!generationEnabled) {
    return Response.json(
      { error: 'Generation is temporarily disabled. Please try again later.' },
      { status: 503 }
    );
  }
  
  // Continue...
}
```

### Admin Toggle (Supabase Dashboard)

```sql
-- Disable generation
UPDATE global_config SET value = 'false' WHERE key = 'generation_enabled';

-- Enable generation
UPDATE global_config SET value = 'true' WHERE key = 'generation_enabled';
```

---

## Account Deletion

### Flow

```
User requests deletion
        │
        ▼
┌───────────────────┐
│  Confirm in UI    │
│  (type "DELETE")  │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│  Delete R2 assets │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│  Delete DB data   │
│  (cascades)       │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│  DISABLE auth     │
│  (don't delete)   │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│  Set disabled_at  │
│  in profile       │
└───────────────────┘
```

### Why Disable Instead of Delete Auth?

Prevents free tier abuse:
1. User signs up (free 50 Blots)
2. User uses Blots
3. User deletes account
4. User signs up again (free 50 Blots)
5. Repeat

With `disabled_at`, the email is blacklisted and can't re-register.

### Implementation

```typescript
// src/server/account/delete.ts
export async function deleteAccount(userId: string): Promise<void> {
  // 1. Delete all R2 assets
  const assets = await getAssetsByUser(userId);
  await Promise.all(assets.map(a => deleteFromR2(a.r2_key)));
  
  // 2. Mark profile as disabled (triggers cascade delete in DB)
  await updateProfile(userId, {
    disabled_at: new Date().toISOString(),
  });
  
  // 3. Disable Supabase auth user (not delete)
  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    ban_duration: 'none', // Permanent ban
  });
  
  // 4. Sign out user
  await supabaseAdmin.auth.admin.signOut(userId);
}
```

---

## Security Headers

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
  },
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

---

## Environment Variables Security

| Rule | Implementation |
|------|----------------|
| Never in code | Use `.env.local` |
| Never in git | Add to `.gitignore` |
| Production in Vercel | Dashboard → Settings → Environment Variables |
| Service keys server-only | Never prefix with `NEXT_PUBLIC_` |

```
# Public (safe for client)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Private (server only)
SUPABASE_SERVICE_ROLE_KEY=     # DANGER: Full DB access
STRIPE_SECRET_KEY=             # Payment processing
STRIPE_WEBHOOK_SECRET=         # Webhook verification
OPENAI_API_KEY=                # AI generation
R2_ACCESS_KEY_ID=              # Storage
R2_SECRET_ACCESS_KEY=          # Storage
```
