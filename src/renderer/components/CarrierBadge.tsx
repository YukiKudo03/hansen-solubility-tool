import React from 'react';
import { CarrierCompatibilityLevel } from '../../core/types';

interface CarrierBadgeProps {
  level: CarrierCompatibilityLevel;
  red?: number;
}

const BADGE_CONFIG: Record<CarrierCompatibilityLevel, { label: string; bg: string; text: string }> = {
  [CarrierCompatibilityLevel.Excellent]: { label: '優秀', bg: 'bg-green-100', text: 'text-green-800' },
  [CarrierCompatibilityLevel.Good]: { label: '良好', bg: 'bg-teal-100', text: 'text-teal-800' },
  [CarrierCompatibilityLevel.Fair]: { label: '可能', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  [CarrierCompatibilityLevel.Poor]: { label: '不良', bg: 'bg-orange-100', text: 'text-orange-800' },
  [CarrierCompatibilityLevel.Incompatible]: { label: '不適', bg: 'bg-red-100', text: 'text-red-800' },
};

export default function CarrierBadge({ level, red }: CarrierBadgeProps) {
  const config = BADGE_CONFIG[level];
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-md3-sm text-md3-label-md ${config.bg} ${config.text}`}>
      <span>Level {level}</span>
      <span className="font-bold">{config.label}</span>
      {red !== undefined && <span className="opacity-75">(RED: {red.toFixed(3)})</span>}
    </span>
  );
}
