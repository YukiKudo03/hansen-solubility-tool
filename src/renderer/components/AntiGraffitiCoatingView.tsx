import React from 'react';

export default function AntiGraffitiCoatingView() {
  return (
    <div className="space-y-4">
      <h2 className="text-md3-headline-sm text-md3-on-surface">防落書きコーティング設計</h2>
      <p className="text-md3-body-md text-md3-on-surface-variant">
        コーティング材料と落書き材料のHSP距離から防落書き効果を評価します。RED値が大きいほど防落書き効果が高くなります。
      </p>
      <div className="p-4 rounded-xl bg-md3-surface-container">
        <p className="text-md3-body-sm text-md3-on-surface-variant">
          このビューは今後実装予定です。コアロジックは実装済みです。
        </p>
      </div>
    </div>
  );
}
