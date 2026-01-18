import { notFound } from 'next/navigation';
import { db, passwordUpdateRequests, users } from '@/lib/db';
import { eq, and, gt } from 'drizzle-orm';
import { PasswordResetForm } from '@/components/auth/PasswordResetForm';

const PASSWORD_RESET_EXPIRY_MINUTES = 15;

function getExpiryDate(): Date {
  return new Date(Date.now() - PASSWORD_RESET_EXPIRY_MINUTES * 60 * 1000);
}

export default async function PasswordResetTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const expiryDate = getExpiryDate();

  // Find the password reset request
  const result = await db
    .select({
      userId: passwordUpdateRequests.userId,
      createdAt: passwordUpdateRequests.createdAt,
      twoFaToken: users.twoFaToken,
      username: users.username,
    })
    .from(passwordUpdateRequests)
    .innerJoin(users, eq(passwordUpdateRequests.userId, users.id))
    .where(
      and(
        eq(passwordUpdateRequests.token, token),
        gt(passwordUpdateRequests.createdAt, expiryDate)
      )
    )
    .limit(1);

  if (result.length === 0) {
    notFound();
  }

  const resetRequest = result[0];
  const requires2FA = !!resetRequest.twoFaToken;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Set new password</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Enter your new password below
        </p>
      </div>

      <PasswordResetForm token={token} requires2FA={requires2FA} />
    </div>
  );
}
