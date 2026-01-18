import { NextRequest, NextResponse } from 'next/server';
import { db, users, passwordUpdateRequests, userTokens, halfTokens } from '@/lib/db';
import { eq, and, gt } from 'drizzle-orm';
import { hashPassword } from '@/lib/auth/password';
import { verifyTotpCode } from '@/lib/auth/totp';
import { verifyAndConsumeBackupCode } from '@/lib/auth/backup-codes';
import { z } from 'zod';

const PASSWORD_RESET_EXPIRY_MINUTES = 15;

const resetSchema = z.object({
  token: z.string().uuid(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  passwordConfirmation: z.string(),
  totpCode: z.string().optional(),
}).refine((data) => data.password === data.passwordConfirmation, {
  message: 'Passwords do not match',
  path: ['passwordConfirmation'],
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = resetSchema.safeParse(body);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      for (const error of validation.error.errors) {
        const field = error.path[0] as string;
        fieldErrors[field] = error.message;
      }
      return NextResponse.json({ fieldErrors }, { status: 400 });
    }

    const { token, password, totpCode } = validation.data;

    // Find the password reset request
    const result = await db
      .select({
        id: passwordUpdateRequests.id,
        userId: passwordUpdateRequests.userId,
        twoFaToken: users.twoFaToken,
        username: users.username,
      })
      .from(passwordUpdateRequests)
      .innerJoin(users, eq(passwordUpdateRequests.userId, users.id))
      .where(
        and(
          eq(passwordUpdateRequests.token, token),
          gt(
            passwordUpdateRequests.createdAt,
            new Date(Date.now() - PASSWORD_RESET_EXPIRY_MINUTES * 60 * 1000)
          )
        )
      )
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired password reset link' },
        { status: 400 }
      );
    }

    const resetRequest = result[0];

    // If user has 2FA enabled, verify the code
    if (resetRequest.twoFaToken) {
      if (!totpCode) {
        return NextResponse.json(
          { fieldErrors: { totpCode: '2FA code is required' } },
          { status: 400 }
        );
      }

      // Try TOTP code first
      const totpValid = verifyTotpCode(
        resetRequest.twoFaToken,
        totpCode.replace(/\s/g, ''),
        resetRequest.username
      );

      let isValid = totpValid;

      // If TOTP fails, try backup code
      if (!isValid) {
        isValid = await verifyAndConsumeBackupCode(resetRequest.userId, totpCode);
      }

      if (!isValid) {
        return NextResponse.json(
          { fieldErrors: { totpCode: 'Invalid authentication code' } },
          { status: 400 }
        );
      }
    }

    // Hash new password
    const passwordDigest = await hashPassword(password);

    // Update user's password
    await db
      .update(users)
      .set({ passwordDigest, updatedAt: new Date() })
      .where(eq(users.id, resetRequest.userId));

    // Delete all user tokens (log out everywhere)
    await db.delete(userTokens).where(eq(userTokens.userId, resetRequest.userId));
    await db.delete(halfTokens).where(eq(halfTokens.userId, resetRequest.userId));

    // Delete the password reset request
    await db.delete(passwordUpdateRequests).where(eq(passwordUpdateRequests.id, resetRequest.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Password reset completion error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
