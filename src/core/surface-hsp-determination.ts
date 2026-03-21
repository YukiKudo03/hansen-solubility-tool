/**
 * 表面HSP決定法
 *
 * 複数の試験液体の接触角データから、Owens-Wendt法 + HSP変換で
 * 表面のHSP値を逆算する。
 *
 * 手法:
 * 1. 各液体のHSPから表面エネルギー成分(gammaD, gammaP, gammaH)を推算
 * 2. 接触角からYoung-Dupré式でWaを算出: Wa = gammaLV * (1 + cos(theta))
 * 3. 最小二乗法で固体表面のgammaD_s, gammaP_s, gammaH_sを推定
 * 4. 逆変換でHSP値を算出
 */
import type { HSPValues } from './types';
import { hspToSurfaceEnergyComponents } from './work-of-adhesion';

/** 試験液体入力 */
export interface ContactAngleTestInput {
  liquidName: string;
  liquidHSP: HSPValues;
  contactAngleDeg: number; // 接触角 [°]
}

/** 表面HSP決定結果 */
export interface SurfaceHSPDeterminationResult {
  surfaceHSP: HSPValues;
  surfaceEnergy: { gammaD: number; gammaP: number; gammaH: number; gammaTotal: number };
  numDataPoints: number;
  residualError: number; // フィッティング残差
  evaluatedAt: Date;
}

/**
 * 表面エネルギー成分からHSPを逆算する
 * gammaD = 0.0947 * deltaD^2 → deltaD = sqrt(gammaD / 0.0947)
 */
function surfaceEnergyToHSP(gammaD: number, gammaP: number, gammaH: number): HSPValues {
  return {
    deltaD: Math.sqrt(Math.max(0, gammaD) / 0.0947),
    deltaP: Math.sqrt(Math.max(0, gammaP) / 0.0315),
    deltaH: Math.sqrt(Math.max(0, gammaH) / 0.0238),
  };
}

/**
 * 接触角データから表面HSPを推定する
 *
 * @param testData - 各試験液体の接触角データ（最低3つ推奨）
 * @returns 推定された表面HSP
 */
