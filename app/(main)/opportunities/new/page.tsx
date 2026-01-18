import { redirect } from 'next/navigation';
import { db, domainAssociations } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth/session';
import { OpportunityForm } from '@/components/opportunities/OpportunityForm';

export default async function NewOpportunityPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/login?redirect=/opportunities/new');
  }

  // Fetch user's verified domains
  const domains = await db
    .select()
    .from(domainAssociations)
    .where(
      and(
        eq(domainAssociations.userId, user.id),
        eq(domainAssociations.validationActive, true)
      )
    );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Post a new opportunity
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Share a volunteer opportunity with the community
        </p>
      </div>

      <OpportunityForm domains={domains} />
    </div>
  );
}
