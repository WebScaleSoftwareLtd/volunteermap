import { NextRequest, NextResponse } from 'next/server';
import { db, users, pendingSignups } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { sendRegistrationEmail } from '@/lib/services/email';
import { z } from 'zod';

const emailSchema = z.string().email('Invalid email address');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, redirectTo } = body;

    // Validate email
    const emailResult = emailSchema.safeParse(email?.toLowerCase().trim());
    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const normalizedEmail = emailResult.data;

    // Check if email is already registered
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    // Delete any existing pending signups for this email
    await db.delete(pendingSignups).where(eq(pendingSignups.email, normalizedEmail));

    // Create pending signup
    const [pendingSignup] = await db
      .insert(pendingSignups)
      .values({
        email: normalizedEmail,
        redirectTo: redirectTo || null,
      })
      .returning({ emailToken: pendingSignups.emailToken });

    // Send confirmation email
    await sendRegistrationEmail(normalizedEmail, pendingSignup.emailToken);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
