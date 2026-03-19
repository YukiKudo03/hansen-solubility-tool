/**
 * グリーン溶媒代替提案 — 規制対象溶媒の安全な代替候補をHSP距離でランク表示
 * REACH規制, CHEM21ガイド参照
 */
import type { Solvent } from './types';
import { calculateRa } from './hsp';

export type SafetyRating = 'recommended' | 'acceptable' | 'problematic' | 'hazardous' | 'banned';

export interface GreenSolventInfo {
  casNumber: string;
  safetyRating: SafetyRating;
  environmentalScore: number; // 1-10, 10=safest
  healthScore: number;        // 1-10, 10=safest
  isGreenAlternative: boolean;
}

export interface SubstitutionCandidate {
  solvent: Solvent;
  ra: number;           // HSP distance to target
  safetyInfo: GreenSolventInfo | null;
  overallScore: number; // composite score (lower=better)
}

export interface SubstitutionResult {
  targetSolvent: Solvent;
  candidates: SubstitutionCandidate[];
  evaluatedAt: Date;
}

/**
 * 一般的な溶媒の安全性データベース（CAS番号をキーとする）
 * CHEM21ガイドおよびREACH規制を参照
 */
export const GREEN_SOLVENT_DATABASE: Record<string, GreenSolventInfo> = {
  // ── recommended（推奨）──────────────────────────
  // 水
  '7732-18-5': {
    casNumber: '7732-18-5',
    safetyRating: 'recommended',
    environmentalScore: 10,
    healthScore: 10,
    isGreenAlternative: true,
  },
  // エタノール
  '64-17-5': {
    casNumber: '64-17-5',
    safetyRating: 'recommended',
    environmentalScore: 9,
    healthScore: 9,
    isGreenAlternative: true,
  },
  // イソプロパノール (2-プロパノール)
  '67-63-0': {
    casNumber: '67-63-0',
    safetyRating: 'recommended',
    environmentalScore: 8,
    healthScore: 8,
    isGreenAlternative: true,
  },
  // 酢酸エチル
  '141-78-6': {
    casNumber: '141-78-6',
    safetyRating: 'recommended',
    environmentalScore: 8,
    healthScore: 8,
    isGreenAlternative: true,
  },
  // アセトン
  '67-64-1': {
    casNumber: '67-64-1',
    safetyRating: 'recommended',
    environmentalScore: 8,
    healthScore: 8,
    isGreenAlternative: true,
  },
  // 2-メチルテトラヒドロフラン (2-MeTHF)
  '96-47-9': {
    casNumber: '96-47-9',
    safetyRating: 'recommended',
    environmentalScore: 8,
    healthScore: 8,
    isGreenAlternative: true,
  },
  // シクロペンチルメチルエーテル (CPME)
  '5614-37-9': {
    casNumber: '5614-37-9',
    safetyRating: 'recommended',
    environmentalScore: 8,
    healthScore: 7,
    isGreenAlternative: true,
  },
  // アニソール
  '100-66-3': {
    casNumber: '100-66-3',
    safetyRating: 'recommended',
    environmentalScore: 7,
    healthScore: 7,
    isGreenAlternative: true,
  },
  // ジメチルカーボネート
  '616-38-6': {
    casNumber: '616-38-6',
    safetyRating: 'recommended',
    environmentalScore: 9,
    healthScore: 8,
    isGreenAlternative: true,
  },
  // 1-ブタノール
  '71-36-3': {
    casNumber: '71-36-3',
    safetyRating: 'recommended',
    environmentalScore: 7,
    healthScore: 7,
    isGreenAlternative: true,
  },
  // メタノール
  '67-56-1': {
    casNumber: '67-56-1',
    safetyRating: 'recommended',
    environmentalScore: 7,
    healthScore: 6,
    isGreenAlternative: true,
  },
  // 酢酸ブチル
  '123-86-4': {
    casNumber: '123-86-4',
    safetyRating: 'recommended',
    environmentalScore: 7,
    healthScore: 7,
    isGreenAlternative: true,
  },
  // プロピレングリコール
  '57-55-6': {
    casNumber: '57-55-6',
    safetyRating: 'recommended',
    environmentalScore: 8,
    healthScore: 9,
    isGreenAlternative: true,
  },
  // γ-バレロラクトン (GVL)
  '108-29-2': {
    casNumber: '108-29-2',
    safetyRating: 'recommended',
    environmentalScore: 9,
    healthScore: 7,
    isGreenAlternative: true,
  },

  // ── acceptable（許容）──────────────────────────
  // トルエン
  '108-88-3': {
    casNumber: '108-88-3',
    safetyRating: 'acceptable',
    environmentalScore: 5,
    healthScore: 5,
    isGreenAlternative: false,
  },
  // ヘキサン
  '110-54-3': {
    casNumber: '110-54-3',
    safetyRating: 'acceptable',
    environmentalScore: 4,
    healthScore: 4,
    isGreenAlternative: false,
  },
  // メチルエチルケトン (MEK)
  '78-93-3': {
    casNumber: '78-93-3',
    safetyRating: 'acceptable',
    environmentalScore: 6,
    healthScore: 6,
    isGreenAlternative: false,
  },
  // ヘプタン
  '142-82-5': {
    casNumber: '142-82-5',
    safetyRating: 'acceptable',
    environmentalScore: 4,
    healthScore: 5,
    isGreenAlternative: false,
  },
  // キシレン
  '1330-20-7': {
    casNumber: '1330-20-7',
    safetyRating: 'acceptable',
    environmentalScore: 4,
    healthScore: 5,
    isGreenAlternative: false,
  },
  // DMSO (ジメチルスルホキシド)
  '67-68-5': {
    casNumber: '67-68-5',
    safetyRating: 'acceptable',
    environmentalScore: 7,
    healthScore: 6,
    isGreenAlternative: false,
  },
  // アセトニトリル
  '75-05-8': {
    casNumber: '75-05-8',
    safetyRating: 'acceptable',
    environmentalScore: 5,
    healthScore: 5,
    isGreenAlternative: false,
  },

  // ── problematic（問題あり）──────────────────────────
  // ジクロロメタン (DCM)
  '75-09-2': {
    casNumber: '75-09-2',
    safetyRating: 'problematic',
    environmentalScore: 3,
    healthScore: 3,
    isGreenAlternative: false,
  },
  // クロロホルム
  '67-66-3': {
    casNumber: '67-66-3',
    safetyRating: 'problematic',
    environmentalScore: 2,
    healthScore: 3,
    isGreenAlternative: false,
  },
  // N,N-ジメチルホルムアミド (DMF)
  '68-12-2': {
    casNumber: '68-12-2',
    safetyRating: 'problematic',
    environmentalScore: 3,
    healthScore: 2,
    isGreenAlternative: false,
  },
  // N-メチル-2-ピロリドン (NMP)
  '872-50-4': {
    casNumber: '872-50-4',
    safetyRating: 'problematic',
    environmentalScore: 3,
    healthScore: 2,
    isGreenAlternative: false,
  },
  // テトラヒドロフラン (THF)
  '109-99-9': {
    casNumber: '109-99-9',
    safetyRating: 'problematic',
    environmentalScore: 4,
    healthScore: 4,
    isGreenAlternative: false,
  },
  // 1,4-ジオキサン
  '123-91-1': {
    casNumber: '123-91-1',
    safetyRating: 'problematic',
    environmentalScore: 3,
    healthScore: 2,
    isGreenAlternative: false,
  },
  // ピリジン
  '110-86-1': {
    casNumber: '110-86-1',
    safetyRating: 'problematic',
    environmentalScore: 3,
    healthScore: 3,
    isGreenAlternative: false,
  },

  // ── hazardous（危険）──────────────────────────
  // ベンゼン
  '71-43-2': {
    casNumber: '71-43-2',
    safetyRating: 'hazardous',
    environmentalScore: 1,
    healthScore: 1,
    isGreenAlternative: false,
  },
  // 四塩化炭素
  '56-23-5': {
    casNumber: '56-23-5',
    safetyRating: 'hazardous',
    environmentalScore: 1,
    healthScore: 1,
    isGreenAlternative: false,
  },
  // 二硫化炭素
  '75-15-0': {
    casNumber: '75-15-0',
    safetyRating: 'hazardous',
    environmentalScore: 2,
    healthScore: 1,
    isGreenAlternative: false,
  },
};

