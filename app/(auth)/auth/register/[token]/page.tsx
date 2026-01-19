import { redirect, notFound } from 'next/navigation';
import { db, pendingSignups, users } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth/session';
import { CompleteRegistrationForm } from '@/components/auth/CompleteRegistrationForm';

export default async function CompleteRegistrationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const user = await getCurrentUser();
  if (user) {
    redirect('/');
  }

  const { token } = await params;

  // Find the pending signup
  const result = await db
    .select()
    .from(pendingSignups)
    .where(eq(pendingSignups.emailToken, token))
    .limit(1);

  if (result.length === 0) {
    notFound();
  }

  const pendingSignup = result[0];

  // Check if email is already registered
  const existingUser = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, pendingSignup.email))
    .limit(1);

  if (existingUser.length > 0) {
    redirect('/auth/login');
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Complete your account
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Creating account for{' '}
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {pendingSignup.email}
          </span>
        </p>
      </div>

      <CompleteRegistrationForm
        token={token}
        email={pendingSignup.email}
        redirectTo={pendingSignup.redirectTo || undefined}
      />
    </div>
  );
}
