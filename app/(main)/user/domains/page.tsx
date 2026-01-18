import { redirect } from 'next/navigation';
import { db, users, domainAssociations } from '@/lib/db';
import { eq, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth/session';
import { getValidationRecord } from '@/lib/services/dns';
import { DomainList } from '@/components/user/DomainList';
import { AddDomainForm } from '@/components/user/AddDomainForm';

export default async function DomainsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/login?redirect=/user/domains');
  }

  // Get user's validation ID
  const [fullUser] = await db
    .select({ userValidationId: users.userValidationId })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  // Fetch user's domains
  const domains = await db
    .select()
    .from(domainAssociations)
    .where(eq(domainAssociations.userId, user.id))
    .orderBy(desc(domainAssociations.createdAt));

  const validationRecord = getValidationRecord(fullUser.userValidationId);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Domains</h1>

      <div className="space-y-6">
        {/* Add Domain */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Add a domain</h2>
          <AddDomainForm validationRecord={validationRecord} />
        </div>

        {/* Domain List */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm dark:bg-gray-900 dark:border-gray-800">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Your domains</h2>
          </div>

          <DomainList domains={domains} validationRecord={validationRecord} />
        </div>
      </div>
    </div>
  );
}
