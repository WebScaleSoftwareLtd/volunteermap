'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Notification } from '@/components/ui';

interface PasswordResetFormProps {
  token: string;
  requires2FA: boolean;
}

export function PasswordResetForm({ token, requires2FA }: PasswordResetFormProps) {
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
      password: formData.get('password') as string,
      passwordConfirmation: formData.get('passwordConfirmation') as string,
      totpCode: requires2FA ? (formData.get('totpCode') as string) : undefined,
    };

    try {
      const res = await fetch('/api/auth/password-reset/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        } else {
          setError(result.error || 'Password reset failed');
        }
        setLoading(false);
        return;
      }

      // Password reset successful - redirect to login
      router.push('/auth/login');
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
        label="New password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        placeholder="Enter new password"
        hint="At least 8 characters"
        error={fieldErrors.password}
      />

      <Input
        label="Confirm password"
        name="passwordConfirmation"
        type="password"
        autoComplete="new-password"
        required
        placeholder="Confirm new password"
        error={fieldErrors.passwordConfirmation}
      />

      {requires2FA && (
        <Input
          label="Authentication code"
          name="totpCode"
          type="text"
          autoComplete="one-time-code"
          required
          placeholder="000000 or backup code"
          hint="Enter your 2FA code or a backup code"
          error={fieldErrors.totpCode}
        />
      )}

      <Button type="submit" loading={loading} className="w-full">
        Reset password
      </Button>
    </form>
  );
}
