/**
 * ナノ粒子シードデータ
 * 文献に基づくHSP値・物性データ
 *
 * 出典:
 * - Bergin et al. (ACS Nano, 2009) — CNT
 * - Hernandez et al. (Langmuir, 2010) — グラフェン
 * - Hansen (HSPiP) — C60
 * - PMC 9230637 (Nanomaterials, 2022) — Ag NP (OAm)
 * - Langmuir 2014 — Ag NP (デカン酸)
 * - Colloids Surf. A, 2021 — TiO₂
 * - J. Materiomics, 2018 — ZnO QD
 * - Ind. Eng. Chem. Res., 2012 — SiO₂, ZrO₂
 */
import Database from 'better-sqlite3';
import type { NanoParticleCategory } from '../core/types';

export interface NanoParticleSeed {
  name: string;
  nameEn?: string;
  category: NanoParticleCategory;
  coreMaterial: string;
  surfaceLigand?: string;
  deltaD: number;
  deltaP: number;
  deltaH: number;
  r0: number;
  particleSize?: number;
  notes?: string;
}

export const NANO_PARTICLE_SEEDS: NanoParticleSeed[] = [
  // --- カーボン系 ---
  {
    name: '単層カーボンナノチューブ (SWCNT)',
    nameEn: 'SWCNT (pristine)',
    category: 'carbon',
    coreMaterial: 'SWCNT',
    deltaD: 19.4, deltaP: 6.0, deltaH: 4.5, r0: 5.0,
    notes: 'Bergin et al. ACS Nano 2009; 高δDのため芳香族・塩素系溶媒と親和性が高い',
  },
  {
    name: '多層カーボンナノチューブ (MWCNT)',
    nameEn: 'MWCNT (pristine)',
    category: 'carbon',
    coreMaterial: 'MWCNT',
    deltaD: 16.0, deltaP: 10.0, deltaH: 8.5, r0: 6.0,
    notes: '文献値; SWCNTより極性・水素結合成分が大きい',
  },
  {
    name: 'グラフェン',
    nameEn: 'Graphene',
    category: 'carbon',
    coreMaterial: 'Graphene',
    deltaD: 18.0, deltaP: 9.3, deltaH: 7.7, r0: 5.5,
    notes: 'Hernandez et al. Langmuir 2010; NMP, DMF等が良溶媒',
  },
  {
    name: 'C60 フラーレン',
    nameEn: 'C60 Fullerene',
    category: 'carbon',
    coreMaterial: 'C60',
    deltaD: 19.7, deltaP: 2.9, deltaH: 2.7, r0: 4.0,
    particleSize: 0.7,
    notes: 'Hansen HSPiP; 低極性・低水素結合性',
  },
  {
    name: '酸化グラフェン (GO)',
    nameEn: 'Graphene Oxide',
    category: 'carbon',
    coreMaterial: 'GO',
    deltaD: 16.5, deltaP: 14.0, deltaH: 16.0, r0: 8.0,
    notes: '酸化処理により極性・水素結合成分が大幅に増加; 水系分散に適する',
  },

  // --- 金属ナノ粒子 ---
  {
    name: '銀ナノ粒子 (OAm)',
    nameEn: 'Ag NP (Oleylamine-capped)',
    category: 'metal',
    coreMaterial: 'Ag',
    surfaceLigand: 'オレイルアミン',
    deltaD: 16.5, deltaP: 2.7, deltaH: 0.01, r0: 4.8,
    particleSize: 5,
    notes: 'PMC 9230637; デカン(RED=0.64)が最良溶媒',
  },
  {
    name: '銀ナノ粒子 (デカン酸)',
    nameEn: 'Ag NP (Decanoic acid-capped)',
    category: 'metal',
    coreMaterial: 'Ag',
    surfaceLigand: 'デカン酸',
    deltaD: 16.0, deltaP: 3.5, deltaH: 4.0, r0: 5.0,
    particleSize: 5,
    notes: 'Langmuir 2014; 酸キャップにより水素結合成分が増加',
  },
  {
    name: '金ナノ粒子 (クエン酸)',
    nameEn: 'Au NP (Citrate-capped)',
    category: 'metal',
    coreMaterial: 'Au',
    surfaceLigand: 'クエン酸',
    deltaD: 15.5, deltaP: 12.0, deltaH: 18.0, r0: 7.0,
    particleSize: 15,
    notes: '水系コロイド; 極性・水素結合成分が非常に大きい',
  },
  {
    name: '銅ナノ粒子 (PVP)',
    nameEn: 'Cu NP (PVP-capped)',
    category: 'metal',
    coreMaterial: 'Cu',
    surfaceLigand: 'PVP',
    deltaD: 17.0, deltaP: 8.0, deltaH: 6.0, r0: 5.5,
    particleSize: 50,
    notes: 'PVP安定化; 極性溶媒に分散',
  },

  // --- 金属酸化物ナノ粒子 ---
  {
    name: '酸化チタン (TiO₂) 未修飾',
    nameEn: 'TiO2 NP (unmodified)',
    category: 'metal_oxide',
    coreMaterial: 'TiO₂',
    deltaD: 15.5, deltaP: 10.5, deltaH: 11.0, r0: 7.0,
    particleSize: 20,
    notes: 'Colloids Surf. A 2021; DLVO理論との併用が推奨される',
  },
  {
    name: '酸化亜鉛 (ZnO) 未修飾',
    nameEn: 'ZnO NP (unmodified)',
    category: 'metal_oxide',
    coreMaterial: 'ZnO',
    deltaD: 17.0, deltaP: 11.0, deltaH: 16.0, r0: 8.0,
    particleSize: 30,
    notes: 'J. Materiomics 2018; リガンドにより極性成分が大きく変動',
  },
  {
    name: 'シリカ (SiO₂) 未修飾',
    nameEn: 'SiO2 NP (unmodified)',
    category: 'metal_oxide',
    coreMaterial: 'SiO₂',
    deltaD: 15.0, deltaP: 12.0, deltaH: 14.0, r0: 7.5,
    particleSize: 30,
    notes: 'Ind. Eng. Chem. Res. 2012; 親水性表面',
  },
  {
    name: 'ジルコニア (ZrO₂) 酢酸修飾',
    nameEn: 'ZrO2 NC (Acetic acid-grafted)',
    category: 'metal_oxide',
    coreMaterial: 'ZrO₂',
    surfaceLigand: '酢酸',
    deltaD: 16.0, deltaP: 8.0, deltaH: 10.0, r0: 6.0,
    particleSize: 10,
    notes: 'J. Nanopart. Res. 2013; 短鎖修飾で極性溶媒に分散',
  },
  {
    name: 'ジルコニア (ZrO₂) オレイン酸修飾',
    nameEn: 'ZrO2 NC (Oleic acid-grafted)',
    category: 'metal_oxide',
    coreMaterial: 'ZrO₂',
    surfaceLigand: 'オレイン酸',
    deltaD: 16.5, deltaP: 3.0, deltaH: 3.5, r0: 5.0,
    particleSize: 10,
    notes: '長鎖修飾で非極性溶媒に分散; 酢酸修飾と比較対象',
  },
  {
    name: 'アルミナ (Al₂O₃) 未修飾',
    nameEn: 'Al2O3 NP (unmodified)',
    category: 'metal_oxide',
    coreMaterial: 'Al₂O₃',
    deltaD: 15.5, deltaP: 11.0, deltaH: 13.0, r0: 7.0,
    particleSize: 50,
    notes: '親水性表面; SiO₂と類似のHSPプロファイル',
  },

  // --- 量子ドット ---
  {
    name: '酸化亜鉛量子ドット (ZnO QD)',
    nameEn: 'ZnO Quantum Dot',
    category: 'quantum_dot',
    coreMaterial: 'ZnO',
    deltaD: 17.0, deltaP: 11.0, deltaH: 16.0, r0: 8.0,
    particleSize: 5,
    notes: 'J. Materiomics 2018; バルクZnO NPと同等のHSPだがサイズ効果あり',
  },
  {
    name: 'CdSe/ZnS QD (オレイン酸)',
    nameEn: 'CdSe/ZnS QD (Oleic acid-capped)',
    category: 'quantum_dot',
    coreMaterial: 'CdSe/ZnS',
    surfaceLigand: 'オレイン酸',
    deltaD: 16.5, deltaP: 3.5, deltaH: 4.0, r0: 5.0,
    particleSize: 6,
    notes: '非極性溶媒（トルエン、ヘキサン等）に良好に分散',
  },
];

/**
 * ナノ粒子のシードデータを投入する
 */
export function seedNanoParticles(db: Database.Database): void {
  const count = (db.prepare('SELECT COUNT(*) as cnt FROM nano_particles').get() as { cnt: number }).cnt;
  if (count > 0) return; // 既にデータがある場合はスキップ

  const insert = db.prepare(`
    INSERT INTO nano_particles (name, name_en, category, core_material, surface_ligand, delta_d, delta_p, delta_h, r0, particle_size, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertAll = db.transaction(() => {
    for (const np of NANO_PARTICLE_SEEDS) {
      insert.run(
        np.name,
        np.nameEn ?? null,
        np.category,
        np.coreMaterial,
        np.surfaceLigand ?? null,
        np.deltaD,
        np.deltaP,
        np.deltaH,
        np.r0,
        np.particleSize ?? null,
        np.notes ?? null,
      );
    }
  });

  insertAll();
}
