import React from 'react';

type SortDir = 'asc' | 'desc';

interface SortTableHeaderProps<K extends string> {
  label: string;
  field: K;
  sortKey: K;
  sortDir: SortDir;
  onToggle: (key: K) => void;
  className?: string;
}

export default function SortTableHeader<K extends string>({
  label,
  field,
  sortKey,
  sortDir,
  onToggle,
  className,
}: SortTableHeaderProps<K>) {
  const isActive = sortKey === field;
  return (
    <th
      role="columnheader"
      aria-sort={isActive ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
      tabIndex={0}
      onClick={() => onToggle(field)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(field); } }}
      className={`px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${className ?? ''}`}
    >
      {label} {isActive && (sortDir === 'asc' ? '▲' : '▼')}
    </th>
  );
}
