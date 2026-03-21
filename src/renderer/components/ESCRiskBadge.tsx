import React from 'react';

interface ESCRiskBadgeProps {
  level: string;
}

const BADGE_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  Dissolution: { label: '溶解', bg: 'bg-red-100', text: 'text-red-800' },
  HighRisk: { label: '高リスク', bg: 'bg-orange-100', text: 'text-orange-800' },
  ModerateRisk: { label: '中リスク', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  Safe: { label: '安全', bg: 'bg-green-100', text: 'text-green-800' },
};

export default function ESCRiskBadge({ level }: ESCRiskBadgeProps) {
  const config = BADGE_CONFIG[level] ?? { label: level, bg: 'bg-gray-100', text: 'text-gray-800' };
  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-md3-sm text-md3-label-md ${config.bg} ${config.text}`}
    >
      <span className="font-bold">{config.label}</span>
    </span>
  );
}
