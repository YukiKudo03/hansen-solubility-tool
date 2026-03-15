/**
 * 可塑剤シードデータ
 * 文献に基づくHSP値・物性データ
 *
 * 出典:
 * - HSPiP database
 * - 各種文献値
 */
import Database from 'better-sqlite3';

const PLASTICIZER_SEEDS = [
  { name: 'フタル酸ジオクチル (DOP)', nameEn: 'Dioctyl phthalate', casNumber: '117-81-7', deltaD: 16.6, deltaP: 7.0, deltaH: 3.1, molWeight: 390.56, boilingPoint: 386, notes: '[可塑剤] 汎用PVC可塑剤' },
  { name: 'フタル酸ジブチル (DBP)', nameEn: 'Dibutyl phthalate', casNumber: '84-74-2', deltaD: 17.8, deltaP: 8.6, deltaH: 4.1, molWeight: 278.34, boilingPoint: 340, notes: '[可塑剤] 汎用可塑剤' },
  { name: 'アジピン酸ジオクチル (DOA)', nameEn: 'Dioctyl adipate', casNumber: '103-23-1', deltaD: 16.2, deltaP: 3.5, deltaH: 5.0, molWeight: 370.57, boilingPoint: 335, notes: '[可塑剤] 耐寒性可塑剤' },
  { name: 'クエン酸トリブチル (TBC)', nameEn: 'Tributyl citrate', casNumber: '77-94-1', deltaD: 16.0, deltaP: 4.0, deltaH: 9.0, molWeight: 360.44, boilingPoint: 233, notes: '[可塑剤] 食品用可塑剤' },
  { name: 'クエン酸アセチルトリブチル (ATBC)', nameEn: 'Acetyl tributyl citrate', casNumber: '77-90-7', deltaD: 16.5, deltaP: 4.5, deltaH: 7.0, molWeight: 402.48, boilingPoint: 327, notes: '[可塑剤] 食品・医療用' },
  { name: 'リン酸トリクレジル (TCP)', nameEn: 'Tricresyl phosphate', casNumber: '1330-78-5', deltaD: 19.0, deltaP: 12.3, deltaH: 4.5, molWeight: 368.36, boilingPoint: 410, notes: '[可塑剤] 難燃性可塑剤' },
  { name: 'セバシン酸ジオクチル (DOS)', nameEn: 'Dioctyl sebacate', casNumber: '122-62-3', deltaD: 16.0, deltaP: 3.0, deltaH: 4.5, molWeight: 426.67, boilingPoint: 377, notes: '[可塑剤] 耐寒性可塑剤' },
  { name: 'エポキシ化大豆油 (ESBO)', nameEn: 'Epoxidized soybean oil', casNumber: '8013-07-8', deltaD: 16.5, deltaP: 4.0, deltaH: 6.5, molWeight: 950.0, boilingPoint: null, notes: '[可塑剤] 安定剤兼可塑剤' },
  { name: 'トリメリット酸トリオクチル (TOTM)', nameEn: 'Trioctyl trimellitate', casNumber: '3319-31-1', deltaD: 16.8, deltaP: 6.0, deltaH: 3.5, molWeight: 546.78, boilingPoint: null, notes: '[可塑剤] 耐熱性可塑剤' },
  { name: 'アセチルクエン酸トリエチル (ATEC)', nameEn: 'Acetyl triethyl citrate', casNumber: '77-89-4', deltaD: 16.5, deltaP: 6.0, deltaH: 9.5, molWeight: 318.32, boilingPoint: 294, notes: '[可塑剤] 医薬品コーティング用' },
];

/**
 * 可塑剤のシードデータを溶媒テーブルに投入する（重複防止）
 */
export function seedPlasticizers(db: Database.Database): void {
  // Check if any plasticizer already exists
  const existing = db.prepare("SELECT COUNT(*) as cnt FROM solvents WHERE notes LIKE '%[可塑剤]%'").get() as { cnt: number };
  if (existing.cnt > 0) return;

  const stmt = db.prepare(
    'INSERT INTO solvents (name, name_en, cas_number, delta_d, delta_p, delta_h, mol_weight, boiling_point, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
  );

  const insertAll = db.transaction(() => {
    for (const s of PLASTICIZER_SEEDS) {
      stmt.run(
        s.name,
        s.nameEn,
        s.casNumber,
        s.deltaD,
        s.deltaP,
        s.deltaH,
        s.molWeight,
        s.boilingPoint ?? null,
        s.notes,
      );
    }
  });
  insertAll();
}
