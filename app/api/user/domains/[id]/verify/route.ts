import { NextRequest, NextResponse } from 'next/server';
import { db, users, domainAssociations } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/session';
import { verifyDomainOwnership } from '@/lib/services/dns';

const MAX_VALIDATION_ATTEMPTS = 5;

export async function POST(
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

    const domain = existing[0];

    if (domain.validationActive) {
      return NextResponse.json({ success: true, verified: true });
    }

    if (domain.validationCheckCount >= MAX_VALIDATION_ATTEMPTS) {
      return NextResponse.json(
        { error: 'Maximum verification attempts reached. Please delete and re-add the domain.' },
        { status: 400 }
      );
    }

    // Get user's validation ID
    const [fullUser] = await db
      .select({ userValidationId: users.userValidationId })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    // Verify domain ownership
    const isValid = await verifyDomainOwnership(domain.domain, fullUser.userValidationId);

    if (isValid) {
      // Mark as verified
      await db
        .update(domainAssociations)
        .set({
          validationActive: true,
          validationCheckCount: 0,
          updatedAt: new Date(),
        })
        .where(eq(domainAssociations.id, domainId));

      return NextResponse.json({ success: true, verified: true });
    } else {
      // Increment check count
      await db
        .update(domainAssociations)
        .set({
          validationCheckCount: domain.validationCheckCount + 1,
          updatedAt: new Date(),
        })
        .where(eq(domainAssociations.id, domainId));

      return NextResponse.json({
        success: false,
        verified: false,
        error: 'DNS record not found. Make sure the TXT record is properly configured.',
        attemptsRemaining: MAX_VALIDATION_ATTEMPTS - domain.validationCheckCount - 1,
      });
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Verify domain error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
