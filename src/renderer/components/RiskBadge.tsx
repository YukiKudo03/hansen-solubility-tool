import React from 'react';
import { RiskLevel } from '../../core/types';

interface RiskBadgeProps {
  level: RiskLevel;
  red?: number;
}

const BADGE_CONFIG: Record<RiskLevel, { label: string; bg: string; text: string }> = {
  [RiskLevel.Dangerous]: { label: '危険', bg: 'bg-red-100', text: 'text-red-800' },
  [RiskLevel.Warning]: { label: '要警戒', bg: 'bg-orange-100', text: 'text-orange-800' },
  [RiskLevel.Caution]: { label: '要注意', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  [RiskLevel.Hold]: { label: '保留', bg: 'bg-blue-100', text: 'text-blue-800' },
  [RiskLevel.Safe]: { label: '安全', bg: 'bg-green-100', text: 'text-green-800' },
};

export default function RiskBadge({ level, red }: RiskBadgeProps) {
  const config = BADGE_CONFIG[level];
  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-md3-sm text-md3-label-md ${config.bg} ${config.text}`}
    >
      <span>Level {level}</span>
      <span className="font-bold">{config.label}</span>
      {red !== undefined && (
        <span className="opacity-75">(RED: {red.toFixed(3)})</span>
      )}
    </span>
  );
}
