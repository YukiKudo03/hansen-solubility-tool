import React from 'react';
import { ChemicalResistanceLevel } from '../../core/types';

interface ChemicalResistanceBadgeProps {
  level: ChemicalResistanceLevel;
  red?: number;
}

// Color direction is INVERTED: Level 1 (NoResistance) = red (worst), Level 5 (Excellent) = green (best)
const BADGE_CONFIG: Record<ChemicalResistanceLevel, { label: string; bg: string; text: string }> = {
  [ChemicalResistanceLevel.NoResistance]: { label: '耐性なし', bg: 'bg-red-100', text: 'text-red-800' },
  [ChemicalResistanceLevel.Poor]: { label: '低耐性', bg: 'bg-orange-100', text: 'text-orange-800' },
  [ChemicalResistanceLevel.Moderate]: { label: '中程度', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  [ChemicalResistanceLevel.Good]: { label: '良好', bg: 'bg-teal-100', text: 'text-teal-800' },
  [ChemicalResistanceLevel.Excellent]: { label: '優秀', bg: 'bg-green-100', text: 'text-green-800' },
};

export default function ChemicalResistanceBadge({ level, red }: ChemicalResistanceBadgeProps) {
  const config = BADGE_CONFIG[level];
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-md3-sm text-md3-label-md ${config.bg} ${config.text}`}>
      <span>Level {level}</span>
      <span className="font-bold">{config.label}</span>
      {red !== undefined && <span className="opacity-75">(RED: {red.toFixed(3)})</span>}
    </span>
  );
}
