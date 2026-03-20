/**
 * シードデータ文献値照合テスト
 *
 * 溶媒・ポリマー・ナノ粒子・薬物・可塑剤・キャリア・コーティングの
 * シードデータが文献出典の値と一致していることを検証する。
 *
 * 主要参照文献:
 * - [Hansen2007] Hansen, C.M. "Hansen Solubility Parameters: A User's Handbook", 2nd Ed., CRC Press, 2007
 *   - Table A.1: 溶媒HSP値
 *   - Table A.2: ポリマーHSP値
 * - [HSPiP] Abbott, S. & Hansen, C.M. "Hansen Solubility Parameters in Practice", 5th Ed., 2015
 * - [Bergin2009] Bergin, S.D. et al. ACS Nano 3(8), 2340-2350, 2009
 * - [Hernandez2010] Hernandez, Y. et al. Langmuir 26(5), 3208-3213, 2010
 * - [Abbott2010] Abbott, S. & Hansen, C.M. J. Pharm. Sci. 99(11), 4505-4516, 2010
 * - [Gharagheizi2008] Gharagheizi, F. et al. J. Pharm. Sci. 97(7), 2745-2760, 2008
 *
 * 許容誤差: δD/δP/δH: ±0.5 MPa^(1/2) (文献間のばらつきを考慮)
 */
import { describe, it, expect } from 'vitest';
import { SOLVENT_SEEDS, POLYMER_GROUP_SEEDS } from '../../src/db/seed-data';
import { NANO_PARTICLE_SEEDS } from '../../src/db/seed-nano-particles';
import { DRUG_SEEDS } from '../../src/db/seed-drugs';
import { DISPERSANT_SEEDS } from '../../src/db/seed-dispersants';

const HSP_TOLERANCE = 0.5; // MPa^(1/2)

/** HSP値の照合ヘルパー */
function expectHSP(
  actual: { deltaD: number; deltaP: number; deltaH: number },
  expected: { deltaD: number; deltaP: number; deltaH: number },
  label: string,
  tolerance = HSP_TOLERANCE,
) {
  expect(actual.deltaD, `${label} δD`).toBeCloseTo(expected.deltaD, tolerance < 0.5 ? 1 : 0);
  expect(actual.deltaP, `${label} δP`).toBeCloseTo(expected.deltaP, tolerance < 0.5 ? 1 : 0);
  expect(actual.deltaH, `${label} δH`).toBeCloseTo(expected.deltaH, tolerance < 0.5 ? 1 : 0);
}

// ─── 溶媒シードデータの検証 ───────────────────────────

