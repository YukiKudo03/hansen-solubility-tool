/**
 * HSP推定のための族寄与法
 * 1. Van Krevelen-Hoftyzer法（既存）
 * 2. Stefanis-Panayiotou法（2008）— 1次基+2次基による高精度推定
 */

import type { HSPValues } from './types';

// ============================================================================
// 共通インターフェース
// ============================================================================

export interface GroupCount {
  groupId: string;
  count: number;
}

export interface GroupContributionInput {
  firstOrderGroups: GroupCount[];
  secondOrderGroups?: GroupCount[];
}

export interface GroupContributionResult {
  hsp: HSPValues;
  method: 'van-krevelen' | 'stefanis-panayiotou';
  confidence: 'high' | 'medium' | 'low';
  warnings: string[];
}

// ============================================================================
// Method 1: Van Krevelen-Hoftyzer法
// ============================================================================

/**
 * Van Krevelen-Hoftyzer グループ寄与データ
 *
 * δD = ΣFdi / V
 * δP = (ΣFpi²)^0.5 / V
 * δH = (ΣEhi / V)^0.5
 *
 * 出典: Van Krevelen, D.W. "Properties of Polymers", 4th ed., Tables 7.9-7.11
 */

export interface GroupContribution {
  Fd: number;  // 分散力寄与 (J^0.5 cm^1.5 mol^-1)
  Fp: number;  // 極性力寄与 (J^0.5 cm^1.5 mol^-1)
  Eh: number;  // 水素結合エネルギー (J/mol)
  V: number;   // モル体積寄与 (cm³/mol)
}

export interface GroupInput {
  group: string;
  count: number;
}

export interface HSPEstimation {
  deltaD: number;     // MPa^0.5
  deltaP: number;     // MPa^0.5
  deltaH: number;     // MPa^0.5
  molarVolume: number; // cm³/mol
}

/**
 * Van Krevelen-Hoftyzer グループ寄与テーブル
 * 単位: Fd (J^0.5 cm^1.5 mol^-1), Fp (同), Eh (J/mol), V (cm³/mol)
 */
export const GROUP_CONTRIBUTION_TABLE: Record<string, GroupContribution> = {
  // 脂肪族基
  '-CH3':     { Fd: 420,  Fp: 0,    Eh: 0,     V: 33.5 },
  '-CH2-':    { Fd: 270,  Fp: 0,    Eh: 0,     V: 16.1 },
  '>CH-':     { Fd: 80,   Fp: 0,    Eh: 0,     V: -1.0 },
  '>C<':      { Fd: -70,  Fp: 0,    Eh: 0,     V: -19.2 },

  // 芳香族基
  '=CH-':     { Fd: 200,  Fp: 0,    Eh: 0,     V: 13.5 },
  '=C<':      { Fd: 70,   Fp: 0,    Eh: 0,     V: -5.5 },
  'phenyl':   { Fd: 1270, Fp: 110,  Eh: 0,     V: 71.4 },
  'phenylene':{ Fd: 1140, Fp: 110,  Eh: 0,     V: 52.4 },

  // 含酸素基
  '-OH':      { Fd: 210,  Fp: 500,  Eh: 20000, V: 10.0 },
  '-O-':      { Fd: 100,  Fp: 400,  Eh: 3000,  V: 3.8 },
  '>C=O':     { Fd: 290,  Fp: 770,  Eh: 2000,  V: 10.8 },
  '-COO-':    { Fd: 390,  Fp: 490,  Eh: 7000,  V: 18.0 },
  '-COOH':    { Fd: 530,  Fp: 420,  Eh: 10000, V: 28.5 },
  'H-COO-':   { Fd: 530,  Fp: 490,  Eh: 7000,  V: 32.5 },

  // 含窒素基
  '-NH2':     { Fd: 280,  Fp: 370,  Eh: 8400,  V: 19.2 },
  '-NH-':     { Fd: 160,  Fp: 210,  Eh: 3100,  V: 4.5 },
  '>N-':      { Fd: 20,   Fp: 800,  Eh: 5000,  V: -9.0 },
  '-CN':      { Fd: 430,  Fp: 1100, Eh: 2500,  V: 24.0 },
  '-NO2':     { Fd: 500,  Fp: 1070, Eh: 1500,  V: 32.0 },
  '-N=C=O':   { Fd: 600,  Fp: 900,  Eh: 2500,  V: 30.0 },
  '-CON<':    { Fd: 370,  Fp: 770,  Eh: 11000, V: 9.5 },

  // 含硫黄基
  '-S-':      { Fd: 440,  Fp: 0,    Eh: 0,     V: 12.0 },
  '-SO2-':    { Fd: 590,  Fp: 1300, Eh: 5000,  V: 28.0 },

  // ハロゲン基
  '-F':       { Fd: 220,  Fp: 0,    Eh: 0,     V: 18.0 },
  '-Cl':      { Fd: 450,  Fp: 550,  Eh: 400,   V: 24.0 },
  '-Br':      { Fd: 550,  Fp: 0,    Eh: 0,     V: 30.0 },
};

