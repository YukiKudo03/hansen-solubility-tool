/**
 * 分散剤シードデータ
 *
 * 注意: アンカー基・溶媒和鎖の分離HSP値は文献データが限られるため、
 * 推定値を含む。notesに出典・信頼度を記載している。
 * ユーザーはDatabaseEditorから自由に編集可能。
 */
import Database from 'better-sqlite3';

interface DispersantSeed {
  name: string;
  nameEn?: string;
  dispersantType: 'polymeric' | 'surfactant' | 'silane_coupling' | 'other';
  anchorDeltaD: number; anchorDeltaP: number; anchorDeltaH: number; anchorR0: number;
  solvationDeltaD: number; solvationDeltaP: number; solvationDeltaH: number; solvationR0: number;
  overallDeltaD: number; overallDeltaP: number; overallDeltaH: number;
  hlb?: number;
  molWeight?: number;
  tradeName?: string;
  manufacturer?: string;
  notes?: string;
}

export const DISPERSANT_SEEDS: DispersantSeed[] = [
  // ─── 高分子分散剤 ─────────────────────────────
  {
    name: 'BYK-163',
    nameEn: 'BYK-163',
    dispersantType: 'polymeric',
    anchorDeltaD: 19.5, anchorDeltaP: 9.0, anchorDeltaH: 7.5, anchorR0: 6.5,
    solvationDeltaD: 16.5, solvationDeltaP: 4.5, solvationDeltaH: 5.0, solvationR0: 8.0,
    overallDeltaD: 17.8, overallDeltaP: 6.5, overallDeltaH: 6.0,
    molWeight: 8000,
    tradeName: 'BYK-163',
    manufacturer: 'BYK-Chemie',
    notes: '有機顔料用高分子分散剤。アミン基アンカー。出典: BYK Technical Data / HSPiP推定値',
  },
  {
    name: 'DISPERBYK-111',
    nameEn: 'DISPERBYK-111',
    dispersantType: 'polymeric',
    anchorDeltaD: 18.0, anchorDeltaP: 12.0, anchorDeltaH: 10.0, anchorR0: 7.0,
    solvationDeltaD: 16.0, solvationDeltaP: 5.0, solvationDeltaH: 6.0, solvationR0: 8.5,
    overallDeltaD: 17.0, overallDeltaP: 8.0, overallDeltaH: 7.5,
    molWeight: 5000,
    tradeName: 'DISPERBYK-111',
    manufacturer: 'BYK-Chemie',
    notes: '無機顔料用（TiO₂等）。酸性基アンカー。出典: BYK Technical Data / HSPiP推定値',
  },
  {
    name: 'Solsperse 24000',
    nameEn: 'Solsperse 24000',
    dispersantType: 'polymeric',
    anchorDeltaD: 20.0, anchorDeltaP: 8.5, anchorDeltaH: 6.0, anchorR0: 6.0,
    solvationDeltaD: 16.0, solvationDeltaP: 5.0, solvationDeltaH: 5.5, solvationR0: 9.0,
    overallDeltaD: 17.5, overallDeltaP: 6.5, overallDeltaH: 5.8,
    molWeight: 10000,
    tradeName: 'Solsperse 24000',
    manufacturer: 'Lubrizol',
    notes: '有機顔料用高分子分散剤。芳香族アンカー基。出典: Lubrizol Technical Data / 推定値',
  },
  {
    name: 'PVP K30',
    nameEn: 'Polyvinylpyrrolidone K30',
    dispersantType: 'polymeric',
    anchorDeltaD: 17.4, anchorDeltaP: 11.6, anchorDeltaH: 21.6, anchorR0: 10.0,
    solvationDeltaD: 17.4, solvationDeltaP: 11.6, solvationDeltaH: 21.6, solvationR0: 10.0,
    overallDeltaD: 17.4, overallDeltaP: 11.6, overallDeltaH: 21.6,
    hlb: 18.0,
    molWeight: 40000,
    tradeName: 'PVP K30',
    notes: '汎用高分子分散剤。水系・アルコール系で使用。出典: Hansen Handbook / HSPiP',
  },
  {
    name: 'ポリアクリル酸ナトリウム',
    nameEn: 'Sodium Polyacrylate',
    dispersantType: 'polymeric',
    anchorDeltaD: 16.0, anchorDeltaP: 14.0, anchorDeltaH: 18.0, anchorR0: 9.0,
    solvationDeltaD: 16.0, solvationDeltaP: 14.0, solvationDeltaH: 18.0, solvationR0: 9.0,
    overallDeltaD: 16.0, overallDeltaP: 14.0, overallDeltaH: 18.0,
    hlb: 20.0,
    molWeight: 5000,
    notes: '水系分散用。セラミック・顔料分散に広く使用。出典: HSPiP推定値',
  },
  // ─── 界面活性剤 ────────────────────────────────
  {
    name: 'SDS',
    nameEn: 'Sodium Dodecyl Sulfate',
    dispersantType: 'surfactant',
    anchorDeltaD: 16.0, anchorDeltaP: 18.0, anchorDeltaH: 20.0, anchorR0: 8.0,
    solvationDeltaD: 16.5, solvationDeltaP: 0.5, solvationDeltaH: 0.5, solvationR0: 5.0,
    overallDeltaD: 16.2, overallDeltaP: 7.5, overallDeltaH: 8.0,
    hlb: 40.0,
    molWeight: 288.4,
    tradeName: 'SDS',
    notes: 'アニオン性界面活性剤。ナノ粒子の水系分散に広く使用。出典: HSPiP / Van Krevelen推定',
  },
  {
    name: 'CTAB',
    nameEn: 'Cetyltrimethylammonium Bromide',
    dispersantType: 'surfactant',
    anchorDeltaD: 15.5, anchorDeltaP: 12.0, anchorDeltaH: 14.0, anchorR0: 7.0,
    solvationDeltaD: 16.5, solvationDeltaP: 1.0, solvationDeltaH: 1.0, solvationR0: 5.5,
    overallDeltaD: 16.0, overallDeltaP: 5.0, overallDeltaH: 6.0,
    hlb: 10.0,
    molWeight: 364.5,
    tradeName: 'CTAB',
    notes: 'カチオン性界面活性剤。金属ナノ粒子の分散に使用。出典: HSPiP推定値',
  },
  {
    name: 'Triton X-100',
    nameEn: 'Triton X-100',
    dispersantType: 'surfactant',
    anchorDeltaD: 17.5, anchorDeltaP: 6.0, anchorDeltaH: 8.0, anchorR0: 7.5,
    solvationDeltaD: 16.0, solvationDeltaP: 8.0, solvationDeltaH: 14.0, solvationR0: 9.0,
    overallDeltaD: 16.5, overallDeltaP: 7.0, overallDeltaH: 11.0,
    hlb: 13.5,
    molWeight: 625,
    tradeName: 'Triton X-100',
    manufacturer: 'Dow Chemical',
    notes: '非イオン性界面活性剤。汎用。出典: Hansen Handbook / HSPiP',
  },
  // ─── シランカップリング剤 ──────────────────────────
  {
    name: 'KBM-403',
    nameEn: '3-Glycidoxypropyltrimethoxysilane',
    dispersantType: 'silane_coupling',
    anchorDeltaD: 15.8, anchorDeltaP: 8.5, anchorDeltaH: 12.5, anchorR0: 6.5,
    solvationDeltaD: 15.5, solvationDeltaP: 6.0, solvationDeltaH: 8.0, solvationR0: 7.0,
    overallDeltaD: 15.6, overallDeltaP: 7.0, overallDeltaH: 10.0,
    molWeight: 236.3,
    tradeName: 'KBM-403',
    manufacturer: '信越化学工業',
    notes: 'エポキシ系シランカップリング剤。シリカ・金属酸化物用。出典: 信越化学 Technical Data / 推定値',
  },
  {
    name: 'KBM-903',
    nameEn: '3-Aminopropyltrimethoxysilane',
    dispersantType: 'silane_coupling',
    anchorDeltaD: 15.5, anchorDeltaP: 10.0, anchorDeltaH: 15.0, anchorR0: 7.0,
    solvationDeltaD: 15.0, solvationDeltaP: 7.0, solvationDeltaH: 10.0, solvationR0: 7.5,
    overallDeltaD: 15.2, overallDeltaP: 8.5, overallDeltaH: 12.5,
    molWeight: 179.3,
    tradeName: 'KBM-903',
    manufacturer: '信越化学工業',
    notes: 'アミノ系シランカップリング剤。出典: 信越化学 Technical Data / 推定値',
  },
  // ─── その他 ──────────────────────────────────
  {
    name: 'メタクリル酸',
    nameEn: 'Methacrylic Acid',
    dispersantType: 'other',
    anchorDeltaD: 15.8, anchorDeltaP: 6.2, anchorDeltaH: 12.8, anchorR0: 7.0,
    solvationDeltaD: 15.8, solvationDeltaP: 6.2, solvationDeltaH: 12.8, solvationR0: 7.0,
    overallDeltaD: 15.8, overallDeltaP: 6.2, overallDeltaH: 12.8,
    molWeight: 86.1,
    notes: 'ZrO₂ナノ結晶の表面修飾剤。Garnweitnerら(2013)の研究事例。出典: Hansen Handbook',
  },
];

