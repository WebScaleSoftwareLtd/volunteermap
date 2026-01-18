'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Textarea, Select, Checkbox, Notification, PlusIcon, XIcon } from '@/components/ui';
import { GoogleMapsProvider, LocationPicker } from '@/components/map';
import { OPPORTUNITY_CATEGORIES } from '@/lib/db/schema';
import type { DomainAssociation, Opportunity } from '@/lib/db/schema';

interface OpportunityFormProps {
  domains: DomainAssociation[];
  opportunity?: Opportunity;
}

const categoryOptions = OPPORTUNITY_CATEGORIES.map((cat) => ({
  value: cat,
  label: cat,
}));

export function OpportunityForm({ domains, opportunity }: OpportunityFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    opportunity ? { lat: opportunity.latitude, lng: opportunity.longitude } : null
  );

  const isEditing = !!opportunity;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);

    if (!location) {
      setFieldErrors({ location: 'Please select a location on the map' });
      setLoading(false);
      return;
    }

    const data = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      latitude: location.lat,
      longitude: location.lng,
      email: (formData.get('email') as string) || null,
      phone: (formData.get('phone') as string) || null,
      website: (formData.get('website') as string) || null,
      mentallyTaxing: formData.get('mentallyTaxing') === 'on',
      physicallyTaxing: formData.get('physicallyTaxing') === 'on',
      timeFlexible: formData.get('timeFlexible') === 'on',
      domainAssociationId: formData.get('domainAssociationId')
        ? parseInt(formData.get('domainAssociationId') as string, 10)
        : null,
    };

    try {
      const url = isEditing
        ? `/api/opportunities/${opportunity.uuid}`
        : '/api/opportunities';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        } else {
          setError(result.error || `Failed to ${isEditing ? 'update' : 'create'} opportunity`);
        }
        setLoading(false);
        return;
      }

      router.push(`/opportunities/${result.uuid}`);
      router.refresh();
    } catch {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  }

  const domainOptions = [
    { value: '', label: 'No domain association' },
    ...domains.map((domain) => ({
      value: domain.id.toString(),
      label: domain.domain,
    })),
  ];

  return (
    <GoogleMapsProvider>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Notification type="error" message={error} onClose={() => setError(null)} />
        )}

        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6 shadow-sm dark:bg-gray-900 dark:border-gray-800">
          <Input
            label="Title"
            name="title"
            type="text"
            required
            defaultValue={opportunity?.title}
            placeholder="e.g., Weekend Food Bank Volunteer"
            error={fieldErrors.title}
          />

          <Textarea
            label="Description"
            name="description"
            required
            defaultValue={opportunity?.description}
            placeholder="Describe the opportunity, requirements, and what volunteers can expect..."
            hint="Markdown is supported"
            error={fieldErrors.description}
            rows={6}
          />

          <Select
            label="Category"
            name="category"
            required
            options={categoryOptions}
            defaultValue={opportunity?.category || ''}
            placeholder="Select a category"
            error={fieldErrors.category}
          />

          {domains.length > 0 && (
            <Select
              label="Domain Association"
              name="domainAssociationId"
              options={domainOptions}
              defaultValue={opportunity?.domainAssociationId?.toString() || ''}
              hint="Associate this opportunity with your verified domain"
              error={fieldErrors.domainAssociationId}
            />
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6 shadow-sm dark:bg-gray-900 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Location</h2>

          <div>
            <LocationPicker
              initialLat={opportunity?.latitude}
              initialLng={opportunity?.longitude}
              onLocationChange={(lat, lng) => setLocation({ lat, lng })}
            />
            {fieldErrors.location && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.location}</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6 shadow-sm dark:bg-gray-900 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Contact Information (optional)
          </h2>

          <Input
            label="Email"
            name="email"
            type="email"
            defaultValue={opportunity?.email || ''}
            placeholder="contact@example.com"
            error={fieldErrors.email}
          />

          <Input
            label="Phone"
            name="phone"
            type="tel"
            defaultValue={opportunity?.phone || ''}
            placeholder="+44 7700 900000"
            error={fieldErrors.phone}
          />

          <Input
            label="Website"
            name="website"
            type="url"
            defaultValue={opportunity?.website || ''}
            placeholder="https://example.com"
            error={fieldErrors.website}
          />
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4 shadow-sm dark:bg-gray-900 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Requirements</h2>

          <Checkbox
            name="mentallyTaxing"
            label="Mentally taxing"
            description="This opportunity may be emotionally challenging"
            defaultChecked={opportunity?.mentallyTaxing}
          />

          <Checkbox
            name="physicallyTaxing"
            label="Physically taxing"
            description="This opportunity requires physical activity"
            defaultChecked={opportunity?.physicallyTaxing}
          />

          <Checkbox
            name="timeFlexible"
            label="Flexible hours"
            description="Volunteers can choose their own schedule"
            defaultChecked={opportunity?.timeFlexible}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
          >
            <span className="inline-flex items-center gap-2">
              <XIcon className="h-4 w-4" />
              Cancel
            </span>
          </Button>
          <Button type="submit" loading={loading}>
            <span className="inline-flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              {isEditing ? 'Update Opportunity' : 'Post Opportunity'}
            </span>
          </Button>
        </div>
      </form>
    </GoogleMapsProvider>
  );
}
