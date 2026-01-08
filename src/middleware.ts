import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/', '/landing', '/login', '/auth/callback'];
const PROTECTED_ROUTES = ['/dashboard', '/studio', '/api'];

export async function middleware(request: NextRequest) {
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/4b5f8db5-0ff7-4203-b2e4-06e25ade0057',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'middleware.ts:7',message:'Middleware entry',data:{pathname:request.nextUrl.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Refresh session if needed (this ensures cookies are up to date)
  const {
    data: { session },
  } = await supabase.auth.getSession();
  
  const user = session?.user ?? null;

  const pathname = request.nextUrl.pathname;
  
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/4b5f8db5-0ff7-4203-b2e4-06e25ade0057',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'middleware.ts:37',message:'Auth check result',data:{pathname,hasUser:!!user,userId:user?.id||null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  
  // Check if route is public
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'));
  
  // Check if route is webhook (public even though it's under /api)
  const isWebhook = pathname.startsWith('/api/webhooks');
  
  // Check if route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route)) && !isWebhook;

  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/4b5f8db5-0ff7-4203-b2e4-06e25ade0057',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'middleware.ts:48',message:'Route classification',data:{pathname,isPublicRoute,isProtectedRoute,isWebhook},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion

  // Redirect to login if accessing protected route without auth
  if (isProtectedRoute && !user) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/4b5f8db5-0ff7-4203-b2e4-06e25ade0057',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'middleware.ts:51',message:'Redirecting to login',data:{pathname,redirectTo:redirectUrl.toString()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect to dashboard if accessing login while authenticated
  if (pathname === '/login' && user) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/4b5f8db5-0ff7-4203-b2e4-06e25ade0057',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'middleware.ts:58',message:'Redirecting authenticated user from login',data:{userId:user.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/4b5f8db5-0ff7-4203-b2e4-06e25ade0057',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'middleware.ts:62',message:'Middleware allowing request',data:{pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
