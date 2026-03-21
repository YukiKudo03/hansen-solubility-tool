import React from 'react';

interface ContrastQualityBadgeProps {
  quality: number; // ContrastQuality enum value (1-4)
}

const BADGE_CONFIG: Record<number, { label: string; bg: string; text: string }> = {
  1: { label: '高解像度', bg: 'bg-green-100', text: 'text-green-800' },
  2: { label: '実用レベル', bg: 'bg-blue-100', text: 'text-blue-800' },
  3: { label: '低解像度', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  4: { label: '反転（ネガ型）', bg: 'bg-red-100', text: 'text-red-800' },
};

export default function ContrastQualityBadge({ quality }: ContrastQualityBadgeProps) {
  const config = BADGE_CONFIG[quality] ?? { label: `Quality ${quality}`, bg: 'bg-gray-100', text: 'text-gray-800' };
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-md3-sm text-md3-label-md ${config.bg} ${config.text}`}>
      <span className="font-bold">{config.label}</span>
    </span>
  );
}