/**
 * Van Krevelen-Hoftyzer法によるHSP推定
 * @throws グループリストが空、または不明なグループ名の場合
 */
export function estimateHSPFromGroups(groups: GroupInput[]): HSPEstimation {
  if (groups.length === 0) {
    throw new Error('グループリストが空です');
  }

  let sumFd = 0;
  let sumFp2 = 0;
  let sumEh = 0;
  let sumV = 0;

  for (const { group, count } of groups) {
    const gc = GROUP_CONTRIBUTION_TABLE[group];
    if (!gc) {
      throw new Error(`不明なグループ名: ${group}`);
    }
    sumFd += gc.Fd * count;
    sumFp2 += (gc.Fp * gc.Fp) * count;
    sumEh += gc.Eh * count;
    sumV += gc.V * count;
  }

  if (sumV <= 0) {
    throw new Error('モル体積が0以下です — グループ構成を見直してください');
  }

  // V は cm³/mol、HSP は MPa^0.5
  // 1 (J/cm³)^0.5 = 1 MPa^0.5 ではなく、1 (cal/cm³)^0.5 ≈ 2.046 MPa^0.5
  // Van Krevelenの表は (J^0.5 cm^1.5 mol^-1) なので直接 V で割って (J/cm³)^0.5 → (MPa)^0.5 変換は不要
  // ただし Fd/V の単位は (J/cm³)^0.5 = (10^6 Pa / 10^-6 m³/cm³)^0.5 なので
  // MPa^0.5 への変換: (J/cm³)^0.5 = (MPa)^0.5 （同一）

  const deltaD = sumFd / sumV;
  const deltaP = Math.sqrt(sumFp2) / sumV;
  const deltaH = Math.sqrt(sumEh / sumV);

  return {
    deltaD,
    deltaP,
    deltaH,
    molarVolume: sumV,
  };
}

/** Van Krevelen-Hoftyzer法のエイリアス */
export const estimateHSPVanKrevelen = estimateHSPFromGroups;

/**
 * 簡易的な分子名→グループ分解（将来的にSMILESパーサーに置き換え予定）
 * 現在は空配列を返す（手動グループ入力のみ対応）
 */
export function parseSimpleMolecularFormula(_name: string): GroupInput[] {
  // TODO: SMILES パーサー統合時に実装
  return [];
}

// ============================================================================
// Method 2: Stefanis-Panayiotou法 (2008)
// ============================================================================

/**
 * Stefanis-Panayiotou法の普遍定数
 *
 * δD = Σ(Ni × Ci_D) + W_D
 * δP = Σ(Ni × Ci_P) + W_P
 * δH = Σ(Ni × Ci_H) + W_H
 */
const SP_CONSTANT_W_D = 17.3231;
const SP_CONSTANT_W_P = 3.8253;
const SP_CONSTANT_W_H = 5.8545;

/**
 * 1次基（First-order groups）— Stefanis & Panayiotou 2008
 * 各値は普遍定数に加算される寄与値 (MPa^0.5)
 */
