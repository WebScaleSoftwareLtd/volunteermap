import { NextRequest, NextResponse } from 'next/server';
import { db, users, pendingSignups } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { hashPassword } from '@/lib/auth/password';
import { createSession } from '@/lib/auth/session';
import { z } from 'zod';

const registrationSchema = z.object({
  token: z.string().uuid(),
  email: z.string().email(),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9]+$/, 'Username can only contain letters and numbers'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  passwordConfirmation: z.string(),
}).refine((data) => data.password === data.passwordConfirmation, {
  message: 'Passwords do not match',
  path: ['passwordConfirmation'],
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = registrationSchema.safeParse(body);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      for (const error of validation.error.errors) {
        const field = error.path[0] as string;
        fieldErrors[field] = error.message;
      }
      return NextResponse.json({ fieldErrors }, { status: 400 });
    }

    const { token, email, username, password } = validation.data;
    const normalizedUsername = username.toLowerCase();

    // Verify pending signup exists
    const pendingSignup = await db
      .select()
      .from(pendingSignups)
      .where(eq(pendingSignups.emailToken, token))
      .limit(1);

    if (pendingSignup.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired registration link' },
        { status: 400 }
      );
    }

    // Verify email matches
    if (pendingSignup[0].email !== email.toLowerCase()) {
      return NextResponse.json(
        { error: 'Invalid registration link' },
        { status: 400 }
      );
    }

    // Check if username is taken
    const existingUsername = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, normalizedUsername))
      .limit(1);

    if (existingUsername.length > 0) {
      return NextResponse.json(
        { fieldErrors: { username: 'Username is already taken' } },
        { status: 400 }
      );
    }

    // Check if email is already registered
    const existingEmail = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (existingEmail.length > 0) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password and create user
    const passwordDigest = await hashPassword(password);

    const [newUser] = await db
      .insert(users)
      .values({
        username: normalizedUsername,
        email: email.toLowerCase(),
        passwordDigest,
      })
      .returning({ id: users.id });

    // Delete all pending signups for this email
    await db.delete(pendingSignups).where(eq(pendingSignups.email, email.toLowerCase()));

    // Create session
    await createSession(newUser.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Registration completion error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
