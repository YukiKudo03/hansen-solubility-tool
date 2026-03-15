import React, { useState, useEffect } from 'react';
import type { RiskThresholds } from '../../core/types';
import { DEFAULT_THRESHOLDS } from '../../core/risk';

export default function SettingsView() {
  const [thresholds, setThresholds] = useState<RiskThresholds>({ ...DEFAULT_THRESHOLDS });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      const t = await window.api.getThresholds();
      setThresholds(t);
    };
    load();
  }, []);

  const handleSave = async () => {
    await window.api.setThresholds(thresholds);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setThresholds({ ...DEFAULT_THRESHOLDS });
  };

  const fields: { key: keyof RiskThresholds; label: string; levelLabel: string; color: string }[] = [
    { key: 'dangerousMax', label: 'Level 1 上限 (危険)', levelLabel: 'RED < この値 → 危険', color: 'red' },
    { key: 'warningMax', label: 'Level 2 上限 (要警戒)', levelLabel: 'RED < この値 → 要警戒', color: 'orange' },
    { key: 'cautionMax', label: 'Level 3 上限 (要注意)', levelLabel: 'RED < この値 → 要注意', color: 'yellow' },
    { key: 'holdMax', label: 'Level 4 上限 (保留)', levelLabel: 'RED < この値 → 保留', color: 'blue' },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">リスク判定閾値設定</h2>
        <p className="text-sm text-gray-600 mb-6">
          RED値（Relative Energy Difference）の閾値を調整して、リスクレベルの判定基準をカスタマイズできます。
        </p>

        <div className="space-y-4">
          {fields.map((f) => (
            <div key={f.key} className="flex items-center gap-4">
              <div className="w-56">
                <label className="block text-sm font-medium text-gray-700">{f.label}</label>
                <span className="text-xs text-gray-500">{f.levelLabel}</span>
              </div>
              <input
                type="number"
                step="0.1"
                min="0"
                value={thresholds[f.key]}
                onChange={(e) =>
                  setThresholds((prev) => ({ ...prev, [f.key]: parseFloat(e.target.value) || 0 }))
                }
                className="w-24 px-3 py-2 border border-gray-300 rounded-md text-sm text-right"
              />
            </div>
          ))}
        </div>

        <div className="mt-2 text-xs text-gray-500">
          <p>※ Level 5（安全）: RED ≥ {thresholds.holdMax} の場合に判定</p>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700"
          >
            保存
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-md font-medium text-sm hover:bg-gray-300"
          >
            デフォルトに戻す
          </button>
          {saved && (
            <span className="self-center text-green-600 text-sm font-medium">保存しました</span>
          )}
        </div>

        {/* 閾値の視覚的な説明 */}
        <div className="mt-8 border-t pt-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">判定基準の図解</h3>
          <div className="flex items-stretch h-8 rounded-lg overflow-hidden text-xs font-medium text-white">
            <div className="bg-red-500 flex items-center justify-center" style={{ flex: thresholds.dangerousMax }}>
              危険
            </div>
            <div className="bg-orange-500 flex items-center justify-center" style={{ flex: thresholds.warningMax - thresholds.dangerousMax }}>
              要警戒
            </div>
            <div className="bg-yellow-500 flex items-center justify-center text-gray-800" style={{ flex: thresholds.cautionMax - thresholds.warningMax }}>
              要注意
            </div>
            <div className="bg-blue-500 flex items-center justify-center" style={{ flex: thresholds.holdMax - thresholds.cautionMax }}>
              保留
            </div>
            <div className="bg-green-500 flex items-center justify-center" style={{ flex: 1 }}>
              安全
            </div>
          </div>
          <div className="flex text-xs text-gray-500 mt-1">
            <span style={{ flex: thresholds.dangerousMax, textAlign: 'right' }}>{thresholds.dangerousMax}</span>
            <span style={{ flex: thresholds.warningMax - thresholds.dangerousMax, textAlign: 'right' }}>{thresholds.warningMax}</span>
            <span style={{ flex: thresholds.cautionMax - thresholds.warningMax, textAlign: 'right' }}>{thresholds.cautionMax}</span>
            <span style={{ flex: thresholds.holdMax - thresholds.cautionMax, textAlign: 'right' }}>{thresholds.holdMax}</span>
            <span style={{ flex: 1 }} />
          </div>
          <div className="flex text-xs text-gray-400 mt-0">
            <span>RED = 0</span>
            <span className="ml-auto">RED →</span>
          </div>
        </div>
      </div>
    </div>
  );
}
