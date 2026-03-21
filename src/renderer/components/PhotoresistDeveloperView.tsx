import React, { useState } from 'react';
import ContrastQualityBadge from './ContrastQualityBadge';
import BookmarkButton from './BookmarkButton';
import { usePhotoresistDeveloper } from '../hooks/usePhotoresistDeveloper';

export default function PhotoresistDeveloperView() {
  const [unD, setUnD] = useState(19.0);
  const [unP, setUnP] = useState(8.0);
  const [unH, setUnH] = useState(6.0);
  const [exD, setExD] = useState(18.0);
  const [exP, setExP] = useState(14.0);
  const [exH, setExH] = useState(12.0);
  const [devD, setDevD] = useState(15.5);
  const [devP, setDevP] = useState(16.0);
  const [devH, setDevH] = useState(42.3);

  const { result, loading, error, evaluate } = usePhotoresistDeveloper();

  const handleEvaluate = async () => {
    await evaluate(
      { deltaD: unD, deltaP: unP, deltaH: unH },
      { deltaD: exD, deltaP: exP, deltaH: exH },
      { deltaD: devD, deltaP: devP, deltaH: devH },
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">レジスト現像液適合性</h2>
        <p className="text-xs text-gray-500 mb-4">
          未露光/露光後レジストと現像液のHSPから溶解コントラストを計算し、パターニング品質を評価します。
        </p>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">未露光レジストHSP</h3>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="block text-xs text-gray-500 mb-1">dD</label><input type="number" step="0.1" value={unD} onChange={(e) => setUnD(Number(e.target.value))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" /></div>
              <div><label className="block text-xs text-gray-500 mb-1">dP</label><input type="number" step="0.1" value={unP} onChange={(e) => setUnP(Number(e.target.value))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" /></div>
              <div><label className="block text-xs text-gray-500 mb-1">dH</label><input type="number" step="0.1" value={unH} onChange={(e) => setUnH(Number(e.target.value))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" /></div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">露光後レジストHSP</h3>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="block text-xs text-gray-500 mb-1">dD</label><input type="number" step="0.1" value={exD} onChange={(e) => setExD(Number(e.target.value))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" /></div>
              <div><label className="block text-xs text-gray-500 mb-1">dP</label><input type="number" step="0.1" value={exP} onChange={(e) => setExP(Number(e.target.value))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" /></div>
              <div><label className="block text-xs text-gray-500 mb-1">dH</label><input type="number" step="0.1" value={exH} onChange={(e) => setExH(Number(e.target.value))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" /></div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">現像液HSP</h3>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="block text-xs text-gray-500 mb-1">dD</label><input type="number" step="0.1" value={devD} onChange={(e) => setDevD(Number(e.target.value))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" /></div>
              <div><label className="block text-xs text-gray-500 mb-1">dP</label><input type="number" step="0.1" value={devP} onChange={(e) => setDevP(Number(e.target.value))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" /></div>
              <div><label className="block text-xs text-gray-500 mb-1">dH</label><input type="number" step="0.1" value={devH} onChange={(e) => setDevH(Number(e.target.value))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" /></div>
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={handleEvaluate} disabled={loading} className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">{loading ? '評価中...' : 'コントラスト評価'}</button>
          <BookmarkButton pipeline="photoresistDeveloper" params={{ unD, unP, unH, exD, exP, exH, devD, devP, devH }} />
        </div>
      </div>
      {error && (<div role="alert" className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">{error}</div>)}
      {result && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">評価結果</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center"><div className="text-xs text-gray-500">コントラスト値</div><div className="text-lg font-semibold">{Number.isFinite(result.contrast) ? result.contrast.toFixed(4) : String(result.contrast)}</div></div>
            <div className="text-center"><div className="text-xs text-gray-500">品質</div><ContrastQualityBadge quality={result.quality} /></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            正のコントラスト: ポジ型（露光部が溶けやすい）/ 負のコントラスト: ネガ型
          </p>
        </div>
      )}
    </div>
  );
}
