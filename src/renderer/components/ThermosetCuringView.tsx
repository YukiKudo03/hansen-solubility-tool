import React, { useState } from 'react';

export default function ThermosetCuringView() {
  const [resinD, setResinD] = useState(18.5);
  const [resinP, setResinP] = useState(10.0);
  const [resinH, setResinH] = useState(9.0);
  const [resinR0, setResinR0] = useState(8.0);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  const handleEvaluate = async () => {
    try {
      setError(null);
      const res = await window.api.evaluateThermosetCuring(
        { deltaD: resinD, deltaP: resinP, deltaH: resinH },
        resinR0,
      );
      setResult(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">熱硬化性樹脂硬化剤選定</h2>
        <p className="text-sm text-gray-600 mb-4">
          RED値が小さい硬化剤ほど樹脂との混合均一性が高く、良い硬化剤候補です。
        </p>

        <div>
          <h3 className="font-medium text-gray-700 mb-2">樹脂HSP [MPa^0.5]</h3>
          <div className="grid grid-cols-4 gap-2 max-w-md">
            <label className="text-xs text-gray-500">dD<input type="number" step="0.1" value={resinD} onChange={e => setResinD(+e.target.value)} className="w-full border rounded px-2 py-1" /></label>
            <label className="text-xs text-gray-500">dP<input type="number" step="0.1" value={resinP} onChange={e => setResinP(+e.target.value)} className="w-full border rounded px-2 py-1" /></label>
            <label className="text-xs text-gray-500">dH<input type="number" step="0.1" value={resinH} onChange={e => setResinH(+e.target.value)} className="w-full border rounded px-2 py-1" /></label>
            <label className="text-xs text-gray-500">R0<input type="number" step="0.1" value={resinR0} onChange={e => setResinR0(+e.target.value)} className="w-full border rounded px-2 py-1" /></label>
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
