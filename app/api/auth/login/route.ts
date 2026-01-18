import { NextRequest, NextResponse } from 'next/server';
import { db, users } from '@/lib/db';
import { eq, or } from 'drizzle-orm';
import { safeVerifyPassword } from '@/lib/auth/password';
import { createSession } from '@/lib/auth/session';
import { createHalfToken, getHalfTokenUser, destroyHalfToken } from '@/lib/auth/half-token';
import { verifyTotpCode } from '@/lib/auth/totp';
import { verifyAndConsumeBackupCode } from '@/lib/auth/backup-codes';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier, password, totpCode } = body;

    // If we have a TOTP code, we're completing 2FA
    if (totpCode) {
      const halfTokenUser = await getHalfTokenUser();

      if (!halfTokenUser) {
        return NextResponse.json(
          { error: 'Session expired. Please login again.' },
          { status: 401 }
        );
      }

      if (!halfTokenUser.twoFaToken) {
        return NextResponse.json(
          { error: 'Invalid request' },
          { status: 400 }
        );
      }

      // Try TOTP code first
      const totpValid = verifyTotpCode(
        halfTokenUser.twoFaToken,
        totpCode.replace(/\s/g, ''),
        halfTokenUser.username
      );

      let isValid = totpValid;

      // If TOTP fails, try backup code
      if (!isValid) {
        isValid = await verifyAndConsumeBackupCode(halfTokenUser.id, totpCode);
      }

      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid authentication code' },
          { status: 401 }
        );
      }

      // Clean up half token and create full session
      await destroyHalfToken();
      await createSession(halfTokenUser.id);

      return NextResponse.json({ success: true });
    }

    // Initial login with identifier and password
    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Username/email and password are required' },
        { status: 400 }
      );
    }

    const normalizedIdentifier = identifier.toLowerCase().trim();

    // Find user by username or email (case-insensitive)
    const result = await db
      .select()
      .from(users)
      .where(
        or(
          eq(users.username, normalizedIdentifier),
          eq(users.email, normalizedIdentifier)
        )
      )
      .limit(1);

    const user = result[0] ?? null;

    // Use safe password verification to prevent timing attacks
    const isValid = await safeVerifyPassword(password, user?.passwordDigest ?? null);

    if (!user || !isValid) {
      return NextResponse.json(
        { error: 'Invalid username/email or password' },
        { status: 401 }
      );
    }

    // Check if user has 2FA enabled
    if (user.twoFaToken) {
      // Create half token for 2FA flow
      await createHalfToken(user.id);
      return NextResponse.json({ requires2FA: true });
    }

    // No 2FA, create full session
    await createSession(user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
