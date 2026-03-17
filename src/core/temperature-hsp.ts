/**
 * 温度依存性HSP計算 — Barton法 (1991)
 *
 * HSP値は通常25°Cの文献値だが、高温プロセスでは補正が必要。
 * Bartonの近似式に基づき、密度の温度依存性と水素結合の温度減衰を考慮する。
 *
 * 参考: Barton, A.F.M. "Handbook of Solubility Parameters and Other Cohesion Parameters", 2nd ed., 1991
 */
import type { HSPValues } from './types';

/** デフォルトの参照温度 (°C) */
export const DEFAULT_REFERENCE_TEMPERATURE = 25;

/** Barton法のδH温度減衰係数 (K⁻¹) */
const DELTA_H_DECAY_COEFFICIENT = 1.22e-3;

/**
 * 熱膨張係数から密度比 ρ(T)/ρ(T0) を推定する
 *
 * @param temperature 目標温度 (°C)
 * @param referenceTemp 参照温度 (°C)
 * @param alpha 体積膨張係数 (K⁻¹)
 * @returns 密度比 ρ(T)/ρ(T0)
 */
export function estimateDensityRatio(
  temperature: number,
  referenceTemp: number,
  alpha: number,
): number {
  const deltaT = temperature - referenceTemp;
  // ρ(T)/ρ(T0) ≈ 1 / (1 + α × ΔT)
  return 1 / (1 + alpha * deltaT);
}

/**
 * Barton法によるHSP温度補正
 *
 * δD(T) = δD(T0) × (ρ(T)/ρ(T0))^1.25
 * δP(T) = δP(T0) × (ρ(T)/ρ(T0))^0.5
 * δH(T) = δH(T0) × exp(-1.22×10⁻³ × ΔT)
 *
 * @param hsp 参照温度でのHSP値
 * @param temperature 目標温度 (°C)
 * @param referenceTemp 参照温度 (°C, デフォルト: 25)
 * @param alpha 体積膨張係数 (K⁻¹)
 * @returns 温度補正後のHSP値
 */
export function correctHSPForTemperature(
  hsp: HSPValues,
  temperature: number,
  referenceTemp: number = DEFAULT_REFERENCE_TEMPERATURE,
  alpha: number,
): HSPValues {
  const densityRatio = estimateDensityRatio(temperature, referenceTemp, alpha);
  const deltaT = temperature - referenceTemp;

  return {
    deltaD: hsp.deltaD * Math.pow(densityRatio, 1.25),
    deltaP: hsp.deltaP * Math.pow(densityRatio, 0.5),
    deltaH: hsp.deltaH * Math.exp(-DELTA_H_DECAY_COEFFICIENT * deltaT),
  };
}
