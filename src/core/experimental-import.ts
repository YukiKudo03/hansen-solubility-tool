/**
 * 実験データCSVインポート + 溶媒名マッチング
 */
import type { Solvent } from './types';

/** 実験データCSVの1行 */
export interface ExperimentalRow {
  solventNameRaw: string;
  result: 'good' | 'partial' | 'bad';
  quantitativeValue?: number;
  quantitativeUnit?: string;
  temperatureC?: number;
  concentration?: string;
  notes?: string;
}

export interface ExperimentalImportResult {
  rows: ExperimentalRow[];
  errors: string[];
}

/** 溶媒名マッチング結果 */
export interface SolventMatchResult {
  /** マッチ成功: raw_name → solvent */
  matched: Array<{ rawName: string; solvent: Solvent }>;
  /** マッチ失敗: UI側で手動マッピングが必要 */
  unmatched: string[];
}

/** 保存済みマッピング */
export interface SolventNameMapping {
  id: number;
  rawName: string;
  solventId: number;
  createdAt: string;
}

const VALID_RESULTS = new Set(['good', 'partial', 'bad']);

function parseNumber(value: string): number | undefined {
  if (!value || value.trim() === '') return undefined;
  const n = Number(value.trim());
  return isNaN(n) ? undefined : n;
}

/**
 * Shift-JIS バイト列を検出するヒューリスティック
 * 0x80-0x9F 範囲のバイトが一定以上あれば Shift-JIS と判定
 */
export function detectShiftJIS(buffer: Uint8Array): boolean {
  // UTF-8 BOM がある場合は UTF-8
  if (buffer.length >= 3 && buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
    return false;
  }

  // UTF-8 マルチバイトシーケンスの検出
  // 有効な UTF-8 マルチバイトが見つかれば UTF-8 と判定
  let validUtf8Sequences = 0;
  let i = 0;
  while (i < buffer.length) {
    const b = buffer[i];
    if (b <= 0x7F) { i++; continue; }
    // 2バイト: 110xxxxx 10xxxxxx
    if ((b & 0xE0) === 0xC0 && i + 1 < buffer.length && (buffer[i + 1] & 0xC0) === 0x80) {
      validUtf8Sequences++; i += 2; continue;
    }
    // 3バイト: 1110xxxx 10xxxxxx 10xxxxxx
    if ((b & 0xF0) === 0xE0 && i + 2 < buffer.length &&
        (buffer[i + 1] & 0xC0) === 0x80 && (buffer[i + 2] & 0xC0) === 0x80) {
      validUtf8Sequences++; i += 3; continue;
    }
    // 4バイト: 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
    if ((b & 0xF8) === 0xF0 && i + 3 < buffer.length &&
        (buffer[i + 1] & 0xC0) === 0x80 && (buffer[i + 2] & 0xC0) === 0x80 && (buffer[i + 3] & 0xC0) === 0x80) {
      validUtf8Sequences++; i += 4; continue;
    }
    // 無効な UTF-8 バイト
    break;
  }

  // 有効な UTF-8 マルチバイトシーケンスが見つかった → UTF-8
  if (validUtf8Sequences > 0 && i >= buffer.length) {
    return false;
  }

  // Shift-JIS リードバイト検出
  let sjisIndicators = 0;
  for (let j = 0; j < buffer.length; j++) {
    const b = buffer[j];
    if ((b >= 0x81 && b <= 0x9F) || (b >= 0xE0 && b <= 0xFC)) {
      sjisIndicators++;
    }
  }
  return sjisIndicators > 0 && sjisIndicators / buffer.length > 0.01;
}

/**
 * 実験データCSVをパースする
 *
 * 最小スキーマ: solvent_name, result
 * オプション列: quantitative_value, quantitative_unit, temperature_c, concentration, notes
 */
