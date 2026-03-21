import React from 'react';

export default function MLHSPPredictionView() {
  return (
    <div className="space-y-4">
      <h2 className="text-md3-headline-sm text-md3-on-surface">HSP推算(QSPR)</h2>
      <p className="text-md3-body-md text-md3-on-surface-variant">
        分子記述子（モル体積、logP、水素結合ドナー/アクセプター数、芳香環数）からHSPを経験的回帰式で推算します。
      </p>
      <div className="p-4 rounded-xl bg-md3-surface-container">
        <p className="text-md3-body-sm text-md3-on-surface-variant">
          このビューは今後実装予定です。コアロジックは実装済みです。
        </p>
      </div>
    </div>
  );
}
