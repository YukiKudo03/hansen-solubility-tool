import React from 'react';
import { WettabilityLevel } from '../../core/types';

interface WettabilityBadgeProps {
  level: WettabilityLevel;
  angle?: number;
}

const BADGE_CONFIG: Record<WettabilityLevel, { label: string; bg: string; text: string }> = {
  [WettabilityLevel.SuperHydrophilic]: { label: '超親水', bg: 'bg-blue-100', text: 'text-blue-800' },
  [WettabilityLevel.Hydrophilic]: { label: '親水', bg: 'bg-cyan-100', text: 'text-cyan-800' },
  [WettabilityLevel.Wettable]: { label: '濡れ性良好', bg: 'bg-green-100', text: 'text-green-800' },
  [WettabilityLevel.Moderate]: { label: '中間', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  [WettabilityLevel.Hydrophobic]: { label: '疎水', bg: 'bg-orange-100', text: 'text-orange-800' },
  [WettabilityLevel.SuperHydrophobic]: { label: '超撥水', bg: 'bg-red-100', text: 'text-red-800' },
};

export default function WettabilityBadge({ level, angle }: WettabilityBadgeProps) {
  const config = BADGE_CONFIG[level] ?? BADGE_CONFIG[WettabilityLevel.SuperHydrophobic];
  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-md3-sm text-md3-label-md ${config.bg} ${config.text}`}
    >
      <span className="font-bold">{config.label}</span>
      {angle !== undefined && (
        <span className="opacity-75">({angle.toFixed(1)}°)</span>
      )}
    </span>
  );
}
