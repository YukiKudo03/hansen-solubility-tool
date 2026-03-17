import { describe, it, expect } from 'vitest';
import {
  getThermalExpansion,
  DEFAULT_THERMAL_EXPANSION,
  THERMAL_EXPANSION_COEFFICIENTS,
} from '../../src/core/thermal-expansion-data';
import { correctHSPForTemperature } from '../../src/core/temperature-hsp';

describe('getThermalExpansion', () => {
  it('トルエン（CAS: 108-88-3）の値が取得できる', () => {
    expect(getThermalExpansion('108-88-3')).toBe(1.08e-3);
  });

  it('水（CAS: 7732-18-5）の値が取得できる', () => {
    expect(getThermalExpansion('7732-18-5')).toBe(0.21e-3);
  });

  it('存在しないCAS番号でデフォルト値を返す', () => {
    expect(getThermalExpansion('999-99-9')).toBe(DEFAULT_THERMAL_EXPANSION);
  });

  it('null CAS番号でデフォルト値を返す', () => {
    expect(getThermalExpansion(null)).toBe(DEFAULT_THERMAL_EXPANSION);
  });

  it('全エントリの値が正の数値', () => {
    for (const [cas, alpha] of Object.entries(THERMAL_EXPANSION_COEFFICIENTS)) {
      expect(alpha, `CAS ${cas}`).toBeGreaterThan(0);
      expect(alpha, `CAS ${cas}`).toBeLessThan(0.01); // 合理的な範囲
    }
  });
});

describe('温度補正の統合テスト', () => {
  it('トルエン 25°C→80°C の補正が文献値と整合', () => {
    // トルエン HSP @25°C: δD=18.0, δP=1.4, δH=2.0
    const hsp = { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 };
    const alpha = getThermalExpansion('108-88-3'); // 1.08e-3

    const corrected = correctHSPForTemperature(hsp, 80, 25, alpha);

    // 55°C上昇で:
    // δD: ~5-7% 減少 → 16.8-17.1 程度
    expect(corrected.deltaD).toBeGreaterThan(16.5);
    expect(corrected.deltaD).toBeLessThan(17.5);
    // δP: ~3% 減少 → 1.3-1.4 程度
    expect(corrected.deltaP).toBeGreaterThan(1.2);
    expect(corrected.deltaP).toBeLessThan(1.4);
    // δH: exp(-1.22e-3 × 55) ≈ 0.935 → 1.87 程度
    expect(corrected.deltaH).toBeGreaterThan(1.7);
    expect(corrected.deltaH).toBeLessThan(2.0);
  });

  it('水 25°C→100°C の補正（低膨張係数）', () => {
    const hsp = { deltaD: 15.5, deltaP: 16.0, deltaH: 42.3 };
    const alpha = getThermalExpansion('7732-18-5'); // 0.21e-3

    const corrected = correctHSPForTemperature(hsp, 100, 25, alpha);

    // 水の膨張係数は小さいのでδD, δPの変化は小さい
    expect(corrected.deltaD).toBeGreaterThan(15.0);
    expect(corrected.deltaD).toBeLessThan(15.5);
    // δHは温度依存で大きく減少
    expect(corrected.deltaH).toBeLessThan(42.3);
    expect(corrected.deltaH).toBeGreaterThan(35);
  });
});
