import { redirect } from 'next/navigation';
import Link from 'next/link';
import { db, bookmarks, opportunities } from '@/lib/db';
import { eq, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth/session';

export default async function BookmarksPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/login?redirect=/user/bookmarks');
  }

  const { page } = await searchParams;

  // Pagination
  const currentPage = Math.max(1, parseInt(page || '1', 10));
  const perPage = 10;
  const offset = (currentPage - 1) * perPage;

  // Fetch user's bookmarks
  const userBookmarks = await db
    .select({
      bookmark: bookmarks,
      opportunity: opportunities,
    })
    .from(bookmarks)
    .innerJoin(opportunities, eq(bookmarks.opportunityId, opportunities.id))
    .where(eq(bookmarks.userId, user.id))
    .orderBy(desc(bookmarks.createdAt))
    .limit(perPage + 1)
    .offset(offset);

  const hasMore = userBookmarks.length > perPage;
  const displayBookmarks = userBookmarks.slice(0, perPage);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Bookmarks</h1>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm dark:bg-gray-900 dark:border-gray-800">
        {displayBookmarks.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            <p>You haven&apos;t bookmarked any opportunities yet.</p>
            <Link href="/" className="text-blue-600 hover:underline mt-2 inline-block dark:text-blue-400">
              Browse opportunities
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-800">
            {displayBookmarks.map(({ bookmark, opportunity }) => (
              <li key={bookmark.id}>
                <Link
                  href={`/opportunities/${opportunity.uuid}`}
                  className="block p-6 hover:bg-gray-50 dark:hover:bg-gray-800/60"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{opportunity.title}</h3>
                      <p className="text-sm text-blue-600 mt-1 dark:text-blue-400">{opportunity.category}</p>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Saved {new Date(bookmark.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mt-2 line-clamp-2 dark:text-gray-300">
                    {opportunity.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {opportunity.mentallyTaxing && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-200">
                        Mentally taxing
                      </span>
                    )}
                    {opportunity.physicallyTaxing && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-200">
                        Physically taxing
                      </span>
                    )}
                    {opportunity.timeFlexible && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-200">
                        Flexible hours
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {/* Pagination */}
        {(currentPage > 1 || hasMore) && (
          <div className="p-4 border-t border-gray-200 flex justify-between dark:border-gray-800">
            {currentPage > 1 ? (
              <Link
                href={`/user/bookmarks?page=${currentPage - 1}`}
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                Previous
              </Link>
            ) : (
              <span />
            )}
            {hasMore && (
              <Link
                href={`/user/bookmarks?page=${currentPage + 1}`}
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                Next
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
