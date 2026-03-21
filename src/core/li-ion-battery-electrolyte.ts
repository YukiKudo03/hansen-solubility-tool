/**
 * LiB電解液設計 — 電解質塩と溶媒のHSP適合性評価
 *
 * 電解質塩(LiPF6等)のHSPとR0に基づき、溶媒候補のRED値と
 * 誘電率（近似）を考慮した電解液適性を判定する。
 *
 * 判定基準:
 *   RED < 0.6: Excellent（優秀な溶解性 + 高誘電率が期待）
 *   0.6 <= RED < 1.0: Good（良好な溶解性）
 *   1.0 <= RED < 1.5: Moderate（部分的な溶解性）
 *   RED >= 1.5: Poor（不適）
 *
 * 誘電率は δP成分から経験的に推定:
 *   ε_est ≈ (δP / 2)^2  (Hildebrand-based rough estimate)
 *   δP > 14 の溶媒は高誘電率として加点
 */
import type { HSPValues } from './types';
import { calculateRa, calculateRed } from './hsp';

/** 電解液適性レベル */
export type ElectrolyteSuitability = 'Excellent' | 'Good' | 'Moderate' | 'Poor';

/** 電解液適性閾値 */
export interface ElectrolyteThresholds {
  excellentMax: number;  // default: 0.6
  goodMax: number;       // default: 1.0
  moderateMax: number;   // default: 1.5
}

/** デフォルト閾値 */
export const DEFAULT_ELECTROLYTE_THRESHOLDS: ElectrolyteThresholds = {
  excellentMax: 0.6,
  goodMax: 1.0,
  moderateMax: 1.5,
};

/** 電解液スクリーニング個別結果 */
export interface ElectrolyteScreeningResult {
  solvent: { name: string; hsp: HSPValues };
  ra: number;
  red: number;
  estimatedDielectric: number;
  suitability: ElectrolyteSuitability;
}

/**
 * RED値から電解液適性レベルを判定する
 */
export function classifyElectrolyteSuitability(
  red: number,
  thresholds: ElectrolyteThresholds = DEFAULT_ELECTROLYTE_THRESHOLDS,
): ElectrolyteSuitability {
  if (red < 0) throw new Error('RED値は非負でなければなりません');
  if (red < thresholds.excellentMax) return 'Excellent';
  if (red < thresholds.goodMax) return 'Good';
  if (red < thresholds.moderateMax) return 'Moderate';
  return 'Poor';
}

/**
 * δP成分から誘電率を経験的に推定する
 * εr ≈ (δP / 2)^2 (rough Hildebrand-based estimate)
 */
export function estimateDielectric(deltaP: number): number {
  return (deltaP / 2) ** 2;
}

/**
 * 電解質塩に対する溶媒をスクリーニングする
 *
 * @param saltHSP - 電解質塩のHSP値
 * @param saltR0 - 電解質塩の相互作用半径
 * @param solvents - 候補溶媒リスト
 * @param thresholds - 電解液適性閾値（省略時デフォルト）
 * @returns スクリーニング結果（RED昇順ソート済み）
 */
export function screenElectrolyteSolvents(
  saltHSP: HSPValues,
  saltR0: number,
  solvents: Array<{ name: string; hsp: HSPValues }>,
  thresholds: ElectrolyteThresholds = DEFAULT_ELECTROLYTE_THRESHOLDS,
): ElectrolyteScreeningResult[] {
  const results: ElectrolyteScreeningResult[] = solvents.map((solvent) => {
    const ra = calculateRa(saltHSP, solvent.hsp);
    const red = calculateRed(saltHSP, solvent.hsp, saltR0);
    const estimatedDielectric = estimateDielectric(solvent.hsp.deltaP);
    const suitability = classifyElectrolyteSuitability(red, thresholds);
    return { solvent: { name: solvent.name, hsp: solvent.hsp }, ra, red, estimatedDielectric, suitability };
  });

  // RED昇順ソート
  results.sort((a, b) => a.red - b.red);
  return results;
}
