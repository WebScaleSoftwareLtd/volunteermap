import { NextRequest, NextResponse } from 'next/server';
import { db, domainAssociations, opportunities } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/session';

// DELETE - Remove domain
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const domainId = parseInt(id, 10);

    if (isNaN(domainId)) {
      return NextResponse.json({ error: 'Invalid domain ID' }, { status: 400 });
    }

    // Find domain and verify ownership
    const existing = await db
      .select()
      .from(domainAssociations)
      .where(
        and(
          eq(domainAssociations.id, domainId),
          eq(domainAssociations.userId, user.id)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
    }

    // Remove domain association from opportunities
    await db
      .update(opportunities)
      .set({ domainAssociationId: null, updatedAt: new Date() })
      .where(eq(opportunities.domainAssociationId, domainId));

    // Delete domain
    await db.delete(domainAssociations).where(eq(domainAssociations.id, domainId));

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Delete domain error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
