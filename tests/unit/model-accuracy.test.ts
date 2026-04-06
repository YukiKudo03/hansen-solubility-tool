import { describe, it, expect } from 'vitest';
import { calculateModelAccuracy, buildDataPoints } from '../../src/core/model-accuracy';
import type { ExperimentalDataPoint } from '../../src/core/model-accuracy';

describe('calculateModelAccuracy', () => {
  it('全件一致で100%', () => {
    const dataPoints: ExperimentalDataPoint[] = [
      { solventHSP: { deltaD: 18, deltaP: 1, deltaH: 2 }, solventName: 'A', experimentalResult: 'good', red: 0.5 },
      { solventHSP: { deltaD: 15, deltaP: 10, deltaH: 7 }, solventName: 'B', experimentalResult: 'bad', red: 1.5 },
    ];

    const metrics = calculateModelAccuracy(dataPoints);
    expect(metrics.matchRate).toBe(100);
    expect(metrics.falsePositives).toBe(0);
    expect(metrics.falseNegatives).toBe(0);
    expect(metrics.matchCount).toBe(2);
    expect(metrics.totalCount).toBe(2);
    expect(metrics.topDivergences).toHaveLength(0);
  });

  it('False Positiveを検出（予測good、実験bad）', () => {
    const dataPoints: ExperimentalDataPoint[] = [
      { solventHSP: { deltaD: 18, deltaP: 1, deltaH: 2 }, solventName: 'A', experimentalResult: 'bad', red: 0.5 },
    ];

    const metrics = calculateModelAccuracy(dataPoints);
    expect(metrics.falsePositives).toBe(1);
    expect(metrics.falseNegatives).toBe(0);
    expect(metrics.matchRate).toBe(0);
  });

  it('False Negativeを検出（予測bad、実験good）', () => {
    const dataPoints: ExperimentalDataPoint[] = [
      { solventHSP: { deltaD: 18, deltaP: 1, deltaH: 2 }, solventName: 'A', experimentalResult: 'good', red: 1.5 },
    ];

    const metrics = calculateModelAccuracy(dataPoints);
    expect(metrics.falseNegatives).toBe(1);
    expect(metrics.falsePositives).toBe(0);
    expect(metrics.matchRate).toBe(0);
  });

  it('partial をデフォルトでgoodとして扱う', () => {
    const dataPoints: ExperimentalDataPoint[] = [
      { solventHSP: { deltaD: 18, deltaP: 1, deltaH: 2 }, solventName: 'A', experimentalResult: 'partial', red: 0.5 },
    ];

    const metrics = calculateModelAccuracy(dataPoints, 'good');
    expect(metrics.matchRate).toBe(100); // predicted=good, effective=good → 一致
  });

  it('partial をbadとして扱うオプション', () => {
    const dataPoints: ExperimentalDataPoint[] = [
      { solventHSP: { deltaD: 18, deltaP: 1, deltaH: 2 }, solventName: 'A', experimentalResult: 'partial', red: 0.5 },
    ];

    const metrics = calculateModelAccuracy(dataPoints, 'bad');
    expect(metrics.matchRate).toBe(0); // predicted=good, effective=bad → FP
    expect(metrics.falsePositives).toBe(1);
  });

  it('最大乖離Top3をRED=1.0からの距離順でソート', () => {
    const dataPoints: ExperimentalDataPoint[] = [
      { solventHSP: { deltaD: 18, deltaP: 1, deltaH: 2 }, solventName: 'A', experimentalResult: 'bad', red: 0.1 },  // |0.1-1.0|=0.9
      { solventHSP: { deltaD: 15, deltaP: 10, deltaH: 7 }, solventName: 'B', experimentalResult: 'good', red: 2.5 }, // |2.5-1.0|=1.5
      { solventHSP: { deltaD: 16, deltaP: 5, deltaH: 5 }, solventName: 'C', experimentalResult: 'bad', red: 0.8 },   // |0.8-1.0|=0.2
      { solventHSP: { deltaD: 17, deltaP: 3, deltaH: 3 }, solventName: 'D', experimentalResult: 'good', red: 3.0 },  // |3.0-1.0|=2.0
    ];

    const metrics = calculateModelAccuracy(dataPoints);
    expect(metrics.topDivergences).toHaveLength(3);
    expect(metrics.topDivergences[0].solventName).toBe('D'); // 距離2.0
    expect(metrics.topDivergences[1].solventName).toBe('B'); // 距離1.5
    expect(metrics.topDivergences[2].solventName).toBe('A'); // 距離0.9
  });

  it('空データで初期値を返す', () => {
    const metrics = calculateModelAccuracy([]);
    expect(metrics.matchRate).toBe(0);
    expect(metrics.totalCount).toBe(0);
    expect(metrics.topDivergences).toHaveLength(0);
  });

  it('RED=1.0 境界: RED<1.0 はgood、RED>=1.0 はbad', () => {
    const dataPoints: ExperimentalDataPoint[] = [
      { solventHSP: { deltaD: 18, deltaP: 1, deltaH: 2 }, solventName: 'A', experimentalResult: 'good', red: 0.999 },
      { solventHSP: { deltaD: 15, deltaP: 10, deltaH: 7 }, solventName: 'B', experimentalResult: 'bad', red: 1.0 },
      { solventHSP: { deltaD: 16, deltaP: 5, deltaH: 5 }, solventName: 'C', experimentalResult: 'bad', red: 1.001 },
    ];

    const metrics = calculateModelAccuracy(dataPoints);
    expect(metrics.matchRate).toBe(100);
    expect(metrics.matchCount).toBe(3);
  });

  it('一致率の小数精度', () => {
    const dataPoints: ExperimentalDataPoint[] = [
      { solventHSP: { deltaD: 18, deltaP: 1, deltaH: 2 }, solventName: 'A', experimentalResult: 'good', red: 0.5 },
      { solventHSP: { deltaD: 15, deltaP: 10, deltaH: 7 }, solventName: 'B', experimentalResult: 'good', red: 0.3 },
      { solventHSP: { deltaD: 16, deltaP: 5, deltaH: 5 }, solventName: 'C', experimentalResult: 'bad', red: 0.8 }, // FP
    ];

    const metrics = calculateModelAccuracy(dataPoints);
    expect(metrics.matchRate).toBeCloseTo(66.667, 1);
    expect(metrics.falsePositives).toBe(1);
  });
});

describe('buildDataPoints', () => {
  it('RED値を正しく計算', () => {
    const results = [
      { solventHSP: { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 }, solventName: 'トルエン', result: 'good' as const },
    ];
    const polymerHSP = { deltaD: 17.0, deltaP: 4.7, deltaH: 4.7 };
    const r0 = 8.0;

    const dataPoints = buildDataPoints(results, polymerHSP, r0);
    expect(dataPoints).toHaveLength(1);
    expect(dataPoints[0].red).toBeGreaterThan(0);
    expect(dataPoints[0].experimentalResult).toBe('good');
  });
});
