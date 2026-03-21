import React, { useState } from 'react';

export default function CrystallineDissolutionView() {
  const [polymerD, setPolymerD] = useState(17.3);
  const [polymerP, setPolymerP] = useState(3.0);
  const [polymerH, setPolymerH] = useState(9.4);
  const [solventD, setSolventD] = useState(17.8);
  const [solventP, setSolventP] = useState(3.1);
  const [solventH, setSolventH] = useState(5.7);
  const [tm0, setTm0] = useState(338);
  const [deltaHu, setDeltaHu] = useState(8700);
  const [vu, setVu] = useState(38.9);
  const [v1, setV1] = useState(80.7);
  const [phi1, setPhi1] = useState(0.5);
  const [result, setResult] = useState<{
    dissolutionTemperature: number;
    meltingPointDepression: number;
    chi: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleEvaluate = async () => {
    try {
      setError(null);
      const res = await window.api.evaluateCrystallineDissolution(
        { deltaD: polymerD, deltaP: polymerP, deltaH: polymerH },
        { deltaD: solventD, deltaP: solventP, deltaH: solventH },
        { tm0, deltaHu, vu, v1, phi1 },
      );
      setResult(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">結晶性ポリマー溶解温度予測</h2>
        <p className="text-sm text-gray-600 mb-4">
          HSP距離からFlory-Huggins chiを自動算出し、Flory希釈理論による溶解温度Tdを計算します。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-700 mb-2">ポリマーHSP [MPa^0.5]</h3>
            <div className="grid grid-cols-3 gap-2">
              <label className="text-xs text-gray-500">dD<input type="number" step="0.1" value={polymerD} onChange={e => setPolymerD(+e.target.value)} className="w-full border rounded px-2 py-1" /></label>
              <label className="text-xs text-gray-500">dP<input type="number" step="0.1" value={polymerP} onChange={e => setPolymerP(+e.target.value)} className="w-full border rounded px-2 py-1" /></label>
              <label className="text-xs text-gray-500">dH<input type="number" step="0.1" value={polymerH} onChange={e => setPolymerH(+e.target.value)} className="w-full border rounded px-2 py-1" /></label>
            </div>

            <h3 className="font-medium text-gray-700 mb-2 mt-4">溶媒HSP [MPa^0.5]</h3>
            <div className="grid grid-cols-3 gap-2">
              <label className="text-xs text-gray-500">dD<input type="number" step="0.1" value={solventD} onChange={e => setSolventD(+e.target.value)} className="w-full border rounded px-2 py-1" /></label>
              <label className="text-xs text-gray-500">dP<input type="number" step="0.1" value={solventP} onChange={e => setSolventP(+e.target.value)} className="w-full border rounded px-2 py-1" /></label>
              <label className="text-xs text-gray-500">dH<input type="number" step="0.1" value={solventH} onChange={e => setSolventH(+e.target.value)} className="w-full border rounded px-2 py-1" /></label>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-700 mb-2">パラメータ</h3>
            <div className="space-y-2">
              <label className="text-xs text-gray-500 block">Tm0 [K]<input type="number" step="1" value={tm0} onChange={e => setTm0(+e.target.value)} className="w-full border rounded px-2 py-1" /></label>
              <label className="text-xs text-gray-500 block">dHu [J/mol]<input type="number" step="100" value={deltaHu} onChange={e => setDeltaHu(+e.target.value)} className="w-full border rounded px-2 py-1" /></label>
              <label className="text-xs text-gray-500 block">Vu [cm3/mol]<input type="number" step="0.1" value={vu} onChange={e => setVu(+e.target.value)} className="w-full border rounded px-2 py-1" /></label>
              <label className="text-xs text-gray-500 block">V1 [cm3/mol]<input type="number" step="0.1" value={v1} onChange={e => setV1(+e.target.value)} className="w-full border rounded px-2 py-1" /></label>
              <label className="text-xs text-gray-500 block">phi1<input type="number" step="0.05" min="0" max="1" value={phi1} onChange={e => setPhi1(+e.target.value)} className="w-full border rounded px-2 py-1" /></label>
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
                <tr><td className="pr-4 text-gray-600">溶解温度 Td</td><td className="font-mono">{result.dissolutionTemperature.toFixed(1)} K ({(result.dissolutionTemperature - 273.15).toFixed(1)} C)</td></tr>
                <tr><td className="pr-4 text-gray-600">融点降下 dT</td><td className="font-mono">{result.meltingPointDepression.toFixed(1)} K</td></tr>
                <tr><td className="pr-4 text-gray-600">chi</td><td className="font-mono">{result.chi.toFixed(4)}</td></tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
