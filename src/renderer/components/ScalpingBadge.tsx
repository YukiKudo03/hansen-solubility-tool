import React from 'react';
import GenericLevelBadge from './GenericLevelBadge';
import type { BadgeLevelConfig } from './GenericLevelBadge';

const CONFIG: Record<string, BadgeLevelConfig> = {
  High: { label: '高リスク', bg: 'bg-red-100', text: 'text-red-800' },
  Moderate: { label: '中程度', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  Low: { label: '低リスク', bg: 'bg-green-100', text: 'text-green-800' },
};

export default function ScalpingBadge({ level }: { level: string }) {
  return <GenericLevelBadge level={level} config={CONFIG} />;
}
