import React, { useState } from 'react';
import BookmarkButton from './BookmarkButton';

const LEVEL_COLORS: Record<number, string> = {
  1: 'bg-green-100 text-green-800',
  2: 'bg-blue-100 text-blue-800',
  3: 'bg-yellow-100 text-yellow-800',
  4: 'bg-red-100 text-red-800',
};

const LEVEL_LABELS: Record<number, string> = {
  1: '優秀',
  2: '良好',
  3: '可能',
  4: '不良',
};

interface PrimerlessResult {
  adhesiveHSP: { deltaD: number; deltaP: number; deltaH: number };
  substrateHSP: { deltaD: number; deltaP: number; deltaH: number };
  wa: number;
  ra: number;
  level: number;
  optimalAdhesiveHSP: { deltaD: number; deltaP: number; deltaH: number };
  optimalWa: number;
  optimalRa: number;
  improvementPotential: number;
  evaluatedAt: string;
}

export default function PrimerlessAdhesionView() {
  const [adhD, setAdhD] = useState(17.0);
  const [adhP, setAdhP] = useState(8.0);
  const [adhH, setAdhH] = useState(10.0);
  const [subD, setSubD] = useState(18.0);
  const [subP, setSubP] = useState(1.0);
  const [subH, setSubH] = useState(2.0);

  const [result, setResult] = useState<PrimerlessResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clear = () => { setResult(null); setError(null); };

  const handleEvaluate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await (window as any).api.optimizePrimerlessAdhesion({
        adhesiveHSP: { deltaD: adhD, deltaP: adhP, deltaH: adhH },
        substrateHSP: { deltaD: subD, deltaP: subP, deltaH: subH },
      });
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : '評価中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
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
        <h2 className="text-lg font-semibold text-gray-800 mb-4">プライマーレス接着設計</h2>
        <p className="text-xs text-gray-500 mb-4">
          接着剤と基材のHSP距離および接着仕事(Wa)に基づき、プライマー不要の最適接着剤HSPを提案します。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <HSPInputGroup label="接着剤HSP" d={adhD} p={adhP} h={adhH}
            setD={setAdhD} setP={setAdhP} setH={setAdhH} />
          <HSPInputGroup label="基材HSP" d={subD} p={subP} h={subH}
            setD={setSubD} setP={setSubP} setH={setSubH} />
        </div>

        <div className="flex gap-3">
          <button onClick={handleEvaluate} disabled={loading}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {loading ? '評価中...' : 'プライマーレス接着評価'}
          </button>
          <BookmarkButton
            pipeline="primerlessAdhesion"
            params={{
              adhesiveHSP: { deltaD: adhD, deltaP: adhP, deltaH: adhH },
              substrateHSP: { deltaD: subD, deltaP: subP, deltaH: subH },
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

          {/* 現在の接着性能 */}
          <div className="mb-6">
            <h4 className="text-xs font-medium text-gray-600 mb-3">現在の接着性能</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-800">{result.wa.toFixed(2)}</div>
                <div className="text-xs text-gray-500">Wa (mJ/m2)</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-800">{result.ra.toFixed(3)}</div>
                <div className="text-xs text-gray-500">Ra</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${LEVEL_COLORS[result.level] ?? 'bg-gray-100 text-gray-800'}`}>
                  {LEVEL_LABELS[result.level] ?? `Level ${result.level}`}
                </span>
                <div className="text-xs text-gray-500 mt-1">レベル</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-800">
                  {Number.isFinite(result.improvementPotential) ? `${result.improvementPotential.toFixed(1)}%` : '-'}
                </div>
                <div className="text-xs text-gray-500">改善余地</div>
              </div>
            </div>
          </div>

          {/* 最適接着剤HSP提案 */}
          <div className="p-4 rounded-lg border border-green-200 bg-green-50">
            <h4 className="text-sm font-medium text-green-800 mb-3">最適接着剤HSP (提案)</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-green-900">{result.optimalAdhesiveHSP.deltaD.toFixed(2)}</div>
                <div className="text-xs text-green-700">deltaD (MPa1/2)</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-900">{result.optimalAdhesiveHSP.deltaP.toFixed(2)}</div>
                <div className="text-xs text-green-700">deltaP (MPa1/2)</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-900">{result.optimalAdhesiveHSP.deltaH.toFixed(2)}</div>
                <div className="text-xs text-green-700">deltaH (MPa1/2)</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-900">{result.optimalWa.toFixed(2)}</div>
                <div className="text-xs text-green-700">最適Wa (mJ/m2)</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-900">{result.optimalRa.toFixed(3)}</div>
                <div className="text-xs text-green-700">最適Ra</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
