import { describe, it, expect } from 'vitest';
import { screenQDLigandExchangeSolvents, classifyLigandExchange, LigandExchangeLevel, getLigandExchangeLevelInfo } from '../../src/core/quantum-dot-ligand-exchange';
import type { HSPValues } from '../../src/core/types';

describe('quantum-dot-ligand-exchange', () => {
  // CdSe QD（オレイルアミン修飾）
  const qdHSP: HSPValues = { deltaD: 17.0, deltaP: 3.0, deltaH: 5.0 };
  const qdR0 = 6.0;

  const solvents = [
    { name: 'Toluene', hsp: { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 } },
    { name: 'Hexane', hsp: { deltaD: 14.9, deltaP: 0.0, deltaH: 0.0 } },
    { name: 'DMF', hsp: { deltaD: 17.4, deltaP: 13.7, deltaH: 11.3 } },
    { name: 'Water', hsp: { deltaD: 15.6, deltaP: 16.0, deltaH: 42.3 } },
    { name: 'Chloroform', hsp: { deltaD: 17.8, deltaP: 3.1, deltaH: 5.7 } },
  ];

  describe('classifyLigandExchange', () => {
    it('RED < 0.5 → Excellent', () => {
      expect(classifyLigandExchange(0.3)).toBe(LigandExchangeLevel.Excellent);
    });
    it('RED = 0.6 → Good', () => {
      expect(classifyLigandExchange(0.6)).toBe(LigandExchangeLevel.Good);
    });
    it('RED = 0.9 → Fair', () => {
      expect(classifyLigandExchange(0.9)).toBe(LigandExchangeLevel.Fair);
    });
    it('RED = 1.2 → Poor', () => {
      expect(classifyLigandExchange(1.2)).toBe(LigandExchangeLevel.Poor);
    });
    it('RED = 2.0 → Bad', () => {
      expect(classifyLigandExchange(2.0)).toBe(LigandExchangeLevel.Bad);
    });
    it('負のREDでエラー', () => {
      expect(() => classifyLigandExchange(-1)).toThrow();
    });
  });

  describe('screenQDLigandExchangeSolvents', () => {
    it('全溶媒の結果を返す', () => {
      const results = screenQDLigandExchangeSolvents(qdHSP, qdR0, solvents);
      expect(results).toHaveLength(5);
    });

    it('RED昇順（適合性高い順）にソートされる', () => {
      const results = screenQDLigandExchangeSolvents(qdHSP, qdR0, solvents);
      for (let i = 1; i < results.length; i++) {
        expect(results[i].red).toBeGreaterThanOrEqual(results[i - 1].red);
      }
    });

    it('各結果にra, red, levelが含まれる', () => {
      const results = screenQDLigandExchangeSolvents(qdHSP, qdR0, solvents);
      for (const r of results) {
        expect(r.ra).toBeGreaterThanOrEqual(0);
        expect(r.red).toBeGreaterThanOrEqual(0);
        expect(r.level).toBeDefined();
        expect(r.solventName).toBeTruthy();
      }
    });

    it('Chloroform/Tolueneが良い交換溶媒（RED小）', () => {
      const results = screenQDLigandExchangeSolvents(qdHSP, qdR0, solvents);
      const chloroform = results.find(r => r.solventName === 'Chloroform');
      expect(chloroform).toBeDefined();
      expect(chloroform!.red).toBeLessThan(1.0);
    });

    it('Waterが不適（RED大）', () => {
      const results = screenQDLigandExchangeSolvents(qdHSP, qdR0, solvents);
      const water = results.find(r => r.solventName === 'Water');
      expect(water).toBeDefined();
      expect(water!.red).toBeGreaterThan(1.5);
    });

    it('空配列で空結果', () => {
      const results = screenQDLigandExchangeSolvents(qdHSP, qdR0, []);
      expect(results).toHaveLength(0);
    });
  });

  describe('getLigandExchangeLevelInfo', () => {
    it('各レベルにラベルがある', () => {
      for (const level of [1, 2, 3, 4, 5] as LigandExchangeLevel[]) {
        const info = getLigandExchangeLevelInfo(level);
        expect(info.label).toBeTruthy();
        expect(info.color).toBeTruthy();
      }
    });
  });
});