/**
 * 溶媒のCAS番号からグリーン溶媒情報を取得する
 */
function lookupSafetyInfo(solvent: Solvent): GreenSolventInfo | null {
  if (solvent.casNumber == null) return null;
  return GREEN_SOLVENT_DATABASE[solvent.casNumber] ?? null;
}

/**
 * 総合スコアを計算する
 * overallScore = 0.6 * (ra / 10) + 0.2 * (1 - envScore/10) + 0.2 * (1 - healthScore/10)
 * 安全性データがない場合はenvScore=5, healthScore=5をデフォルトとする
 */
function computeOverallScore(ra: number, safetyInfo: GreenSolventInfo | null): number {
  const envScore = safetyInfo != null ? safetyInfo.environmentalScore : 5;
  const healthScore = safetyInfo != null ? safetyInfo.healthScore : 5;

  return 0.6 * (ra / 10) + 0.2 * (1 - envScore / 10) + 0.2 * (1 - healthScore / 10);
}

/**
 * 規制対象溶媒に対するグリーン代替候補を探索する
 *
 * @param target - 代替対象の溶媒
 * @param candidates - 候補溶媒リスト
 * @param maxResults - 返却する最大件数（デフォルト: 20）
 */
export function findGreenAlternatives(
  target: Solvent,
  candidates: Solvent[],
  maxResults: number = 20,
): SubstitutionResult {
  const results: SubstitutionCandidate[] = [];

  for (const candidate of candidates) {
    // ターゲット自身を除外（ID一致またはCAS番号一致）
    if (candidate.id === target.id) continue;
    if (
      candidate.casNumber != null &&
      target.casNumber != null &&
      candidate.casNumber === target.casNumber
    ) {
      continue;
    }

    const ra = calculateRa(target.hsp, candidate.hsp);
    const safetyInfo = lookupSafetyInfo(candidate);
    const overallScore = computeOverallScore(ra, safetyInfo);

    results.push({
      solvent: candidate,
      ra,
      safetyInfo,
      overallScore,
    });
  }

  // overallScore昇順でソート
  results.sort((a, b) => a.overallScore - b.overallScore);

  return {
    targetSolvent: target,
    candidates: results.slice(0, maxResults),
    evaluatedAt: new Date(),
  };
}
