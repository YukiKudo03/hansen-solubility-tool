import React from 'react';
import { DispersantAffinityLevel } from '../../core/types';

interface DispersantBadgeProps {
  level: DispersantAffinityLevel;
  red?: number;
}

const BADGE_CONFIG: Record<DispersantAffinityLevel, { label: string; bg: string; text: string }> = {
  [DispersantAffinityLevel.Excellent]: { label: '優秀', bg: 'bg-green-100', text: 'text-green-800' },
  [DispersantAffinityLevel.Good]: { label: '良好', bg: 'bg-teal-100', text: 'text-teal-800' },
  [DispersantAffinityLevel.Fair]: { label: '可能', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  [DispersantAffinityLevel.Poor]: { label: '不良', bg: 'bg-orange-100', text: 'text-orange-800' },
  [DispersantAffinityLevel.Bad]: { label: '不適', bg: 'bg-red-100', text: 'text-red-800' },
};

export default function DispersantBadge({ level, red }: DispersantBadgeProps) {
  const config = BADGE_CONFIG[level] ?? BADGE_CONFIG[DispersantAffinityLevel.Bad];
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
