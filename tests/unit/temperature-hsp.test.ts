import { describe, it, expect } from 'vitest';
import {
  correctHSPForTemperature,
  estimateDensityRatio,
  DEFAULT_REFERENCE_TEMPERATURE,
} from '../../src/core/temperature-hsp';
import type { HSPValues } from '../../src/core/types';

const baseHSP: HSPValues = { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 };

describe('DEFAULT_REFERENCE_TEMPERATURE', () => {
  it('25°C (298.15K)', () => {
    expect(DEFAULT_REFERENCE_TEMPERATURE).toBe(25);
  });
});

describe('estimateDensityRatio', () => {
  it('同一温度で1.0を返す', () => {
    expect(estimateDensityRatio(25, 25, 1.0e-3)).toBeCloseTo(1.0, 5);
  });

  it('高温で密度比<1を返す（膨張）', () => {
    const ratio = estimateDensityRatio(80, 25, 1.0e-3);
    expect(ratio).toBeLessThan(1.0);
    expect(ratio).toBeGreaterThan(0);
  });

  it('低温で密度比>1を返す（収縮）', () => {
    const ratio = estimateDensityRatio(0, 25, 1.0e-3);
    expect(ratio).toBeGreaterThan(1.0);
  });

  it('熱膨張係数0で常に1.0', () => {
    expect(estimateDensityRatio(100, 25, 0)).toBeCloseTo(1.0, 5);
  });
});

describe('correctHSPForTemperature', () => {
  it('25°Cで補正なし（元の値と同一）', () => {
    const corrected = correctHSPForTemperature(baseHSP, 25, 25, 1.0e-3);
    expect(corrected.deltaD).toBeCloseTo(baseHSP.deltaD, 3);
    expect(corrected.deltaP).toBeCloseTo(baseHSP.deltaP, 3);
    expect(corrected.deltaH).toBeCloseTo(baseHSP.deltaH, 3);
  });

  it('高温でδDが減少する', () => {
    const corrected = correctHSPForTemperature(baseHSP, 80, 25, 1.0e-3);
    expect(corrected.deltaD).toBeLessThan(baseHSP.deltaD);
  });

  it('高温でδPが減少する', () => {
    const corrected = correctHSPForTemperature(baseHSP, 80, 25, 1.0e-3);
    expect(corrected.deltaP).toBeLessThan(baseHSP.deltaP);
  });

  it('高温でδHが減少する（水素結合の減弱）', () => {
    const corrected = correctHSPForTemperature(baseHSP, 80, 25, 1.0e-3);
    expect(corrected.deltaH).toBeLessThan(baseHSP.deltaH);
  });

  it('低温でδDが増加する', () => {
    const corrected = correctHSPForTemperature(baseHSP, 0, 25, 1.0e-3);
    expect(corrected.deltaD).toBeGreaterThan(baseHSP.deltaD);
  });

  it('熱膨張係数0ではδD,δPは変化しないがδHは温度で変化する', () => {
    const corrected = correctHSPForTemperature(baseHSP, 80, 25, 0);
    expect(corrected.deltaD).toBeCloseTo(baseHSP.deltaD, 5);
    expect(corrected.deltaP).toBeCloseTo(baseHSP.deltaP, 5);
    // δHはBartonの指数関数的減衰で変化する
    expect(corrected.deltaH).toBeLessThan(baseHSP.deltaH);
  });

  it('トルエン（α=1.08e-3）の80°C補正が妥当な範囲', () => {
    // トルエン: δD=18.0, δP=1.4, δH=2.0 at 25°C
    // 80°Cでは各成分が5-15%程度減少するのが妥当
    const corrected = correctHSPForTemperature(baseHSP, 80, 25, 1.08e-3);
    expect(corrected.deltaD).toBeGreaterThan(15);
    expect(corrected.deltaD).toBeLessThan(18);
    expect(corrected.deltaP).toBeGreaterThan(0.5);
    expect(corrected.deltaP).toBeLessThan(1.4);
  });

  it('デフォルト参照温度(T0省略)で25°C基準', () => {
    const corrected = correctHSPForTemperature(baseHSP, 80, undefined, 1.0e-3);
    const explicit = correctHSPForTemperature(baseHSP, 80, 25, 1.0e-3);
    expect(corrected.deltaD).toBeCloseTo(explicit.deltaD, 5);
  });
});
