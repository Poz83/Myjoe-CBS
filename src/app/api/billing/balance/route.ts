import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Force dynamic rendering since this route uses cookies
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
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
        return NextResponse.json(
          { error: 'Failed to create profile', details: insertError.message },
          { status: 500 }
        );
      }

      profile = newProfile;
    } else if (error) {
      // Some other error occurred
      console.error('Profile fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch profile', details: error.message },
        { status: 500 }
      );
    }

    // Handle both old (blots) and new (subscription_blots) column names
    const blots = profile.blots ?? profile.subscription_blots ?? 0;
    const planBlots = profile.plan_blots ?? blots;

    return NextResponse.json({
      blots,
      planBlots,
      plan: profile.plan ?? 'free',
      resetsAt: profile.blots_reset_at,
      storageUsed: profile.storage_used_bytes ?? 0,
      storageLimit: profile.storage_limit_bytes ?? 1073741824,
      commercialProjectsUsed: profile.commercial_projects_used ?? 0,
    });
  } catch (error) {
    console.error('Balance error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch balance' },
      { status: 500 }
    );
  }
}
