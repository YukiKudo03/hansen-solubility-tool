import React, { useState } from 'react';
import AdhesionStrengthBadge from './AdhesionStrengthBadge';
import BookmarkButton from './BookmarkButton';
import { useSurfaceTreatmentQuantification } from '../hooks/useSurfaceTreatmentQuantification';

export default function SurfaceTreatmentQuantificationView() {
  const [befD, setBefD] = useState(18.0);
  const [befP, setBefP] = useState(0.5);
  const [befH, setBefH] = useState(1.0);
  const [aftD, setAftD] = useState(17.5);
  const [aftP, setAftP] = useState(5.0);
  const [aftH, setAftH] = useState(6.0);
  const [tgtD, setTgtD] = useState(17.0);
  const [tgtP, setTgtP] = useState(8.0);
  const [tgtH, setTgtH] = useState(10.0);

  const { result, loading, error, evaluate, clear } = useSurfaceTreatmentQuantification();

  const handleEvaluate = async () => {
    await evaluate({
      beforeHSP: { deltaD: befD, deltaP: befP, deltaH: befH },
      afterHSP: { deltaD: aftD, deltaP: aftP, deltaH: aftH },
      targetHSP: { deltaD: tgtD, deltaP: tgtP, deltaH: tgtH },
    });
  };

  const HSPInputGroup = ({ label, d, p, h, setD, setP, setH }: {
    label: string; d: number; p: number; h: number;
    setD: (v: number) => void; setP: (v: number) => void; setH: (v: number) => void;
  }) => (
    <div>
      <h3 className="text-sm font-medium text-gray-700 mb-2">{label}</h3>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-xs text-gray-500 mb-1">deltaD</label>
          <input type="number" step="0.1" value={d} onChange={(e) => { setD(Number(e.target.value)); clear(); }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">deltaP</label>
          <input type="number" step="0.1" value={p} onChange={(e) => { setP(Number(e.target.value)); clear(); }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">deltaH</label>
          <input type="number" step="0.1" value={h} onChange={(e) => { setH(Number(e.target.value)); clear(); }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">表面処理効果定量評価</h2>
        <p className="text-xs text-gray-500 mb-4">
          表面処理前後のHSPとターゲット材料のHSPから、接着仕事(Wa)の改善率を定量評価します。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
          <HSPInputGroup label="処理前HSP" d={befD} p={befP} h={befH}
            setD={setBefD} setP={setBefP} setH={setBefH} />
          <HSPInputGroup label="処理後HSP" d={aftD} p={aftP} h={aftH}
            setD={setAftD} setP={setAftP} setH={setAftH} />
          <HSPInputGroup label="ターゲットHSP" d={tgtD} p={tgtP} h={tgtH}
            setD={setTgtD} setP={setTgtP} setH={setTgtH} />
        </div>

        <div className="flex gap-3">
          <button onClick={handleEvaluate} disabled={loading}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {loading ? '評価中...' : '表面処理効果評価'}
          </button>
          <BookmarkButton
            pipeline="surfaceTreatmentQuantification"
            params={{
              beforeHSP: { deltaD: befD, deltaP: befP, deltaH: befH },
              afterHSP: { deltaD: aftD, deltaP: aftP, deltaH: aftH },
              targetHSP: { deltaD: tgtD, deltaP: tgtP, deltaH: tgtH },
            }}
            disabled={false}
          />
        </div>
      </div>

      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">{error}</div>
      )}

      {result && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">評価結果</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="p-4 rounded-lg border border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">処理前</h4>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="text-xs text-gray-500">Wa</p>
                  <p className="text-lg font-bold text-gray-900">{result.waBefore?.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Ra</p>
                  <p className="text-lg font-bold text-gray-900">{result.raBefore?.toFixed(3)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">レベル</p>
                  <AdhesionStrengthBadge level={result.levelBefore} />
                </div>
              </div>
            </div>
            <div className="p-4 rounded-lg border border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">処理後</h4>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="text-xs text-gray-500">Wa</p>
                  <p className="text-lg font-bold text-gray-900">{result.waAfter?.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Ra</p>
                  <p className="text-lg font-bold text-gray-900">{result.raAfter?.toFixed(3)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">レベル</p>
                  <AdhesionStrengthBadge level={result.levelAfter} />
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm text-blue-800">
              <span className="font-bold">改善率:</span>{' '}
              <span className={`text-lg font-bold ${result.improvementRate >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {result.improvementRate >= 0 ? '+' : ''}{result.improvementRate?.toFixed(1)}%
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
