import * as Sentry from "@sentry/nextjs";
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = "force-dynamic";

class SentryExampleAPIError extends Error {
  constructor(message: string | undefined) {
    super(message);
    this.name = "SentryExampleAPIError";
  }
}

// A faulty API route to test Sentry's error monitoring
// Only available in development or to authenticated users
export async function GET() {
  // Require authentication to prevent abuse
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized - authentication required for Sentry test endpoint' },
      { status: 401 }
    );
  }

  Sentry.logger.info("Sentry example API called", { userId: user.id });
  throw new SentryExampleAPIError(
    "This error is raised on the backend called by the example page.",
  );
}
