import React, { useState, useMemo, useEffect } from 'react';
import CompatibilityBadge from './CompatibilityBadge';
import SortTableHeader from './SortTableHeader';
import BookmarkButton from './BookmarkButton';
import { useExcipientCompatibility } from '../hooks/useExcipientCompatibility';
import { useSortableTable } from '../hooks/useSortableTable';

type SortKey = 'excipientName' | 'ra' | 'red' | 'compatibilityLevel';

export default function ExcipientCompatibilityView() {
  const [drugs, setDrugs] = useState<any[]>([]);
  const [selectedDrug, setSelectedDrug] = useState<any | null>(null);

  const { result, loading, error, evaluate, clear } = useExcipientCompatibility();
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
        case 'excipientName':
          cmp = (a.excipient?.name ?? '').localeCompare(b.excipient?.name ?? '', 'ja');
          break;
        case 'ra':
          cmp = (a.ra ?? 0) - (b.ra ?? 0);
          break;
        case 'red':
          cmp = (a.red ?? 0) - (b.red ?? 0);
          break;
        case 'compatibilityLevel':
          cmp = (a.compatibilityLevel ?? '').localeCompare(b.compatibilityLevel ?? '');
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
        <h2 className="text-lg font-semibold text-gray-800 mb-4">賦形剤適合性評価</h2>
        <p className="text-xs text-gray-500 mb-4">
          HSPに基づき、薬物（API）と賦形剤の適合性を評価します。
          RED値が大きいほど薬物と賦形剤の相互作用が弱く、安定した製剤設計が可能です。
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
            {loading ? '評価中...' : '賦形剤適合性評価'}
          </button>
          <BookmarkButton
            pipeline="excipientCompatibility"
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
              賦形剤適合性評価結果: {result.drug?.name ?? selectedDrug?.name}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <SortTableHeader label="賦形剤" field="excipientName" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="Ra" field="ra" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="RED" field="red" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="適合性" field="compatibilityLevel" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedResults.map((r: any, i: number) => (
                  <tr key={r.excipient?.id ?? i} className="hover:bg-gray-50">
                    <td className="px-3 py-2.5 text-sm font-medium text-gray-900">{r.excipient?.name ?? '-'}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.ra?.toFixed(3) ?? '-'}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.red?.toFixed(3) ?? '-'}</td>
                    <td className="px-3 py-2.5">
                      <CompatibilityBadge level={r.compatibilityLevel ?? 'Incompatible'} />
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
