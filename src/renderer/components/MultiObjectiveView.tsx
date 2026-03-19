/**
 * 多目的溶媒選定 — 複数基準による溶媒スクリーニング
 */
import React, { useState, useMemo, useCallback } from 'react';
import type { MultiObjectiveScreeningResult, MultiObjectiveResult } from '../../core/multi-objective';
import SortTableHeader from './SortTableHeader';

type SortKey = 'solventName' | 'red' | 'hspScore' | 'boilingPointScore' | 'viscosityScore' | 'safetyScore' | 'overallScore';

function scoreColor(score: number): string {
  if (score > 0.8) return 'text-green-700 font-medium';
  if (score > 0.6) return 'text-teal-700';
  if (score > 0.4) return 'text-yellow-700';
  return 'text-red-700';
}

export default function MultiObjectiveView() {
  // ターゲットHSP
  const [targetDeltaD, setTargetDeltaD] = useState('');
  const [targetDeltaP, setTargetDeltaP] = useState('');
  const [targetDeltaH, setTargetDeltaH] = useState('');
  const [r0, setR0] = useState('');

  // 物性制約
  const [minBoilingPoint, setMinBoilingPoint] = useState('');
  const [maxBoilingPoint, setMaxBoilingPoint] = useState('');
  const [maxViscosity, setMaxViscosity] = useState('');
  const [maxSurfaceTension, setMaxSurfaceTension] = useState('');

  // 重み
  const [weightHsp, setWeightHsp] = useState(0.4);
  const [weightBp, setWeightBp] = useState(0.15);
  const [weightViscosity, setWeightViscosity] = useState(0.15);
  const [weightSurfaceTension, setWeightSurfaceTension] = useState(0.1);
  const [weightSafety, setWeightSafety] = useState(0.2);

  // 結果
  const [results, setResults] = useState<MultiObjectiveResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasResult, setHasResult] = useState(false);

  // ソート
  const [sortKey, setSortKey] = useState<SortKey>('overallScore');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const toggleSort = useCallback((field: string) => {
    const key = field as SortKey;
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }, [sortKey]);

  const weightSum = weightHsp + weightBp + weightViscosity + weightSurfaceTension + weightSafety;
  const weightWarning = Math.abs(weightSum - 1.0) > 0.05;

  const canScreen =
    targetDeltaD !== '' &&
    targetDeltaP !== '' &&
    targetDeltaH !== '' &&
    r0 !== '' &&
    !loading;

  const handleScreen = async () => {
    const dD = parseFloat(targetDeltaD);
    const dP = parseFloat(targetDeltaP);
    const dH = parseFloat(targetDeltaH);
    const r = parseFloat(r0);
    if (isNaN(dD) || isNaN(dP) || isNaN(dH) || isNaN(r)) return;

    setLoading(true);
    setError(null);
    try {
      const response = await window.api.screenMultiObjective({
        targetDeltaD: dD,
        targetDeltaP: dP,
        targetDeltaH: dH,
        r0: r,
        preferredBoilingPointRange: minBoilingPoint || maxBoilingPoint
          ? { min: minBoilingPoint ? Number(minBoilingPoint) : -Infinity, max: maxBoilingPoint ? Number(maxBoilingPoint) : Infinity }
          : undefined,
        maxViscosity: maxViscosity ? Number(maxViscosity) : undefined,
        maxSurfaceTension: maxSurfaceTension ? Number(maxSurfaceTension) : undefined,
        weights: {
          hspMatch: weightHsp,
          boilingPoint: weightBp,
          viscosity: weightViscosity,
          surfaceTension: weightSurfaceTension,
          safety: weightSafety,
          cost: 0.0,
        },
      });
      setResults(response.results);
      setHasResult(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'スクリーニング中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const sortedResults = useMemo(() => {
    const items = [...results];
    items.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'solventName':
          cmp = a.solvent.name.localeCompare(b.solvent.name, 'ja');
          break;
        case 'red':
          cmp = a.red - b.red;
          break;
        case 'hspScore':
          cmp = a.scores.hspMatch - b.scores.hspMatch;
          break;
        case 'boilingPointScore':
          cmp = a.scores.boilingPoint - b.scores.boilingPoint;
          break;
        case 'viscosityScore':
          cmp = a.scores.viscosity - b.scores.viscosity;
          break;
        case 'safetyScore':
          cmp = a.scores.safety - b.scores.safety;
          break;
        case 'overallScore':
          cmp = a.scores.overall - b.scores.overall;
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
        <h2 className="text-lg font-semibold text-gray-800 mb-4">多目的溶媒選定</h2>
        <p className="text-xs text-gray-500 mb-4">
          HSP適合性・物性・安全性を複合的に評価し、最適な溶媒を選定します。
        </p>

        {/* ターゲットHSP + R₀ */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">ターゲットHSP</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">δD (MPa½)</label>
              <input
                type="number"
                step="0.1"
                value={targetDeltaD}
                onChange={(e) => { setTargetDeltaD(e.target.value); setHasResult(false); }}
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
                onChange={(e) => { setTargetDeltaP(e.target.value); setHasResult(false); }}
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
                onChange={(e) => { setTargetDeltaH(e.target.value); setHasResult(false); }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="例: 12.0"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">R₀ (MPa½)</label>
              <input
                type="number"
                step="0.1"
                value={r0}
                onChange={(e) => { setR0(e.target.value); setHasResult(false); }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="例: 8.0"
              />
            </div>
          </div>
        </div>

        {/* 物性制約 */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">物性制約 (任意)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">最低沸点 (°C)</label>
              <input type="number" value={minBoilingPoint} onChange={(e) => setMinBoilingPoint(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" placeholder="例: 60" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">最高沸点 (°C)</label>
              <input type="number" value={maxBoilingPoint} onChange={(e) => setMaxBoilingPoint(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" placeholder="例: 200" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">最大粘度 (mPa·s)</label>
              <input type="number" value={maxViscosity} onChange={(e) => setMaxViscosity(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" placeholder="例: 2.0" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">最大表面張力 (mN/m)</label>
              <input type="number" value={maxSurfaceTension} onChange={(e) => setMaxSurfaceTension(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" placeholder="例: 30" />
            </div>
          </div>
        </div>

        {/* 重みスライダー */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">重み設定</h3>
            <span className={`text-xs ${weightWarning ? 'text-amber-600 font-medium' : 'text-gray-400'}`}>
              合計: {weightSum.toFixed(2)} {weightWarning && '(1.0に近づけてください)'}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { label: 'HSP適合性', value: weightHsp, setter: setWeightHsp },
              { label: '沸点', value: weightBp, setter: setWeightBp },
              { label: '粘度', value: weightViscosity, setter: setWeightViscosity },
              { label: '表面張力', value: weightSurfaceTension, setter: setWeightSurfaceTension },
              { label: '安全性', value: weightSafety, setter: setWeightSafety },
            ].map(({ label, value, setter }) => (
              <div key={label}>
                <label className="block text-xs text-gray-500 mb-1">
                  {label}: {value.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={value}
                  onChange={(e) => { setter(parseFloat(e.target.value)); setHasResult(false); }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 実行ボタン */}
        <div className="flex gap-3">
          <button
            onClick={handleScreen}
            disabled={!canScreen}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'スクリーニング中...' : 'スクリーニング実行'}
          </button>
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* 結果テーブル */}
      {hasResult && results.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800">
              スクリーニング結果 ({results.length}件)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <SortTableHeader label="溶媒名" field="solventName" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="RED" field="red" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="HSPスコア" field="hspScore" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="沸点スコア" field="boilingPointScore" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="粘度スコア" field="viscosityScore" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="安全性スコア" field="safetyScore" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="総合スコア" field="overallScore" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedResults.map((r, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-3 py-2.5 text-sm font-medium text-gray-900">{r.solvent.name}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.red.toFixed(3)}</td>
                    <td className={`px-3 py-2.5 text-sm ${scoreColor(r.scores.hspMatch)}`}>{r.scores.hspMatch.toFixed(3)}</td>
                    <td className={`px-3 py-2.5 text-sm ${scoreColor(r.scores.boilingPoint)}`}>{r.scores.boilingPoint.toFixed(3)}</td>
                    <td className={`px-3 py-2.5 text-sm ${scoreColor(r.scores.viscosity)}`}>{r.scores.viscosity.toFixed(3)}</td>
                    <td className={`px-3 py-2.5 text-sm ${scoreColor(r.scores.safety)}`}>{r.scores.safety.toFixed(3)}</td>
                    <td className={`px-3 py-2.5 text-sm font-bold ${scoreColor(r.scores.overall)}`}>{r.scores.overall.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {hasResult && results.length === 0 && (
        <div className="bg-white rounded-lg shadow p-6 text-center text-sm text-gray-500">
          条件に一致する溶媒が見つかりませんでした。制約条件を緩和してください。
        </div>
      )}
    </div>
  );
}
