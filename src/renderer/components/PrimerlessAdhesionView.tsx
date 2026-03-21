import React from 'react';

export default function PrimerlessAdhesionView() {
  return (
    <div className="space-y-4">
      <h2 className="text-md3-headline-sm text-md3-on-surface">プライマーレス接着設計</h2>
      <p className="text-md3-body-md text-md3-on-surface-variant">
        接着剤と基材のHSP距離および接着仕事(Wa)に基づき、プライマー不要の最適接着剤HSPを提案します。
      </p>
      <div className="p-4 rounded-xl bg-md3-surface-container">
        <p className="text-md3-body-sm text-md3-on-surface-variant">
          このビューは今後実装予定です。コアロジックは実装済みです。
        </p>
      </div>
    </div>
  );
}
