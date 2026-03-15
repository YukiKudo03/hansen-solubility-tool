/**
 * DDSキャリアシードデータ
 * 文献に基づくHSP値
 *
 * 出典:
 * - Abbott & Hansen (J. Pharm. Sci., 2010)
 * - HSPiP database
 * - 各種文献値
 */
import Database from 'better-sqlite3';

const CARRIER_SEEDS = [
  { name: 'PLGA（乳酸-グリコール酸共重合体）', deltaD: 17.5, deltaP: 9.7, deltaH: 11.8, r0: 6.0, materialType: 'carrier', notes: 'Abbott & Hansen; 生分解性, 最も一般的なDDSキャリア' },
  { name: 'PLA（ポリ乳酸）', deltaD: 18.6, deltaP: 9.9, deltaH: 6.0, r0: 5.5, materialType: 'carrier', notes: 'HSPiP; 生分解性' },
  { name: 'PEG（ポリエチレングリコール）', deltaD: 17.0, deltaP: 10.0, deltaH: 8.8, r0: 6.5, materialType: 'carrier', notes: 'HSPiP; ステルス化用' },
  { name: 'PCL（ポリカプロラクトン）', deltaD: 17.0, deltaP: 4.8, deltaH: 8.3, r0: 6.0, materialType: 'carrier', notes: 'HSPiP; 生分解性, 徐放性' },
  { name: 'キトサン', deltaD: 18.0, deltaP: 17.0, deltaH: 16.0, r0: 5.0, materialType: 'carrier', notes: '文献値; 天然高分子, 粘膜付着性' },
  { name: 'ゼラチン', deltaD: 17.4, deltaP: 12.0, deltaH: 18.0, r0: 5.0, materialType: 'carrier', notes: '文献値; 天然高分子, マイクロカプセル用' },
  { name: 'HPMC（ヒドロキシプロピルメチルセルロース）', deltaD: 18.0, deltaP: 14.2, deltaH: 16.5, r0: 5.5, materialType: 'carrier', notes: 'HSPiP; 腸溶性コーティング' },
  { name: 'エチルセルロース', deltaD: 19.6, deltaP: 4.7, deltaH: 7.0, r0: 5.0, materialType: 'carrier', notes: 'HSPiP; 徐放性コーティング' },
  { name: 'Eudragit L100（メタクリル酸共重合体）', deltaD: 18.0, deltaP: 10.0, deltaH: 8.5, r0: 6.0, materialType: 'carrier', notes: '文献値; 腸溶性ポリマー' },
  { name: 'リン脂質 (DPPC)', deltaD: 15.5, deltaP: 8.0, deltaH: 5.5, r0: 5.5, materialType: 'carrier', notes: '文献値; リポソーム用' },
  { name: 'PLGA-PEG（ブロック共重合体）', deltaD: 17.2, deltaP: 9.8, deltaH: 10.3, r0: 6.5, materialType: 'carrier', notes: '推定値; ステルスナノ粒子用' },
];

/**
 * DDSキャリアのシードデータを投入する（重複防止）
 */
export function seedCarriers(db: Database.Database): void {
  // Check if group exists
  const existing = db.prepare("SELECT COUNT(*) as cnt FROM parts_groups WHERE name = 'DDSキャリア'").get() as { cnt: number };
  if (existing.cnt > 0) return;

  // Create group
  const groupResult = db.prepare("INSERT INTO parts_groups (name, description) VALUES ('DDSキャリア', 'ドラッグデリバリーシステム用キャリア材料')").run();
  const groupId = Number(groupResult.lastInsertRowid);

  // Insert parts
  const stmt = db.prepare('INSERT INTO parts (group_id, name, material_type, delta_d, delta_p, delta_h, r0, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  const insertAll = db.transaction(() => {
    for (const s of CARRIER_SEEDS) {
      stmt.run(groupId, s.name, s.materialType, s.deltaD, s.deltaP, s.deltaH, s.r0, s.notes);
    }
  });
  insertAll();
}
