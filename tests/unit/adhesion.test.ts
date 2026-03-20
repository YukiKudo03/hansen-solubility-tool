import { describe, it, expect } from 'vitest';
import {
  classifyAdhesion,
  getAdhesionLevelInfo,
  AdhesionLevel,
  DEFAULT_ADHESION_THRESHOLDS,
} from '../../src/core/adhesion';

describe('classifyAdhesion', () => {
  it('Ra=0 は Excellent', () => {
    expect(classifyAdhesion(0)).toBe(AdhesionLevel.Excellent);
  });

  it('Ra=1.9 (< excellentMax=2.0) は Excellent', () => {
    expect(classifyAdhesion(1.9)).toBe(AdhesionLevel.Excellent);
  });

  it('Ra=2.0 (= excellentMax) は Good', () => {
    expect(classifyAdhesion(2.0)).toBe(AdhesionLevel.Good);
  });

  it('Ra=3.9 (< goodMax=4.0) は Good', () => {
    expect(classifyAdhesion(3.9)).toBe(AdhesionLevel.Good);
  });

  it('Ra=4.0 (= goodMax) は Fair', () => {
    expect(classifyAdhesion(4.0)).toBe(AdhesionLevel.Fair);
  });

  it('Ra=6.0 (= fairMax) は Poor', () => {
    expect(classifyAdhesion(6.0)).toBe(AdhesionLevel.Poor);
  });

  it('Ra=8.0 (= poorMax) は Failed', () => {
    expect(classifyAdhesion(8.0)).toBe(AdhesionLevel.Failed);
  });

  it('Ra=100 は Failed', () => {
    expect(classifyAdhesion(100)).toBe(AdhesionLevel.Failed);
  });

  it('負のRaでエラー', () => {
    expect(() => classifyAdhesion(-1)).toThrow();
  });

  it('カスタム閾値が動作する', () => {
    const custom = { excellentMax: 1, goodMax: 2, fairMax: 3, poorMax: 4 };
    expect(classifyAdhesion(0.5, custom)).toBe(AdhesionLevel.Excellent);
    expect(classifyAdhesion(1.5, custom)).toBe(AdhesionLevel.Good);
    expect(classifyAdhesion(2.5, custom)).toBe(AdhesionLevel.Fair);
    expect(classifyAdhesion(3.5, custom)).toBe(AdhesionLevel.Poor);
    expect(classifyAdhesion(4.5, custom)).toBe(AdhesionLevel.Failed);
  });

  it('AdhesionLevel は数値 1-5', () => {
    expect(AdhesionLevel.Excellent).toBe(1);
    expect(AdhesionLevel.Good).toBe(2);
    expect(AdhesionLevel.Fair).toBe(3);
    expect(AdhesionLevel.Poor).toBe(4);
    expect(AdhesionLevel.Failed).toBe(5);
  });
});

describe('getAdhesionLevelInfo', () => {
  it('Excellent の label と color', () => {
    const info = getAdhesionLevelInfo(AdhesionLevel.Excellent);
    expect(info.label).toBe('優秀');
    expect(info.color).toBe('green');
  });

  it('Good の label と color', () => {
    const info = getAdhesionLevelInfo(AdhesionLevel.Good);
    expect(info.label).toBe('良好');
    expect(info.color).toBe('teal');
  });

  it('Fair の label と color', () => {
    const info = getAdhesionLevelInfo(AdhesionLevel.Fair);
    expect(info.label).toBe('可能');
    expect(info.color).toBe('yellow');
  });

  it('Poor の label と color', () => {
    const info = getAdhesionLevelInfo(AdhesionLevel.Poor);
    expect(info.label).toBe('不良');
    expect(info.color).toBe('orange');
  });

  it('Failed の label と color', () => {
    const info = getAdhesionLevelInfo(AdhesionLevel.Failed);
    expect(info.label).toBe('不可');
    expect(info.color).toBe('red');
  });

  it('全レベルで level フィールドが一致', () => {
    for (const level of [AdhesionLevel.Excellent, AdhesionLevel.Good, AdhesionLevel.Fair, AdhesionLevel.Poor, AdhesionLevel.Failed]) {
      expect(getAdhesionLevelInfo(level).level).toBe(level);
    }
  });

  it.todo('i18n: ハードコード日本語文字列の国際化対応');
});
