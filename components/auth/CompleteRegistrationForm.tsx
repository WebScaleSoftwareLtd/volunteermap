'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Notification } from '@/components/ui';

interface CompleteRegistrationFormProps {
  token: string;
  email: string;
  redirectTo?: string;
}

export function CompleteRegistrationForm({
  token,
  email,
  redirectTo,
}: CompleteRegistrationFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const data = {
      token,
      email,
      username: formData.get('username') as string,
      password: formData.get('password') as string,
      passwordConfirmation: formData.get('passwordConfirmation') as string,
    };

    try {
      const res = await fetch('/api/auth/register/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        } else {
          setError(result.error || 'Registration failed');
        }
        setLoading(false);
        return;
      }

      // Registration successful
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

      <Input
        label="Username"
        name="username"
        type="text"
        autoComplete="username"
        required
        placeholder="Choose a username"
        hint="3-20 characters, letters and numbers only"
        error={fieldErrors.username}
      />

      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        placeholder="Choose a password"
        hint="At least 8 characters"
        error={fieldErrors.password}
      />

      <Input
        label="Confirm password"
        name="passwordConfirmation"
        type="password"
        autoComplete="new-password"
        required
        placeholder="Confirm your password"
        error={fieldErrors.passwordConfirmation}
      />

      <Button type="submit" loading={loading} className="w-full">
        Create account
      </Button>
    </form>
  );
}
