'use client';

import { liteClient } from 'algoliasearch/lite';
import { InstantSearch } from 'react-instantsearch';
import { ReactNode } from 'react';

const searchClient = liteClient(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '',
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY || ''
);

interface AlgoliaProviderProps {
  children: ReactNode;
  indexName?: string;
}

export function AlgoliaProvider({ children, indexName = 'Opportunity' }: AlgoliaProviderProps) {
  return (
    <InstantSearch searchClient={searchClient} indexName={indexName}>
      {children}
    </InstantSearch>
  );
}
