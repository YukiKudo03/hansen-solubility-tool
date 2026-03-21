import React, { useState, useMemo, useEffect } from 'react';
import SortTableHeader from './SortTableHeader';
import BookmarkButton from './BookmarkButton';
import { useSolventSubstitution } from '../hooks/useSolventSubstitution';
import { useSortableTable } from '../hooks/useSortableTable';

type SortKey = 'solventName' | 'ra' | 'safetyRating' | 'overallScore';

const SAFETY_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  recommended: { label: '推奨', bg: 'bg-green-100', text: 'text-green-800' },
  acceptable: { label: '許容', bg: 'bg-blue-100', text: 'text-blue-800' },
  problematic: { label: '問題あり', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  hazardous: { label: '危険', bg: 'bg-red-100', text: 'text-red-800' },
  banned: { label: '禁止', bg: 'bg-red-200', text: 'text-red-900' },
};

export default function SolventSubstitutionView() {
  const [deltaD, setDeltaD] = useState(18.0);
  const [deltaP, setDeltaP] = useState(12.3);
  const [deltaH, setDeltaH] = useState(7.2);
  const [solvents, setSolvents] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const { result, loading, error, evaluate, clear } = useSolventSubstitution();
  const { sortKey, sortDir, toggleSort } = useSortableTable<SortKey>('overallScore');

  useEffect(() => {
    (window as any).api.getAllSolvents().then((data: any[]) => setSolvents(data));
  }, []);

  const canEvaluate = selectedIds.length > 0 && !loading;

  const handleEvaluate = async () => {
    await evaluate({ deltaD, deltaP, deltaH }, selectedIds);
  };

  const handleSelectAll = () => setSelectedIds(solvents.map((s) => s.id));
  const handleDeselectAll = () => { setSelectedIds([]); clear(); };

  const sortedResults = useMemo(() => {
    if (!result?.results) return [];
    const items = [...result.results];
    items.sort((a: any, b: any) => {
      let cmp = 0;
      switch (sortKey) {
        case 'solventName': cmp = (a.solvent?.name ?? '').localeCompare(b.solvent?.name ?? '', 'ja'); break;
        case 'ra': cmp = (a.ra ?? 0) - (b.ra ?? 0); break;
        case 'safetyRating': cmp = (a.safetyRating ?? '').localeCompare(b.safetyRating ?? ''); break;
        case 'overallScore': cmp = (a.overallScore ?? 0) - (b.overallScore ?? 0); break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return items;
  }, [result, sortKey, sortDir]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">溶媒代替設計</h2>
        <p className="text-xs text-gray-500 mb-4">
          規制溶媒のHSPに最も近い代替候補をRa距離と環境/安全スコアでランキングします。
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">規制溶媒 dD</label>
            <input type="number" step="0.1" value={deltaD} onChange={(e) => setDeltaD(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">規制溶媒 dP</label>
            <input type="number" step="0.1" value={deltaP} onChange={(e) => setDeltaP(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">規制溶媒 dH</label>
            <input type="number" step="0.1" value={deltaH} onChange={(e) => setDeltaH(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">代替候補（溶媒DB）</label>
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
            {loading ? '評価中...' : '溶媒代替設計評価'}
          </button>
          <BookmarkButton pipeline="solventSubstitution" params={{ deltaD, deltaP, deltaH, solventIds: selectedIds }} disabled={selectedIds.length === 0} />
        </div>
      </div>

      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">{error}</div>
      )}

      {result && sortedResults.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800">溶媒代替候補</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <SortTableHeader label="溶媒名" field="solventName" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="Ra" field="ra" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="安全性" field="safetyRating" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">環境</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">健康</th>
                  <SortTableHeader label="総合スコア" field="overallScore" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedResults.map((r: any, i: number) => {
                  const badge = SAFETY_BADGE[r.safetyRating] ?? { label: r.safetyRating ?? '不明', bg: 'bg-gray-100', text: 'text-gray-800' };
                  return (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-3 py-2.5 text-sm font-medium text-gray-900">{r.solvent?.name ?? '-'}</td>
                      <td className="px-3 py-2.5 text-sm text-gray-500">{r.ra?.toFixed(3) ?? '-'}</td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md3-sm text-xs font-medium ${badge.bg} ${badge.text}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-sm text-gray-500">{r.environmentalScore ?? '-'}</td>
                      <td className="px-3 py-2.5 text-sm text-gray-500">{r.healthScore ?? '-'}</td>
                      <td className="px-3 py-2.5 text-sm text-gray-500">{r.overallScore?.toFixed(3) ?? '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
