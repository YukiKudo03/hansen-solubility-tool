import React from 'react';
import { DispersibilityLevel } from '../../core/types';

interface DispersibilityBadgeProps {
  level: DispersibilityLevel;
  red?: number;
}

const BADGE_CONFIG: Record<DispersibilityLevel, { label: string; bg: string; text: string }> = {
  [DispersibilityLevel.Excellent]: { label: '優秀', bg: 'bg-green-100', text: 'text-green-800' },
  [DispersibilityLevel.Good]: { label: '良好', bg: 'bg-teal-100', text: 'text-teal-800' },
  [DispersibilityLevel.Fair]: { label: '可能', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  [DispersibilityLevel.Poor]: { label: '不良', bg: 'bg-orange-100', text: 'text-orange-800' },
  [DispersibilityLevel.Bad]: { label: '不可', bg: 'bg-red-100', text: 'text-red-800' },
};

export default function DispersibilityBadge({ level, red }: DispersibilityBadgeProps) {
  const config = BADGE_CONFIG[level] ?? BADGE_CONFIG[DispersibilityLevel.Bad];
  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-md3-sm text-md3-label-md ${config.bg} ${config.text}`}
    >
      <span className="font-bold">{config.label}</span>
      {red !== undefined && (
        <span className="opacity-75">(RED: {red.toFixed(3)})</span>
      )}
    </span>
  );
}
