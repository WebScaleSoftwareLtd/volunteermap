import { NextRequest, NextResponse } from 'next/server';
import { db, opportunities, bookmarks } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/session';

// POST - Add bookmark
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const user = await requireAuth();
    const { uuid } = await params;

    // Find opportunity
    const existing = await db
      .select({ id: opportunities.id })
      .from(opportunities)
      .where(eq(opportunities.uuid, uuid))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    const opportunityId = existing[0].id;

    // Check if already bookmarked
    const existingBookmark = await db
      .select({ id: bookmarks.id })
      .from(bookmarks)
      .where(
        and(
          eq(bookmarks.userId, user.id),
          eq(bookmarks.opportunityId, opportunityId)
        )
      )
      .limit(1);

    if (existingBookmark.length > 0) {
      return NextResponse.json({ success: true, bookmarked: true });
    }

    // Create bookmark
    await db.insert(bookmarks).values({
      userId: user.id,
      opportunityId,
    });

    return NextResponse.json({ success: true, bookmarked: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Add bookmark error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// DELETE - Remove bookmark
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const user = await requireAuth();
    const { uuid } = await params;

    // Find opportunity
    const existing = await db
      .select({ id: opportunities.id })
      .from(opportunities)
      .where(eq(opportunities.uuid, uuid))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    const opportunityId = existing[0].id;

    // Delete bookmark
    await db.delete(bookmarks).where(
      and(
        eq(bookmarks.userId, user.id),
        eq(bookmarks.opportunityId, opportunityId)
      )
    );

    return NextResponse.json({ success: true, bookmarked: false });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Remove bookmark error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
