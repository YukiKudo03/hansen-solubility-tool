/**
 * NL15: 会合性液体のdH温度補正テスト
 *
 * 通常のBarton法: dH(T) = dH(T0) * exp(-1.22e-3 * (T - T0))
 * 会合性液体(水、アルコール): dH^2(T) = dH^2(Tref) - (dH_assoc/V) * (1 - T/Tref)
 *
 * 文献:
 * - Barton (1991) Handbook of Solubility Parameters
 * - Hansen (2007) User's Handbook 2nd ed, Chapter 5
 *
 * 水のdHは温度上昇で急激に減少（水素結合ネットワーク崩壊）:
 * - 25°C: dH = 42.3 MPa^0.5
 * - 50°C: dH ≈ 38-40 MPa^0.5
 * - 100°C: dH ≈ 30-34 MPa^0.5
 */
import { describe, it, expect } from 'vitest';

import {
  correctDeltaHAssociating,
  isAssociatingLiquid,
  ASSOCIATING_LIQUIDS,
} from '../../src/core/associating-liquid-correction';

describe('isAssociatingLiquid', () => {
  it('水は会合性液体', () => {
    expect(isAssociatingLiquid('water')).toBe(true);
  });

  it('メタノールは会合性液体', () => {
    expect(isAssociatingLiquid('methanol')).toBe(true);
  });

  it('エタノールは会合性液体', () => {
    expect(isAssociatingLiquid('ethanol')).toBe(true);
  });

  it('トルエンは非会合性', () => {
    expect(isAssociatingLiquid('toluene')).toBe(false);
  });

  it('アセトンは非会合性', () => {
    expect(isAssociatingLiquid('acetone')).toBe(false);
  });
});

describe('ASSOCIATING_LIQUIDS', () => {
  it('水のパラメータが定義されている', () => {
    const water = ASSOCIATING_LIQUIDS.water;
    expect(water).toBeDefined();
    expect(water.deltaH_ref).toBeCloseTo(42.3, 0);
    expect(water.tRef).toBeCloseTo(298.15, 0);
  });

  it('メタノールのパラメータが定義されている', () => {
    const methanol = ASSOCIATING_LIQUIDS.methanol;
    expect(methanol).toBeDefined();
    expect(methanol.deltaH_ref).toBeCloseTo(22.3, 0);
  });
});

describe('correctDeltaHAssociating', () => {
  it('基準温度(25°C)では元のdH値が返る', () => {
    const dH = correctDeltaHAssociating(42.3, 298.15, 298.15, 'water');
    expect(dH).toBeCloseTo(42.3, 1);
  });

  it('水: 50°C でdHが減少する', () => {
    const dH50 = correctDeltaHAssociating(42.3, 323.15, 298.15, 'water');
    expect(dH50).toBeLessThan(42.3);
    expect(dH50).toBeGreaterThan(35); // 文献値 ≈ 38-40
  });

  it('水: 100°C でdHが大幅に減少する', () => {
    const dH100 = correctDeltaHAssociating(42.3, 373.15, 298.15, 'water');
    expect(dH100).toBeLessThan(38);
    expect(dH100).toBeGreaterThan(25); // 文献値 ≈ 30-34
  });

  it('温度上昇でdHが単調減少する', () => {
    const dH25 = correctDeltaHAssociating(42.3, 298.15, 298.15, 'water');
    const dH50 = correctDeltaHAssociating(42.3, 323.15, 298.15, 'water');
    const dH75 = correctDeltaHAssociating(42.3, 348.15, 298.15, 'water');
    const dH100 = correctDeltaHAssociating(42.3, 373.15, 298.15, 'water');

    expect(dH50).toBeLessThan(dH25);
    expect(dH75).toBeLessThan(dH50);
    expect(dH100).toBeLessThan(dH75);
  });

  it('メタノール: 温度上昇で減少', () => {
    const dH25 = correctDeltaHAssociating(22.3, 298.15, 298.15, 'methanol');
    const dH50 = correctDeltaHAssociating(22.3, 323.15, 298.15, 'methanol');
    expect(dH50).toBeLessThan(dH25);
    expect(dH50).toBeGreaterThan(15);
  });

  it('非会合性液体の場合はBarton指数減衰を使用', () => {
    // 通常Barton法: dH(T) = dH(T0) * exp(-1.22e-3 * dT)
    const dH_toluene = correctDeltaHAssociating(2.0, 373.15, 298.15);
    const expected = 2.0 * Math.exp(-1.22e-3 * 75);
    expect(dH_toluene).toBeCloseTo(expected, 2);
  });
});
