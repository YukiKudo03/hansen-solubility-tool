import React from 'react';
import GenericLevelBadge from './GenericLevelBadge';
import type { BadgeLevelConfig } from './GenericLevelBadge';

const CONFIG: Record<string | number, BadgeLevelConfig> = {
  1: { label: '高リスク', bg: 'bg-red-100', text: 'text-red-800' },
  2: { label: '中程度', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  3: { label: '低リスク', bg: 'bg-green-100', text: 'text-green-800' },
};

export default function MigrationRiskBadge({ level }: { level: number }) {
  return <GenericLevelBadge level={level} config={CONFIG} />;
}
