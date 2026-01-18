'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Notification } from '@/components/ui';

interface AddDomainFormProps {
  validationRecord: string;
}

export function AddDomainForm({ validationRecord }: AddDomainFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const domain = formData.get('domain') as string;

    try {
      const res = await fetch('/api/user/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || 'Failed to add domain');
        setLoading(false);
        return;
      }

      router.refresh();
      (e.target as HTMLFormElement).reset();
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <Notification type="error" message={error} onClose={() => setError(null)} />
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 dark:bg-blue-950/30 dark:border-blue-900">
        <h3 className="font-medium text-blue-800 mb-2 dark:text-blue-200">DNS Verification</h3>
        <p className="text-sm text-blue-700 mb-2 dark:text-blue-200/90">
          To verify your domain, add a TXT record with the following value:
        </p>
        <code className="block bg-white border border-blue-200 rounded px-3 py-2 text-sm break-all dark:bg-gray-900 dark:border-blue-900 dark:text-gray-100">
          {validationRecord}
        </code>
        <p className="text-sm text-blue-600 mt-2 dark:text-blue-300">
          You can add this to the root domain or to <code>_volunteermap.yourdomain.com</code>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-4">
        <div className="flex-1">
          <Input
            name="domain"
            type="text"
            required
            placeholder="example.com"
          />
        </div>
        <Button type="submit" loading={loading}>
          Add Domain
        </Button>
      </form>
    </div>
  );
}
