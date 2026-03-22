import React, { useState, useMemo, useEffect } from 'react';
import type { PartsGroup } from '../../core/types';
import { PCMEncapsulationLevel } from '../../core/pcm-encapsulation';
import { formatPCMEncapsulationCsv } from '../../core/report';
import { getRedBoundaryWarnings } from '../../core/accuracy-warnings';
import PartsGroupSelector from './PartsGroupSelector';
import GenericLevelBadge from './GenericLevelBadge';
import type { BadgeLevelConfig } from './GenericLevelBadge';
import SortTableHeader from './SortTableHeader';
import BookmarkButton from './BookmarkButton';
import { usePCMEncapsulation } from '../hooks/usePCMEncapsulation';
import { useCsvExport } from '../hooks/useCsvExport';
import { useSortableTable } from '../hooks/useSortableTable';

const BADGE_CONFIG: Record<string | number, BadgeLevelConfig> = {
  [PCMEncapsulationLevel.Excellent]: { label: '優秀', bg: 'bg-green-100', text: 'text-green-800' },
  [PCMEncapsulationLevel.Good]: { label: '良好', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  [PCMEncapsulationLevel.Poor]: { label: '不良', bg: 'bg-red-100', text: 'text-red-800' },
};

type SortKey = 'shellMaterialName' | 'ra' | 'red' | 'level';

export default function PCMEncapsulationView() {
  const [selectedGroup, setSelectedGroup] = useState<PartsGroup | null>(null);
  const [solvents, setSolvents] = useState<any[]>([]);

  const { result, loading, error, evaluate, clear } = usePCMEncapsulation();
  const { csvError, exportCsv } = useCsvExport(formatPCMEncapsulationCsv);
  const { sortKey, sortDir, toggleSort } = useSortableTable<SortKey>('red');

  useEffect(() => {
    (async () => {
      const all = await (window as any).api.getAllSolvents();
      setSolvents(all);
    })();
  }, []);

  const canEvaluate = selectedGroup && selectedGroup.parts.length > 0 && !loading;

  const handleEvaluate = async () => {
    if (!selectedGroup || selectedGroup.parts.length === 0) return;
    const part = selectedGroup.parts[0]; // PCM代表
    const ids = solvents.map((s: any) => s.id);
    await evaluate(part.hsp, part.r0, ids);
  };

  const handleExportCsv = () => exportCsv(result);

  const sortedResults = useMemo(() => {
    if (!Array.isArray(result)) return [];
    const items = [...result];
    items.sort((a: any, b: any) => {
      let cmp = 0;
      switch (sortKey) {
        case 'shellMaterialName': cmp = (a.shellMaterialName ?? '').localeCompare(b.shellMaterialName ?? '', 'ja'); break;
        case 'ra': cmp = (a.ra ?? 0) - (b.ra ?? 0); break;
        case 'red': cmp = (a.red ?? 0) - (b.red ?? 0); break;
        case 'level': cmp = (a.level ?? 0) - (b.level ?? 0); break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return items;
  }, [result, sortKey, sortDir]);

  // RED境界警告
  const warnings = useMemo(() => {
    if (!Array.isArray(result)) return [];
    return getRedBoundaryWarnings(
      result.map((r: any) => ({ red: r.red, name: r.shellMaterialName }))
    );
  }, [result]);

  // 統計サマリー
  const stats = useMemo(() => {
    if (!Array.isArray(result) || result.length === 0) return null;
    const total = result.length;
    const excellent = result.filter((r: any) => r.level === PCMEncapsulationLevel.Excellent).length;
    const bestRed = Math.max(...result.map((r: any) => r.red));
    const bestMat = result.find((r: any) => r.red === bestRed);
    return { total, excellent, bestRed, bestMaterialName: bestMat?.shellMaterialName ?? '-' };
  }, [result]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">PCMカプセル化スクリーニング</h2>
        <p className="text-xs text-gray-500 mb-4">
          相変化材料(PCM)に対するシェル材の安定性をRED値で評価します。RED値が大きいほどカプセルが安定です。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <PartsGroupSelector
            onSelect={(g) => { setSelectedGroup(g); clear(); }}
            selected={selectedGroup}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleEvaluate}
            disabled={!canEvaluate}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '評価中...' : 'PCMカプセル化スクリーニング'}
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
            pipeline="pcmEncapsulation"
            params={{ partsGroupId: selectedGroup?.id }}
            disabled={!selectedGroup}
          />
        </div>
      </div>

      {/* エラー表示 */}
      {(error || csvError) && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error || csvError}
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

      {/* 統計サマリー */}
      {stats && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
              <div className="text-gray-500">評価シェル材数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.excellent}</div>
              <div className="text-gray-500">優秀</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.bestRed.toFixed(3)}</div>
              <div className="text-gray-500">最大RED値</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800 truncate">{stats.bestMaterialName}</div>
              <div className="text-gray-500">最適シェル材</div>
            </div>
          </div>
        </div>
      )}

      {/* 結果テーブル */}
      {sortedResults.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800">
              カプセル化適合性結果: {selectedGroup?.name}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <SortTableHeader label="シェル材名" field="shellMaterialName" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="Ra" field="ra" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="RED" field="red" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="カプセル安定性" field="level" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedResults.map((r: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-3 py-2.5 text-sm font-medium text-gray-900">{r.shellMaterialName ?? '-'}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.ra?.toFixed(3) ?? '-'}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.red?.toFixed(3) ?? '-'}</td>
                    <td className="px-3 py-2.5">
                      <GenericLevelBadge level={r.level ?? 1} config={BADGE_CONFIG} />
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
