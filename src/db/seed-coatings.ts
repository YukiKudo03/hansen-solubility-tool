/**
 * コーティング材料シードデータ
 * 文献に基づくHSP値
 *
 * 出典:
 * - HSPiP database
 */
import Database from 'better-sqlite3';

const COATING_SEEDS = [
  { name: 'エポキシ樹脂（ビスフェノールA型）', deltaD: 20.0, deltaP: 12.0, deltaH: 10.0, r0: 6.0, materialType: 'coating', notes: 'HSPiP; 防錆・防食用途' },
  { name: 'ウレタン樹脂（ポリエステル系）', deltaD: 17.5, deltaP: 8.5, deltaH: 10.5, r0: 7.0, materialType: 'coating', notes: 'HSPiP; 耐候性塗料' },
  { name: 'アクリル樹脂（PMMA系）', deltaD: 18.6, deltaP: 10.5, deltaH: 7.5, r0: 5.5, materialType: 'coating', notes: 'HSPiP; 汎用塗料' },
  { name: 'フッ素樹脂（PTFE）', deltaD: 16.2, deltaP: 1.8, deltaH: 3.4, r0: 4.0, materialType: 'coating', notes: 'HSPiP; 非粘着・耐薬品' },
  { name: 'シリコーン樹脂', deltaD: 16.0, deltaP: 6.0, deltaH: 4.0, r0: 6.0, materialType: 'coating', notes: 'HSPiP; 耐熱・撥水' },
  { name: 'アルキド樹脂', deltaD: 20.4, deltaP: 7.5, deltaH: 6.0, r0: 7.0, materialType: 'coating', notes: 'HSPiP; 油性塗料' },
  { name: 'フェノール樹脂', deltaD: 20.0, deltaP: 10.0, deltaH: 14.0, r0: 5.0, materialType: 'coating', notes: 'HSPiP; 耐熱・耐薬品' },
  { name: '塩化ビニル樹脂コーティング', deltaD: 18.2, deltaP: 7.5, deltaH: 8.3, r0: 3.5, materialType: 'coating', notes: 'HSPiP; 防食' },
  { name: 'ポリエステル樹脂', deltaD: 21.5, deltaP: 14.9, deltaH: 12.3, r0: 6.5, materialType: 'coating', notes: 'HSPiP; 汎用塗料' },
  { name: 'メラミン樹脂', deltaD: 19.5, deltaP: 8.0, deltaH: 10.0, r0: 5.0, materialType: 'coating', notes: 'HSPiP; 焼付塗料' },
  { name: 'ポリウレタン樹脂（エーテル系）', deltaD: 17.0, deltaP: 9.0, deltaH: 7.0, r0: 6.0, materialType: 'coating', notes: 'HSPiP; エラストマー塗膜' },
  { name: 'ポリビニルブチラール（PVB）', deltaD: 18.6, deltaP: 4.4, deltaH: 13.0, r0: 5.5, materialType: 'coating', notes: 'HSPiP; 中間膜・プライマー' },
];

/**
 * コーティング材料のシードデータを投入する（重複防止）
 */
export function seedCoatings(db: Database.Database): void {
  // Check if group exists
  const existing = db.prepare("SELECT COUNT(*) as cnt FROM parts_groups WHERE name = 'コーティング材料'").get() as { cnt: number };
  if (existing.cnt > 0) return;

  // Create group
  const groupResult = db.prepare("INSERT INTO parts_groups (name, description) VALUES ('コーティング材料', '塗膜・コーティング材料（耐薬品性評価用）')").run();
  const groupId = Number(groupResult.lastInsertRowid);

  // Insert parts
  const stmt = db.prepare('INSERT INTO parts (group_id, name, material_type, delta_d, delta_p, delta_h, r0, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  const insertAll = db.transaction(() => {
    for (const s of COATING_SEEDS) {
      stmt.run(groupId, s.name, s.materialType, s.deltaD, s.deltaP, s.deltaH, s.r0, s.notes);
    }
  });
  insertAll();
}
