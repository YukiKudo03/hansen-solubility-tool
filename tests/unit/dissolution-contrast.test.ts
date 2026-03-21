/**
 * NL14: フォトレジスト型コントラスト計算のテスト
 *
 * 数式: Contrast = log10(Ra_unexposed / Ra_exposed)
 *
 * 原理: 露光後にHSPが変化するフォトレジストにおいて、
 * 現像液とのRa比から現像コントラスト（溶解度差）を定量する。
 * 高コントラスト → 高解像度パターン
 */
import { describe, it, expect } from 'vitest';

import {
  calculateDissolutionContrast,
  classifyContrastQuality,
  ContrastQuality,
} from '../../src/core/dissolution-contrast';

// フォトレジスト（未露光 vs 露光後）と現像液のHSPサンプル
const DEVELOPER = { deltaD: 15.5, deltaP: 10.4, deltaH: 7.0 }; // acetone-like

const RESIST_UNEXPOSED = { deltaD: 19.0, deltaP: 3.0, deltaH: 4.0 }; // 疎水性
const RESIST_EXPOSED = { deltaD: 17.0, deltaP: 8.0, deltaH: 6.0 }; // 露光後: 極性増加

describe('calculateDissolutionContrast', () => {
  it('正のコントラスト: 露光部が溶けやすい（ポジ型）', () => {
    // 未露光: Raが大きい（溶けにくい）
    // 露光: Raが小さい（溶けやすい）
    const contrast = calculateDissolutionContrast(
      RESIST_UNEXPOSED, RESIST_EXPOSED, DEVELOPER
    );
    expect(contrast).toBeGreaterThan(0);
  });

  it('コントラスト数値: log10(Ra_unexposed / Ra_exposed)', () => {
    const contrast = calculateDissolutionContrast(
      RESIST_UNEXPOSED, RESIST_EXPOSED, DEVELOPER
    );
    // 手計算:
    // Ra_unexposed = sqrt(4*(19-15.5)² + (3-10.4)² + (4-7)²)
    //             = sqrt(49 + 54.76 + 9) = sqrt(112.76) = 10.62
    // Ra_exposed = sqrt(4*(17-15.5)² + (8-10.4)² + (6-7)²)
    //           = sqrt(9 + 5.76 + 1) = sqrt(15.76) = 3.97
    // Contrast = log10(10.62 / 3.97) = log10(2.675) = 0.427
    expect(contrast).toBeCloseTo(0.427, 1);
  });

  it('同一HSPではコントラスト = 0', () => {
    const contrast = calculateDissolutionContrast(
      RESIST_UNEXPOSED, RESIST_UNEXPOSED, DEVELOPER
    );
    expect(contrast).toBeCloseTo(0, 10);
  });

  it('ネガ型（未露光が溶けやすい）では負のコントラスト', () => {
    const contrast = calculateDissolutionContrast(
      RESIST_EXPOSED, RESIST_UNEXPOSED, DEVELOPER
    );
    expect(contrast).toBeLessThan(0);
  });
});

describe('classifyContrastQuality', () => {
  it('高コントラスト (>0.5) → excellent', () => {
    expect(classifyContrastQuality(0.8)).toBe(ContrastQuality.Excellent);
  });

  it('中コントラスト (0.2-0.5) → good', () => {
    expect(classifyContrastQuality(0.35)).toBe(ContrastQuality.Good);
  });

  it('低コントラスト (<0.2) → poor', () => {
    expect(classifyContrastQuality(0.1)).toBe(ContrastQuality.Poor);
  });

  it('負コントラスト → inverted', () => {
    expect(classifyContrastQuality(-0.3)).toBe(ContrastQuality.Inverted);
  });
});
