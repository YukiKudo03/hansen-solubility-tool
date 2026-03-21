/**
 * 土壌汚染物質抽出
 *
 * RED値に基づいて、土壌汚染物質の溶媒抽出効率を評価する。
 * 閾値はnatural-dye-extractionと同じExtractionLevel体系を使用。
 * RED < 0.7: Excellent（高抽出効率）
 * 0.7 <= RED < 1.0: Good（良好）
 * RED >= 1.0: Low（低抽出効率）
 */
import type { HSPValues } from './types';
import { calculateRa, calculateRed } from './hsp';
import {
  ExtractionLevel,
  classifyExtraction,
  DEFAULT_EXTRACTION_THRESHOLDS,
} from './natural-dye-extraction';
import type { ExtractionThresholds } from './natural-dye-extraction';

export { ExtractionLevel, classifyExtraction, DEFAULT_EXTRACTION_THRESHOLDS };
export type { ExtractionThresholds };

/** 土壌汚染物質抽出スクリーニング個別結果 */
export interface RemediationScreeningResult {
  solvent: { name: string; hsp: HSPValues };
  ra: number;
  red: number;
  extractionLevel: ExtractionLevel;
}

/**
 * 土壌汚染物質に対する抽出溶媒をスクリーニングする
 *
 * @param contaminantHSP - 汚染物質のHSP値
 * @param contaminantR0 - 汚染物質の相互作用半径
 * @param solvents - 候補溶媒リスト
 * @param thresholds - 抽出効率閾値（省略時デフォルト）
 * @returns スクリーニング結果（RED昇順ソート済み）
 */
export function screenRemediationSolvents(
  contaminantHSP: HSPValues,
  contaminantR0: number,
  solvents: Array<{ name: string; hsp: HSPValues }>,
  thresholds: ExtractionThresholds = DEFAULT_EXTRACTION_THRESHOLDS,
): RemediationScreeningResult[] {
  const results: RemediationScreeningResult[] = solvents.map((solvent) => {
    const ra = calculateRa(contaminantHSP, solvent.hsp);
    const red = calculateRed(contaminantHSP, solvent.hsp, contaminantR0);
    const extractionLevel = classifyExtraction(red, thresholds);
    return { solvent: { name: solvent.name, hsp: solvent.hsp }, ra, red, extractionLevel };
  });

  results.sort((a, b) => a.red - b.red);
  return results;
}
