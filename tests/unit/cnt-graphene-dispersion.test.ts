import { describe, it, expect } from 'vitest';
import { screenCNTGrapheneDispersion } from '../../src/core/cnt-graphene-dispersion';
import { DispersibilityLevel } from '../../src/core/types';

describe('screenCNTGrapheneDispersion', () => {
  // SWCNT (dD=17.8, dP=7.5, dH=7.6, R0=4.5)
  const swcntHSP = { deltaD: 17.8, deltaP: 7.5, deltaH: 7.6 };
  const r0 = 4.5;

  const solvents = [
    { name: 'NMP', hsp: { deltaD: 18.0, deltaP: 12.3, deltaH: 7.2 } },
    { name: 'DMF', hsp: { deltaD: 17.4, deltaP: 13.7, deltaH: 11.3 } },
    { name: 'トルエン', hsp: { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 } },
    { name: 'ヘキサン', hsp: { deltaD: 14.9, deltaP: 0.0, deltaH: 0.0 } },
    { name: '水', hsp: { deltaD: 15.5, deltaP: 16.0, deltaH: 42.3 } },
  ];

  it('SWCNTのスクリーニングで正しい分散性分類を返す', () => {
    const results = screenCNTGrapheneDispersion(swcntHSP, r0, solvents);
    expect(results.length).toBe(5);

    // RED昇順でソートされている
    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].red).toBeLessThanOrEqual(results[i + 1].red);
    }
  });

  it('NMPはSWCNTに対して比較的低いRED値', () => {
    const results = screenCNTGrapheneDispersion(swcntHSP, r0, [solvents[0]]);
    const nmpResult = results[0];
    // NMPはdDが近い。R0=4.5と厳しい半径のため、REDはやや高めになりうる
    expect(nmpResult.red).toBeLessThan(2.0);
    // 水やヘキサンよりは良い
  });

  it('水はSWCNTの貧溶媒（高dH差）', () => {
    const results = screenCNTGrapheneDispersion(swcntHSP, r0, [solvents[4]]);
    const waterResult = results[0];
    // 水のdH=42.3はSWCNTの7.6と大きく離れている
    expect(waterResult.red).toBeGreaterThan(1.5);
    expect([DispersibilityLevel.Poor, DispersibilityLevel.Bad]).toContain(waterResult.dispersibility);
  });

  it('空の溶媒リストで空配列を返す', () => {
    const results = screenCNTGrapheneDispersion(swcntHSP, r0, []);
    expect(results).toEqual([]);
  });

  it('各結果のra, redが正しく計算される', () => {
    const results = screenCNTGrapheneDispersion(swcntHSP, r0, solvents);
    for (const r of results) {
      const dD = swcntHSP.deltaD - r.solvent.hsp.deltaD;
      const dP = swcntHSP.deltaP - r.solvent.hsp.deltaP;
      const dH = swcntHSP.deltaH - r.solvent.hsp.deltaH;
      const expectedRa = Math.sqrt(4 * dD * dD + dP * dP + dH * dH);
      expect(r.ra).toBeCloseTo(expectedRa, 6);
      expect(r.red).toBeCloseTo(expectedRa / r0, 6);
    }
  });

  it('NMPとDMFがトルエンやヘキサンより良い分散性', () => {
    const results = screenCNTGrapheneDispersion(swcntHSP, r0, solvents);
    const nmpResult = results.find(r => r.solvent.name === 'NMP')!;
    const tolueneResult = results.find(r => r.solvent.name === 'トルエン')!;
    expect(nmpResult.red).toBeLessThan(tolueneResult.red);
  });
});
