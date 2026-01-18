'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Notification } from '@/components/ui';

interface LoginFormProps {
  redirectTo?: string;
}

export function LoginForm({ redirectTo }: LoginFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needs2FA, setNeeds2FA] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      identifier: formData.get('identifier') as string,
      password: formData.get('password') as string,
      totpCode: formData.get('totpCode') as string | null,
    };

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || 'Login failed');
        setLoading(false);
        return;
      }

      if (result.requires2FA) {
        setNeeds2FA(true);
        setLoading(false);
        return;
      }

      // Login successful
      router.push(redirectTo || '/');
      router.refresh();
    } catch {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Notification
          type="error"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {!needs2FA ? (
        <>
          <Input
            label="Username or email"
            name="identifier"
            type="text"
            autoComplete="username"
            required
          />

          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />

          <div className="flex items-center justify-between">
            <Link
              href="/auth/password-reset"
              className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Forgot your password?
            </Link>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Enter your two-factor authentication code from your authenticator app,
            or use one of your backup codes.
          </p>

          <Input
            label="Authentication code"
            name="totpCode"
            type="text"
            autoComplete="one-time-code"
            placeholder="000000 or backup code"
            required
          />

          <input type="hidden" name="identifier" value="" />
          <input type="hidden" name="password" value="" />
        </div>
      )}

      <Button type="submit" loading={loading} className="w-full">
        {needs2FA ? 'Verify' : 'Sign in'}
      </Button>
    </form>
  );
}
