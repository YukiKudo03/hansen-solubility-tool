import React, { useState } from 'react';
import BookmarkButton from './BookmarkButton';

const CONFIDENCE_LABEL: Record<string, string> = {
  high: '高',
  medium: '中',
  low: '低',
};

const CONFIDENCE_COLOR: Record<string, string> = {
  high: 'text-green-700 bg-green-50',
  medium: 'text-yellow-700 bg-yellow-50',
  low: 'text-red-700 bg-red-50',
};

interface QSPRResult {
  hsp: { deltaD: number; deltaP: number; deltaH: number };
  descriptors: {
    molarVolume: number;
    logP: number;
    numHBDonors: number;
    numHBAcceptors: number;
    aromaticRings: number;
  };
  confidence: 'high' | 'medium' | 'low';
  warnings: string[];
  evaluatedAt: string;
}

export default function MLHSPPredictionView() {
  const [molarVolume, setMolarVolume] = useState(100);
  const [logP, setLogP] = useState(1.5);
  const [numHBDonors, setNumHBDonors] = useState(1);
  const [numHBAcceptors, setNumHBAcceptors] = useState(2);
  const [aromaticRings, setAromaticRings] = useState(1);

  const [result, setResult] = useState<QSPRResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clear = () => { setResult(null); setError(null); };

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await (window as any).api.estimateHSPFromDescriptors({
        molarVolume,
        logP,
        numHBDonors,
        numHBAcceptors,
        aromaticRings,
      });
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : '推定中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">HSP推算 (QSPR)</h2>
        <p className="text-xs text-gray-500 mb-4">
          分子記述子(モル体積、logP、水素結合ドナー/アクセプター数、芳香環数)から経験的回帰式でHSPを推算します。
        </p>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">モル体積 (cm3/mol)</label>
            <input type="number" step="1" value={molarVolume}
              onChange={(e) => { setMolarVolume(Number(e.target.value)); clear(); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">logP</label>
            <input type="number" step="0.1" value={logP}
              onChange={(e) => { setLogP(Number(e.target.value)); clear(); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">HB供与体数</label>
            <input type="number" step="1" min="0" value={numHBDonors}
              onChange={(e) => { setNumHBDonors(Number(e.target.value)); clear(); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">HB受容体数</label>
            <input type="number" step="1" min="0" value={numHBAcceptors}
              onChange={(e) => { setNumHBAcceptors(Number(e.target.value)); clear(); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">芳香環数</label>
            <input type="number" step="1" min="0" value={aromaticRings}
              onChange={(e) => { setAromaticRings(Number(e.target.value)); clear(); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={handlePredict} disabled={loading}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {loading ? '推定中...' : 'HSP推定'}
          </button>
          <BookmarkButton
            pipeline="mlHspPrediction"
            params={{ molarVolume, logP, numHBDonors, numHBAcceptors, aromaticRings }}
            disabled={false}
          />
        </div>
      </div>

      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">{error}</div>
      )}

      {result && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">推定結果</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-800">{result.hsp.deltaD.toFixed(2)}</div>
              <div className="text-xs text-gray-500">deltaD (MPa1/2)</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-800">{result.hsp.deltaP.toFixed(2)}</div>
              <div className="text-xs text-gray-500">deltaP (MPa1/2)</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-800">{result.hsp.deltaH.toFixed(2)}</div>
              <div className="text-xs text-gray-500">deltaH (MPa1/2)</div>
            </div>
            <div className={`text-center p-3 rounded-lg ${CONFIDENCE_COLOR[result.confidence] ?? 'bg-gray-50'}`}>
              <div className="text-2xl font-bold">
                {CONFIDENCE_LABEL[result.confidence] ?? result.confidence}
              </div>
              <div className="text-xs text-gray-500">信頼度</div>
            </div>
          </div>

          {/* 入力した記述子のサマリー */}
          <div className="p-3 bg-gray-50 rounded-lg mb-4">
            <h4 className="text-xs font-medium text-gray-600 mb-2">入力記述子</h4>
            <div className="grid grid-cols-5 gap-2 text-xs text-gray-600">
              <div>モル体積: {result.descriptors.molarVolume}</div>
              <div>logP: {result.descriptors.logP}</div>
              <div>HBD: {result.descriptors.numHBDonors}</div>
              <div>HBA: {result.descriptors.numHBAcceptors}</div>
              <div>芳香環: {result.descriptors.aromaticRings}</div>
            </div>
          </div>

          {/* 警告 */}
          {result.warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800 text-sm">
              <div className="font-medium mb-1">注意事項</div>
              <ul className="list-disc list-inside space-y-1">
                {result.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
