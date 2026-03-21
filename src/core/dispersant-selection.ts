/**
 * 分散剤選定支援ロジック
 *
 * 分散剤の二部構造（アンカー基＋溶媒和鎖）を評価し、
 * 粒子-分散剤-溶媒の三者系で最適な分散剤候補をスクリーニングする。
 *
 * - RED_anchor: アンカー基 vs 粒子表面（吸着親和性）
 * - RED_solvation: 溶媒和鎖 vs 分散媒（溶解性/立体安定化）
 * - compositeScore: 幾何平均 √(RED_a × RED_s)
 */
import { DispersantAffinityLevel } from './types';
import type {
  Dispersant,
  NanoParticle,
  Solvent,
  DispersantAffinityThresholds,
  DispersantScreeningResult,
  DispersantEvaluationResult,
  DispersantFallbackResult,
  SolventForDispersantResult,
  SolventForDispersantEvaluationResult,
} from './types';
import { calculateRa, calculateRed } from './hsp';

/** デフォルト閾値 */
export const DEFAULT_DISPERSANT_THRESHOLDS: DispersantAffinityThresholds = {
  excellentMax: 0.5,
  goodMax: 0.8,
  fairMax: 1.0,
  poorMax: 1.5,
};

/** 分散剤親和性レベルの表示情報 */
export interface DispersantAffinityLevelInfo {
  level: DispersantAffinityLevel;
  label: string;
  description: string;
  color: string;
}

const DISPERSANT_LEVEL_INFO: Record<DispersantAffinityLevel, DispersantAffinityLevelInfo> = {
  [DispersantAffinityLevel.Excellent]: {
    level: DispersantAffinityLevel.Excellent,
    label: '優秀',
    description: '最適な分散剤候補（アンカー・溶媒和鎖ともに優秀）',
    color: 'green',
  },
  [DispersantAffinityLevel.Good]: {
    level: DispersantAffinityLevel.Good,
    label: '良好',
    description: '良好な分散安定化が期待できる',
    color: 'teal',
  },
  [DispersantAffinityLevel.Fair]: {
    level: DispersantAffinityLevel.Fair,
    label: '可能',
    description: '条件次第で使用可能',
    color: 'yellow',
  },
  [DispersantAffinityLevel.Poor]: {
    level: DispersantAffinityLevel.Poor,
    label: '不良',
    description: '分散安定化が困難',
    color: 'orange',
  },
  [DispersantAffinityLevel.Bad]: {
    level: DispersantAffinityLevel.Bad,
    label: '不適',
    description: '分散剤として不適',
    color: 'red',
  },
};

/**
 * RED値から分散剤親和性レベルを判定する
 */
export function classifyDispersantAffinity(
  red: number,
  thresholds: DispersantAffinityThresholds = DEFAULT_DISPERSANT_THRESHOLDS,
): DispersantAffinityLevel {
  if (red < 0) {
    throw new Error('RED値は非負でなければなりません');
  }
  if (red < thresholds.excellentMax) return DispersantAffinityLevel.Excellent;
  if (red < thresholds.goodMax) return DispersantAffinityLevel.Good;
  if (red < thresholds.fairMax) return DispersantAffinityLevel.Fair;
  if (red < thresholds.poorMax) return DispersantAffinityLevel.Poor;
  return DispersantAffinityLevel.Bad;
}

/**
 * 分散剤親和性レベルの表示情報を取得する
 */
export function getDispersantAffinityLevelInfo(level: DispersantAffinityLevel): DispersantAffinityLevelInfo {
  return DISPERSANT_LEVEL_INFO[level];
}

/**
 * アンカー基 vs 粒子表面の親和性を評価する
 * R₀は粒子のr0を使用（粒子がHSP球の所有者）
 */
export function evaluateAnchorAffinity(
  dispersant: Dispersant,
  particle: NanoParticle,
  thresholds: DispersantAffinityThresholds = DEFAULT_DISPERSANT_THRESHOLDS,
): { ra: number; red: number; affinity: DispersantAffinityLevel } {
  const ra = calculateRa(dispersant.anchorHSP, particle.hsp);
  const red = calculateRed(dispersant.anchorHSP, particle.hsp, particle.r0);
  const affinity = classifyDispersantAffinity(red, thresholds);
  return { ra, red, affinity };
}

/**
 * 溶媒和鎖 vs 溶媒の相溶性を評価する
 * R₀は分散剤のsolvationR0を使用（溶媒和鎖がHSP球の所有者）
 */
export function evaluateSolvationCompatibility(
  dispersant: Dispersant,
  solvent: Solvent,
  thresholds: DispersantAffinityThresholds = DEFAULT_DISPERSANT_THRESHOLDS,
): { ra: number; red: number; affinity: DispersantAffinityLevel } {
  const ra = calculateRa(dispersant.solvationHSP, solvent.hsp);
  const red = calculateRed(dispersant.solvationHSP, solvent.hsp, dispersant.solvationR0);
  const affinity = classifyDispersantAffinity(red, thresholds);
  return { ra, red, affinity };
}

/**
 * 総合スコアを計算する（幾何平均）
 * compositeScore = √(RED_anchor × RED_solvation)
 */
