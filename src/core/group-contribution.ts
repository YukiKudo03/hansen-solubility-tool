/**
 * グループ寄与法によるHSP推定 — Van Krevelen-Hoftyzer法
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
 * グループ寄与法によるHSP推定
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

/**
 * 簡易的な分子名→グループ分解（将来的にSMILESパーサーに置き換え予定）
 * 現在は空配列を返す（手動グループ入力のみ対応）
 */
export function parseSimpleMolecularFormula(_name: string): GroupInput[] {
  // TODO: SMILES パーサー統合時に実装
  return [];
}
