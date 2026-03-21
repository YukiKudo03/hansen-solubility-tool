/**
 * 3Dプリント溶剤平滑化スクリーニング
 *
 * FDM 3Dプリントのフィラメント材料に対する溶剤の平滑化効果を
 * HSP距離に基づいて評価する。
 *
 * RED < 0.5 → Dissolves（溶解してしまう）
 * 0.5 ≤ RED ≤ 1.0 → GoodSmoothing（良好な平滑化）
 * 1.0 < RED ≤ 1.5 → MildSmoothing（軽度の平滑化）
 * RED > 1.5 → NoEffect（効果なし）
 */
import type { HSPValues } from './types';
import { calculateRa, calculateRed } from './hsp';

/** 平滑化効果レベル */
export enum SmoothingEffectLevel {
  /** RED < 0.5: 溶解（平滑化には過剰） */
  Dissolves = 1,
  /** 0.5 ≤ RED ≤ 1.0: 良好な平滑化 */
  GoodSmoothing = 2,
  /** 1.0 < RED ≤ 1.5: 軽度の平滑化 */
  MildSmoothing = 3,
  /** RED > 1.5: 効果なし */
  NoEffect = 4,
}

/** 平滑化スクリーニング個別結果 */
export interface SmoothingScreeningResult {
  solvent: { name: string; hsp: HSPValues };
  ra: number;
  red: number;
  effect: SmoothingEffectLevel;
}

/** 平滑化スクリーニング閾値 */
export interface SmoothingThresholds {
  /** Dissolves上限 (RED < この値 → Dissolves) */
  dissolvesMax: number;
  /** GoodSmoothing上限 (RED ≤ この値 → GoodSmoothing) */
  goodMax: number;
  /** MildSmoothing上限 (RED ≤ この値 → MildSmoothing) */
  mildMax: number;
}

/** デフォルト平滑化閾値 */
export const DEFAULT_SMOOTHING_THRESHOLDS: SmoothingThresholds = {
  dissolvesMax: 0.5,
  goodMax: 1.0,
  mildMax: 1.5,
};

/**
 * RED値から平滑化効果レベルを分類する
 *
 * @param red - 相対エネルギー差 (Ra / R0)
 * @param thresholds - 分類閾値（省略時はデフォルト値を使用）
 * @returns 平滑化効果レベル
 * @throws {Error} REDが負の場合
 */
export function classifySmoothingEffect(
  red: number,
  thresholds: SmoothingThresholds = DEFAULT_SMOOTHING_THRESHOLDS,
): SmoothingEffectLevel {
  if (red < 0) throw new Error('RED must be non-negative');

  if (red < thresholds.dissolvesMax) return SmoothingEffectLevel.Dissolves;
  if (red <= thresholds.goodMax) return SmoothingEffectLevel.GoodSmoothing;
  if (red <= thresholds.mildMax) return SmoothingEffectLevel.MildSmoothing;
  return SmoothingEffectLevel.NoEffect;
}

/**
 * フィラメント材料に対する溶剤群の平滑化効果をスクリーニングし、
 * 効果順（Dissolves→GoodSmoothing→MildSmoothing→NoEffect）、
 * 同レベル内はRED昇順でソートして返す。
 *
 * @param filamentHSP - フィラメント材料のHSP値
 * @param filamentR0 - フィラメント材料の相互作用半径
 * @param solvents - スクリーニング対象の溶剤リスト
 * @param thresholds - 分類閾値（省略時はデフォルト値を使用）
 * @returns 平滑化スクリーニング結果（効果順ソート済み）
 */
export function screen3DPrintingSolvents(
  filamentHSP: HSPValues,
  filamentR0: number,
  solvents: Array<{ name: string; hsp: HSPValues }>,
  thresholds?: SmoothingThresholds,
): SmoothingScreeningResult[] {
  const results: SmoothingScreeningResult[] = solvents.map((solvent) => {
    const ra = calculateRa(filamentHSP, solvent.hsp);
    const red = calculateRed(filamentHSP, solvent.hsp, filamentR0);
    const effect = classifySmoothingEffect(red, thresholds);

    return {
      solvent: { name: solvent.name, hsp: solvent.hsp },
      ra,
      red,
      effect,
    };
  });

  // 効果順（enum値昇順）、同レベル内はRED昇順
  results.sort((a, b) => {
    if (a.effect !== b.effect) return a.effect - b.effect;
    return a.red - b.red;
  });

  return results;
}
