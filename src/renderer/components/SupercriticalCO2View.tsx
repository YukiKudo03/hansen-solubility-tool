import React, { useState, useCallback } from 'react';
import BookmarkButton from './BookmarkButton';
import { useSupercriticalCO2 } from '../hooks/useSupercriticalCO2';

interface CosolventEntry {
  name: string;
  deltaD: number;
  deltaP: number;
  deltaH: number;
}

const PRESET_COSOLVENTS: CosolventEntry[] = [
  { name: 'エタノール', deltaD: 15.8, deltaP: 8.8, deltaH: 19.4 },
  { name: 'メタノール', deltaD: 14.7, deltaP: 12.3, deltaH: 22.3 },
  { name: 'アセトン', deltaD: 15.5, deltaP: 10.4, deltaH: 7.0 },
  { name: '酢酸エチル', deltaD: 15.8, deltaP: 5.3, deltaH: 7.2 },
  { name: 'イソプロパノール', deltaD: 15.8, deltaP: 6.1, deltaH: 16.4 },
  { name: '水', deltaD: 15.5, deltaP: 16.0, deltaH: 42.3 },
];

export default function SupercriticalCO2View() {
  const [targetDeltaD, setTargetDeltaD] = useState(19.5);
  const [targetDeltaP, setTargetDeltaP] = useState(10.1);
  const [targetDeltaH, setTargetDeltaH] = useState(13.0);
  const [targetR0, setTargetR0] = useState(8.0);
  const [pressure, setPressure] = useState(20);
  const [temperature, setTemperature] = useState(313);
  const [selectedCosolvents, setSelectedCosolvents] = useState<Set<number>>(new Set([0, 1]));

  const { result, loading, error, evaluate, clear } = useSupercriticalCO2();

  const toggleCosolvent = useCallback((index: number) => {
    setSelectedCosolvents(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, []);

  const handleEvaluate = async () => {
    const cosolvents = Array.from(selectedCosolvents).map(i => ({
      name: PRESET_COSOLVENTS[i].name,
      hsp: {
        deltaD: PRESET_COSOLVENTS[i].deltaD,
        deltaP: PRESET_COSOLVENTS[i].deltaP,
        deltaH: PRESET_COSOLVENTS[i].deltaH,
      },
    }));
    if (cosolvents.length === 0) return;
    await evaluate({
      targetHSP: { deltaD: targetDeltaD, deltaP: targetDeltaP, deltaH: targetDeltaH },
      targetR0,
      pressure,
      temperature,
      cosolvents,
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">超臨界CO2共溶媒選定</h2>
        <p className="text-xs text-gray-500 mb-4">
          Giddings式に基づきscCO2のHSPを推定し、共溶媒添加によるターゲット物質への溶解力向上を評価します。
          CO2単独と各共溶媒・各分率でのRa/REDを比較できます。
        </p>

        {/* ターゲットHSP */}
        <h3 className="text-sm font-semibold text-gray-700 mb-2">ターゲット物質</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">dD</label>
            <input type="number" step="0.1" value={targetDeltaD} onChange={(e) => setTargetDeltaD(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">dP</label>
            <input type="number" step="0.1" value={targetDeltaP} onChange={(e) => setTargetDeltaP(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">dH</label>
            <input type="number" step="0.1" value={targetDeltaH} onChange={(e) => setTargetDeltaH(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">R0</label>
            <input type="number" step="0.1" value={targetR0} onChange={(e) => setTargetR0(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
        </div>

        {/* scCO2条件 */}
        <h3 className="text-sm font-semibold text-gray-700 mb-2">超臨界CO2条件</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">圧力 (MPa)</label>
            <input type="number" step="1" value={pressure} onChange={(e) => setPressure(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">温度 (K)</label>
            <input type="number" step="1" value={temperature} onChange={(e) => setTemperature(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
        </div>

        {/* 共溶媒選択 */}
        <h3 className="text-sm font-semibold text-gray-700 mb-2">共溶媒候補</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
          {PRESET_COSOLVENTS.map((c, i) => (
            <label key={i} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={selectedCosolvents.has(i)}
                onChange={() => toggleCosolvent(i)}
                className="rounded border-gray-300" />
              {c.name} ({c.deltaD}/{c.deltaP}/{c.deltaH})
            </label>
          ))}
        </div>

        <div className="flex gap-3 mb-4">
          <button onClick={handleEvaluate} disabled={loading || selectedCosolvents.size === 0}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {loading ? '評価中...' : '超臨界CO2評価'}
          </button>
          <BookmarkButton pipeline="supercriticalCO2" params={{
            targetHSP: { deltaD: targetDeltaD, deltaP: targetDeltaP, deltaH: targetDeltaH },
            targetR0, pressure, temperature,
          }} />
          {result && (
            <button onClick={clear}
              className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300 transition-colors">
              クリア
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {result && (
          <>
            {/* CO2メタデータ */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-200 mb-4">
              <h3 className="text-sm font-semibold text-green-700 mb-2">scCO2 条件 ({result.pressure} MPa, {result.temperature} K)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div>CO2 dD: <span className="font-mono">{result.co2HSP.deltaD.toFixed(2)}</span></div>
                <div>CO2 dP: <span className="font-mono">{result.co2HSP.deltaP.toFixed(2)}</span></div>
                <div>CO2 dH: <span className="font-mono">{result.co2HSP.deltaH.toFixed(2)}</span></div>
                <div>密度: <span className="font-mono">{result.co2Density.toFixed(0)}</span> kg/m3</div>
              </div>
            </div>

            {/* 結果テーブル */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-3 py-2 text-left border-b">共溶媒</th>
                    <th className="px-3 py-2 text-right border-b">分率</th>
                    <th className="px-3 py-2 text-right border-b">dD</th>
                    <th className="px-3 py-2 text-right border-b">dP</th>
                    <th className="px-3 py-2 text-right border-b">dH</th>
                    <th className="px-3 py-2 text-right border-b">Ra</th>
                    <th className="px-3 py-2 text-right border-b">RED</th>
                  </tr>
                </thead>
                <tbody>
                  {result.results.slice(0, 30).map((r, i) => (
                    <tr key={i} className={`${r.red < 1 ? 'bg-green-50' : ''} hover:bg-gray-50`}>
                      <td className="px-3 py-1.5 border-b text-gray-800">{r.cosolventName}</td>
                      <td className="px-3 py-1.5 border-b text-right font-mono">{(r.volumeFraction * 100).toFixed(0)}%</td>
                      <td className="px-3 py-1.5 border-b text-right font-mono">{r.blendHSP.deltaD.toFixed(2)}</td>
                      <td className="px-3 py-1.5 border-b text-right font-mono">{r.blendHSP.deltaP.toFixed(2)}</td>
                      <td className="px-3 py-1.5 border-b text-right font-mono">{r.blendHSP.deltaH.toFixed(2)}</td>
                      <td className="px-3 py-1.5 border-b text-right font-mono">{r.ra.toFixed(2)}</td>
                      <td className={`px-3 py-1.5 border-b text-right font-mono font-semibold ${r.red < 1 ? 'text-green-700' : r.red < 1.5 ? 'text-yellow-700' : 'text-red-700'}`}>
                        {r.red.toFixed(3)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
