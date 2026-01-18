'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { GoogleMapsProvider, useGoogleMaps } from '@/components/map';
import { Button, Notification } from '@/components/ui';
import { renderMarkdown } from '@/lib/utils/markdown';
import type { Opportunity, DomainAssociation } from '@/lib/db/schema';

interface OpportunityDetailProps {
  opportunity: Opportunity;
  creator: { id: number; username: string };
  domainAssociation: DomainAssociation | null;
  isBookmarked: boolean;
  isOwner: boolean;
  isLoggedIn: boolean;
}

function OpportunityMap({ latitude, longitude }: { latitude: number; longitude: number }) {
  const { isLoaded } = useGoogleMaps();

  if (!isLoaded) {
    return (
      <div className="w-full h-[300px] bg-gray-100 dark:bg-slate-800 rounded-md flex items-center justify-center">
        <p className="text-gray-500 dark:text-slate-300">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="rounded-md overflow-hidden border border-gray-300 dark:border-slate-700">
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '300px' }}
        center={{ lat: latitude, lng: longitude }}
        zoom={15}
        options={{
          mapTypeControl: false,
          fullscreenControl: false,
          zoomControl: true,
          streetViewControl: false,
          draggable: false,
        }}
      >
        <Marker position={{ lat: latitude, lng: longitude }} />
      </GoogleMap>
    </div>
  );
}

export function OpportunityDetail({
  opportunity,
  creator,
  domainAssociation,
  isBookmarked: initialIsBookmarked,
  isOwner,
  isLoggedIn,
}: OpportunityDetailProps) {
  const router = useRouter();
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const descriptionHtml = renderMarkdown(opportunity.description);

  async function handleBookmark() {
    if (!isLoggedIn) {
      router.push(`/auth/login?redirect=/opportunities/${opportunity.uuid}`);
      return;
    }

    setBookmarkLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/opportunities/${opportunity.uuid}/bookmark`, {
        method: isBookmarked ? 'DELETE' : 'POST',
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to update bookmark');
        return;
      }

      setIsBookmarked(!isBookmarked);
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setBookmarkLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this opportunity?')) {
      return;
    }

    setDeleteLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/opportunities/${opportunity.uuid}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to delete opportunity');
        setDeleteLoading(false);
        return;
      }

      router.push('/');
      router.refresh();
    } catch {
      setError('An unexpected error occurred');
      setDeleteLoading(false);
    }
  }

  return (
    <GoogleMapsProvider>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6">
            <Notification type="error" message={error} onClose={() => setError(null)} />
          </div>
        )}

      <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 overflow-hidden">
          {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-slate-800">
            <div className="flex items-start justify-between">
              <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">{opportunity.title}</h1>
              <p className="text-blue-600 dark:text-blue-400 mt-1">{opportunity.category}</p>
                {domainAssociation && (
                <p className="text-green-600 dark:text-green-400 text-sm mt-1">
                    Verified by {domainAssociation.domain}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={isBookmarked ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={handleBookmark}
                  loading={bookmarkLoading}
                >
                  {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                </Button>
                {isOwner && (
                  <>
                    <Link href={`/opportunities/${opportunity.uuid}/edit`}>
                      <Button variant="secondary" size="sm">
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={handleDelete}
                      loading={deleteLoading}
                    >
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
        <div className="p-6 border-b border-gray-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">Description</h2>
            <div
            className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />
          </div>

          {/* Tags */}
        <div className="p-6 border-b border-gray-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">Details</h2>
            <div className="flex flex-wrap gap-2">
              {opportunity.mentallyTaxing && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-200">
                  Mentally taxing
                </span>
              )}
              {opportunity.physicallyTaxing && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-200">
                  Physically taxing
                </span>
              )}
              {opportunity.timeFlexible && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-200">
                  Flexible hours
                </span>
              )}
              {!opportunity.mentallyTaxing && !opportunity.physicallyTaxing && !opportunity.timeFlexible && (
              <span className="text-gray-500 dark:text-slate-400 text-sm">No special requirements</span>
              )}
            </div>
          </div>

          {/* Contact Info */}
          {(opportunity.email || opportunity.phone || opportunity.website) && (
          <div className="p-6 border-b border-gray-200 dark:border-slate-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">Contact</h2>
              <div className="space-y-2">
                {opportunity.email && (
                <p className="text-gray-600 dark:text-slate-300">
                    <span className="font-medium">Email:</span>{' '}
                  <a
                    href={`mailto:${opportunity.email}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                      {opportunity.email}
                    </a>
                  </p>
                )}
                {opportunity.phone && (
                <p className="text-gray-600 dark:text-slate-300">
                    <span className="font-medium">Phone:</span>{' '}
                  <a href={`tel:${opportunity.phone}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                      {opportunity.phone}
                    </a>
                  </p>
                )}
                {opportunity.website && (
                <p className="text-gray-600 dark:text-slate-300">
                    <span className="font-medium">Website:</span>{' '}
                    <a
                      href={opportunity.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {opportunity.website}
                    </a>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Location */}
        <div className="p-6 border-b border-gray-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">Location</h2>
            <OpportunityMap latitude={opportunity.latitude} longitude={opportunity.longitude} />
          </div>

          {/* Footer */}
        <div className="p-6 bg-gray-50 dark:bg-slate-950">
          <p className="text-sm text-gray-600 dark:text-slate-300">
              Posted by{' '}
            <Link href={`/users/${creator.username}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                {creator.username}
              </Link>{' '}
              on {new Date(opportunity.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </GoogleMapsProvider>
  );
}
