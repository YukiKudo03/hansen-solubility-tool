import React, { useState, useMemo } from 'react';
import type { PartsGroup } from '../../core/types';
import PartsGroupSelector from './PartsGroupSelector';
import SmoothingBadge from './SmoothingBadge';
import SortTableHeader from './SortTableHeader';
import BookmarkButton from './BookmarkButton';
import { usePrinting3dSmoothing } from '../hooks/usePrinting3dSmoothing';
import { useSortableTable } from '../hooks/useSortableTable';

type SortKey = 'solventName' | 'ra' | 'red' | 'effectLevel';

export default function Printing3dSmoothingView() {
  const [selectedGroup, setSelectedGroup] = useState<PartsGroup | null>(null);

  const { result, loading, error, evaluate, clear } = usePrinting3dSmoothing();
  const { sortKey, sortDir, toggleSort } = useSortableTable<SortKey>('red');

  const canEvaluate = selectedGroup && !loading;

  const handleEvaluate = async () => {
    if (!selectedGroup) return;
    await evaluate(selectedGroup.id);
  };

  const sortedResults = useMemo(() => {
    if (!result?.results) return [];
    const items = [...result.results];
    items.sort((a: any, b: any) => {
      let cmp = 0;
      switch (sortKey) {
        case 'solventName':
          cmp = (a.solvent?.name ?? '').localeCompare(b.solvent?.name ?? '', 'ja');
          break;
        case 'ra':
          cmp = (a.ra ?? 0) - (b.ra ?? 0);
          break;
        case 'red':
          cmp = (a.red ?? 0) - (b.red ?? 0);
          break;
        case 'effectLevel':
          cmp = (a.effectLevel ?? '').localeCompare(b.effectLevel ?? '');
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return items;
  }, [result, sortKey, sortDir]);

  return (
    <div className="space-y-6">
      {/* 設定エリア */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">3D印刷平滑化溶媒スクリーニング</h2>
        <p className="text-xs text-gray-500 mb-4">
          HSPに基づき、3Dプリント造形物のベイパースムージングに適した溶媒を評価します。
          RED値が1に近い溶媒が表面を適度に平滑化し、良好な仕上がりを実現します。
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
            {loading ? 'スクリーニング中...' : '平滑化溶媒スクリーニング'}
          </button>
          <BookmarkButton
            pipeline="printing3dSmoothing"
            params={{ partsGroupId: selectedGroup?.id }}
            disabled={!selectedGroup}
          />
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* 結果テーブル */}
      {result && sortedResults.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800">
              平滑化溶媒スクリーニング結果: {result.partsGroup?.name ?? selectedGroup?.name}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <SortTableHeader label="溶媒名" field="solventName" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="Ra" field="ra" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="RED" field="red" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="平滑化効果" field="effectLevel" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedResults.map((r: any, i: number) => (
                  <tr key={r.solvent?.id ?? i} className="hover:bg-gray-50">
                    <td className="px-3 py-2.5 text-sm font-medium text-gray-900">{r.solvent?.name ?? '-'}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.ra?.toFixed(3) ?? '-'}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.red?.toFixed(3) ?? '-'}</td>
                    <td className="px-3 py-2.5">
                      <SmoothingBadge level={r.effectLevel ?? 'NoEffect'} />
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
