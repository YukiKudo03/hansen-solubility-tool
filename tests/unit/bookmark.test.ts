import { describe, it, expect } from 'vitest';
import { validateBookmark, serializeBookmarkParams, deserializeBookmarkParams } from '../../src/core/bookmark';
import type { BookmarkParams } from '../../src/core/types';

const VALID_PIPELINES = [
  'risk', 'contactAngle', 'swelling', 'chemicalResistance',
  'nanoDispersion', 'plasticizer', 'carrierSelection',
  'blendOptimizer', 'drugSolubility',
] as const;

describe('validateBookmark', () => {
  it('有効なブックマークでnullを返す', () => {
    const err = validateBookmark('テスト', 'risk', { partsGroupId: 1, solventId: 2 });
    expect(err).toBeNull();
  });

  it('名前が空でエラー', () => {
    const err = validateBookmark('', 'risk', { partsGroupId: 1 });
    expect(err).toContain('名前');
  });

  it('名前が空白のみでエラー', () => {
    const err = validateBookmark('   ', 'risk', { partsGroupId: 1 });
    expect(err).toContain('名前');
  });

  it('不正なパイプライン名でエラー', () => {
    const err = validateBookmark('テスト', 'invalidPipeline' as any, { partsGroupId: 1 });
    expect(err).toContain('パイプライン');
  });

  it('パラメータが空オブジェクトでエラー', () => {
    const err = validateBookmark('テスト', 'risk', {});
    expect(err).toContain('パラメータ');
  });

  it.each(VALID_PIPELINES)('パイプライン "%s" が有効', (pipeline) => {
    const err = validateBookmark('テスト', pipeline, { partsGroupId: 1 });
    expect(err).toBeNull();
  });
});

describe('serializeBookmarkParams', () => {
  it('オブジェクトをJSON文字列に変換', () => {
    const params: BookmarkParams = { partsGroupId: 1, solventId: 2 };
    const json = serializeBookmarkParams(params);
    expect(json).toBe('{"partsGroupId":1,"solventId":2}');
  });

  it('ネストしたオブジェクトも変換可能', () => {
    const params: BookmarkParams = { drugId: 5, mode: 'screening' };
    const json = serializeBookmarkParams(params);
    expect(JSON.parse(json)).toEqual({ drugId: 5, mode: 'screening' });
  });
});

describe('deserializeBookmarkParams', () => {
  it('JSON文字列をオブジェクトに復元', () => {
    const json = '{"partsGroupId":1,"solventId":2}';
    const params = deserializeBookmarkParams(json);
    expect(params).toEqual({ partsGroupId: 1, solventId: 2 });
  });

  it('不正なJSONでnullを返す', () => {
    const params = deserializeBookmarkParams('invalid json');
    expect(params).toBeNull();
  });

  it('空文字でnullを返す', () => {
    const params = deserializeBookmarkParams('');
    expect(params).toBeNull();
  });
});