const SP_FIRST_ORDER_GROUPS: Record<string, { name: string; dD: number; dP: number; dH: number }> = {
  'CH3':     { name: 'メチル基',               dD: -0.9714, dP: -1.6448, dH: -0.7813 },
  'CH2':     { name: 'メチレン基',             dD: -0.0269, dP: -0.3045, dH: -0.5765 },
  'CH':      { name: 'メチン基',               dD: 0.6450,  dP: 0.6813,  dH: -0.3214 },
  'C':       { name: '四級炭素',               dD: 0.8446,  dP: 1.2055,  dH: -0.4832 },
  'CH2=CH':  { name: 'ビニル基',               dD: -0.3387, dP: -0.3032, dH: -0.2534 },
  'CH=CH':   { name: 'ビニレン基',             dD: 0.2492,  dP: 0.7692,  dH: -0.4794 },
  'ACH':     { name: '芳香族CH',               dD: 0.2214,  dP: -0.2128, dH: -0.5765 },
  'AC':      { name: '芳香族C',                dD: 0.8840,  dP: 1.3072,  dH: -0.5765 },
  'OH':      { name: 'ヒドロキシル基',         dD: -0.5370, dP: 2.3394,  dH: 8.1756 },
  'CH3OH':   { name: 'メタノール',             dD: -1.5070, dP: 0.6955,  dH: 7.3944 },
  'H2O':     { name: '水',                     dD: -1.6800, dP: 12.1900, dH: 23.2400 },
  'CH3CO':   { name: 'アセチル基',             dD: -1.0587, dP: 3.5999,  dH: 0.4275 },
  'CHO':     { name: 'アルデヒド基',           dD: -0.2073, dP: 3.8510,  dH: 2.0645 },
  'COOH':    { name: 'カルボキシル基',         dD: -0.9066, dP: 1.2322,  dH: 4.7578 },
  'COO':     { name: 'エステル基',             dD: -0.1476, dP: 2.2036,  dH: 0.1267 },
  'HCOO':    { name: 'ギ酸エステル',           dD: -0.6727, dP: 2.1544,  dH: 1.6342 },
  'CH3O':    { name: 'メトキシ基',             dD: -0.7696, dP: 0.6489,  dH: 0.6044 },
  'CH2O':    { name: 'エーテル（CH2O）',       dD: 0.0547,  dP: 1.2090,  dH: 0.3312 },
  'NH2':     { name: 'アミノ基',               dD: -0.7602, dP: 1.4498,  dH: 3.7336 },
  'NH':      { name: 'イミノ基',               dD: 0.1824,  dP: 2.0547,  dH: 1.5818 },
  'CN':      { name: 'シアノ基',               dD: 0.5765,  dP: 8.8110,  dH: 1.5386 },
  'NO2':     { name: 'ニトロ基',               dD: 0.3749,  dP: 5.2152,  dH: 1.0513 },
  'F':       { name: 'フッ素',                 dD: -0.6714, dP: 1.3700,  dH: -0.5009 },
  'Cl':      { name: '塩素',                   dD: 0.4529,  dP: 1.5891,  dH: -0.2568 },
  'Br':      { name: '臭素',                   dD: 1.0760,  dP: 0.9818,  dH: 0.0300 },
  'I':       { name: 'ヨウ素',                 dD: 2.0000,  dP: 1.2000,  dH: 0.0800 },
  'DMSO':    { name: 'ジメチルスルホキシド',   dD: -0.2392, dP: 12.8050, dH: 4.5328 },
  'CO':      { name: 'カルボニル基',           dD: 0.2849,  dP: 3.0540,  dH: 0.6648 },
  'CS2':     { name: '二硫化炭素',             dD: 2.8266,  dP: -3.8253, dH: -5.1457 },
  'CCl3':    { name: 'トリクロロ',             dD: 1.5895,  dP: 1.3560,  dH: -0.3370 },
  'CCl2':    { name: 'ジクロロ',               dD: 1.1044,  dP: 2.4998,  dH: -0.0958 },
};

