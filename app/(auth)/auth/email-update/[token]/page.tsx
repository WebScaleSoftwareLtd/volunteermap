import { redirect, notFound } from 'next/navigation';
import { db, emailUpdateRequests, users } from '@/lib/db';
import { eq } from 'drizzle-orm';

export default async function EmailUpdatePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // Find the email update request
  const result = await db
    .select()
    .from(emailUpdateRequests)
    .where(eq(emailUpdateRequests.token, token))
    .limit(1);

  if (result.length === 0) {
    notFound();
  }

  const request = result[0];

  // Check if email is already in use
  const existingUser = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, request.email))
    .limit(1);

  if (existingUser.length > 0) {
    // Email already taken
    await db.delete(emailUpdateRequests).where(eq(emailUpdateRequests.id, request.id));
    return (
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-red-600">Email already in use</h1>
        <p className="text-gray-600">
          This email address is already associated with another account.
        </p>
        <a href="/user/settings" className="text-blue-600 hover:underline">
          Go to settings
        </a>
      </div>
    );
  }

  // Update user's email
  await db
    .update(users)
    .set({ email: request.email, updatedAt: new Date() })
    .where(eq(users.id, request.userId));

  // Delete the email update request
  await db.delete(emailUpdateRequests).where(eq(emailUpdateRequests.id, request.id));

  redirect('/user/settings');
}
