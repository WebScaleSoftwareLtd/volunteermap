import { NextRequest, NextResponse } from 'next/server';
import { db, users, domainAssociations } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/session';
import { verifyDomainOwnership } from '@/lib/services/dns';
import { z } from 'zod';

const domainSchema = z.object({
  domain: z
    .string()
    .min(1, 'Domain is required')
    .regex(
      /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]\.[a-zA-Z]{2,}$/,
      'Invalid domain format'
    )
    .transform((val) => val.toLowerCase()),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    // Validate input
    const validation = domainSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { domain } = validation.data;

    // Check if domain already exists for this user
    const existing = await db
      .select({ id: domainAssociations.id })
      .from(domainAssociations)
      .where(
        and(
          eq(domainAssociations.userId, user.id),
          eq(domainAssociations.domain, domain)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Domain already added' },
        { status: 400 }
      );
    }

    // Get user's validation ID
    const [fullUser] = await db
      .select({ userValidationId: users.userValidationId })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    // Try to verify immediately
    const isValid = await verifyDomainOwnership(domain, fullUser.userValidationId);

    // Create domain association
    const [newDomain] = await db
      .insert(domainAssociations)
      .values({
        userId: user.id,
        domain,
        validationActive: isValid,
        validationCheckCount: isValid ? 0 : 1,
      })
      .returning();

    return NextResponse.json({
      success: true,
      domain: newDomain,
      verified: isValid,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Add domain error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
