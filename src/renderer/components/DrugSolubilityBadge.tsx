import React from 'react';
import { DrugSolubilityLevel } from '../../core/types';

interface DrugSolubilityBadgeProps {
  level: DrugSolubilityLevel;
  red?: number;
}

const BADGE_CONFIG: Record<DrugSolubilityLevel, { label: string; bg: string; text: string }> = {
  [DrugSolubilityLevel.Excellent]: { label: '優秀', bg: 'bg-green-100', text: 'text-green-800' },
  [DrugSolubilityLevel.Good]: { label: '良好', bg: 'bg-teal-100', text: 'text-teal-800' },
  [DrugSolubilityLevel.Partial]: { label: '部分的', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  [DrugSolubilityLevel.Poor]: { label: '不良', bg: 'bg-orange-100', text: 'text-orange-800' },
  [DrugSolubilityLevel.Insoluble]: { label: '不溶', bg: 'bg-red-100', text: 'text-red-800' },
};

export default function DrugSolubilityBadge({ level, red }: DrugSolubilityBadgeProps) {
  const config = BADGE_CONFIG[level];
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-md3-sm text-md3-label-md ${config.bg} ${config.text}`}>
      <span>Level {level}</span>
      <span className="font-bold">{config.label}</span>
      {red !== undefined && <span className="opacity-75">(RED: {red.toFixed(3)})</span>}
    </span>
  );
}
