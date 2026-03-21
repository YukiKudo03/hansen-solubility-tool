import React, { useState, useMemo, useEffect } from 'react';
import type { PartsGroup } from '../../core/types';
import PartsGroupSelector from './PartsGroupSelector';
import EncapsulationBadge from './EncapsulationBadge';
import SortTableHeader from './SortTableHeader';
import BookmarkButton from './BookmarkButton';
import { useFragranceEncapsulation } from '../hooks/useFragranceEncapsulation';
import { useSortableTable } from '../hooks/useSortableTable';

type SortKey = 'fragranceName' | 'ra' | 'red' | 'encapsulationLevel';

export default function FragranceEncapsulationView() {
  const [selectedGroup, setSelectedGroup] = useState<PartsGroup | null>(null);
  const [solvents, setSolvents] = useState<any[]>([]);

  const { result, loading, error, evaluate, clear } = useFragranceEncapsulation();
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
    const part = selectedGroup.parts[0]; // 壁材代表
    const ids = solvents.map((s: any) => s.id);
    await evaluate(part.hsp, part.r0, ids);
  };

  const sortedResults = useMemo(() => {
    if (!Array.isArray(result)) return [];
    const items = [...result];
    items.sort((a: any, b: any) => {
      let cmp = 0;
      switch (sortKey) {
        case 'fragranceName': cmp = (a.fragranceName ?? '').localeCompare(b.fragranceName ?? '', 'ja'); break;
        case 'ra': cmp = (a.ra ?? 0) - (b.ra ?? 0); break;
        case 'red': cmp = (a.red ?? 0) - (b.red ?? 0); break;
        case 'encapsulationLevel': cmp = (a.encapsulationLevel ?? 0) - (b.encapsulationLevel ?? 0); break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return items;
  }, [result, sortKey, sortDir]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">香料カプセル化適合性</h2>
        <p className="text-xs text-gray-500 mb-4">
          壁材ポリマーと香料のHSP距離に基づき、カプセル化の安定性を評価します。
          RED値が大きいほど壁材が香料を閉じ込めやすくなります。
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
            {loading ? '評価中...' : '香料カプセル化スクリーニング'}
          </button>
          <BookmarkButton
            pipeline="fragranceEncapsulation"
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
              カプセル化適合性結果: {selectedGroup?.name}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <SortTableHeader label="香料名" field="fragranceName" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="Ra" field="ra" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="RED" field="red" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="カプセル化適合性" field="encapsulationLevel" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedResults.map((r: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-3 py-2.5 text-sm font-medium text-gray-900">{r.fragranceName ?? '-'}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.ra?.toFixed(3) ?? '-'}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.red?.toFixed(3) ?? '-'}</td>
                    <td className="px-3 py-2.5">
                      <EncapsulationBadge level={r.encapsulationLevel ?? 1} />
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
