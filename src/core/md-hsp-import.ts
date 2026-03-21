/**
 * MD計算結果インポート — CED(凝集エネルギー密度)からHSPへの変換
 *
 * 分子動力学(MD)シミュレーションで得られた凝集エネルギー密度の成分値から
 * HSP三成分を計算する。
 *
 * 基本式: δi = sqrt(CEDi / Vm)
 *   where CEDi = 凝集エネルギー密度の各成分 [J/cm³]
 *         Vm = モル体積 [cm³/mol]
 *
 * CED [J/cm³] = [J/mol] / [cm³/mol]
 * δ [MPa^0.5] = sqrt(CED [J/cm³]) = sqrt(CED [MPa])
 *
 * 参考文献:
 * - Belmares et al. (2004) J. Comput. Chem. 25:1814 (MD-based HSP)
 * - Gupta et al. (2011) J. Chem. Theory Comput. 7:3059
 */

import type { HSPValues } from './types';

/** MD計算のCED成分入力 */
export interface CEDComponents {
  totalCED: number;       // 全凝集エネルギー密度 [J/cm³]
  dispersionCED: number;  // 分散力成分 [J/cm³]
  polarCED: number;       // 極性成分 [J/cm³]
  hbondCED: number;       // 水素結合成分 [J/cm³]
}

/** MD HSPインポート結果 */
export interface MDHSPImportResult {
  hsp: HSPValues;
  ced: CEDComponents;
  molarVolume: number;
  totalSolubilityParameter: number;  // δ_total = sqrt(totalCED)
  consistency: number;               // δ_total vs sqrt(δD²+δP²+δH²) の一致度 (%)
  warnings: string[];
  evaluatedAt: Date;
}

/**
 * CED成分入力のバリデーション
 */
export function validateCEDInput(ced: CEDComponents, molarVolume: number): string | null {
  if (!Number.isFinite(ced.totalCED) || ced.totalCED < 0) {
    return '全CED値は0以上の数値を入力してください';
  }
  if (!Number.isFinite(ced.dispersionCED) || ced.dispersionCED < 0) {
    return '分散力CED値は0以上の数値を入力してください';
  }
  if (!Number.isFinite(ced.polarCED) || ced.polarCED < 0) {
    return '極性CED値は0以上の数値を入力してください';
  }
  if (!Number.isFinite(ced.hbondCED) || ced.hbondCED < 0) {
    return '水素結合CED値は0以上の数値を入力してください';
  }
  if (!Number.isFinite(molarVolume) || molarVolume <= 0) {
    return 'モル体積は正の数値を入力してください';
  }
  return null;
}

/**
 * MD計算のCED成分からHSPを計算する
 *
 * @param ced - 凝集エネルギー密度の成分値 [J/cm³]
 * @param molarVolume - モル体積 [cm³/mol]
 * @returns MD HSPインポート結果
 */
export function importMDResults(ced: CEDComponents, molarVolume: number): MDHSPImportResult {
  const err = validateCEDInput(ced, molarVolume);
  if (err) throw new Error(err);

  const warnings: string[] = [];

  // δ = sqrt(CED) — CED単位が J/cm³ = MPa なので直接sqrt
  const deltaD = Math.sqrt(ced.dispersionCED);
  const deltaP = Math.sqrt(ced.polarCED);
  const deltaH = Math.sqrt(ced.hbondCED);

  // 全溶解度パラメータ
  const totalSP = Math.sqrt(ced.totalCED);

  // 成分分解の整合性チェック
  const sumComponents = ced.dispersionCED + ced.polarCED + ced.hbondCED;
  const componentTotal = Math.sqrt(deltaD * deltaD + deltaP * deltaP + deltaH * deltaH);

  let consistency: number;
  if (totalSP === 0 && componentTotal === 0) {
    consistency = 100;
  } else if (totalSP === 0 || componentTotal === 0) {
    consistency = 0;
  } else {
    consistency = (1 - Math.abs(totalSP - componentTotal) / Math.max(totalSP, componentTotal)) * 100;
  }

  // 整合性警告
  if (consistency < 90) {
    warnings.push(`CED成分の合計(${sumComponents.toFixed(1)})と全CED(${ced.totalCED.toFixed(1)})の不一致: 整合性 ${consistency.toFixed(1)}%`);
  }

  // 物理的妥当性チェック
  if (totalSP > 50) {
    warnings.push(`全溶解度パラメータが異常に大きい値です (${totalSP.toFixed(1)} MPa^0.5)。CED値の単位を確認してください`);
  }

  if (deltaD < 10 || deltaD > 30) {
    warnings.push(`δD値 (${deltaD.toFixed(1)}) が一般的な範囲(10-30)外です`);
  }

  return {
    hsp: { deltaD, deltaP, deltaH },
    ced,
    molarVolume,
    totalSolubilityParameter: totalSP,
    consistency,
    warnings,
    evaluatedAt: new Date(),
  };
}
