/**
 * HSP球算出 — 溶解試験データから最適なHSP球を算出
 */
import React, { useState, useEffect, useMemo } from 'react';

interface SolventEntry {
  id: number;
  name: string;
  hsp: { deltaD: number; deltaP: number; deltaH: number };
}

interface SphereFitResult {
  center: { deltaD: number; deltaP: number; deltaH: number };
  r0: number;
  fitness: number;
  correct: number;
  total: number;
  misclassified: Array<{ solventName: string; expected: 'good' | 'bad'; actual: 'inside' | 'outside' }>;
}

export default function SphereFittingView() {
  const [solvents, setSolvents] = useState<SolventEntry[]>([]);
  const [classifications, setClassifications] = useState<Record<number, 'good' | 'bad'>>({});
  const [result, setResult] = useState<SphereFitResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [solventsLoading, setSolventsLoading] = useState(true);

  // 溶媒一覧を取得
  useEffect(() => {
    const load = async () => {
      setSolventsLoading(true);
      try {
        const all = await window.api.invoke('solvents:getAll');
        setSolvents(all as SolventEntry[]);
      } catch (e) {
        setError(e instanceof Error ? e.message : '溶媒データの読み込みに失敗しました');
      } finally {
        setSolventsLoading(false);
      }
    };
    load();
  }, []);

  // 分類カウント
  const goodCount = useMemo(
    () => Object.values(classifications).filter((v) => v === 'good').length,
    [classifications]
  );
  const badCount = useMemo(
    () => Object.values(classifications).filter((v) => v === 'bad').length,
    [classifications]
  );
  const canFit = goodCount >= 3 && badCount >= 1 && !loading;

  // 検索フィルタ
  const filteredSolvents = useMemo(() => {
    if (!searchQuery.trim()) return solvents;
    const q = searchQuery.toLowerCase();
    return solvents.filter((s) => s.name.toLowerCase().includes(q));
  }, [solvents, searchQuery]);

  const handleCycleClassification = (id: number) => {
    setClassifications((prev) => {
      const current = prev[id];
      const next = { ...prev };
      if (!current) {
        next[id] = 'good';
      } else if (current === 'good') {
        next[id] = 'bad';
      } else {
        delete next[id];
      }
      return next;
    });
    setResult(null);
  };

  const handleFit = async () => {
    setLoading(true);
    setError(null);
    try {
      const fitResult = await window.api.invoke('sphereFitting:fit', classifications);
      setResult(fitResult as SphereFitResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'HSP球算出中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = () => {
    setClassifications({});
    setResult(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">HSP球算出 (スフィアフィッティング)</h2>
        <p className="text-xs text-gray-500 mb-4">
          溶解試験結果(良溶媒/貧溶媒)からHansen球の中心座標と半径R₀を最適化します。
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左: 溶媒リスト */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700">
                溶媒分類 (Good: {goodCount}, Bad: {badCount})
              </h3>
              <button
                onClick={handleClearAll}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
              >
                全解除
              </button>
            </div>

            {/* 検索 */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="溶媒名で検索..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500 mb-2"
            />

            {solventsLoading ? (
              <p className="text-sm text-gray-400">読み込み中...</p>
            ) : (
              <div className="border border-gray-200 rounded-md max-h-96 overflow-y-auto">
                {filteredSolvents.map((s) => {
                  const cls = classifications[s.id];
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleCycleClassification(s.id)}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm border-b border-gray-100 last:border-b-0 text-left hover:bg-gray-50 transition-colors ${
                        cls === 'good' ? 'bg-green-50' : cls === 'bad' ? 'bg-red-50' : ''
                      }`}
                    >
                      <span className="flex-shrink-0 w-5 text-center">
                        {cls === 'good' && <span className="text-green-600 font-bold">&#10003;</span>}
                        {cls === 'bad' && <span className="text-red-600 font-bold">&#10007;</span>}
                        {!cls && <span className="text-gray-300">-</span>}
                      </span>
                      <span className="truncate">{s.name}</span>
                      <span className="ml-auto text-xs text-gray-400 flex-shrink-0">
                        {s.hsp.deltaD.toFixed(1)} / {s.hsp.deltaP.toFixed(1)} / {s.hsp.deltaH.toFixed(1)}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {goodCount < 3 && (
              <p className="text-xs text-amber-600 mt-1">Good溶媒を3種類以上選択してください。</p>
            )}
            {badCount < 1 && goodCount >= 3 && (
              <p className="text-xs text-amber-600 mt-1">Bad溶媒を1種類以上選択してください。</p>
            )}
          </div>

          {/* 右: 結果表示 */}
          <div>
            <div className="mb-4">
              <button
                onClick={handleFit}
                disabled={!canFit}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? '算出中...' : 'HSP球を算出'}
              </button>
            </div>

            {/* エラー */}
            {error && (
              <div role="alert" className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm mb-4">
                {error}
              </div>
            )}

            {/* 結果 */}
            {result && (
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">算出結果</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">中心 δD:</span>{' '}
                      <span className="font-medium">{result.center.deltaD.toFixed(2)} MPa½</span>
                    </div>
                    <div>
                      <span className="text-gray-500">中心 δP:</span>{' '}
                      <span className="font-medium">{result.center.deltaP.toFixed(2)} MPa½</span>
                    </div>
                    <div>
                      <span className="text-gray-500">中心 δH:</span>{' '}
                      <span className="font-medium">{result.center.deltaH.toFixed(2)} MPa½</span>
                    </div>
                    <div>
                      <span className="text-gray-500">R₀:</span>{' '}
                      <span className="font-medium">{result.r0.toFixed(2)} MPa½</span>
                    </div>
                    <div>
                      <span className="text-gray-500">正解率:</span>{' '}
                      <span className="font-medium">{result.correct} / {result.total}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">適合度:</span>{' '}
                      <span className="font-medium">{(result.fitness * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                {/* 誤分類リスト */}
                {result.misclassified.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-yellow-800 mb-2">
                      誤分類 ({result.misclassified.length}件)
                    </h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {result.misclassified.map((m, i) => (
                        <li key={i}>
                          {m.solventName}: 期待={m.expected === 'good' ? 'Good (球内)' : 'Bad (球外)'}, 実際={m.actual === 'inside' ? '球内' : '球外'}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
