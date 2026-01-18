'use client';

import { useState } from 'react';
import { Button, Input, Notification } from '@/components/ui';

interface RegisterEmailFormProps {
  redirectTo?: string;
}

export function RegisterEmailForm({ redirectTo }: RegisterEmailFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, redirectTo }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || 'Registration failed');
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="space-y-4">
        <Notification
          type="success"
          message="Check your email!"
          autoClose={false}
        />
        <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
          We&apos;ve sent a confirmation link to your email address.
          Click the link to complete your registration.
        </p>
      </div>
    );
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

      <Input
        label="Email address"
        name="email"
        type="email"
        autoComplete="email"
        required
        placeholder="you@example.com"
      />

      <Button type="submit" loading={loading} className="w-full">
        Continue
      </Button>
    </form>
  );
}
