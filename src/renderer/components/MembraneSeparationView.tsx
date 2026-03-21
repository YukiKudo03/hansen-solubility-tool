import React, { useState } from 'react';
import GenericLevelBadge from './GenericLevelBadge';
import type { BadgeLevelConfig } from './GenericLevelBadge';
import BookmarkButton from './BookmarkButton';
import { useMembraneSeparation } from '../hooks/useMembraneSeparation';
import { GAS_HSP_DATABASE } from '../../core/gas-solubility';

const SELECTIVITY_BADGE: Record<string | number, BadgeLevelConfig> = {
  1: { label: '非常に高い', bg: 'bg-green-100', text: 'text-green-800' },
  2: { label: '良好', bg: 'bg-teal-100', text: 'text-teal-800' },
  3: { label: '中程度', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  4: { label: '低い', bg: 'bg-red-100', text: 'text-red-800' },
};

const GAS_OPTIONS = Object.keys(GAS_HSP_DATABASE);

export default function MembraneSeparationView() {
  const [membraneHSP, setMembraneHSP] = useState({ deltaD: 17.3, deltaP: 3.0, deltaH: 9.4 });
  const [targetGas, setTargetGas] = useState('CO2');
  const [impurityGas, setImpurityGas] = useState('N2');

  const { result, loading, error, evaluate } = useMembraneSeparation();

  const handleEvaluate = async () => {
    const tHSP = GAS_HSP_DATABASE[targetGas];
    const iHSP = GAS_HSP_DATABASE[impurityGas];
    if (!tHSP || !iHSP) return;
    await evaluate({
      membraneHSP,
      targetHSP: tHSP,
      targetName: targetGas,
      impurityHSP: iHSP,
      impurityName: impurityGas,
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">膜分離選択性評価</h2>
        <p className="text-xs text-gray-500 mb-4">
          2つのガス成分間の透過選択性を評価します。
          選択性比 = Ra2(不純物) / Ra2(ターゲット)。大きいほどターゲットが選択的に透過します。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">膜材料 HSP</label>
            <div className="grid grid-cols-3 gap-2">
              {(['deltaD', 'deltaP', 'deltaH'] as const).map(key => (
                <div key={key}>
                  <label className="text-xs text-gray-500">{key === 'deltaD' ? 'dD' : key === 'deltaP' ? 'dP' : 'dH'}</label>
                  <input
                    type="number" step="0.1" value={membraneHSP[key]}
                    onChange={(e) => setMembraneHSP({ ...membraneHSP, [key]: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ターゲットガス</label>
            <select
              value={targetGas}
              onChange={(e) => setTargetGas(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              {GAS_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">不純物ガス</label>
            <select
              value={impurityGas}
              onChange={(e) => setImpurityGas(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              {GAS_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleEvaluate}
            disabled={loading || targetGas === impurityGas}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '評価中...' : '選択性評価'}
          </button>
          <BookmarkButton
            pipeline="membraneSeparation"
            params={{ membraneHSP, targetGas, impurityGas }}
            disabled={targetGas === impurityGas}
          />
        </div>
      </div>

      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800">
              膜分離選択性: {result.targetName} / {result.impurityName}
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500">ターゲット Ra</p>
                <p className="text-lg font-bold">{result.targetRa?.toFixed(3)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">不純物 Ra</p>
                <p className="text-lg font-bold">{result.impurityRa?.toFixed(3)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">選択性比</p>
                <p className="text-lg font-bold">{result.selectivityRatio?.toFixed(3)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">選択性レベル</p>
                <GenericLevelBadge level={result.selectivityLevel} config={SELECTIVITY_BADGE} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
