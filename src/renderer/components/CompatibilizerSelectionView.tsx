import React, { useState, useMemo } from 'react';
import type { PartsGroup } from '../../core/types';
import PartsGroupSelector from './PartsGroupSelector';
import CompatibilityBadge from './CompatibilityBadge';
import SortTableHeader from './SortTableHeader';
import BookmarkButton from './BookmarkButton';
import { useCompatibilizerSelection } from '../hooks/useCompatibilizerSelection';
import { useSortableTable } from '../hooks/useSortableTable';

type SortKey = 'name' | 'raP1' | 'raP2' | 'score' | 'compatibility';

export default function CompatibilizerSelectionView() {
  const [group1, setGroup1] = useState<PartsGroup | null>(null);
  const [group2, setGroup2] = useState<PartsGroup | null>(null);

  const { result, loading, error, screen, clear } = useCompatibilizerSelection();
  const { sortKey, sortDir, toggleSort } = useSortableTable<SortKey>('score');

  const canEvaluate = group1 && group2 && !loading;

  const handleScreen = async () => {
    if (!group1 || !group2) return;
    await screen({ groupId1: group1.id, groupId2: group2.id });
  };

  const sortedResults = useMemo(() => {
    if (!result?.results) return [];
    const items = [...result.results];
    items.sort((a: any, b: any) => {
      let cmp = 0;
      switch (sortKey) {
        case 'name': cmp = (a.compatibilizerName ?? '').localeCompare(b.compatibilizerName ?? '', 'ja'); break;
        case 'raP1': cmp = (a.raToPolymer1 ?? 0) - (b.raToPolymer1 ?? 0); break;
        case 'raP2': cmp = (a.raToPolymer2 ?? 0) - (b.raToPolymer2 ?? 0); break;
        case 'score': cmp = (a.overallScore ?? 0) - (b.overallScore ?? 0); break;
        case 'compatibility': cmp = (a.compatibility ?? '').localeCompare(b.compatibility ?? ''); break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return items;
  }, [result, sortKey, sortDir]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">相溶化剤選定</h2>
        <p className="text-xs text-gray-500 mb-4">
          2つのポリマーグループを選択し、両方に対してHSP距離が近い候補物質を溶媒データベースからスクリーニングします。
          総合スコア（幾何平均Ra）が低いほど、相溶化剤として有望です。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ポリマー1</label>
            <PartsGroupSelector
              onSelect={(g) => { setGroup1(g); clear(); }}
              selected={group1}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ポリマー2</label>
            <PartsGroupSelector
              onSelect={(g) => { setGroup2(g); clear(); }}
              selected={group2}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleScreen}
            disabled={!canEvaluate}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'スクリーニング中...' : '相溶化剤スクリーニング'}
          </button>
          <BookmarkButton
            pipeline="compatibilizerSelection"
            params={{ groupId1: group1?.id, groupId2: group2?.id }}
            disabled={!group1 || !group2}
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
              相溶化剤候補: {result.polymer1Name} + {result.polymer2Name}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <SortTableHeader label="候補名" field="name" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="Ra (P1)" field="raP1" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="Ra (P2)" field="raP2" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="総合スコア" field="score" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="適合性" field="compatibility" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedResults.map((r: any, i: number) => (
                  <tr key={r.solventId ?? i} className="hover:bg-gray-50">
                    <td className="px-3 py-2.5 text-sm font-medium text-gray-900">{r.compatibilizerName}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.raToPolymer1?.toFixed(3)}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.raToPolymer2?.toFixed(3)}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.overallScore?.toFixed(3)}</td>
                    <td className="px-3 py-2.5">
                      <CompatibilityBadge level={r.compatibility} />
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
