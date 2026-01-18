import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { LoginForm } from '@/components/auth/LoginForm';

export default async function LoginPage({
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Sign in</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Welcome back to VolunteerMap
        </p>
      </div>

      <LoginForm redirectTo={params.redirect} />

      <div className="text-center text-sm text-gray-600 dark:text-gray-300">
        Don&apos;t have an account?{' '}
        <a
          href={`/auth/register${params.redirect ? `?redirect=${encodeURIComponent(params.redirect)}` : ''}`}
          className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Sign up
        </a>
      </div>
    </div>
  );
}
