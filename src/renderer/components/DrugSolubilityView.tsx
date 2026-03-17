import React, { useState, useMemo } from 'react';
import type { Drug, Solvent } from '../../core/types';
import { formatDrugSolubilityCsv } from '../../core/report';
import { getRedBoundaryWarnings } from '../../core/accuracy-warnings';
import SolventSelector from './SolventSelector';
import DrugSolubilityBadge from './DrugSolubilityBadge';
import SortTableHeader from './SortTableHeader';
import { useCsvExport } from '../hooks/useCsvExport';
import { useSortableTable } from '../hooks/useSortableTable';
import { useDrugs } from '../hooks/useDrugs';
import { useDrugSolubility } from '../hooks/useDrugSolubility';

type Mode = 'individual' | 'screening';
type SortKey = 'solventName' | 'deltaD' | 'deltaP' | 'deltaH' | 'ra' | 'red' | 'solubility';

export default function DrugSolubilityView() {
  const [mode, setMode] = useState<Mode>('individual');
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [selectedSolvent, setSelectedSolvent] = useState<Solvent | null>(null);

  const { drugs, loading: drugsLoading } = useDrugs();
  const { result, loading: evalLoading, error, evaluate, screenAll, clear } = useDrugSolubility();
  const { csvError, exportCsv } = useCsvExport(formatDrugSolubilityCsv);
  const { sortKey, sortDir, toggleSort } = useSortableTable<SortKey>('red');

  const canEvaluateIndividual = mode === 'individual' && selectedDrug && selectedSolvent && !evalLoading;
  const canScreen = mode === 'screening' && selectedDrug && !evalLoading;

  const handleEvaluate = async () => {
    if (mode === 'individual' && selectedDrug && selectedSolvent) {
      await evaluate(selectedDrug.id, selectedSolvent.id);
    } else if (mode === 'screening' && selectedDrug) {
      await screenAll(selectedDrug.id);
    }
  };

  const handleDrugSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    const drug = drugs.find((d) => d.id === id) ?? null;
    setSelectedDrug(drug);
    clear();
  };

  const handleExportCsv = () => exportCsv(result);

  const sortedResults = useMemo(() => {
    if (!result) return [];
    const items = [...result.results];
    items.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'solventName':
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
        case 'solubility':
          cmp = a.solubility - b.solubility;
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return items;
  }, [result, sortKey, sortDir]);

  // 統計サマリー
  const stats = useMemo(() => {
    if (!result || result.results.length === 0) return null;
    const total = result.results.length;
    const excellent = result.results.filter((r) => r.red < 0.5).length;
    const bestRed = Math.min(...result.results.map((r) => r.red));
    const bestSolvent = result.results.find((r) => r.red === bestRed);
    return { total, excellent, bestRed, bestSolventName: bestSolvent?.solvent.name ?? '-' };
  }, [result]);

  // RED境界警告
  const warnings = useMemo(() => {
    if (!result) return [];
    return getRedBoundaryWarnings(
      result.results.map((r) => ({ red: r.red, name: r.solvent.name }))
    );
  }, [result]);

  return (
    <div className="space-y-6">
      {/* 設定エリア */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">薬物溶解性評価</h2>
        <p className="text-xs text-gray-500 mb-4">
          HSPに基づき、薬物と溶媒の溶解性をREDから評価します。製剤開発における溶媒選択に活用できます。
        </p>

        {/* モード切替 */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => { setMode('individual'); clear(); }}
            className={`px-4 py-2 text-sm rounded-md font-medium transition-colors ${
              mode === 'individual'
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            個別評価
          </button>
          <button
            onClick={() => { setMode('screening'); clear(); }}
            className={`px-4 py-2 text-sm rounded-md font-medium transition-colors ${
              mode === 'screening'
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            全溶媒スクリーニング
          </button>
        </div>

        {/* 薬物選択 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">薬物</label>
            <select
              value={selectedDrug?.id ?? ''}
              onChange={handleDrugSelect}
              disabled={drugsLoading}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            >
              <option value="">選択してください...</option>
              {drugs.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}{d.nameEn ? ` (${d.nameEn})` : ''}{d.therapeuticCategory ? ` — ${d.therapeuticCategory}` : ''}
                </option>
              ))}
            </select>
          </div>

          {mode === 'individual' && (
            <SolventSelector
              onSelect={(s) => { setSelectedSolvent(s); clear(); }}
              selected={selectedSolvent}
            />
          )}
        </div>

        {/* 選択中の薬物情報 */}
        {selectedDrug && (
          <div className="bg-blue-50 rounded-md p-3 mb-4 text-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div><span className="text-gray-500">δD:</span> {selectedDrug.hsp.deltaD.toFixed(1)}</div>
              <div><span className="text-gray-500">δP:</span> {selectedDrug.hsp.deltaP.toFixed(1)}</div>
              <div><span className="text-gray-500">δH:</span> {selectedDrug.hsp.deltaH.toFixed(1)}</div>
              <div><span className="text-gray-500">R₀:</span> {selectedDrug.r0.toFixed(1)}</div>
              {selectedDrug.molWeight != null && (
                <div><span className="text-gray-500">分子量:</span> {selectedDrug.molWeight}</div>
              )}
              {selectedDrug.logP != null && (
                <div><span className="text-gray-500">logP:</span> {selectedDrug.logP.toFixed(2)}</div>
              )}
              {selectedDrug.casNumber && (
                <div><span className="text-gray-500">CAS:</span> {selectedDrug.casNumber}</div>
              )}
            </div>
          </div>
        )}

        {/* 実行ボタン */}
        <div className="flex gap-3">
          <button
            onClick={handleEvaluate}
            disabled={mode === 'individual' ? !canEvaluateIndividual : !canScreen}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {evalLoading
              ? '評価中...'
              : mode === 'individual'
              ? '溶解性評価'
              : '全溶媒スクリーニング'}
          </button>
          {result && (
            <button
              onClick={handleExportCsv}
              className="px-6 py-2.5 bg-green-600 text-white rounded-md font-medium text-sm hover:bg-green-700 transition-colors"
            >
              CSV出力
            </button>
          )}
        </div>
      </div>

      {/* エラー表示 */}
      {(error || csvError) && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error || csvError}
        </div>
      )}

      {/* 統計サマリー */}
      {stats && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
              <div className="text-gray-500">評価溶媒数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.excellent}</div>
              <div className="text-gray-500">優秀な溶解性 (RED &lt; 0.5)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.bestRed.toFixed(3)}</div>
              <div className="text-gray-500">最小RED値</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800 truncate">{stats.bestSolventName}</div>
              <div className="text-gray-500">最適溶媒</div>
            </div>
          </div>
        </div>
      )}

      {/* RED境界の警告 */}
      {warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800 text-sm">
          <div className="font-medium mb-1">推定精度に関する注意</div>
          <ul className="list-disc list-inside space-y-1">
            {warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}

      {/* 結果テーブル */}
      {result && result.results.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <SortTableHeader label="溶媒名" field="solventName" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="δD" field="deltaD" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="δP" field="deltaP" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="δH" field="deltaH" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="Ra" field="ra" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="RED" field="red" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="溶解性レベル" field="solubility" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
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
                      <DrugSolubilityBadge level={r.solubility} red={r.red} />
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
