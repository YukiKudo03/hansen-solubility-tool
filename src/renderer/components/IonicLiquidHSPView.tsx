/**
 * イオン液体/DES HSP推定 — カチオン+アニオンHSPの加重平均 + 温度補正
 */
import React, { useState } from 'react';
import BookmarkButton from './BookmarkButton';
import { useIonicLiquidHSP } from '../hooks/useIonicLiquidHSP';

export default function IonicLiquidHSPView() {
  const [cationDeltaD, setCationDeltaD] = useState(0);
  const [cationDeltaP, setCationDeltaP] = useState(0);
  const [cationDeltaH, setCationDeltaH] = useState(0);
  const [anionDeltaD, setAnionDeltaD] = useState(0);
  const [anionDeltaP, setAnionDeltaP] = useState(0);
  const [anionDeltaH, setAnionDeltaH] = useState(0);
  const [cationRatio, setCationRatio] = useState(1);
  const [anionRatio, setAnionRatio] = useState(1);
  const [enableTempCorrection, setEnableTempCorrection] = useState(false);
  const [temperature, setTemperature] = useState(298.15);
  const [referenceTemp, setReferenceTemp] = useState(298.15);

  const { result, loading, error, estimate, clear } = useIonicLiquidHSP();

  const canEstimate = cationRatio > 0 && anionRatio > 0 && !loading;

  const handleEstimate = async () => {
    await estimate({
      cationHSP: { deltaD: Number(cationDeltaD), deltaP: Number(cationDeltaP), deltaH: Number(cationDeltaH) },
      anionHSP: { deltaD: Number(anionDeltaD), deltaP: Number(anionDeltaP), deltaH: Number(anionDeltaH) },
      ratio: [Number(cationRatio), Number(anionRatio)],
      ...(enableTempCorrection ? { temperature: Number(temperature), referenceTemp: Number(referenceTemp) } : {}),
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">イオン液体/DES HSP推定</h2>
        <p className="text-xs text-gray-500 mb-4">
          カチオンとアニオンのHSPをモル比で加重平均し、温度補正も適用可能なIL/DESのHSPを推定します。
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* カチオンHSP */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">カチオンHSP (MPa^1/2)</h3>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">dD</label>
                <input
                  type="number"
                  step="0.1"
                  value={cationDeltaD}
                  onChange={(e) => { setCationDeltaD(Number(e.target.value)); clear(); }}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">dP</label>
                <input
                  type="number"
                  step="0.1"
                  value={cationDeltaP}
                  onChange={(e) => { setCationDeltaP(Number(e.target.value)); clear(); }}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">dH</label>
                <input
                  type="number"
                  step="0.1"
                  value={cationDeltaH}
                  onChange={(e) => { setCationDeltaH(Number(e.target.value)); clear(); }}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>

            {/* アニオンHSP */}
            <h3 className="text-sm font-medium text-gray-700 mb-2">アニオンHSP (MPa^1/2)</h3>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">dD</label>
                <input
                  type="number"
                  step="0.1"
                  value={anionDeltaD}
                  onChange={(e) => { setAnionDeltaD(Number(e.target.value)); clear(); }}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">dP</label>
                <input
                  type="number"
                  step="0.1"
                  value={anionDeltaP}
                  onChange={(e) => { setAnionDeltaP(Number(e.target.value)); clear(); }}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">dH</label>
                <input
                  type="number"
                  step="0.1"
                  value={anionDeltaH}
                  onChange={(e) => { setAnionDeltaH(Number(e.target.value)); clear(); }}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
          </div>

          {/* 比率 + 温度補正 */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">モル比</h3>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">カチオン比</label>
                <input
                  type="number"
                  step="0.1"
                  min={0.01}
                  value={cationRatio}
                  onChange={(e) => { setCationRatio(Number(e.target.value)); clear(); }}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">アニオン比</label>
                <input
                  type="number"
                  step="0.1"
                  min={0.01}
                  value={anionRatio}
                  onChange={(e) => { setAnionRatio(Number(e.target.value)); clear(); }}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>

            {/* 温度補正オプション */}
            <div className="border border-gray-200 rounded-lg p-4 mb-4">
              <label className="flex items-center gap-2 text-sm text-gray-700 mb-3">
                <input
                  type="checkbox"
                  checked={enableTempCorrection}
                  onChange={(e) => { setEnableTempCorrection(e.target.checked); clear(); }}
                  className="rounded border-gray-300"
                />
                温度補正を適用
              </label>
              {enableTempCorrection && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">目標温度 [K]</label>
                    <input
                      type="number"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => { setTemperature(Number(e.target.value)); clear(); }}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">基準温度 [K]</label>
                    <input
                      type="number"
                      step="0.1"
                      value={referenceTemp}
                      onChange={(e) => { setReferenceTemp(Number(e.target.value)); clear(); }}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleEstimate}
            disabled={!canEstimate}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '推定中...' : 'HSP推定'}
          </button>
          <BookmarkButton
            pipeline="ionicLiquidHsp"
            params={{
              cationHSP: { deltaD: cationDeltaD, deltaP: cationDeltaP, deltaH: cationDeltaH },
              anionHSP: { deltaD: anionDeltaD, deltaP: anionDeltaP, deltaH: anionDeltaH },
              ratio: [cationRatio, anionRatio],
            }}
            disabled={!canEstimate}
          />
        </div>
      </div>

      {/* エラー */}
      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* 結果 */}
      {result && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800">IL/DES HSP推定結果</h3>
          </div>
          <div className="p-6 space-y-4">
            {/* 入力情報 */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="text-xs font-medium text-gray-500 mb-1">カチオンHSP</h4>
                <p className="text-gray-700">
                  dD={result.cationHSP?.deltaD?.toFixed(2)}, dP={result.cationHSP?.deltaP?.toFixed(2)}, dH={result.cationHSP?.deltaH?.toFixed(2)}
                </p>
              </div>
              <div>
                <h4 className="text-xs font-medium text-gray-500 mb-1">アニオンHSP</h4>
                <p className="text-gray-700">
                  dD={result.anionHSP?.deltaD?.toFixed(2)}, dP={result.anionHSP?.deltaP?.toFixed(2)}, dH={result.anionHSP?.deltaH?.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              モル比: カチオン {result.cationRatio} : アニオン {result.anionRatio}
              {result.temperatureCorrected && ` / 温度補正: ${result.temperature}K`}
            </div>

            {/* 推定HSP */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">推定IL/DES HSP (MPa^1/2)</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xs text-blue-600">dD</div>
                  <div className="text-lg font-bold text-blue-900">{result.blendHSP?.deltaD?.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-xs text-blue-600">dP</div>
                  <div className="text-lg font-bold text-blue-900">{result.blendHSP?.deltaP?.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-xs text-blue-600">dH</div>
                  <div className="text-lg font-bold text-blue-900">{result.blendHSP?.deltaH?.toFixed(2)}</div>
                </div>
              </div>
            </div>

            {result.temperatureCorrected && (
              <p className="text-xs text-amber-600">
                dH成分に対して会合性液体モデルによる温度補正が適用されています。
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
