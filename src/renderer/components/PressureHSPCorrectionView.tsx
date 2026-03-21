import React, { useState } from 'react';
import BookmarkButton from './BookmarkButton';
import { usePressureHSPCorrection } from '../hooks/usePressureHSPCorrection';

export default function PressureHSPCorrectionView() {
  const [deltaD, setDeltaD] = useState(18.0);
  const [deltaP, setDeltaP] = useState(1.4);
  const [deltaH, setDeltaH] = useState(2.0);
  const [pressureRef, setPressureRef] = useState(0.1);
  const [pressureTarget, setPressureTarget] = useState(50);
  const [temperature, setTemperature] = useState(300);
  const [beta, setBeta] = useState(1e-3);

  const { result, loading, error, evaluate, clear } = usePressureHSPCorrection();

  const handleEvaluate = async () => {
    await evaluate({
      hsp: { deltaD, deltaP, deltaH },
      pressureRef,
      pressureTarget,
      temperature,
      isothermalCompressibility: beta,
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">圧力依存HSP補正ツール</h2>
        <p className="text-xs text-gray-500 mb-4">
          Tait式簡易版に基づき、圧力変化によるHSP値の変動を推算します。
          高圧プロセスでの溶媒特性の変化を定量評価できます。
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">dD (MPa^0.5)</label>
            <input type="number" step="0.1" value={deltaD} onChange={(e) => setDeltaD(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">dP (MPa^0.5)</label>
            <input type="number" step="0.1" value={deltaP} onChange={(e) => setDeltaP(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">dH (MPa^0.5)</label>
            <input type="number" step="0.1" value={deltaH} onChange={(e) => setDeltaH(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <div className="col-span-1" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">基準圧力 (MPa)</label>
            <input type="number" step="0.1" value={pressureRef} onChange={(e) => setPressureRef(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">目標圧力 (MPa)</label>
            <input type="number" step="1" value={pressureTarget} onChange={(e) => setPressureTarget(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">温度 (K)</label>
            <input type="number" step="1" value={temperature} onChange={(e) => setTemperature(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">等温圧縮率 (1/MPa)</label>
            <input type="number" step="0.0001" value={beta} onChange={(e) => setBeta(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
        </div>

        <div className="flex gap-3 mb-4">
          <button onClick={handleEvaluate} disabled={loading}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {loading ? '計算中...' : '圧力補正を実行'}
          </button>
          <BookmarkButton pipeline="pressureHspCorrection" params={{
            hsp: { deltaD, deltaP, deltaH }, pressureRef, pressureTarget, temperature, isothermalCompressibility: beta,
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-600 mb-3">元のHSP ({result.pressureRef.toFixed(1)} MPa)</h3>
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-sm text-gray-600">dD</span><span className="font-mono text-sm">{result.original.deltaD.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-600">dP</span><span className="font-mono text-sm">{result.original.deltaP.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-600">dH</span><span className="font-mono text-sm">{result.original.deltaH.toFixed(2)}</span></div>
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="text-sm font-semibold text-blue-700 mb-3">補正後HSP ({result.pressureTarget.toFixed(1)} MPa)</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">dD</span>
                  <span className="font-mono text-sm font-semibold">{result.corrected.deltaD.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">dP</span>
                  <span className="font-mono text-sm font-semibold">{result.corrected.deltaP.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">dH</span>
                  <span className="font-mono text-sm font-semibold">{result.corrected.deltaH.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
