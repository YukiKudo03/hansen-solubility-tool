/**
 * 化粧品エマルション安定性評価
 *
 * 3成分系（油・乳化剤・水）のHSP距離からエマルション型と安定性を判定する。
 *
 * 原理:
 * - Ra(oil, emulsifier) と Ra(emulsifier, water) を計算
 * - 乳化剤が油相に近い場合 → W/O型
 * - 乳化剤が水相に近い場合 → O/W型
 *
 * 安定性判定:
 * - 乳化剤がどちらかに十分近ければ安定（Ra < 4）
 * - 中間であれば中程度（Ra 4-8）
 * - どちらにも遠ければ不安定（Ra >= 8）
 */
import type { HSPValues } from './types';
import { calculateRa } from './hsp';

/** エマルション型 */
export type EmulsionType = 'OW' | 'WO';

/** 安定性レベル */
export type StabilityLevel = 'Stable' | 'Moderate' | 'Unstable';

/** 安定性閾値 */
export interface EmulsionStabilityThresholds {
  stableMax: number;    // default: 4.0 — Ra < this → Stable
  moderateMax: number;  // default: 8.0 — Ra < this → Moderate, else Unstable
}

/** デフォルト閾値 */
export const DEFAULT_EMULSION_THRESHOLDS: EmulsionStabilityThresholds = {
  stableMax: 4.0,
  moderateMax: 8.0,
};

/** エマルション安定性評価結果 */
export interface EmulsionStabilityResult {
  raOilEmulsifier: number;
  raEmulsifierWater: number;
  emulsionType: EmulsionType;
  stability: StabilityLevel;
  /** 安定性の支配的Ra（乳化剤側の接近度） */
  dominantRa: number;
  evaluatedAt: Date;
}

/**
 * エマルション型を判定する
 *
 * Bancroft's rule: 乳化剤が溶解しやすい方が連続相になる
 * - Ra(oil, emulsifier) < Ra(emulsifier, water) → W/O (乳化剤が油側に近い)
 * - それ以外 → O/W (乳化剤が水側に近い)
 */
export function classifyEmulsionType(
  raOilEmulsifier: number,
  raEmulsifierWater: number,
): EmulsionType {
  return raOilEmulsifier < raEmulsifierWater ? 'WO' : 'OW';
}

/**
 * 安定性レベルを判定する
 *
 * 安定性は乳化剤がどちらかの相により近いかで決まる。
 * 支配的Ra = min(Ra_oil_emulsifier, Ra_emulsifier_water)
 */
export function classifyStability(
  dominantRa: number,
  thresholds: EmulsionStabilityThresholds = DEFAULT_EMULSION_THRESHOLDS,
): StabilityLevel {
  if (dominantRa < 0) throw new Error('Ra値は非負でなければなりません');
  if (dominantRa < thresholds.stableMax) return 'Stable';
  if (dominantRa < thresholds.moderateMax) return 'Moderate';
  return 'Unstable';
}

/**
 * エマルション安定性を評価する
 *
 * @param oilHSP - 油相のHSP値
 * @param emulsifierHSP - 乳化剤のHSP値
 * @param waterHSP - 水相のHSP値
 * @param thresholds - 安定性閾値（省略時デフォルト）
 * @returns エマルション安定性評価結果
 */
export function evaluateEmulsionStability(
  oilHSP: HSPValues,
  emulsifierHSP: HSPValues,
  waterHSP: HSPValues,
  thresholds: EmulsionStabilityThresholds = DEFAULT_EMULSION_THRESHOLDS,
): EmulsionStabilityResult {
  const raOilEmulsifier = calculateRa(oilHSP, emulsifierHSP);
  const raEmulsifierWater = calculateRa(emulsifierHSP, waterHSP);
  const emulsionType = classifyEmulsionType(raOilEmulsifier, raEmulsifierWater);
  const dominantRa = Math.min(raOilEmulsifier, raEmulsifierWater);
  const stability = classifyStability(dominantRa, thresholds);

  return {
    raOilEmulsifier,
    raEmulsifierWater,
    emulsionType,
    stability,
    dominantRa,
    evaluatedAt: new Date(),
  };
}
