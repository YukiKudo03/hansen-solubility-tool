import React, { useState, useEffect } from 'react';
import BookmarkButton from './BookmarkButton';
import { useMulticomponentOptimization } from '../hooks/useMulticomponentOptimization';

export default function MulticomponentOptimizationView() {
  const [deltaD, setDeltaD] = useState(18.5);
  const [deltaP, setDeltaP] = useState(4.5);
  const [deltaH, setDeltaH] = useState(2.9);
  const [numComponents, setNumComponents] = useState(4);
  const [solvents, setSolvents] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const { result, loading, error, evaluate, clear } = useMulticomponentOptimization();

  useEffect(() => {
    (window as any).api.getAllSolvents().then((data: any[]) => setSolvents(data));
  }, []);

  const canEvaluate = selectedIds.length >= 2 && !loading;

  const handleEvaluate = async () => {
    await evaluate({ deltaD, deltaP, deltaH }, selectedIds, numComponents);
  };

  const handleSelectAll = () => setSelectedIds(solvents.map((s) => s.id));
  const handleDeselectAll = () => { setSelectedIds([]); clear(); };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">多成分溶媒最適化</h2>
        <p className="text-xs text-gray-500 mb-4">
          差分進化法(DE)により、ターゲットHSPに最も近いブレンドを4-6成分で最適化します。
        </p>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target dD</label>
            <input type="number" step="0.1" value={deltaD} onChange={(e) => setDeltaD(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target dP</label>
            <input type="number" step="0.1" value={deltaP} onChange={(e) => setDeltaP(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target dH</label>
            <input type="number" step="0.1" value={deltaH} onChange={(e) => setDeltaH(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">成分数</label>
            <select value={numComponents} onChange={(e) => setNumComponents(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option value={4}>4</option>
              <option value={5}>5</option>
              <option value={6}>6</option>
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">溶媒候補（溶媒DB）</label>
          <div className="flex gap-2 mb-2">
            <button onClick={handleSelectAll} className="text-xs text-blue-600 hover:underline">全選択</button>
            <button onClick={handleDeselectAll} className="text-xs text-blue-600 hover:underline">全解除</button>
          </div>
          <select multiple value={selectedIds.map(String)} onChange={(e) => setSelectedIds(Array.from(e.target.selectedOptions, (o) => Number(o.value)))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm h-32">
            {solvents.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-3">
          <button onClick={handleEvaluate} disabled={!canEvaluate}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {loading ? '最適化中...' : '多成分最適化実行'}
          </button>
          <BookmarkButton pipeline="multicomponentOptimization" params={{ deltaD, deltaP, deltaH, numComponents, solventIds: selectedIds }} disabled={selectedIds.length < 2} />
        </div>
      </div>

      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">{error}</div>
      )}

      {result && result.components && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800">最適化結果 (Ra: {result.ra?.toFixed(3)})</h3>
            <p className="text-xs text-gray-500 mt-1">
              ブレンドHSP: dD={result.blendHSP?.deltaD?.toFixed(2)}, dP={result.blendHSP?.deltaP?.toFixed(2)}, dH={result.blendHSP?.deltaH?.toFixed(2)}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">溶媒名</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">体積分率</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">dD</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">dP</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">dH</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {result.components.map((c: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-3 py-2.5 text-sm font-medium text-gray-900">{c.name}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{(c.fraction * 100).toFixed(1)}%</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{c.hsp?.deltaD?.toFixed(1)}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{c.hsp?.deltaP?.toFixed(1)}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{c.hsp?.deltaH?.toFixed(1)}</td>
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
