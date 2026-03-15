import React from 'react';
import { SwellingLevel } from '../../core/types';

interface SwellingBadgeProps {
  level: SwellingLevel;
  red?: number;
}

const BADGE_CONFIG: Record<SwellingLevel, { label: string; bg: string; text: string }> = {
  [SwellingLevel.Severe]: { label: '著しい膨潤', bg: 'bg-red-100', text: 'text-red-800' },
  [SwellingLevel.High]: { label: '高膨潤', bg: 'bg-orange-100', text: 'text-orange-800' },
  [SwellingLevel.Moderate]: { label: '中程度', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  [SwellingLevel.Low]: { label: '軽微', bg: 'bg-teal-100', text: 'text-teal-800' },
  [SwellingLevel.Negligible]: { label: '膨潤なし', bg: 'bg-green-100', text: 'text-green-800' },
};

export default function SwellingBadge({ level, red }: SwellingBadgeProps) {
  const config = BADGE_CONFIG[level];
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-md3-sm text-md3-label-md ${config.bg} ${config.text}`}>
      <span>Level {level}</span>
      <span className="font-bold">{config.label}</span>
      {red !== undefined && <span className="opacity-75">(RED: {red.toFixed(3)})</span>}
    </span>
  );
}
