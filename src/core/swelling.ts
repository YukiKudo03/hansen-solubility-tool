/**
 * 膨潤度予測の分類ロジック
 *
 * エラストマー/ゴム材料向け。RED小=膨潤大。
 */
import { SwellingLevel } from './types';
import type { SwellingThresholds } from './types';

export const DEFAULT_SWELLING_THRESHOLDS: SwellingThresholds = {
  severeMax: 0.5,
  highMax: 0.8,
  moderateMax: 1.0,
  lowMax: 1.5,
};

export interface SwellingLevelInfo {
  level: SwellingLevel;
  label: string;
  description: string;
  color: string;
}

const SWELLING_LEVEL_INFO: Record<SwellingLevel, SwellingLevelInfo> = {
  [SwellingLevel.Severe]: { level: SwellingLevel.Severe, label: '著しい膨潤', description: '溶解に近い状態・使用不可', color: 'red' },
  [SwellingLevel.High]: { level: SwellingLevel.High, label: '高膨潤', description: '大きな体積変化・要注意', color: 'orange' },
  [SwellingLevel.Moderate]: { level: SwellingLevel.Moderate, label: '中程度', description: '軟化や寸法変化の可能性', color: 'yellow' },
  [SwellingLevel.Low]: { level: SwellingLevel.Low, label: '軽微', description: '実用上問題なし', color: 'teal' },
  [SwellingLevel.Negligible]: { level: SwellingLevel.Negligible, label: '膨潤なし', description: '耐薬品性良好', color: 'green' },
};

export function classifySwelling(red: number, thresholds: SwellingThresholds = DEFAULT_SWELLING_THRESHOLDS): SwellingLevel {
  if (red < 0) throw new Error('RED値は非負でなければなりません');
  if (red < thresholds.severeMax) return SwellingLevel.Severe;
  if (red < thresholds.highMax) return SwellingLevel.High;
  if (red < thresholds.moderateMax) return SwellingLevel.Moderate;
  if (red < thresholds.lowMax) return SwellingLevel.Low;
  return SwellingLevel.Negligible;
}

export function getSwellingLevelInfo(level: SwellingLevel): SwellingLevelInfo {
  return SWELLING_LEVEL_INFO[level];
}
