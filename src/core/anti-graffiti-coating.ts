/**
 * 防落書きコーティング設計
 *
 * コーティング材料が落書き材料（スプレーペイント、マーカーインク等）を
 * 「はじく」効果をHSP距離ベースで評価する。
 *
 * 原理: RED値が大きいほどコーティングと落書き材料の相溶性が低く、
 * 落書きが定着しにくい → 防落書き効果が高い。
 *
 * 判定基準:
 * - RED > 2.0: 優秀（落書き材料を強く撥ね返す）
 * - 1.5 < RED ≤ 2.0: 良好
 * - 1.0 < RED ≤ 1.5: 中程度（部分的な防御効果）
 * - RED ≤ 1.0: 不良（落書き材料が定着しやすい）
 *
 * 参考文献:
 * - Hansen (2007) Hansen Solubility Parameters: A User's Handbook, Ch. 18
 * - Abbott & Hansen (2008) Anti-graffiti coatings design with HSP
 */

import type { HSPValues } from './types';
import { calculateRa, calculateRed } from './hsp';

/** 防落書き効果レベル */
export enum AntiGraffitiLevel {
  Excellent = 1,  // 優秀（RED > 2.0）
  Good = 2,       // 良好（1.5 < RED ≤ 2.0）
  Moderate = 3,   // 中程度（1.0 < RED ≤ 1.5）
  Poor = 4,       // 不良（RED ≤ 1.0）
}

/** 防落書き閾値 */
export interface AntiGraffitiThresholds {
  poorMax: number;      // default: 1.0
  moderateMax: number;  // default: 1.5
  goodMax: number;      // default: 2.0
}

/** デフォルト閾値 */
export const DEFAULT_ANTI_GRAFFITI_THRESHOLDS: AntiGraffitiThresholds = {
  poorMax: 1.0,
  moderateMax: 1.5,
  goodMax: 2.0,
};

/** 防落書き個別結果 */
export interface AntiGraffitiResult {
  graffitiMaterial: { name: string; hsp: HSPValues };
  ra: number;
  red: number;
  level: AntiGraffitiLevel;
}

/** レベル情報 */
const ANTI_GRAFFITI_LEVEL_INFO: Record<AntiGraffitiLevel, { label: string; labelEn: string; description: string }> = {
  [AntiGraffitiLevel.Excellent]: { label: '優秀', labelEn: 'Excellent', description: '落書き材料を強く撥ね返す' },
  [AntiGraffitiLevel.Good]: { label: '良好', labelEn: 'Good', description: '良好な防落書き効果' },
  [AntiGraffitiLevel.Moderate]: { label: '中程度', labelEn: 'Moderate', description: '部分的な防御効果' },
  [AntiGraffitiLevel.Poor]: { label: '不良', labelEn: 'Poor', description: '落書き材料が定着しやすい' },
};

/**
 * 防落書き効果レベル情報を取得する
 */
export function getAntiGraffitiLevelInfo(level: AntiGraffitiLevel): { label: string; labelEn: string; description: string } {
  return ANTI_GRAFFITI_LEVEL_INFO[level];
}

/**
 * RED値から防落書き効果レベルを分類する
 * RED大 = 防落書き効果高（逆方向判定）
 */
export function classifyAntiGraffiti(
  red: number,
  thresholds: AntiGraffitiThresholds = DEFAULT_ANTI_GRAFFITI_THRESHOLDS,
): AntiGraffitiLevel {
  if (red <= thresholds.poorMax) return AntiGraffitiLevel.Poor;
  if (red <= thresholds.moderateMax) return AntiGraffitiLevel.Moderate;
  if (red <= thresholds.goodMax) return AntiGraffitiLevel.Good;
  return AntiGraffitiLevel.Excellent;
}

/**
 * 防落書きコーティングをスクリーニングする
 *
 * @param coatingHSP - コーティング材料のHSP
 * @param coatingR0 - コーティングの相互作用半径
 * @param graffitiMaterials - 落書き材料リスト
 * @param thresholds - 閾値（省略時はデフォルト）
 * @returns 防落書き効果の高い順（Excellent→Poor）にソートされた結果
 */
export function screenAntiGraffitiCoatings(
  coatingHSP: HSPValues,
  coatingR0: number,
  graffitiMaterials: Array<{ name: string; hsp: HSPValues }>,
  thresholds: AntiGraffitiThresholds = DEFAULT_ANTI_GRAFFITI_THRESHOLDS,
): AntiGraffitiResult[] {
  const results: AntiGraffitiResult[] = graffitiMaterials.map((material) => {
    const ra = calculateRa(coatingHSP, material.hsp);
    const red = calculateRed(coatingHSP, material.hsp, coatingR0);
    const level = classifyAntiGraffiti(red, thresholds);

    return {
      graffitiMaterial: { name: material.name, hsp: material.hsp },
      ra,
      red,
      level,
    };
  });

  // 効果の高い順（Excellent=1 → Poor=4）、同レベル内はRED降順（REDが大きい方が効果的）
  results.sort((a, b) => {
    if (a.level !== b.level) return a.level - b.level;
    return b.red - a.red;
  });

  return results;
}
