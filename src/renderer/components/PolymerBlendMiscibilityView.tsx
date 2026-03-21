import React, { useState, useMemo } from 'react';
import type { PartsGroup } from '../../core/types';
import PartsGroupSelector from './PartsGroupSelector';
import MiscibilityBadge from './MiscibilityBadge';
import SortTableHeader from './SortTableHeader';
import BookmarkButton from './BookmarkButton';
import { usePolymerBlendMiscibility } from '../hooks/usePolymerBlendMiscibility';
import { useSortableTable } from '../hooks/useSortableTable';

type SortKey = 'polymer1' | 'polymer2' | 'ra' | 'chi' | 'miscibility';

export default function PolymerBlendMiscibilityView() {
  const [group1, setGroup1] = useState<PartsGroup | null>(null);
  const [group2, setGroup2] = useState<PartsGroup | null>(null);
  const [degreeOfPolymerization, setDegreeOfPolymerization] = useState(100);
  const [referenceVolume, setReferenceVolume] = useState(100);

  const { result, loading, error, evaluate, clear } = usePolymerBlendMiscibility();
  const { sortKey, sortDir, toggleSort } = useSortableTable<SortKey>('chi');

  const canEvaluate = group1 && group2 && !loading;

  const handleEvaluate = async () => {
    if (!group1 || !group2) return;
    await evaluate({
      groupId1: group1.id,
      groupId2: group2.id,
      degreeOfPolymerization,
      referenceVolume,
    });
  };

  const sortedResults = useMemo(() => {
    if (!result?.results) return [];
    const items = [...result.results];
    items.sort((a: any, b: any) => {
      let cmp = 0;
      switch (sortKey) {
        case 'polymer1': cmp = (a.polymer1Name ?? '').localeCompare(b.polymer1Name ?? '', 'ja'); break;
        case 'polymer2': cmp = (a.polymer2Name ?? '').localeCompare(b.polymer2Name ?? '', 'ja'); break;
        case 'ra': cmp = (a.ra ?? 0) - (b.ra ?? 0); break;
        case 'chi': cmp = (a.chiParameter ?? 0) - (b.chiParameter ?? 0); break;
        case 'miscibility': cmp = (a.miscibility ?? '').localeCompare(b.miscibility ?? ''); break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return items;
  }, [result, sortKey, sortDir]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">ブレンド相溶性評価</h2>
        <p className="text-xs text-gray-500 mb-4">
          Flory-Huggins理論に基づき、2つのポリマーグループ間の相溶性をHSP距離から評価します。
          χパラメータが臨界値未満なら相溶、超過なら非相溶と判定します。
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">重合度 N</label>
            <input
              type="number"
              min={1}
              value={degreeOfPolymerization}
              onChange={(e) => setDegreeOfPolymerization(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">参照体積 Vref (cm3/mol)</label>
            <input
              type="number"
              min={1}
              value={referenceVolume}
              onChange={(e) => setReferenceVolume(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleEvaluate}
            disabled={!canEvaluate}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '評価中...' : '相溶性評価'}
          </button>
          <BookmarkButton
            pipeline="polymerBlendMiscibility"
            params={{ groupId1: group1?.id, groupId2: group2?.id, degreeOfPolymerization, referenceVolume }}
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
              相溶性評価結果: {result.group1Name} vs {result.group2Name}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <SortTableHeader label="ポリマー1" field="polymer1" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="ポリマー2" field="polymer2" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="Ra" field="ra" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="chi" field="chi" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="相溶性" field="miscibility" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedResults.map((r: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-3 py-2.5 text-sm font-medium text-gray-900">{r.polymer1Name}</td>
                    <td className="px-3 py-2.5 text-sm font-medium text-gray-900">{r.polymer2Name}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.ra?.toFixed(3)}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.chiParameter?.toFixed(4)}</td>
                    <td className="px-3 py-2.5">
                      <MiscibilityBadge level={r.miscibility} />
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
