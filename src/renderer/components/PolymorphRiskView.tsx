import React from 'react';

export default function PolymorphRiskView() {
  return (
    <div className="space-y-4">
      <h2 className="text-md3-headline-sm text-md3-on-surface">多形/溶媒和物リスク評価</h2>
      <p className="text-md3-body-md text-md3-on-surface-variant">
        原薬(API)に対する溶媒の多形変換・溶媒和物形成リスクをRED値の中間帯(0.5-1.5)で評価します。
      </p>
      <div className="p-4 rounded-xl bg-md3-surface-container">
        <p className="text-md3-body-sm text-md3-on-surface-variant">
          このビューは今後実装予定です。コアロジックは実装済みです。
        </p>
      </div>
    </div>
  );
}
