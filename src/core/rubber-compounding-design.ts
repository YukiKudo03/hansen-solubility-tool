/**
 * ゴム配合設計
 *
 * ゴム-フィラー間のchi計算と、ゴム-溶媒間の膨潤度予測の複合評価。
 *
 * - chi(rubber-filler): フィラー分散性の指標
 * - 膨潤度(rubber-solvent[]): 各溶媒に対する耐溶剤性
 *
 * 参考文献:
 * - Mark, Erman (2007) Rubberlike Elasticity
 * - Kraus (1963) J. Appl. Polym. Sci. 7:861
 */

import type { HSPValues } from './types';
import { calculateRa } from './hsp';
import { calculateFloryHugginsChi } from './flory-huggins';
import { solveFloryRehner } from './flory-rehner';

/** フィラー情報 */
export interface FillerInfo {
  name: string;
  hsp: HSPValues;
}

/** 溶媒膨潤情報（入力用） */
export interface SwellingSolventInfo {
  name: string;
  hsp: HSPValues;
  molarVolume: number; // cm³/mol
}

/** フィラー分散性の評価結果 */
export interface FillerDispersionResult {
  fillerName: string;
  ra: number;
  chi: number;
  /** chi < 0.5: Excellent, < 1.0: Good, < 2.0: Fair, >= 2.0: Poor */
  compatibility: 'Excellent' | 'Good' | 'Fair' | 'Poor';
}

/** 溶媒膨潤の評価結果 */
export interface SolventSwellingResult {
  solventName: string;
  ra: number;
  chi: number;
  phiP: number;
  swellingRatio: number;
  /** Q > 5: High, Q > 2: Moderate, Q > 1.5: Low, else: Negligible */
  swellingLevel: 'High' | 'Moderate' | 'Low' | 'Negligible';
}

/** ゴム配合設計の総合結果 */
export interface RubberCompoundResult {
  fillerDispersion: FillerDispersionResult;
  solventSwelling: SolventSwellingResult[];
}

/**
 * フィラー分散性の相溶性を判定する
 */
function classifyFillerCompatibility(chi: number): 'Excellent' | 'Good' | 'Fair' | 'Poor' {
  if (chi < 0.5) return 'Excellent';
  if (chi < 1.0) return 'Good';
  if (chi < 2.0) return 'Fair';
  return 'Poor';
}

/**
 * 膨潤レベルを判定する
 */
function classifySwellingLevel(q: number): 'High' | 'Moderate' | 'Low' | 'Negligible' {
  if (q > 5) return 'High';
  if (q > 2) return 'Moderate';
  if (q > 1.5) return 'Low';
  return 'Negligible';
}

/**
 * ゴム配合の総合評価を行う
 *
 * @param rubberHSP - ゴムのHSP [MPa^0.5]
 * @param filler - フィラー情報
 * @param crosslinkDensity - 架橋密度 [mol/cm³]
 * @param solvents - 膨潤評価用溶媒リスト
 * @param temperature - 温度 [K] (デフォルト: 298.15)
 * @returns ゴム配合設計結果
 */
export function evaluateRubberCompound(
  rubberHSP: HSPValues,
  filler: FillerInfo,
  crosslinkDensity: number,
  solvents: SwellingSolventInfo[],
  temperature: number = 298.15,
): RubberCompoundResult {
  // バリデーション
  if (crosslinkDensity <= 0) throw new Error('Crosslink density must be positive');
  if (solvents.length === 0) throw new Error('At least one solvent is required');

  // --- フィラー分散性評価 ---
  const fillerRa = calculateRa(rubberHSP, filler.hsp);
  // フィラーのchiはモル体積100 cm³/mol（代表値）で概算
  const fillerChi = calculateFloryHugginsChi(rubberHSP, filler.hsp, 100, temperature);
  const fillerCompatibility = classifyFillerCompatibility(fillerChi);

  const fillerDispersion: FillerDispersionResult = {
    fillerName: filler.name,
    ra: fillerRa,
    chi: fillerChi,
    compatibility: fillerCompatibility,
  };

  // --- 溶媒膨潤評価 ---
  const solventSwelling: SolventSwellingResult[] = solvents.map((solvent) => {
    if (solvent.molarVolume <= 0) throw new Error(`Molar volume of ${solvent.name} must be positive`);

    const ra = calculateRa(rubberHSP, solvent.hsp);
    const chi = calculateFloryHugginsChi(rubberHSP, solvent.hsp, solvent.molarVolume, temperature);
    const phiP = solveFloryRehner({ chi, vs: solvent.molarVolume, crosslinkDensity });
    const swellingRatio = 1 / phiP;
    const swellingLevel = classifySwellingLevel(swellingRatio);

    return {
      solventName: solvent.name,
      ra,
      chi,
      phiP,
      swellingRatio,
      swellingLevel,
    };
  });

  return {
    fillerDispersion,
    solventSwelling,
  };
}
