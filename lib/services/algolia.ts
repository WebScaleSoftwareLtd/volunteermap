import { algoliasearch } from 'algoliasearch';
import type { Opportunity, DomainAssociation } from '@/lib/db/schema';

const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '';
const ALGOLIA_ADMIN_API_KEY = process.env.ALGOLIA_ADMIN_API_KEY || '';

const adminClient = ALGOLIA_APP_ID && ALGOLIA_ADMIN_API_KEY
  ? algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_API_KEY)
  : null;

const OPPORTUNITY_INDEX = 'Opportunity';

export interface AlgoliaOpportunity {
  objectID: string;
  uuid: string;
  title: string;
  description: string;
  category: string;
  _geoloc: {
    lat: number;
    lng: number;
  };
  mentally_taxing: boolean;
  physically_taxing: boolean;
  time_flexible: boolean;
  not_mentally_taxing: boolean;
  not_physically_taxing: boolean;
  not_time_flexible: boolean;
  domain_name: string | null;
  created_at_i: number;
  updated_at_i: number;
  [key: string]: unknown;
}

function opportunityToAlgolia(
  opportunity: Opportunity,
  domainAssociation?: DomainAssociation | null
): AlgoliaOpportunity {
  return {
    objectID: opportunity.id.toString(),
    uuid: opportunity.uuid,
    title: opportunity.title,
    description: opportunity.description,
    category: opportunity.category,
    _geoloc: {
      lat: opportunity.latitude,
      lng: opportunity.longitude,
    },
    mentally_taxing: opportunity.mentallyTaxing,
    physically_taxing: opportunity.physicallyTaxing,
    time_flexible: opportunity.timeFlexible,
    not_mentally_taxing: !opportunity.mentallyTaxing,
    not_physically_taxing: !opportunity.physicallyTaxing,
    not_time_flexible: !opportunity.timeFlexible,
    domain_name: domainAssociation?.validationActive ? domainAssociation.domain : null,
    created_at_i: Math.floor(opportunity.createdAt.getTime() / 1000),
    updated_at_i: Math.floor(opportunity.updatedAt.getTime() / 1000),
  };
}

export async function indexOpportunity(
  opportunity: Opportunity,
  domainAssociation?: DomainAssociation | null
): Promise<void> {
  if (!adminClient) {
    console.log('Algolia not configured, skipping index');
    return;
  }

  const record = opportunityToAlgolia(opportunity, domainAssociation);
  await adminClient.saveObject({
    indexName: OPPORTUNITY_INDEX,
    body: record,
  });
}

export async function deleteOpportunityFromIndex(opportunityId: number): Promise<void> {
  if (!adminClient) {
    console.log('Algolia not configured, skipping delete');
    return;
  }

  await adminClient.deleteObject({
    indexName: OPPORTUNITY_INDEX,
    objectID: opportunityId.toString(),
  });
}

export async function reindexOpportunities(
  opportunities: Array<{
    opportunity: Opportunity;
    domainAssociation?: DomainAssociation | null;
  }>
): Promise<void> {
  if (!adminClient) {
    console.log('Algolia not configured, skipping reindex');
    return;
  }

  const records = opportunities.map(({ opportunity, domainAssociation }) =>
    opportunityToAlgolia(opportunity, domainAssociation)
  );

  await adminClient.saveObjects({
    indexName: OPPORTUNITY_INDEX,
    objects: records,
  });
}
