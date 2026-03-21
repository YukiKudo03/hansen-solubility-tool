import React, { useState } from 'react';
import EmulsionStabilityBadge from './EmulsionStabilityBadge';
import BookmarkButton from './BookmarkButton';
import { useCosmeticEmulsion } from '../hooks/useCosmeticEmulsion';

export default function CosmeticEmulsionView() {
  // 油相（ミネラルオイル）
  const [oilDD, setOilDD] = useState(16.0);
  const [oilDP, setOilDP] = useState(0.0);
  const [oilDH, setOilDH] = useState(0.0);
  // 乳化剤（Tween 80）
  const [emDD, setEmDD] = useState(17.0);
  const [emDP, setEmDP] = useState(3.2);
  const [emDH, setEmDH] = useState(8.4);
  // 水相
  const [waterDD, setWaterDD] = useState(15.5);
  const [waterDP, setWaterDP] = useState(16.0);
  const [waterDH, setWaterDH] = useState(42.3);

  const { result, loading, error, evaluate, clear } = useCosmeticEmulsion();

  const handleEvaluate = async () => {
    await evaluate(
      { deltaD: oilDD, deltaP: oilDP, deltaH: oilDH },
      { deltaD: emDD, deltaP: emDP, deltaH: emDH },
      { deltaD: waterDD, deltaP: waterDP, deltaH: waterDH },
    );
  };

  const emulsionTypeLabel = result?.emulsionType === 'OW' ? 'O/W (水中油滴)' : result?.emulsionType === 'WO' ? 'W/O (油中水滴)' : '-';

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">化粧品エマルション安定性</h2>
        <p className="text-xs text-gray-500 mb-4">
          油相・乳化剤・水相の3成分HSPからエマルション型（O/W or W/O）と安定性を評価します。
        </p>

        <div className="space-y-4 mb-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">油相HSP</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">dD</label>
                <input type="number" step="0.1" value={oilDD} onChange={(e) => setOilDD(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">dP</label>
                <input type="number" step="0.1" value={oilDP} onChange={(e) => setOilDP(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">dH</label>
                <input type="number" step="0.1" value={oilDH} onChange={(e) => setOilDH(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">乳化剤HSP</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">dD</label>
                <input type="number" step="0.1" value={emDD} onChange={(e) => setEmDD(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">dP</label>
                <input type="number" step="0.1" value={emDP} onChange={(e) => setEmDP(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">dH</label>
                <input type="number" step="0.1" value={emDH} onChange={(e) => setEmDH(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">水相HSP</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">dD</label>
                <input type="number" step="0.1" value={waterDD} onChange={(e) => setWaterDD(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">dP</label>
                <input type="number" step="0.1" value={waterDP} onChange={(e) => setWaterDP(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">dH</label>
                <input type="number" step="0.1" value={waterDH} onChange={(e) => setWaterDH(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={handleEvaluate} disabled={loading}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {loading ? '評価中...' : 'エマルション安定性評価'}
          </button>
          <BookmarkButton pipeline="cosmeticEmulsion" params={{ oilDD, oilDP, oilDH, emDD, emDP, emDH, waterDD, waterDP, waterDH }} disabled={false} />
        </div>
      </div>

      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">{error}</div>
      )}

      {result && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">エマルション安定性評価結果</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-500">エマルション型</p>
              <p className="text-lg font-semibold text-gray-800">{emulsionTypeLabel}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">安定性</p>
              <EmulsionStabilityBadge level={result.stability ?? 'Unstable'} />
            </div>
            <div>
              <p className="text-xs text-gray-500">支配的Ra</p>
              <p className="text-lg font-semibold text-gray-800">{result.dominantRa?.toFixed(3) ?? '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Ra (油-乳化剤)</p>
              <p className="text-sm text-gray-700">{result.raOilEmulsifier?.toFixed(3) ?? '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Ra (乳化剤-水)</p>
              <p className="text-sm text-gray-700">{result.raEmulsifierWater?.toFixed(3) ?? '-'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
