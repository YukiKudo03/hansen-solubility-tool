import React, { useState } from 'react';
import BookmarkButton from './BookmarkButton';

interface MDResult {
  hsp: { deltaD: number; deltaP: number; deltaH: number };
  ced: { totalCED: number; dispersionCED: number; polarCED: number; hbondCED: number };
  molarVolume: number;
  totalSolubilityParameter: number;
  consistency: number;
  warnings: string[];
  evaluatedAt: string;
}

export default function MDHSPImportView() {
  const [totalCED, setTotalCED] = useState(400);
  const [dispersionCED, setDispersionCED] = useState(250);
  const [polarCED, setPolarCED] = useState(80);
  const [hbondCED, setHbondCED] = useState(70);
  const [molarVolume, setMolarVolume] = useState(100);

  const [result, setResult] = useState<MDResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clear = () => { setResult(null); setError(null); };

  const handleImport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await (window as any).api.importMDResults(
        { totalCED, dispersionCED, polarCED, hbondCED },
        molarVolume,
      );
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'インポート中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const consistencyColor = (c: number) => {
    if (c >= 95) return 'text-green-700 bg-green-50';
    if (c >= 90) return 'text-yellow-700 bg-yellow-50';
    return 'text-red-700 bg-red-50';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">MD結果インポート</h2>
        <p className="text-xs text-gray-500 mb-4">
          分子動力学(MD)シミュレーションで得られたCED(凝集エネルギー密度)成分値からHSPを計算します。
          deltaD = sqrt(dispersionCED), deltaP = sqrt(polarCED), deltaH = sqrt(hbondCED)
        </p>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">CED成分 (J/cm3 = MPa)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">全CED (totalCED)</label>
                <input type="number" step="1" value={totalCED}
                  onChange={(e) => { setTotalCED(Number(e.target.value)); clear(); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">分散CED</label>
                <input type="number" step="1" value={dispersionCED}
                  onChange={(e) => { setDispersionCED(Number(e.target.value)); clear(); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">極性CED</label>
                <input type="number" step="1" value={polarCED}
                  onChange={(e) => { setPolarCED(Number(e.target.value)); clear(); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">水素結合CED</label>
                <input type="number" step="1" value={hbondCED}
                  onChange={(e) => { setHbondCED(Number(e.target.value)); clear(); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
              </div>
            </div>
          </div>

          <div className="max-w-xs">
            <label className="block text-xs text-gray-500 mb-1">モル体積 (cm3/mol)</label>
            <input type="number" step="1" value={molarVolume}
              onChange={(e) => { setMolarVolume(Number(e.target.value)); clear(); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <button onClick={handleImport} disabled={loading}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {loading ? '変換中...' : 'HSP変換'}
          </button>
          <BookmarkButton
            pipeline="mdHspImport"
            params={{ totalCED, dispersionCED, polarCED, hbondCED, molarVolume }}
            disabled={false}
          />
        </div>
      </div>

      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">{error}</div>
      )}

      {result && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">変換結果</h3>

          {/* HSP結果 */}
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
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-800">{result.totalSolubilityParameter.toFixed(2)}</div>
              <div className="text-xs text-gray-500">delta_total (MPa1/2)</div>
            </div>
          </div>

          {/* 整合性チェック */}
          <div className={`text-center p-3 rounded-lg mb-4 ${consistencyColor(result.consistency)}`}>
            <div className="text-xl font-bold">{result.consistency.toFixed(1)}%</div>
            <div className="text-xs">CED成分整合性 (delta_total vs sqrt(deltaD2+deltaP2+deltaH2))</div>
          </div>

          {/* CED入力サマリー */}
          <div className="p-3 bg-gray-50 rounded-lg mb-4">
            <h4 className="text-xs font-medium text-gray-600 mb-2">入力CED成分</h4>
            <div className="grid grid-cols-5 gap-2 text-xs text-gray-600">
              <div>全CED: {result.ced.totalCED}</div>
              <div>分散: {result.ced.dispersionCED}</div>
              <div>極性: {result.ced.polarCED}</div>
              <div>水素結合: {result.ced.hbondCED}</div>
              <div>Vm: {result.molarVolume} cm3/mol</div>
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
