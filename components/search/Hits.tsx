'use client';

import { useHits } from 'react-instantsearch';
import Link from 'next/link';
import { MagnifyingGlassIcon } from '@/components/ui';

interface OpportunityHit {
  objectID: string;
  uuid: string;
  title: string;
  description: string;
  category: string;
  mentally_taxing: boolean;
  physically_taxing: boolean;
  time_flexible: boolean;
  domain_name: string | null;
}

export function Hits() {
  const { items } = useHits<OpportunityHit>();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 pb-6 text-gray-500 dark:text-gray-400">
        <MagnifyingGlassIcon className="h-10 w-10 text-gray-400 dark:text-gray-500" />
        <p className="font-medium text-gray-700 dark:text-gray-200">No opportunities found in this area.</p>
        <p className="text-sm">Try zooming out or searching for something else.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((hit) => (
        <Link
          key={hit.objectID}
          href={`/opportunities/${hit.uuid}`}
          className="block bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow dark:bg-gray-900 dark:border-gray-800"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate dark:text-gray-100">
                {hit.title}
              </h3>
              <p className="text-sm text-blue-600 mt-1 dark:text-blue-400">{hit.category}</p>
              {hit.domain_name && (
                <p className="text-xs text-green-600 mt-1 dark:text-green-400">
                  Verified: {hit.domain_name}
                </p>
              )}
            </div>
          </div>

          <p className="text-gray-600 text-sm mt-2 line-clamp-2 dark:text-gray-300">
            {hit.description}
          </p>

          <div className="flex flex-wrap gap-2 mt-3">
            {hit.mentally_taxing && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-200">
                Mentally taxing
              </span>
            )}
            {hit.physically_taxing && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-200">
                Physically taxing
              </span>
            )}
            {hit.time_flexible && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-200">
                Flexible hours
              </span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
