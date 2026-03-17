/**
 * ブックマークのバリデーション・シリアライズ
 */
import type { BookmarkPipeline, BookmarkParams } from './types';

const VALID_PIPELINES: ReadonlySet<string> = new Set<BookmarkPipeline>([
  'risk', 'contactAngle', 'swelling', 'chemicalResistance',
  'nanoDispersion', 'plasticizer', 'carrierSelection',
  'blendOptimizer', 'drugSolubility',
]);

/**
 * ブックマーク入力をバリデーションする
 * @returns エラーメッセージ（null = 有効）
 */
export function validateBookmark(
  name: string,
  pipeline: string,
  params: BookmarkParams,
): string | null {
  if (!name || name.trim().length === 0) {
    return 'ブックマークの名前を入力してください';
  }
  if (!VALID_PIPELINES.has(pipeline)) {
    return `不正なパイプライン名です: ${pipeline}`;
  }
  if (!params || Object.keys(params).length === 0) {
    return 'パラメータが空です';
  }
  return null;
}

export function serializeBookmarkParams(params: BookmarkParams): string {
  return JSON.stringify(params);
}

export function deserializeBookmarkParams(json: string): BookmarkParams | null {
  try {
    if (!json) return null;
    return JSON.parse(json) as BookmarkParams;
  } catch {
    return null;
  }
}
