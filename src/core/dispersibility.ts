/**
 * ナノ粒子分散性の分類ロジック
 *
 * ポリマー系のRiskLevel（RED小=危険）とは意味が逆転し、
 * ナノ粒子分散系ではRED小=良好分散となる。
 */
import { DispersibilityLevel } from './types';
import type { DispersibilityThresholds } from './types';

/** デフォルト閾値 */
export const DEFAULT_DISPERSIBILITY_THRESHOLDS: DispersibilityThresholds = {
  excellentMax: 0.5,
  goodMax: 0.8,
  fairMax: 1.0,
  poorMax: 1.5,
};

/** 分散性レベルの表示情報 */
export interface DispersibilityLevelInfo {
  level: DispersibilityLevel;
  label: string;
  description: string;
  color: string; // Tailwind CSS color class用
}

const DISPERSIBILITY_LEVEL_INFO: Record<DispersibilityLevel, DispersibilityLevelInfo> = {
  [DispersibilityLevel.Excellent]: {
    level: DispersibilityLevel.Excellent,
    label: '優秀',
    description: '非常に安定した分散が期待できる',
    color: 'green',
  },
  [DispersibilityLevel.Good]: {
    level: DispersibilityLevel.Good,
    label: '良好',
    description: '良好な分散が期待できる',
    color: 'teal',
  },
  [DispersibilityLevel.Fair]: {
    level: DispersibilityLevel.Fair,
    label: '可能',
    description: '分散可能だが安定性に注意',
    color: 'yellow',
  },
  [DispersibilityLevel.Poor]: {
    level: DispersibilityLevel.Poor,
    label: '不良',
    description: '分散が困難（凝集の可能性）',
    color: 'orange',
  },
  [DispersibilityLevel.Bad]: {
    level: DispersibilityLevel.Bad,
    label: '不可',
    description: '分散不可（沈降・凝集する）',
    color: 'red',
  },
};

/**
 * RED値から分散性レベルを判定する
 */
export function classifyDispersibility(
  red: number,
  thresholds: DispersibilityThresholds = DEFAULT_DISPERSIBILITY_THRESHOLDS,
): DispersibilityLevel {
  if (red < 0) {
    throw new Error('RED値は非負でなければなりません');
  }
  if (red < thresholds.excellentMax) return DispersibilityLevel.Excellent;
  if (red < thresholds.goodMax) return DispersibilityLevel.Good;
  if (red < thresholds.fairMax) return DispersibilityLevel.Fair;
  if (red < thresholds.poorMax) return DispersibilityLevel.Poor;
  return DispersibilityLevel.Bad;
}

/**
 * 分散性レベルの表示情報を取得する
 */
export function getDispersibilityLevelInfo(level: DispersibilityLevel): DispersibilityLevelInfo {
  return DISPERSIBILITY_LEVEL_INFO[level];
}
