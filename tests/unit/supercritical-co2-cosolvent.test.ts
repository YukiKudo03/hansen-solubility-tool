/**
 * 超臨界CO2共溶媒選定 — ユニットテスト
 */
import { describe, it, expect } from 'vitest';
import { screenSCCO2Cosolvents, blendCO2CosolventHSP } from '../../src/core/supercritical-co2-cosolvent';
import type { CosolventCandidate } from '../../src/core/supercritical-co2-cosolvent';

describe('supercritical-co2-cosolvent: blendCO2CosolventHSP', () => {
  it('共溶媒分率0でCO2のHSPのまま', () => {
    const co2 = { deltaD: 12.0, deltaP: 5.0, deltaH: 3.0 };
    const cosolvent = { deltaD: 15.8, deltaP: 8.8, deltaH: 19.4 };
    const result = blendCO2CosolventHSP(co2, cosolvent, 0);
    expect(result.deltaD).toBeCloseTo(12.0, 5);
    expect(result.deltaP).toBeCloseTo(5.0, 5);
    expect(result.deltaH).toBeCloseTo(3.0, 5);
  });

  it('共溶媒分率1で共溶媒のHSPのまま', () => {
    const co2 = { deltaD: 12.0, deltaP: 5.0, deltaH: 3.0 };
    const cosolvent = { deltaD: 15.8, deltaP: 8.8, deltaH: 19.4 };
    const result = blendCO2CosolventHSP(co2, cosolvent, 1);
    expect(result.deltaD).toBeCloseTo(15.8, 5);
    expect(result.deltaP).toBeCloseTo(8.8, 5);
    expect(result.deltaH).toBeCloseTo(19.4, 5);
  });

  it('分率0.05での体積分率加算が正しい', () => {
    const co2 = { deltaD: 12.0, deltaP: 5.0, deltaH: 3.0 };
    const ethanol = { deltaD: 15.8, deltaP: 8.8, deltaH: 19.4 };
    const result = blendCO2CosolventHSP(co2, ethanol, 0.05);
    expect(result.deltaD).toBeCloseTo(0.95 * 12.0 + 0.05 * 15.8, 5);
    expect(result.deltaP).toBeCloseTo(0.95 * 5.0 + 0.05 * 8.8, 5);
    expect(result.deltaH).toBeCloseTo(0.95 * 3.0 + 0.05 * 19.4, 5);
  });
});

describe('supercritical-co2-cosolvent: screenSCCO2Cosolvents', () => {
  // カフェインHSP (文献値): dD=19.5, dP=10.1, dH=13.0, R0=8.0
  const caffeineHSP = { deltaD: 19.5, deltaP: 10.1, deltaH: 13.0 };
  const caffeineR0 = 8.0;
  const pressure = 20; // MPa
  const temperature = 313; // K (40°C)

  const ethanol: CosolventCandidate = {
    name: 'エタノール',
    hsp: { deltaD: 15.8, deltaP: 8.8, deltaH: 19.4 },
  };
  const methanol: CosolventCandidate = {
    name: 'メタノール',
    hsp: { deltaD: 14.7, deltaP: 12.3, deltaH: 22.3 },
  };

  it('カフェイン抽出: エタノール共溶媒でRaが低下', () => {
    const result = screenSCCO2Cosolvents(
      caffeineHSP, caffeineR0, pressure, temperature,
      [ethanol],
    );

    // CO2単独結果が含まれる
    const co2Only = result.results.find(r => r.volumeFraction === 0);
    expect(co2Only).toBeDefined();

    // エタノール添加でRaが低下するものがある
    const withEthanol = result.results.filter(r => r.cosolventName === 'エタノール');
    expect(withEthanol.length).toBeGreaterThan(0);

    // 最良結果（先頭）のRaはCO2単独より小さい
    const bestResult = result.results[0];
    expect(bestResult.ra).toBeLessThanOrEqual(co2Only!.ra);
  });

  it('カフェイン抽出: エタノール・メタノール両方の結果を含む', () => {
    const result = screenSCCO2Cosolvents(
      caffeineHSP, caffeineR0, pressure, temperature,
      [ethanol, methanol],
    );

    const ethanolResults = result.results.filter(r => r.cosolventName === 'エタノール');
    const methanolResults = result.results.filter(r => r.cosolventName === 'メタノール');
    expect(ethanolResults.length).toBeGreaterThan(0);
    expect(methanolResults.length).toBeGreaterThan(0);
  });

  it('結果がRa昇順でソートされている', () => {
    const result = screenSCCO2Cosolvents(
      caffeineHSP, caffeineR0, pressure, temperature,
      [ethanol, methanol],
    );

    for (let i = 1; i < result.results.length; i++) {
      expect(result.results[i].ra).toBeGreaterThanOrEqual(result.results[i - 1].ra);
    }
  });

  it('CO2 HSP, 密度, 圧力, 温度がメタデータに含まれる', () => {
    const result = screenSCCO2Cosolvents(
      caffeineHSP, caffeineR0, pressure, temperature,
      [ethanol],
    );

    expect(result.co2HSP.deltaD).toBeGreaterThan(0);
    expect(result.co2Density).toBeGreaterThan(0);
    expect(result.pressure).toBe(pressure);
    expect(result.temperature).toBe(temperature);
    expect(result.targetHSP).toEqual(caffeineHSP);
    expect(result.targetR0).toBe(caffeineR0);
  });

  it('RED値が正しく計算される', () => {
    const result = screenSCCO2Cosolvents(
      caffeineHSP, caffeineR0, pressure, temperature,
      [ethanol],
    );

    for (const r of result.results) {
      expect(r.red).toBeCloseTo(r.ra / caffeineR0, 5);
    }
  });

  it('R0=0でエラー', () => {
    expect(() => screenSCCO2Cosolvents(caffeineHSP, 0, pressure, temperature, [ethanol])).toThrow();
  });

  it('空の共溶媒リストでエラー', () => {
    expect(() => screenSCCO2Cosolvents(caffeineHSP, caffeineR0, pressure, temperature, [])).toThrow();
  });

  it('カスタム分率リストで評価可能', () => {
    const result = screenSCCO2Cosolvents(
      caffeineHSP, caffeineR0, pressure, temperature,
      [ethanol],
      [0.05, 0.10],
    );

    const ethanolResults = result.results.filter(r => r.cosolventName === 'エタノール');
    // 0.05, 0.10の2種
    expect(ethanolResults.length).toBe(2);
  });
});
