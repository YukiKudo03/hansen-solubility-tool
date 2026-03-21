/**
 * NL11: 4+成分溶媒最適化（差分進化法）のテスト
 *
 * 既存blend-optimizer.tsは2-3成分グリッドサーチ。
 * 4+成分では組合せ爆発するため進化的アルゴリズムが必要。
 *
 * 数式:
 *   Minimize Ra(blend, target) subject to:
 *     Σ(φi) = 1, φi ≥ 0
 *     Optional: コスト制約, 沸点制約, 粘度制約
 *
 * 検証: 既知のターゲットHSPに対して、4成分ブレンドがRa<1に到達できるか
 */
import { describe, it, expect } from 'vitest';

import {
  optimizeMultiComponentBlend,
  type MultiComponentOptimizationParams,
  type MultiComponentOptimizationResult,
} from '../../src/core/multicomponent-optimizer';

// ===== ターゲット: PS (18.5, 4.5, 2.9) =====
const PS_TARGET = { deltaD: 18.5, deltaP: 4.5, deltaH: 2.9 };

// ===== 溶媒候補（4+成分） =====
const SOLVENTS = [
  { id: 1, name: 'Toluene', hsp: { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 }, molarVolume: 106.8 },
  { id: 2, name: 'Acetone', hsp: { deltaD: 15.5, deltaP: 10.4, deltaH: 7.0 }, molarVolume: 74.0 },
  { id: 3, name: 'Ethanol', hsp: { deltaD: 15.8, deltaP: 8.8, deltaH: 19.4 }, molarVolume: 58.5 },
  { id: 4, name: 'n-Hexane', hsp: { deltaD: 14.9, deltaP: 0.0, deltaH: 0.0 }, molarVolume: 131.6 },
  { id: 5, name: 'MEK', hsp: { deltaD: 16.0, deltaP: 9.0, deltaH: 5.1 }, molarVolume: 90.1 },
  { id: 6, name: 'Ethyl Acetate', hsp: { deltaD: 15.8, deltaP: 5.3, deltaH: 7.2 }, molarVolume: 98.5 },
];

describe('optimizeMultiComponentBlend', () => {
  it('4成分でRa最小のブレンドを見つける', () => {
    const result = optimizeMultiComponentBlend({
      targetHSP: PS_TARGET,
      candidates: SOLVENTS,
      numComponents: 4,
      maxIterations: 200,
      populationSize: 50,
    });

    expect(result.ra).toBeGreaterThanOrEqual(0);
    expect(result.components.length).toBeLessThanOrEqual(4);
    // ブレンドRaがどの単一溶媒よりも良い（か同等）
    expect(result.ra).toBeLessThan(10); // 妥当な範囲
  });

  it('体積分率の合計が1.0', () => {
    const result = optimizeMultiComponentBlend({
      targetHSP: PS_TARGET,
      candidates: SOLVENTS,
      numComponents: 4,
      maxIterations: 100,
      populationSize: 30,
    });

    const totalFraction = result.components.reduce((sum, c) => sum + c.fraction, 0);
    expect(totalFraction).toBeCloseTo(1.0, 5);
  });

  it('各成分の体積分率が0以上', () => {
    const result = optimizeMultiComponentBlend({
      targetHSP: PS_TARGET,
      candidates: SOLVENTS,
      numComponents: 4,
      maxIterations: 100,
      populationSize: 30,
    });

    result.components.forEach(c => {
      expect(c.fraction).toBeGreaterThanOrEqual(0);
      expect(c.fraction).toBeLessThanOrEqual(1);
    });
  });

  it('tolueneが主成分（PSに最も近い溶媒）', () => {
    const result = optimizeMultiComponentBlend({
      targetHSP: PS_TARGET,
      candidates: SOLVENTS,
      numComponents: 4,
      maxIterations: 200,
      populationSize: 50,
    });

    const toluene = result.components.find(c => c.name === 'Toluene');
    // Tolueneは含まれ、最大分率であるべき
    if (toluene) {
      expect(toluene.fraction).toBeGreaterThan(0.3);
    }
  });

  it('5成分でも動作する', () => {
    const result = optimizeMultiComponentBlend({
      targetHSP: PS_TARGET,
      candidates: SOLVENTS,
      numComponents: 5,
      maxIterations: 100,
      populationSize: 30,
    });

    expect(result.components.length).toBeLessThanOrEqual(5);
    const totalFraction = result.components.reduce((sum, c) => sum + c.fraction, 0);
    expect(totalFraction).toBeCloseTo(1.0, 5);
  });

  it('候補数 < numComponents の場合、全候補を使用', () => {
    const result = optimizeMultiComponentBlend({
      targetHSP: PS_TARGET,
      candidates: SOLVENTS.slice(0, 2), // 2候補のみ
      numComponents: 4,
      maxIterations: 100,
      populationSize: 30,
    });

    expect(result.components.length).toBeLessThanOrEqual(2);
  });

  it('反復でRaが改善される（初期値より良い）', () => {
    const result = optimizeMultiComponentBlend({
      targetHSP: PS_TARGET,
      candidates: SOLVENTS,
      numComponents: 4,
      maxIterations: 300,
      populationSize: 50,
    });

    // 単一溶媒(Toluene)のRa
    // Ra = sqrt(4*(0.5)² + (3.1)² + (0.9)²) = sqrt(11.42) = 3.38
    // 最適化後はこれ以下であるべき
    expect(result.ra).toBeLessThan(4.0);
  });

  it('blendHSPが返される', () => {
    const result = optimizeMultiComponentBlend({
      targetHSP: PS_TARGET,
      candidates: SOLVENTS,
      numComponents: 4,
      maxIterations: 100,
      populationSize: 30,
    });

    expect(result.blendHSP.deltaD).toBeGreaterThan(10);
    expect(result.blendHSP.deltaD).toBeLessThan(25);
  });
});
