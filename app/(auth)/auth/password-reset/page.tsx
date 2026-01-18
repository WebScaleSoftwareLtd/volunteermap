import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { PasswordResetRequestForm } from '@/components/auth/PasswordResetRequestForm';

export default async function PasswordResetPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect('/');
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Reset your password</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Enter your email address and we&apos;ll send you a reset link
        </p>
      </div>

      <PasswordResetRequestForm />

      <div className="text-center text-sm text-gray-600 dark:text-gray-300">
        Remember your password?{' '}
        <a
          href="/auth/login"
          className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Sign in
        </a>
      </div>
    </div>
  );
}
