import React, { useState } from 'react';

export default function FiberDyeabilityView() {
  const [fiberD, setFiberD] = useState(19.5);
  const [fiberP, setFiberP] = useState(3.5);
  const [fiberH, setFiberH] = useState(8.6);
  const [fiberR0, setFiberR0] = useState(7.0);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  const handleEvaluate = async () => {
    try {
      setError(null);
      const res = await window.api.evaluateFiberDyeability(
        { deltaD: fiberD, deltaP: fiberP, deltaH: fiberH },
        fiberR0,
      );
      setResult(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">繊維染色性予測</h2>
        <p className="text-sm text-gray-600 mb-4">
          RED値が小さい染料ほど繊維への浸透性が高く、染色性が良好です。
        </p>

        <div>
          <h3 className="font-medium text-gray-700 mb-2">繊維HSP [MPa^0.5]</h3>
          <div className="grid grid-cols-4 gap-2 max-w-md">
            <label className="text-xs text-gray-500">dD<input type="number" step="0.1" value={fiberD} onChange={e => setFiberD(+e.target.value)} className="w-full border rounded px-2 py-1" /></label>
            <label className="text-xs text-gray-500">dP<input type="number" step="0.1" value={fiberP} onChange={e => setFiberP(+e.target.value)} className="w-full border rounded px-2 py-1" /></label>
            <label className="text-xs text-gray-500">dH<input type="number" step="0.1" value={fiberH} onChange={e => setFiberH(+e.target.value)} className="w-full border rounded px-2 py-1" /></label>
            <label className="text-xs text-gray-500">R0<input type="number" step="0.1" value={fiberR0} onChange={e => setFiberR0(+e.target.value)} className="w-full border rounded px-2 py-1" /></label>
          </div>
        </div>

        <button onClick={handleEvaluate} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          スクリーニング
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
