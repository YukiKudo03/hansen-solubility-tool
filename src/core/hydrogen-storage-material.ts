/**
 * NL10-4: 水素貯蔵材料-溶媒相互作用評価
 *
 * 水素キャリア(MOF, LOHC)と溶媒のHSP適合性評価。
 * Ra/REDが小さいほど溶媒との相溶性が高い。
 *
 * 参考文献:
 * - Hansen (2007) Hansen Solubility Parameters: A User's Handbook, 2nd ed.
 */

import type { HSPValues } from './types';
import { calculateRa } from './hsp';

/** 水素キャリア溶媒適合性レベル */
export enum H2StorageCompatibilityLevel {
  Excellent = 1, // 優秀な適合性
  Good = 2,      // 良好
  Moderate = 3,  // 中程度
  Poor = 4,      // 不良
}

/** 水素キャリア溶媒適合性レベル情報 */
export function getH2StorageCompatibilityLevelInfo(level: H2StorageCompatibilityLevel): { label: string; description: string } {
  switch (level) {
    case H2StorageCompatibilityLevel.Excellent: return { label: '優秀', description: '非常に高い適合性' };
    case H2StorageCompatibilityLevel.Good: return { label: '良好', description: '良好な適合性' };
    case H2StorageCompatibilityLevel.Moderate: return { label: '中程度', description: '中程度の適合性' };
    case H2StorageCompatibilityLevel.Poor: return { label: '不良', description: '適合性が低い' };
  }
}

/** RED値から適合性レベルを分類 */
export function classifyH2StorageCompatibility(red: number): H2StorageCompatibilityLevel {
  if (red < 0.5) return H2StorageCompatibilityLevel.Excellent;
  if (red < 1.0) return H2StorageCompatibilityLevel.Good;
  if (red < 1.5) return H2StorageCompatibilityLevel.Moderate;
  return H2StorageCompatibilityLevel.Poor;
}

/** 溶媒候補 */
export interface H2StorageSolvent {
  name: string;
  hsp: HSPValues;
}

/** 水素キャリア-溶媒スクリーニング結果（個別） */
export interface H2StorageMaterialResult {
  solventName: string;
  solventHSP: HSPValues;
  ra: number;
  red: number;
  compatibilityLevel: H2StorageCompatibilityLevel;
}

/** 水素キャリア-溶媒スクリーニング全体結果 */
export interface H2StorageScreeningResult {
  carrierHSP: HSPValues;
  carrierR0: number;
  results: H2StorageMaterialResult[];
  evaluatedAt: Date;
}

/**
 * 水素貯蔵材料の溶媒適合性をスクリーニングする
 *
 * @param carrierHSP - 水素キャリアのHSP値
 * @param r0 - 水素キャリアの相互作用半径
 * @param solvents - 溶媒候補リスト
 * @returns スクリーニング結果（Ra昇順ソート）
 */
export function screenHydrogenStorageMaterials(
  carrierHSP: HSPValues,
  r0: number,
  solvents: H2StorageSolvent[],
): H2StorageScreeningResult {
  if (solvents.length === 0) {
    throw new Error('溶媒候補を1つ以上指定してください');
  }
  if (r0 <= 0) {
    throw new Error('R₀は正の数値を入力してください');
  }

  const results: H2StorageMaterialResult[] = solvents.map(s => {
    const ra = calculateRa(carrierHSP, s.hsp);
    const red = ra / r0;
    const compatibilityLevel = classifyH2StorageCompatibility(red);
    return {
      solventName: s.name,
      solventHSP: s.hsp,
      ra,
      red,
      compatibilityLevel,
    };
  });

  // Ra昇順ソート
  results.sort((a, b) => a.ra - b.ra);

  return {
    carrierHSP,
    carrierR0: r0,
    results,
    evaluatedAt: new Date(),
  };
}
