import { describe, it, expect } from 'vitest';
import {
  antoineVaporPressure,
  simulateEvaporation,
  ANTOINE_CONSTANTS,
} from '../../src/core/evaporation';

describe('ANTOINE_CONSTANTS', () => {
  it('トルエン（108-88-3）の定数がある', () => {
    const c = ANTOINE_CONSTANTS['108-88-3'];
    expect(c).toBeDefined();
    expect(c.A).toBeGreaterThan(0);
  });

  it('全エントリのA,B,Cが数値', () => {
    for (const [cas, c] of Object.entries(ANTOINE_CONSTANTS)) {
      expect(typeof c.A, `${cas} A`).toBe('number');
      expect(typeof c.B, `${cas} B`).toBe('number');
      expect(typeof c.C, `${cas} C`).toBe('number');
    }
  });
});

describe('antoineVaporPressure', () => {
  it('トルエンの110.6°Cでの蒸気圧が1atm付近（mmHg）', () => {
    // トルエンの沸点は110.6°C → 蒸気圧≈760mmHg
    const P = antoineVaporPressure(ANTOINE_CONSTANTS['108-88-3'], 110.6);
    expect(P).toBeGreaterThan(700);
    expect(P).toBeLessThan(820);
  });

  it('低温で蒸気圧が低い', () => {
    const P25 = antoineVaporPressure(ANTOINE_CONSTANTS['108-88-3'], 25);
    const P80 = antoineVaporPressure(ANTOINE_CONSTANTS['108-88-3'], 80);
    expect(P25).toBeLessThan(P80);
  });
});

describe('simulateEvaporation', () => {
  it('単一溶媒の蒸発シミュレーション', () => {
    const result = simulateEvaporation(
      [{ casNumber: '108-88-3', moleFraction: 1.0, hsp: { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 } }],
      60,   // 温度 °C
      10,   // ステップ数
    );

    expect(result.timeSteps).toHaveLength(10);
    expect(result.hspTimeSeries).toHaveLength(10);

    // 単一溶媒なのでHSPは時間に依存しない（組成が変わらない）
    expect(result.hspTimeSeries[0].deltaD).toBeCloseTo(18.0, 1);
    expect(result.hspTimeSeries[9].deltaD).toBeCloseTo(18.0, 1);
  });

  it('2成分溶媒の蒸発で高沸点成分が残留する', () => {
    // トルエン(bp 110.6) + NMP(bp 202) の混合
    const result = simulateEvaporation(
      [
        { casNumber: '108-88-3', moleFraction: 0.5, hsp: { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 } },
        { casNumber: '872-50-4', moleFraction: 0.5, hsp: { deltaD: 18.0, deltaP: 12.3, deltaH: 7.2 } },
      ],
      80,
      20,
    );

    expect(result.timeSteps).toHaveLength(20);
    // 蒸発が進むとNMP(高沸点)の比率が増えてδPが増加
    const firstDeltaP = result.hspTimeSeries[0].deltaP;
    const lastDeltaP = result.hspTimeSeries[19].deltaP;
    expect(lastDeltaP).toBeGreaterThan(firstDeltaP);
  });

  it('残留率が時間とともに減少する', () => {
    const result = simulateEvaporation(
      [{ casNumber: '108-88-3', moleFraction: 1.0, hsp: { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 } }],
      60,
      10,
    );
    // 残留率は時間とともに減少（最後は最初より少ない）
    expect(result.residualFractions[9]).toBeLessThan(result.residualFractions[0]);
  });

  it('空の成分リストで空の結果', () => {
    const result = simulateEvaporation([], 60, 10);
    expect(result.timeSteps).toHaveLength(0);
  });
});
