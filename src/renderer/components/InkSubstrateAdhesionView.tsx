import React, { useState } from 'react';
import AdhesionStrengthBadge from './AdhesionStrengthBadge';
import BookmarkButton from './BookmarkButton';
import { useInkSubstrateAdhesion } from '../hooks/useInkSubstrateAdhesion';

export default function InkSubstrateAdhesionView() {
  const [inkD, setInkD] = useState(17.4);
  const [inkP, setInkP] = useState(3.1);
  const [inkH, setInkH] = useState(4.7);
  const [subD, setSubD] = useState(18.0);
  const [subP, setSubP] = useState(1.0);
  const [subH, setSubH] = useState(2.0);

  const { result, loading, error, evaluate, clear } = useInkSubstrateAdhesion();

  const handleEvaluate = async () => {
    await evaluate({
      inkHSP: { deltaD: inkD, deltaP: inkP, deltaH: inkH },
      substrateHSP: { deltaD: subD, deltaP: subP, deltaH: subH },
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">インク-基材密着評価</h2>
        <p className="text-xs text-gray-500 mb-4">
          接着仕事(Wa)に基づき、インクと基材のHSPから密着性を評価します。
          Waが大きいほど密着性が良好です。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">インクHSP</h3>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">deltaD</label>
                <input type="number" step="0.1" value={inkD} onChange={(e) => { setInkD(Number(e.target.value)); clear(); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">deltaP</label>
                <input type="number" step="0.1" value={inkP} onChange={(e) => { setInkP(Number(e.target.value)); clear(); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">deltaH</label>
                <input type="number" step="0.1" value={inkH} onChange={(e) => { setInkH(Number(e.target.value)); clear(); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">基材HSP</h3>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">deltaD</label>
                <input type="number" step="0.1" value={subD} onChange={(e) => { setSubD(Number(e.target.value)); clear(); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">deltaP</label>
                <input type="number" step="0.1" value={subP} onChange={(e) => { setSubP(Number(e.target.value)); clear(); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">deltaH</label>
                <input type="number" step="0.1" value={subH} onChange={(e) => { setSubH(Number(e.target.value)); clear(); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={handleEvaluate} disabled={loading}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {loading ? '評価中...' : '密着性評価'}
          </button>
          <BookmarkButton
            pipeline="inkSubstrateAdhesion"
            params={{ inkHSP: { deltaD: inkD, deltaP: inkP, deltaH: inkH }, substrateHSP: { deltaD: subD, deltaP: subP, deltaH: subH } }}
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500">接着仕事 Wa</p>
              <p className="text-lg font-bold text-gray-900">{result.wa?.toFixed(2)} mJ/m2</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">HSP距離 Ra</p>
              <p className="text-lg font-bold text-gray-900">{result.ra?.toFixed(3)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">密着レベル</p>
              <AdhesionStrengthBadge level={result.level} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
