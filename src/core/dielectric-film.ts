/**
 * 誘電体薄膜品質スクリーニング
 *
 * 誘電体ポリマーの薄膜形成に用いる溶媒の適性を
 * HSP距離に基づいて評価する。溶媒-ポリマー間のHSP距離が近いほど
 * 均一で高品質な薄膜が得られる。
 *
 * RED < 1.0 → Good（良好な膜品質）
 * 1.0 ≤ RED ≤ 1.5 → Moderate（中程度）
 * RED > 1.5 → Poor（不良）
 */
import type { HSPValues } from './types';
import { calculateRa, calculateRed } from './hsp';

/** 薄膜品質レベル */
export enum FilmQualityLevel {
  /** RED < 1.0: 良好な膜品質 */
  Good = 1,
  /** 1.0 ≤ RED ≤ 1.5: 中程度の膜品質 */
  Moderate = 2,
  /** RED > 1.5: 不良な膜品質 */
  Poor = 3,
}

/** 誘電体スクリーニング個別結果 */
export interface DielectricScreeningResult {
  solvent: { name: string; hsp: HSPValues; boilingPoint?: number };
  ra: number;
  red: number;
  filmQuality: FilmQualityLevel;
}

/** 薄膜品質閾値 */
export interface FilmQualityThresholds {
  /** Good上限 (RED < この値 → Good) */
  goodMax: number;
  /** Moderate上限 (RED ≤ この値 → Moderate) */
  moderateMax: number;
}

/** デフォルト薄膜品質閾値 */
export const DEFAULT_FILM_QUALITY_THRESHOLDS: FilmQualityThresholds = {
  goodMax: 1.0,
  moderateMax: 1.5,
};

/**
 * RED値から薄膜品質レベルを分類する
 *
 * @param red - 相対エネルギー差 (Ra / R0)
 * @param thresholds - 分類閾値（省略時はデフォルト値を使用）
 * @returns 薄膜品質レベル
 * @throws {Error} REDが負の場合
 */
export function classifyFilmQuality(
  red: number,
  thresholds: FilmQualityThresholds = DEFAULT_FILM_QUALITY_THRESHOLDS,
): FilmQualityLevel {
  if (red < 0) throw new Error('RED must be non-negative');

  if (red < thresholds.goodMax) return FilmQualityLevel.Good;
  if (red <= thresholds.moderateMax) return FilmQualityLevel.Moderate;
  return FilmQualityLevel.Poor;
}

/**
 * 誘電体ポリマーに対する溶媒群の膜品質をスクリーニングし、
 * 品質順（Good→Moderate→Poor）、同レベル内はRED昇順でソートして返す。
 *
 * @param polymerHSP - ポリマーのHSP値
 * @param polymerR0 - ポリマーの相互作用半径
 * @param solvents - スクリーニング対象の溶媒リスト
 * @param thresholds - 分類閾値（省略時はデフォルト値を使用）
 * @returns 誘電体スクリーニング結果（品質順ソート済み）
 */
export function screenDielectricSolvents(
  polymerHSP: HSPValues,
  polymerR0: number,
  solvents: Array<{ name: string; hsp: HSPValues; boilingPoint?: number }>,
  thresholds?: FilmQualityThresholds,
): DielectricScreeningResult[] {
  const results: DielectricScreeningResult[] = solvents.map((solvent) => {
    const ra = calculateRa(polymerHSP, solvent.hsp);
    const red = calculateRed(polymerHSP, solvent.hsp, polymerR0);
    const filmQuality = classifyFilmQuality(red, thresholds);

    return {
      solvent: {
        name: solvent.name,
        hsp: solvent.hsp,
        ...(solvent.boilingPoint !== undefined && { boilingPoint: solvent.boilingPoint }),
      },
      ra,
      red,
      filmQuality,
    };
  });

  // 品質順（enum値昇順: Good=1, Moderate=2, Poor=3）、同レベル内はRED昇順
  results.sort((a, b) => {
    if (a.filmQuality !== b.filmQuality) return a.filmQuality - b.filmQuality;
    return a.red - b.red;
  });

  return results;
}
