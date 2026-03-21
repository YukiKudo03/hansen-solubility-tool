/**
 * NL11: 4+成分溶媒ブレンド最適化（差分進化法）
 *
 * 既存blend-optimizer.tsは2-3成分グリッドサーチに限定。
 * 4+成分では組合せ爆発するため差分進化(DE)アルゴリズムを使用。
 *
 * 目的関数: Minimize Ra(blend, target)
 * 制約: Σ(φi) = 1, φi ≥ 0
 *
 * DE/rand/1/bin:
 *   v = x_r1 + F*(x_r2 - x_r3)  (変異)
 *   u = crossover(x, v, CR)       (交差)
 *   x_new = u if f(u)<f(x) else x (選択)
 *
 * 参考文献:
 * - Storn, Price (1997) J. Global Optimization 11:341-359
 */

import type { HSPValues } from './types';
import { calculateRa } from './hsp';

/** 溶媒候補 */
export interface SolventCandidate {
  id: number;
  name: string;
  hsp: HSPValues;
  molarVolume: number;
}

/** 最適化パラメータ */
export interface MultiComponentOptimizationParams {
  targetHSP: HSPValues;
  candidates: SolventCandidate[];
  numComponents: number;
  maxIterations?: number;
  populationSize?: number;
  /** DE変異係数 F (0-2, default 0.7) */
  mutationFactor?: number;
  /** DE交差確率 CR (0-1, default 0.9) */
  crossoverRate?: number;
}

/** ブレンド成分 */
export interface BlendComponent {
  id: number;
  name: string;
  hsp: HSPValues;
  fraction: number;
}

/** 最適化結果 */
export interface MultiComponentOptimizationResult {
  components: BlendComponent[];
  blendHSP: HSPValues;
  ra: number;
  iterations: number;
}

/** 体積分率ベクトルからブレンドHSPを計算 */
function calculateBlendHSP(fractions: number[], candidates: SolventCandidate[]): HSPValues {
  let deltaD = 0, deltaP = 0, deltaH = 0;
  for (let i = 0; i < fractions.length; i++) {
    deltaD += fractions[i] * candidates[i].hsp.deltaD;
    deltaP += fractions[i] * candidates[i].hsp.deltaP;
    deltaH += fractions[i] * candidates[i].hsp.deltaH;
  }
  return { deltaD, deltaP, deltaH };
}

/** 分率ベクトルを正規化（合計=1, 非負） */
function normalizeFractions(fractions: number[]): number[] {
  // 負の値をクリップ
  const clipped = fractions.map(f => Math.max(f, 0));
  const sum = clipped.reduce((s, f) => s + f, 0);
  if (sum === 0) {
    // 全ゼロの場合は均等分配
    return clipped.map(() => 1 / clipped.length);
  }
  return clipped.map(f => f / sum);
}

/** 簡易擬似乱数生成器（Mulberry32） — テスト再現性のためシード付き */
function createRng(seed: number = 42): () => number {
  let s = seed;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 差分進化法(DE/rand/1/bin)で4+成分溶媒ブレンドを最適化する
 *
 * @param params - 最適化パラメータ
 * @returns 最適化結果
 */
export function optimizeMultiComponentBlend(
  params: MultiComponentOptimizationParams
): MultiComponentOptimizationResult {
  const {
    targetHSP,
    candidates,
    numComponents,
    maxIterations = 200,
    populationSize = 50,
    mutationFactor = 0.7,
    crossoverRate = 0.9,
  } = params;

  // 使用候補数を制限
  const n = Math.min(numComponents, candidates.length);
  const selectedCandidates = candidates.slice(0, Math.max(n, candidates.length));
  const dim = selectedCandidates.length;

  const rng = createRng(12345);

  // 目的関数: Ra(blend, target)
  const objective = (fracs: number[]): number => {
    const normalized = normalizeFractions(fracs);
    const blendHSP = calculateBlendHSP(normalized, selectedCandidates);
    return calculateRa(blendHSP, targetHSP);
  };

  // 初期個体群をランダムに生成
  const NP = Math.max(populationSize, dim * 5);
  let population: number[][] = [];
  for (let i = 0; i < NP; i++) {
    const individual = Array.from({ length: dim }, () => rng());
    population.push(normalizeFractions(individual));
  }

  let fitness = population.map(ind => objective(ind));

  // DE/rand/1/bin メインループ
  let iteration = 0;
  for (iteration = 0; iteration < maxIterations; iteration++) {
    for (let i = 0; i < NP; i++) {
      // 3つの異なるランダム個体を選択
      let r1: number, r2: number, r3: number;
      do { r1 = Math.floor(rng() * NP); } while (r1 === i);
      do { r2 = Math.floor(rng() * NP); } while (r2 === i || r2 === r1);
      do { r3 = Math.floor(rng() * NP); } while (r3 === i || r3 === r1 || r3 === r2);

      // 変異ベクトル: v = x_r1 + F*(x_r2 - x_r3)
      const mutant = population[r1].map((val, j) =>
        val + mutationFactor * (population[r2][j] - population[r3][j])
      );

      // 二項交差
      const jRand = Math.floor(rng() * dim);
      const trial = population[i].map((val, j) =>
        (rng() < crossoverRate || j === jRand) ? mutant[j] : val
      );

      // 正規化して評価
      const normalizedTrial = normalizeFractions(trial);
      const trialFitness = objective(normalizedTrial);

      // 選択（貪欲）
      if (trialFitness <= fitness[i]) {
        population[i] = normalizedTrial;
        fitness[i] = trialFitness;
      }
    }
  }

  // 最良個体を取得
  let bestIdx = 0;
  for (let i = 1; i < NP; i++) {
    if (fitness[i] < fitness[bestIdx]) bestIdx = i;
  }

  const bestFractions = population[bestIdx];
  const blendHSP = calculateBlendHSP(bestFractions, selectedCandidates);

  // 有効成分のみ抽出（fraction > 0.01）
  const components: BlendComponent[] = [];
  for (let i = 0; i < dim; i++) {
    if (bestFractions[i] > 0.01) {
      components.push({
        id: selectedCandidates[i].id,
        name: selectedCandidates[i].name,
        hsp: selectedCandidates[i].hsp,
        fraction: bestFractions[i],
      });
    }
  }

  // fractionを再正規化
  const activeSum = components.reduce((s, c) => s + c.fraction, 0);
  components.forEach(c => { c.fraction = c.fraction / activeSum; });

  return {
    components,
    blendHSP,
    ra: fitness[bestIdx],
    iterations: iteration,
  };
}
