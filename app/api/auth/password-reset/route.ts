import { NextRequest, NextResponse } from 'next/server';
import { db, users, passwordUpdateRequests } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { sendPasswordResetEmail } from '@/lib/services/email';
import { z } from 'zod';

const emailSchema = z.string().email('Invalid email address');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email
    const emailResult = emailSchema.safeParse(email?.toLowerCase().trim());
    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const normalizedEmail = emailResult.data;

    // Find user by email
    const result = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    // Always return success to prevent email enumeration
    if (result.length === 0) {
      return NextResponse.json({ success: true });
    }

    const user = result[0];

    // Delete any existing password reset requests for this user
    await db.delete(passwordUpdateRequests).where(eq(passwordUpdateRequests.userId, user.id));

    // Create new password reset request
    const [resetRequest] = await db
      .insert(passwordUpdateRequests)
      .values({ userId: user.id })
      .returning({ token: passwordUpdateRequests.token });

    // Send password reset email
    await sendPasswordResetEmail(normalizedEmail, resetRequest.token);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