export function parseExperimentalCsv(csv: string): ExperimentalImportResult {
  const lines = csv.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) return { rows: [], errors: ['CSVが空です'] };

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());

  // 必須ヘッダーチェック
  const solventNameIdx = headers.findIndex((h) =>
    h === 'solvent_name' || h === 'solventname' || h === '溶媒名' || h === '溶媒',
  );
  const resultIdx = headers.findIndex((h) =>
    h === 'result' || h === '結果' || h === '評価',
  );

  if (solventNameIdx === -1) {
    return { rows: [], errors: ['必須ヘッダー "solvent_name" (または "溶媒名") が見つかりません'] };
  }
  if (resultIdx === -1) {
    return { rows: [], errors: ['必須ヘッダー "result" (または "結果") が見つかりません'] };
  }

  // オプションヘッダーのインデックス
  const qValueIdx = headers.findIndex((h) =>
    h === 'quantitative_value' || h === '定量値',
  );
  const qUnitIdx = headers.findIndex((h) =>
    h === 'quantitative_unit' || h === '単位',
  );
  const tempIdx = headers.findIndex((h) =>
    h === 'temperature_c' || h === '温度' || h === 'temperature',
  );
  const concIdx = headers.findIndex((h) =>
    h === 'concentration' || h === '濃度',
  );
  const notesIdx = headers.findIndex((h) =>
    h === 'notes' || h === 'メモ' || h === '備考',
  );

  const rows: ExperimentalRow[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim());

    const solventName = values[solventNameIdx] ?? '';
    const resultRaw = (values[resultIdx] ?? '').toLowerCase();

    if (!solventName) {
      errors.push(`行${i + 1}: 溶媒名が空です`);
      continue;
    }

    if (!VALID_RESULTS.has(resultRaw)) {
      errors.push(`行${i + 1}: result は good/partial/bad のいずれかが必要です（値: "${values[resultIdx]}"）`);
      continue;
    }

    rows.push({
      solventNameRaw: solventName,
      result: resultRaw as 'good' | 'partial' | 'bad',
      quantitativeValue: qValueIdx >= 0 ? parseNumber(values[qValueIdx] ?? '') : undefined,
      quantitativeUnit: qUnitIdx >= 0 ? (values[qUnitIdx] || undefined) : undefined,
      temperatureC: tempIdx >= 0 ? parseNumber(values[tempIdx] ?? '') : undefined,
      concentration: concIdx >= 0 ? (values[concIdx] || undefined) : undefined,
      notes: notesIdx >= 0 ? (values[notesIdx] || undefined) : undefined,
    });
  }

  return { rows, errors };
}

/**
 * 溶媒名を正規化（空白・ハイフン・大小文字を無視）
 */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[\s\-_\u3000]/g, '')  // 半角/全角空白、ハイフン、アンダースコア除去
    .replace(/[（）()]/g, '');       // 括弧除去
}

/**
 * 溶媒名マッチング
 *
 * 戦略:
 * 1. 保存済みマッピングキャッシュ確認
 * 2. 完全一致（日本語名 / 英語名 / CAS番号）
 * 3. 正規化一致（空白・ハイフン・大小文字を無視）
 * 4. 未一致 → UI側で手動マッピング
 */
export function matchSolventNames(
  rawNames: string[],
  solvents: Solvent[],
  cachedMappings: SolventNameMapping[],
): SolventMatchResult {
  const matched: SolventMatchResult['matched'] = [];
  const unmatched: string[] = [];

  // キャッシュをMap化
  const cacheMap = new Map<string, number>();
  for (const m of cachedMappings) {
    cacheMap.set(m.rawName, m.solventId);
  }

  // 溶媒のルックアップテーブル
  const byExactJP = new Map<string, Solvent>();
  const byExactEN = new Map<string, Solvent>();
  const byCAS = new Map<string, Solvent>();
  const byNormalizedJP = new Map<string, Solvent>();
  const byNormalizedEN = new Map<string, Solvent>();
  const solventById = new Map<number, Solvent>();

  for (const s of solvents) {
    solventById.set(s.id, s);
    byExactJP.set(s.name, s);
    if (s.nameEn) byExactEN.set(s.nameEn.toLowerCase(), s);
    if (s.casNumber) byCAS.set(s.casNumber, s);
    byNormalizedJP.set(normalizeName(s.name), s);
    if (s.nameEn) byNormalizedEN.set(normalizeName(s.nameEn), s);
  }

  // 重複除去
  const uniqueNames = [...new Set(rawNames)];

  for (const rawName of uniqueNames) {
    // 1. キャッシュ確認
    const cachedSolventId = cacheMap.get(rawName);
    if (cachedSolventId !== undefined) {
      const s = solventById.get(cachedSolventId);
      if (s) {
        matched.push({ rawName, solvent: s });
        continue;
      }
    }

    // 2. 完全一致
    const exactJP = byExactJP.get(rawName);
    if (exactJP) { matched.push({ rawName, solvent: exactJP }); continue; }

    const exactEN = byExactEN.get(rawName.toLowerCase());
    if (exactEN) { matched.push({ rawName, solvent: exactEN }); continue; }

    const exactCAS = byCAS.get(rawName);
    if (exactCAS) { matched.push({ rawName, solvent: exactCAS }); continue; }

    // 3. 正規化一致
    const normalized = normalizeName(rawName);
    const normJP = byNormalizedJP.get(normalized);
    if (normJP) { matched.push({ rawName, solvent: normJP }); continue; }

    const normEN = byNormalizedEN.get(normalized);
    if (normEN) { matched.push({ rawName, solvent: normEN }); continue; }

    // 4. 未一致
    unmatched.push(rawName);
  }

  return { matched, unmatched };
}