export function estimateSurfaceHSPFromContactAngles(
  testData: ContactAngleTestInput[],
): SurfaceHSPDeterminationResult {
  if (testData.length === 0) {
    return {
      surfaceHSP: { deltaD: 0, deltaP: 0, deltaH: 0 },
      surfaceEnergy: { gammaD: 0, gammaP: 0, gammaH: 0, gammaTotal: 0 },
      numDataPoints: 0,
      residualError: 0,
      evaluatedAt: new Date(),
    };
  }

  // 各液体の表面エネルギー成分と接着仕事を計算
  const dataPoints: Array<{
    sqrtGammaDL: number;
    sqrtGammaPL: number;
    sqrtGammaHL: number;
    waHalf: number; // Wa / 2
  }> = [];

  for (const test of testData) {
    const seL = hspToSurfaceEnergyComponents(test.liquidHSP);
    const gammaLV = seL.gammaTotal;
    if (gammaLV <= 0) continue;

    const thetaRad = (test.contactAngleDeg * Math.PI) / 180;
    const wa = gammaLV * (1 + Math.cos(thetaRad));

    dataPoints.push({
      sqrtGammaDL: Math.sqrt(seL.gammaD),
      sqrtGammaPL: Math.sqrt(seL.gammaP),
      sqrtGammaHL: Math.sqrt(seL.gammaH),
      waHalf: wa / 2,
    });
  }

  if (dataPoints.length === 0) {
    return {
      surfaceHSP: { deltaD: 0, deltaP: 0, deltaH: 0 },
      surfaceEnergy: { gammaD: 0, gammaP: 0, gammaH: 0, gammaTotal: 0 },
      numDataPoints: 0,
      residualError: 0,
      evaluatedAt: new Date(),
    };
  }

  // 最小二乗法: Wa/2 = sqrt(gammaD_s*gammaD_L) + sqrt(gammaP_s*gammaP_L) + sqrt(gammaH_s*gammaH_L)
  // 変数: x = sqrt(gammaD_s), y = sqrt(gammaP_s), z = sqrt(gammaH_s)
  // Wa/2 = x*sqrtGammaDL + y*sqrtGammaPL + z*sqrtGammaHL
  // → 通常最小二乗法 (A^T A) x = A^T b

  const n = dataPoints.length;

  // A^T A (3x3) と A^T b (3x1) を構築
  let ata00 = 0, ata01 = 0, ata02 = 0;
  let ata11 = 0, ata12 = 0, ata22 = 0;
  let atb0 = 0, atb1 = 0, atb2 = 0;

  for (const dp of dataPoints) {
    const a = dp.sqrtGammaDL, b = dp.sqrtGammaPL, c = dp.sqrtGammaHL;
    const y = dp.waHalf;
    ata00 += a * a; ata01 += a * b; ata02 += a * c;
    ata11 += b * b; ata12 += b * c; ata22 += c * c;
    atb0 += a * y; atb1 += b * y; atb2 += c * y;
  }

  // 3x3連立方程式をクラメルの公式で解く
  const det =
    ata00 * (ata11 * ata22 - ata12 * ata12) -
    ata01 * (ata01 * ata22 - ata12 * ata02) +
    ata02 * (ata01 * ata12 - ata11 * ata02);

  let sqrtGammaDS: number, sqrtGammaPS: number, sqrtGammaHS: number;

  if (Math.abs(det) < 1e-12) {
    // 特異行列の場合、各成分を個別に推定
    sqrtGammaDS = ata00 > 0 ? atb0 / ata00 : 0;
    sqrtGammaPS = ata11 > 0 ? atb1 / ata11 : 0;
    sqrtGammaHS = ata22 > 0 ? atb2 / ata22 : 0;
  } else {
    sqrtGammaDS = (
      atb0 * (ata11 * ata22 - ata12 * ata12) -
      ata01 * (atb1 * ata22 - ata12 * atb2) +
      ata02 * (atb1 * ata12 - ata11 * atb2)
    ) / det;

    sqrtGammaPS = (
      ata00 * (atb1 * ata22 - ata12 * atb2) -
      atb0 * (ata01 * ata22 - ata12 * ata02) +
      ata02 * (ata01 * atb2 - atb1 * ata02)
    ) / det;

    sqrtGammaHS = (
      ata00 * (ata11 * atb2 - atb1 * ata12) -
      ata01 * (ata01 * atb2 - atb1 * ata02) +
      atb0 * (ata01 * ata12 - ata11 * ata02)
    ) / det;
  }

  // 非負制約
  sqrtGammaDS = Math.max(0, sqrtGammaDS);
  sqrtGammaPS = Math.max(0, sqrtGammaPS);
  sqrtGammaHS = Math.max(0, sqrtGammaHS);

  const gammaD = sqrtGammaDS * sqrtGammaDS;
  const gammaP = sqrtGammaPS * sqrtGammaPS;
  const gammaH = sqrtGammaHS * sqrtGammaHS;
  const gammaTotal = gammaD + gammaP + gammaH;

  // 残差計算
  let residual = 0;
  for (const dp of dataPoints) {
    const predicted = sqrtGammaDS * dp.sqrtGammaDL + sqrtGammaPS * dp.sqrtGammaPL + sqrtGammaHS * dp.sqrtGammaHL;
    const diff = predicted - dp.waHalf;
    residual += diff * diff;
  }
  residual = Math.sqrt(residual / n);

  const surfaceHSP = surfaceEnergyToHSP(gammaD, gammaP, gammaH);

  return {
    surfaceHSP,
    surfaceEnergy: { gammaD, gammaP, gammaH, gammaTotal },
    numDataPoints: n,
    residualError: residual,
    evaluatedAt: new Date(),
  };
}
