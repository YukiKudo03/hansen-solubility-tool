import React, { useState, useMemo, useEffect } from 'react';
import { LigandExchangeLevel } from '../../core/quantum-dot-ligand-exchange';
import { formatQDLigandExchangeCsv } from '../../core/report';
import { getRedBoundaryWarnings } from '../../core/accuracy-warnings';
import GenericLevelBadge from './GenericLevelBadge';
import type { BadgeLevelConfig } from './GenericLevelBadge';
import SortTableHeader from './SortTableHeader';
import BookmarkButton from './BookmarkButton';
import { useQuantumDotLigand } from '../hooks/useQuantumDotLigand';
import { useCsvExport } from '../hooks/useCsvExport';
import { useSortableTable } from '../hooks/useSortableTable';

const BADGE_CONFIG: Record<string | number, BadgeLevelConfig> = {
  [LigandExchangeLevel.Excellent]: { label: '優秀', bg: 'bg-green-100', text: 'text-green-800' },
  [LigandExchangeLevel.Good]: { label: '良好', bg: 'bg-teal-100', text: 'text-teal-800' },
  [LigandExchangeLevel.Fair]: { label: '可能', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  [LigandExchangeLevel.Poor]: { label: '不良', bg: 'bg-orange-100', text: 'text-orange-800' },
  [LigandExchangeLevel.Bad]: { label: '不適', bg: 'bg-red-100', text: 'text-red-800' },
};

type SortKey = 'solventName' | 'ra' | 'red' | 'level';

export default function QuantumDotLigandView() {
  const [qdD, setQdD] = useState(17.0);
  const [qdP, setQdP] = useState(5.0);
  const [qdH, setQdH] = useState(5.0);
  const [qdR0, setQdR0] = useState(5.0);
  const [solvents, setSolvents] = useState<any[]>([]);

  const { result, loading, error, evaluate, clear } = useQuantumDotLigand();
  const { csvError, exportCsv } = useCsvExport(formatQDLigandExchangeCsv);
  const { sortKey, sortDir, toggleSort } = useSortableTable<SortKey>('red');

  useEffect(() => {
    (async () => {
      const all = await (window as any).api.getAllSolvents();
      setSolvents(all);
    })();
  }, []);

  const handleEvaluate = async () => {
    const ids = solvents.map((s: any) => s.id);
    await evaluate({ deltaD: qdD, deltaP: qdP, deltaH: qdH }, qdR0, ids);
  };

  const handleExportCsv = () => exportCsv(result);

  const sortedResults = useMemo(() => {
    if (!Array.isArray(result)) return [];
    const items = [...result];
    items.sort((a: any, b: any) => {
      let cmp = 0;
      switch (sortKey) {
        case 'solventName': cmp = (a.solventName ?? '').localeCompare(b.solventName ?? '', 'ja'); break;
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
      result.map((r: any) => ({ red: r.red, name: r.solventName }))
    );
  }, [result]);

  // 統計サマリー
  const stats = useMemo(() => {
    if (!Array.isArray(result) || result.length === 0) return null;
    const total = result.length;
    const good = result.filter((r: any) => r.red < 1.0).length;
    const bestRed = Math.min(...result.map((r: any) => r.red));
    const bestSolvent = result.find((r: any) => r.red === bestRed);
    return { total, good, bestRed, bestSolventName: bestSolvent?.solventName ?? '-' };
  }, [result]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">量子ドットリガンド交換溶媒スクリーニング</h2>
        <p className="text-xs text-gray-500 mb-4">
          QDのHSP球に対してRED計算し、分散安定性を維持しながらリガンド交換に適した溶媒を選定します。
          RED値が小さいほど適合性が高くなります。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">量子ドットHSP</h3>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">deltaD</label>
                <input type="number" step="0.1" value={qdD} onChange={(e) => { setQdD(Number(e.target.value)); clear(); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">deltaP</label>
                <input type="number" step="0.1" value={qdP} onChange={(e) => { setQdP(Number(e.target.value)); clear(); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">deltaH</label>
                <input type="number" step="0.1" value={qdH} onChange={(e) => { setQdH(Number(e.target.value)); clear(); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">相互作用半径</h3>
            <div>
              <label className="block text-xs text-gray-500 mb-1">R0</label>
              <input type="number" step="0.1" value={qdR0} onChange={(e) => { setQdR0(Number(e.target.value)); clear(); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleEvaluate}
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'スクリーニング中...' : '全溶媒スクリーニング'}
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
            pipeline="quantumDotLigand"
            params={{ qdHSP: { deltaD: qdD, deltaP: qdP, deltaH: qdH }, qdR0 }}
            disabled={false}
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
              <div className="text-gray-500">評価溶媒数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.good}</div>
              <div className="text-gray-500">適合 (RED &lt; 1.0)</div>
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

      {/* 結果テーブル */}
      {sortedResults.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800">
              リガンド交換溶媒スクリーニング結果
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <SortTableHeader label="溶媒名" field="solventName" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="Ra" field="ra" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="RED" field="red" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="適合性" field="level" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedResults.map((r: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-3 py-2.5 text-sm font-medium text-gray-900">{r.solventName ?? '-'}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.ra?.toFixed(3) ?? '-'}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.red?.toFixed(3) ?? '-'}</td>
                    <td className="px-3 py-2.5">
                      <GenericLevelBadge level={r.level ?? 5} config={BADGE_CONFIG} />
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
