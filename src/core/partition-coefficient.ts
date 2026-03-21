/**
 * NL02: HSPベース分配係数推定
 *
 * 二相間の溶質分配をHSP距離差から推算する。
 *
 * 原理:
 * 溶質が二相（phase1, phase2）間で平衡分配するとき、
 * 各相との親和性（Ra²で表現）の差が分配係数を決定する。
 *
 * deltaRa² = Ra²(solute-phase1) - Ra²(solute-phase2)
 * - deltaRa² < 0: phase1に分配（phase1との距離が近い）
 * - deltaRa² > 0: phase2に分配
 *
 * 半定量的な log K 推定:
 * log K = -C * deltaRa² * V_solute / (R * T)
 *   C: 系に依存するフィッティング定数
 */

import type { HSPValues } from './types';
import { calculateRa } from './hsp';

/** 気体定数 [J/(mol·K)] */
const R_GAS = 8.314;

/** 二相間Ra²差の計算結果 */
export interface PartitionDeltaRa2Result {
  /** 溶質-phase1 間の Ra² [MPa] */
  ra2Phase1: number;
  /** 溶質-phase2 間の Ra² [MPa] */
  ra2Phase2: number;
  /** Ra²差 = ra2Phase1 - ra2Phase2 (負→phase1側に分配) */
  deltaRa2: number;
}

/**
 * 溶質の二相間 Ra² 差を計算する
 *
 * @param solute - 溶質のHSP
 * @param phase1 - 相1（例: octanol）のHSP
 * @param phase2 - 相2（例: water）のHSP
 * @returns Ra²差の計算結果
 */
export function calculatePartitionDeltaRa2(
  solute: HSPValues,
  phase1: HSPValues,
  phase2: HSPValues
): PartitionDeltaRa2Result {
  const ra1 = calculateRa(solute, phase1);
  const ra2 = calculateRa(solute, phase2);
  const ra2Phase1 = ra1 * ra1;
  const ra2Phase2 = ra2 * ra2;

  return {
    ra2Phase1,
    ra2Phase2,
    deltaRa2: ra2Phase1 - ra2Phase2,
  };
}

/**
 * deltaRa²から半定量的なlog分配係数を推定する
 *
 * log K = -C * deltaRa² * V_solute / (R * T)
 * Cはデフォルト 1/(6*R*T) に設定（chi計算と整合）
 *
 * @param deltaRa2 - Ra²差 [MPa]
 * @param molarVolume - 溶質モル体積 [cm³/mol]
 * @param temperature - 温度 [K]
 * @returns 推定 log K（自然対数ベース）
 */
export function estimateLogPartitionCoefficient(
  deltaRa2: number,
  molarVolume: number,
  temperature: number = 298.15
): number {
  if (molarVolume <= 0) throw new Error('Molar volume must be positive');
  if (temperature <= 0) throw new Error('Temperature must be positive');

  // chi の差 = V * deltaRa² / (6RT)
  // ln K ≈ -deltaChi = -V * deltaRa² / (6RT)
  return -(molarVolume * deltaRa2) / (6 * R_GAS * temperature);
}

/** ランキング結果 */
export interface PartitionRankEntry {
  name: string;
  hsp: HSPValues;
  ra2Phase1: number;
  ra2Phase2: number;
  deltaRa2: number;
}

/**
 * 溶質リストをphase1への分配選好性でランキングする
 *
 * deltaRa2が最も負（最もphase1に親和）のものが先頭。
 *
 * @param solutes - 溶質リスト（name + hsp）
 * @param phase1 - 相1のHSP
 * @param phase2 - 相2のHSP
 * @returns deltaRa2昇順でソートされたランキング
 */
export function rankByPartitionPreference(
  solutes: Array<{ name: string; hsp: HSPValues }>,
  phase1: HSPValues,
  phase2: HSPValues
): PartitionRankEntry[] {
  return solutes
    .map(({ name, hsp }) => {
      const { ra2Phase1, ra2Phase2, deltaRa2 } = calculatePartitionDeltaRa2(hsp, phase1, phase2);
      return { name, hsp, ra2Phase1, ra2Phase2, deltaRa2 };
    })
    .sort((a, b) => a.deltaRa2 - b.deltaRa2);
}
