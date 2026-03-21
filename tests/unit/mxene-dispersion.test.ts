import { describe, it, expect } from 'vitest';
import { screenMXeneDispersion } from '../../src/core/mxene-dispersion';
import { DispersibilityLevel } from '../../src/core/types';

describe('screenMXeneDispersion', () => {
  // Ti3C2Tx (dD=16.4, dP=13.5, dH=15.2, R0=10)
  const mxeneHSP = { deltaD: 16.4, deltaP: 13.5, deltaH: 15.2 };
  const r0 = 10;

  const solvents = [
    { name: '水', hsp: { deltaD: 15.5, deltaP: 16.0, deltaH: 42.3 } },
    { name: 'DMSO', hsp: { deltaD: 18.4, deltaP: 16.4, deltaH: 10.2 } },
    { name: 'NMP', hsp: { deltaD: 18.0, deltaP: 12.3, deltaH: 7.2 } },
    { name: 'トルエン', hsp: { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 } },
    { name: 'ヘキサン', hsp: { deltaD: 14.9, deltaP: 0.0, deltaH: 0.0 } },
  ];

  it('MXeneのスクリーニングで正しい分散性分類を返す', () => {
    const results = screenMXeneDispersion(mxeneHSP, r0, solvents);
    expect(results.length).toBe(5);

    // RED昇順ソート
    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].red).toBeLessThanOrEqual(results[i + 1].red);
    }
  });

  it('DMSOはMXeneの良溶媒（HSPが近い）', () => {
    const results = screenMXeneDispersion(mxeneHSP, r0, [solvents[1]]);
    const dmsoResult = results[0];
    // DMSOはdP/dHがMXeneに比較的近い
    expect(dmsoResult.red).toBeLessThan(1.0);
    expect([DispersibilityLevel.Excellent, DispersibilityLevel.Good, DispersibilityLevel.Fair])
      .toContain(dmsoResult.dispersibility);
  });

  it('トルエンはMXeneの貧溶媒（低dP, dH）', () => {
    const results = screenMXeneDispersion(mxeneHSP, r0, [solvents[3]]);
    const tolueneResult = results[0];
    // トルエンのdP=1.4, dH=2.0はMXeneの13.5, 15.2と大きく離れている
    expect(tolueneResult.red).toBeGreaterThan(1.0);
  });

  it('ヘキサンはMXeneの非常に貧い溶媒', () => {
    const results = screenMXeneDispersion(mxeneHSP, r0, [solvents[4]]);
    const hexaneResult = results[0];
    expect(hexaneResult.red).toBeGreaterThan(1.0);
    expect([DispersibilityLevel.Poor, DispersibilityLevel.Bad]).toContain(hexaneResult.dispersibility);
  });

  it('空の溶媒リストで空配列を返す', () => {
    const results = screenMXeneDispersion(mxeneHSP, r0, []);
    expect(results).toEqual([]);
  });

  it('各結果のra, redが正しく計算される', () => {
    const results = screenMXeneDispersion(mxeneHSP, r0, solvents);
    for (const r of results) {
      const dD = mxeneHSP.deltaD - r.solvent.hsp.deltaD;
      const dP = mxeneHSP.deltaP - r.solvent.hsp.deltaP;
      const dH = mxeneHSP.deltaH - r.solvent.hsp.deltaH;
      const expectedRa = Math.sqrt(4 * dD * dD + dP * dP + dH * dH);
      expect(r.ra).toBeCloseTo(expectedRa, 6);
      expect(r.red).toBeCloseTo(expectedRa / r0, 6);
    }
  });
});
