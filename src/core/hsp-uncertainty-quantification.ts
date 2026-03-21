/**
 * HSP不確かさ定量化（ブートストラップ法）
 *
 * sphere-fitting.tsのfitHSPSphereをN回ブートストラップし、
 * HSP中心座標とR0の95%信頼区間を算出する。
 */
import type { HSPValues } from './types';
import { fitHSPSphere, type SolventClassification } from './sphere-fitting';

/** ブートストラップ結果 */
export interface HSPUncertaintyResult {
  center: HSPValues;
  r0: number;
  confidence95: {
    deltaD: { low: number; high: number };
    deltaP: { low: number; high: number };
    deltaH: { low: number; high: number };
    r0: { low: number; high: number };
  };
  numSamples: number;
  numClassifications: number;
  evaluatedAt: Date;
}

/**
 * パーセンタイルを算出（ソート済み配列に対して）
 */
function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

/**
 * ランダムにリサンプリング（復元抽出）
 */
function resample<T>(arr: T[]): T[] {
  const result: T[] = [];
  for (let i = 0; i < arr.length; i++) {
    const idx = Math.floor(Math.random() * arr.length);
    result.push(arr[idx]);
  }
  return result;
}

/**
 * HSP不確かさをブートストラップ法で定量化する
 *
 * @param classifications - 溶媒分類データ
 * @param numSamples - ブートストラップ回数（デフォルト: 100）
 * @returns 中心値と95%信頼区間
 */
export function bootstrapHSPUncertainty(
  classifications: SolventClassification[],
  numSamples: number = 100,
): HSPUncertaintyResult {
  if (classifications.length === 0) {
    return {
      center: { deltaD: 0, deltaP: 0, deltaH: 0 },
      r0: 0,
      confidence95: {
        deltaD: { low: 0, high: 0 },
        deltaP: { low: 0, high: 0 },
        deltaH: { low: 0, high: 0 },
        r0: { low: 0, high: 0 },
      },
      numSamples,
      numClassifications: 0,
      evaluatedAt: new Date(),
    };
  }

  // まず全データでフィッティング → 中心値
  const fullFit = fitHSPSphere(classifications);

  const deltaDValues: number[] = [];
  const deltaPValues: number[] = [];
  const deltaHValues: number[] = [];
  const r0Values: number[] = [];

  for (let i = 0; i < numSamples; i++) {
    const sample = resample(classifications);
    const fit = fitHSPSphere(sample);
    deltaDValues.push(fit.center.deltaD);
    deltaPValues.push(fit.center.deltaP);
    deltaHValues.push(fit.center.deltaH);
    r0Values.push(fit.r0);
  }

  deltaDValues.sort((a, b) => a - b);
  deltaPValues.sort((a, b) => a - b);
  deltaHValues.sort((a, b) => a - b);
  r0Values.sort((a, b) => a - b);

  return {
    center: fullFit.center,
    r0: fullFit.r0,
    confidence95: {
      deltaD: { low: percentile(deltaDValues, 2.5), high: percentile(deltaDValues, 97.5) },
      deltaP: { low: percentile(deltaPValues, 2.5), high: percentile(deltaPValues, 97.5) },
      deltaH: { low: percentile(deltaHValues, 2.5), high: percentile(deltaHValues, 97.5) },
      r0: { low: percentile(r0Values, 2.5), high: percentile(r0Values, 97.5) },
    },
    numSamples,
    numClassifications: classifications.length,
    evaluatedAt: new Date(),
  };
}
