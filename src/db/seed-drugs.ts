/**
 * 薬物シードデータ
 * 文献に基づくHSP値
 *
 * 出典:
 * - Hansen (HSPiP database)
 * - Gharagheizi et al. (J. Pharm. Sci., 2008)
 * - Abbott & Hansen (J. Pharm. Sci., 2010)
 */
import Database from 'better-sqlite3';

export interface DrugSeed {
  name: string;
  nameEn?: string;
  casNumber?: string;
  deltaD: number;
  deltaP: number;
  deltaH: number;
  r0: number;
  molWeight?: number;
  logP?: number;
  therapeuticCategory?: string;
  notes?: string;
}

export const DRUG_SEEDS: DrugSeed[] = [
  {
    name: 'アセトアミノフェン',
    nameEn: 'Acetaminophen',
    casNumber: '103-90-2',
    deltaD: 17.2, deltaP: 9.4, deltaH: 13.3, r0: 5.0,
    molWeight: 151.16, logP: 0.46,
    therapeuticCategory: '鎮痛薬',
    notes: 'HSPiP database; 代表的な解熱鎮痛薬',
  },
  {
    name: 'イブプロフェン',
    nameEn: 'Ibuprofen',
    casNumber: '15687-27-1',
    deltaD: 17.6, deltaP: 5.2, deltaH: 8.0, r0: 6.0,
    molWeight: 206.28, logP: 3.97,
    therapeuticCategory: '鎮痛薬',
    notes: 'Abbott & Hansen 2010; NSAIDs',
  },
  {
    name: 'アスピリン',
    nameEn: 'Aspirin',
    casNumber: '50-78-2',
    deltaD: 18.1, deltaP: 7.3, deltaH: 9.5, r0: 5.5,
    molWeight: 180.16, logP: 1.19,
    therapeuticCategory: '鎮痛薬',
    notes: 'HSPiP database',
  },
  {
    name: 'カフェイン',
    nameEn: 'Caffeine',
    casNumber: '58-08-2',
    deltaD: 19.5, deltaP: 10.1, deltaH: 13.8, r0: 5.0,
    molWeight: 194.19, logP: -0.07,
    therapeuticCategory: '中枢神経刺激薬',
    notes: 'HSPiP database',
  },
  {
    name: 'インドメタシン',
    nameEn: 'Indomethacin',
    casNumber: '53-86-1',
    deltaD: 19.0, deltaP: 10.2, deltaH: 8.0, r0: 6.5,
    molWeight: 357.79, logP: 4.27,
    therapeuticCategory: '抗炎症薬',
    notes: 'Gharagheizi et al. 2008; NSAIDs',
  },
  {
    name: 'ナプロキセン',
    nameEn: 'Naproxen',
    casNumber: '22204-53-1',
    deltaD: 18.8, deltaP: 6.4, deltaH: 10.2, r0: 5.5,
    molWeight: 230.26, logP: 3.18,
    therapeuticCategory: '鎮痛薬',
    notes: 'HSPiP database; NSAIDs',
  },
  {
    name: 'ニフェジピン',
    nameEn: 'Nifedipine',
    casNumber: '21829-25-4',
    deltaD: 19.6, deltaP: 7.8, deltaH: 6.5, r0: 6.0,
    molWeight: 346.33, logP: 2.20,
    therapeuticCategory: '降圧薬',
    notes: 'HSPiP database; Ca拮抗薬',
  },
  {
    name: 'グリセオフルビン',
    nameEn: 'Griseofulvin',
    casNumber: '126-07-8',
    deltaD: 18.5, deltaP: 8.7, deltaH: 10.2, r0: 5.5,
    molWeight: 352.77, logP: 2.18,
    therapeuticCategory: '抗真菌薬',
    notes: 'Abbott & Hansen 2010',
  },
  {
    name: 'ピロキシカム',
    nameEn: 'Piroxicam',
    casNumber: '36322-90-4',
    deltaD: 20.1, deltaP: 11.5, deltaH: 9.8, r0: 5.0,
    molWeight: 331.35, logP: 3.06,
    therapeuticCategory: '抗炎症薬',
    notes: 'HSPiP database; NSAIDs',
  },
  {
    name: 'フェナセチン',
    nameEn: 'Phenacetin',
    casNumber: '62-44-2',
    deltaD: 17.5, deltaP: 8.5, deltaH: 11.0, r0: 5.5,
    molWeight: 179.22, logP: 1.58,
    therapeuticCategory: '鎮痛薬',
    notes: 'HSPiP database',
  },
  {
    name: 'ケトプロフェン',
    nameEn: 'Ketoprofen',
    casNumber: '22071-15-4',
    deltaD: 18.2, deltaP: 6.8, deltaH: 9.0, r0: 5.5,
    molWeight: 254.28, logP: 3.12,
    therapeuticCategory: '鎮痛薬',
    notes: 'HSPiP database; NSAIDs',
  },
  {
    name: 'スルファメトキサゾール',
    nameEn: 'Sulfamethoxazole',
    casNumber: '723-46-6',
    deltaD: 19.0, deltaP: 12.5, deltaH: 11.0, r0: 5.0,
    molWeight: 253.28, logP: 0.89,
    therapeuticCategory: '抗菌薬',
    notes: 'Gharagheizi et al. 2008; サルファ剤',
  },
  {
    name: 'カルバマゼピン',
    nameEn: 'Carbamazepine',
    casNumber: '298-46-4',
    deltaD: 19.8, deltaP: 8.5, deltaH: 7.2, r0: 6.0,
    molWeight: 236.27, logP: 2.45,
    therapeuticCategory: '抗てんかん薬',
    notes: 'HSPiP database',
  },
  {
    name: 'フェニトイン',
    nameEn: 'Phenytoin',
    casNumber: '57-41-0',
    deltaD: 20.5, deltaP: 9.0, deltaH: 8.5, r0: 5.5,
    molWeight: 252.27, logP: 2.47,
    therapeuticCategory: '抗てんかん薬',
    notes: 'HSPiP database',
  },
  {
    name: 'テオフィリン',
    nameEn: 'Theophylline',
    casNumber: '58-55-9',
    deltaD: 19.0, deltaP: 11.0, deltaH: 14.0, r0: 5.0,
    molWeight: 180.16, logP: -0.02,
    therapeuticCategory: '気管支拡張薬',
    notes: 'HSPiP database; キサンチン誘導体',
  },
];

/**
 * 薬物シードデータをDBに投入する（重複防止）
 */
export function seedDrugs(db: Database.Database): void {
  const count = db.prepare('SELECT COUNT(*) as cnt FROM drugs').get() as { cnt: number };
  if (count.cnt > 0) return;

  const stmt = db.prepare(
    'INSERT INTO drugs (name, name_en, cas_number, delta_d, delta_p, delta_h, r0, mol_weight, log_p, therapeutic_category, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
  );

  const insertAll = db.transaction(() => {
    for (const seed of DRUG_SEEDS) {
      stmt.run(
        seed.name,
        seed.nameEn ?? null,
        seed.casNumber ?? null,
        seed.deltaD,
        seed.deltaP,
        seed.deltaH,
        seed.r0,
        seed.molWeight ?? null,
        seed.logP ?? null,
        seed.therapeuticCategory ?? null,
        seed.notes ?? null,
      );
    }
  });

  insertAll();
}
