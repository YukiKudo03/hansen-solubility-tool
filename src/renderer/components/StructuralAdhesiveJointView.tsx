import React, { useState } from 'react';
import AdhesionStrengthBadge from './AdhesionStrengthBadge';
import BookmarkButton from './BookmarkButton';
import { useStructuralAdhesiveJoint } from '../hooks/useStructuralAdhesiveJoint';

export default function StructuralAdhesiveJointView() {
  const [glueD, setGlueD] = useState(17.0);
  const [glueP, setGlueP] = useState(8.0);
  const [glueH, setGlueH] = useState(10.0);
  const [adh1D, setAdh1D] = useState(18.0);
  const [adh1P, setAdh1P] = useState(1.0);
  const [adh1H, setAdh1H] = useState(2.0);
  const [adh2D, setAdh2D] = useState(16.0);
  const [adh2P, setAdh2P] = useState(10.0);
  const [adh2H, setAdh2H] = useState(12.0);

  const { result, loading, error, evaluate, clear } = useStructuralAdhesiveJoint();

  const handleEvaluate = async () => {
    await evaluate({
      adhesiveHSP: { deltaD: glueD, deltaP: glueP, deltaH: glueH },
      adherend1HSP: { deltaD: adh1D, deltaP: adh1P, deltaH: adh1H },
      adherend2HSP: { deltaD: adh2D, deltaP: adh2P, deltaH: adh2H },
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
        <h2 className="text-lg font-semibold text-gray-800 mb-4">構造接着設計評価</h2>
        <p className="text-xs text-gray-500 mb-4">
          接着剤と2つの被着体のHSPから、両界面の接着仕事(Wa)を計算し、
          ボトルネック(弱い側)を特定します。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
          <HSPInputGroup label="接着剤HSP" d={glueD} p={glueP} h={glueH}
            setD={setGlueD} setP={setGlueP} setH={setGlueH} />
          <HSPInputGroup label="被着体1 HSP" d={adh1D} p={adh1P} h={adh1H}
            setD={setAdh1D} setP={setAdh1P} setH={setAdh1H} />
          <HSPInputGroup label="被着体2 HSP" d={adh2D} p={adh2P} h={adh2H}
            setD={setAdh2D} setP={setAdh2P} setH={setAdh2H} />
        </div>

        <div className="flex gap-3">
          <button onClick={handleEvaluate} disabled={loading}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {loading ? '評価中...' : '構造接着評価'}
          </button>
          <BookmarkButton
            pipeline="structuralAdhesiveJoint"
            params={{
              adhesiveHSP: { deltaD: glueD, deltaP: glueP, deltaH: glueH },
              adherend1HSP: { deltaD: adh1D, deltaP: adh1P, deltaH: adh1H },
              adherend2HSP: { deltaD: adh2D, deltaP: adh2P, deltaH: adh2H },
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-4 rounded-lg border ${result.bottleneckSide === 1 ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                接着剤 - 被着体1
                {result.bottleneckSide === 1 && <span className="ml-2 text-red-600 font-bold text-xs">ボトルネック</span>}
              </h4>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="text-xs text-gray-500">Wa</p>
                  <p className="text-lg font-bold text-gray-900">{result.wa1?.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Ra</p>
                  <p className="text-lg font-bold text-gray-900">{result.ra1?.toFixed(3)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">レベル</p>
                  <AdhesionStrengthBadge level={result.level1} />
                </div>
              </div>
            </div>
            <div className={`p-4 rounded-lg border ${result.bottleneckSide === 2 ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                接着剤 - 被着体2
                {result.bottleneckSide === 2 && <span className="ml-2 text-red-600 font-bold text-xs">ボトルネック</span>}
              </h4>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="text-xs text-gray-500">Wa</p>
                  <p className="text-lg font-bold text-gray-900">{result.wa2?.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Ra</p>
                  <p className="text-lg font-bold text-gray-900">{result.ra2?.toFixed(3)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">レベル</p>
                  <AdhesionStrengthBadge level={result.level2} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
