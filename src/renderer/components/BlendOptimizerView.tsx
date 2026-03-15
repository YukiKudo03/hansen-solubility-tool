import React, { useState, useMemo } from 'react';
import { formatBlendOptimizationCsv } from '../../core/report';
import { useSolvents } from '../hooks/useSolvents';
import { useBlendOptimizer } from '../hooks/useBlendOptimizer';

export default function BlendOptimizerView() {
  const { solvents, loading: solventsLoading } = useSolvents();
  const { result, loading: optimizing, error, optimize, clear } = useBlendOptimizer();

  // ターゲットHSP入力
  const [targetDeltaD, setTargetDeltaD] = useState<string>('');
  const [targetDeltaP, setTargetDeltaP] = useState<string>('');
  const [targetDeltaH, setTargetDeltaH] = useState<string>('');

  // 候補溶媒チェックボックス
  const [selectedSolventIds, setSelectedSolventIds] = useState<Set<number>>(new Set());

  // 設定
  const [maxComponents, setMaxComponents] = useState<2 | 3>(2);
  const [stepSize, setStepSize] = useState<string>('0.05');
  const [topN, setTopN] = useState<string>('20');

  const [csvError, setCsvError] = useState<string | null>(null);

  const canOptimize =
    targetDeltaD !== '' &&
    targetDeltaP !== '' &&
    targetDeltaH !== '' &&
    selectedSolventIds.size >= 2 &&
    !optimizing;

  const handleToggleSolvent = (id: number) => {
    setSelectedSolventIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    clear();
  };

  const handleSelectAll = () => {
    setSelectedSolventIds(new Set(solvents.map((s) => s.id)));
    clear();
  };

  const handleClearAll = () => {
    setSelectedSolventIds(new Set());
    clear();
  };

  const handleOptimize = async () => {
    const dD = parseFloat(targetDeltaD);
    const dP = parseFloat(targetDeltaP);
    const dH = parseFloat(targetDeltaH);
    const step = parseFloat(stepSize);
    const top = parseInt(topN, 10);

    if (isNaN(dD) || isNaN(dP) || isNaN(dH) || isNaN(step) || isNaN(top)) return;

    await optimize({
      targetDeltaD: dD,
      targetDeltaP: dP,
      targetDeltaH: dH,
      candidateSolventIds: Array.from(selectedSolventIds),
      maxComponents,
      stepSize: step,
      topN: top,
    });
  };

  const handleExportCsv = async () => {
    if (!result) return;
    setCsvError(null);
    const csv = formatBlendOptimizationCsv(result);
    try {
      await window.api.saveCsv(csv);
    } catch (e) {
      setCsvError(e instanceof Error ? e.message : 'CSV保存中にエラーが発生しました');
    }
  };

  return (
    <div className="space-y-6">
      {/* 設定エリア */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">溶剤ブレンド最適化</h2>
        <p className="text-xs text-gray-500 mb-4">
          ターゲットHSPに最も近いブレンド組成を候補溶媒から探索します。
        </p>

        {/* ターゲットHSP入力 */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">ターゲットHSP</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">δD (MPa½)</label>
              <input
                type="number"
                step="0.1"
                value={targetDeltaD}
                onChange={(e) => { setTargetDeltaD(e.target.value); clear(); }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="例: 18.0"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">δP (MPa½)</label>
              <input
                type="number"
                step="0.1"
                value={targetDeltaP}
                onChange={(e) => { setTargetDeltaP(e.target.value); clear(); }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="例: 10.0"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">δH (MPa½)</label>
              <input
                type="number"
                step="0.1"
                value={targetDeltaH}
                onChange={(e) => { setTargetDeltaH(e.target.value); clear(); }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="例: 12.0"
              />
            </div>
          </div>
        </div>

        {/* 最適化パラメータ */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">最適化設定</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* maxComponents */}
            <div>
              <label className="block text-xs text-gray-500 mb-2">最大成分数</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="maxComponents"
                    value="2"
                    checked={maxComponents === 2}
                    onChange={() => { setMaxComponents(2); clear(); }}
                    className="text-blue-600"
                  />
                  2成分
                </label>
                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="maxComponents"
                    value="3"
                    checked={maxComponents === 3}
                    onChange={() => { setMaxComponents(3); clear(); }}
                    className="text-blue-600"
                  />
                  3成分
                </label>
              </div>
            </div>

            {/* stepSize */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">ステップサイズ</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="0.5"
                value={stepSize}
                onChange={(e) => { setStepSize(e.target.value); clear(); }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">混合比の刻み幅 (例: 0.05 = 5%)</p>
            </div>

            {/* topN */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">上位件数</label>
              <input
                type="number"
                step="1"
                min="1"
                max="100"
                value={topN}
                onChange={(e) => { setTopN(e.target.value); clear(); }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* 候補溶媒選択 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">
              候補溶媒 ({selectedSolventIds.size} / {solvents.length} 選択中)
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handleSelectAll}
                disabled={solventsLoading}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
              >
                全選択
              </button>
              <button
                onClick={handleClearAll}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
              >
                全解除
              </button>
            </div>
          </div>
          {solventsLoading ? (
            <p className="text-sm text-gray-400">読み込み中...</p>
          ) : (
            <div className="border border-gray-200 rounded-md max-h-48 overflow-y-auto p-2 grid grid-cols-2 md:grid-cols-3 gap-1">
              {solvents.map((s) => (
                <label key={s.id} className="flex items-center gap-1.5 text-xs cursor-pointer hover:bg-gray-50 px-1 py-0.5 rounded">
                  <input
                    type="checkbox"
                    checked={selectedSolventIds.has(s.id)}
                    onChange={() => handleToggleSolvent(s.id)}
                    className="rounded border-gray-300 text-blue-600"
                  />
                  <span className="truncate">{s.name}</span>
                </label>
              ))}
            </div>
          )}
          {selectedSolventIds.size < 2 && (
            <p className="text-xs text-amber-600 mt-1">2種類以上の溶媒を選択してください。</p>
          )}
        </div>

        {/* 実行ボタン */}
        <div className="flex gap-3">
          <button
            onClick={handleOptimize}
            disabled={!canOptimize}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {optimizing ? '最適化中...' : 'ブレンド最適化実行'}
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
      {result && result.topResults.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800">
              最適化結果 (ターゲット: δD={result.targetHSP.deltaD.toFixed(1)}, δP={result.targetHSP.deltaP.toFixed(1)}, δH={result.targetHSP.deltaH.toFixed(1)})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">順位</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">成分 (体積分率)</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ブレンド δD</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ブレンド δP</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ブレンド δH</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ra</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {result.topResults.map((r, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-3 py-2.5 text-sm font-medium text-gray-900">{idx + 1}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-700">
                      {r.components.map((c, ci) => (
                        <span key={ci}>
                          {ci > 0 && <span className="text-gray-400"> + </span>}
                          <span className="font-medium">{c.solvent.name}</span>
                          <span className="text-gray-500"> ({(c.volumeFraction * 100).toFixed(0)}%)</span>
                        </span>
                      ))}
                    </td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.blendHSP.deltaD.toFixed(2)}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.blendHSP.deltaP.toFixed(2)}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.blendHSP.deltaH.toFixed(2)}</td>
                    <td className="px-3 py-2.5 text-sm font-medium text-gray-900">{r.ra.toFixed(3)}</td>
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
