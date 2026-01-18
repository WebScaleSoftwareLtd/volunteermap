import { redirect, notFound } from 'next/navigation';
import { db, opportunities, domainAssociations } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth/session';
import { OpportunityForm } from '@/components/opportunities/OpportunityForm';

export default async function EditOpportunityPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    const { uuid } = await params;
    redirect(`/auth/login?redirect=/opportunities/${uuid}/edit`);
  }

  const { uuid } = await params;

  // Fetch opportunity
  const result = await db
    .select()
    .from(opportunities)
    .where(eq(opportunities.uuid, uuid))
    .limit(1);

  if (result.length === 0) {
    notFound();
  }

  const opportunity = result[0];

  // Check ownership
  if (opportunity.userId !== user.id) {
    redirect(`/opportunities/${uuid}`);
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Edit opportunity</h1>
        <p className="mt-2 text-gray-600 dark:text-slate-300">
          Update your volunteer opportunity
        </p>
      </div>

      <OpportunityForm domains={domains} opportunity={opportunity} />
    </div>
  );
}
