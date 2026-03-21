/**
 * UV硬化インクモノマー選定
 *
 * RED小 → 溶解性良好（未硬化時のオリゴマーとの相溶性）
 * MonomerSuitability: Excellent / Good / Poor
 */
import type { HSPValues } from './types';
import { calculateRa, calculateRed } from './hsp';

/** モノマー適合性レベル */
export enum MonomerSuitability {
  Excellent = 'Excellent',
  Good = 'Good',
  Poor = 'Poor',
}

/** モノマー適合性情報 */
export interface MonomerSuitabilityInfo {
  level: MonomerSuitability;
  label: string;
  description: string;
  color: string;
}

const MONOMER_SUITABILITY_INFO: Record<MonomerSuitability, MonomerSuitabilityInfo> = {
  [MonomerSuitability.Excellent]: {
    level: MonomerSuitability.Excellent,
    label: '優秀',
    description: 'RED < 0.7: オリゴマーとの相溶性が非常に高い',
    color: 'green',
  },
  [MonomerSuitability.Good]: {
    level: MonomerSuitability.Good,
    label: '良好',
    description: '0.7 ≤ RED < 1.0: 実用的な相溶性',
    color: 'blue',
  },
  [MonomerSuitability.Poor]: {
    level: MonomerSuitability.Poor,
    label: '不良',
    description: 'RED ≥ 1.0: 相溶性不十分',
    color: 'red',
  },
};

/** UV硬化インクモノマースクリーニング結果（個別） */
export interface UVInkMonomerResult {
  monomer: { name: string; hsp: HSPValues };
  ra: number;
  red: number;
  suitability: MonomerSuitability;
}

/**
 * RED値からモノマー適合性を判定する
 *
 * RED < 0.7 → Excellent
 * 0.7 ≤ RED < 1.0 → Good
 * RED ≥ 1.0 → Poor
 */
export function classifyMonomerSuitability(red: number): MonomerSuitability {
  if (red < 0) throw new Error('RED値は非負でなければなりません');
  if (red < 0.7) return MonomerSuitability.Excellent;
  if (red < 1.0) return MonomerSuitability.Good;
  return MonomerSuitability.Poor;
}

/**
 * モノマー適合性の表示情報を取得する
 */
export function getMonomerSuitabilityInfo(level: MonomerSuitability): MonomerSuitabilityInfo {
  return MONOMER_SUITABILITY_INFO[level];
}

/**
 * UV硬化インクモノマーのスクリーニング
 *
 * @param oligomerHSP - オリゴマーのHSP
 * @param oligomerR0 - オリゴマーの相互作用半径
 * @param monomers - 候補モノマーリスト
 * @returns スクリーニング結果（RED昇順ソート）
 */
export function screenUVInkMonomers(
  oligomerHSP: HSPValues,
  oligomerR0: number,
  monomers: Array<{ name: string; hsp: HSPValues }>,
): UVInkMonomerResult[] {
  const results: UVInkMonomerResult[] = monomers.map((monomer) => {
    const ra = calculateRa(oligomerHSP, monomer.hsp);
    const red = calculateRed(oligomerHSP, monomer.hsp, oligomerR0);
    const suitability = classifyMonomerSuitability(red);
    return { monomer: { name: monomer.name, hsp: monomer.hsp }, ra, red, suitability };
  });

  results.sort((a, b) => a.red - b.red);
  return results;
}
