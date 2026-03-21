/**
 * NL10-3: CO2吸収材選定
 *
 * CO2のHSPと吸収材のHSP距離でスクリーニング。
 * GAS_HSP_DATABASE.CO2 を内部で使用。
 * Ra/REDが小さいほど吸収性能が高い。
 *
 * 参考文献:
 * - Hansen (2007) Hansen Solubility Parameters: A User's Handbook, 2nd ed.
 */

import type { HSPValues } from './types';
import { calculateRa } from './hsp';
import { GAS_HSP_DATABASE } from './gas-solubility';

/** CO2吸収材候補 */
export interface CO2Absorbent {
  name: string;
  hsp: HSPValues;
  r0: number;
}

/** CO2吸収性レベル */
export enum CO2AbsorptionLevel {
  Excellent = 1, // 優秀な吸収性
  Good = 2,      // 良好
  Moderate = 3,  // 中程度
  Poor = 4,      // 不良
}

/** CO2吸収性レベル情報 */
export function getCO2AbsorptionLevelInfo(level: CO2AbsorptionLevel): { label: string; description: string } {
  switch (level) {
    case CO2AbsorptionLevel.Excellent: return { label: '優秀', description: '非常に高いCO2吸収性' };
    case CO2AbsorptionLevel.Good: return { label: '良好', description: '良好なCO2吸収性' };
    case CO2AbsorptionLevel.Moderate: return { label: '中程度', description: '中程度のCO2吸収性' };
    case CO2AbsorptionLevel.Poor: return { label: '不良', description: 'CO2吸収性が低い' };
  }
}

/** RED値からCO2吸収性レベルを分類 */
export function classifyCO2Absorption(red: number): CO2AbsorptionLevel {
  if (red < 0.5) return CO2AbsorptionLevel.Excellent;
  if (red < 1.0) return CO2AbsorptionLevel.Good;
  if (red < 1.5) return CO2AbsorptionLevel.Moderate;
  return CO2AbsorptionLevel.Poor;
}

/** CO2吸収材スクリーニング結果（個別） */
export interface CO2AbsorbentResult {
  absorbent: string;
  absorbentHSP: HSPValues;
  ra: number;
  red: number;
  absorptionLevel: CO2AbsorptionLevel;
}

/** CO2吸収材スクリーニング全体結果 */
export interface CO2AbsorbentScreeningResult {
  co2HSP: HSPValues;
  results: CO2AbsorbentResult[];
  evaluatedAt: Date;
}

/**
 * CO2吸収材をスクリーニングする
 *
 * @param absorbents - 吸収材候補リスト
 * @returns スクリーニング結果（Ra昇順ソート）
 */
export function screenCO2Absorbents(
  absorbents: CO2Absorbent[],
): CO2AbsorbentScreeningResult {
  if (absorbents.length === 0) {
    throw new Error('吸収材候補を1つ以上指定してください');
  }

  const co2HSP = GAS_HSP_DATABASE.CO2;

  const results: CO2AbsorbentResult[] = absorbents.map(abs => {
    const ra = calculateRa(co2HSP, abs.hsp);
    const red = abs.r0 > 0 ? ra / abs.r0 : Infinity;
    const absorptionLevel = classifyCO2Absorption(red);
    return {
      absorbent: abs.name,
      absorbentHSP: abs.hsp,
      ra,
      red,
      absorptionLevel,
    };
  });

  // Ra昇順ソート
  results.sort((a, b) => a.ra - b.ra);

  return {
    co2HSP,
    results,
    evaluatedAt: new Date(),
  };
}
