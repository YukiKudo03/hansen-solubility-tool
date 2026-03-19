/**
 * 多目的溶媒選定 — HSP適合性+物性+安全性の重み付け最適化
 */
import type { HSPValues, Solvent } from './types';
import { calculateRa, calculateRed } from './hsp';
import { GREEN_SOLVENT_DATABASE } from './green-solvent';

export interface ObjectiveWeights {
  hspMatch: number;      // default 0.4 — RED weight
  boilingPoint: number;  // default 0.15
  viscosity: number;     // default 0.1
  surfaceTension: number;// default 0.1
  safety: number;        // default 0.15
  cost: number;          // default 0.1 (not used yet, placeholder)
}

export interface ObjectiveTargets {
  targetHSP: HSPValues;
  r0: number;
  preferredBoilingPointRange?: { min: number; max: number };
  maxViscosity?: number;
  maxSurfaceTension?: number;
}

export interface MultiObjectiveResult {
  solvent: Solvent;
  scores: {
    hspMatch: number;
    boilingPoint: number;
    viscosity: number;
    surfaceTension: number;
    safety: number;
    overall: number;
  };
  red: number;
  ra: number;
}

export interface MultiObjectiveScreeningResult {
  results: MultiObjectiveResult[];
  weights: ObjectiveWeights;
  evaluatedAt: Date;
}

export const DEFAULT_OBJECTIVE_WEIGHTS: ObjectiveWeights = {
  hspMatch: 0.4,
  boilingPoint: 0.15,
  viscosity: 0.1,
  surfaceTension: 0.1,
  safety: 0.15,
  cost: 0.1,
};

/**
 * HSP適合性スコア: 1 - min(RED/3, 1)
 * RED=0 → 1.0, RED=3 → 0.0
 */
function scoreHspMatch(red: number): number {
  return 1 - Math.min(red / 3, 1);
}

/**
 * 沸点スコア: 好みの範囲内=1.0, データなし=0, 範囲外=距離に応じてペナルティ
 */
function scoreBoilingPoint(
  solvent: Solvent,
  range?: { min: number; max: number },
): number {
  if (range == null) return 0.5; // 制約なしの場合は中立
  if (solvent.boilingPoint == null) return 0;

  const bp = solvent.boilingPoint;
  if (bp >= range.min && bp <= range.max) return 1.0;

  // 範囲外のペナルティ：距離に基づく減衰
  const rangeWidth = range.max - range.min;
  const penalty = rangeWidth > 0 ? rangeWidth : 50; // 最低50°C幅
  const distance = bp < range.min ? range.min - bp : bp - range.max;
  return Math.max(1 - distance / penalty, 0);
}

/**
 * 粘度スコア: 1 - min(visc/maxVisc, 1)
 */
function scoreViscosity(solvent: Solvent, maxViscosity?: number): number {
  if (maxViscosity == null) return 0.5; // 制約なしの場合は中立
  if (solvent.viscosity == null) return 0;
  return 1 - Math.min(solvent.viscosity / maxViscosity, 1);
}

/**
 * 表面張力スコア: 1 - min(tension/maxTension, 1)
 */
function scoreSurfaceTension(solvent: Solvent, maxSurfaceTension?: number): number {
  if (maxSurfaceTension == null) return 0.5; // 制約なしの場合は中立
  if (solvent.surfaceTension == null) return 0;
  return 1 - Math.min(solvent.surfaceTension / maxSurfaceTension, 1);
}

/**
 * 安全性スコア: GREEN_SOLVENT_DATABASEのenvScore/10, データなしは0.5
 */
function scoreSafety(solvent: Solvent): number {
  if (solvent.casNumber == null) return 0.5;
  const info = GREEN_SOLVENT_DATABASE[solvent.casNumber];
  if (info == null) return 0.5;
  return info.environmentalScore / 10;
}

/**
 * 多目的溶媒スクリーニングを実行する
 *
 * @param targets - 目標HSP値と物性制約
 * @param solvents - 候補溶媒リスト
 * @param weights - 各目的の重み（省略時はデフォルト値）
 */
export function screenMultiObjective(
  targets: ObjectiveTargets,
  solvents: Solvent[],
  weights: ObjectiveWeights = DEFAULT_OBJECTIVE_WEIGHTS,
): MultiObjectiveScreeningResult {
  const results: MultiObjectiveResult[] = solvents.map((solvent) => {
    const ra = calculateRa(targets.targetHSP, solvent.hsp);
    const red = calculateRed(targets.targetHSP, solvent.hsp, targets.r0);

    const hspMatchScore = scoreHspMatch(red);
    const bpScore = scoreBoilingPoint(solvent, targets.preferredBoilingPointRange);
    const viscScore = scoreViscosity(solvent, targets.maxViscosity);
    const stScore = scoreSurfaceTension(solvent, targets.maxSurfaceTension);
    const safetyScore = scoreSafety(solvent);

    // 重み付き総合スコア（costは未実装のため0.5固定）
    const overall =
      weights.hspMatch * hspMatchScore +
      weights.boilingPoint * bpScore +
      weights.viscosity * viscScore +
      weights.surfaceTension * stScore +
      weights.safety * safetyScore +
      weights.cost * 0.5;

    return {
      solvent,
      scores: {
        hspMatch: hspMatchScore,
        boilingPoint: bpScore,
        viscosity: viscScore,
        surfaceTension: stScore,
        safety: safetyScore,
        overall,
      },
      red,
      ra,
    };
  });

  // overall降順（高スコアが良い）でソート
  results.sort((a, b) => b.scores.overall - a.scores.overall);

  return {
    results,
    weights,
    evaluatedAt: new Date(),
  };
}