/**
 * 分散剤のシードデータを投入する
 */
export function seedDispersants(db: Database.Database): void {
  const count = (db.prepare('SELECT COUNT(*) as cnt FROM dispersants').get() as { cnt: number }).cnt;
  if (count > 0) return;

  const insert = db.prepare(`
    INSERT INTO dispersants (name, name_en, dispersant_type,
      anchor_delta_d, anchor_delta_p, anchor_delta_h, anchor_r0,
      solvation_delta_d, solvation_delta_p, solvation_delta_h, solvation_r0,
      overall_delta_d, overall_delta_p, overall_delta_h,
      hlb, mol_weight, trade_name, manufacturer, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertAll = db.transaction(() => {
    for (const d of DISPERSANT_SEEDS) {
      insert.run(
        d.name,
        d.nameEn ?? null,
        d.dispersantType,
        d.anchorDeltaD, d.anchorDeltaP, d.anchorDeltaH, d.anchorR0,
        d.solvationDeltaD, d.solvationDeltaP, d.solvationDeltaH, d.solvationR0,
        d.overallDeltaD, d.overallDeltaP, d.overallDeltaH,
        d.hlb ?? null,
        d.molWeight ?? null,
        d.tradeName ?? null,
        d.manufacturer ?? null,
        d.notes ?? null,
      );
    }
  });

  insertAll();
}
