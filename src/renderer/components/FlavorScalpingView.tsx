import React, { useState, useMemo } from 'react';
import type { PartsGroup, Part } from '../../core/types';
import PartsGroupSelector from './PartsGroupSelector';
import ScalpingBadge from './ScalpingBadge';
import SortTableHeader from './SortTableHeader';
import BookmarkButton from './BookmarkButton';
import { useFlavorScalping } from '../hooks/useFlavorScalping';
import { useSortableTable } from '../hooks/useSortableTable';

type SortKey = 'aromaName' | 'ra' | 'red' | 'scalpingLevel';

export default function FlavorScalpingView() {
  const [selectedGroup, setSelectedGroup] = useState<PartsGroup | null>(null);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);

  const { result, loading, error, evaluate, clear } = useFlavorScalping();
  const { sortKey, sortDir, toggleSort } = useSortableTable<SortKey>('red');

  const canEvaluate = selectedGroup && selectedPart && !loading;

  const handleEvaluate = async () => {
    if (!selectedPart || !selectedGroup) return;
    await evaluate(selectedPart.id, selectedGroup.id);
  };

  const sortedResults = useMemo(() => {
    if (!result?.results) return [];
    const items = [...result.results];
    items.sort((a: any, b: any) => {
      let cmp = 0;
      switch (sortKey) {
        case 'aromaName': cmp = (a.aroma?.name ?? '').localeCompare(b.aroma?.name ?? '', 'ja'); break;
        case 'ra': cmp = (a.ra ?? 0) - (b.ra ?? 0); break;
        case 'red': cmp = (a.red ?? 0) - (b.red ?? 0); break;
        case 'scalpingLevel': cmp = String(a.scalpingLevel ?? '').localeCompare(String(b.scalpingLevel ?? '')); break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return items;
  }, [result, sortKey, sortDir]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">フレーバースカルピング予測</h2>
        <p className="text-xs text-gray-500 mb-4">
          包装材とアロマ成分のHSP距離に基づき、フレーバースカルピング（香味吸着）リスクを評価します。
          RED値が小さいほど吸着されやすくなります。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <PartsGroupSelector
            onSelect={(g) => { setSelectedGroup(g); setSelectedPart(null); clear(); }}
            selected={selectedGroup}
          />
          {selectedGroup && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">包装材を選択</label>
              <select
                value={selectedPart?.id ?? ''}
                onChange={(e) => {
                  const part = selectedGroup.parts.find((p) => p.id === Number(e.target.value));
                  if (part) setSelectedPart(part);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">選択してください</option>
                {selectedGroup.parts.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleEvaluate}
            disabled={!canEvaluate}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '評価中...' : 'スカルピングスクリーニング'}
          </button>
          <BookmarkButton
            pipeline="flavorScalping"
            params={{ partId: selectedPart?.id, groupId: selectedGroup?.id }}
            disabled={!selectedPart}
          />
        </div>
      </div>

      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {result && sortedResults.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800">
              スカルピング評価結果: {selectedPart?.name}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <SortTableHeader label="アロマ成分名" field="aromaName" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="Ra" field="ra" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="RED" field="red" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="スカルピングリスク" field="scalpingLevel" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedResults.map((r: any, i: number) => (
                  <tr key={r.aroma?.id ?? i} className="hover:bg-gray-50">
                    <td className="px-3 py-2.5 text-sm font-medium text-gray-900">{r.aroma?.name ?? '-'}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.ra?.toFixed(3) ?? '-'}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.red?.toFixed(3) ?? '-'}</td>
                    <td className="px-3 py-2.5">
                      <ScalpingBadge level={r.scalpingLevel ?? 'Low'} />
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
