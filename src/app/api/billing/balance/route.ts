import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { performanceLogger } from '@/lib/performance-logger';

// Force dynamic rendering since this route uses cookies
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/4b5f8db5-0ff7-4203-b2e4-06e25ade0057',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'balance/route.ts:8',message:'Balance API entry',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion

  const startTime = Date.now();
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/4b5f8db5-0ff7-4203-b2e4-06e25ade0057',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'balance/route.ts:12',message:'Auth check in balance API',data:{hasUser:!!user,userId:user?.id||null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    
    if (!user) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/4b5f8db5-0ff7-4203-b2e4-06e25ade0057',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'balance/route.ts:15',message:'Balance API unauthorized',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // First, try to get profile with all possible columns
    let { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('owner_id', user.id)
      .single();

    // If profile doesn't exist, create it with free tier defaults
    // Only use columns that exist in the base schema
    if (error?.code === 'PGRST116' || !profile) {
      console.log('Profile not found for user', user.id, '- creating new profile');
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/4b5f8db5-0ff7-4203-b2e4-06e25ade0057',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'balance/route.ts:27',message:'Creating new profile',data:{userId:user.id,errorCode:error?.code},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          owner_id: user.id,
          plan: 'free',
          blots: 75,
        })
        .select('*')
        .single();

      if (insertError) {
        console.error('Failed to create profile:', insertError);
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/4b5f8db5-0ff7-4203-b2e4-06e25ade0057',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'balance/route.ts:40',message:'Profile creation failed',data:{error:insertError.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        return NextResponse.json(
          { error: 'Failed to create profile', details: insertError.message },
          { status: 500 }
        );
      }

      profile = newProfile;
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/4b5f8db5-0ff7-4203-b2e4-06e25ade0057',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'balance/route.ts:48',message:'Profile created successfully',data:{blots:newProfile?.blots},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
    } else if (error) {
      // Some other error occurred
      console.error('Profile fetch error:', error);
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/4b5f8db5-0ff7-4203-b2e4-06e25ade0057',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'balance/route.ts:50',message:'Profile fetch error',data:{error:error.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      return NextResponse.json(
        { error: 'Failed to fetch profile', details: error.message },
        { status: 500 }
      );
    }

    // Handle both old (blots) and new (subscription_blots) column names
    const blots = profile.blots ?? profile.subscription_blots ?? 0;
    const planBlots = profile.plan_blots ?? blots;

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/4b5f8db5-0ff7-4203-b2e4-06e25ade0057',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'balance/route.ts:59',message:'Balance data prepared',data:{blots,planBlots,plan:profile.plan},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    const duration = Date.now() - startTime;
    performanceLogger.logApiCall('/api/billing/balance', duration, {
      userId: user.id,
      profileExists: !!profile,
    });

    return NextResponse.json({
      blots,
      planBlots,
      plan: profile.plan ?? 'free',
      resetsAt: profile.blots_reset_at,
      storageUsed: profile.storage_used_bytes ?? 0,
      storageLimit: profile.storage_limit_bytes ?? 1073741824,
      commercialProjectsUsed: profile.commercial_projects_used ?? 0,
    }, {
      headers: {
        'Cache-Control': 'private, max-age=60', // Cache for 60 seconds
      },
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/4b5f8db5-0ff7-4203-b2e4-06e25ade0057',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'balance/route.ts:81',message:'Balance API error',data:{error:error instanceof Error ? error.message : 'Unknown error'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    performanceLogger.logApiCall('/api/billing/balance', duration, {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    console.error('Balance error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch balance' },
      { status: 500 }
    );
  }
}
