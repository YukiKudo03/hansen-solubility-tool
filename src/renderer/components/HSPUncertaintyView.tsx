/**
 * HSP不確かさ定量化 — ブートストラップ法でHSP球フィッティングを繰り返し、95%信頼区間を算出
 */
import React, { useState, useEffect, useMemo } from 'react';
import BookmarkButton from './BookmarkButton';
import { useHSPUncertainty } from '../hooks/useHSPUncertainty';

interface SolventEntry {
  id: number;
  name: string;
  hsp: { deltaD: number; deltaP: number; deltaH: number };
}

export default function HSPUncertaintyView() {
  const [solvents, setSolvents] = useState<SolventEntry[]>([]);
  const [classifications, setClassifications] = useState<Record<number, 'good' | 'bad'>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [solventsLoading, setSolventsLoading] = useState(true);
  const [numSamples, setNumSamples] = useState(100);

  const { result, loading, error, bootstrap, clear } = useHSPUncertainty();

  // 溶媒一覧を取得
  useEffect(() => {
    const load = async () => {
      setSolventsLoading(true);
      try {
        const all = await (window as any).api.getAllSolvents();
        setSolvents(all as SolventEntry[]);
      } catch {
        // ignore
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
  const canRun = goodCount >= 3 && badCount >= 1 && !loading;

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
    clear();
  };

  const handleBootstrap = async () => {
    const classificationArray = Object.entries(classifications).map(([idStr, cls]) => ({
      solventId: Number(idStr),
      isGood: cls === 'good',
    }));
    await bootstrap({ classifications: classificationArray, numSamples });
  };

  const handleClearAll = () => {
    setClassifications({});
    clear();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">HSP不確かさ定量化</h2>
        <p className="text-xs text-gray-500 mb-4">
          ブートストラップ法でHSP球フィッティングを繰り返し実行し、HSP中心値とR0の95%信頼区間を算出します。
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

          {/* 右: 設定 + 結果表示 */}
          <div>
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-600 mb-1">ブートストラップ回数</label>
              <input
                type="number"
                min={10}
                max={10000}
                step={10}
                value={numSamples}
                onChange={(e) => setNumSamples(Number(e.target.value))}
                className="w-32 px-2 py-1.5 border border-gray-300 rounded-md text-sm"
              />
            </div>

            <div className="flex gap-3 mb-4">
              <button
                onClick={handleBootstrap}
                disabled={!canRun}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'ブートストラップ実行中...' : 'ブートストラップ実行'}
              </button>
              <BookmarkButton
                pipeline="hspUncertainty"
                params={{ classifications, numSamples }}
                disabled={!canRun}
              />
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
                {/* 中心値 */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">HSP中心値 + R0</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">dD:</span>{' '}
                      <span className="font-medium">{result.center?.deltaD?.toFixed(2)} MPa^1/2</span>
                    </div>
                    <div>
                      <span className="text-gray-500">dP:</span>{' '}
                      <span className="font-medium">{result.center?.deltaP?.toFixed(2)} MPa^1/2</span>
                    </div>
                    <div>
                      <span className="text-gray-500">dH:</span>{' '}
                      <span className="font-medium">{result.center?.deltaH?.toFixed(2)} MPa^1/2</span>
                    </div>
                    <div>
                      <span className="text-gray-500">R0:</span>{' '}
                      <span className="font-medium">{result.r0?.toFixed(2)} MPa^1/2</span>
                    </div>
                  </div>
                </div>

                {/* 95%信頼区間 */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-green-800 mb-3">95%信頼区間 (N={result.numSamples})</h4>
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase pb-2">パラメータ</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase pb-2">下限 (2.5%)</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase pb-2">中心値</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase pb-2">上限 (97.5%)</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase pb-2">幅</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-green-100">
                      {[
                        { label: 'dD', ci: result.confidence95?.deltaD, center: result.center?.deltaD },
                        { label: 'dP', ci: result.confidence95?.deltaP, center: result.center?.deltaP },
                        { label: 'dH', ci: result.confidence95?.deltaH, center: result.center?.deltaH },
                        { label: 'R0', ci: result.confidence95?.r0, center: result.r0 },
                      ].map(({ label, ci, center }) => (
                        <tr key={label}>
                          <td className="py-1.5 font-medium text-gray-700">{label}</td>
                          <td className="py-1.5 text-gray-600">{ci?.low?.toFixed(2)}</td>
                          <td className="py-1.5 font-medium text-green-800">{center?.toFixed(2)}</td>
                          <td className="py-1.5 text-gray-600">{ci?.high?.toFixed(2)}</td>
                          <td className="py-1.5 text-gray-500">{ci ? (ci.high - ci.low).toFixed(2) : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="text-xs text-gray-400">
                  分類データ数: {result.numClassifications}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
