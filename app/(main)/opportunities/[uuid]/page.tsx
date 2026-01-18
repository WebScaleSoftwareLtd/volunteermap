import { notFound } from 'next/navigation';
import { db, opportunities, users, domainAssociations, bookmarks } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth/session';
import { OpportunityDetail } from '@/components/opportunities/OpportunityDetail';

export default async function OpportunityPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;
  const currentUser = await getCurrentUser();

  // Fetch opportunity with user and domain association
  const result = await db
    .select({
      opportunity: opportunities,
      user: {
        id: users.id,
        username: users.username,
      },
      domainAssociation: domainAssociations,
    })
    .from(opportunities)
    .innerJoin(users, eq(opportunities.userId, users.id))
    .leftJoin(domainAssociations, eq(opportunities.domainAssociationId, domainAssociations.id))
    .where(eq(opportunities.uuid, uuid))
    .limit(1);

  if (result.length === 0) {
    notFound();
  }

  const { opportunity, user, domainAssociation } = result[0];

  // Check if current user has bookmarked this opportunity
  let isBookmarked = false;
  if (currentUser) {
    const bookmark = await db
      .select({ id: bookmarks.id })
      .from(bookmarks)
      .where(
        and(
          eq(bookmarks.userId, currentUser.id),
          eq(bookmarks.opportunityId, opportunity.id)
        )
      )
      .limit(1);
    isBookmarked = bookmark.length > 0;
  }

  const isOwner = currentUser?.id === opportunity.userId;

  return (
    <OpportunityDetail
      opportunity={opportunity}
      creator={user}
      domainAssociation={domainAssociation?.validationActive ? domainAssociation : null}
      isBookmarked={isBookmarked}
      isOwner={isOwner}
      isLoggedIn={!!currentUser}
    />
  );
}
