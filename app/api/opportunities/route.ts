import { NextRequest, NextResponse } from 'next/server';
import { db, opportunities, domainAssociations } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/session';
import { indexOpportunity } from '@/lib/services/algolia';
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

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

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

    // Create opportunity
    const [newOpportunity] = await db
      .insert(opportunities)
      .values({
        userId: user.id,
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
      })
      .returning();

    // Index in Algolia
    await indexOpportunity(newOpportunity, domainAssociation);

    return NextResponse.json({ uuid: newOpportunity.uuid });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Create opportunity error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
