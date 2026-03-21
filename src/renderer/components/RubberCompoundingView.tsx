import React, { useState } from 'react';

export default function RubberCompoundingView() {
  const [rubberD, setRubberD] = useState(17.4);
  const [rubberP, setRubberP] = useState(3.1);
  const [rubberH, setRubberH] = useState(4.1);
  const [fillerD, setFillerD] = useState(19.5);
  const [fillerP, setFillerP] = useState(2.9);
  const [fillerH, setFillerH] = useState(3.5);
  const [fillerName, setFillerName] = useState('Carbon Black');
  const [crosslinkDensity, setCrosslinkDensity] = useState(0.0001);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  const handleEvaluate = async () => {
    try {
      setError(null);
      const res = await window.api.evaluateRubberCompounding(
        { deltaD: rubberD, deltaP: rubberP, deltaH: rubberH },
        { name: fillerName, hsp: { deltaD: fillerD, deltaP: fillerP, deltaH: fillerH } },
        crosslinkDensity,
      );
      setResult(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">ゴム配合設計</h2>
        <p className="text-sm text-gray-600 mb-4">
          ゴム-フィラー間のchi計算と、ゴム-溶媒間の膨潤度予測の複合評価を行います。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-700 mb-2">ゴムHSP [MPa^0.5]</h3>
            <div className="grid grid-cols-3 gap-2">
              <label className="text-xs text-gray-500">dD<input type="number" step="0.1" value={rubberD} onChange={e => setRubberD(+e.target.value)} className="w-full border rounded px-2 py-1" /></label>
              <label className="text-xs text-gray-500">dP<input type="number" step="0.1" value={rubberP} onChange={e => setRubberP(+e.target.value)} className="w-full border rounded px-2 py-1" /></label>
              <label className="text-xs text-gray-500">dH<input type="number" step="0.1" value={rubberH} onChange={e => setRubberH(+e.target.value)} className="w-full border rounded px-2 py-1" /></label>
            </div>

            <h3 className="font-medium text-gray-700 mb-2 mt-4">フィラーHSP [MPa^0.5]</h3>
            <label className="text-xs text-gray-500 block mb-1">名称<input type="text" value={fillerName} onChange={e => setFillerName(e.target.value)} className="w-full border rounded px-2 py-1" /></label>
            <div className="grid grid-cols-3 gap-2">
              <label className="text-xs text-gray-500">dD<input type="number" step="0.1" value={fillerD} onChange={e => setFillerD(+e.target.value)} className="w-full border rounded px-2 py-1" /></label>
              <label className="text-xs text-gray-500">dP<input type="number" step="0.1" value={fillerP} onChange={e => setFillerP(+e.target.value)} className="w-full border rounded px-2 py-1" /></label>
              <label className="text-xs text-gray-500">dH<input type="number" step="0.1" value={fillerH} onChange={e => setFillerH(+e.target.value)} className="w-full border rounded px-2 py-1" /></label>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-700 mb-2">パラメータ</h3>
            <label className="text-xs text-gray-500 block">架橋密度 [mol/cm3]<input type="number" step="0.00001" value={crosslinkDensity} onChange={e => setCrosslinkDensity(+e.target.value)} className="w-full border rounded px-2 py-1" /></label>
          </div>
        </div>

        <button onClick={handleEvaluate} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          評価
        </button>

        {error && <p className="mt-2 text-red-600 text-sm">{error}</p>}
        {result && (
          <div className="mt-4 bg-gray-50 rounded p-4">
            <h3 className="font-medium mb-2">結果</h3>
            <pre className="text-xs font-mono whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
