import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ClipboardListIcon } from '@/components/ui';
import { db, users, opportunities } from '@/lib/db';
import { eq, desc, sql } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth/session';

export default async function UserProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { username } = await params;
  const { page } = await searchParams;

  const sessionUser = await getCurrentUser();

  // Find user
  const result = await db
    .select({
      id: users.id,
      username: users.username,
      avatarUrl: users.avatarUrl,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(sql`lower(${users.username})`, username.toLowerCase()))
    .limit(1);

  if (result.length === 0) {
    notFound();
  }

  const user = result[0];

  // Pagination
  const currentPage = Math.max(1, parseInt(page || '1', 10));
  const perPage = 10;
  const offset = (currentPage - 1) * perPage;

  // Fetch user's opportunities
  const userOpportunities = await db
    .select()
    .from(opportunities)
    .where(eq(opportunities.userId, user.id))
    .orderBy(desc(opportunities.createdAt))
    .limit(perPage + 1)
    .offset(offset);

  const hasMore = userOpportunities.length > perPage;
  const displayOpportunities = userOpportunities.slice(0, perPage);
  const isSelf = !!sessionUser && sessionUser.id === user.id;
  const memberSince = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(
    new Date(user.createdAt)
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-start sm:items-center gap-4">
          <Image
            src={user.avatarUrl || '/default-pfp.png'}
            alt=""
            width={64}
            height={64}
            className="h-16 w-16 rounded-full"
            priority
          />
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
              {user.username}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">Member since {memberSince}.</p>
          </div>

          {isSelf && (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/opportunities/new"
                className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Submit New Posting
              </Link>
              <Link
                href="/user/settings"
                className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
              >
                Settings
              </Link>
            </div>
          )}
        </div>

        {isSelf && (
          <div className="mt-4 flex sm:hidden gap-2">
            <Link
              href="/opportunities/new"
              className="flex-1 inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Submit New Posting
            </Link>
            <Link
              href="/user/settings"
              className="flex-1 inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
            >
              Settings
            </Link>
          </div>
        )}
      </div>

      {/* Opportunities */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm dark:bg-gray-900 dark:border-gray-800">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Open Postings</h2>
        </div>

        {displayOpportunities.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            <div className="flex flex-col items-center gap-2 py-8">
              <ClipboardListIcon className="h-10 w-10 text-gray-400 dark:text-gray-500" />
              <p className="font-medium text-gray-700 dark:text-gray-200">No open postings.</p>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-800">
            {displayOpportunities.map((opp) => (
              <li key={opp.id}>
                <Link
                  href={`/opportunities/${opp.uuid}`}
                  className="block p-6 hover:bg-gray-50 dark:hover:bg-gray-800/60"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {opp.title}
                      </h3>
                      <p className="text-sm text-blue-600 mt-1 dark:text-blue-400">{opp.category}</p>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(opp.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mt-2 line-clamp-2 dark:text-gray-300">
                    {opp.description}
                  </p>
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
                href={`/users/${encodeURIComponent(user.username)}?page=${currentPage - 1}`}
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                Previous
              </Link>
            ) : (
              <span />
            )}
            {hasMore && (
              <Link
                href={`/users/${encodeURIComponent(user.username)}?page=${currentPage + 1}`}
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
