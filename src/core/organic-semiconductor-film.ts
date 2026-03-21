/**
 * 有機半導体薄膜形成
 *
 * RED小 + 高沸点 → 均一膜形成（ゆっくり蒸発が良い）
 * FilmFormationLevel: Excellent / Good / Moderate / Poor
 */
import type { HSPValues } from './types';
import { calculateRa, calculateRed } from './hsp';

/** 薄膜形成レベル */
export enum FilmFormationLevel {
  Excellent = 'Excellent',
  Good = 'Good',
  Moderate = 'Moderate',
  Poor = 'Poor',
}

/** 薄膜形成レベル情報 */
export interface FilmFormationLevelInfo {
  level: FilmFormationLevel;
  label: string;
  description: string;
  color: string;
}

const FILM_FORMATION_INFO: Record<FilmFormationLevel, FilmFormationLevelInfo> = {
  [FilmFormationLevel.Excellent]: {
    level: FilmFormationLevel.Excellent,
    label: '優秀',
    description: '高溶解性＋高沸点で均一な薄膜形成が期待できる',
    color: 'green',
  },
  [FilmFormationLevel.Good]: {
    level: FilmFormationLevel.Good,
    label: '良好',
    description: '良好な薄膜形成が期待できる',
    color: 'blue',
  },
  [FilmFormationLevel.Moderate]: {
    level: FilmFormationLevel.Moderate,
    label: '中程度',
    description: '条件最適化により薄膜形成可能',
    color: 'yellow',
  },
  [FilmFormationLevel.Poor]: {
    level: FilmFormationLevel.Poor,
    label: '不良',
    description: '均一な薄膜形成は困難',
    color: 'red',
  },
};

/** 有機半導体薄膜溶媒スクリーニング結果（個別） */
export interface OSCSolventResult {
  solvent: { name: string; hsp: HSPValues; boilingPoint: number | null };
  ra: number;
  red: number;
  filmFormation: FilmFormationLevel;
}

/**
 * RED値と沸点から薄膜形成レベルを判定する
 *
 * RED < 0.8 & bp >= 150°C → Excellent
 * RED < 1.0 & bp >= 130°C → Good
 * RED < 1.2 → Moderate
 * それ以外 → Poor
 */
export function classifyFilmFormation(red: number, boilingPoint: number | null): FilmFormationLevel {
  if (red < 0) throw new Error('RED値は非負でなければなりません');
  const bp = boilingPoint ?? 0;
  if (red < 0.8 && bp >= 150) return FilmFormationLevel.Excellent;
  if (red < 1.0 && bp >= 130) return FilmFormationLevel.Good;
  if (red < 1.2) return FilmFormationLevel.Moderate;
  return FilmFormationLevel.Poor;
}

/**
 * 薄膜形成レベルの表示情報を取得する
 */
export function getFilmFormationLevelInfo(level: FilmFormationLevel): FilmFormationLevelInfo {
  return FILM_FORMATION_INFO[level];
}

/**
 * 有機半導体に対する溶媒スクリーニング
 *
 * @param oscHSP - 有機半導体のHSP
 * @param oscR0 - 有機半導体の相互作用半径
 * @param solvents - 候補溶媒リスト（沸点情報含む）
 * @returns スクリーニング結果（RED昇順ソート）
 */
export function screenOSCSolvents(
  oscHSP: HSPValues,
  oscR0: number,
  solvents: Array<{ name: string; hsp: HSPValues; boilingPoint: number | null }>,
): OSCSolventResult[] {
  const results: OSCSolventResult[] = solvents.map((solvent) => {
    const ra = calculateRa(oscHSP, solvent.hsp);
    const red = calculateRed(oscHSP, solvent.hsp, oscR0);
    const filmFormation = classifyFilmFormation(red, solvent.boilingPoint);
    return {
      solvent: { name: solvent.name, hsp: solvent.hsp, boilingPoint: solvent.boilingPoint },
      ra,
      red,
      filmFormation,
    };
  });

  results.sort((a, b) => a.red - b.red);
  return results;
}
