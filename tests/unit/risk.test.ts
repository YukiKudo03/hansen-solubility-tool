import { describe, it, expect } from 'vitest';
import { classifyRisk, getRiskLevelInfo, DEFAULT_THRESHOLDS } from '../../src/core/risk';
import { RiskLevel } from '../../src/core/types';
import type { RiskThresholds } from '../../src/core/types';

describe('classifyRisk', () => {
  describe('デフォルト閾値', () => {
    it('RED=0 → Dangerous', () => {
      expect(classifyRisk(0)).toBe(RiskLevel.Dangerous);
    });

    it('RED=0.3 → Dangerous (RED < 0.5)', () => {
      expect(classifyRisk(0.3)).toBe(RiskLevel.Dangerous);
    });

    it('RED=0.499 → Dangerous', () => {
      expect(classifyRisk(0.499)).toBe(RiskLevel.Dangerous);
    });

    it('RED=0.5 → Warning (境界値: 0.5 ≤ RED < 0.8)', () => {
      expect(classifyRisk(0.5)).toBe(RiskLevel.Warning);
    });

    it('RED=0.638 → Warning (PS+トルエン)', () => {
      expect(classifyRisk(0.638)).toBe(RiskLevel.Warning);
    });

    it('RED=0.799 → Warning', () => {
      expect(classifyRisk(0.799)).toBe(RiskLevel.Warning);
    });

    it('RED=0.8 → Caution (境界値: 0.8 ≤ RED < 1.2)', () => {
      expect(classifyRisk(0.8)).toBe(RiskLevel.Caution);
    });

    it('RED=1.0 → Caution (Hansen球境界)', () => {
      expect(classifyRisk(1.0)).toBe(RiskLevel.Caution);
    });

    it('RED=1.199 → Caution', () => {
      expect(classifyRisk(1.199)).toBe(RiskLevel.Caution);
    });

    it('RED=1.2 → Hold (境界値: 1.2 ≤ RED < 2.0)', () => {
      expect(classifyRisk(1.2)).toBe(RiskLevel.Hold);
    });

    it('RED=1.5 → Hold', () => {
      expect(classifyRisk(1.5)).toBe(RiskLevel.Hold);
    });

    it('RED=1.999 → Hold', () => {
      expect(classifyRisk(1.999)).toBe(RiskLevel.Hold);
    });

    it('RED=2.0 → Safe (境界値: RED ≥ 2.0)', () => {
      expect(classifyRisk(2.0)).toBe(RiskLevel.Safe);
    });

    it('RED=10.0 → Safe', () => {
      expect(classifyRisk(10.0)).toBe(RiskLevel.Safe);
    });

    it('RED=Infinity → Safe', () => {
      expect(classifyRisk(Infinity)).toBe(RiskLevel.Safe);
    });
  });

  describe('カスタム閾値', () => {
    const custom: RiskThresholds = {
      dangerousMax: 0.3,
      warningMax: 0.6,
      cautionMax: 1.0,
      holdMax: 1.5,
    };

    it('RED=0.25 → Dangerous (カスタム)', () => {
      expect(classifyRisk(0.25, custom)).toBe(RiskLevel.Dangerous);
    });

    it('RED=0.3 → Warning (カスタム境界)', () => {
      expect(classifyRisk(0.3, custom)).toBe(RiskLevel.Warning);
    });

    it('RED=0.6 → Caution (カスタム境界)', () => {
      expect(classifyRisk(0.6, custom)).toBe(RiskLevel.Caution);
    });

    it('RED=1.0 → Hold (カスタム境界)', () => {
      expect(classifyRisk(1.0, custom)).toBe(RiskLevel.Hold);
    });

    it('RED=1.5 → Safe (カスタム境界)', () => {
      expect(classifyRisk(1.5, custom)).toBe(RiskLevel.Safe);
    });
  });

  describe('エッジケース', () => {
    it('負値でエラー', () => {
      expect(() => classifyRisk(-0.1)).toThrow('RED値は非負でなければなりません');
    });
  });
});

describe('DEFAULT_THRESHOLDS', () => {
  it('文献調査に基づく閾値が設定されている', () => {
    expect(DEFAULT_THRESHOLDS.dangerousMax).toBe(0.5);
    expect(DEFAULT_THRESHOLDS.warningMax).toBe(0.8);
    expect(DEFAULT_THRESHOLDS.cautionMax).toBe(1.2);
    expect(DEFAULT_THRESHOLDS.holdMax).toBe(2.0);
  });
});

describe('getRiskLevelInfo', () => {
  it('Dangerous の情報', () => {
    const info = getRiskLevelInfo(RiskLevel.Dangerous);
    expect(info.label).toBe('危険');
    expect(info.description).toBe('間違いなく溶解する');
    expect(info.color).toBe('red');
  });

  it('Warning の情報', () => {
    const info = getRiskLevelInfo(RiskLevel.Warning);
    expect(info.label).toBe('要警戒');
  });

  it('Caution の情報', () => {
    const info = getRiskLevelInfo(RiskLevel.Caution);
    expect(info.label).toBe('要注意');
  });

  it('Hold の情報', () => {
    const info = getRiskLevelInfo(RiskLevel.Hold);
    expect(info.label).toBe('保留');
  });

  it('Safe の情報', () => {
    const info = getRiskLevelInfo(RiskLevel.Safe);
    expect(info.label).toBe('安全');
    expect(info.description).toBe('おそらく溶解しない');
    expect(info.color).toBe('green');
  });

  it('全レベルの情報が取得可能', () => {
    for (const level of [1, 2, 3, 4, 5]) {
      const info = getRiskLevelInfo(level as RiskLevel);
      expect(info.level).toBe(level);
      expect(info.label).toBeTruthy();
      expect(info.description).toBeTruthy();
      expect(info.color).toBeTruthy();
    }
  });
});
