import React, { useState } from 'react';
import { UnderfillLevel } from '../../core/underfill-encapsulant';
import GenericLevelBadge from './GenericLevelBadge';
import type { BadgeLevelConfig } from './GenericLevelBadge';
import BookmarkButton from './BookmarkButton';
import { useUnderfillEncapsulant } from '../hooks/useUnderfillEncapsulant';

const BADGE_CONFIG: Record<string | number, BadgeLevelConfig> = {
  [UnderfillLevel.Excellent]: { label: '優秀', bg: 'bg-green-100', text: 'text-green-800' },
  [UnderfillLevel.Good]: { label: '良好', bg: 'bg-teal-100', text: 'text-teal-800' },
  [UnderfillLevel.Fair]: { label: '可能', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  [UnderfillLevel.Poor]: { label: '不良', bg: 'bg-red-100', text: 'text-red-800' },
};

export default function UnderfillEncapsulantView() {
  const [encD, setEncD] = useState(17.0);
  const [encP, setEncP] = useState(8.0);
  const [encH, setEncH] = useState(10.0);
  const [chipD, setChipD] = useState(18.0);
  const [chipP, setChipP] = useState(1.0);
  const [chipH, setChipH] = useState(2.0);
  const [subD, setSubD] = useState(16.0);
  const [subP, setSubP] = useState(10.0);
  const [subH, setSubH] = useState(12.0);

  const { result, loading, error, evaluate, clear } = useUnderfillEncapsulant();

  const handleEvaluate = async () => {
    await evaluate({
      encapsulantHSP: { deltaD: encD, deltaP: encP, deltaH: encH },
      chipSurfaceHSP: { deltaD: chipD, deltaP: chipP, deltaH: chipH },
      substrateHSP: { deltaD: subD, deltaP: subP, deltaH: subH },
    });
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
        <h2 className="text-lg font-semibold text-gray-800 mb-4">アンダーフィル/封止材適合性評価</h2>
        <p className="text-xs text-gray-500 mb-4">
          封止材とチップ表面・基板の2界面のWaを計算し、弱い側をボトルネックとして適合性を判定します。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
          <HSPInputGroup label="封止材HSP" d={encD} p={encP} h={encH}
            setD={setEncD} setP={setEncP} setH={setEncH} />
          <HSPInputGroup label="チップ表面HSP" d={chipD} p={chipP} h={chipH}
            setD={setChipD} setP={setChipP} setH={setChipH} />
          <HSPInputGroup label="基板HSP" d={subD} p={subP} h={subH}
            setD={setSubD} setP={setSubP} setH={setSubH} />
        </div>

        <div className="flex gap-3">
          <button onClick={handleEvaluate} disabled={loading}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {loading ? '評価中...' : '封止材適合性評価'}
          </button>
          <BookmarkButton
            pipeline="underfillEncapsulant"
            params={{
              encapsulantHSP: { deltaD: encD, deltaP: encP, deltaH: encH },
              chipSurfaceHSP: { deltaD: chipD, deltaP: chipP, deltaH: chipH },
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

          {/* 総合レベル */}
          <div className="mb-6 flex items-center gap-3">
            <span className="text-sm text-gray-600">総合適合性:</span>
            <GenericLevelBadge level={result.level} config={BADGE_CONFIG} />
            <span className="text-sm text-gray-500">( min Wa = {result.minWa?.toFixed(2)} mJ/m2 )</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-4 rounded-lg border ${result.bottleneck === 'chip' ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                封止材 - チップ表面
                {result.bottleneck === 'chip' && <span className="ml-2 text-red-600 font-bold text-xs">ボトルネック</span>}
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-gray-500">Wa</p>
                  <p className="text-lg font-bold text-gray-900">{result.waChip?.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Ra</p>
                  <p className="text-lg font-bold text-gray-900">{result.raChip?.toFixed(3)}</p>
                </div>
              </div>
            </div>
            <div className={`p-4 rounded-lg border ${result.bottleneck === 'substrate' ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                封止材 - 基板
                {result.bottleneck === 'substrate' && <span className="ml-2 text-red-600 font-bold text-xs">ボトルネック</span>}
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-gray-500">Wa</p>
                  <p className="text-lg font-bold text-gray-900">{result.waSubstrate?.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Ra</p>
                  <p className="text-lg font-bold text-gray-900">{result.raSubstrate?.toFixed(3)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
