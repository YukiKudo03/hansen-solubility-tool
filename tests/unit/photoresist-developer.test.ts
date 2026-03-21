import { describe, it, expect } from 'vitest';
import {
  evaluatePhotoresistDeveloper,
  getContrastQualityInfo,
} from '../../src/core/photoresist-developer';
import { ContrastQuality } from '../../src/core/dissolution-contrast';

describe('evaluatePhotoresistDeveloper', () => {
  // ポジ型レジスト: 露光でHSP変化（極性増大）
  const unexposedHSP = { deltaD: 19.0, deltaP: 8.0, deltaH: 6.0 };
  const exposedHSP = { deltaD: 18.0, deltaP: 14.0, deltaH: 12.0 };
  // TMAH現像液（水系アルカリ）
  const developerHSP = { deltaD: 15.5, deltaP: 16.0, deltaH: 42.3 };

  it('正しい結果構造を返す', () => {
    const result = evaluatePhotoresistDeveloper(unexposedHSP, exposedHSP, developerHSP);
    expect(result).toHaveProperty('contrast');
    expect(result).toHaveProperty('quality');
    expect(result).toHaveProperty('unexposedHSP');
    expect(result).toHaveProperty('exposedHSP');
    expect(result).toHaveProperty('developerHSP');
  });

  it('ポジ型レジスト+TMAH → 正のコントラスト', () => {
    const result = evaluatePhotoresistDeveloper(unexposedHSP, exposedHSP, developerHSP);
    // 露光後は現像液に近づくためRa(exposed)が小さくなり、
    // log10(Ra_unexposed/Ra_exposed) > 0
    expect(result.contrast).toBeGreaterThan(0);
  });

  it('コントラスト値に対する品質分類が正しい', () => {
    const result = evaluatePhotoresistDeveloper(unexposedHSP, exposedHSP, developerHSP);
    if (result.contrast > 0.5) {
      expect(result.quality).toBe(ContrastQuality.Excellent);
    } else if (result.contrast >= 0.2) {
      expect(result.quality).toBe(ContrastQuality.Good);
    } else if (result.contrast > 0) {
      expect(result.quality).toBe(ContrastQuality.Poor);
    } else {
      expect(result.quality).toBe(ContrastQuality.Inverted);
    }
  });

  it('同一HSPで未露光・露光 → コントラスト0', () => {
    const sameHSP = { deltaD: 18.0, deltaP: 10.0, deltaH: 8.0 };
    const result = evaluatePhotoresistDeveloper(sameHSP, sameHSP, developerHSP);
    expect(result.contrast).toBe(0);
    expect(result.quality).toBe(ContrastQuality.Poor);
  });

  it('逆コントラスト（ネガ型動作）を検出する', () => {
    // 未露光が現像液に近く、露光後が離れる→ネガ型
    const negUnexposed = { deltaD: 15.0, deltaP: 15.5, deltaH: 40.0 };
    const negExposed = { deltaD: 19.0, deltaP: 5.0, deltaH: 3.0 };
    const result = evaluatePhotoresistDeveloper(negUnexposed, negExposed, developerHSP);
    expect(result.contrast).toBeLessThan(0);
    expect(result.quality).toBe(ContrastQuality.Inverted);
  });
});

describe('getContrastQualityInfo', () => {
  it('各品質レベルの情報を正しく返す', () => {
    const excellent = getContrastQualityInfo(ContrastQuality.Excellent);
    expect(excellent.label).toBe('高解像度');
    expect(excellent.color).toBe('green');

    const good = getContrastQualityInfo(ContrastQuality.Good);
    expect(good.label).toBe('実用レベル');
    expect(good.color).toBe('blue');

    const poor = getContrastQualityInfo(ContrastQuality.Poor);
    expect(poor.label).toBe('低解像度');
    expect(poor.color).toBe('yellow');

    const inverted = getContrastQualityInfo(ContrastQuality.Inverted);
    expect(inverted.label).toBe('反転（ネガ型）');
    expect(inverted.color).toBe('red');
  });
});
