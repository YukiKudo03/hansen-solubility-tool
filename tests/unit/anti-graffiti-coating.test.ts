import { describe, it, expect } from 'vitest';
import {
  classifyAntiGraffiti,
  screenAntiGraffitiCoatings,
  getAntiGraffitiLevelInfo,
  AntiGraffitiLevel,
  DEFAULT_ANTI_GRAFFITI_THRESHOLDS,
} from '../../src/core/anti-graffiti-coating';

describe('classifyAntiGraffiti', () => {
  it('RED ≤ 1.0 → Poor', () => {
    expect(classifyAntiGraffiti(0.5)).toBe(AntiGraffitiLevel.Poor);
    expect(classifyAntiGraffiti(1.0)).toBe(AntiGraffitiLevel.Poor);
  });

  it('1.0 < RED ≤ 1.5 → Moderate', () => {
    expect(classifyAntiGraffiti(1.01)).toBe(AntiGraffitiLevel.Moderate);
    expect(classifyAntiGraffiti(1.5)).toBe(AntiGraffitiLevel.Moderate);
  });

  it('1.5 < RED ≤ 2.0 → Good', () => {
    expect(classifyAntiGraffiti(1.51)).toBe(AntiGraffitiLevel.Good);
    expect(classifyAntiGraffiti(2.0)).toBe(AntiGraffitiLevel.Good);
  });

  it('RED > 2.0 → Excellent', () => {
    expect(classifyAntiGraffiti(2.01)).toBe(AntiGraffitiLevel.Excellent);
    expect(classifyAntiGraffiti(5.0)).toBe(AntiGraffitiLevel.Excellent);
  });

  it('カスタム閾値を適用', () => {
    const custom = { poorMax: 0.5, moderateMax: 1.0, goodMax: 1.5 };
    expect(classifyAntiGraffiti(0.3, custom)).toBe(AntiGraffitiLevel.Poor);
    expect(classifyAntiGraffiti(0.8, custom)).toBe(AntiGraffitiLevel.Moderate);
    expect(classifyAntiGraffiti(1.2, custom)).toBe(AntiGraffitiLevel.Good);
    expect(classifyAntiGraffiti(2.0, custom)).toBe(AntiGraffitiLevel.Excellent);
  });
});

describe('getAntiGraffitiLevelInfo', () => {
  it('各レベルの情報を返す', () => {
    for (const level of [AntiGraffitiLevel.Excellent, AntiGraffitiLevel.Good, AntiGraffitiLevel.Moderate, AntiGraffitiLevel.Poor]) {
      const info = getAntiGraffitiLevelInfo(level);
      expect(info.label).toBeDefined();
      expect(info.labelEn).toBeDefined();
      expect(info.description).toBeDefined();
    }
  });
});

describe('screenAntiGraffitiCoatings', () => {
  // フッ素系コーティング: 低表面エネルギー
  const coatingHSP = { deltaD: 14.0, deltaP: 2.0, deltaH: 3.0 };
  const coatingR0 = 6.0;

  const graffitiMaterials = [
    // スプレーペイント (アクリル系): 極性が高い
    { name: 'Spray Paint', hsp: { deltaD: 16.0, deltaP: 8.0, deltaH: 6.0 } },
    // マーカーインク (溶剤系): 中程度の極性
    { name: 'Marker Ink', hsp: { deltaD: 17.0, deltaP: 5.0, deltaH: 8.0 } },
    // 口紅 (油性): 低極性
    { name: 'Lipstick', hsp: { deltaD: 15.0, deltaP: 2.5, deltaH: 3.5 } },
  ];

  it('全落書き材料の結果を返す', () => {
    const results = screenAntiGraffitiCoatings(coatingHSP, coatingR0, graffitiMaterials);
    expect(results.length).toBe(3);
  });

  it('効果の高い順にソートされる', () => {
    const results = screenAntiGraffitiCoatings(coatingHSP, coatingR0, graffitiMaterials);
    for (let i = 1; i < results.length; i++) {
      if (results[i].level === results[i - 1].level) {
        // 同レベル内はRED降順
        expect(results[i].red).toBeLessThanOrEqual(results[i - 1].red);
      } else {
        expect(results[i].level).toBeGreaterThanOrEqual(results[i - 1].level);
      }
    }
  });

  it('フッ素系コーティングはスプレーペイントを撥ねやすい', () => {
    const results = screenAntiGraffitiCoatings(coatingHSP, coatingR0, graffitiMaterials);
    const sprayPaint = results.find(r => r.graffitiMaterial.name === 'Spray Paint');
    const lipstick = results.find(r => r.graffitiMaterial.name === 'Lipstick');
    // スプレーペイントはHSP距離が大きいので撥ねやすい
    expect(sprayPaint!.red).toBeGreaterThan(lipstick!.red);
  });

  it('各結果にRa, RED, levelが含まれる', () => {
    const results = screenAntiGraffitiCoatings(coatingHSP, coatingR0, graffitiMaterials);
    for (const r of results) {
      expect(r.ra).toBeGreaterThanOrEqual(0);
      expect(r.red).toBeGreaterThanOrEqual(0);
      expect(r.level).toBeDefined();
      expect(r.graffitiMaterial.name).toBeDefined();
    }
  });

  it('空の材料リストで空配列を返す', () => {
    const results = screenAntiGraffitiCoatings(coatingHSP, coatingR0, []);
    expect(results).toEqual([]);
  });
});
