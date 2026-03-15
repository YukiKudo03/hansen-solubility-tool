/**
 * RED値に基づく5段階リスク分類
 */
import { RiskLevel } from './types';
import type { RiskThresholds } from './types';

/** デフォルト閾値（文献調査に基づく） */
export const DEFAULT_THRESHOLDS: RiskThresholds = {
  dangerousMax: 0.5,
  warningMax: 0.8,
  cautionMax: 1.2,
  holdMax: 2.0,
};

/** リスクレベルの表示情報 */
export interface RiskLevelInfo {
  level: RiskLevel;
  label: string;
  description: string;
  color: string; // Tailwind CSS color class用
}

const RISK_LEVEL_INFO: Record<RiskLevel, RiskLevelInfo> = {
  [RiskLevel.Dangerous]: {
    level: RiskLevel.Dangerous,
    label: '危険',
    description: '間違いなく溶解する',
    color: 'red',
  },
  [RiskLevel.Warning]: {
    level: RiskLevel.Warning,
    label: '要警戒',
    description: 'おそらく溶解する',
    color: 'orange',
  },
  [RiskLevel.Caution]: {
    level: RiskLevel.Caution,
    label: '要注意',
    description: '溶解の危険がある',
    color: 'yellow',
  },
  [RiskLevel.Hold]: {
    level: RiskLevel.Hold,
    label: '保留',
    description: '長期間の使用で膨潤の危険',
    color: 'blue',
  },
  [RiskLevel.Safe]: {
    level: RiskLevel.Safe,
    label: '安全',
    description: 'おそらく溶解しない',
    color: 'green',
  },
};

/**
 * RED値からリスクレベルを判定する
 */
export function classifyRisk(
  red: number,
  thresholds: RiskThresholds = DEFAULT_THRESHOLDS,
): RiskLevel {
  if (red < 0) {
    throw new Error('RED値は非負でなければなりません');
  }
  if (red < thresholds.dangerousMax) return RiskLevel.Dangerous;
  if (red < thresholds.warningMax) return RiskLevel.Warning;
  if (red < thresholds.cautionMax) return RiskLevel.Caution;
  if (red < thresholds.holdMax) return RiskLevel.Hold;
  return RiskLevel.Safe;
}

/**
 * リスクレベルの表示情報を取得する
 */
export function getRiskLevelInfo(level: RiskLevel): RiskLevelInfo {
  return RISK_LEVEL_INFO[level];
}
