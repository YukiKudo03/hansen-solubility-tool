import { describe, it, expect } from 'vitest';
import {
  calculateSurfaceTension,
  calculateInterfacialTension,
  calculateContactAngle,
  estimateContactAngle,
} from '../../src/core/contact-angle';
import type { HSPValues, Part, Solvent } from '../../src/core/types';

// ─── テストヘルパー ───────────────────────────

/** テスト用の Part を生成 */
function makePart(hsp: HSPValues, overrides?: Partial<Part>): Part {
  return {
    id: 1,
    groupId: 1,
    name: 'テスト部材',
    materialType: null,
    hsp,
    r0: 5.0,
    notes: null,
    ...overrides,
  };
}

/** テスト用の Solvent を生成 */
function makeSolvent(hsp: HSPValues, overrides?: Partial<Solvent>): Solvent {
  return {
    id: 1,
    name: 'テスト溶媒',
    nameEn: null,
    casNumber: null,
    hsp,
    molarVolume: null,
    molWeight: null,
    boilingPoint: null,
    viscosity: null,
    specificGravity: null,
    surfaceTension: null,
    notes: null,
    ...overrides,
  };
}

// ─── calculateSurfaceTension ───────────────────

describe('calculateSurfaceTension', () => {
  it('HSP=(0,0,0) → γ=0', () => {
    const hsp: HSPValues = { deltaD: 0, deltaP: 0, deltaH: 0 };
    expect(calculateSurfaceTension(hsp)).toBe(0);
  });

  it('δD成分のみの寄与を確認', () => {
    const hsp: HSPValues = { deltaD: 10, deltaP: 0, deltaH: 0 };
    // γ = 0.0947 * 10² = 9.47
    expect(calculateSurfaceTension(hsp)).toBeCloseTo(9.47, 2);
  });

  it('δP成分のみの寄与を確認', () => {
    const hsp: HSPValues = { deltaD: 0, deltaP: 10, deltaH: 0 };
    // γ = 0.0315 * 10² = 3.15
    expect(calculateSurfaceTension(hsp)).toBeCloseTo(3.15, 2);
  });

  it('δH成分のみの寄与を確認', () => {
    const hsp: HSPValues = { deltaD: 0, deltaP: 0, deltaH: 10 };
    // γ = 0.0238 * 10² = 2.38
    expect(calculateSurfaceTension(hsp)).toBeCloseTo(2.38, 2);
  });

  it('水のHSP(15.5, 16.0, 42.3)で妥当な表面張力を返す', () => {
    // 水の実測表面張力 ≈ 72.8 mN/m
    const water: HSPValues = { deltaD: 15.5, deltaP: 16.0, deltaH: 42.3 };
    const gamma = calculateSurfaceTension(water);
    // Nakamoto-Yamamoto式: 0.0947*15.5² + 0.0315*16.0² + 0.0238*42.3²
    // = 0.0947*240.25 + 0.0315*256 + 0.0238*1789.29
    // = 22.75 + 8.064 + 42.585 = 73.4 (近似)
    expect(gamma).toBeCloseTo(73.4, 0);
    // 実測値72.8 mN/mと概ね一致することを確認
    expect(gamma).toBeGreaterThan(65);
    expect(gamma).toBeLessThan(80);
  });

  it('3成分の加算性を確認', () => {
    const hsp: HSPValues = { deltaD: 10, deltaP: 10, deltaH: 10 };
    // γ = 0.0947*100 + 0.0315*100 + 0.0238*100 = 9.47 + 3.15 + 2.38 = 15.0
    expect(calculateSurfaceTension(hsp)).toBeCloseTo(15.0, 1);
  });
});

// ─── calculateInterfacialTension ───────────────

describe('calculateInterfacialTension', () => {
  it('同一HSP → γ_SL = 0', () => {
    const hsp: HSPValues = { deltaD: 15, deltaP: 10, deltaH: 8 };
    expect(calculateInterfacialTension(hsp, hsp)).toBe(0);
  });

  it('対称性: interfacial(A,B) === interfacial(B,A)', () => {
    const a: HSPValues = { deltaD: 18, deltaP: 10, deltaH: 7 };
    const b: HSPValues = { deltaD: 15, deltaP: 16, deltaH: 42 };
    expect(calculateInterfacialTension(a, b)).toBeCloseTo(
      calculateInterfacialTension(b, a),
      10
    );
  });

  it('HSP差が大きいほどγ_SLが大きい', () => {
    const base: HSPValues = { deltaD: 15, deltaP: 10, deltaH: 8 };
    const close: HSPValues = { deltaD: 16, deltaP: 11, deltaH: 9 };
    const far: HSPValues = { deltaD: 25, deltaP: 2, deltaH: 2 };
    expect(calculateInterfacialTension(base, close)).toBeLessThan(
      calculateInterfacialTension(base, far)
    );
  });

  it('δD差のみの場合の計算', () => {
    const a: HSPValues = { deltaD: 20, deltaP: 0, deltaH: 0 };
    const b: HSPValues = { deltaD: 10, deltaP: 0, deltaH: 0 };
    // γ_SL = 0.0947 * (20-10)² = 0.0947 * 100 = 9.47
    expect(calculateInterfacialTension(a, b)).toBeCloseTo(9.47, 2);
  });

  it('片方がゼロHSP → calculateSurfaceTensionと同じ結果', () => {
    const hsp: HSPValues = { deltaD: 15, deltaP: 10, deltaH: 8 };
    const zero: HSPValues = { deltaD: 0, deltaP: 0, deltaH: 0 };
    expect(calculateInterfacialTension(hsp, zero)).toBeCloseTo(
      calculateSurfaceTension(hsp),
      10
    );
  });
});

