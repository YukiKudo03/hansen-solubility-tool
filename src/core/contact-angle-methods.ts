/**
 * 接触角推定の代替手法
 *
 * Owens-Wendt法: 表面エネルギーを分散成分と極性成分に分離して計算
 *   γ_SL = γ_SV + γ_LV - 2(√(γ_SV^d · γ_LV^d) + √(γ_SV^p · γ_LV^p))
 *   cos(θ) = (γ_SV - γ_SL) / γ_LV
 *
 * 出典: Owens, D.K. & Wendt, R.C. J. Appl. Polym. Sci. 13, 1741, 1969
 */
import type { HSPValues } from './types';

/** Nakamoto-Yamamoto 係数 */
const COEFF_D = 0.0947;
const COEFF_PH = 0.0315; // δP 用
const COEFF_H = 0.0238;  // δH 用

export interface SurfaceComponents {
  dispersive: number; // γ^d (mN/m)
  polar: number;      // γ^p (mN/m)
  total: number;      // γ (mN/m)
}

/**
 * HSP値を分散成分と極性成分に分離する
 *
 * γ^d = 0.0947 × δD²
 * γ^p = 0.0315 × δP² + 0.0238 × δH²
 */
export function splitHSPToSurfaceComponents(hsp: HSPValues): SurfaceComponents {
  const dispersive = COEFF_D * hsp.deltaD * hsp.deltaD;
  const polar = COEFF_PH * hsp.deltaP * hsp.deltaP + COEFF_H * hsp.deltaH * hsp.deltaH;
  return {
    dispersive,
    polar,
    total: dispersive + polar,
  };
}

/**
 * Owens-Wendt法による接触角推定
 *
 * γ_SL = γ_SV + γ_LV - 2(√(γ_SV^d · γ_LV^d) + √(γ_SV^p · γ_LV^p))
 * cos(θ) = (γ_SV - γ_SL) / γ_LV
 *
 * @returns 接触角 θ (°)
 */
export function owensWendtContactAngle(solidHSP: HSPValues, liquidHSP: HSPValues): number {
  const solid = splitHSPToSurfaceComponents(solidHSP);
  const liquid = splitHSPToSurfaceComponents(liquidHSP);

  if (liquid.total === 0) return 0;

  // Owens-Wendt 界面張力
  const interactionTerm =
    2 * (Math.sqrt(solid.dispersive * liquid.dispersive) + Math.sqrt(solid.polar * liquid.polar));

  const gammaSL = solid.total + liquid.total - interactionTerm;

  const cosTheta = Math.max(-1, Math.min(1, (solid.total - gammaSL) / liquid.total));

  return (Math.acos(cosTheta) * 180) / Math.PI;
}
