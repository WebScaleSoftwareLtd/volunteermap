'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Notification } from '@/components/ui';
import type { User } from '@/lib/db/schema';
import Image from 'next/image';
import { AvatarCropModal } from './AvatarCropModal';

interface SettingsFormProps {
  user: User;
}

export function SettingsForm({ user }: SettingsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarCropOpen, setAvatarCropOpen] = useState(false);
  const [avatarCropUrl, setAvatarCropUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    return () => {
      if (avatarCropUrl) URL.revokeObjectURL(avatarCropUrl);
    };
  }, [avatarCropUrl]);

  async function uploadAvatar() {
    if (!avatarFile) return;
    setAvatarLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const form = new FormData();
      form.append('avatar', avatarFile);

      const res = await fetch('/api/user/avatar', { method: 'POST', body: form });
      const result = await res.json();

      if (!res.ok) {
        setError(result.error || 'Failed to upload avatar');
        return;
      }

      setAvatarFile(null);
      setSuccess('Profile picture updated');
      router.refresh();
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setAvatarLoading(false);
    }
  }

  async function removeAvatar() {
    setAvatarLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/user/avatar', { method: 'DELETE' });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error || 'Failed to remove avatar');
        return;
      }
      setAvatarFile(null);
      setSuccess('Profile picture removed');
      router.refresh();
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setAvatarLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const data: Record<string, string | undefined> = {};

    const newEmail = formData.get('email') as string;
    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    // Only include fields that have changed
    if (newEmail !== user.email) {
      data.email = newEmail;
    }

    if (newPassword) {
      if (newPassword !== confirmPassword) {
        setFieldErrors({ confirmPassword: 'Passwords do not match' });
        setLoading(false);
        return;
      }
      data.currentPassword = currentPassword;
      data.newPassword = newPassword;
    }

    if (Object.keys(data).length === 0) {
      setSuccess('No changes to save');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        } else {
          setError(result.error || 'Failed to update settings');
        }
        setLoading(false);
        return;
      }

      setSuccess(result.message || 'Settings updated successfully');

      if (data.email) {
        setSuccess('A confirmation email has been sent to your new email address');
      }

      router.refresh();
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <AvatarCropModal
        open={avatarCropOpen}
        imageUrl={avatarCropUrl}
        onCancel={() => {
          setAvatarCropOpen(false);
          if (avatarCropUrl) URL.revokeObjectURL(avatarCropUrl);
          setAvatarCropUrl(null);
        }}
        onConfirm={(file) => {
          setAvatarFile(file);
          setAvatarCropOpen(false);
          if (avatarCropUrl) URL.revokeObjectURL(avatarCropUrl);
          setAvatarCropUrl(null);
        }}
      />

      <div className="space-y-4">
        {error && (
          <Notification type="error" message={error} onClose={() => setError(null)} />
        )}
        {success && (
          <Notification type="success" message={success} onClose={() => setSuccess(null)} />
        )}

        <div className="flex items-center gap-4">
          <Image
            src={user.avatarUrl || '/default-pfp.png'}
            alt=""
            width={64}
            height={64}
            className="h-16 w-16 rounded-full"
          />
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Profile picture
            </label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                if (!file) return;
                // Clear any previous pending file; we'll set avatarFile after cropping.
                setAvatarFile(null);
                if (avatarCropUrl) URL.revokeObjectURL(avatarCropUrl);
                setAvatarCropUrl(URL.createObjectURL(file));
                setAvatarCropOpen(true);
              }}
              className="mt-1 block w-full text-sm text-gray-700 dark:text-gray-200 file:mr-3 file:rounded-md file:border file:border-gray-300 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-gray-900 hover:file:bg-gray-200 dark:file:border-gray-700 dark:file:bg-gray-800 dark:file:text-gray-100 dark:hover:file:bg-gray-700"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              PNG/JPEG/WebP up to 5MB.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={uploadAvatar} loading={avatarLoading} disabled={!avatarFile}>
            Upload new picture
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={removeAvatar}
            loading={avatarLoading}
            disabled={!user.avatarUrl}
          >
            Remove picture
          </Button>
        </div>
      </div>

      <Input
        label="Email"
        name="email"
        type="email"
        defaultValue={user.email}
        error={fieldErrors.email}
        hint="Changing your email will require confirmation"
      />

      <div className="border-t border-gray-200 pt-6 dark:border-gray-800">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">Change Password</h3>

        <div className="space-y-4">
          <Input
            label="Current Password"
            name="currentPassword"
            type="password"
            error={fieldErrors.currentPassword}
            hint="Required to change your password"
          />

          <Input
            label="New Password"
            name="newPassword"
            type="password"
            error={fieldErrors.newPassword}
            hint="At least 8 characters"
          />

          <Input
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            error={fieldErrors.confirmPassword}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" loading={loading}>
          Save Changes
        </Button>
      </div>
    </form>
  );
}
