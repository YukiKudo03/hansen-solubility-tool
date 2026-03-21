/**
 * ML HSP予測（QSPRルールベース版）
 *
 * 実際のMLモデルの代わりに、分子記述子からHSPを経験的回帰式で推算する。
 * QSPR (Quantitative Structure-Property Relationship) アプローチ。
 *
 * 経験的回帰式:
 * - dD = 17.5 + 0.04 * aromaticRings * mw^0.3
 * - dP = 2.0 * sqrt(numHBAcceptors + numHBDonors)
 * - dH = 3.0 * (numHBDonors + 0.5 * numHBAcceptors)
 *
 * ここで mw = molarVolume * specificGravity (概算分子量)
 *
 * 参考文献:
 * - Jurs et al. (2000) Chem. Rev. 100:2649 (QSPR methods)
 * - Gharagheizi et al. (2011) J. Chem. Eng. Data (HSP QSPR models)
 */

import type { HSPValues } from './types';

/** 分子記述子 */
export interface MolecularDescriptors {
  molarVolume: number;      // モル体積 (cm³/mol)
  logP: number;             // 分配係数
  numHBDonors: number;      // 水素結合ドナー数
  numHBAcceptors: number;   // 水素結合アクセプター数
  aromaticRings: number;    // 芳香環数
}

/** QSPR予測結果 */
export interface QSPRPredictionResult {
  hsp: HSPValues;
  descriptors: MolecularDescriptors;
  confidence: 'high' | 'medium' | 'low';
  warnings: string[];
  evaluatedAt: Date;
}

/**
 * 分子記述子の信頼度を判定する
 */
function assessConfidence(desc: MolecularDescriptors): 'high' | 'medium' | 'low' {
  const warnings: string[] = [];
  if (desc.molarVolume < 30 || desc.molarVolume > 500) warnings.push('molarVolume');
  if (desc.logP < -3 || desc.logP > 8) warnings.push('logP');
  if (desc.aromaticRings > 5) warnings.push('aromaticRings');
  if (warnings.length === 0) return 'high';
  if (warnings.length <= 1) return 'medium';
  return 'low';
}

/**
 * 分子記述子入力のバリデーション
 */
export function validateDescriptors(desc: MolecularDescriptors): string | null {
  if (!Number.isFinite(desc.molarVolume) || desc.molarVolume <= 0) {
    return 'モル体積は正の数値を入力してください';
  }
  if (!Number.isFinite(desc.logP)) {
    return 'logPは有限数値を入力してください';
  }
  if (!Number.isInteger(desc.numHBDonors) || desc.numHBDonors < 0) {
    return '水素結合ドナー数は0以上の整数を入力してください';
  }
  if (!Number.isInteger(desc.numHBAcceptors) || desc.numHBAcceptors < 0) {
    return '水素結合アクセプター数は0以上の整数を入力してください';
  }
  if (!Number.isInteger(desc.aromaticRings) || desc.aromaticRings < 0) {
    return '芳香環数は0以上の整数を入力してください';
  }
  return null;
}

/**
 * 分子記述子からHSPを経験的回帰式で推算する
 *
 * @param descriptors - 分子記述子
 * @returns QSPR予測結果
 */
export function estimateHSPFromDescriptors(descriptors: MolecularDescriptors): QSPRPredictionResult {
  const err = validateDescriptors(descriptors);
  if (err) throw new Error(err);

  const { molarVolume, logP, numHBDonors, numHBAcceptors, aromaticRings } = descriptors;
  const warnings: string[] = [];

  // 概算分子量: 一般的な有機液体の比重~0.8-1.2として mw ≈ molarVolume * 1.0
  // ただしlogPからの補正を加える
  const mw = molarVolume * (0.8 + 0.1 * Math.max(0, logP));

  // 経験的回帰式
  // δD: 分散力項 — 芳香環と分子量に依存
  let deltaD = 17.5 + 0.04 * aromaticRings * Math.pow(mw, 0.3);

  // δP: 極性項 — 水素結合関連基の数に依存
  let deltaP = 2.0 * Math.sqrt(numHBAcceptors + numHBDonors);

  // δH: 水素結合項 — ドナー・アクセプターの重み付き合計
  let deltaH = 3.0 * (numHBDonors + 0.5 * numHBAcceptors);

  // logP補正: 高logP → 非極性 → dP, dH減少
  if (logP > 3) {
    deltaP *= Math.max(0.3, 1.0 - 0.1 * (logP - 3));
    deltaH *= Math.max(0.3, 1.0 - 0.1 * (logP - 3));
    warnings.push('高logP: 極性・水素結合項を減衰補正しています');
  }

  // 低logP補正: 低logP → 親水性 → dP, dH増加
  if (logP < 0) {
    deltaP += Math.abs(logP) * 1.5;
    deltaH += Math.abs(logP) * 2.0;
    warnings.push('負logP: 極性・水素結合項を増加補正しています');
  }

  // 範囲クリップ
  deltaD = Math.max(0, Math.min(50, deltaD));
  deltaP = Math.max(0, Math.min(50, deltaP));
  deltaH = Math.max(0, Math.min(50, deltaH));

  const confidence = assessConfidence(descriptors);
  if (confidence === 'low') {
    warnings.push('記述子が典型的な範囲外です。推算精度が低い可能性があります');
  }

  return {
    hsp: { deltaD, deltaP, deltaH },
    descriptors,
    confidence,
    warnings,
    evaluatedAt: new Date(),
  };
}
