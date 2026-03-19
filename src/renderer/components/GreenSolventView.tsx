/**
 * グリーン溶媒代替提案 — 規制対象溶媒の安全な代替候補表示
 */
import React, { useState, useMemo, useCallback } from 'react';
import type { Solvent } from '../../core/types';
import SolventSelector from './SolventSelector';
import SortTableHeader from './SortTableHeader';

type SafetyRating = 'recommended' | 'acceptable' | 'problematic' | 'hazardous' | 'banned';

interface GreenSolventResult {
  solventName: string;
  ra: number;
  safetyRating: SafetyRating;
  environmentScore: number;
  healthScore: number;
  overallScore: number;
}

const SAFETY_BADGE: Record<SafetyRating, { bg: string; text: string; label: string }> = {
  recommended: { bg: 'bg-green-100', text: 'text-green-800', label: '推奨' },
  acceptable:  { bg: 'bg-blue-100', text: 'text-blue-800', label: '許容' },
  problematic: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '要注意' },
  hazardous:   { bg: 'bg-red-100', text: 'text-red-800', label: '危険' },
  banned:      { bg: 'bg-red-200', text: 'text-red-900', label: '禁止' },
};

type SortKey = 'solventName' | 'ra' | 'safetyRating' | 'environmentScore' | 'healthScore' | 'overallScore';

const SAFETY_ORDER: Record<SafetyRating, number> = {
  recommended: 5,
  acceptable: 4,
  problematic: 3,
  hazardous: 2,
  banned: 1,
};

export default function GreenSolventView() {
  const [selectedSolvent, setSelectedSolvent] = useState<Solvent | null>(null);

  const [results, setResults] = useState<GreenSolventResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [hasResult, setHasResult] = useState(false);

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

  const canSearch = selectedSolvent && !loading;

  const clear = useCallback(() => {
    setResults([]);
    setError(null);
    setHasResult(false);
  }, []);

  const handleSearch = async () => {
    if (!selectedSolvent) return;
    setLoading(true);
    setError(null);
    try {
      const res = await window.api.invoke('greenSolvent:find', selectedSolvent.id, 20);
      setResults(res as GreenSolventResult[]);
      setHasResult(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : '代替溶媒検索中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = async () => {
    setCsvError(null);
    const header = '溶媒名,Ra (HSP距離),安全性評価,環境スコア,健康スコア,総合スコア';
    const rows = results.map(
      (r) => `"${r.solventName}",${r.ra.toFixed(3)},${r.safetyRating},${r.environmentScore.toFixed(3)},${r.healthScore.toFixed(3)},${r.overallScore.toFixed(3)}`
    );
    const csv = [header, ...rows].join('\n');
    try {
      await window.api.saveCsv(csv);
    } catch (e) {
      setCsvError(e instanceof Error ? e.message : 'CSV保存中にエラーが発生しました');
    }
  };

  const sortedResults = useMemo(() => {
    const items = [...results];
    items.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'solventName':
          cmp = a.solventName.localeCompare(b.solventName, 'ja');
          break;
        case 'ra':
          cmp = a.ra - b.ra;
          break;
        case 'safetyRating':
          cmp = SAFETY_ORDER[a.safetyRating] - SAFETY_ORDER[b.safetyRating];
          break;
        case 'environmentScore':
          cmp = a.environmentScore - b.environmentScore;
          break;
        case 'healthScore':
          cmp = a.healthScore - b.healthScore;
          break;
        case 'overallScore':
          cmp = a.overallScore - b.overallScore;
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return items;
  }, [results, sortKey, sortDir]);

  return (
    <div className="space-y-6">
      {/* 設定エリア */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">グリーン溶媒代替提案</h2>
        <p className="text-xs text-gray-500 mb-4">
          規制対象や環境負荷の高い溶媒に対して、HSP距離の近い安全な代替候補を提示します。
        </p>

        <div className="max-w-md mb-4">
          <SolventSelector
            onSelect={(s) => { setSelectedSolvent(s); clear(); }}
            selected={selectedSolvent}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSearch}
            disabled={!canSearch}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '検索中...' : '代替溶媒を検索'}
          </button>
          {hasResult && results.length > 0 && (
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
      {hasResult && results.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800">
              代替候補: {selectedSolvent?.name} の代替溶媒 ({results.length}件)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <SortTableHeader label="溶媒名" field="solventName" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="Ra (HSP距離)" field="ra" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="安全性評価" field="safetyRating" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="環境スコア" field="environmentScore" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="健康スコア" field="healthScore" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="総合スコア" field="overallScore" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedResults.map((r, idx) => {
                  const badge = SAFETY_BADGE[r.safetyRating];
                  return (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-3 py-2.5 text-sm font-medium text-gray-900">{r.solventName}</td>
                      <td className="px-3 py-2.5 text-sm text-gray-500">{r.ra.toFixed(3)}</td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-sm text-gray-500">{r.environmentScore.toFixed(3)}</td>
                      <td className="px-3 py-2.5 text-sm text-gray-500">{r.healthScore.toFixed(3)}</td>
                      <td className="px-3 py-2.5 text-sm font-medium text-gray-900">{r.overallScore.toFixed(3)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {hasResult && results.length === 0 && (
        <div className="bg-white rounded-lg shadow p-6 text-center text-sm text-gray-500">
          代替候補が見つかりませんでした。
        </div>
      )}
    </div>
  );
}
