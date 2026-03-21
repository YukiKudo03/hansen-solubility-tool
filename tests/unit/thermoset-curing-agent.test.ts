import { describe, it, expect } from 'vitest';
import { screenCuringAgents, getCuringCompatibilityInfo } from '../../src/core/thermoset-curing-agent';
import type { HSPValues } from '../../src/core/types';
import type { CuringAgent } from '../../src/core/thermoset-curing-agent';

describe('thermoset-curing-agent', () => {
  // Epoxy樹脂 (DGEBA系)
  const epoxyHSP: HSPValues = { deltaD: 18.5, deltaP: 10.0, deltaH: 9.0 };
  const epoxyR0 = 8.0;

  // 硬化剤候補
  const deta: CuringAgent = {
    name: 'DETA (ジエチレントリアミン)',
    hsp: { deltaD: 16.7, deltaP: 10.0, deltaH: 14.3 },
  };
  const teta: CuringAgent = {
    name: 'TETA (トリエチレンテトラミン)',
    hsp: { deltaD: 16.8, deltaP: 9.5, deltaH: 13.0 },
  };
  const dds: CuringAgent = {
    name: 'DDS (ジアミノジフェニルスルホン)',
    hsp: { deltaD: 19.8, deltaP: 13.2, deltaH: 11.0 },
  };
  const mda: CuringAgent = {
    name: 'MDA (メチレンジアニリン)',
    hsp: { deltaD: 19.2, deltaP: 7.5, deltaH: 10.5 },
  };

  describe('screenCuringAgents', () => {
    it('Epoxy vs 複数硬化剤でスクリーニングできる', () => {
      const results = screenCuringAgents(epoxyHSP, epoxyR0, [deta, teta, dds, mda]);

      expect(results).toHaveLength(4);
      results.forEach((r) => {
        expect(r.ra).toBeGreaterThan(0);
        expect(r.red).toBeGreaterThan(0);
        expect(['Excellent', 'Good', 'Moderate', 'Poor']).toContain(r.compatibility);
      });
    });

    it('結果がRED昇順でソートされている', () => {
      const results = screenCuringAgents(epoxyHSP, epoxyR0, [deta, teta, dds, mda]);

      for (let i = 1; i < results.length; i++) {
        expect(results[i].red).toBeGreaterThanOrEqual(results[i - 1].red);
      }
    });

    it('MDAはHSPが近いためREDが小さい', () => {
      const results = screenCuringAgents(epoxyHSP, epoxyR0, [deta, mda]);

      const mdaResult = results.find((r) => r.agent.name.includes('MDA'))!;
      const detaResult = results.find((r) => r.agent.name.includes('DETA'))!;

      // MDAの方がepoxyに近い
      expect(mdaResult.red).toBeLessThan(detaResult.red);
    });

    it('RED <= 0.5 のとき Excellent', () => {
      // 非常に近いHSPの硬化剤
      const closeAgent: CuringAgent = {
        name: 'Close Agent',
        hsp: { deltaD: 18.5, deltaP: 10.0, deltaH: 9.5 },
      };
      const results = screenCuringAgents(epoxyHSP, epoxyR0, [closeAgent]);

      expect(results[0].red).toBeLessThan(0.5);
      expect(results[0].compatibility).toBe('Excellent');
    });

    it('RED > 1.0 のとき Poor', () => {
      // 非常に遠いHSPの硬化剤
      const farAgent: CuringAgent = {
        name: 'Far Agent',
        hsp: { deltaD: 14.0, deltaP: 0.0, deltaH: 0.0 },
      };
      const results = screenCuringAgents(epoxyHSP, epoxyR0, [farAgent]);

      expect(results[0].red).toBeGreaterThan(1.0);
      expect(results[0].compatibility).toBe('Poor');
    });

    it('単一硬化剤でも動作する', () => {
      const results = screenCuringAgents(epoxyHSP, epoxyR0, [dds]);

      expect(results).toHaveLength(1);
      expect(results[0].agent.name).toContain('DDS');
    });

    it('R0が0以下の場合エラー', () => {
      expect(() =>
        screenCuringAgents(epoxyHSP, 0, [deta]),
      ).toThrow('Interaction radius');
    });

    it('空の硬化剤リストでエラー', () => {
      expect(() =>
        screenCuringAgents(epoxyHSP, epoxyR0, []),
      ).toThrow('At least one curing agent');
    });
  });

  describe('getCuringCompatibilityInfo', () => {
    it('Excellent の情報を取得できる', () => {
      const info = getCuringCompatibilityInfo('Excellent');
      expect(info.level).toBe('Excellent');
      expect(info.label).toBe('最適');
    });

    it('Poor の情報を取得できる', () => {
      const info = getCuringCompatibilityInfo('Poor');
      expect(info.level).toBe('Poor');
      expect(info.label).toBe('不良');
    });
  });
});
