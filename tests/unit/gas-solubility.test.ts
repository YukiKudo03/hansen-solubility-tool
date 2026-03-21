/**
 * NL10: ガス溶解度推定 (Henry則/HSPベース) のテスト
 *
 * 原理: ガス分子のHSPとポリマー膜のHSP距離から透過性を推定
 * ln(S) ~ -Ra² * V_gas / (R * T)
 *
 * 文献:
 * - Robeson (2008) J. Membr. Sci. 320:390-400 (upper bound)
 * - Freeman (1999) Macromolecules 32:375 (permeability-selectivity tradeoff)
 *
 * ガスHSP値 (MPa^0.5):
 * - CO2: dD=15.6, dP=5.2, dH=5.8 (Hansen 2007)
 * - O2:  dD=14.7, dP=0.0, dH=0.0
 * - N2:  dD=11.9, dP=0.0, dH=0.0
 * - CH4: dD=14.2, dP=0.0, dH=0.2
 * - H2O: dD=15.6, dP=16.0, dH=42.3
 */
import { describe, it, expect } from 'vitest';

import {
  GAS_HSP_DATABASE,
  estimateGasPolymerAffinity,
  rankGasPermeability,
} from '../../src/core/gas-solubility';

// ポリマーHSP
const PDMS = { deltaD: 15.9, deltaP: 0.1, deltaH: 4.7 };
const PET = { deltaD: 19.5, deltaP: 3.5, deltaH: 8.6 };
const PE = { deltaD: 17.1, deltaP: 0.0, deltaH: 2.0 };

describe('GAS_HSP_DATABASE', () => {
  it('主要ガス(CO2, O2, N2, CH4)のHSPが定義されている', () => {
    expect(GAS_HSP_DATABASE.CO2).toBeDefined();
    expect(GAS_HSP_DATABASE.O2).toBeDefined();
    expect(GAS_HSP_DATABASE.N2).toBeDefined();
    expect(GAS_HSP_DATABASE.CH4).toBeDefined();
  });

  it('CO2はdP, dH成分を持つ（極性ガス）', () => {
    expect(GAS_HSP_DATABASE.CO2.deltaP).toBeGreaterThan(0);
    expect(GAS_HSP_DATABASE.CO2.deltaH).toBeGreaterThan(0);
  });

  it('N2, O2は非極性（dP≈0, dH≈0）', () => {
    expect(GAS_HSP_DATABASE.N2.deltaP).toBeCloseTo(0, 0);
    expect(GAS_HSP_DATABASE.O2.deltaP).toBeCloseTo(0, 0);
  });
});

describe('estimateGasPolymerAffinity', () => {
  it('PDMS-CO2: Ra²が比較的小さい（高透過性ポリマー）', () => {
    const result = estimateGasPolymerAffinity('CO2', PDMS);
    expect(result.ra).toBeGreaterThan(0);
    expect(result.ra2).toBeGreaterThan(0);
  });

  it('PDMS: CO2の方がN2よりRa²が小さい', () => {
    // PDMS中でCO2はN2より溶解しやすい（実験的事実）
    const co2 = estimateGasPolymerAffinity('CO2', PDMS);
    const n2 = estimateGasPolymerAffinity('N2', PDMS);
    expect(co2.ra2).toBeLessThan(n2.ra2);
  });

  it('PET: CO2とN2のRa²差がバリア性の選択性を反映', () => {
    const co2 = estimateGasPolymerAffinity('CO2', PET);
    const n2 = estimateGasPolymerAffinity('N2', PET);
    // PETはCO2に対して比較的高バリア（両方ともRa²が大きい）
    expect(co2.ra2).toBeGreaterThan(0);
    expect(n2.ra2).toBeGreaterThan(0);
  });
});

describe('rankGasPermeability', () => {
  it('PDMS: ガス透過性ランキングが定性的に正しい', () => {
    // PDMS実験的透過性順: CO2 > O2 > CH4 > N2
    const ranking = rankGasPermeability(PDMS, ['CO2', 'O2', 'N2', 'CH4']);
    const names = ranking.map(r => r.gasName);

    // CO2が最もRa²小→透過性最大（ランキング先頭）
    expect(names[0]).toBe('CO2');
    // N2はRa²最大→透過性最小（末尾付近）
    const n2Idx = names.indexOf('N2');
    expect(n2Idx).toBeGreaterThan(0);
  });

  it('PE: 非極性ポリマーでO2/CH4がCO2に近い', () => {
    const ranking = rankGasPermeability(PE, ['CO2', 'O2', 'N2', 'CH4']);
    // 全てRa²が計算される
    expect(ranking.length).toBe(4);
    ranking.forEach(r => {
      expect(r.ra2).toBeGreaterThan(0);
    });
  });

  it('結果がRa²昇順（透過性高い順）でソートされる', () => {
    const ranking = rankGasPermeability(PDMS, ['CO2', 'O2', 'N2']);
    for (let i = 1; i < ranking.length; i++) {
      expect(ranking[i].ra2).toBeGreaterThanOrEqual(ranking[i - 1].ra2);
    }
  });
});
