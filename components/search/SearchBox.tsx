'use client';

import { useSearchBox } from 'react-instantsearch';
import { Input } from '@/components/ui';

export function SearchBox() {
  const { query, refine } = useSearchBox();

  return (
    <Input
      type="search"
      placeholder="Search opportunities..."
      value={query}
      onChange={(e) => refine(e.target.value)}
      className="w-full"
    />
  );
}
