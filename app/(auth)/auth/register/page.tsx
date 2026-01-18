import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { RegisterEmailForm } from '@/components/auth/RegisterEmailForm';

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) {
    redirect('/');
  }

  const params = await searchParams;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Create an account</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Enter your email to get started
        </p>
      </div>

      <RegisterEmailForm redirectTo={params.redirect} />

      <div className="text-center text-sm text-gray-600 dark:text-gray-300">
        Already have an account?{' '}
        <a
          href={`/auth/login${params.redirect ? `?redirect=${encodeURIComponent(params.redirect)}` : ''}`}
          className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Sign in
        </a>
      </div>
    </div>
  );
}