export function calculateCompositeScore(redAnchor: number, redSolvation: number): number {
  if (redAnchor < 0 || redSolvation < 0) {
    throw new Error('RED値は非負でなければなりません');
  }
  return Math.sqrt(redAnchor * redSolvation);
}

/**
 * 総合レベルを判定する
 * compositeScoreベースの分類に加え、max(RED_a, RED_s)による下限補正を適用
 */
export function classifyOverallLevel(
  redAnchor: number,
  redSolvation: number,
  thresholds: DispersantAffinityThresholds = DEFAULT_DISPERSANT_THRESHOLDS,
): DispersantAffinityLevel {
  const composite = calculateCompositeScore(redAnchor, redSolvation);
  const compositeLevel = classifyDispersantAffinity(composite, thresholds);

  // max(RED_a, RED_s)による下限補正: 片方が悪い場合、全体評価も引き下げる
  const maxRed = Math.max(redAnchor, redSolvation);
  const maxLevel = classifyDispersantAffinity(maxRed, thresholds);

  // 悪い方（数値が大きい方）を返す
  return Math.max(compositeLevel, maxLevel) as DispersantAffinityLevel;
}

/**
 * 粒子＋溶媒に対する全分散剤スクリーニング
 */
export function screenDispersants(
  particle: NanoParticle,
  solvent: Solvent,
  dispersants: Dispersant[],
  thresholds: DispersantAffinityThresholds = DEFAULT_DISPERSANT_THRESHOLDS,
): DispersantEvaluationResult {
  const results: DispersantScreeningResult[] = dispersants.map((dispersant) => {
    const anchor = evaluateAnchorAffinity(dispersant, particle, thresholds);
    const solvation = evaluateSolvationCompatibility(dispersant, solvent, thresholds);
    const compositeScore = calculateCompositeScore(anchor.red, solvation.red);
    const overallLevel = classifyOverallLevel(anchor.red, solvation.red, thresholds);

    return {
      dispersant,
      particle,
      solvent,
      raAnchor: anchor.ra,
      redAnchor: anchor.red,
      affinityAnchor: anchor.affinity,
      raSolvation: solvation.ra,
      redSolvation: solvation.red,
      affinitySolvation: solvation.affinity,
      compositeScore,
      overallLevel,
    };
  });

  results.sort((a, b) => a.compositeScore - b.compositeScore);

  return {
    particle,
    solvent,
    results,
    evaluatedAt: new Date(),
    thresholdsUsed: thresholds,
  };
}

/**
 * 粒子＋分散剤に対する逆引き溶媒スクリーニング
 */
export function screenSolventsForDispersant(
  particle: NanoParticle,
  dispersant: Dispersant,
  solvents: Solvent[],
  thresholds: DispersantAffinityThresholds = DEFAULT_DISPERSANT_THRESHOLDS,
): SolventForDispersantEvaluationResult {
  const results: SolventForDispersantResult[] = solvents.map((solvent) => {
    const anchor = evaluateAnchorAffinity(dispersant, particle, thresholds);
    const solvation = evaluateSolvationCompatibility(dispersant, solvent, thresholds);
    const compositeScore = calculateCompositeScore(anchor.red, solvation.red);
    const overallLevel = classifyOverallLevel(anchor.red, solvation.red, thresholds);

    return {
      dispersant,
      particle,
      solvent,
      raAnchor: anchor.ra,
      redAnchor: anchor.red,
      affinityAnchor: anchor.affinity,
      raSolvation: solvation.ra,
      redSolvation: solvation.red,
      affinitySolvation: solvation.affinity,
      compositeScore,
      overallLevel,
    };
  });

  results.sort((a, b) => a.compositeScore - b.compositeScore);

  return {
    particle,
    dispersant,
    results,
    evaluatedAt: new Date(),
    thresholdsUsed: thresholds,
  };
}

/**
 * フォールバック評価: 全体HSPのみで粒子との親和性を評価
 * アンカー基/溶媒和鎖の分離HSP値が不明な場合に使用
 */
export function evaluateDispersantFallback(
  dispersant: Dispersant,
  particle: NanoParticle,
  thresholds: DispersantAffinityThresholds = DEFAULT_DISPERSANT_THRESHOLDS,
): DispersantFallbackResult {
  const raOverall = calculateRa(dispersant.overallHSP, particle.hsp);
  const redOverall = calculateRed(dispersant.overallHSP, particle.hsp, particle.r0);
  const affinity = classifyDispersantAffinity(redOverall, thresholds);

  return {
    dispersant,
    particle,
    solvent: null, // フォールバックでは溶媒不要
    raOverall,
    redOverall,
    affinity,
  };
}

/**
 * フォールバック: 全体HSPのみでの全分散剤スクリーニング
 */
export function screenDispersantsFallback(
  particle: NanoParticle,
  dispersants: Dispersant[],
  thresholds: DispersantAffinityThresholds = DEFAULT_DISPERSANT_THRESHOLDS,
): DispersantFallbackResult[] {
  const results = dispersants.map((d) => evaluateDispersantFallback(d, particle, thresholds));
  results.sort((a, b) => a.redOverall - b.redOverall);
  return results;
}
