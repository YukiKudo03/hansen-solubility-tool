import React, { useState, useMemo } from 'react';
import type { PartsGroup, Part } from '../../core/types';
import { formatPlasticizerCsv } from '../../core/report';
import PartsGroupSelector from './PartsGroupSelector';
import PlasticizerBadge from './PlasticizerBadge';
import SortTableHeader from './SortTableHeader';
import BookmarkButton from './BookmarkButton';
import { useCsvExport } from '../hooks/useCsvExport';
import { useSortableTable } from '../hooks/useSortableTable';
import { usePlasticizer } from '../hooks/usePlasticizer';

type SortKey = 'plasticizerName' | 'deltaD' | 'deltaP' | 'deltaH' | 'ra' | 'red' | 'compatibility';

export default function PlasticizerView() {
  const [selectedGroup, setSelectedGroup] = useState<PartsGroup | null>(null);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);

  const { result, loading, error, screen, clear } = usePlasticizer();
  const { csvError, exportCsv } = useCsvExport(formatPlasticizerCsv);
  const { sortKey, sortDir, toggleSort } = useSortableTable<SortKey>('red');

  const canScreen = selectedGroup && selectedPart && !loading;

  const handleGroupSelect = (g: PartsGroup) => {
    setSelectedGroup(g);
    setSelectedPart(null);
    clear();
  };

  const handlePartSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    const part = selectedGroup?.parts.find((p) => p.id === id) ?? null;
    setSelectedPart(part);
    clear();
  };

  const handleScreen = async () => {
    if (!selectedPart || !selectedGroup) return;
    await screen(selectedPart.id, selectedGroup.id);
  };

  const handleExportCsv = () => exportCsv(result);

  const sortedResults = useMemo(() => {
    if (!result) return [];
    const items = [...result.results];
    items.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'plasticizerName':
          cmp = a.solvent.name.localeCompare(b.solvent.name, 'ja');
          break;
        case 'deltaD':
          cmp = a.solvent.hsp.deltaD - b.solvent.hsp.deltaD;
          break;
        case 'deltaP':
          cmp = a.solvent.hsp.deltaP - b.solvent.hsp.deltaP;
          break;
        case 'deltaH':
          cmp = a.solvent.hsp.deltaH - b.solvent.hsp.deltaH;
          break;
        case 'ra':
          cmp = a.ra - b.ra;
          break;
        case 'red':
          cmp = a.red - b.red;
          break;
        case 'compatibility':
          cmp = a.compatibility - b.compatibility;
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
        <h2 className="text-lg font-semibold text-gray-800 mb-4">可塑剤選定</h2>
        <p className="text-xs text-gray-500 mb-4">
          HSPに基づき、ポリマー部品と可塑剤の相溶性をREDから評価します。REDが小さいほど相溶性が高くなります。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <PartsGroupSelector
            onSelect={handleGroupSelect}
            selected={selectedGroup}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">部品を選択</label>
            <select
              value={selectedPart?.id ?? ''}
              onChange={handlePartSelect}
              disabled={!selectedGroup}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            >
              <option value="">-- 選択してください --</option>
              {(selectedGroup?.parts ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}{p.materialType ? ` (${p.materialType})` : ''}
                </option>
              ))}
            </select>
            {selectedPart && (
              <div className="mt-2 text-xs text-gray-500">
                δD: {selectedPart.hsp.deltaD.toFixed(1)} / δP: {selectedPart.hsp.deltaP.toFixed(1)} / δH: {selectedPart.hsp.deltaH.toFixed(1)} / R₀: {selectedPart.r0.toFixed(1)}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleScreen}
            disabled={!canScreen}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'スクリーニング中...' : 'スクリーニング実行'}
          </button>
          {result && (
            <button
              onClick={handleExportCsv}
              className="px-6 py-2.5 bg-green-600 text-white rounded-md font-medium text-sm hover:bg-green-700 transition-colors"
            >
              CSV出力
            </button>
          )}
          <BookmarkButton
            pipeline="plasticizer"
            params={{ partId: selectedPart?.id, partsGroupId: selectedGroup?.id }}
            disabled={!selectedGroup || !selectedPart}
          />
        </div>
      </div>

      {/* エラー表示 */}
      {(error || csvError) && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error || csvError}
        </div>
      )}

      {/* 結果テーブル */}
      {result && result.results.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800">
              スクリーニング結果: {result.part.name}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <SortTableHeader label="可塑剤名" field="plasticizerName" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="δD" field="deltaD" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="δP" field="deltaP" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="δH" field="deltaH" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="Ra" field="ra" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="RED" field="red" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="相溶性" field="compatibility" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedResults.map((r) => (
                  <tr key={r.solvent.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2.5 text-sm font-medium text-gray-900">{r.solvent.name}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.solvent.hsp.deltaD.toFixed(1)}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.solvent.hsp.deltaP.toFixed(1)}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.solvent.hsp.deltaH.toFixed(1)}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.ra.toFixed(3)}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.red.toFixed(3)}</td>
                    <td className="px-3 py-2.5">
                      <PlasticizerBadge level={r.compatibility} red={r.red} />
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
