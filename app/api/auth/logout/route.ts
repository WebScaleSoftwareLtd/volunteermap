import { NextRequest, NextResponse } from 'next/server';
import { destroySession, getCurrentUser, destroyAllUserSessions } from '@/lib/auth/session';
import { destroyAllUserHalfTokens, destroyHalfToken } from '@/lib/auth/half-token';
import { db, passwordUpdateRequests } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  try {
    const user = await getCurrentUser();

    if (user) {
      // Destroy all user sessions and related tokens
      await destroyAllUserSessions(user.id);
      await destroyAllUserHalfTokens(user.id);
      await db.delete(passwordUpdateRequests).where(eq(passwordUpdateRequests.userId, user.id));
    }
    // Always clear current cookies (even if we also cleared server-side rows).
    await destroySession();
    await destroyHalfToken();

  } catch (error) {
    console.error('Logout error:', error);
    // Best-effort cookie cleanup to avoid "stuck logged in" state.
    try {
      await destroySession();
      await destroyHalfToken();
    } catch {
      // ignore
    }
  }

  // Use 303 so the browser follows with a GET.
  return NextResponse.redirect(new URL('/', origin), { status: 303 });
}
