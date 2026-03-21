/**
 * プライマーレス接着設計
 *
 * work-of-adhesion のWa計算とHSP距離に基づいて、
 * プライマー不要の直接接着のための最適接着剤HSPを提案する。
 *
 * 基本原理:
 * 1. 接着剤と基材のHSP距離が小さいほど密着性が良好
 * 2. Work of adhesion (Wa) が大きいほど接着力が高い
 * 3. 最適接着剤HSPは基材HSPに可能な限り近いHSP値
 *
 * 提案ロジック:
 * - 両被着体のHSP中点を最適接着剤HSPとして提案
 * - 各被着体に対するWaとRaを算出
 * - 総合評価を出力
 *
 * 参考文献:
 * - Abbott & Hansen (2020) HSPiP User's e-Book, Ch. 15 "Adhesion"
 * - Owens & Wendt (1969) J. Appl. Polym. Sci. 13:1741
 */

import type { HSPValues } from './types';
import { calculateRa } from './hsp';
import { calculateWorkOfAdhesionFromHSP } from './work-of-adhesion';

/** プライマーレス接着の評価レベル */
export enum PrimerlessAdhesionLevel {
  Excellent = 1, // 優秀（Wa > 80 mJ/m²）
  Good = 2,      // 良好（60 < Wa ≤ 80）
  Fair = 3,      // 可能（40 < Wa ≤ 60）
  Poor = 4,      // 不良（Wa ≤ 40）
}

/** プライマーレス接着結果 */
export interface PrimerlessAdhesionResult {
  adhesiveHSP: HSPValues;
  substrateHSP: HSPValues;
  wa: number;              // 接着仕事 [mJ/m²]
  ra: number;              // HSP距離
  level: PrimerlessAdhesionLevel;
  optimalAdhesiveHSP: HSPValues;  // 提案最適接着剤HSP
  optimalWa: number;       // 最適HSPでのWa
  optimalRa: number;       // 最適HSPでのRa
  improvementPotential: number;  // 改善余地 (%)
  evaluatedAt: Date;
}

/** レベル情報 */
const PRIMERLESS_LEVEL_INFO: Record<PrimerlessAdhesionLevel, { label: string; labelEn: string; description: string }> = {
  [PrimerlessAdhesionLevel.Excellent]: { label: '優秀', labelEn: 'Excellent', description: '優秀な密着性（プライマー不要）' },
  [PrimerlessAdhesionLevel.Good]: { label: '良好', labelEn: 'Good', description: '良好な密着性' },
  [PrimerlessAdhesionLevel.Fair]: { label: '可能', labelEn: 'Fair', description: '接着可能だが改善余地あり' },
  [PrimerlessAdhesionLevel.Poor]: { label: '不良', labelEn: 'Poor', description: '密着性不良（プライマーが必要）' },
};

/**
 * レベル情報を取得する
 */
export function getPrimerlessAdhesionLevelInfo(level: PrimerlessAdhesionLevel): { label: string; labelEn: string; description: string } {
  return PRIMERLESS_LEVEL_INFO[level];
}

/**
 * Wa値から接着レベルを分類する
 */
export function classifyPrimerlessAdhesion(wa: number): PrimerlessAdhesionLevel {
  if (wa > 80) return PrimerlessAdhesionLevel.Excellent;
  if (wa > 60) return PrimerlessAdhesionLevel.Good;
  if (wa > 40) return PrimerlessAdhesionLevel.Fair;
  return PrimerlessAdhesionLevel.Poor;
}

/**
 * プライマーレス接着を最適化する
 *
 * @param adhesiveHSP - 接着剤のHSP
 * @param substrateHSP - 基材のHSP
 * @returns プライマーレス接着結果
 */
export function optimizePrimerlessAdhesion(
  adhesiveHSP: HSPValues,
  substrateHSP: HSPValues,
): PrimerlessAdhesionResult {
  // 現在の接着剤-基材間の評価
  const ra = calculateRa(adhesiveHSP, substrateHSP);
  const wa = calculateWorkOfAdhesionFromHSP(adhesiveHSP, substrateHSP);
  const level = classifyPrimerlessAdhesion(wa);

  // 最適接着剤HSP = 基材HSPと同一（最大Wa）
  const optimalAdhesiveHSP: HSPValues = {
    deltaD: substrateHSP.deltaD,
    deltaP: substrateHSP.deltaP,
    deltaH: substrateHSP.deltaH,
  };

  const optimalRa = calculateRa(optimalAdhesiveHSP, substrateHSP);
  const optimalWa = calculateWorkOfAdhesionFromHSP(optimalAdhesiveHSP, substrateHSP);

  // 改善余地
  const improvementPotential = wa > 0
    ? ((optimalWa - wa) / wa) * 100
    : (optimalWa > 0 ? Infinity : 0);

  return {
    adhesiveHSP,
    substrateHSP,
    wa,
    ra,
    level,
    optimalAdhesiveHSP,
    optimalWa,
    optimalRa,
    improvementPotential: Number.isFinite(improvementPotential) ? improvementPotential : 999,
    evaluatedAt: new Date(),
  };
}
