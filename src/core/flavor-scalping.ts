/**
 * フレーバースカルピング予測 — flavor-scalping-prediction のアダプタ
 *
 * Part/Solvent ベースのインターフェースを提供し、内部で flavor-scalping-prediction に委譲する。
 */
import {
  classifyScalping as _classifyScalping,
  getScalpingLevelInfo as _getScalpingLevelInfo,
  screenFlavorScalping as _screenFlavorScalping,
  ScalpingLevel,
  DEFAULT_SCALPING_THRESHOLDS,
} from './flavor-scalping-prediction';
import type { ScalpingThresholds, ScalpingLevelInfo } from './flavor-scalping-prediction';
import type { Part, Solvent } from './types';

export { ScalpingLevel, DEFAULT_SCALPING_THRESHOLDS };
export type { ScalpingThresholds };

/** 個別スクリーニング結果 */
export interface FlavorScalpingResult {
  aroma: Solvent;
  packaging: Part;
  ra: number;
  red: number;
  scalpingLevel: ScalpingLevel;
}

/** 全体スクリーニング結果 */
export interface FlavorScalpingEvaluationResult {
  packaging: Part;
  results: FlavorScalpingResult[];
  evaluatedAt: Date;
  thresholdsUsed: ScalpingThresholds;
}

/** スカルピング分類 (委譲) */
export function classifyScalping(red: number, thresholds: ScalpingThresholds): ScalpingLevel {
  return _classifyScalping(red, thresholds);
}

/** レベル情報取得 (委譲) */
export function getScalpingLevelInfo(level: ScalpingLevel): ScalpingLevelInfo {
  return _getScalpingLevelInfo(level);
}

/** 全アロマ成分をスクリーニング — Part/Solvent ラッパー */
export function screenFlavorScalping(
  packaging: Part,
  aromas: Solvent[],
  thresholds: ScalpingThresholds,
): FlavorScalpingEvaluationResult {
  const inputs = aromas.map((s) => ({ name: s.name, hsp: s.hsp }));
  const coreResults = _screenFlavorScalping(packaging.hsp, packaging.r0, inputs, thresholds);

  const results: FlavorScalpingResult[] = coreResults.map((cr) => ({
    aroma: aromas.find((a) => a.name === cr.flavorName)!,
    packaging,
    ra: cr.ra,
    red: cr.red,
    scalpingLevel: cr.scalpingLevel,
  }));

  return {
    packaging,
    results,
    evaluatedAt: new Date(),
    thresholdsUsed: thresholds,
  };
}
