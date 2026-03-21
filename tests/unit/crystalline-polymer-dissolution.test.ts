import { describe, it, expect } from 'vitest';
import { calculatePolymerDissolutionTemp } from '../../src/core/crystalline-polymer-dissolution';
import type { HSPValues } from '../../src/core/types';

describe('crystalline-polymer-dissolution', () => {
  // PEO (ポリエチレンオキシド): Tm0=338K, dHu=8700 J/mol
  const peoHSP: HSPValues = { deltaD: 17.3, deltaP: 3.0, deltaH: 9.4 };
  const peoParams = {
    tm0: 338,
    deltaHu: 8700,
    vu: 38.9,  // cm³/mol (PEO繰り返し単位)
    v1: 0,     // 溶媒ごとに設定
    phi1: 0.5,
  };

  describe('calculatePolymerDissolutionTemp', () => {
    it('PEO + 水 で融点降下が発生する', () => {
      const waterHSP: HSPValues = { deltaD: 15.5, deltaP: 16.0, deltaH: 42.3 };
      const result = calculatePolymerDissolutionTemp(peoHSP, waterHSP, {
        ...peoParams,
        v1: 18.0,  // 水のモル体積
      });

      expect(result.dissolutionTemperature).toBeLessThan(338);
      expect(result.meltingPointDepression).toBeGreaterThan(0);
      expect(result.chi).toBeGreaterThan(0);
      expect(result.tm0).toBe(338);
      expect(result.phi1).toBe(0.5);
    });

    it('PEO + クロロホルム で融点降下が発生する', () => {
      const chloroformHSP: HSPValues = { deltaD: 17.8, deltaP: 3.1, deltaH: 5.7 };
      const result = calculatePolymerDissolutionTemp(peoHSP, chloroformHSP, {
        ...peoParams,
        v1: 80.7,  // クロロホルムのモル体積
      });

      expect(result.dissolutionTemperature).toBeLessThan(338);
      expect(result.meltingPointDepression).toBeGreaterThan(0);
      // クロロホルムはPEOに近いHSP → chiが小さい
      expect(result.chi).toBeLessThan(2);
    });

    it('PEO + トルエン で融点降下を計算できる', () => {
      const tolueneHSP: HSPValues = { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 };
      const result = calculatePolymerDissolutionTemp(peoHSP, tolueneHSP, {
        ...peoParams,
        v1: 106.8,  // トルエンのモル体積
      });

      expect(result.dissolutionTemperature).toBeGreaterThan(0);
      expect(result.chi).toBeGreaterThan(0);
    });

    it('phi1=0 のとき Td = Tm0', () => {
      const waterHSP: HSPValues = { deltaD: 15.5, deltaP: 16.0, deltaH: 42.3 };
      const result = calculatePolymerDissolutionTemp(peoHSP, waterHSP, {
        ...peoParams,
        v1: 18.0,
        phi1: 0,
      });

      expect(result.dissolutionTemperature).toBe(338);
      expect(result.meltingPointDepression).toBe(0);
    });

    it('HSPが近い溶媒ほど融点降下が大きい', () => {
      // クロロホルム（HSP近い）vs ヘキサン（HSP遠い）
      const chloroformHSP: HSPValues = { deltaD: 17.8, deltaP: 3.1, deltaH: 5.7 };
      const hexaneHSP: HSPValues = { deltaD: 14.9, deltaP: 0.0, deltaH: 0.0 };

      const resultClose = calculatePolymerDissolutionTemp(peoHSP, chloroformHSP, {
        ...peoParams,
        v1: 80.7,
      });
      const resultFar = calculatePolymerDissolutionTemp(peoHSP, hexaneHSP, {
        ...peoParams,
        v1: 131.6,
      });

      // HSP近い → chi小さい → 融点降下大きい
      expect(resultClose.chi).toBeLessThan(resultFar.chi);
    });

    it('温度を指定するとchiが変化する', () => {
      const chloroformHSP: HSPValues = { deltaD: 17.8, deltaP: 3.1, deltaH: 5.7 };

      const result25C = calculatePolymerDissolutionTemp(peoHSP, chloroformHSP, {
        ...peoParams,
        v1: 80.7,
        temperature: 298.15,
      });
      const result60C = calculatePolymerDissolutionTemp(peoHSP, chloroformHSP, {
        ...peoParams,
        v1: 80.7,
        temperature: 333.15,
      });

      // 高温 → chiが小さい（chi ∝ 1/T）
      expect(result60C.chi).toBeLessThan(result25C.chi);
    });

    it('Tm0が負の場合エラー', () => {
      const waterHSP: HSPValues = { deltaD: 15.5, deltaP: 16.0, deltaH: 42.3 };
      expect(() =>
        calculatePolymerDissolutionTemp(peoHSP, waterHSP, {
          ...peoParams,
          tm0: -10,
          v1: 18.0,
        }),
      ).toThrow('Melting point');
    });

    it('deltaHuが負の場合エラー', () => {
      const waterHSP: HSPValues = { deltaD: 15.5, deltaP: 16.0, deltaH: 42.3 };
      expect(() =>
        calculatePolymerDissolutionTemp(peoHSP, waterHSP, {
          ...peoParams,
          deltaHu: -100,
          v1: 18.0,
        }),
      ).toThrow('Heat of fusion');
    });

    it('V1が負の場合エラー', () => {
      const waterHSP: HSPValues = { deltaD: 15.5, deltaP: 16.0, deltaH: 42.3 };
      expect(() =>
        calculatePolymerDissolutionTemp(peoHSP, waterHSP, {
          ...peoParams,
          v1: -18.0,
        }),
      ).toThrow('Solvent molar volume');
    });

    it('phi1が範囲外の場合エラー', () => {
      const waterHSP: HSPValues = { deltaD: 15.5, deltaP: 16.0, deltaH: 42.3 };
      expect(() =>
        calculatePolymerDissolutionTemp(peoHSP, waterHSP, {
          ...peoParams,
          v1: 18.0,
          phi1: 1.5,
        }),
      ).toThrow('Volume fraction');
    });

    it('Vuが0以下の場合エラー', () => {
      const waterHSP: HSPValues = { deltaD: 15.5, deltaP: 16.0, deltaH: 42.3 };
      expect(() =>
        calculatePolymerDissolutionTemp(peoHSP, waterHSP, {
          ...peoParams,
          vu: 0,
          v1: 18.0,
        }),
      ).toThrow('Polymer molar volume');
    });
  });
});
