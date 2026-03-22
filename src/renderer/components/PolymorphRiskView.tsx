import React, { useState, useEffect, useMemo } from 'react';
import BookmarkButton from './BookmarkButton';

const RISK_COLORS: Record<number, string> = {
  1: 'bg-red-100 text-red-800',       // DissolutionRisk
  2: 'bg-orange-100 text-orange-800',  // HighRisk
  3: 'bg-yellow-100 text-yellow-800',  // MediumRisk
  4: 'bg-green-100 text-green-800',    // LowRisk
};

const RISK_LABELS: Record<number, string> = {
  1: '溶解リスク',
  2: '高リスク',
  3: '中リスク',
  4: '低リスク',
};

interface SolventItem {
  id: number;
  name: string;
}

interface PolymorphResult {
  solvent: { name: string; hsp: { deltaD: number; deltaP: number; deltaH: number } };
  ra: number;
  red: number;
  riskLevel: number;
}

type SortKey = 'name' | 'ra' | 'red' | 'risk';

export default function PolymorphRiskView() {
  const [apiD, setApiD] = useState(18.0);
  const [apiP, setApiP] = useState(8.0);
  const [apiH, setApiH] = useState(10.0);
  const [r0, setR0] = useState(8.0);

  const [solvents, setSolvents] = useState<SolventItem[]>([]);
  const [solventsLoading, setSolventsLoading] = useState(true);
  const [results, setResults] = useState<PolymorphResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sortKey, setSortKey] = useState<SortKey>('red');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [filterRisk, setFilterRisk] = useState<number | null>(null);

  // 溶媒一覧取得
  useEffect(() => {
    const load = async () => {
      setSolventsLoading(true);
      try {
        const list = await (window as any).api.getAllSolvents();
        setSolvents(list.map((s: any) => ({ id: s.id, name: s.name })));
      } catch (e) {
        setError(e instanceof Error ? e.message : '溶媒一覧の取得に失敗しました');
      } finally {
        setSolventsLoading(false);
      }
    };
    load();
  }, []);

  const handleScreen = async () => {
    setLoading(true);
    setError(null);
    try {
      const ids = solvents.map((s) => s.id);
      const res = await (window as any).api.evaluatePolymorphRisk(
        { deltaD: apiD, deltaP: apiP, deltaH: apiH },
        r0,
        ids,
      );
      setResults(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'スクリーニング中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortedResults = useMemo(() => {
    if (!results) return [];
    let items = [...results];
    if (filterRisk !== null) {
      items = items.filter((r) => r.riskLevel === filterRisk);
    }
    items.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'name':
          cmp = a.solvent.name.localeCompare(b.solvent.name, 'ja');
          break;
        case 'ra':
          cmp = a.ra - b.ra;
          break;
        case 'red':
          cmp = a.red - b.red;
          break;
        case 'risk':
          cmp = a.riskLevel - b.riskLevel;
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return items;
  }, [results, sortKey, sortDir, filterRisk]);

  // リスク分布集計
  const riskCounts = useMemo(() => {
    if (!results) return {};
    const counts: Record<number, number> = {};
    for (const r of results) {
      counts[r.riskLevel] = (counts[r.riskLevel] ?? 0) + 1;
    }
    return counts;
  }, [results]);

  const SortHeader = ({ label, field }: { label: string; field: SortKey }) => (
    <th
      className="px-3 py-2 text-left text-xs font-medium text-gray-500 cursor-pointer hover:text-gray-700 select-none"
      onClick={() => toggleSort(field)}
    >
      {label} {sortKey === field ? (sortDir === 'asc' ? '\u25B2' : '\u25BC') : ''}
    </th>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">多形/溶媒和物リスク評価</h2>
        <p className="text-xs text-gray-500 mb-4">
          原薬(API)のHSPとR0を入力し、全溶媒に対してRED値を計算。RED中間帯(0.5-1.5)が多形変換・溶媒和物形成の高リスクゾーンです。
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">API deltaD</label>
            <input type="number" step="0.1" value={apiD}
              onChange={(e) => { setApiD(Number(e.target.value)); setResults(null); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">API deltaP</label>
            <input type="number" step="0.1" value={apiP}
              onChange={(e) => { setApiP(Number(e.target.value)); setResults(null); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">API deltaH</label>
            <input type="number" step="0.1" value={apiH}
              onChange={(e) => { setApiH(Number(e.target.value)); setResults(null); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">R0</label>
            <input type="number" step="0.1" value={r0}
              onChange={(e) => { setR0(Number(e.target.value)); setResults(null); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={handleScreen} disabled={loading || solventsLoading}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {loading ? 'スクリーニング中...' : solventsLoading ? '溶媒読込中...' : '全溶媒スクリーニング'}
          </button>
          <BookmarkButton
            pipeline="polymorphRisk"
            params={{ apiHSP: { deltaD: apiD, deltaP: apiP, deltaH: apiH }, r0 }}
            disabled={false}
          />
        </div>
      </div>

      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">{error}</div>
      )}

      {results && results.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">
            スクリーニング結果 ({sortedResults.length}/{results.length}件)
          </h3>

          {/* リスク分布バッジ */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setFilterRisk(null)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filterRisk === null ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              全て ({results.length})
            </button>
            {[1, 2, 3, 4].map((level) => (
              riskCounts[level] ? (
                <button
                  key={level}
                  onClick={() => setFilterRisk(filterRisk === level ? null : level)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    filterRisk === level ? 'ring-2 ring-offset-1 ring-gray-400' : ''
                  } ${RISK_COLORS[level]}`}
                >
                  {RISK_LABELS[level]} ({riskCounts[level]})
                </button>
              ) : null
            ))}
          </div>

          {/* 結果テーブル */}
          <div className="border border-gray-200 rounded-md overflow-auto max-h-96">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <SortHeader label="溶媒" field="name" />
                  <SortHeader label="Ra" field="ra" />
                  <SortHeader label="RED" field="red" />
                  <SortHeader label="リスク" field="risk" />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {sortedResults.map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-sm text-gray-700">{r.solvent.name}</td>
                    <td className="px-3 py-2 text-sm text-gray-700 text-right">{r.ra.toFixed(3)}</td>
                    <td className="px-3 py-2 text-sm text-gray-700 text-right font-mono">{r.red.toFixed(3)}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${RISK_COLORS[r.riskLevel] ?? 'bg-gray-100 text-gray-800'}`}>
                        {RISK_LABELS[r.riskLevel] ?? `Level ${r.riskLevel}`}
                      </span>
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
