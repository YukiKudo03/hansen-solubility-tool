import React, { useState } from 'react';
import DefectRiskBadge from './DefectRiskBadge';
import BookmarkButton from './BookmarkButton';
import { useCoatingDefect } from '../hooks/useCoatingDefect';

export default function CoatingDefectView() {
  const [coatD, setCoatD] = useState(20.4);
  const [coatP, setCoatP] = useState(12.0);
  const [coatH, setCoatH] = useState(11.5);
  const [subD, setSubD] = useState(25.0);
  const [subP, setSubP] = useState(0.0);
  const [subH, setSubH] = useState(0.0);
  const [solD, setSolD] = useState(16.0);
  const [solP, setSolP] = useState(9.0);
  const [solH, setSolH] = useState(5.1);

  const { result, loading, error, evaluate } = useCoatingDefect();

  const handleEvaluate = async () => {
    await evaluate(
      { deltaD: coatD, deltaP: coatP, deltaH: coatH },
      { deltaD: subD, deltaP: subP, deltaH: subH },
      { deltaD: solD, deltaP: solP, deltaH: solH },
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">コーティング欠陥予測</h2>
        <p className="text-xs text-gray-500 mb-4">
          コーティング材・基材・溶媒のHSPから密着不良リスクとMarangoni効果リスクを予測します。
        </p>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">コーティング材HSP</h3>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="block text-xs text-gray-500 mb-1">dD</label><input type="number" step="0.1" value={coatD} onChange={(e) => setCoatD(Number(e.target.value))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" /></div>
              <div><label className="block text-xs text-gray-500 mb-1">dP</label><input type="number" step="0.1" value={coatP} onChange={(e) => setCoatP(Number(e.target.value))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" /></div>
              <div><label className="block text-xs text-gray-500 mb-1">dH</label><input type="number" step="0.1" value={coatH} onChange={(e) => setCoatH(Number(e.target.value))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" /></div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">基材HSP</h3>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="block text-xs text-gray-500 mb-1">dD</label><input type="number" step="0.1" value={subD} onChange={(e) => setSubD(Number(e.target.value))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" /></div>
              <div><label className="block text-xs text-gray-500 mb-1">dP</label><input type="number" step="0.1" value={subP} onChange={(e) => setSubP(Number(e.target.value))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" /></div>
              <div><label className="block text-xs text-gray-500 mb-1">dH</label><input type="number" step="0.1" value={subH} onChange={(e) => setSubH(Number(e.target.value))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" /></div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">溶媒HSP</h3>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="block text-xs text-gray-500 mb-1">dD</label><input type="number" step="0.1" value={solD} onChange={(e) => setSolD(Number(e.target.value))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" /></div>
              <div><label className="block text-xs text-gray-500 mb-1">dP</label><input type="number" step="0.1" value={solP} onChange={(e) => setSolP(Number(e.target.value))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" /></div>
              <div><label className="block text-xs text-gray-500 mb-1">dH</label><input type="number" step="0.1" value={solH} onChange={(e) => setSolH(Number(e.target.value))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" /></div>
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={handleEvaluate} disabled={loading} className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">{loading ? '予測中...' : '欠陥予測'}</button>
          <BookmarkButton pipeline="coatingDefect" params={{ coatD, coatP, coatH, subD, subP, subH, solD, solP, solH }} />
        </div>
      </div>
      {error && (<div role="alert" className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">{error}</div>)}
      {result && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">予測結果</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center"><div className="text-xs text-gray-500">Ra(塗膜-基材)</div><div className="text-lg font-semibold">{result.raCoatingSubstrate?.toFixed(3)}</div></div>
            <div className="text-center"><div className="text-xs text-gray-500">Ra(塗膜-溶媒)</div><div className="text-lg font-semibold">{result.raCoatingSolvent?.toFixed(3)}</div></div>
            <div className="text-center"><div className="text-xs text-gray-500">密着不良リスク</div><div className="text-lg font-semibold">{result.adhesionRisk ? 'あり' : 'なし'}</div></div>
            <div className="text-center"><div className="text-xs text-gray-500">Marangoniリスク</div><div className="text-lg font-semibold">{result.marangoniRisk ? 'あり' : 'なし'}</div></div>
          </div>
          <div className="text-center"><DefectRiskBadge level={result.defectRisk ?? 'Low'} /></div>
        </div>
      )}
    </div>
  );
}
