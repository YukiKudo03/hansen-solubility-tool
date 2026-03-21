/**
 * NL10-1: ポリマー膜ガス透過性評価
 *
 * rankGasPermeability() を使って膜材料のガス選択性を評価する。
 * Ra²が小さいほど親和性が高く、透過性が高い。
 * 選択性 = Ra²(reference) / Ra²(target) で定量化。
 *
 * 参考文献:
 * - Robeson (2008) J. Membr. Sci. 320:390-400
 * - Freeman (1999) Macromolecules 32:375-380
 */

import type { HSPValues } from './types';
import { rankGasPermeability, GAS_HSP_DATABASE } from './gas-solubility';
import type { GasPolymerAffinityResult } from './gas-solubility';

/** ガス透過性スクリーニング結果（個別） */
export interface MembranePermeabilityResult {
  gasName: string;
  ra2: number;
  relativePermeability: number; // 基準ガス対比の相対透過性
  selectivity: number;          // 基準ガス対比の選択性
}

/** ガス透過性スクリーニング全体結果 */
export interface MembranePermeabilityScreeningResult {
  polymerHSP: HSPValues;
  referenceGas: string;
  results: MembranePermeabilityResult[];
  evaluatedAt: Date;
}

/** ガス透過性レベル (1=高透過, 3=低透過) */
export enum GasPermeabilityLevel {
  High = 1,
  Medium = 2,
  Low = 3,
}

/** ガス透過性レベル情報 */
export function getGasPermeabilityLevelInfo(level: GasPermeabilityLevel): { label: string; description: string } {
  switch (level) {
    case GasPermeabilityLevel.High: return { label: '高透過性', description: 'Ra²が小さく透過性が高い' };
    case GasPermeabilityLevel.Medium: return { label: '中程度', description: '中間的な透過性' };
    case GasPermeabilityLevel.Low: return { label: '低透過性', description: 'Ra²が大きくバリア性が高い' };
  }
}

/** Ra²から透過性レベルを分類 */
export function classifyGasPermeability(ra2: number): GasPermeabilityLevel {
  if (ra2 < 50) return GasPermeabilityLevel.High;
  if (ra2 < 150) return GasPermeabilityLevel.Medium;
  return GasPermeabilityLevel.Low;
}

/**
 * ポリマー膜のガス透過性をスクリーニングする
 *
 * @param polymerHSP - ポリマー膜のHSP値
 * @param gasNames - 評価するガス名リスト
 * @param referenceGas - 基準ガス（デフォルト: N2）
 * @returns スクリーニング結果
 */
export function screenMembranePermeability(
  polymerHSP: HSPValues,
  gasNames: string[],
  referenceGas: string = 'N2',
): MembranePermeabilityScreeningResult {
  if (gasNames.length === 0) {
    throw new Error('ガスを1つ以上指定してください');
  }

  // referenceGas が gasNames に含まれなければ追加
  const allGases = gasNames.includes(referenceGas)
    ? gasNames
    : [referenceGas, ...gasNames];

  const ranked = rankGasPermeability(polymerHSP, allGases);

  // 基準ガスのRa²を取得
  const refResult = ranked.find(r => r.gasName === referenceGas);
  if (!refResult) {
    throw new Error(`基準ガス ${referenceGas} の評価に失敗しました`);
  }
  const refRa2 = refResult.ra2;

  const results: MembranePermeabilityResult[] = ranked.map(r => {
    // 相対透過性: Ra²が小さいほど透過性が高い → refRa2 / ra2
    const relativePermeability = r.ra2 > 0 ? refRa2 / r.ra2 : Infinity;
    // 選択性: 基準ガスに対する選択性
    const selectivity = r.ra2 > 0 ? refRa2 / r.ra2 : Infinity;
    return {
      gasName: r.gasName,
      ra2: r.ra2,
      relativePermeability,
      selectivity,
    };
  });

  return {
    polymerHSP,
    referenceGas,
    results,
    evaluatedAt: new Date(),
  };
}

/**
 * 利用可能なガス名一覧を取得する
 */
export function getAvailableGasNames(): string[] {
  return Object.keys(GAS_HSP_DATABASE);
}
