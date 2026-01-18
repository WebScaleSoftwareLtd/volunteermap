import { cookies } from 'next/headers';
import { db, userTokens, users } from '@/lib/db';
import { eq, and, gt } from 'drizzle-orm';

const SESSION_COOKIE_NAME = 'auth_token';
const SESSION_DURATION_DAYS = 3;

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const result = await db
    .select({
      id: users.id,
      username: users.username,
      email: users.email,
      avatarUrl: users.avatarUrl,
      userValidationId: users.userValidationId,
      twoFaToken: users.twoFaToken,
    })
    .from(userTokens)
    .innerJoin(users, eq(userTokens.userId, users.id))
    .where(
      and(
        eq(userTokens.token, token),
        gt(userTokens.createdAt, new Date(Date.now() - SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000))
      )
    )
    .limit(1);

  if (result.length === 0) {
    // Token expired or invalid.
    // NOTE: Don't mutate cookies here; this can be called from Server Components.
    return null;
  }

  return result[0];
}

export async function createSession(userId: number): Promise<string> {
  const [newToken] = await db
    .insert(userTokens)
    .values({ userId })
    .returning({ token: userTokens.token });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, newToken.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60,
    path: '/',
  });

  return newToken.token;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await db.delete(userTokens).where(eq(userTokens.token, token));
    cookieStore.delete(SESSION_COOKIE_NAME);
  }
}

export async function destroyAllUserSessions(userId: number): Promise<void> {
  await db.delete(userTokens).where(eq(userTokens.userId, userId));
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}
