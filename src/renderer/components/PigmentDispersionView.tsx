import React, { useState, useMemo, useEffect } from 'react';
import DispersionStabilityBadge from './DispersionStabilityBadge';
import SortTableHeader from './SortTableHeader';
import BookmarkButton from './BookmarkButton';
import { usePigmentDispersion } from '../hooks/usePigmentDispersion';
import { useSortableTable } from '../hooks/useSortableTable';

type SortKey = 'vehicleName' | 'ra' | 'red' | 'stability';

export default function PigmentDispersionView() {
  const [deltaD, setDeltaD] = useState(20.0);
  const [deltaP, setDeltaP] = useState(5.0);
  const [deltaH, setDeltaH] = useState(5.0);
  const [r0, setR0] = useState(8.0);
  const [solvents, setSolvents] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const { result, loading, error, evaluate, clear } = usePigmentDispersion();
  const { sortKey, sortDir, toggleSort } = useSortableTable<SortKey>('red');

  useEffect(() => {
    (window as any).api.getAllSolvents().then((data: any[]) => setSolvents(data));
  }, []);

  const canEvaluate = selectedIds.length > 0 && !loading;

  const handleEvaluate = async () => {
    await evaluate({ deltaD, deltaP, deltaH }, r0, selectedIds);
  };

  const handleSelectAll = () => setSelectedIds(solvents.map((s) => s.id));
  const handleDeselectAll = () => { setSelectedIds([]); clear(); };

  const sortedResults = useMemo(() => {
    if (!result?.results) return [];
    const items = [...result.results];
    items.sort((a: any, b: any) => {
      let cmp = 0;
      switch (sortKey) {
        case 'vehicleName': cmp = (a.vehicle?.name ?? '').localeCompare(b.vehicle?.name ?? '', 'ja'); break;
        case 'ra': cmp = (a.ra ?? 0) - (b.ra ?? 0); break;
        case 'red': cmp = (a.red ?? 0) - (b.red ?? 0); break;
        case 'stability': cmp = (a.stability ?? '').localeCompare(b.stability ?? ''); break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return items;
  }, [result, sortKey, sortDir]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">顔料分散安定性評価</h2>
        <p className="text-xs text-gray-500 mb-4">
          HSPに基づき、顔料のビヒクル（バインダー樹脂）中での分散安定性を評価します。
          RED値が低いほど安定した分散が期待できます。
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">顔料 dD</label>
            <input type="number" step="0.1" value={deltaD} onChange={(e) => setDeltaD(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">顔料 dP</label>
            <input type="number" step="0.1" value={deltaP} onChange={(e) => setDeltaP(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">顔料 dH</label>
            <input type="number" step="0.1" value={deltaH} onChange={(e) => setDeltaH(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">R0</label>
            <input type="number" step="0.1" value={r0} onChange={(e) => setR0(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">ビヒクル（溶媒DB）</label>
          <div className="flex gap-2 mb-2">
            <button onClick={handleSelectAll} className="text-xs text-blue-600 hover:underline">全選択</button>
            <button onClick={handleDeselectAll} className="text-xs text-blue-600 hover:underline">全解除</button>
          </div>
          <select multiple value={selectedIds.map(String)} onChange={(e) => setSelectedIds(Array.from(e.target.selectedOptions, (o) => Number(o.value)))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm h-32">
            {solvents.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-3">
          <button onClick={handleEvaluate} disabled={!canEvaluate}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {loading ? '評価中...' : '顔料分散安定性評価'}
          </button>
          <BookmarkButton pipeline="pigmentDispersion" params={{ deltaD, deltaP, deltaH, r0, vehicleIds: selectedIds }} disabled={selectedIds.length === 0} />
        </div>
      </div>

      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">{error}</div>
      )}

      {result && sortedResults.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800">顔料分散安定性結果</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <SortTableHeader label="ビヒクル名" field="vehicleName" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="Ra" field="ra" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="RED" field="red" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="安定性" field="stability" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedResults.map((r: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-3 py-2.5 text-sm font-medium text-gray-900">{r.vehicle?.name ?? '-'}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.ra?.toFixed(3) ?? '-'}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.red?.toFixed(3) ?? '-'}</td>
                    <td className="px-3 py-2.5"><DispersionStabilityBadge level={r.stability ?? 'Unstable'} /></td>
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
