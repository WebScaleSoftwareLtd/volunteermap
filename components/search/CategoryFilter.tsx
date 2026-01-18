'use client';

import { useRefinementList } from 'react-instantsearch';

export function CategoryFilter() {
  const { items, refine } = useRefinementList({ attribute: 'category' });

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Category</h3>
      <div className="space-y-1">
        {items.map((item) => (
          <label
            key={item.value}
            className="flex items-center gap-2 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={item.isRefined}
              onChange={() => refine(item.value)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-700"
            />
            <span className="text-sm text-gray-700 dark:text-gray-200">
              {item.label}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({item.count})
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
