import React from 'react';

interface DefectRiskBadgeProps {
  level: string;
}

const BADGE_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  High: { label: '欠陥リスク高', bg: 'bg-red-100', text: 'text-red-800' },
  Moderate: { label: '中程度', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  Low: { label: '欠陥リスク低', bg: 'bg-green-100', text: 'text-green-800' },
};

export default function DefectRiskBadge({ level }: DefectRiskBadgeProps) {
  const config = BADGE_CONFIG[level] ?? { label: level, bg: 'bg-gray-100', text: 'text-gray-800' };
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-md3-sm text-md3-label-md ${config.bg} ${config.text}`}>
      <span className="font-bold">{config.label}</span>
    </span>
  );
}
