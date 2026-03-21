import React, { useState, useEffect, useMemo } from 'react';
import type { PartsGroup } from '../../core/types';
import MiscibilityBadge from './MiscibilityBadge';
import SortTableHeader from './SortTableHeader';
import BookmarkButton from './BookmarkButton';
import { usePolymerRecyclingCompatibility } from '../hooks/usePolymerRecyclingCompatibility';
import { useSortableTable } from '../hooks/useSortableTable';

type SortKey = 'polymer1' | 'polymer2' | 'ra' | 'chi' | 'miscibility';

export default function PolymerRecyclingCompatibilityView() {
  const [groups, setGroups] = useState<PartsGroup[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);
  const [degreeOfPolymerization, setDegreeOfPolymerization] = useState(100);
  const [referenceVolume, setReferenceVolume] = useState(100);

  const { result, loading, error, evaluate, clear } = usePolymerRecyclingCompatibility();
  const { sortKey, sortDir, toggleSort } = useSortableTable<SortKey>('chi');

  useEffect(() => {
    (async () => {
      try {
        const allGroups = await (window as any).api.getAllGroups();
        setGroups(allGroups);
      } catch {
        // ignore
      }
    })();
  }, []);

  const toggleGroup = (id: number) => {
    setSelectedGroupIds((prev) =>
      prev.includes(id) ? prev.filter((gid) => gid !== id) : [...prev, id]
    );
    clear();
  };

  const canEvaluate = selectedGroupIds.length >= 2 && !loading;

  const handleEvaluate = async () => {
    if (selectedGroupIds.length < 2) return;
    await evaluate({
      groupIds: selectedGroupIds,
      degreeOfPolymerization,
      referenceVolume,
    });
  };

  const sortedMatrix = useMemo(() => {
    if (!result?.matrix) return [];
    const items = [...result.matrix];
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
        <h2 className="text-lg font-semibold text-gray-800 mb-4">リサイクル相溶性評価</h2>
        <p className="text-xs text-gray-500 mb-4">
          複数ポリマーグループを選択し、全組み合わせのN x Nマトリクスで相溶性を評価します。
          リサイクル工程でのポリマー混入時の相溶性判定に利用できます。
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">ポリマーグループ選択 (2つ以上)</label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3">
            {groups.map((g) => (
              <label key={g.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                <input
                  type="checkbox"
                  checked={selectedGroupIds.includes(g.id)}
                  onChange={() => toggleGroup(g.id)}
                  className="rounded"
                />
                <span className="truncate">{g.name}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1">選択中: {selectedGroupIds.length} グループ</p>
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
            {loading ? '評価中...' : 'N x N相溶性評価'}
          </button>
          <BookmarkButton
            pipeline="polymerRecyclingCompatibility"
            params={{ groupIds: selectedGroupIds, degreeOfPolymerization, referenceVolume }}
            disabled={selectedGroupIds.length < 2}
          />
        </div>
      </div>

      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {result && sortedMatrix.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800">
              リサイクル相溶性マトリクス ({result.groupNames?.length ?? 0} グループ)
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
                {sortedMatrix.map((r: any, i: number) => (
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
