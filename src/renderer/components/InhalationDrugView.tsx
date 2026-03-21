import React, { useState } from 'react';
import FormulationTypeBadge from './FormulationTypeBadge';
import BookmarkButton from './BookmarkButton';
import { useInhalationDrug } from '../hooks/useInhalationDrug';

export default function InhalationDrugView() {
  const [drugDeltaD, setDrugDeltaD] = useState(18.5);
  const [drugDeltaP, setDrugDeltaP] = useState(10.2);
  const [drugDeltaH, setDrugDeltaH] = useState(14.0);
  const [propDeltaD, setPropDeltaD] = useState(12.4);
  const [propDeltaP, setPropDeltaP] = useState(6.2);
  const [propDeltaH, setPropDeltaH] = useState(3.8);
  const [propR0, setPropR0] = useState(8.0);

  const { result, loading, error, evaluate, clear } = useInhalationDrug();

  const handleEvaluate = async () => {
    await evaluate({
      drugHSP: { deltaD: drugDeltaD, deltaP: drugDeltaP, deltaH: drugDeltaH },
      propellantHSP: { deltaD: propDeltaD, deltaP: propDeltaP, deltaH: propDeltaH },
      propellantR0: propR0,
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">吸入薬プロペラント適合性評価</h2>
        <p className="text-xs text-gray-500 mb-4">
          HSPに基づき、薬物のプロペラント（噴射剤）中での製剤形態（溶液型/懸濁型/不安定）を評価します。
          RED値が低いほど溶液型製剤が可能です。
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">薬物 dD</label>
            <input type="number" step="0.1" value={drugDeltaD} onChange={(e) => setDrugDeltaD(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">薬物 dP</label>
            <input type="number" step="0.1" value={drugDeltaP} onChange={(e) => setDrugDeltaP(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">薬物 dH</label>
            <input type="number" step="0.1" value={drugDeltaH} onChange={(e) => setDrugDeltaH(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <div className="col-span-1" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">プロペラント dD</label>
            <input type="number" step="0.1" value={propDeltaD} onChange={(e) => setPropDeltaD(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">プロペラント dP</label>
            <input type="number" step="0.1" value={propDeltaP} onChange={(e) => setPropDeltaP(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">プロペラント dH</label>
            <input type="number" step="0.1" value={propDeltaH} onChange={(e) => setPropDeltaH(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">プロペラント R0</label>
            <input type="number" step="0.1" value={propR0} onChange={(e) => setPropR0(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={handleEvaluate} disabled={loading}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {loading ? '評価中...' : '吸入薬適合性評価'}
          </button>
          <BookmarkButton pipeline="inhalationDrug" params={{
            drugHSP: { deltaD: drugDeltaD, deltaP: drugDeltaP, deltaH: drugDeltaH },
            propellantHSP: { deltaD: propDeltaD, deltaP: propDeltaP, deltaH: propDeltaH },
            propellantR0: propR0,
          }} disabled={false} />
        </div>
      </div>

      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">{error}</div>
      )}

      {result && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">吸入薬適合性結果</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="text-xs text-gray-500">Ra</span>
              <p className="text-lg font-semibold">{result.ra?.toFixed(3) ?? '-'}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500">RED</span>
              <p className="text-lg font-semibold">{result.red?.toFixed(3) ?? '-'}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500">製剤形態</span>
              <div className="mt-1"><FormulationTypeBadge level={result.formulation ?? 'Unstable'} /></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
