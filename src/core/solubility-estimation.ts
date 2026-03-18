/**
 * 薬物溶解度の定量推定
 *
 * Greenhalgh-Williams (1999) の経験的相関式を基に、
 * RED値とlogPから溶解度(mg/mL)を概算する。
 *
 * 参考: Greenhalgh, D.J. et al. J. Pharm. Sci. 88(11), 1182-1190, 1999
 *
 * 注意: 推定値は参考値であり、±1桁の精度です。
 */

export interface SolubilityEstimation {
  mgPerMl: number;
  confidence: 'high' | 'medium' | 'low';
  label: string;
}

/**
 * RED値とlogPから溶解度を推定する
 *
 * 経験式: log₁₀(S) ≈ 2.0 - 2.5 × RED² - 0.3 × logP
 * S: 溶解度 (mg/mL)
 *
 * @param red RED値
 * @param logP 分配係数（null の場合はフォールバック推定）
 */
export function estimateSolubility(red: number, logP: number | null): SolubilityEstimation {
  const redClamped = Math.max(0, red);

  let logS: number;
  let confidence: 'high' | 'medium' | 'low';

  if (logP !== null && !isNaN(logP)) {
    // logP利用可能: 精度やや向上
    logS = 2.0 - 2.5 * redClamped * redClamped - 0.3 * logP;
    confidence = 'medium';
  } else {
    // logP不明: RED値のみで推定
    logS = 1.5 - 2.5 * redClamped * redClamped;
    confidence = 'low';
  }

  // 溶解度の下限を設定（0.001 mg/mL未満は実質不溶）
  const mgPerMl = Math.max(0.001, Math.pow(10, logS));

  return {
    mgPerMl,
    confidence,
    label: solubilityToLabel(mgPerMl),
  };
}

/**
 * 溶解度(mg/mL)から定性的ラベルを返す
 */
export function solubilityToLabel(mgPerMl: number): string {
  if (mgPerMl >= 100) return '高溶解性';
  if (mgPerMl >= 10) return '溶解性あり';
  if (mgPerMl >= 1) return 'やや難溶';
  if (mgPerMl >= 0.01) return '難溶';
  return '不溶';
}