describe('シードデータ照合: 溶媒 [Hansen2007 Table A.1]', () => {
  /** 文献値データ (Hansen2007 Table A.1 + HSPiP) */
  const LITERATURE_SOLVENTS: Record<string, { deltaD: number; deltaP: number; deltaH: number; source: string }> = {
    'n-Pentane':     { deltaD: 14.5, deltaP: 0.0, deltaH: 0.0, source: 'Hansen2007' },
    'n-Hexane':      { deltaD: 14.9, deltaP: 0.0, deltaH: 0.0, source: 'Hansen2007' },
    'n-Heptane':     { deltaD: 15.3, deltaP: 0.0, deltaH: 0.0, source: 'Hansen2007' },
    'n-Octane':      { deltaD: 15.5, deltaP: 0.0, deltaH: 0.0, source: 'Hansen2007' },
    'Cyclohexane':   { deltaD: 16.8, deltaP: 0.0, deltaH: 0.2, source: 'Hansen2007' },
    'Benzene':       { deltaD: 18.4, deltaP: 0.0, deltaH: 2.0, source: 'Hansen2007' },
    'Toluene':       { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0, source: 'Hansen2007' },
    'Dichloromethane': { deltaD: 18.2, deltaP: 6.3, deltaH: 6.1, source: 'Hansen2007' },
    'Chloroform':    { deltaD: 17.8, deltaP: 3.1, deltaH: 5.7, source: 'Hansen2007' },
    'Carbon tetrachloride': { deltaD: 17.8, deltaP: 0.0, deltaH: 0.6, source: 'Hansen2007' },
    'Methanol':      { deltaD: 15.1, deltaP: 12.3, deltaH: 22.3, source: 'Hansen2007' },
    'Ethanol':       { deltaD: 15.8, deltaP: 8.8, deltaH: 19.4, source: 'Hansen2007' },
    'Isopropanol':   { deltaD: 15.8, deltaP: 6.1, deltaH: 16.4, source: 'Hansen2007' },
    'Ethylene glycol': { deltaD: 17.0, deltaP: 11.0, deltaH: 26.0, source: 'Hansen2007' },
    'Glycerol':      { deltaD: 17.4, deltaP: 12.1, deltaH: 29.3, source: 'Hansen2007' },
    'Acetone':       { deltaD: 15.5, deltaP: 10.4, deltaH: 7.0, source: 'Hansen2007' },
    'Methyl ethyl ketone': { deltaD: 16.0, deltaP: 9.0, deltaH: 5.1, source: 'Hansen2007' },
    'Ethyl acetate': { deltaD: 15.8, deltaP: 5.3, deltaH: 7.2, source: 'Hansen2007' },
    'Diethyl ether': { deltaD: 14.5, deltaP: 2.9, deltaH: 5.1, source: 'Hansen2007' },
    'Tetrahydrofuran': { deltaD: 16.8, deltaP: 5.7, deltaH: 8.0, source: 'Hansen2007' },
    '1,4-Dioxane':   { deltaD: 19.0, deltaP: 1.8, deltaH: 7.4, source: 'Hansen2007' },
    'N,N-Dimethylformamide': { deltaD: 17.4, deltaP: 13.7, deltaH: 11.3, source: 'Hansen2007' },
    'N-Methyl-2-pyrrolidone': { deltaD: 18.0, deltaP: 12.3, deltaH: 7.2, source: 'Hansen2007' },
    'Dimethyl sulfoxide': { deltaD: 18.4, deltaP: 16.4, deltaH: 10.2, source: 'Hansen2007' },
    'Acetonitrile':  { deltaD: 15.3, deltaP: 18.0, deltaH: 6.1, source: 'Hansen2007' },
    'Water':         { deltaD: 15.6, deltaP: 16.0, deltaH: 42.3, source: 'Hansen2007' },
    'Acetic acid':   { deltaD: 14.5, deltaP: 8.0, deltaH: 13.5, source: 'Hansen2007' },
    'Formic acid':   { deltaD: 14.3, deltaP: 11.9, deltaH: 16.6, source: 'Hansen2007' },
    'Carbon disulfide': { deltaD: 20.5, deltaP: 0.0, deltaH: 0.6, source: 'Hansen2007' },
    'Pyridine':      { deltaD: 19.0, deltaP: 8.8, deltaH: 5.9, source: 'Hansen2007' },
    'Aniline':       { deltaD: 19.4, deltaP: 5.1, deltaH: 10.2, source: 'Hansen2007' },
    'Nitromethane':  { deltaD: 15.8, deltaP: 18.8, deltaH: 5.1, source: 'Hansen2007' },
    'Formamide':     { deltaD: 17.2, deltaP: 26.2, deltaH: 19.0, source: 'Hansen2007' },
  };

  for (const [nameEn, lit] of Object.entries(LITERATURE_SOLVENTS)) {
    it(`S-${nameEn}: δD=${lit.deltaD}, δP=${lit.deltaP}, δH=${lit.deltaH} [${lit.source}]`, () => {
      const seed = SOLVENT_SEEDS.find((s) => s.nameEn === nameEn);
      expect(seed, `溶媒 "${nameEn}" がシードデータに存在すること`).toBeDefined();
      if (seed) {
        expectHSP(seed, lit, nameEn);
      }
    });
  }

  it('全溶媒シードデータにCAS番号が設定されている', () => {
    for (const s of SOLVENT_SEEDS) {
      expect(s.casNumber, `${s.name} にCAS番号あり`).toBeDefined();
      expect(s.casNumber!.length, `${s.name} CAS番号が空でない`).toBeGreaterThan(0);
    }
  });

  it('全溶媒のδD/δP/δHが妥当な範囲にある (0-50 MPa^1/2)', () => {
    for (const s of SOLVENT_SEEDS) {
      expect(s.deltaD, `${s.name} δD >= 0`).toBeGreaterThanOrEqual(0);
      expect(s.deltaD, `${s.name} δD <= 50`).toBeLessThanOrEqual(50);
      expect(s.deltaP, `${s.name} δP >= 0`).toBeGreaterThanOrEqual(0);
      expect(s.deltaP, `${s.name} δP <= 50`).toBeLessThanOrEqual(50);
      expect(s.deltaH, `${s.name} δH >= 0`).toBeGreaterThanOrEqual(0);
      expect(s.deltaH, `${s.name} δH <= 50`).toBeLessThanOrEqual(50);
    }
  });

  it('溶媒シードデータの総数を確認', () => {
    expect(SOLVENT_SEEDS.length).toBeGreaterThanOrEqual(85);
  });
});

