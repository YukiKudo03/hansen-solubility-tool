import React, { useState, useMemo } from 'react';
import type { PartsGroup, Solvent } from '../../core/types';
import { formatChemicalResistanceCsv } from '../../core/report';
import PartsGroupSelector from './PartsGroupSelector';
import SolventSelector from './SolventSelector';
import ChemicalResistanceBadge from './ChemicalResistanceBadge';
import { useChemicalResistance } from '../hooks/useChemicalResistance';

type SortKey = 'partName' | 'materialType' | 'ra' | 'red' | 'resistanceLevel';
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

export default function ChemicalResistanceView() {
  const [selectedGroup, setSelectedGroup] = useState<PartsGroup | null>(null);
  const [selectedSolvent, setSelectedSolvent] = useState<Solvent | null>(null);

  const { result, loading, error, evaluate, clear } = useChemicalResistance();
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
    const csv = formatChemicalResistanceCsv(result);
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
        case 'partName':
          cmp = a.part.name.localeCompare(b.part.name, 'ja');
          break;
        case 'materialType':
          cmp = (a.part.materialType ?? '').localeCompare(b.part.materialType ?? '', 'ja');
          break;
        case 'ra':
          cmp = a.ra - b.ra;
          break;
        case 'red':
          cmp = a.red - b.red;
          break;
        case 'resistanceLevel':
          cmp = a.resistanceLevel - b.resistanceLevel;
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
        <h2 className="text-lg font-semibold text-gray-800 mb-4">耐薬品性予測</h2>
        <p className="text-xs text-gray-500 mb-4">
          HSPに基づき、塗膜・コーティング材料と溶媒の耐薬品性をREDから評価します。RED値が大きいほど耐性が高くなります。
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
            {loading ? '評価中...' : '耐薬品性評価'}
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
                  <SortHeader label="塗膜名" field="partName" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortHeader label="材料種別" field="materialType" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortHeader label="Ra" field="ra" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortHeader label="RED" field="red" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortHeader label="耐薬品性レベル" field="resistanceLevel" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedResults.map((r) => (
                  <tr key={r.part.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2.5 text-sm font-medium text-gray-900">{r.part.name}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.part.materialType ?? '-'}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.ra.toFixed(3)}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.red.toFixed(3)}</td>
                    <td className="px-3 py-2.5">
                      <ChemicalResistanceBadge level={r.resistanceLevel} red={r.red} />
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
