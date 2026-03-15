import React from 'react';
import { PlasticizerCompatibilityLevel } from '../../core/types';

interface PlasticizerBadgeProps {
  level: PlasticizerCompatibilityLevel;
  red?: number;
}

const BADGE_CONFIG: Record<PlasticizerCompatibilityLevel, { label: string; bg: string; text: string }> = {
  [PlasticizerCompatibilityLevel.Excellent]: { label: '優秀', bg: 'bg-green-100', text: 'text-green-800' },
  [PlasticizerCompatibilityLevel.Good]: { label: '良好', bg: 'bg-teal-100', text: 'text-teal-800' },
  [PlasticizerCompatibilityLevel.Fair]: { label: '可能', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  [PlasticizerCompatibilityLevel.Poor]: { label: '不良', bg: 'bg-orange-100', text: 'text-orange-800' },
  [PlasticizerCompatibilityLevel.Incompatible]: { label: '不相溶', bg: 'bg-red-100', text: 'text-red-800' },
};

export default function PlasticizerBadge({ level, red }: PlasticizerBadgeProps) {
  const config = BADGE_CONFIG[level];
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-md3-sm text-md3-label-md ${config.bg} ${config.text}`}>
      <span>Level {level}</span>
      <span className="font-bold">{config.label}</span>
      {red !== undefined && <span className="opacity-75">(RED: {red.toFixed(3)})</span>}
    </span>
  );
}
