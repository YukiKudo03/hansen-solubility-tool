/**
 * 温度依存HSP補正ツール — ユニットテスト
 */
import { describe, it, expect } from 'vitest';
import { correctHSPForTemperature, estimateDensityRatio, DEFAULT_REFERENCE_TEMPERATURE } from '../../src/core/temperature-hsp';
import { correctDeltaHAssociating, isAssociatingLiquid, ASSOCIATING_LIQUIDS } from '../../src/core/associating-liquid-correction';

describe('temperature-hsp: correctHSPForTemperature', () => {
  it('参照温度と同じ場合はHSPが変化しない', () => {
    const hsp = { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 };
    const result = correctHSPForTemperature(hsp, 25, 25, 1.1e-3);
    expect(result.deltaD).toBeCloseTo(18.0, 3);
    expect(result.deltaP).toBeCloseTo(1.4, 3);
    expect(result.deltaH).toBeCloseTo(2.0, 3);
  });

  it('トルエンのdD(100°C): 温度上昇でdDが減少', () => {
    // トルエン: dD=18.0, dP=1.4, dH=2.0 at 25°C
    // 体積膨張係数 α ≈ 1.07e-3 K⁻¹
    const hsp = { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 };
    const alpha = 1.07e-3;
    const result = correctHSPForTemperature(hsp, 100, 25, alpha);
    // 温度上昇 → 密度低下 → dD減少
    expect(result.deltaD).toBeLessThan(18.0);
    expect(result.deltaD).toBeGreaterThan(15.0); // 妥当な範囲
    // dHは指数減衰
    expect(result.deltaH).toBeLessThan(2.0);
  });

  it('低温では密度上昇でdDが増加', () => {
    const hsp = { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 };
    const alpha = 1.07e-3;
    const result = correctHSPForTemperature(hsp, 0, 25, alpha);
    expect(result.deltaD).toBeGreaterThan(18.0);
  });

  it('estimateDensityRatio: 正しい密度比計算', () => {
    const ratio = estimateDensityRatio(75, 25, 1e-3);
    // 1 / (1 + 1e-3 * 50) = 1 / 1.05 ≈ 0.9524
    expect(ratio).toBeCloseTo(1 / 1.05, 4);
  });
});

describe('associating-liquid-correction: correctDeltaHAssociating', () => {
  it('水のdH(50°C): 会合性液体モデルで減少', () => {
    // 水: dH=42.3 at 25°C, alpha=1.8
    const tempK = 273.15 + 50; // 323.15K
    const refK = 298.15;
    const dH = correctDeltaHAssociating(42.3, tempK, refK, 'water');
    // dH²(T) = dH²(ref) * (1 - 1.8*(323.15-298.15)/298.15)
    // = 42.3² * (1 - 1.8*25/298.15) = 42.3² * (1 - 0.1509) = 42.3² * 0.849
    // dH(T) = 42.3 * sqrt(0.849) ≈ 42.3 * 0.9214 ≈ 38.97
    expect(dH).toBeGreaterThan(35);
    expect(dH).toBeLessThan(42.3);
    expect(dH).toBeCloseTo(42.3 * Math.sqrt(1 - 1.8 * 25 / 298.15), 1);
  });

  it('水は会合性液体と判定される', () => {
    expect(isAssociatingLiquid('Water')).toBe(true);
    expect(isAssociatingLiquid('water')).toBe(true);
  });

  it('トルエンは非会合性液体', () => {
    expect(isAssociatingLiquid('toluene')).toBe(false);
  });

  it('非会合性液体はBarton指数減衰を使用', () => {
    const dH = correctDeltaHAssociating(2.0, 373.15, 298.15, 'toluene');
    const expected = 2.0 * Math.exp(-1.22e-3 * (373.15 - 298.15));
    expect(dH).toBeCloseTo(expected, 4);
  });

  it('基準温度と同じなら元の値', () => {
    const dH = correctDeltaHAssociating(42.3, 298.15, 298.15, 'water');
    expect(dH).toBe(42.3);
  });

  it('温度が0以下でエラー', () => {
    expect(() => correctDeltaHAssociating(42.3, -10, 298.15)).toThrow();
  });
});
