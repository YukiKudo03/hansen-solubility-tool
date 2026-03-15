/**
 * 接触角に基づく濡れ性分類ロジック
 *
 * 接触角 θ の値から6段階の濡れ性レベルを判定する。
 */
import { WettabilityLevel } from './types';
import type { WettabilityThresholds } from './types';

/** デフォルト閾値 (°) */
export const DEFAULT_WETTABILITY_THRESHOLDS: WettabilityThresholds = {
  superHydrophilicMax: 10,
  hydrophilicMax: 30,
  wettableMax: 60,
  moderateMax: 90,
  hydrophobicMax: 150,
};

/** 濡れ性レベルの表示情報 */
export interface WettabilityLevelInfo {
  level: WettabilityLevel;
  label: string;
  description: string;
  color: string; // Tailwind CSS color class用
}

const WETTABILITY_LEVEL_INFO: Record<WettabilityLevel, WettabilityLevelInfo> = {
  [WettabilityLevel.SuperHydrophilic]: {
    level: WettabilityLevel.SuperHydrophilic,
    label: '超親水',
    description: '液滴が薄膜状に広がる',
    color: 'blue',
  },
  [WettabilityLevel.Hydrophilic]: {
    level: WettabilityLevel.Hydrophilic,
    label: '親水',
    description: '良好な濡れ性',
    color: 'cyan',
  },
  [WettabilityLevel.Wettable]: {
    level: WettabilityLevel.Wettable,
    label: '濡れ性良好',
    description: '中程度の濡れ性',
    color: 'green',
  },
  [WettabilityLevel.Moderate]: {
    level: WettabilityLevel.Moderate,
    label: '中間',
    description: '濡れ性と撥水性の境界',
    color: 'yellow',
  },
  [WettabilityLevel.Hydrophobic]: {
    level: WettabilityLevel.Hydrophobic,
    label: '疎水',
    description: '液滴が球状に近い',
    color: 'orange',
  },
  [WettabilityLevel.SuperHydrophobic]: {
    level: WettabilityLevel.SuperHydrophobic,
    label: '超撥水',
    description: '液滴がほぼ球形で転がる',
    color: 'red',
  },
};

/**
 * 接触角から濡れ性レベルを判定する
 * @param contactAngle 接触角 (°, 0〜180)
 * @param thresholds カスタム閾値（省略時はデフォルト）
 */
export function classifyWettability(
  contactAngle: number,
  thresholds: WettabilityThresholds = DEFAULT_WETTABILITY_THRESHOLDS,
): WettabilityLevel {
  if (contactAngle < 0) {
    throw new Error('接触角は非負でなければなりません');
  }
  if (contactAngle < thresholds.superHydrophilicMax) return WettabilityLevel.SuperHydrophilic;
  if (contactAngle < thresholds.hydrophilicMax) return WettabilityLevel.Hydrophilic;
  if (contactAngle < thresholds.wettableMax) return WettabilityLevel.Wettable;
  if (contactAngle < thresholds.moderateMax) return WettabilityLevel.Moderate;
  if (contactAngle < thresholds.hydrophobicMax) return WettabilityLevel.Hydrophobic;
  return WettabilityLevel.SuperHydrophobic;
}

/**
 * 濡れ性レベルの表示情報を取得する
 */
export function getWettabilityLevelInfo(level: WettabilityLevel): WettabilityLevelInfo {
  return WETTABILITY_LEVEL_INFO[level];
}
