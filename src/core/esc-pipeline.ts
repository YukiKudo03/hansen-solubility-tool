/**
 * NL06: ESC評価パイプライン — classifyESCRiskを使った溶媒スクリーニング
 *
 * ポリマーに対する溶媒群のESC（環境応力亀裂）リスクを一括評価し、
 * リスク順（Dissolution → HighRisk → Safe）でソートして返す。
 */
import type { HSPValues } from './types';
import { calculateRa, calculateRed } from './hsp';
import { classifyESCRisk, ESCRiskLevel } from './esc-classification';
import type { ESCThresholds } from './esc-classification';

/** ESCスクリーニング個別結果 */
export interface ESCScreeningResult {
  solvent: { name: string; hsp: HSPValues };
  ra: number;
  red: number;
  risk: ESCRiskLevel;
}

/**
 * 全溶媒をESCリスクでスクリーニングし、リスク順（Dissolution→HighRisk→Safe）、
 * 同リスク内はRED昇順でソートして返す。
 *
 * @param polymerHSP - ポリマーのHSP値
 * @param polymerR0 - ポリマーの相互作用半径
 * @param solvents - スクリーニング対象の溶媒リスト
 * @param thresholds - ESC閾値（省略時はデフォルト値を使用）
 * @returns ESCスクリーニング結果（リスク順ソート済み）
 */
export function screenESCRisk(
  polymerHSP: HSPValues,
  polymerR0: number,
  solvents: Array<{ name: string; hsp: HSPValues }>,
  thresholds?: ESCThresholds,
): ESCScreeningResult[] {
  const results: ESCScreeningResult[] = solvents.map((solvent) => {
    const ra = calculateRa(polymerHSP, solvent.hsp);
    const red = calculateRed(polymerHSP, solvent.hsp, polymerR0);
    const risk = thresholds
      ? classifyESCRisk(red, thresholds)
      : classifyESCRisk(red);

    return {
      solvent: { name: solvent.name, hsp: solvent.hsp },
      ra,
      red,
      risk,
    };
  });

  // リスク順（enum値昇順: Dissolution=1, HighRisk=2, Safe=3）、同リスク内はRED昇順
  results.sort((a, b) => {
    if (a.risk !== b.risk) return a.risk - b.risk;
    return a.red - b.red;
  });

  return results;
}