// ─── ポリマーシードデータの検証 ───────────────────────────

describe('シードデータ照合: ポリマー [Hansen2007 Table A.2, HSPiP]', () => {
  /** 文献値データ */
  const LITERATURE_POLYMERS: Record<string, { deltaD: number; deltaP: number; deltaH: number; r0: number; source: string }> = {
    'PS':    { deltaD: 18.5, deltaP: 4.5, deltaH: 2.9, r0: 5.3, source: 'Hansen2007' },
    'PE':    { deltaD: 18.0, deltaP: 3.0, deltaH: 2.0, r0: 4.0, source: 'Hansen2007' },
    'PP':    { deltaD: 18.0, deltaP: 0.0, deltaH: 1.0, r0: 6.0, source: 'Hansen2007' },
    'PVC':   { deltaD: 18.2, deltaP: 7.5, deltaH: 8.3, r0: 3.5, source: 'Hansen2007' },
    'PMMA':  { deltaD: 18.6, deltaP: 10.5, deltaH: 7.5, r0: 8.6, source: 'Hansen2007' },
    'PA66':  { deltaD: 18.6, deltaP: 5.1, deltaH: 12.3, r0: 4.7, source: 'Hansen2007' },
    'PC':    { deltaD: 18.6, deltaP: 10.5, deltaH: 6.0, r0: 10.0, source: 'Hansen2007' },
    'PET':   { deltaD: 18.2, deltaP: 6.2, deltaH: 6.2, r0: 5.1, source: 'Hansen2007' },
    'PEEK':  { deltaD: 19.0, deltaP: 7.0, deltaH: 5.0, r0: 6.0, source: 'HSPiP' },
    'PTFE':  { deltaD: 16.2, deltaP: 1.8, deltaH: 3.4, r0: 4.0, source: 'HSPiP' },
    'PVDF':  { deltaD: 17.0, deltaP: 12.5, deltaH: 9.2, r0: 5.5, source: 'HSPiP' },
    'Epoxy': { deltaD: 20.0, deltaP: 12.0, deltaH: 11.5, r0: 12.7, source: 'Hansen2007' },
    'NR':    { deltaD: 17.4, deltaP: 3.1, deltaH: 4.1, r0: 8.1, source: 'Hansen2007' },
    'NBR':   { deltaD: 18.0, deltaP: 10.0, deltaH: 4.0, r0: 6.5, source: 'Hansen2007' },
    'EPDM':  { deltaD: 17.2, deltaP: 2.0, deltaH: 2.4, r0: 6.5, source: 'Hansen2007' },
    'FKM':   { deltaD: 17.2, deltaP: 10.6, deltaH: 5.3, r0: 5.0, source: 'HSPiP' },
  };

  // ポリマーシードデータをフラット化
  const allParts = POLYMER_GROUP_SEEDS.flatMap((pg) => pg.parts);

  for (const [materialType, lit] of Object.entries(LITERATURE_POLYMERS)) {
    it(`P-${materialType}: δD=${lit.deltaD}, δP=${lit.deltaP}, δH=${lit.deltaH}, R₀=${lit.r0} [${lit.source}]`, () => {
      const part = allParts.find((p) => p.materialType === materialType);
      expect(part, `ポリマー "${materialType}" がシードデータに存在すること`).toBeDefined();
      if (part) {
        expectHSP(part, lit, materialType);
        expect(part.r0, `${materialType} R₀`).toBeCloseTo(lit.r0, 0);
      }
    });
  }

  it('全ポリマーのR₀が正の値', () => {
    for (const part of allParts) {
      expect(part.r0, `${part.name} R₀ > 0`).toBeGreaterThan(0);
    }
  });

  it('全ポリマーのδD/δP/δHが妥当な範囲にある', () => {
    for (const part of allParts) {
      expect(part.deltaD, `${part.name} δD`).toBeGreaterThanOrEqual(10);
      expect(part.deltaD, `${part.name} δD`).toBeLessThanOrEqual(25);
      expect(part.deltaP, `${part.name} δP`).toBeGreaterThanOrEqual(0);
      expect(part.deltaP, `${part.name} δP`).toBeLessThanOrEqual(20);
      expect(part.deltaH, `${part.name} δH`).toBeGreaterThanOrEqual(0);
      expect(part.deltaH, `${part.name} δH`).toBeLessThanOrEqual(20);
    }
  });

  it('ポリマーグループ構成の確認', () => {
    const groupNames = POLYMER_GROUP_SEEDS.map((pg) => pg.group.name);
    expect(groupNames).toContain('汎用プラスチック');
    expect(groupNames).toContain('エンジニアリングプラスチック');
    expect(groupNames).toContain('スーパーエンプラ');
    expect(groupNames).toContain('熱硬化性樹脂');
    expect(groupNames).toContain('ゴム・エラストマー');
    expect(groupNames).toContain('フッ素樹脂');
    expect(groupNames).toContain('接着剤');
    expect(allParts.length).toBeGreaterThanOrEqual(30);
  });
});

