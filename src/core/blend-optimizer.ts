/**
 * 溶剤ブレンド最適化 — グリッドサーチによる最適混合比探索
 */
import type { HSPValues, Solvent, BlendOptimizationInput, BlendResult, BlendOptimizationResult } from './types';
import { calculateRa } from './hsp';

/**
 * 溶媒群と体積分率からブレンドHSPを計算する
 */
export function blendHSP(solvents: Solvent[], fractions: number[]): HSPValues {
  let deltaD = 0;
  let deltaP = 0;
  let deltaH = 0;
  for (let i = 0; i < solvents.length; i++) {
    deltaD += fractions[i] * solvents[i].hsp.deltaD;
    deltaP += fractions[i] * solvents[i].hsp.deltaP;
    deltaH += fractions[i] * solvents[i].hsp.deltaH;
  }
  return { deltaD, deltaP, deltaH };
}

function insertResult(results: BlendResult[], newResult: BlendResult, topN: number): void {
  if (results.length < topN) {
    results.push(newResult);
    results.sort((a, b) => a.ra - b.ra);
  } else if (newResult.ra < results[results.length - 1].ra) {
    results[results.length - 1] = newResult;
    results.sort((a, b) => a.ra - b.ra);
  }
}

function search2Components(targetHSP: HSPValues, solvents: Solvent[], stepSize: number, topN: number): BlendResult[] {
  const results: BlendResult[] = [];
  const n = solvents.length;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      for (let f = stepSize; f <= 1 - stepSize + 1e-9; f += stepSize) {
        const f1 = f;
        const f2 = 1 - f;
        const blended = blendHSP([solvents[i], solvents[j]], [f1, f2]);
        const ra = calculateRa(targetHSP, blended);
        insertResult(results, {
          components: [
            { solvent: solvents[i], volumeFraction: Math.round(f1 * 1000) / 1000 },
            { solvent: solvents[j], volumeFraction: Math.round(f2 * 1000) / 1000 },
          ],
          blendHSP: blended,
          ra,
        }, topN);
      }
    }
  }
  return results;
}

function search3Components(targetHSP: HSPValues, solvents: Solvent[], stepSize: number, topN: number): BlendResult[] {
  const results: BlendResult[] = [];
  const n = solvents.length;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      for (let k = j + 1; k < n; k++) {
        for (let f1 = stepSize; f1 <= 1 - 2 * stepSize + 1e-9; f1 += stepSize) {
          for (let f2 = stepSize; f2 <= 1 - f1 - stepSize + 1e-9; f2 += stepSize) {
            const f3 = 1 - f1 - f2;
            if (f3 < stepSize - 1e-9) continue;
            const blended = blendHSP([solvents[i], solvents[j], solvents[k]], [f1, f2, f3]);
            const ra = calculateRa(targetHSP, blended);
            insertResult(results, {
              components: [
                { solvent: solvents[i], volumeFraction: Math.round(f1 * 1000) / 1000 },
                { solvent: solvents[j], volumeFraction: Math.round(f2 * 1000) / 1000 },
                { solvent: solvents[k], volumeFraction: Math.round(f3 * 1000) / 1000 },
              ],
              blendHSP: blended,
              ra,
            }, topN);
          }
        }
      }
    }
  }
  return results;
}

export function optimizeBlend(input: BlendOptimizationInput): BlendOptimizationResult {
  const { targetHSP, candidateSolvents, maxComponents, stepSize, topN } = input;
  const topResults = maxComponents === 2
    ? search2Components(targetHSP, candidateSolvents, stepSize, topN)
    : search3Components(targetHSP, candidateSolvents, stepSize, topN);
  return { targetHSP, topResults, evaluatedAt: new Date() };
}
