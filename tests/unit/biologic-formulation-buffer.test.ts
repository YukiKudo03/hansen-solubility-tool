import { describe, it, expect } from 'vitest';
import {
  classifyBufferStability,
  screenBiologicBuffers,
  BufferStabilityLevel,
  DEFAULT_BUFFER_STABILITY_THRESHOLDS,
  getBufferStabilityLevelInfo,
} from '../../src/core/biologic-formulation-buffer';

describe('classifyBufferStability', () => {
  it('RED < 0.6 → Excellent', () => {
    expect(classifyBufferStability(0.0)).toBe(BufferStabilityLevel.Excellent);
    expect(classifyBufferStability(0.3)).toBe(BufferStabilityLevel.Excellent);
    expect(classifyBufferStability(0.59)).toBe(BufferStabilityLevel.Excellent);
  });

  it('0.6 <= RED < 0.9 → Good', () => {
    expect(classifyBufferStability(0.6)).toBe(BufferStabilityLevel.Good);
    expect(classifyBufferStability(0.75)).toBe(BufferStabilityLevel.Good);
    expect(classifyBufferStability(0.89)).toBe(BufferStabilityLevel.Good);
  });

  it('0.9 <= RED < 1.2 → Marginal', () => {
    expect(classifyBufferStability(0.9)).toBe(BufferStabilityLevel.Marginal);
    expect(classifyBufferStability(1.0)).toBe(BufferStabilityLevel.Marginal);
    expect(classifyBufferStability(1.19)).toBe(BufferStabilityLevel.Marginal);
  });

  it('RED >= 1.2 → Poor', () => {
    expect(classifyBufferStability(1.2)).toBe(BufferStabilityLevel.Poor);
    expect(classifyBufferStability(2.0)).toBe(BufferStabilityLevel.Poor);
    expect(classifyBufferStability(5.0)).toBe(BufferStabilityLevel.Poor);
  });

  it('負のRED値でエラー', () => {
    expect(() => classifyBufferStability(-0.1)).toThrow('RED値は非負でなければなりません');
  });

  it('カスタム閾値を適用', () => {
    const custom = { excellentMax: 0.4, goodMax: 0.7, marginalMax: 1.0 };
    expect(classifyBufferStability(0.3, custom)).toBe(BufferStabilityLevel.Excellent);
    expect(classifyBufferStability(0.5, custom)).toBe(BufferStabilityLevel.Good);
    expect(classifyBufferStability(0.8, custom)).toBe(BufferStabilityLevel.Marginal);
    expect(classifyBufferStability(1.1, custom)).toBe(BufferStabilityLevel.Poor);
  });
});

describe('getBufferStabilityLevelInfo', () => {
  it('各レベルの情報を正しく返す', () => {
    const excellent = getBufferStabilityLevelInfo(BufferStabilityLevel.Excellent);
    expect(excellent.label).toBe('優秀');
    expect(excellent.color).toBe('green');

    const good = getBufferStabilityLevelInfo(BufferStabilityLevel.Good);
    expect(good.label).toBe('良好');
    expect(good.color).toBe('blue');

    const marginal = getBufferStabilityLevelInfo(BufferStabilityLevel.Marginal);
    expect(marginal.label).toBe('境界的');
    expect(marginal.color).toBe('yellow');

    const poor = getBufferStabilityLevelInfo(BufferStabilityLevel.Poor);
    expect(poor.label).toBe('不良');
    expect(poor.color).toBe('red');
  });
});

describe('screenBiologicBuffers', () => {
  // mAb (dD=17.0, dP=12.0, dH=18.0, R0=10)
  const mAbHSP = { deltaD: 17.0, deltaP: 12.0, deltaH: 18.0 };
  const r0 = 10;

  const buffers = [
    { name: 'PBS buffer', hsp: { deltaD: 15.5, deltaP: 16.0, deltaH: 42.3 } },
    { name: 'Histidine buffer', hsp: { deltaD: 17.0, deltaP: 13.0, deltaH: 20.0 } },
    { name: 'Acetate buffer', hsp: { deltaD: 16.0, deltaP: 11.0, deltaH: 19.5 } },
  ];

  it('mAbに対するバッファースクリーニングで正しい結果を返す', () => {
    const results = screenBiologicBuffers(mAbHSP, r0, buffers);
    expect(results.length).toBe(3);

    // RED昇順でソートされている
    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].red).toBeLessThanOrEqual(results[i + 1].red);
    }

    for (const r of results) {
      expect(r.buffer.name).toBeTruthy();
      expect(r.ra).toBeGreaterThanOrEqual(0);
      expect(r.red).toBeGreaterThanOrEqual(0);
      expect(Object.values(BufferStabilityLevel)).toContain(r.stability);
    }
  });

  it('空のバッファーリストで空配列を返す', () => {
    const results = screenBiologicBuffers(mAbHSP, r0, []);
    expect(results).toEqual([]);
  });

  it('Histidine buffer (近いHSP) はExcellentまたはGood', () => {
    const results = screenBiologicBuffers(mAbHSP, r0, [buffers[1]]);
    // Histidine (dD=17, dP=13, dH=20) vs mAb (dD=17, dP=12, dH=18)
    // Ra = sqrt(4*0 + 1 + 4) = sqrt(5) ≈ 2.236
    // RED = 2.236 / 10 ≈ 0.224 → Excellent
    expect(results[0].stability).toBe(BufferStabilityLevel.Excellent);
  });

  it('会合性液体（water）で補正が適用される', () => {
    const waterBuffer = [
      { name: 'water', hsp: { deltaD: 15.5, deltaP: 16.0, deltaH: 42.3 } },
    ];
    const results = screenBiologicBuffers(mAbHSP, r0, waterBuffer, 298.15);
    // 基準温度(298.15K)では補正なし
    expect(results[0].associatingCorrectionApplied).toBe(true);

    // 高温で再評価
    const hotResults = screenBiologicBuffers(mAbHSP, r0, waterBuffer, 340);
    expect(hotResults[0].associatingCorrectionApplied).toBe(true);
    // 高温では dH が減少 → Ra が変化
    expect(hotResults[0].buffer.correctedHSP).toBeDefined();
    expect(hotResults[0].buffer.correctedHSP!.deltaH).toBeLessThan(42.3);
  });

  it('非会合性液体では補正が適用されない', () => {
    const nonAssociating = [
      { name: 'Histidine buffer', hsp: { deltaD: 17.0, deltaP: 13.0, deltaH: 20.0 } },
    ];
    const results = screenBiologicBuffers(mAbHSP, r0, nonAssociating);
    expect(results[0].associatingCorrectionApplied).toBe(false);
    expect(results[0].buffer.correctedHSP).toBeUndefined();
  });

  it('結果のraとredが正しく計算される', () => {
    const nonWaterBuffers = buffers.filter(b => b.name !== 'water');
    const results = screenBiologicBuffers(mAbHSP, r0, nonWaterBuffers);
    for (const r of results) {
      const dD = mAbHSP.deltaD - r.buffer.hsp.deltaD;
      const dP = mAbHSP.deltaP - r.buffer.hsp.deltaP;
      const dH = mAbHSP.deltaH - r.buffer.hsp.deltaH;
      const expectedRa = Math.sqrt(4 * dD * dD + dP * dP + dH * dH);
      expect(r.ra).toBeCloseTo(expectedRa, 6);
      expect(r.red).toBeCloseTo(expectedRa / r0, 6);
    }
  });
});
