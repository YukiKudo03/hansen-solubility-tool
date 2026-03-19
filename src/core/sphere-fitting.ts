/**
 * HSP球フィッティング — 溶解試験データから最適なHSP中心座標とR₀を算出
 * Nelder-Mead法による最適化
 */
import type { HSPValues, Solvent } from './types';
import { calculateRa } from './hsp';

export interface SolventClassification {
  solvent: { hsp: HSPValues; name: string };
  isGood: boolean;
}

export interface SphereFitResult {
  center: HSPValues;
  r0: number;
  fitness: number;
  correctCount: number;
  totalCount: number;
  misclassified: { name: string; isGood: boolean; ra: number; red: number }[];
}

/** Nelder-Mead 定数 */
const ALPHA = 1.0;  // 反射
const GAMMA = 2.0;  // 拡張
const RHO = 0.5;    // 収縮
const SIGMA = 0.5;  // 縮小
const MAX_ITERATIONS = 1000;
const TOLERANCE = 1e-8;

type Vertex = [number, number, number, number]; // [δD, δP, δH, R₀]

/**
 * 適合度関数 — 正分類率を最大化し、R₀を小さく保つ
 * 戻り値は「コスト」（小さいほど良い）として返す
 */
function objectiveFunction(
  vertex: Vertex,
  classifications: SolventClassification[],
): number {
  const [dD, dP, dH, r0] = vertex;
  if (r0 <= 0) return 1e10;

  const center: HSPValues = { deltaD: dD, deltaP: dP, deltaH: dH };
  let correctCount = 0;
  const total = classifications.length;

  for (const c of classifications) {
    const ra = calculateRa(center, c.solvent.hsp);
    const red = ra / r0;
    if (c.isGood && red <= 1.0) {
      correctCount++;
    } else if (!c.isGood && red > 1.0) {
      correctCount++;
    }
  }

  // スコア = correct_count / total - 0.001 * R₀
  // コスト = -スコア（最小化問題に変換）
  const score = correctCount / total - 0.001 * r0;
  return -score;
}

function addVertices(a: Vertex, b: Vertex, scale: number): Vertex {
  return [
    a[0] + scale * (b[0] - a[0]),
    a[1] + scale * (b[1] - a[1]),
    a[2] + scale * (b[2] - a[2]),
    a[3] + scale * (b[3] - a[3]),
  ];
}

function centroid(vertices: Vertex[], excludeIndex: number): Vertex {
  const n = vertices.length - 1;
  const result: Vertex = [0, 0, 0, 0];
  for (let i = 0; i < vertices.length; i++) {
    if (i === excludeIndex) continue;
    result[0] += vertices[i][0];
    result[1] += vertices[i][1];
    result[2] += vertices[i][2];
    result[3] += vertices[i][3];
  }
  result[0] /= n;
  result[1] /= n;
  result[2] /= n;
  result[3] /= n;
  return result;
}

/**
 * 初期推定値を算出 — 良溶媒の重心とその最大距離
 */
function computeInitialGuess(classifications: SolventClassification[]): Vertex {
  const goods = classifications.filter((c) => c.isGood);

  if (goods.length === 0) {
    // 良溶媒がない場合、全溶媒の重心を使用
    const all = classifications;
    const dD = all.reduce((s, c) => s + c.solvent.hsp.deltaD, 0) / all.length;
    const dP = all.reduce((s, c) => s + c.solvent.hsp.deltaP, 0) / all.length;
    const dH = all.reduce((s, c) => s + c.solvent.hsp.deltaH, 0) / all.length;
    return [dD, dP, dH, 5.0];
  }

  const dD = goods.reduce((s, c) => s + c.solvent.hsp.deltaD, 0) / goods.length;
  const dP = goods.reduce((s, c) => s + c.solvent.hsp.deltaP, 0) / goods.length;
  const dH = goods.reduce((s, c) => s + c.solvent.hsp.deltaH, 0) / goods.length;

  const centerHSP: HSPValues = { deltaD: dD, deltaP: dP, deltaH: dH };
  let maxDist = 0;
  for (const g of goods) {
    const dist = calculateRa(centerHSP, g.solvent.hsp);
    if (dist > maxDist) maxDist = dist;
  }

  // R₀はゼロにならないように最低1.0を確保
  const r0 = Math.max(maxDist, 1.0);
  return [dD, dP, dH, r0];
}

/**
 * 初期シンプレックスを構築（5頂点 = 4次元 + 1）
 */
function buildInitialSimplex(guess: Vertex): Vertex[] {
  const simplex: Vertex[] = [guess];
  const perturbations = [1.0, 1.0, 1.0, 0.5]; // δD, δP, δH, R₀ の初期摂動幅
  for (let i = 0; i < 4; i++) {
    const v: Vertex = [...guess];
    v[i] += perturbations[i];
    simplex.push(v);
  }
  return simplex;
}

/**
 * シンプレックスの収束判定
 */
function hasConverged(simplex: Vertex[], costs: number[]): boolean {
  const best = costs[0];
  const worst = costs[costs.length - 1];
  return Math.abs(worst - best) < TOLERANCE;
}

