import React, { useState, useMemo } from 'react';
import type { PartsGroup, Solvent } from '../../core/types';
import { buildComparisonMatrix, calculateComparisonStats } from '../../core/comparison';
import type { ComparisonRow } from '../../core/comparison';
import PartsGroupSelector from './PartsGroupSelector';
import SolventSelector from './SolventSelector';
import RiskBadge from './RiskBadge';
import SortTableHeader from './SortTableHeader';
import { useSortableTable } from '../hooks/useSortableTable';
import { useCsvExport } from '../hooks/useCsvExport';

type SortKey = 'partName' | 'solventName' | 'ra' | 'red' | 'riskLevel';

function formatComparisonCsv(rows: ComparisonRow[]): string {
  const BOM = '\uFEFF';
  const headers = ['部品名', '材料種別', '溶媒名', 'Ra', 'RED', 'リスクレベル'];
  const lines = rows.map((r) =>
    [r.partName, r.materialType ?? '', r.solventName, r.ra.toFixed(3), r.red.toFixed(3), `Level ${r.riskLevel}`].join(','),
  );
  return BOM + [headers.join(','), ...lines].join('\r\n') + '\r\n';
}

export default function ComparisonView() {
  const [selectedGroup, setSelectedGroup] = useState<PartsGroup | null>(null);
  const [selectedSolvents, setSelectedSolvents] = useState<Solvent[]>([]);
  const [rows, setRows] = useState<ComparisonRow[]>([]);

  const { sortKey, sortDir, toggleSort } = useSortableTable<SortKey>('red');
  const { csvError, exportCsv } = useCsvExport(formatComparisonCsv);

  const handleAddSolvent = (solvent: Solvent) => {
    if (selectedSolvents.some((s) => s.id === solvent.id)) return;
    setSelectedSolvents((prev) => [...prev, solvent]);
  };

  const handleRemoveSolvent = (id: number) => {
    setSelectedSolvents((prev) => prev.filter((s) => s.id !== id));
  };

  const handleCompare = () => {
    if (!selectedGroup || selectedSolvents.length === 0) return;
    const result = buildComparisonMatrix(selectedGroup.parts, selectedSolvents);
    setRows(result);
  };

  const stats = useMemo(() => calculateComparisonStats(rows), [rows]);

  const sortedRows = useMemo(() => {
    if (rows.length === 0) return [];
    const items = [...rows];
    items.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'partName': cmp = a.partName.localeCompare(b.partName, 'ja'); break;
        case 'solventName': cmp = a.solventName.localeCompare(b.solventName, 'ja'); break;
        case 'ra': cmp = a.ra - b.ra; break;
        case 'red': cmp = a.red - b.red; break;
        case 'riskLevel': cmp = a.riskLevel - b.riskLevel; break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return items;
  }, [rows, sortKey, sortDir]);

  const canCompare = selectedGroup && selectedSolvents.length > 0;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">横断比較レポート</h2>
        <p className="text-xs text-gray-500 mb-4">
          部品グループ内の全材料と選択した溶媒の組み合わせを一括評価し、RED値で比較します。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <PartsGroupSelector
            onSelect={(g) => { setSelectedGroup(g); setRows([]); }}
            selected={selectedGroup}
          />
          <div>
            <SolventSelector onSelect={handleAddSolvent} />
            {selectedSolvents.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {selectedSolvents.map((s) => (
                  <span key={s.id} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs">
                    {s.name}
                    <button onClick={() => handleRemoveSolvent(s.id)} className="text-blue-400 hover:text-blue-600">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleCompare}
            disabled={!canCompare}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            比較実行
          </button>
          {rows.length > 0 && (
            <button
              onClick={() => exportCsv(rows)}
              className="px-6 py-2.5 bg-green-600 text-white rounded-md font-medium text-sm hover:bg-green-700 transition-colors"
            >
              CSV出力
            </button>
          )}
        </div>
      </div>

      {csvError && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {csvError}
        </div>
      )}

      {/* 統計サマリー */}
      {rows.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-800">{stats.totalRows}</div>
              <div className="text-gray-500 text-sm">評価組み合わせ数</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.minRed.toFixed(3)}</div>
              <div className="text-gray-500 text-sm">最小RED</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{stats.maxRed.toFixed(3)}</div>
              <div className="text-gray-500 text-sm">最大RED</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{stats.avgRed.toFixed(3)}</div>
              <div className="text-gray-500 text-sm">平均RED</div>
            </div>
          </div>
        </div>
      )}

      {/* 比較結果テーブル */}
      {rows.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800">
              比較結果: {selectedGroup?.name} × {selectedSolvents.length}溶媒
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <SortTableHeader label="部品名" field="partName" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">材料種別</th>
                  <SortTableHeader label="溶媒名" field="solventName" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="Ra" field="ra" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="RED" field="red" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="リスク" field="riskLevel" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedRows.map((r, i) => (
                  <tr key={`${r.partId}-${r.solventId}`} className="hover:bg-gray-50">
                    <td className="px-3 py-2.5 text-sm font-medium text-gray-900">{r.partName}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.materialType ?? '-'}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.solventName}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.ra.toFixed(3)}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.red.toFixed(3)}</td>
                    <td className="px-3 py-2.5">
                      <RiskBadge level={r.riskLevel} red={r.red} />
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
