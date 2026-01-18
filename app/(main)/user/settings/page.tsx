import { redirect } from 'next/navigation';
import { db, users } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth/session';
import { getBackupCodeCount } from '@/lib/auth/backup-codes';
import { SettingsForm } from '@/components/user/SettingsForm';
import { TwoFactorSection } from '@/components/user/TwoFactorSection';

export default async function SettingsPage() {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    redirect('/auth/login?redirect=/user/settings');
  }

  // Fetch full user data
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, sessionUser.id))
    .limit(1);

  const has2FA = !!user.twoFaToken;
  const backupCodeCount = has2FA ? await getBackupCodeCount(user.id) : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Settings</h1>

      <div className="space-y-6">
        {/* Profile Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Profile</h2>
          <SettingsForm user={user} />
        </div>

        {/* Two-Factor Authentication */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Two-Factor Authentication
          </h2>
          <TwoFactorSection
            has2FA={has2FA}
            backupCodeCount={backupCodeCount}
          />
        </div>
      </div>
    </div>
  );
}