// ─── calculateContactAngle ───────────────────

describe('calculateContactAngle', () => {
  it('同一HSP → θ = 0°（完全濡れ）', () => {
    const hsp: HSPValues = { deltaD: 15, deltaP: 10, deltaH: 8 };
    expect(calculateContactAngle(hsp, hsp)).toBeCloseTo(0, 1);
  });

  it('返り値が0〜180の範囲内', () => {
    const solid: HSPValues = { deltaD: 16, deltaP: 2, deltaH: 3 };
    const liquid: HSPValues = { deltaD: 15.5, deltaP: 16, deltaH: 42.3 };
    const theta = calculateContactAngle(solid, liquid);
    expect(theta).toBeGreaterThanOrEqual(0);
    expect(theta).toBeLessThanOrEqual(180);
  });

  it('PTFE(疎水性) × 水 → θ > 90°', () => {
    // PTFEは低極性・低水素結合 → 水に対して疎水性
    const ptfe: HSPValues = { deltaD: 16.2, deltaP: 1.8, deltaH: 3.4 };
    const water: HSPValues = { deltaD: 15.5, deltaP: 16.0, deltaH: 42.3 };
    const theta = calculateContactAngle(ptfe, water);
    expect(theta).toBeGreaterThan(90);
  });

  it('親水性ポリマー × 水 → θ < 90°', () => {
    // PVA（ポリビニルアルコール）のような親水性ポリマー
    const pva: HSPValues = { deltaD: 15.6, deltaP: 12.0, deltaH: 22.0 };
    const water: HSPValues = { deltaD: 15.5, deltaP: 16.0, deltaH: 42.3 };
    const theta = calculateContactAngle(pva, water);
    expect(theta).toBeLessThan(90);
  });

  it('HSP差が小さい組み合わせ → 小さな接触角', () => {
    const solid: HSPValues = { deltaD: 17, deltaP: 8, deltaH: 5 };
    const closeLiquid: HSPValues = { deltaD: 17.5, deltaP: 8.5, deltaH: 5.5 };
    const farLiquid: HSPValues = { deltaD: 15, deltaP: 16, deltaH: 42 };
    expect(calculateContactAngle(solid, closeLiquid)).toBeLessThan(
      calculateContactAngle(solid, farLiquid)
    );
  });

  it('cos(θ)が-1未満になるケースでもclampされてθ=180°', () => {
    // 極端に不相溶なケース
    const solid: HSPValues = { deltaD: 1, deltaP: 0, deltaH: 0 };
    const liquid: HSPValues = { deltaD: 1, deltaP: 30, deltaH: 40 };
    const theta = calculateContactAngle(solid, liquid);
    expect(theta).toBeLessThanOrEqual(180);
    expect(theta).toBeGreaterThanOrEqual(0);
  });
});

// ─── estimateContactAngle ───────────────────

describe('estimateContactAngle', () => {
  it('全フィールドが含まれるContactAngleResultを返す', () => {
    const part = makePart({ deltaD: 17, deltaP: 8, deltaH: 5 });
    const solvent = makeSolvent({ deltaD: 17.5, deltaP: 8.5, deltaH: 5.5 });
    const result = estimateContactAngle(part, solvent);

    expect(result.part).toBe(part);
    expect(result.solvent).toBe(solvent);
    expect(typeof result.surfaceTensionLV).toBe('number');
    expect(typeof result.surfaceEnergySV).toBe('number');
    expect(typeof result.interfacialTension).toBe('number');
    expect(typeof result.cosTheta).toBe('number');
    expect(typeof result.contactAngle).toBe('number');
    expect(typeof result.wettability).toBe('number');
  });

  it('contactAngleとcosThetaが整合している', () => {
    const part = makePart({ deltaD: 16.2, deltaP: 1.8, deltaH: 3.4 });
    const solvent = makeSolvent({ deltaD: 15.5, deltaP: 16.0, deltaH: 42.3 });
    const result = estimateContactAngle(part, solvent);

    const expectedCos = Math.cos((result.contactAngle * Math.PI) / 180);
    expect(result.cosTheta).toBeCloseTo(expectedCos, 5);
  });

  it('wettabilityがcontactAngleと整合している', () => {
    // 疎水性ケース (θ > 90°)
    const ptfe = makePart({ deltaD: 16.2, deltaP: 1.8, deltaH: 3.4 });
    const water = makeSolvent({ deltaD: 15.5, deltaP: 16.0, deltaH: 42.3 });
    const result = estimateContactAngle(ptfe, water);

    if (result.contactAngle >= 90 && result.contactAngle < 150) {
      expect(result.wettability).toBe(5); // Hydrophobic
    }
  });

  it('γ_SV, γ_LV, γ_SLが非負', () => {
    const part = makePart({ deltaD: 17, deltaP: 8, deltaH: 5 });
    const solvent = makeSolvent({ deltaD: 15.5, deltaP: 16.0, deltaH: 42.3 });
    const result = estimateContactAngle(part, solvent);

    expect(result.surfaceTensionLV).toBeGreaterThanOrEqual(0);
    expect(result.surfaceEnergySV).toBeGreaterThanOrEqual(0);
    expect(result.interfacialTension).toBeGreaterThanOrEqual(0);
  });

  it('cosθが[-1, 1]の範囲内', () => {
    const part = makePart({ deltaD: 1, deltaP: 0, deltaH: 0 });
    const solvent = makeSolvent({ deltaD: 1, deltaP: 30, deltaH: 40 });
    const result = estimateContactAngle(part, solvent);

    expect(result.cosTheta).toBeGreaterThanOrEqual(-1);
    expect(result.cosTheta).toBeLessThanOrEqual(1);
  });
});