/**
 * HSP球フィッティングを実行する
 * Nelder-Mead法で最適な (δD, δP, δH, R₀) を探索
 */
export function fitHSPSphere(classifications: SolventClassification[]): SphereFitResult {
  if (classifications.length === 0) {
    return {
      center: { deltaD: 0, deltaP: 0, deltaH: 0 },
      r0: 0,
      fitness: 0,
      correctCount: 0,
      totalCount: 0,
      misclassified: [],
    };
  }

  const guess = computeInitialGuess(classifications);
  const simplex = buildInitialSimplex(guess);
  const costs = simplex.map((v) => objectiveFunction(v, classifications));

  for (let iter = 0; iter < MAX_ITERATIONS; iter++) {
    // ソート（コスト昇順）
    const indices = Array.from({ length: 5 }, (_, i) => i);
    indices.sort((a, b) => costs[a] - costs[b]);
    const sortedSimplex = indices.map((i) => simplex[i]);
    const sortedCosts = indices.map((i) => costs[i]);
    for (let i = 0; i < 5; i++) {
      simplex[i] = sortedSimplex[i];
      costs[i] = sortedCosts[i];
    }

    if (hasConverged(simplex, costs)) break;

    const n = simplex.length - 1; // = 4
    const worstIdx = n;
    const cent = centroid(simplex, worstIdx);

    // 反射
    const reflected: Vertex = [
      cent[0] + ALPHA * (cent[0] - simplex[worstIdx][0]),
      cent[1] + ALPHA * (cent[1] - simplex[worstIdx][1]),
      cent[2] + ALPHA * (cent[2] - simplex[worstIdx][2]),
      cent[3] + ALPHA * (cent[3] - simplex[worstIdx][3]),
    ];
    const reflectedCost = objectiveFunction(reflected, classifications);

    if (reflectedCost < costs[0]) {
      // 拡張
      const expanded: Vertex = [
        cent[0] + GAMMA * (reflected[0] - cent[0]),
        cent[1] + GAMMA * (reflected[1] - cent[1]),
        cent[2] + GAMMA * (reflected[2] - cent[2]),
        cent[3] + GAMMA * (reflected[3] - cent[3]),
      ];
      const expandedCost = objectiveFunction(expanded, classifications);
      if (expandedCost < reflectedCost) {
        simplex[worstIdx] = expanded;
        costs[worstIdx] = expandedCost;
      } else {
        simplex[worstIdx] = reflected;
        costs[worstIdx] = reflectedCost;
      }
    } else if (reflectedCost < costs[n - 1]) {
      simplex[worstIdx] = reflected;
      costs[worstIdx] = reflectedCost;
    } else {
      // 収縮
      const contracted: Vertex = [
        cent[0] + RHO * (simplex[worstIdx][0] - cent[0]),
        cent[1] + RHO * (simplex[worstIdx][1] - cent[1]),
        cent[2] + RHO * (simplex[worstIdx][2] - cent[2]),
        cent[3] + RHO * (simplex[worstIdx][3] - cent[3]),
      ];
      const contractedCost = objectiveFunction(contracted, classifications);

      if (contractedCost < costs[worstIdx]) {
        simplex[worstIdx] = contracted;
        costs[worstIdx] = contractedCost;
      } else {
        // 縮小 — 最良頂点以外を最良頂点方向に縮小
        for (let i = 1; i < simplex.length; i++) {
          simplex[i] = [
            simplex[0][0] + SIGMA * (simplex[i][0] - simplex[0][0]),
            simplex[0][1] + SIGMA * (simplex[i][1] - simplex[0][1]),
            simplex[0][2] + SIGMA * (simplex[i][2] - simplex[0][2]),
            simplex[0][3] + SIGMA * (simplex[i][3] - simplex[0][3]),
          ];
          costs[i] = objectiveFunction(simplex[i], classifications);
        }
      }
    }
  }

  // 最終ソート
  const finalIndices = Array.from({ length: 5 }, (_, i) => i);
  finalIndices.sort((a, b) => costs[a] - costs[b]);
  const best = simplex[finalIndices[0]];
  const bestCost = costs[finalIndices[0]];

  const center: HSPValues = { deltaD: best[0], deltaP: best[1], deltaH: best[2] };
  const r0 = Math.max(best[3], 0.001); // R₀が負にならないようガード

  // 分類結果を集計
  let correctCount = 0;
  const misclassified: SphereFitResult['misclassified'] = [];

  for (const c of classifications) {
    const ra = calculateRa(center, c.solvent.hsp);
    const red = ra / r0;
    const isCorrect = c.isGood ? red <= 1.0 : red > 1.0;
    if (isCorrect) {
      correctCount++;
    } else {
      misclassified.push({
        name: c.solvent.name,
        isGood: c.isGood,
        ra,
        red,
      });
    }
  }

  const fitness = -bestCost; // スコアに戻す

  return {
    center,
    r0,
    fitness,
    correctCount,
    totalCount: classifications.length,
    misclassified,
  };
}
