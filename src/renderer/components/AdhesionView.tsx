/**
 * 接着性予測 — 接着剤/基材ペアのHSP距離による接着強度予測
 */
import React, { useState, useMemo, useCallback } from 'react';
import type { PartsGroup, Solvent } from '../../core/types';
import { AdhesionLevel } from '../../core/adhesion';
import PartsGroupSelector from './PartsGroupSelector';
import SolventSelector from './SolventSelector';
import SortTableHeader from './SortTableHeader';

interface AdhesionResultItem {
  part: { id: number; name: string; materialType?: string };
  ra: number;
  adhesionLevel: AdhesionLevel;
}

interface AdhesionResult {
  partsGroup: { id: number; name: string };
  solvent: { id: number; name: string };
  results: AdhesionResultItem[];
}

const ADHESION_BADGE: Record<number, { bg: string; text: string; label: string }> = {
  [AdhesionLevel.Excellent]: { bg: 'bg-green-100', text: 'text-green-800', label: '優秀' },
  [AdhesionLevel.Good]:      { bg: 'bg-teal-100', text: 'text-teal-800', label: '良好' },
  [AdhesionLevel.Fair]:      { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '普通' },
  [AdhesionLevel.Poor]:      { bg: 'bg-orange-100', text: 'text-orange-800', label: '不良' },
  [AdhesionLevel.Failed]:    { bg: 'bg-red-100', text: 'text-red-800', label: '不可' },
};

type SortKey = 'partName' | 'ra' | 'adhesionLevel';

const LEVEL_ORDER: Record<number, number> = {
  [AdhesionLevel.Excellent]: 5,
  [AdhesionLevel.Good]: 4,
  [AdhesionLevel.Fair]: 3,
  [AdhesionLevel.Poor]: 2,
  [AdhesionLevel.Failed]: 1,
};

export default function AdhesionView() {
  const [selectedGroup, setSelectedGroup] = useState<PartsGroup | null>(null);
  const [selectedSolvent, setSelectedSolvent] = useState<Solvent | null>(null);

  const [result, setResult] = useState<AdhesionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [csvError, setCsvError] = useState<string | null>(null);

  // ソート
  const [sortKey, setSortKey] = useState<SortKey>('ra');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const toggleSort = useCallback((field: string) => {
    const key = field as SortKey;
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }, [sortKey]);

  const canEvaluate = selectedGroup && selectedSolvent && !loading;

  const clear = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  const handleEvaluate = async () => {
    if (!selectedGroup || !selectedSolvent) return;
    setLoading(true);
    setError(null);
    try {
      const evalResult = await window.api.evaluateAdhesion(selectedGroup.id, selectedSolvent.id);
      setResult(evalResult as AdhesionResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : '接着性評価中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = async () => {
    if (!result) return;
    setCsvError(null);
    const header = '部品名,Ra,接着性レベル';
    const rows = result.results.map(
      (r) => `"${r.part.name}",${r.ra.toFixed(3)},${r.adhesionLevel}`
    );
    const csv = [header, ...rows].join('\n');
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
        case 'ra':
          cmp = a.ra - b.ra;
          break;
        case 'adhesionLevel':
          cmp = (LEVEL_ORDER[a.adhesionLevel] ?? 0) - (LEVEL_ORDER[b.adhesionLevel] ?? 0);
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
        <h2 className="text-lg font-semibold text-gray-800 mb-4">接着性予測</h2>
        <p className="text-xs text-gray-500 mb-4">
          HSP距離(Ra)に基づき、接着剤と基材の接着強度を予測します。Ra値が小さいほど接着性が高くなります。
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
            {loading ? '評価中...' : '接着性評価'}
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
                  <SortTableHeader label="部品名" field="partName" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="Ra" field="ra" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="接着性レベル" field="adhesionLevel" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedResults.map((r) => {
                  const badge = ADHESION_BADGE[r.adhesionLevel] ?? { bg: 'bg-gray-100', text: 'text-gray-800', label: '不明' };
                  return (
                    <tr key={r.part.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2.5 text-sm font-medium text-gray-900">{r.part.name}</td>
                      <td className="px-3 py-2.5 text-sm text-gray-500">{r.ra.toFixed(3)}</td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                          {badge.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
