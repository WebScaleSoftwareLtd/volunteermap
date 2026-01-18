import { NextRequest, NextResponse } from 'next/server';
import { db, users, emailUpdateRequests } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/session';
import { verifyPassword, hashPassword } from '@/lib/auth/password';
import { sendEmailChangeConfirmation } from '@/lib/services/email';
import { z } from 'zod';
import crypto from 'crypto';

const settingsSchema = z.object({
  email: z.string().email('Invalid email').optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, 'Password must be at least 8 characters').optional(),
});

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    // Validate input
    const validation = settingsSchema.safeParse(body);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      for (const error of validation.error.errors) {
        const field = error.path[0] as string;
        fieldErrors[field] = error.message;
      }
      return NextResponse.json({ fieldErrors }, { status: 400 });
    }

    const { email, currentPassword, newPassword } = validation.data;

    // Get current user data
    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    const messages: string[] = [];

    // Handle email change
    if (email && email.toLowerCase() !== currentUser.email) {
      const normalizedEmail = email.toLowerCase();

      // Check if email is already in use
      const existingUser = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, normalizedEmail))
        .limit(1);

      if (existingUser.length > 0) {
        return NextResponse.json(
          { fieldErrors: { email: 'This email is already in use' } },
          { status: 400 }
        );
      }

      // Delete any existing email update request
      await db.delete(emailUpdateRequests).where(eq(emailUpdateRequests.userId, user.id));

      // Create new email update request
      const token = crypto.randomBytes(32).toString('hex');
      await db.insert(emailUpdateRequests).values({
        userId: user.id,
        email: normalizedEmail,
        token,
      });

      // Send confirmation email
      await sendEmailChangeConfirmation(normalizedEmail, token);

      messages.push('Confirmation email sent to new address');
    }

    // Handle password change
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { fieldErrors: { currentPassword: 'Current password is required' } },
          { status: 400 }
        );
      }

      // Verify current password
      const isValid = await verifyPassword(currentPassword, currentUser.passwordDigest);
      if (!isValid) {
        return NextResponse.json(
          { fieldErrors: { currentPassword: 'Incorrect password' } },
          { status: 400 }
        );
      }

      // Hash and save new password
      const passwordDigest = await hashPassword(newPassword);
      await db
        .update(users)
        .set({ passwordDigest, updatedAt: new Date() })
        .where(eq(users.id, user.id));

      messages.push('Password updated');
    }

    return NextResponse.json({
      success: true,
      message: messages.length > 0 ? messages.join('. ') : 'Settings updated',
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Settings update error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
