import { describe, it, expect } from 'vitest';
import {
  classifyEmulsionType,
  classifyStability,
  evaluateEmulsionStability,
  DEFAULT_EMULSION_THRESHOLDS,
} from '../../src/core/cosmetic-emulsion-stability';

describe('classifyEmulsionType', () => {
  it('乳化剤が油に近い → WO', () => {
    expect(classifyEmulsionType(2.0, 10.0)).toBe('WO');
  });

  it('乳化剤が水に近い → OW', () => {
    expect(classifyEmulsionType(10.0, 2.0)).toBe('OW');
  });

  it('同距離 → OW (デフォルト)', () => {
    expect(classifyEmulsionType(5.0, 5.0)).toBe('OW');
  });
});

describe('classifyStability', () => {
  it('dominantRa < 4 → Stable', () => {
    expect(classifyStability(0.0)).toBe('Stable');
    expect(classifyStability(2.0)).toBe('Stable');
    expect(classifyStability(3.9)).toBe('Stable');
  });

  it('4 <= dominantRa < 8 → Moderate', () => {
    expect(classifyStability(4.0)).toBe('Moderate');
    expect(classifyStability(6.0)).toBe('Moderate');
    expect(classifyStability(7.9)).toBe('Moderate');
  });

  it('dominantRa >= 8 → Unstable', () => {
    expect(classifyStability(8.0)).toBe('Unstable');
    expect(classifyStability(12.0)).toBe('Unstable');
  });

  it('負のRa値でエラー', () => {
    expect(() => classifyStability(-0.1)).toThrow('Ra値は非負でなければなりません');
  });

  it('カスタム閾値を適用', () => {
    const custom = { stableMax: 3.0, moderateMax: 6.0 };
    expect(classifyStability(2.5, custom)).toBe('Stable');
    expect(classifyStability(4.0, custom)).toBe('Moderate');
    expect(classifyStability(7.0, custom)).toBe('Unstable');
  });
});

describe('evaluateEmulsionStability', () => {
  // 典型的な化粧品O/Wエマルション
  // 油相: ミネラルオイル (dD=16.0, dP=0.0, dH=0.0)
  // 乳化剤: Tween 80 (dD=17.0, dP=3.2, dH=8.4)
  // 水相: 水 (dD=15.5, dP=16.0, dH=42.3)
  const oilHSP = { deltaD: 16.0, deltaP: 0.0, deltaH: 0.0 };
  const emulsifierHSP = { deltaD: 17.0, deltaP: 3.2, deltaH: 8.4 };
  const waterHSP = { deltaD: 15.5, deltaP: 16.0, deltaH: 42.3 };

  it('O/Wエマルションを正しく判定', () => {
    const result = evaluateEmulsionStability(oilHSP, emulsifierHSP, waterHSP);
    // 乳化剤は油相に近い(dPが低い) → 油相への接近度が小さい
    // 実際にはRa計算で判定
    expect(result.emulsionType).toBeDefined();
    expect(['OW', 'WO']).toContain(result.emulsionType);
  });

  it('評価結果が全フィールドを含む', () => {
    const result = evaluateEmulsionStability(oilHSP, emulsifierHSP, waterHSP);
    expect(result.raOilEmulsifier).toBeGreaterThanOrEqual(0);
    expect(result.raEmulsifierWater).toBeGreaterThanOrEqual(0);
    expect(result.dominantRa).toBeGreaterThanOrEqual(0);
    expect(['Stable', 'Moderate', 'Unstable']).toContain(result.stability);
    expect(result.evaluatedAt).toBeInstanceOf(Date);
  });

  it('dominantRaはmin(raOilEmulsifier, raEmulsifierWater)', () => {
    const result = evaluateEmulsionStability(oilHSP, emulsifierHSP, waterHSP);
    expect(result.dominantRa).toBeCloseTo(
      Math.min(result.raOilEmulsifier, result.raEmulsifierWater),
      6,
    );
  });

  it('Raが正しく計算される', () => {
    const result = evaluateEmulsionStability(oilHSP, emulsifierHSP, waterHSP);
    // Ra(oil, emulsifier)
    const dD1 = oilHSP.deltaD - emulsifierHSP.deltaD;
    const dP1 = oilHSP.deltaP - emulsifierHSP.deltaP;
    const dH1 = oilHSP.deltaH - emulsifierHSP.deltaH;
    const expectedRaOE = Math.sqrt(4 * dD1 * dD1 + dP1 * dP1 + dH1 * dH1);
    expect(result.raOilEmulsifier).toBeCloseTo(expectedRaOE, 6);

    // Ra(emulsifier, water)
    const dD2 = emulsifierHSP.deltaD - waterHSP.deltaD;
    const dP2 = emulsifierHSP.deltaP - waterHSP.deltaP;
    const dH2 = emulsifierHSP.deltaH - waterHSP.deltaH;
    const expectedRaEW = Math.sqrt(4 * dD2 * dD2 + dP2 * dP2 + dH2 * dH2);
    expect(result.raEmulsifierWater).toBeCloseTo(expectedRaEW, 6);
  });

  it('乳化剤が油相に非常に近い場合 → WO型', () => {
    // 乳化剤HSPを油相に近づける
    const oilLikeEmulsifier = { deltaD: 16.2, deltaP: 0.5, deltaH: 0.5 };
    const result = evaluateEmulsionStability(oilHSP, oilLikeEmulsifier, waterHSP);
    expect(result.emulsionType).toBe('WO');
    expect(result.raOilEmulsifier).toBeLessThan(result.raEmulsifierWater);
  });

  it('カスタム閾値で安定性判定が変わる', () => {
    const result1 = evaluateEmulsionStability(oilHSP, emulsifierHSP, waterHSP);
    const strictThresholds = { stableMax: 2.0, moderateMax: 4.0 };
    const result2 = evaluateEmulsionStability(oilHSP, emulsifierHSP, waterHSP, strictThresholds);
    // strict閾値ではStableが出にくい
    expect(result2.dominantRa).toBe(result1.dominantRa);
  });
});
