import React, { useState, useMemo } from 'react';
import type { Drug, PartsGroup, Part } from '../../core/types';
import { formatCarrierSelectionCsv } from '../../core/report';
import PartsGroupSelector from './PartsGroupSelector';
import CarrierBadge from './CarrierBadge';
import { useDrugs } from '../hooks/useDrugs';
import { useCarrierSelection } from '../hooks/useCarrierSelection';

type Mode = 'individual' | 'screening';
type SortKey = 'carrierName' | 'deltaD' | 'deltaP' | 'deltaH' | 'r0' | 'ra' | 'red' | 'compatibility';
type SortDir = 'asc' | 'desc';

function SortHeader({ label, field, sortKey, sortDir, onToggle, className }: {
  label: string; field: SortKey; sortKey: SortKey; sortDir: SortDir;
  onToggle: (key: SortKey) => void; className?: string;
}) {
  return (
    <th
      onClick={() => onToggle(field)}
      className={`px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none ${className ?? ''}`}
    >
      {label} {sortKey === field && (sortDir === 'asc' ? '▲' : '▼')}
    </th>
  );
}

export default function CarrierSelectionView() {
  const [mode, setMode] = useState<Mode>('individual');
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<PartsGroup | null>(null);
  const [selectedCarrier, setSelectedCarrier] = useState<Part | null>(null);

  const { drugs, loading: drugsLoading } = useDrugs();
  const { result, loading: evalLoading, error, evaluate, screenAll, clear } = useCarrierSelection();
  const [csvError, setCsvError] = useState<string | null>(null);

  const [sortKey, setSortKey] = useState<SortKey>('red');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const canEvaluateIndividual = mode === 'individual' && selectedDrug && selectedGroup && selectedCarrier && !evalLoading;
  const canScreen = mode === 'screening' && selectedDrug && selectedGroup && !evalLoading;

  const handleDrugSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    const drug = drugs.find((d) => d.id === id) ?? null;
    setSelectedDrug(drug);
    clear();
  };

  const handleGroupSelect = (g: PartsGroup) => {
    setSelectedGroup(g);
    setSelectedCarrier(null);
    clear();
  };

  const handleCarrierSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    const carrier = selectedGroup?.parts.find((p) => p.id === id) ?? null;
    setSelectedCarrier(carrier);
    clear();
  };

  const handleEvaluate = async () => {
    if (mode === 'individual' && selectedDrug && selectedCarrier && selectedGroup) {
      await evaluate(selectedDrug.id, selectedCarrier.id, selectedGroup.id);
    } else if (mode === 'screening' && selectedDrug && selectedGroup) {
      await screenAll(selectedDrug.id, selectedGroup.id);
    }
  };

  const handleExportCsv = async () => {
    if (!result) return;
    setCsvError(null);
    const csv = formatCarrierSelectionCsv(result);
    try {
      await window.api.saveCsv(csv);
    } catch (e) {
      setCsvError(e instanceof Error ? e.message : 'CSV保存中にエラーが発生しました');
    }
  };

  const sortedResults = useMemo(() => {
    if (!result) return [];
    const items = [...result.results];
    items.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'carrierName':
          cmp = a.carrier.name.localeCompare(b.carrier.name, 'ja');
          break;
        case 'deltaD':
          cmp = a.carrier.hsp.deltaD - b.carrier.hsp.deltaD;
          break;
        case 'deltaP':
          cmp = a.carrier.hsp.deltaP - b.carrier.hsp.deltaP;
          break;
        case 'deltaH':
          cmp = a.carrier.hsp.deltaH - b.carrier.hsp.deltaH;
          break;
        case 'r0':
          cmp = a.carrier.r0 - b.carrier.r0;
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

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  // 統計サマリー
  const stats = useMemo(() => {
    if (!result || result.results.length === 0) return null;
    const total = result.results.length;
    const excellent = result.results.filter((r) => r.red < 0.5).length;
    const bestRed = Math.min(...result.results.map((r) => r.red));
    const bestCarrier = result.results.find((r) => r.red === bestRed);
    return { total, excellent, bestRed, bestCarrierName: bestCarrier?.carrier.name ?? '-' };
  }, [result]);

  return (
    <div className="space-y-6">
      {/* 設定エリア */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">キャリア選定（DDS）</h2>
        <p className="text-xs text-gray-500 mb-4">
          HSPに基づき、薬物とDDSキャリアの適合性をREDから評価します。REDが小さいほどカプセル化効率が高くなります。
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
            onClick={() => { setMode('screening'); setSelectedCarrier(null); clear(); }}
            className={`px-4 py-2 text-sm rounded-md font-medium transition-colors ${
              mode === 'screening'
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            グループスクリーニング
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

          <PartsGroupSelector
            onSelect={handleGroupSelect}
            selected={selectedGroup}
          />
        </div>

        {/* 個別評価モード: キャリア選択 */}
        {mode === 'individual' && selectedGroup && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">キャリアを選択</label>
            <select
              value={selectedCarrier?.id ?? ''}
              onChange={handleCarrierSelect}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- 選択してください --</option>
              {selectedGroup.parts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}{p.materialType ? ` (${p.materialType})` : ''}
                </option>
              ))}
            </select>
          </div>
        )}

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
              ? 'キャリア評価'
              : 'スクリーニング実行'}
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
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error || csvError}
        </div>
      )}

      {/* 統計サマリー */}
      {stats && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
              <div className="text-gray-500">評価キャリア数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.excellent}</div>
              <div className="text-gray-500">優秀な適合性 (RED &lt; 0.5)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.bestRed.toFixed(3)}</div>
              <div className="text-gray-500">最小RED値</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800 truncate">{stats.bestCarrierName}</div>
              <div className="text-gray-500">最適キャリア</div>
            </div>
          </div>
        </div>
      )}

      {/* 結果テーブル */}
      {result && result.results.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <SortHeader label="キャリア名" field="carrierName" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortHeader label="δD" field="deltaD" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortHeader label="δP" field="deltaP" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortHeader label="δH" field="deltaH" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortHeader label="R₀" field="r0" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortHeader label="Ra" field="ra" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortHeader label="RED" field="red" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortHeader label="適合性" field="compatibility" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedResults.map((r) => (
                  <tr key={r.carrier.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2.5 text-sm font-medium text-gray-900">{r.carrier.name}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.carrier.hsp.deltaD.toFixed(1)}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.carrier.hsp.deltaP.toFixed(1)}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.carrier.hsp.deltaH.toFixed(1)}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.carrier.r0.toFixed(1)}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.ra.toFixed(3)}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.red.toFixed(3)}</td>
                    <td className="px-3 py-2.5">
                      <CarrierBadge level={r.compatibility} red={r.red} />
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
