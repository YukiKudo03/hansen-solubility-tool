/**
 * NL04: Flory-Rehner膨潤平衡計算
 *
 * 架橋ゲル/エラストマーの平衡膨潤度を数値的に求める。
 *
 * Flory-Rehner方程式:
 *   ln(1-φp) + φp + χ·φp² = -Vs·νe·(φp^(1/3) - φp/2)
 *
 * φp: ポリマー体積分率（膨潤平衡時）
 * χ: Flory-Huggins相互作用パラメータ
 * Vs: 溶媒モル体積 [cm³/mol]
 * νe: 架橋密度 [mol/cm³]
 * Q = 1/φp: 体積膨潤度
 *
 * 参考文献:
 * - Flory, Rehner (1943) J. Chem. Phys. 11:521
 * - Mark, Erman (2007) Rubberlike Elasticity
 */

/** Flory-Rehner計算の入力パラメータ */
export interface FloryRehnerParams {
  /** Flory-Huggins chi パラメータ */
  chi: number;
  /** 溶媒モル体積 [cm³/mol] */
  vs: number;
  /** 架橋密度 [mol/cm³] */
  crosslinkDensity: number;
}

/**
 * Flory-Rehner方程式の残差関数
 *
 * f(φp) = ln(1-φp) + φp + χ·φp² + Vs·νe·(φp^(1/3) - φp/2) = 0
 */
function floryRehnerResidual(phiP: number, params: FloryRehnerParams): number {
  const { chi, vs, crosslinkDensity } = params;

  // 混合項（Flory-Huggins）
  const mixingTerm = Math.log(1 - phiP) + phiP + chi * phiP * phiP;

  // 弾性項（架橋ネットワーク）
  const elasticTerm = vs * crosslinkDensity * (Math.pow(phiP, 1 / 3) - phiP / 2);

  return mixingTerm + elasticTerm;
}

/**
 * Flory-Rehner方程式をBrent法（二分法改良）で数値的に解く
 *
 * φpの解を [lo, hi] = [0.001, 0.999] の区間で探索する。
 *
 * @param params - Flory-Rehnerパラメータ
 * @param tol - 収束許容誤差（デフォルト: 1e-10）
 * @param maxIter - 最大反復回数（デフォルト: 100）
 * @returns 平衡ポリマー体積分率 φp (0 < φp < 1)
 */
export function solveFloryRehner(
  params: FloryRehnerParams,
  tol: number = 1e-10,
  maxIter: number = 100
): number {
  if (params.vs <= 0) throw new Error('Molar volume must be positive');
  if (params.crosslinkDensity <= 0) throw new Error('Crosslink density must be positive');

  // 探索区間
  let lo = 0.001;
  let hi = 0.999;

  let fLo = floryRehnerResidual(lo, params);
  let fHi = floryRehnerResidual(hi, params);

  // 同符号の場合は区間を調整
  if (fLo * fHi > 0) {
    // 高架橋密度でほとんど膨潤しないケース
    // φp → 1 に近い解を探す
    lo = 0.5;
    fLo = floryRehnerResidual(lo, params);
  }

  // 二分法
  for (let i = 0; i < maxIter; i++) {
    const mid = (lo + hi) / 2;
    const fMid = floryRehnerResidual(mid, params);

    if (Math.abs(fMid) < tol || (hi - lo) / 2 < tol) {
      return mid;
    }

    if (fMid * fLo < 0) {
      hi = mid;
      fHi = fMid;
    } else {
      lo = mid;
      fLo = fMid;
    }
  }

  return (lo + hi) / 2;
}

/** 膨潤度計算結果 */
export interface SwellingResult {
  /** 平衡ポリマー体積分率 */
  phiP: number;
  /** 体積膨潤度 Q = 1/φp */
  swellingRatio: number;
}

/**
 * 膨潤度を計算する
 *
 * @param params - Flory-Rehnerパラメータ
 * @returns 膨潤結果
 */
export function calculateSwellingRatio(params: FloryRehnerParams): SwellingResult {
  const phiP = solveFloryRehner(params);
  return {
    phiP,
    swellingRatio: 1 / phiP,
  };
}
