'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Notification } from '@/components/ui';

interface TwoFactorSectionProps {
  has2FA: boolean;
  backupCodeCount: number;
}

export function TwoFactorSection({ has2FA, backupCodeCount }: TwoFactorSectionProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [setupData, setSetupData] = useState<{ secret: string; qrCode: string } | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [showDisable, setShowDisable] = useState(false);

  async function startSetup() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/2fa/setup');
      const result = await res.json();

      if (!res.ok) {
        setError(result.error || 'Failed to start 2FA setup');
        setLoading(false);
        return;
      }

      setSetupData(result);
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function confirmSetup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const code = formData.get('code') as string;

    try {
      const res = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: setupData?.secret, code }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || 'Invalid code');
        setLoading(false);
        return;
      }

      setBackupCodes(result.backupCodes);
      setSetupData(null);
      router.refresh();
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function disable2FA(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const code = formData.get('code') as string;

    try {
      const res = await fetch('/api/auth/2fa/setup', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || 'Invalid code');
        setLoading(false);
        return;
      }

      setShowDisable(false);
      router.refresh();
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  // Show backup codes after setup
  if (backupCodes) {
    return (
      <div className="space-y-4">
        <Notification
          type="success"
          message="Two-factor authentication enabled!"
          autoClose={false}
        />

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 dark:bg-yellow-950/30 dark:border-yellow-900">
          <h3 className="font-semibold text-yellow-800 mb-2 dark:text-yellow-200">Save your backup codes</h3>
          <p className="text-sm text-yellow-700 mb-4 dark:text-yellow-200/90">
            These codes can be used to access your account if you lose your authenticator.
            Each code can only be used once.
          </p>

          <div className="bg-white rounded border border-yellow-300 p-4 font-mono text-sm dark:bg-gray-900 dark:border-yellow-900 dark:text-gray-100">
            {backupCodes.map((code, i) => (
              <div key={i} className="py-1">{code}</div>
            ))}
          </div>

          <Button
            className="mt-4"
            onClick={() => setBackupCodes(null)}
          >
            I&apos;ve saved my backup codes
          </Button>
        </div>
      </div>
    );
  }

  // 2FA Setup flow
  if (setupData) {
    return (
      <div className="space-y-4">
        {error && (
          <Notification type="error" message={error} onClose={() => setError(null)} />
        )}

        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
          </p>

          <div className="flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={setupData.qrCode} alt="2FA QR Code" className="w-48 h-48" />
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-300">
            Or enter this code manually:{' '}
            <code className="bg-gray-100 px-2 py-1 rounded dark:bg-gray-800 dark:text-gray-100">
              {setupData.secret}
            </code>
          </p>

          <form onSubmit={confirmSetup} className="space-y-4">
            <Input
              label="Verification code"
              name="code"
              type="text"
              placeholder="000000"
              required
              hint="Enter the 6-digit code from your authenticator app"
            />

            <div className="flex gap-4">
              <Button type="submit" loading={loading}>
                Enable 2FA
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setSetupData(null)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Disable 2FA flow
  if (showDisable) {
    return (
      <div className="space-y-4">
        {error && (
          <Notification type="error" message={error} onClose={() => setError(null)} />
        )}

        <form onSubmit={disable2FA} className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Enter your current 2FA code to disable two-factor authentication.
          </p>

          <Input
            label="Verification code"
            name="code"
            type="text"
            placeholder="000000"
            required
          />

          <div className="flex gap-4">
            <Button type="submit" variant="danger" loading={loading}>
              Disable 2FA
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowDisable(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // Default state
  return (
    <div className="space-y-4">
      {error && (
        <Notification type="error" message={error} onClose={() => setError(null)} />
      )}

      {has2FA ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-200">
              Enabled
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {backupCodeCount} backup codes remaining
            </span>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-300">
            Your account is protected with two-factor authentication.
          </p>

          <Button
            variant="danger"
            onClick={() => setShowDisable(true)}
          >
            Disable 2FA
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Two-factor authentication adds an extra layer of security to your account.
            You&apos;ll need to enter a code from your authenticator app when logging in.
          </p>

          <Button onClick={startSetup} loading={loading}>
            Enable 2FA
          </Button>
        </div>
      )}
    </div>
  );
}
