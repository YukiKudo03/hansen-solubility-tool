/**
 * 溶媒代替設計 — 規制溶媒のHSPに最も近い代替候補をランキング
 *
 * green-solvent.tsのfindGreenAlternativesを参考に、
 * Ra距離でソートしつつ環境/安全スコアを付与する。
 *
 * overallScore = 0.6 * (Ra / 10) + 0.2 * (1 - envScore/10) + 0.2 * (1 - healthScore/10)
 */
import type { HSPValues } from './types';
import { calculateRa } from './hsp';
import { GREEN_SOLVENT_DATABASE, type GreenSolventInfo, type SafetyRating } from './green-solvent';

/** 溶媒代替設計の候補溶媒入力 */
export interface SubstitutionCandidateInput {
  name: string;
  hsp: HSPValues;
  casNumber?: string | null;
}

/** 代替候補結果 */
export interface SubstitutionDesignResult {
  solvent: SubstitutionCandidateInput;
  ra: number;
  safetyRating: SafetyRating | null;
  environmentalScore: number | null;
  healthScore: number | null;
  overallScore: number;
}

/**
 * 安全性情報をCAS番号からルックアップする
 */
function lookupSafety(casNumber: string | null | undefined): GreenSolventInfo | null {
  if (casNumber == null) return null;
  return GREEN_SOLVENT_DATABASE[casNumber] ?? null;
}

/**
 * 総合スコアを計算する
 */
function computeScore(ra: number, safetyInfo: GreenSolventInfo | null): number {
  const envScore = safetyInfo != null ? safetyInfo.environmentalScore : 5;
  const healthScore = safetyInfo != null ? safetyInfo.healthScore : 5;
  return 0.6 * (ra / 10) + 0.2 * (1 - envScore / 10) + 0.2 * (1 - healthScore / 10);
}

/** 代替設計制約条件 */
export interface SubstitutionConstraints {
  maxRa?: number;
  onlyGreen?: boolean;
}

/**
 * 規制溶媒のHSPに最も近い代替候補を検索する
 *
 * @param bannedSolventHSP - 規制溶媒のHSP値
 * @param candidates - 候補溶媒リスト
 * @param constraints - 制約条件（省略可）
 * @param maxResults - 返却する最大件数（デフォルト: 20）
 * @returns 代替候補リスト（overallScore昇順ソート済み）
 */
export function findSolventSubstitutes(
  bannedSolventHSP: HSPValues,
  candidates: SubstitutionCandidateInput[],
  constraints?: SubstitutionConstraints,
  maxResults: number = 20,
): SubstitutionDesignResult[] {
  let results: SubstitutionDesignResult[] = candidates.map((candidate) => {
    const ra = calculateRa(bannedSolventHSP, candidate.hsp);
    const safetyInfo = lookupSafety(candidate.casNumber);
    const overallScore = computeScore(ra, safetyInfo);
    return {
      solvent: candidate,
      ra,
      safetyRating: safetyInfo?.safetyRating ?? null,
      environmentalScore: safetyInfo?.environmentalScore ?? null,
      healthScore: safetyInfo?.healthScore ?? null,
      overallScore,
    };
  });

  // 制約フィルタ適用
  if (constraints?.maxRa != null) {
    results = results.filter((r) => r.ra <= constraints.maxRa!);
  }
  if (constraints?.onlyGreen) {
    results = results.filter((r) => r.safetyRating === 'recommended');
  }

  // overallScore昇順ソート
  results.sort((a, b) => a.overallScore - b.overallScore);

  return results.slice(0, maxResults);
}
