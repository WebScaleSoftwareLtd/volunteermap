import { NextRequest, NextResponse } from 'next/server';
import { db, users, domainAssociations } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { verifyDomainOwnership } from '@/lib/services/dns';

const MAX_VALIDATION_ATTEMPTS = 5;

// This endpoint is called by Vercel Cron
// Configure in vercel.json: { "crons": [{ "path": "/api/cron/validate-domains", "schedule": "0 * * * *" }] }

export async function GET(request: NextRequest) {
  // Verify the request is from Vercel Cron (optional security)
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get all active domains
    const domains = await db
      .select({
        domain: domainAssociations,
        userValidationId: users.userValidationId,
      })
      .from(domainAssociations)
      .innerJoin(users, eq(domainAssociations.userId, users.id))
      .where(eq(domainAssociations.validationActive, true));

    let validated = 0;
    let invalidated = 0;

    for (const { domain, userValidationId } of domains) {
      const isValid = await verifyDomainOwnership(domain.domain, userValidationId);

      if (isValid) {
        // Reset check count on successful validation
        if (domain.validationCheckCount > 0) {
          await db
            .update(domainAssociations)
            .set({
              validationCheckCount: 0,
              updatedAt: new Date(),
            })
            .where(eq(domainAssociations.id, domain.id));
        }
        validated++;
      } else {
        // Increment check count
        const newCount = domain.validationCheckCount + 1;

        if (newCount >= MAX_VALIDATION_ATTEMPTS) {
          // Deactivate domain
          await db
            .update(domainAssociations)
            .set({
              validationActive: false,
              validationCheckCount: newCount,
              updatedAt: new Date(),
            })
            .where(eq(domainAssociations.id, domain.id));
          invalidated++;
        } else {
          await db
            .update(domainAssociations)
            .set({
              validationCheckCount: newCount,
              updatedAt: new Date(),
            })
            .where(eq(domainAssociations.id, domain.id));
        }
      }
    }

    return NextResponse.json({
      success: true,
      checked: domains.length,
      validated,
      invalidated,
    });
  } catch (error) {
    console.error('Domain validation cron error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
