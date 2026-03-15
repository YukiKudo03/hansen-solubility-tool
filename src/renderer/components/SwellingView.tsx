import React, { useState, useMemo } from 'react';
import type { PartsGroup, Solvent } from '../../core/types';
import { formatSwellingCsv } from '../../core/report';
import PartsGroupSelector from './PartsGroupSelector';
import SolventSelector from './SolventSelector';
import SwellingBadge from './SwellingBadge';
import { useSwelling } from '../hooks/useSwelling';

type SortKey = 'partName' | 'materialType' | 'deltaD' | 'deltaP' | 'deltaH' | 'r0' | 'ra' | 'red' | 'swellingLevel';
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

export default function SwellingView() {
  const [selectedGroup, setSelectedGroup] = useState<PartsGroup | null>(null);
  const [selectedSolvent, setSelectedSolvent] = useState<Solvent | null>(null);

  const { result, loading, error, evaluate, clear } = useSwelling();
  const [csvError, setCsvError] = useState<string | null>(null);

  const [sortKey, setSortKey] = useState<SortKey>('red');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const canEvaluate = selectedGroup && selectedSolvent && !loading;

  const handleEvaluate = async () => {
    if (!selectedGroup || !selectedSolvent) return;
    await evaluate(selectedGroup.id, selectedSolvent.id);
  };

  const handleExportCsv = async () => {
    if (!result) return;
    setCsvError(null);
    const csv = formatSwellingCsv(result);
    try {
      await window.api.saveCsv(csv);
    } catch (e) {
      setCsvError(e instanceof Error ? e.message : 'CSV保存中にエラーが発生しました');
    }
  };

  // 警告: エラストマー/ゴム以外の材料を含むかチェック
  const hasNonElastomerMaterial = useMemo(() => {
    if (!result) return false;
    return result.results.some((r) => {
      const mt = r.part.materialType?.toLowerCase() ?? null;
      if (mt === null) return true;
      return mt !== 'elastomer' && mt !== 'rubber' && !mt.includes('エラストマー') && !mt.includes('ゴム');
    });
  }, [result]);

  const sortedResults = useMemo(() => {
    if (!result) return [];
    const items = [...result.results];
    items.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'partName':
          cmp = a.part.name.localeCompare(b.part.name, 'ja');
          break;
        case 'materialType':
          cmp = (a.part.materialType ?? '').localeCompare(b.part.materialType ?? '', 'ja');
          break;
        case 'deltaD':
          cmp = a.part.hsp.deltaD - b.part.hsp.deltaD;
          break;
        case 'deltaP':
          cmp = a.part.hsp.deltaP - b.part.hsp.deltaP;
          break;
        case 'deltaH':
          cmp = a.part.hsp.deltaH - b.part.hsp.deltaH;
          break;
        case 'r0':
          cmp = a.part.r0 - b.part.r0;
          break;
        case 'ra':
          cmp = a.ra - b.ra;
          break;
        case 'red':
          cmp = a.red - b.red;
          break;
        case 'swellingLevel':
          cmp = a.swellingLevel - b.swellingLevel;
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

  return (
    <div className="space-y-6">
      {/* 設定エリア */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">膨潤度予測</h2>
        <p className="text-xs text-gray-500 mb-4">
          HSPに基づき、エラストマー/ゴム材料と溶媒の接触による膨潤リスクをREDから評価します。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <PartsGroupSelector
            onSelect={(g) => { setSelectedGroup(g); clear(); }}
            selected={selectedGroup}
          />
          <SolventSelector
            onSelect={(s) => { setSelectedSolvent(s); clear(); }}
            selected={selectedSolvent}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleEvaluate}
            disabled={!canEvaluate}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '評価中...' : '膨潤度評価'}
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

      {/* 材料種別警告 */}
      {result && hasNonElastomerMaterial && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800 text-sm">
          このグループにはエラストマー/ゴム以外の材料が含まれています。膨潤度予測はエラストマー向けの指標です。
        </div>
      )}

      {/* エラー表示 */}
      {(error || csvError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error || csvError}
        </div>
      )}

      {/* 結果テーブル */}
      {result && result.results.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800">
              評価結果: {result.partsGroup.name} × {result.solvent.name}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <SortHeader label="Part名" field="partName" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortHeader label="材料種別" field="materialType" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortHeader label="δD" field="deltaD" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortHeader label="δP" field="deltaP" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortHeader label="δH" field="deltaH" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortHeader label="R₀" field="r0" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortHeader label="Ra" field="ra" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortHeader label="RED" field="red" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortHeader label="膨潤レベル" field="swellingLevel" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedResults.map((r) => (
                  <tr key={r.part.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2.5 text-sm font-medium text-gray-900">{r.part.name}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.part.materialType ?? '-'}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.part.hsp.deltaD.toFixed(1)}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.part.hsp.deltaP.toFixed(1)}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.part.hsp.deltaH.toFixed(1)}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.part.r0.toFixed(1)}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.ra.toFixed(3)}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.red.toFixed(3)}</td>
                    <td className="px-3 py-2.5">
                      <SwellingBadge level={r.swellingLevel} red={r.red} />
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
