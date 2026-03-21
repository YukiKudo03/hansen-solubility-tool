import React from 'react';

export default function MDHSPImportView() {
  return (
    <div className="space-y-4">
      <h2 className="text-md3-headline-sm text-md3-on-surface">MD結果インポート</h2>
      <p className="text-md3-body-md text-md3-on-surface-variant">
        分子動力学(MD)シミュレーションで得られたCED(凝集エネルギー密度)成分値からHSPを計算します。
      </p>
      <div className="p-4 rounded-xl bg-md3-surface-container">
        <p className="text-md3-body-sm text-md3-on-surface-variant">
          このビューは今後実装予定です。コアロジックは実装済みです。
        </p>
      </div>
    </div>
  );
}