/**
 * 2次基（Second-order groups）— 構造補正項
 */
const SP_SECOND_ORDER_GROUPS: Record<string, { name: string; dD: number; dP: number; dH: number }> = {
  'alcohol':       { name: 'アルコール補正', dD: 0.0, dP: -0.5, dH: 1.5 },
  'aromatic_ring': { name: '芳香環補正',     dD: 0.3, dP: -0.1, dH: -0.2 },
  'conjugation':   { name: '共役補正',       dD: 0.1, dP: 0.2,  dH: -0.1 },
};

/**
 * Stefanis-Panayiotou法によるHSP推定
 *
 * δ_i = Σ(Nj × Cj_i) + Σ(Mk × Dk_i) + W_i
 *
 * @param input 1次基および（任意で）2次基のグループカウント
 * @returns HSP推定結果（信頼度・警告付き）
 */
export function estimateHSPStefanisPanayiotou(input: GroupContributionInput): GroupContributionResult {
  const warnings: string[] = [];

  if (input.firstOrderGroups.length === 0) {
    throw new Error('1次基グループリストが空です');
  }

  // 1次基の寄与を集計
  let sumD = 0;
  let sumP = 0;
  let sumH = 0;
  let recognizedFirstOrder = 0;

  for (const { groupId, count } of input.firstOrderGroups) {
    const group = SP_FIRST_ORDER_GROUPS[groupId];
    if (!group) {
      warnings.push(`不明な1次基: ${groupId}`);
      continue;
    }
    sumD += group.dD * count;
    sumP += group.dP * count;
    sumH += group.dH * count;
    recognizedFirstOrder++;
  }

  if (recognizedFirstOrder === 0) {
    throw new Error('有効な1次基が1つもありません');
  }

  // 2次基の寄与を集計
  let recognizedSecondOrder = 0;
  if (input.secondOrderGroups && input.secondOrderGroups.length > 0) {
    for (const { groupId, count } of input.secondOrderGroups) {
      const group = SP_SECOND_ORDER_GROUPS[groupId];
      if (!group) {
        warnings.push(`不明な2次基: ${groupId}`);
        continue;
      }
      sumD += group.dD * count;
      sumP += group.dP * count;
      sumH += group.dH * count;
      recognizedSecondOrder++;
    }
  }

  // 普遍定数を加算
  const deltaD = sumD + SP_CONSTANT_W_D;
  const deltaP = sumP + SP_CONSTANT_W_P;
  const deltaH = sumH + SP_CONSTANT_W_H;

  // 信頼度判定
  const totalInputGroups = input.firstOrderGroups.length +
    (input.secondOrderGroups?.length ?? 0);
  const totalRecognized = recognizedFirstOrder + recognizedSecondOrder;
  const recognitionRate = totalRecognized / totalInputGroups;

  let confidence: 'high' | 'medium' | 'low';
  if (recognitionRate >= 0.9 && recognizedFirstOrder >= 3) {
    confidence = 'high';
  } else if (recognitionRate >= 0.7 && recognizedFirstOrder >= 2) {
    confidence = 'medium';
  } else {
    confidence = 'low';
  }

  if (confidence === 'low') {
    warnings.push('認識されたグループ数が少ないため、推定精度が低い可能性があります');
  }

  return {
    hsp: { deltaD, deltaP, deltaH },
    method: 'stefanis-panayiotou',
    confidence,
    warnings,
  };
}

/**
 * 利用可能な1次基の一覧を返す
 */
export function getAvailableFirstOrderGroups(): Array<{ id: string; name: string }> {
  return Object.entries(SP_FIRST_ORDER_GROUPS).map(([id, { name }]) => ({ id, name }));
}

/**
 * 利用可能な2次基の一覧を返す
 */
export function getAvailableSecondOrderGroups(): Array<{ id: string; name: string }> {
  return Object.entries(SP_SECOND_ORDER_GROUPS).map(([id, { name }]) => ({ id, name }));
}
