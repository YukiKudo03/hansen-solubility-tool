/**
 * NL09: 接着仕事 (Work of Adhesion) 計算
 *
 * Owens-Wendt-Kaelble モデルに基づく接着仕事の計算:
 * Wa = 2 * (sqrt(gammaD1 * gammaD2) + sqrt(gammaP1 * gammaP2))
 *
 * HSPから表面エネルギー成分への変換（Panayiotou-Stefanis/Toyota相関）:
 * gammaD = 0.0947 * deltaD^2
 * gammaP = 0.0315 * deltaP^2
 * gammaH = 0.0238 * deltaH^2
 *
 * 参考文献:
 * - Owens, Wendt (1969) J. Appl. Polym. Sci. 13:1741
 * - Panayiotou (2002) J. Chem. Thermodyn.
 * - Hansen Solubility Parameters Surface Energy (hansen-solubility.com)
 */

import type { HSPValues } from './types';

/** 表面エネルギー成分 [mJ/m²] */
export interface SurfaceEnergyComponents {
  /** 分散成分 */
  gammaD: number;
  /** 極性成分 */
  gammaP: number;
  /** 水素結合成分 */
  gammaH: number;
  /** 合計 */
  gammaTotal: number;
}

/** 表面エネルギー入力（2成分モデル）*/
export interface SurfaceEnergy2C {
  gammaD: number;
  gammaP: number;
}

// Toyota/Panayiotou-Stefanis 変換係数
const COEFF_D = 0.0947;
const COEFF_P = 0.0315;
const COEFF_H = 0.0238;

/**
 * HSP値から表面エネルギー成分を推算する
 *
 * @param hsp - HSP値 [MPa^0.5]
 * @returns 表面エネルギー成分 [mJ/m²]
 */
export function hspToSurfaceEnergyComponents(hsp: HSPValues): SurfaceEnergyComponents {
  const gammaD = COEFF_D * hsp.deltaD * hsp.deltaD;
  const gammaP = COEFF_P * hsp.deltaP * hsp.deltaP;
  const gammaH = COEFF_H * hsp.deltaH * hsp.deltaH;

  return {
    gammaD,
    gammaP,
    gammaH,
    gammaTotal: gammaD + gammaP + gammaH,
  };
}

/**
 * 2成分表面エネルギーモデルから接着仕事を計算する（Owens-Wendt）
 *
 * Wa = 2 * (sqrt(gammaD1 * gammaD2) + sqrt(gammaP1 * gammaP2))
 *
 * @param surface1 - 材料1の表面エネルギー成分 [mJ/m²]
 * @param surface2 - 材料2の表面エネルギー成分 [mJ/m²]
 * @returns 接着仕事 Wa [mJ/m²]
 */
export function calculateWorkOfAdhesion(
  surface1: SurfaceEnergy2C,
  surface2: SurfaceEnergy2C
): number {
  return 2 * (
    Math.sqrt(surface1.gammaD * surface2.gammaD) +
    Math.sqrt(surface1.gammaP * surface2.gammaP)
  );
}

/**
 * HSP値から直接接着仕事を計算する
 *
 * HSP → 表面エネルギー成分 → 接着仕事 の一括計算。
 * 3成分（D, P, H）全てを使用した拡張Owens-Wendtモデル。
 *
 * Wa = 2 * (sqrt(gammaD1*gammaD2) + sqrt(gammaP1*gammaP2) + sqrt(gammaH1*gammaH2))
 *
 * @param hsp1 - 材料1のHSP値
 * @param hsp2 - 材料2のHSP値
 * @returns 接着仕事 Wa [mJ/m²]
 */
export function calculateWorkOfAdhesionFromHSP(
  hsp1: HSPValues,
  hsp2: HSPValues
): number {
  const se1 = hspToSurfaceEnergyComponents(hsp1);
  const se2 = hspToSurfaceEnergyComponents(hsp2);

  return 2 * (
    Math.sqrt(se1.gammaD * se2.gammaD) +
    Math.sqrt(se1.gammaP * se2.gammaP) +
    Math.sqrt(se1.gammaH * se2.gammaH)
  );
}
