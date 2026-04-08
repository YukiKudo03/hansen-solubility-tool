/**
 * Model Accuracy — 計算予測 vs 実験結果の精度メトリクス
 */
import type { HSPValues } from './types';
import { calculateRed } from './hsp';

/** 実験結果と溶媒HSPの組み合わせ */
export interface ExperimentalDataPoint {
  solventHSP: HSPValues;
  solventName: string;
  /** 実験結果 */
  experimentalResult: 'good' | 'partial' | 'bad';
  /** RED値（計算済み） */
  red: number;
}

/** 最大乖離エントリ */
export interface DivergenceEntry {
  solventName: string;
  red: number;
  predicted: 'good' | 'bad';
  experimental: 'good' | 'partial' | 'bad';
}

/** Model Accuracyメトリクス */
export interface ModelAccuracyMetrics {
  /** 一致率 (0-100%) */
  matchRate: number;
  /** False Positive数: モデルが"good"予測、実験は"bad" */
  falsePositives: number;
  /** False Negative数: モデルが"bad"予測、実験は"good" */
  falseNegatives: number;
  /** 最大乖離 Top3 */
  topDivergences: DivergenceEntry[];
  /** 実験データ総数 */
  totalCount: number;
  /** 一致数 */
  matchCount: number;
}

/**
 * Model Accuracyメトリクスを計算する
 *
 * 判定ロジック:
 * - RED < 1.0 → モデル予測 "good"
 * - RED >= 1.0 → モデル予測 "bad"
 * - partial はデフォルトで "good" として扱う（treatPartialAs パラメータで変更可能）
 */
export function calculateModelAccuracy(
  dataPoints: ExperimentalDataPoint[],
  treatPartialAs: 'good' | 'bad' = 'good',
): ModelAccuracyMetrics {
  if (dataPoints.length === 0) {
    return {
      matchRate: 0,
      falsePositives: 0,
      falseNegatives: 0,
      topDivergences: [],
      totalCount: 0,
      matchCount: 0,
    };
  }

  let matchCount = 0;
  let falsePositives = 0;
  let falseNegatives = 0;
  const divergences: DivergenceEntry[] = [];

  for (const dp of dataPoints) {
    const predicted: 'good' | 'bad' = dp.red < 1.0 ? 'good' : 'bad';

    // partial の扱い
    const effectiveExperimental: 'good' | 'bad' =
      dp.experimentalResult === 'partial' ? treatPartialAs :
      dp.experimentalResult === 'good' ? 'good' : 'bad';

    if (predicted === effectiveExperimental) {
      matchCount++;
    } else {
      if (predicted === 'good' && effectiveExperimental === 'bad') {
        falsePositives++;
      } else {
        falseNegatives++;
      }

      divergences.push({
        solventName: dp.solventName,
        red: dp.red,
        predicted,
        experimental: dp.experimentalResult,
      });
    }
  }

  // 乖離度でソート: RED=1.0 からの距離が大きい順
  divergences.sort((a, b) => Math.abs(b.red - 1.0) - Math.abs(a.red - 1.0));

  return {
    matchRate: (matchCount / dataPoints.length) * 100,
    falsePositives,
    falseNegatives,
    topDivergences: divergences.slice(0, 3),
    totalCount: dataPoints.length,
    matchCount,
  };
}

/**
 * 実験結果 + ポリマーHSP/R₀ から ExperimentalDataPoint 配列を構築する
 */
export function buildDataPoints(
  experimentalResults: Array<{
    solventHSP: HSPValues;
    solventName: string;
    result: 'good' | 'partial' | 'bad';
  }>,
  polymerHSP: HSPValues,
  r0: number,
): ExperimentalDataPoint[] {
  return experimentalResults.map((er) => ({
    solventHSP: er.solventHSP,
    solventName: er.solventName,
    experimentalResult: er.result,
    red: calculateRed(polymerHSP, er.solventHSP, r0),
  }));
}
