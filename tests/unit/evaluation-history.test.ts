import { describe, it, expect } from 'vitest';
import {
  serializeHistoryEntry,
  deserializeHistoryResult,
  VALID_HISTORY_PIPELINES,
  isValidHistoryPipeline,
} from '../../src/core/evaluation-history';

describe('isValidHistoryPipeline', () => {
  it.each([...VALID_HISTORY_PIPELINES])('"%s" は有効なパイプライン', (pipeline) => {
    expect(isValidHistoryPipeline(pipeline)).toBe(true);
  });

  it('無効なパイプライン名はfalse', () => {
    expect(isValidHistoryPipeline('invalid')).toBe(false);
    expect(isValidHistoryPipeline('')).toBe(false);
  });
});

describe('serializeHistoryEntry', () => {
  it('パラメータと結果をJSON文字列に変換', () => {
    const params = { partsGroupId: 1, solventId: 2 };
    const result = { partsGroup: { name: 'テスト' }, results: [] };
    const thresholds = { dangerousMax: 0.5 };

    const entry = serializeHistoryEntry('risk', params, result, thresholds);

    expect(entry.pipeline).toBe('risk');
    expect(JSON.parse(entry.paramsJson)).toEqual(params);
    expect(JSON.parse(entry.resultJson)).toEqual(result);
    expect(JSON.parse(entry.thresholdsJson)).toEqual(thresholds);
  });

  it('Date型を含む結果もシリアライズ可能', () => {
    const result = { evaluatedAt: new Date('2026-03-18T10:00:00Z'), results: [] };
    const entry = serializeHistoryEntry('risk', {}, result, {});

    const parsed = JSON.parse(entry.resultJson);
    expect(parsed.evaluatedAt).toBe('2026-03-18T10:00:00.000Z');
  });
});

describe('deserializeHistoryResult', () => {
  it('JSON文字列からオブジェクトを復元', () => {
    const json = '{"partsGroup":{"name":"テスト"},"results":[]}';
    const result = deserializeHistoryResult(json);
    expect(result).toEqual({ partsGroup: { name: 'テスト' }, results: [] });
  });

  it('不正なJSONでnullを返す', () => {
    expect(deserializeHistoryResult('invalid')).toBeNull();
  });

  it('空文字でnullを返す', () => {
    expect(deserializeHistoryResult('')).toBeNull();
  });
});
