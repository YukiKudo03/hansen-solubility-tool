import React, { useState } from 'react';

export default function HydrogelSwellingView() {
  const [gelD, setGelD] = useState(17.4);
  const [gelP, setGelP] = useState(14.6);
  const [gelH, setGelH] = useState(18.0);
  const [solD, setSolD] = useState(15.5);
  const [solP, setSolP] = useState(16.0);
  const [solH, setSolH] = useState(42.3);
  const [crosslinkDensity, setCrosslinkDensity] = useState(0.001);
  const [vs, setVs] = useState(18.0);
  const [result, setResult] = useState<{
    phiP: number;
    swellingRatio: number;
    chi: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleEvaluate = async () => {
    try {
      setError(null);
      const res = await window.api.evaluateHydrogelSwelling(
        { deltaD: gelD, deltaP: gelP, deltaH: gelH },
        { deltaD: solD, deltaP: solP, deltaH: solH },
        crosslinkDensity,
        vs,
      );
      setResult(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">ハイドロゲル膨潤平衡</h2>
        <p className="text-sm text-gray-600 mb-4">
          HSPからchiを自動算出し、Flory-Rehner方程式で平衡膨潤度を計算します。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-700 mb-2">ゲルHSP [MPa^0.5]</h3>
            <div className="grid grid-cols-3 gap-2">
              <label className="text-xs text-gray-500">dD<input type="number" step="0.1" value={gelD} onChange={e => setGelD(+e.target.value)} className="w-full border rounded px-2 py-1" /></label>
              <label className="text-xs text-gray-500">dP<input type="number" step="0.1" value={gelP} onChange={e => setGelP(+e.target.value)} className="w-full border rounded px-2 py-1" /></label>
              <label className="text-xs text-gray-500">dH<input type="number" step="0.1" value={gelH} onChange={e => setGelH(+e.target.value)} className="w-full border rounded px-2 py-1" /></label>
            </div>

            <h3 className="font-medium text-gray-700 mb-2 mt-4">溶媒HSP [MPa^0.5]</h3>
            <div className="grid grid-cols-3 gap-2">
              <label className="text-xs text-gray-500">dD<input type="number" step="0.1" value={solD} onChange={e => setSolD(+e.target.value)} className="w-full border rounded px-2 py-1" /></label>
              <label className="text-xs text-gray-500">dP<input type="number" step="0.1" value={solP} onChange={e => setSolP(+e.target.value)} className="w-full border rounded px-2 py-1" /></label>
              <label className="text-xs text-gray-500">dH<input type="number" step="0.1" value={solH} onChange={e => setSolH(+e.target.value)} className="w-full border rounded px-2 py-1" /></label>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-700 mb-2">パラメータ</h3>
            <div className="space-y-2">
              <label className="text-xs text-gray-500 block">架橋密度 [mol/cm3]<input type="number" step="0.0001" value={crosslinkDensity} onChange={e => setCrosslinkDensity(+e.target.value)} className="w-full border rounded px-2 py-1" /></label>
              <label className="text-xs text-gray-500 block">Vs [cm3/mol]<input type="number" step="0.1" value={vs} onChange={e => setVs(+e.target.value)} className="w-full border rounded px-2 py-1" /></label>
            </div>
          </div>
        </div>

        <button onClick={handleEvaluate} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          計算
        </button>

        {error && <p className="mt-2 text-red-600 text-sm">{error}</p>}

        {result && (
          <div className="mt-4 bg-gray-50 rounded p-4">
            <h3 className="font-medium mb-2">結果</h3>
            <table className="text-sm">
              <tbody>
                <tr><td className="pr-4 text-gray-600">phiP</td><td className="font-mono">{result.phiP.toFixed(4)}</td></tr>
                <tr><td className="pr-4 text-gray-600">膨潤度 Q</td><td className="font-mono">{result.swellingRatio.toFixed(2)}</td></tr>
                <tr><td className="pr-4 text-gray-600">chi</td><td className="font-mono">{result.chi.toFixed(4)}</td></tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
