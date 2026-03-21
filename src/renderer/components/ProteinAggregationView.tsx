import React, { useState } from 'react';
import ProteinStabilityBadge from './ProteinStabilityBadge';
import BookmarkButton from './BookmarkButton';
import { useProteinAggregation } from '../hooks/useProteinAggregation';

export default function ProteinAggregationView() {
  const [protDeltaD, setProtDeltaD] = useState(17.5);
  const [protDeltaP, setProtDeltaP] = useState(10.0);
  const [protDeltaH, setProtDeltaH] = useState(15.0);
  const [bufDeltaD, setBufDeltaD] = useState(15.5);
  const [bufDeltaP, setBufDeltaP] = useState(16.0);
  const [bufDeltaH, setBufDeltaH] = useState(42.3);
  const [bufR0, setBufR0] = useState(10.0);

  const { result, loading, error, evaluate, clear } = useProteinAggregation();

  const handleEvaluate = async () => {
    await evaluate({
      proteinSurfaceHSP: { deltaD: protDeltaD, deltaP: protDeltaP, deltaH: protDeltaH },
      bufferHSP: { deltaD: bufDeltaD, deltaP: bufDeltaP, deltaH: bufDeltaH },
      bufferR0: bufR0,
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">タンパク質凝集リスク評価</h2>
        <p className="text-xs text-gray-500 mb-4">
          HSPに基づき、タンパク質の緩衝液中での凝集リスクを評価します。
          RED値が低いほどタンパク質表面が溶媒和され安定です。
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">タンパク質表面 dD</label>
            <input type="number" step="0.1" value={protDeltaD} onChange={(e) => setProtDeltaD(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">タンパク質表面 dP</label>
            <input type="number" step="0.1" value={protDeltaP} onChange={(e) => setProtDeltaP(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">タンパク質表面 dH</label>
            <input type="number" step="0.1" value={protDeltaH} onChange={(e) => setProtDeltaH(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <div className="col-span-1" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">緩衝液 dD</label>
            <input type="number" step="0.1" value={bufDeltaD} onChange={(e) => setBufDeltaD(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">緩衝液 dP</label>
            <input type="number" step="0.1" value={bufDeltaP} onChange={(e) => setBufDeltaP(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">緩衝液 dH</label>
            <input type="number" step="0.1" value={bufDeltaH} onChange={(e) => setBufDeltaH(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">緩衝液 R0</label>
            <input type="number" step="0.1" value={bufR0} onChange={(e) => setBufR0(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={handleEvaluate} disabled={loading}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {loading ? '評価中...' : 'タンパク質凝集リスク評価'}
          </button>
          <BookmarkButton pipeline="proteinAggregation" params={{
            proteinSurfaceHSP: { deltaD: protDeltaD, deltaP: protDeltaP, deltaH: protDeltaH },
            bufferHSP: { deltaD: bufDeltaD, deltaP: bufDeltaP, deltaH: bufDeltaH },
            bufferR0: bufR0,
          }} disabled={false} />
        </div>
      </div>

      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">{error}</div>
      )}

      {result && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">タンパク質凝集リスク結果</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="text-xs text-gray-500">Ra</span>
              <p className="text-lg font-semibold">{result.ra?.toFixed(3) ?? '-'}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500">RED</span>
              <p className="text-lg font-semibold">{result.red?.toFixed(3) ?? '-'}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500">安定性</span>
              <div className="mt-1"><ProteinStabilityBadge level={result.stability ?? 'HighRisk'} /></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
