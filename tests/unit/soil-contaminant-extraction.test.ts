import { describe, it, expect } from 'vitest';
import {
  screenRemediationSolvents,
  ExtractionLevel,
} from '../../src/core/soil-contaminant-extraction';

describe('screenRemediationSolvents', () => {
  // PAH (dD=20.0, dP=4.0, dH=3.0, R0=5)
  const pahHSP = { deltaD: 20.0, deltaP: 4.0, deltaH: 3.0 };
  const pahR0 = 5;

  const solvents = [
    { name: 'トルエン', hsp: { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 } },
    { name: 'ヘキサン', hsp: { deltaD: 14.9, deltaP: 0.0, deltaH: 0.0 } },
    { name: 'エタノール', hsp: { deltaD: 15.8, deltaP: 8.8, deltaH: 19.4 } },
    { name: 'アセトン', hsp: { deltaD: 15.5, deltaP: 10.4, deltaH: 7.0 } },
  ];

  it('PAHのスクリーニングで正しい結果を返す', () => {
    const results = screenRemediationSolvents(pahHSP, pahR0, solvents);
    expect(results.length).toBe(4);

    // RED昇順でソートされている
    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].red).toBeLessThanOrEqual(results[i + 1].red);
    }

    for (const r of results) {
      expect(r.solvent.name).toBeTruthy();
      expect(r.ra).toBeGreaterThanOrEqual(0);
      expect(r.red).toBeGreaterThanOrEqual(0);
      expect(Object.values(ExtractionLevel)).toContain(r.extractionLevel);
    }
  });

  it('トルエンはPAHに対してExcellentまたはGood（非極性芳香族同士）', () => {
    const results = screenRemediationSolvents(pahHSP, pahR0, [solvents[0]]);
    expect(results[0].extractionLevel).not.toBe(ExtractionLevel.Low);
  });

  it('エタノールはPAHに対してLow（極性・水素結合が大きく異なる）', () => {
    const results = screenRemediationSolvents(pahHSP, pahR0, [solvents[2]]);
    expect(results[0].extractionLevel).toBe(ExtractionLevel.Low);
  });

  it('空の溶媒リストで空配列を返す', () => {
    const results = screenRemediationSolvents(pahHSP, pahR0, []);
    expect(results).toEqual([]);
  });

  it('結果のraとredが正しく計算される', () => {
    const results = screenRemediationSolvents(pahHSP, pahR0, solvents);
    for (const r of results) {
      const dD = pahHSP.deltaD - r.solvent.hsp.deltaD;
      const dP = pahHSP.deltaP - r.solvent.hsp.deltaP;
      const dH = pahHSP.deltaH - r.solvent.hsp.deltaH;
      const expectedRa = Math.sqrt(4 * dD * dD + dP * dP + dH * dH);
      expect(r.ra).toBeCloseTo(expectedRa, 6);
      expect(r.red).toBeCloseTo(expectedRa / pahR0, 6);
    }
  });
});