// ─── ナノ粒子シードデータの検証 ───────────────────────────

describe('シードデータ照合: ナノ粒子 [Bergin2009, Hernandez2010, HSPiP]', () => {
  const LITERATURE_NANOPARTICLES: Record<string, { deltaD: number; deltaP: number; deltaH: number; r0: number; source: string }> = {
    'SWCNT':    { deltaD: 19.4, deltaP: 6.0, deltaH: 4.5, r0: 5.0, source: 'Bergin2009' },
    'Graphene': { deltaD: 18.0, deltaP: 9.3, deltaH: 7.7, r0: 5.5, source: 'Hernandez2010' },
    'C60':      { deltaD: 19.7, deltaP: 2.9, deltaH: 2.7, r0: 4.0, source: 'HSPiP' },
    'TiO₂':    { deltaD: 15.5, deltaP: 10.5, deltaH: 11.0, r0: 7.0, source: 'Colloids Surf. A 2021' },
    'SiO₂':    { deltaD: 15.0, deltaP: 12.0, deltaH: 14.0, r0: 7.5, source: 'Ind. Eng. Chem. Res. 2012' },
  };

  for (const [coreMaterial, lit] of Object.entries(LITERATURE_NANOPARTICLES)) {
    it(`NP-${coreMaterial}: δD=${lit.deltaD}, δP=${lit.deltaP}, δH=${lit.deltaH} [${lit.source}]`, () => {
      const np = NANO_PARTICLE_SEEDS.find((n) => n.coreMaterial === coreMaterial);
      expect(np, `ナノ粒子 "${coreMaterial}" がシードデータに存在すること`).toBeDefined();
      if (np) {
        expectHSP(np, lit, coreMaterial);
        expect(np.r0, `${coreMaterial} R₀`).toBeCloseTo(lit.r0, 0);
      }
    });
  }

  it('全ナノ粒子にnotesフィールド（出典情報）がある', () => {
    for (const np of NANO_PARTICLE_SEEDS) {
      expect(np.notes, `${np.name} にnotes(出典)あり`).toBeDefined();
      expect(np.notes!.length).toBeGreaterThan(0);
    }
  });

  it('ナノ粒子カテゴリの妥当性', () => {
    const validCategories = ['carbon', 'metal', 'metal_oxide', 'quantum_dot', 'polymer', 'other'];
    for (const np of NANO_PARTICLE_SEEDS) {
      expect(validCategories, `${np.name} カテゴリ`).toContain(np.category);
    }
  });

  it('ナノ粒子シードデータの総数を確認', () => {
    expect(NANO_PARTICLE_SEEDS.length).toBeGreaterThanOrEqual(17);
  });
});

// ─── 薬物シードデータの検証 ───────────────────────────

