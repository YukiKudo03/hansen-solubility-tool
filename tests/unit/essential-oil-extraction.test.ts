import { describe, it, expect } from 'vitest';
import {
  screenEssentialOilSolvents,
  ExtractionLevel,
} from '../../src/core/essential-oil-extraction';

describe('screenEssentialOilSolvents', () => {
  // Lavender oil (dD=16.5, dP=3.5, dH=6.0, R0=7)
  const oilHSP = { deltaD: 16.5, deltaP: 3.5, deltaH: 6.0 };
  const oilR0 = 7;

  const solvents = [
    { name: 'ヘキサン', hsp: { deltaD: 14.9, deltaP: 0.0, deltaH: 0.0 } },
    { name: 'エタノール', hsp: { deltaD: 15.8, deltaP: 8.8, deltaH: 19.4 } },
    { name: '超臨界CO2', hsp: { deltaD: 15.6, deltaP: 5.2, deltaH: 5.8 } },
  ];

  it('Lavender oilのスクリーニングで正しい結果を返す', () => {
    const results = screenEssentialOilSolvents(oilHSP, oilR0, solvents);
    expect(results.length).toBe(3);

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

  it('超臨界CO2はLavender oilに対してExcellent（HSPが近い）', () => {
    const results = screenEssentialOilSolvents(oilHSP, oilR0, [solvents[2]]);
    expect(results[0].extractionLevel).toBe(ExtractionLevel.Excellent);
  });

  it('エタノールはLavender oilに対してGoodまたはLow（dHが離れている）', () => {
    const results = screenEssentialOilSolvents(oilHSP, oilR0, [solvents[1]]);
    // ethanol dH=19.4 vs oil dH=6.0 → 大きな差
    expect(results[0].extractionLevel).not.toBe(ExtractionLevel.Excellent);
  });

  it('空の溶媒リストで空配列を返す', () => {
    const results = screenEssentialOilSolvents(oilHSP, oilR0, []);
    expect(results).toEqual([]);
  });

  it('結果のraとredが正しく計算される', () => {
    const results = screenEssentialOilSolvents(oilHSP, oilR0, solvents);
    for (const r of results) {
      const dD = oilHSP.deltaD - r.solvent.hsp.deltaD;
      const dP = oilHSP.deltaP - r.solvent.hsp.deltaP;
      const dH = oilHSP.deltaH - r.solvent.hsp.deltaH;
      const expectedRa = Math.sqrt(4 * dD * dD + dP * dP + dH * dH);
      expect(r.ra).toBeCloseTo(expectedRa, 6);
      expect(r.red).toBeCloseTo(expectedRa / oilR0, 6);
    }
  });
});
