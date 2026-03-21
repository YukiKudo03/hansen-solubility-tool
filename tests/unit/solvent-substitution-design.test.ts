import { describe, it, expect } from 'vitest';
import { findSolventSubstitutes } from '../../src/core/solvent-substitution-design';

describe('findSolventSubstitutes', () => {
  // NMP代替: dD=18.0, dP=12.3, dH=7.2
  const nmpHSP = { deltaD: 18.0, deltaP: 12.3, deltaH: 7.2 };

  const candidates = [
    { name: 'DMSO', hsp: { deltaD: 18.4, deltaP: 16.4, deltaH: 10.2 }, casNumber: '67-68-5' },
    { name: 'DMAC', hsp: { deltaD: 16.8, deltaP: 11.5, deltaH: 10.2 }, casNumber: null },
    { name: 'DMF', hsp: { deltaD: 17.4, deltaP: 13.7, deltaH: 11.3 }, casNumber: '68-12-2' },
    { name: 'Ethanol', hsp: { deltaD: 15.8, deltaP: 8.8, deltaH: 19.4 }, casNumber: '64-17-5' },
    { name: 'Water', hsp: { deltaD: 15.5, deltaP: 16.0, deltaH: 42.3 }, casNumber: '7732-18-5' },
    { name: 'Toluene', hsp: { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 }, casNumber: '108-88-3' },
  ];

  it('NMP代替でDMSO, DMACが上位', () => {
    const results = findSolventSubstitutes(nmpHSP, candidates);
    expect(results.length).toBeGreaterThanOrEqual(2);
    // DMSO, DMACが上位3以内
    const top3Names = results.slice(0, 3).map((r) => r.solvent.name);
    expect(top3Names).toContain('DMSO');
    expect(top3Names).toContain('DMAC');
  });

  it('overallScore昇順でソートされている', () => {
    const results = findSolventSubstitutes(nmpHSP, candidates);
    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].overallScore).toBeLessThanOrEqual(results[i + 1].overallScore);
    }
  });

  it('各結果にra, overallScoreが含まれる', () => {
    const results = findSolventSubstitutes(nmpHSP, candidates);
    for (const r of results) {
      expect(r.solvent.name).toBeTruthy();
      expect(r.ra).toBeGreaterThanOrEqual(0);
      expect(r.overallScore).toBeGreaterThanOrEqual(0);
    }
  });

  it('CAS番号がある場合は安全性情報を付与', () => {
    const results = findSolventSubstitutes(nmpHSP, candidates);
    const dmso = results.find((r) => r.solvent.name === 'DMSO');
    expect(dmso).toBeDefined();
    expect(dmso!.safetyRating).toBe('acceptable');
    expect(dmso!.environmentalScore).toBe(7);
    expect(dmso!.healthScore).toBe(6);
  });

  it('CAS番号がない場合は安全性情報がnull', () => {
    const results = findSolventSubstitutes(nmpHSP, candidates);
    const dmac = results.find((r) => r.solvent.name === 'DMAC');
    expect(dmac).toBeDefined();
    expect(dmac!.safetyRating).toBeNull();
    expect(dmac!.environmentalScore).toBeNull();
  });

  it('maxResults制限が機能する', () => {
    const results = findSolventSubstitutes(nmpHSP, candidates, undefined, 2);
    expect(results.length).toBe(2);
  });

  it('maxRa制約が機能する', () => {
    const results = findSolventSubstitutes(nmpHSP, candidates, { maxRa: 5.0 });
    for (const r of results) {
      expect(r.ra).toBeLessThanOrEqual(5.0);
    }
  });

  it('onlyGreen制約が機能する', () => {
    const results = findSolventSubstitutes(nmpHSP, candidates, { onlyGreen: true });
    for (const r of results) {
      expect(r.safetyRating).toBe('recommended');
    }
  });

  it('空の候補リストで空配列を返す', () => {
    const results = findSolventSubstitutes(nmpHSP, []);
    expect(results).toEqual([]);
  });

  it('Waterは水に対してHSP距離が大きい', () => {
    const results = findSolventSubstitutes(nmpHSP, candidates);
    const water = results.find((r) => r.solvent.name === 'Water');
    expect(water).toBeDefined();
    expect(water!.ra).toBeGreaterThan(10);
  });

  it('raが正しく計算される', () => {
    const results = findSolventSubstitutes(nmpHSP, candidates);
    for (const r of results) {
      const dD = nmpHSP.deltaD - r.solvent.hsp.deltaD;
      const dP = nmpHSP.deltaP - r.solvent.hsp.deltaP;
      const dH = nmpHSP.deltaH - r.solvent.hsp.deltaH;
      const expectedRa = Math.sqrt(4 * dD * dD + dP * dP + dH * dH);
      expect(r.ra).toBeCloseTo(expectedRa, 6);
    }
  });
});
