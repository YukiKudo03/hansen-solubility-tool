import React, { useState, useMemo } from 'react';
import type { GroupEvaluationResult } from '../../core/types';
import RiskBadge from './RiskBadge';

interface ResultsTableProps {
  result: GroupEvaluationResult;
}

type SortKey = 'name' | 'ra' | 'red' | 'riskLevel';
type SortDir = 'asc' | 'desc';

export default function ResultsTable({ result }: ResultsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('riskLevel');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const sorted = useMemo(() => {
    const items = [...result.results];
    items.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'name':
          cmp = a.part.name.localeCompare(b.part.name, 'ja');
          break;
        case 'ra':
          cmp = a.ra - b.ra;
          break;
        case 'red':
          cmp = a.red - b.red;
          break;
        case 'riskLevel':
          cmp = a.riskLevel - b.riskLevel;
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return items;
  }, [result.results, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const SortHeader = ({ label, field }: { label: string; field: SortKey }) => (
    <th
      onClick={() => toggleSort(field)}
      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
    >
      {label} {sortKey === field && (sortDir === 'asc' ? '▲' : '▼')}
    </th>
  );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <SortHeader label="部品名" field="name" />
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">材料</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">δD</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">δP</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">δH</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">R₀</th>
            <SortHeader label="Ra" field="ra" />
            <SortHeader label="RED" field="red" />
            <SortHeader label="リスク" field="riskLevel" />
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sorted.map((r) => (
            <tr key={r.part.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">{r.part.name}</td>
              <td className="px-4 py-3 text-sm text-gray-500">{r.part.materialType ?? '-'}</td>
              <td className="px-4 py-3 text-sm text-gray-500">{r.part.hsp.deltaD.toFixed(1)}</td>
              <td className="px-4 py-3 text-sm text-gray-500">{r.part.hsp.deltaP.toFixed(1)}</td>
              <td className="px-4 py-3 text-sm text-gray-500">{r.part.hsp.deltaH.toFixed(1)}</td>
              <td className="px-4 py-3 text-sm text-gray-500">{r.part.r0.toFixed(1)}</td>
              <td className="px-4 py-3 text-sm text-gray-500">{r.ra.toFixed(3)}</td>
              <td className="px-4 py-3 text-sm text-gray-500">{r.red.toFixed(3)}</td>
              <td className="px-4 py-3">
                <RiskBadge level={r.riskLevel} red={r.red} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
