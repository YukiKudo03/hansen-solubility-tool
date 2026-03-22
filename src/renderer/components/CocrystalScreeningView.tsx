import React, { useState, useMemo, useEffect } from 'react';
import CocrystalBadge from './CocrystalBadge';
import SortTableHeader from './SortTableHeader';
import BookmarkButton from './BookmarkButton';
import { useCocrystalScreening } from '../hooks/useCocrystalScreening';
import { useSortableTable } from '../hooks/useSortableTable';

type SortKey = 'coformerName' | 'ra' | 'red' | 'likelihood';

export default function CocrystalScreeningView() {
  const [drugs, setDrugs] = useState<any[]>([]);
  const [selectedDrug, setSelectedDrug] = useState<any | null>(null);

  const { result, loading, error, evaluate, clear } = useCocrystalScreening();
  const { sortKey, sortDir, toggleSort } = useSortableTable<SortKey>('red');

  useEffect(() => {
    (window as any).api.getAllDrugs().then((data: any[]) => setDrugs(data));
  }, []);

  const canEvaluate = selectedDrug && !loading;

  const handleEvaluate = async () => {
    if (!selectedDrug) return;
    await evaluate(selectedDrug.id);
  };

  const sortedResults = useMemo(() => {
    if (!result?.results) return [];
    const items = [...result.results];
    items.sort((a: any, b: any) => {
      let cmp = 0;
      switch (sortKey) {
        case 'coformerName':
          cmp = (a.coformer?.name ?? '').localeCompare(b.coformer?.name ?? '', 'ja');
          break;
        case 'ra':
          cmp = (a.ra ?? 0) - (b.ra ?? 0);
          break;
        case 'red':
          cmp = (a.red ?? 0) - (b.red ?? 0);
          break;
        case 'likelihood':
          cmp = (a.likelihood ?? '').localeCompare(b.likelihood ?? '');
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
        <h2 className="text-lg font-semibold text-gray-800 mb-4">共結晶スクリーニング</h2>
        <p className="text-xs text-gray-500 mb-4">
          HSPに基づき、薬物とコフォーマーの相互作用を評価し、共結晶形成の可能性をスクリーニングします。
          RED値が小さいほど共結晶形成の可能性が高くなります。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">薬物（API）</label>
            <select
              value={selectedDrug?.id ?? ''}
              onChange={(e) => {
                const d = drugs.find((dr) => dr.id === Number(e.target.value)) ?? null;
                setSelectedDrug(d);
                clear();
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">選択してください...</option>
              {drugs.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}{d.nameEn ? ` (${d.nameEn})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleEvaluate}
            disabled={!canEvaluate}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'スクリーニング中...' : '共結晶スクリーニング'}
          </button>
          <BookmarkButton
            pipeline="cocrystalScreening"
            params={{ drugId: selectedDrug?.id }}
            disabled={!selectedDrug}
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
              共結晶スクリーニング結果: {result.drug?.name ?? selectedDrug?.name}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <SortTableHeader label="コフォーマー" field="coformerName" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="Ra" field="ra" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="RED" field="red" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="可能性" field="likelihood" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedResults.map((r: any, i: number) => (
                  <tr key={r.coformer?.id ?? i} className="hover:bg-gray-50">
                    <td className="px-3 py-2.5 text-sm font-medium text-gray-900">{r.coformer?.name ?? '-'}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.ra?.toFixed(3) ?? '-'}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.red?.toFixed(3) ?? '-'}</td>
                    <td className="px-3 py-2.5">
                      <CocrystalBadge level={r.likelihood ?? 'Unlikely'} />
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
