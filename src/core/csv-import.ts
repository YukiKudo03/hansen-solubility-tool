/**
 * CSV インポート — 溶媒・部品のCSVパース・バリデーション
 */

export interface SolventImportRow {
  name: string;
  nameEn?: string;
  casNumber?: string;
  hsp: { deltaD: number; deltaP: number; deltaH: number };
  boilingPoint?: number;
  viscosity?: number;
  specificGravity?: number;
  surfaceTension?: number;
  molarVolume?: number;
  molWeight?: number;
}

export interface PartImportRow {
  name: string;
  materialType?: string;
  hsp: { deltaD: number; deltaP: number; deltaH: number };
  r0: number;
}

export interface ImportResult<T> {
  rows: T[];
  errors: string[];
}

function parseNumber(value: string): number | undefined {
  if (!value || value.trim() === '') return undefined;
  const n = Number(value.trim());
  return isNaN(n) ? undefined : n;
}

function parseRequiredNumber(value: string): number {
  const trimmed = value.trim();
  if (trimmed === '') return NaN;
  return Number(trimmed);
}

/**
 * 溶媒CSVをパースする
 */
export function parseSolventCsv(csv: string): ImportResult<SolventImportRow> {
  const lines = csv.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) return { rows: [], errors: [] };

  const headers = lines[0].split(',').map((h) => h.trim());
  const rows: SolventImportRow[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim());
    const record: Record<string, string> = {};
    headers.forEach((h, idx) => { record[h] = values[idx] ?? ''; });

    const deltaD = parseRequiredNumber(record['deltaD'] ?? '');
    const deltaP = parseRequiredNumber(record['deltaP'] ?? '');
    const deltaH = parseRequiredNumber(record['deltaH'] ?? '');

    const rowErr = validateSolventImportRow({
      name: record['name'] ?? '',
      deltaD,
      deltaP,
      deltaH,
    });

    if (rowErr) {
      errors.push(`行${i + 1}: ${rowErr}`);
      continue;
    }

    rows.push({
      name: record['name'],
      nameEn: record['nameEn'] || undefined,
      casNumber: record['casNumber'] || undefined,
      hsp: { deltaD, deltaP, deltaH },
      boilingPoint: parseNumber(record['boilingPoint'] ?? ''),
      viscosity: parseNumber(record['viscosity'] ?? ''),
      specificGravity: parseNumber(record['specificGravity'] ?? ''),
      surfaceTension: parseNumber(record['surfaceTension'] ?? ''),
      molarVolume: parseNumber(record['molarVolume'] ?? ''),
      molWeight: parseNumber(record['molWeight'] ?? ''),
    });
  }

  return { rows, errors };
}

/**
 * 部品CSVをパースする
 */
export function parsePartCsv(csv: string): ImportResult<PartImportRow> {
  const lines = csv.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) return { rows: [], errors: [] };

  const headers = lines[0].split(',').map((h) => h.trim());
  const rows: PartImportRow[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim());
    const record: Record<string, string> = {};
    headers.forEach((h, idx) => { record[h] = values[idx] ?? ''; });

    const deltaD = parseRequiredNumber(record['deltaD'] ?? '');
    const deltaP = parseRequiredNumber(record['deltaP'] ?? '');
    const deltaH = parseRequiredNumber(record['deltaH'] ?? '');
    const r0 = parseRequiredNumber(record['r0'] ?? '');

    const rowErr = validatePartImportRow({ name: record['name'] ?? '', deltaD, deltaP, deltaH, r0 });

    if (rowErr) {
      errors.push(`行${i + 1}: ${rowErr}`);
      continue;
    }

    rows.push({
      name: record['name'],
      materialType: record['materialType'] || undefined,
      hsp: { deltaD, deltaP, deltaH },
      r0,
    });
  }

  return { rows, errors };
}

/**
 * 溶媒インポート行のバリデーション
 */
export function validateSolventImportRow(row: { name: string; deltaD: number; deltaP: number; deltaH: number }): string | null {
  if (!row.name || row.name.trim() === '') return '名前が空です';
  if (isNaN(row.deltaD)) return 'δD が数値ではありません';
  if (isNaN(row.deltaP)) return 'δP が数値ではありません';
  if (isNaN(row.deltaH)) return 'δH が数値ではありません';
  return null;
}

/**
 * 部品インポート行のバリデーション
 */
export function validatePartImportRow(row: { name: string; deltaD: number; deltaP: number; deltaH: number; r0: number }): string | null {
  if (!row.name || row.name.trim() === '') return '名前が空です';
  if (isNaN(row.deltaD)) return 'δD が数値ではありません';
  if (isNaN(row.deltaP)) return 'δP が数値ではありません';
  if (isNaN(row.deltaH)) return 'δH が数値ではありません';
  if (isNaN(row.r0) || row.r0 <= 0) return 'R₀ は正の値が必要です';
  return null;
}