describe('シードデータ照合: 薬物 [Abbott2010, Gharagheizi2008, HSPiP]', () => {
  const LITERATURE_DRUGS: Record<string, { deltaD: number; deltaP: number; deltaH: number; r0: number; source: string }> = {
    'Ibuprofen':       { deltaD: 17.6, deltaP: 5.2, deltaH: 8.0, r0: 6.0, source: 'Abbott2010' },
    'Indomethacin':    { deltaD: 19.0, deltaP: 10.2, deltaH: 8.0, r0: 6.5, source: 'Gharagheizi2008' },
    'Acetaminophen':   { deltaD: 17.2, deltaP: 9.4, deltaH: 13.3, r0: 5.0, source: 'HSPiP' },
    'Caffeine':        { deltaD: 19.5, deltaP: 10.1, deltaH: 13.8, r0: 5.0, source: 'HSPiP' },
    'Aspirin':         { deltaD: 18.1, deltaP: 7.3, deltaH: 9.5, r0: 5.5, source: 'HSPiP' },
    'Sulfamethoxazole': { deltaD: 19.0, deltaP: 12.5, deltaH: 11.0, r0: 5.0, source: 'Gharagheizi2008' },
  };

  for (const [nameEn, lit] of Object.entries(LITERATURE_DRUGS)) {
    it(`D-${nameEn}: δD=${lit.deltaD}, δP=${lit.deltaP}, δH=${lit.deltaH} [${lit.source}]`, () => {
      const drug = DRUG_SEEDS.find((d) => d.nameEn === nameEn);
      expect(drug, `薬物 "${nameEn}" がシードデータに存在すること`).toBeDefined();
      if (drug) {
        expectHSP(drug, lit, nameEn);
        expect(drug.r0, `${nameEn} R₀`).toBeCloseTo(lit.r0, 0);
      }
    });
  }

  it('全薬物にCAS番号が設定されている', () => {
    for (const drug of DRUG_SEEDS) {
      expect(drug.casNumber, `${drug.name} にCAS番号あり`).toBeDefined();
    }
  });

  it('薬物シードデータの総数を確認', () => {
    expect(DRUG_SEEDS.length).toBeGreaterThanOrEqual(15);
  });
});

// ─── 分散剤シードデータの検証 ──────────────────────────

describe('シードデータ照合: 分散剤', () => {
  const VALID_TYPES = ['polymeric', 'surfactant', 'silane_coupling', 'other'];

  it('分散剤シードデータの総数を確認', () => {
    expect(DISPERSANT_SEEDS.length).toBeGreaterThanOrEqual(10);
  });

  it('全レコードに必須フィールドが存在する', () => {
    for (const d of DISPERSANT_SEEDS) {
      expect(d.name, `${d.name}: name`).toBeTruthy();
      expect(VALID_TYPES, `${d.name}: dispersantType`).toContain(d.dispersantType);
      // アンカー基HSP
      expect(d.anchorDeltaD, `${d.name}: anchorDeltaD`).toBeGreaterThan(0);
      expect(d.anchorDeltaP, `${d.name}: anchorDeltaP`).toBeGreaterThanOrEqual(0);
      expect(d.anchorDeltaH, `${d.name}: anchorDeltaH`).toBeGreaterThanOrEqual(0);
      expect(d.anchorR0, `${d.name}: anchorR0`).toBeGreaterThan(0);
      // 溶媒和鎖HSP
      expect(d.solvationDeltaD, `${d.name}: solvationDeltaD`).toBeGreaterThan(0);
      expect(d.solvationDeltaP, `${d.name}: solvationDeltaP`).toBeGreaterThanOrEqual(0);
      expect(d.solvationDeltaH, `${d.name}: solvationDeltaH`).toBeGreaterThanOrEqual(0);
      expect(d.solvationR0, `${d.name}: solvationR0`).toBeGreaterThan(0);
      // 全体HSP
      expect(d.overallDeltaD, `${d.name}: overallDeltaD`).toBeGreaterThan(0);
      expect(d.overallDeltaP, `${d.name}: overallDeltaP`).toBeGreaterThanOrEqual(0);
      expect(d.overallDeltaH, `${d.name}: overallDeltaH`).toBeGreaterThanOrEqual(0);
    }
  });

  it('HSP値が妥当な範囲内 (δD: 10-25, δP: 0-25, δH: 0-45)', () => {
    for (const d of DISPERSANT_SEEDS) {
      for (const prefix of ['anchor', 'solvation', 'overall'] as const) {
        const dd = d[`${prefix}DeltaD`];
        const dp = d[`${prefix}DeltaP`];
        const dh = d[`${prefix}DeltaH`];
        expect(dd, `${d.name} ${prefix} δD`).toBeGreaterThanOrEqual(10);
        expect(dd, `${d.name} ${prefix} δD`).toBeLessThanOrEqual(25);
        expect(dp, `${d.name} ${prefix} δP`).toBeLessThanOrEqual(25);
        expect(dh, `${d.name} ${prefix} δH`).toBeLessThanOrEqual(45);
      }
    }
  });

  it('全タイプがカバーされている', () => {
    const types = new Set(DISPERSANT_SEEDS.map((d) => d.dispersantType));
    expect(types.has('polymeric')).toBe(true);
    expect(types.has('surfactant')).toBe(true);
    expect(types.has('silane_coupling')).toBe(true);
  });
});
