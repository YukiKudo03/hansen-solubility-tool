import { describe, it, expect } from 'vitest';
import { evaluatePolymerBlendMiscibility } from '../../src/core/polymer-blend-miscibility';

describe('evaluatePolymerBlendMiscibility', () => {
  // 文献HSP値
  // 注: 重合度Nは chi_c との関係でテストシナリオに合わせて調整
  //   chi = V*Ra²/(6RT), chi_c = 0.5*(1/√N1+1/√N2)²
  const PS = { name: 'PS', hsp: { deltaD: 18.5, deltaP: 4.5, deltaH: 2.9 }, degreeOfPolymerization: 500 };
  const PMMA = { name: 'PMMA', hsp: { deltaD: 18.6, deltaP: 10.5, deltaH: 5.1 }, degreeOfPolymerization: 400 };

  const refVolume = 100; // cm³/mol

  it('PS/PMMA should be immiscible (well-known immiscible blend)', () => {
    const result = evaluatePolymerBlendMiscibility(PS, PMMA, refVolume);

    expect(result.polymer1.name).toBe('PS');
    expect(result.polymer2.name).toBe('PMMA');
    expect(result.ra).toBeGreaterThan(0);
    expect(result.chi).toBeGreaterThan(result.chiCritical);
    expect(result.miscibility).toBe('immiscible');
  });

  it('PS/PPO should be miscible (well-known miscible blend) — low N oligomers', () => {
    // PS/PPOは既知の相溶ブレンド。HSP距離が近い(Ra≈1.88)ためchiが小さい。
    // 低重合度オリゴマーではchi_cが十分大きくなり miscible と判定される。
    const PS_low = { name: 'PS', hsp: { deltaD: 18.5, deltaP: 4.5, deltaH: 2.9 }, degreeOfPolymerization: 10 };
    const PPO_low = { name: 'PPO', hsp: { deltaD: 17.8, deltaP: 5.1, deltaH: 4.0 }, degreeOfPolymerization: 10 };
    const result = evaluatePolymerBlendMiscibility(PS_low, PPO_low, refVolume);

    expect(result.polymer1.name).toBe('PS');
    expect(result.polymer2.name).toBe('PPO');
    expect(result.ra).toBeGreaterThan(0);
    // chi_c = 0.5*(1/√10+1/√10)² = 0.2, chi ≈ 0.024 → miscible
    expect(result.chi).toBeLessThan(result.chiCritical);
    expect(result.miscibility).toBe('miscible');
  });

  it('PS/PPO should have much smaller Ra than PS/PMMA', () => {
    // PS/PPOのHSP距離がPS/PMMAより近いことを確認
    const PPO = { name: 'PPO', hsp: { deltaD: 17.8, deltaP: 5.1, deltaH: 4.0 }, degreeOfPolymerization: 300 };
    const rPsPpo = evaluatePolymerBlendMiscibility(PS, PPO, refVolume);
    const rPsPmma = evaluatePolymerBlendMiscibility(PS, PMMA, refVolume);

    expect(rPsPpo.ra).toBeLessThan(rPsPmma.ra);
    expect(rPsPpo.chi).toBeLessThan(rPsPmma.chi);
  });

  it('PVC/PMMA should be partial — tuned N to place chi near chi_c', () => {
    // PVC/PMMA Ra≈3.33, chi≈0.0745 (at V=100, T=298.15K)
    // chi_c = 2/N for equal N; N=27 → chi_c≈0.0741 → partial (within ±5%)
    const PVC_tuned = { name: 'PVC', hsp: { deltaD: 19.2, deltaP: 7.9, deltaH: 3.4 }, degreeOfPolymerization: 27 };
    const PMMA_tuned = { name: 'PMMA', hsp: { deltaD: 18.6, deltaP: 10.5, deltaH: 5.1 }, degreeOfPolymerization: 27 };
    const result = evaluatePolymerBlendMiscibility(PVC_tuned, PMMA_tuned, refVolume);

    expect(result.polymer1.name).toBe('PVC');
    expect(result.polymer2.name).toBe('PMMA');
    expect(result.miscibility).toBe('partial');
  });

  it('should return correct structure', () => {
    const result = evaluatePolymerBlendMiscibility(PS, PMMA, refVolume);

    expect(result).toHaveProperty('polymer1');
    expect(result).toHaveProperty('polymer2');
    expect(result).toHaveProperty('ra');
    expect(result).toHaveProperty('chi');
    expect(result).toHaveProperty('chiCritical');
    expect(result).toHaveProperty('miscibility');
    expect(typeof result.ra).toBe('number');
    expect(typeof result.chi).toBe('number');
    expect(typeof result.chiCritical).toBe('number');
  });

  it('chi should increase with higher reference volume', () => {
    const result1 = evaluatePolymerBlendMiscibility(PS, PMMA, 50);
    const result2 = evaluatePolymerBlendMiscibility(PS, PMMA, 200);

    // chi ∝ V_ref, so larger volume → larger chi
    expect(result2.chi).toBeGreaterThan(result1.chi);
  });

  it('chi should decrease with higher temperature', () => {
    const result1 = evaluatePolymerBlendMiscibility(PS, PMMA, refVolume, 298.15);
    const result2 = evaluatePolymerBlendMiscibility(PS, PMMA, refVolume, 400);

    // chi ∝ 1/T, so higher T → lower chi
    expect(result2.chi).toBeLessThan(result1.chi);
  });

  it('chiCritical should be very small for high molecular weight polymers', () => {
    const highMW1 = { ...PS, degreeOfPolymerization: 10000 };
    const highMW2 = { ...PMMA, degreeOfPolymerization: 10000 };
    const result = evaluatePolymerBlendMiscibility(highMW1, highMW2, refVolume);

    // chi_c = 0.5 * (1/√N1 + 1/√N2)² → very small for large N
    expect(result.chiCritical).toBeLessThan(0.001);
  });

  it('should preserve HSP values in output', () => {
    const result = evaluatePolymerBlendMiscibility(PS, PMMA, refVolume);

    expect(result.polymer1.hsp).toEqual(PS.hsp);
    expect(result.polymer2.hsp).toEqual(PMMA.hsp);
  });
});
