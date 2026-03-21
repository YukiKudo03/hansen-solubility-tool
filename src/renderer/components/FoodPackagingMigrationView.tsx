import React, { useState, useMemo, useEffect } from 'react';
import type { PartsGroup } from '../../core/types';
import PartsGroupSelector from './PartsGroupSelector';
import MigrationRiskBadge from './MigrationRiskBadge';
import SortTableHeader from './SortTableHeader';
import BookmarkButton from './BookmarkButton';
import { useFoodPackagingMigration } from '../hooks/useFoodPackagingMigration';
import { useSortableTable } from '../hooks/useSortableTable';

type SortKey = 'migrantName' | 'ra' | 'red' | 'migrationLevel';

export default function FoodPackagingMigrationView() {
  const [selectedGroup, setSelectedGroup] = useState<PartsGroup | null>(null);
  const [solvents, setSolvents] = useState<any[]>([]);

  const { result, loading, error, evaluate, clear } = useFoodPackagingMigration();
  const { sortKey, sortDir, toggleSort } = useSortableTable<SortKey>('red');

  useEffect(() => {
    (async () => {
      const all = await (window as any).api.getAllSolvents();
      setSolvents(all);
    })();
  }, []);

  const canEvaluate = selectedGroup && selectedGroup.parts.length > 0 && !loading;

  const handleEvaluate = async () => {
    if (!selectedGroup || selectedGroup.parts.length === 0) return;
    const part = selectedGroup.parts[0];
    const ids = solvents.map((s: any) => s.id);
    await evaluate(part.hsp, part.r0, ids);
  };

  const sortedResults = useMemo(() => {
    if (!Array.isArray(result)) return [];
    const items = [...result];
    items.sort((a: any, b: any) => {
      let cmp = 0;
      switch (sortKey) {
        case 'migrantName': cmp = (a.migrantName ?? '').localeCompare(b.migrantName ?? '', 'ja'); break;
        case 'ra': cmp = (a.ra ?? 0) - (b.ra ?? 0); break;
        case 'red': cmp = (a.red ?? 0) - (b.red ?? 0); break;
        case 'migrationLevel': cmp = (a.migrationLevel ?? 0) - (b.migrationLevel ?? 0); break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return items;
  }, [result, sortKey, sortDir]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">包装材溶出予測</h2>
        <p className="text-xs text-gray-500 mb-4">
          包装材と溶出物質のHSP距離に基づき、食品への溶出リスクを評価します。
          RED値が小さいほど溶出リスクが高くなります。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <PartsGroupSelector
            onSelect={(g) => { setSelectedGroup(g); clear(); }}
            selected={selectedGroup}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleEvaluate}
            disabled={!canEvaluate}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '評価中...' : '溶出リスクスクリーニング'}
          </button>
          <BookmarkButton
            pipeline="foodPackagingMigration"
            params={{ partsGroupId: selectedGroup?.id }}
            disabled={!selectedGroup}
          />
        </div>
      </div>

      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {sortedResults.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800">
              溶出リスク評価結果: {selectedGroup?.name}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <SortTableHeader label="溶出物質名" field="migrantName" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="Ra" field="ra" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="RED" field="red" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="溶出リスク" field="migrationLevel" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedResults.map((r: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-3 py-2.5 text-sm font-medium text-gray-900">{r.migrantName ?? '-'}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.ra?.toFixed(3) ?? '-'}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.red?.toFixed(3) ?? '-'}</td>
                    <td className="px-3 py-2.5">
                      <MigrationRiskBadge level={r.migrationLevel ?? 3} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
