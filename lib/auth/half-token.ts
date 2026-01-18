import { cookies } from 'next/headers';
import { db, halfTokens, users } from '@/lib/db';
import { eq, and, gt } from 'drizzle-orm';

const HALF_TOKEN_COOKIE_NAME = 'half_token';
const HALF_TOKEN_DURATION_HOURS = 2;

export async function createHalfToken(userId: number): Promise<string> {
  // Delete any existing half tokens for this user
  await db.delete(halfTokens).where(eq(halfTokens.userId, userId));

  const [newToken] = await db
    .insert(halfTokens)
    .values({ userId })
    .returning({ token: halfTokens.token });

  const cookieStore = await cookies();
  cookieStore.set(HALF_TOKEN_COOKIE_NAME, newToken.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: HALF_TOKEN_DURATION_HOURS * 60 * 60,
    path: '/',
  });

  return newToken.token;
}

export async function getHalfTokenUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(HALF_TOKEN_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const result = await db
    .select({
      id: users.id,
      username: users.username,
      email: users.email,
      twoFaToken: users.twoFaToken,
    })
    .from(halfTokens)
    .innerJoin(users, eq(halfTokens.userId, users.id))
    .where(
      and(
        eq(halfTokens.token, token),
        gt(halfTokens.createdAt, new Date(Date.now() - HALF_TOKEN_DURATION_HOURS * 60 * 60 * 1000))
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

export async function destroyHalfToken(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(HALF_TOKEN_COOKIE_NAME)?.value;

  if (token) {
    await db.delete(halfTokens).where(eq(halfTokens.token, token));
    cookieStore.delete(HALF_TOKEN_COOKIE_NAME);
  }
}

export async function destroyAllUserHalfTokens(userId: number): Promise<void> {
  await db.delete(halfTokens).where(eq(halfTokens.userId, userId));
}
