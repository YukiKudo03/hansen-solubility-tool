import { describe, it, expect } from 'vitest';
import { calculateRa, calculateRed } from '../../src/core/hsp';
import type { HSPValues } from '../../src/core/types';

describe('calculateRa', () => {
  it('同一HSP値でRa=0', () => {
    const hsp: HSPValues = { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 };
    expect(calculateRa(hsp, hsp)).toBe(0);
  });

  it('ポリスチレン vs トルエン — 手計算値と一致', () => {
    // PS: δD=18.5, δP=4.5, δH=2.9
    // トルエン: δD=18.0, δP=1.4, δH=2.0
    // Ra² = 4(0.5)² + (3.1)² + (0.9)² = 1.0 + 9.61 + 0.81 = 11.42
    // Ra = √11.42 ≈ 3.380
    const ps: HSPValues = { deltaD: 18.5, deltaP: 4.5, deltaH: 2.9 };
    const toluene: HSPValues = { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 };
    const ra = calculateRa(ps, toluene);
    expect(ra).toBeCloseTo(3.380, 2);
  });

  it('ポリエチレン vs 水 — 大きなRa値', () => {
    // PE: δD=18.0, δP=3.0, δH=2.0
    // 水: δD=15.6, δP=16.0, δH=42.3
    // Ra² = 4(2.4)² + (13.0)² + (40.3)² = 23.04 + 169.0 + 1624.09 = 1816.13
    // Ra = √1816.13 ≈ 42.616
    const pe: HSPValues = { deltaD: 18.0, deltaP: 3.0, deltaH: 2.0 };
    const water: HSPValues = { deltaD: 15.6, deltaP: 16.0, deltaH: 42.3 };
    const ra = calculateRa(pe, water);
    expect(ra).toBeCloseTo(42.616, 1);
  });

  it('PMMA vs アセトン — 既知ペア', () => {
    // PMMA: δD=18.6, δP=10.5, δH=7.5
    // アセトン: δD=15.5, δP=10.4, δH=7.0
    // Ra² = 4(3.1)² + (0.1)² + (0.5)² = 38.44 + 0.01 + 0.25 = 38.70
    // Ra = √38.70 ≈ 6.221
    const pmma: HSPValues = { deltaD: 18.6, deltaP: 10.5, deltaH: 7.5 };
    const acetone: HSPValues = { deltaD: 15.5, deltaP: 10.4, deltaH: 7.0 };
    const ra = calculateRa(pmma, acetone);
    expect(ra).toBeCloseTo(6.221, 2);
  });

  it('δDの係数4が正しく適用されている', () => {
    // δDのみ差がある場合: Ra² = 4 * 1² = 4, Ra = 2
    const hsp1: HSPValues = { deltaD: 10.0, deltaP: 5.0, deltaH: 5.0 };
    const hsp2: HSPValues = { deltaD: 11.0, deltaP: 5.0, deltaH: 5.0 };
    expect(calculateRa(hsp1, hsp2)).toBeCloseTo(2.0, 10);
  });

  it('δPのみ差がある場合: 係数は1', () => {
    const hsp1: HSPValues = { deltaD: 10.0, deltaP: 5.0, deltaH: 5.0 };
    const hsp2: HSPValues = { deltaD: 10.0, deltaP: 6.0, deltaH: 5.0 };
    expect(calculateRa(hsp1, hsp2)).toBeCloseTo(1.0, 10);
  });

  it('δHのみ差がある場合: 係数は1', () => {
    const hsp1: HSPValues = { deltaD: 10.0, deltaP: 5.0, deltaH: 5.0 };
    const hsp2: HSPValues = { deltaD: 10.0, deltaP: 5.0, deltaH: 8.0 };
    expect(calculateRa(hsp1, hsp2)).toBeCloseTo(3.0, 10);
  });

  it('順序を入れ替えても同じRa値', () => {
    const hsp1: HSPValues = { deltaD: 18.5, deltaP: 4.5, deltaH: 2.9 };
    const hsp2: HSPValues = { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 };
    expect(calculateRa(hsp1, hsp2)).toBe(calculateRa(hsp2, hsp1));
  });

  it('極端に大きな値でも計算可能', () => {
    const hsp1: HSPValues = { deltaD: 1000, deltaP: 1000, deltaH: 1000 };
    const hsp2: HSPValues = { deltaD: 0, deltaP: 0, deltaH: 0 };
    const ra = calculateRa(hsp1, hsp2);
    expect(ra).toBeGreaterThan(0);
    expect(Number.isFinite(ra)).toBe(true);
  });
});

describe('calculateRed', () => {
  it('ポリスチレン vs トルエン — RED ≈ 0.638 → Level 2', () => {
    const ps: HSPValues = { deltaD: 18.5, deltaP: 4.5, deltaH: 2.9 };
    const toluene: HSPValues = { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 };
    const red = calculateRed(ps, toluene, 5.3);
    expect(red).toBeCloseTo(0.638, 2);
  });

  it('同一HSP値でRED=0', () => {
    const hsp: HSPValues = { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 };
    expect(calculateRed(hsp, hsp, 5.0)).toBe(0);
  });

  it('R₀=0でエラー', () => {
    const hsp: HSPValues = { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 };
    expect(() => calculateRed(hsp, hsp, 0)).toThrow('相互作用半径 R₀ は正の値でなければなりません');
  });

  it('R₀が負値でエラー', () => {
    const hsp: HSPValues = { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 };
    expect(() => calculateRed(hsp, hsp, -1)).toThrow('相互作用半径 R₀ は正の値でなければなりません');
  });

  it('PVC vs クロロホルム — Hansen球内', () => {
    // PVC: δD=18.2, δP=7.5, δH=8.3, R₀=3.5
    // クロロホルム: δD=17.8, δP=3.1, δH=5.7
    // Ra² = 4(0.4)² + (4.4)² + (2.6)² = 0.64 + 19.36 + 6.76 = 26.76
    // Ra = 5.173, RED = 5.173/3.5 = 1.478
    const pvc: HSPValues = { deltaD: 18.2, deltaP: 7.5, deltaH: 8.3 };
    const chloroform: HSPValues = { deltaD: 17.8, deltaP: 3.1, deltaH: 5.7 };
    const red = calculateRed(pvc, chloroform, 3.5);
    expect(red).toBeCloseTo(1.478, 2);
  });
});
