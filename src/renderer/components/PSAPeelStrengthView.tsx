import React, { useState } from 'react';
import BookmarkButton from './BookmarkButton';
import { usePSAPeelStrength } from '../hooks/usePSAPeelStrength';

const PEEL_BADGE_CONFIG: Record<number, { label: string; bg: string; text: string }> = {
  1: { label: 'Strong', bg: 'bg-green-100', text: 'text-green-800' },
  2: { label: 'Medium', bg: 'bg-teal-100', text: 'text-teal-800' },
  3: { label: 'Weak', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  4: { label: 'Very Weak', bg: 'bg-red-100', text: 'text-red-800' },
};

function PeelLevelBadge({ level }: { level: number }) {
  const config = PEEL_BADGE_CONFIG[level] ?? { label: String(level), bg: 'bg-gray-100', text: 'text-gray-800' };
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-md3-sm text-md3-label-md ${config.bg} ${config.text}`}>
      <span className="font-bold">{config.label}</span>
    </span>
  );
}

export default function PSAPeelStrengthView() {
  const [psaD, setPsaD] = useState(16.5);
  const [psaP, setPsaP] = useState(6.0);
  const [psaH, setPsaH] = useState(8.0);
  const [adhD, setAdhD] = useState(18.0);
  const [adhP, setAdhP] = useState(1.0);
  const [adhH, setAdhH] = useState(2.0);

  const { result, loading, error, evaluate, clear } = usePSAPeelStrength();

  const handleEvaluate = async () => {
    await evaluate({
      psaHSP: { deltaD: psaD, deltaP: psaP, deltaH: psaH },
      adherendHSP: { deltaD: adhD, deltaP: adhP, deltaH: adhH },
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">粘着テープ剥離強度評価</h2>
        <p className="text-xs text-gray-500 mb-4">
          PSA(感圧接着剤)と被着体のHSPから接着仕事(Wa)を計算し、
          推定剥離力と剥離強度レベルを評価します。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">PSA (感圧接着剤) HSP</h3>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">deltaD</label>
                <input type="number" step="0.1" value={psaD} onChange={(e) => { setPsaD(Number(e.target.value)); clear(); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">deltaP</label>
                <input type="number" step="0.1" value={psaP} onChange={(e) => { setPsaP(Number(e.target.value)); clear(); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">deltaH</label>
                <input type="number" step="0.1" value={psaH} onChange={(e) => { setPsaH(Number(e.target.value)); clear(); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">被着体HSP</h3>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">deltaD</label>
                <input type="number" step="0.1" value={adhD} onChange={(e) => { setAdhD(Number(e.target.value)); clear(); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">deltaP</label>
                <input type="number" step="0.1" value={adhP} onChange={(e) => { setAdhP(Number(e.target.value)); clear(); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">deltaH</label>
                <input type="number" step="0.1" value={adhH} onChange={(e) => { setAdhH(Number(e.target.value)); clear(); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={handleEvaluate} disabled={loading}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {loading ? '評価中...' : '剥離強度評価'}
          </button>
          <BookmarkButton
            pipeline="psaPeelStrength"
            params={{ psaHSP: { deltaD: psaD, deltaP: psaP, deltaH: psaH }, adherendHSP: { deltaD: adhD, deltaP: adhP, deltaH: adhH } }}
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
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className="text-xs text-gray-500">接着仕事 Wa</p>
              <p className="text-lg font-bold text-gray-900">{result.wa?.toFixed(2)} mJ/m2</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">HSP距離 Ra</p>
              <p className="text-lg font-bold text-gray-900">{result.ra?.toFixed(3)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">推定剥離力</p>
              <p className="text-lg font-bold text-gray-900">{result.estimatedPeelForce?.toFixed(1)} N/25mm</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">剥離強度</p>
              <PeelLevelBadge level={result.peelLevel} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
