import { NextRequest, NextResponse } from 'next/server';
import { db, opportunities, domainAssociations } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/session';
import { indexOpportunity, deleteOpportunityFromIndex } from '@/lib/services/algolia';
import { z } from 'zod';
import { OPPORTUNITY_CATEGORIES } from '@/lib/db/schema';

const opportunitySchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().min(1, 'Description is required').max(10000, 'Description is too long'),
  category: z.enum(OPPORTUNITY_CATEGORIES, { errorMap: () => ({ message: 'Invalid category' }) }),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  email: z.string().email('Invalid email').nullable().optional(),
  phone: z.string().max(50).nullable().optional(),
  website: z.string().url('Invalid URL').nullable().optional(),
  mentallyTaxing: z.boolean().default(false),
  physicallyTaxing: z.boolean().default(false),
  timeFlexible: z.boolean().default(false),
  domainAssociationId: z.number().nullable().optional(),
});

// GET - Get opportunity details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const { uuid } = await params;

    const result = await db
      .select()
      .from(opportunities)
      .where(eq(opportunities.uuid, uuid))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Get opportunity error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// PUT - Update opportunity
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const user = await requireAuth();
    const { uuid } = await params;
    const body = await request.json();

    // Find opportunity
    const existing = await db
      .select()
      .from(opportunities)
      .where(eq(opportunities.uuid, uuid))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    const opportunity = existing[0];

    // Check ownership
    if (opportunity.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Validate input
    const validation = opportunitySchema.safeParse(body);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      for (const error of validation.error.errors) {
        const field = error.path[0] as string;
        fieldErrors[field] = error.message;
      }
      return NextResponse.json({ fieldErrors }, { status: 400 });
    }

    const data = validation.data;

    // Verify domain association belongs to user and is active
    let domainAssociation = null;
    if (data.domainAssociationId) {
      const domain = await db
        .select()
        .from(domainAssociations)
        .where(
          and(
            eq(domainAssociations.id, data.domainAssociationId),
            eq(domainAssociations.userId, user.id),
            eq(domainAssociations.validationActive, true)
          )
        )
        .limit(1);

      if (domain.length === 0) {
        return NextResponse.json(
          { fieldErrors: { domainAssociationId: 'Invalid or inactive domain' } },
          { status: 400 }
        );
      }
      domainAssociation = domain[0];
    }

    // Update opportunity
    const [updated] = await db
      .update(opportunities)
      .set({
        title: data.title,
        description: data.description,
        category: data.category,
        latitude: data.latitude,
        longitude: data.longitude,
        email: data.email || null,
        phone: data.phone || null,
        website: data.website || null,
        mentallyTaxing: data.mentallyTaxing,
        physicallyTaxing: data.physicallyTaxing,
        timeFlexible: data.timeFlexible,
        domainAssociationId: data.domainAssociationId || null,
        updatedAt: new Date(),
      })
      .where(eq(opportunities.id, opportunity.id))
      .returning();

    // Update in Algolia
    await indexOpportunity(updated, domainAssociation);

    return NextResponse.json({ uuid: updated.uuid });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Update opportunity error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// DELETE - Delete opportunity
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const user = await requireAuth();
    const { uuid } = await params;

    // Find opportunity
    const existing = await db
      .select()
      .from(opportunities)
      .where(eq(opportunities.uuid, uuid))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    const opportunity = existing[0];

    // Check ownership
    if (opportunity.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete from database
    await db.delete(opportunities).where(eq(opportunities.id, opportunity.id));

    // Delete from Algolia
    await deleteOpportunityFromIndex(opportunity.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Delete opportunity error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
