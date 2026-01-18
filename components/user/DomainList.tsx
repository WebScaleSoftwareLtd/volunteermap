'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Notification } from '@/components/ui';
import type { DomainAssociation } from '@/lib/db/schema';

interface DomainListProps {
  domains: DomainAssociation[];
  validationRecord: string;
}

export function DomainList({ domains, validationRecord }: DomainListProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleVerify(domainId: number) {
    setLoading(domainId);
    setError(null);

    try {
      const res = await fetch(`/api/user/domains/${domainId}/verify`, {
        method: 'POST',
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || 'Verification failed');
        setLoading(null);
        return;
      }

      router.refresh();
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(null);
    }
  }

  async function handleDelete(domainId: number) {
    if (!confirm('Are you sure you want to delete this domain?')) {
      return;
    }

    setLoading(domainId);
    setError(null);

    try {
      const res = await fetch(`/api/user/domains/${domainId}`, {
        method: 'DELETE',
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || 'Failed to delete domain');
        setLoading(null);
        return;
      }

      router.refresh();
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(null);
    }
  }

  if (domains.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        You haven&apos;t added any domains yet.
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <Notification type="error" message={error} onClose={() => setError(null)} />
        </div>
      )}

      <ul className="divide-y divide-gray-200 dark:divide-gray-800">
        {domains.map((domain) => (
          <li key={domain.id} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-gray-100">{domain.domain}</span>
                  {domain.validationActive ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-200">
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-200">
                      Pending
                    </span>
                  )}
                </div>
                {!domain.validationActive && (
                  <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
                    Verification attempts: {domain.validationCheckCount}/5
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {!domain.validationActive && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleVerify(domain.id)}
                    loading={loading === domain.id}
                  >
                    Verify
                  </Button>
                )}
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(domain.id)}
                  loading={loading === domain.id}
                >
                  Delete
                </Button>
              </div>
            </div>

            {!domain.validationActive && (
              <div className="mt-4 bg-gray-50 rounded p-3 dark:bg-gray-800/60">
                <p className="text-sm text-gray-600 mb-2 dark:text-gray-300">
                  Add this TXT record to your DNS:
                </p>
                <code className="text-xs break-all text-gray-900 dark:text-gray-100">{validationRecord}</code>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
