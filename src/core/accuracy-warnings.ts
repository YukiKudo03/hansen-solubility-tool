/**
 * 推定精度の既知の限界に基づく警告メッセージ生成
 *
 * 文献値再現テスト（147件）で発見された系統的偏差をユーザーに通知する。
 * 計算ロジックのバグではなく、Nakamoto-Yamamoto式およびHSP距離計算の理論的限界。
 */

import type { ContactAngleResult, SolventDispersibilityResult, NanoParticle } from './types';

/** δH > 14 かつ δP > 5 のアルコール的HSPプロファイル */
function isAlcoholProfile(deltaP: number, deltaH: number): boolean {
  return deltaH > 14 && deltaP > 5;
}

/** δH > 20 かつ δP > 10 のグリコール/グリセリン的HSPプロファイル */
function isPolyolProfile(deltaP: number, deltaH: number): boolean {
  return deltaH > 20 && deltaP > 10;
}

/** 水の判定: δH > 35（水のδH≈42.3、他の一般溶媒でδH>35はない） */
function isWater(deltaH: number): boolean {
  return deltaH > 35;
}

/** 親水性ポリマー: δP > 8 かつ δH > 6 */
function isHydrophilicPolymer(deltaP: number, deltaH: number): boolean {
  return deltaP > 8 && deltaH > 6;
}

/**
 * 接触角推定結果に対する警告を生成
 */
export function getContactAngleWarnings(results: ContactAngleResult[]): string[] {
  const warnings: string[] = [];

  const hasAlcohol = results.some((r) =>
    isAlcoholProfile(r.solvent.hsp.deltaP, r.solvent.hsp.deltaH)
  );
  const hasPolyol = results.some((r) =>
    isPolyolProfile(r.solvent.hsp.deltaP, r.solvent.hsp.deltaH)
  );
  const hasHydrophilicPolymerWithWater = results.some(
    (r) =>
      isHydrophilicPolymer(r.part.hsp.deltaP, r.part.hsp.deltaH) &&
      isWater(r.solvent.hsp.deltaH)
  );

  if (hasAlcohol) {
    warnings.push(
      'アルコール類の表面張力は過大評価される傾向があります（実測との差: 最大+13 mN/m）'
    );
  }
  if (hasPolyol) {
    warnings.push(
      '多価アルコール/グリコール類の表面張力は過小評価される傾向があります（実測との差: 最大−10 mN/m）'
    );
  }
  if (hasHydrophilicPolymerWithWater) {
    warnings.push(
      '親水性ポリマー（高δP/δH）の水に対する接触角は過大推定される傾向があります（実測との差: 最大+17°）'
    );
  }

  return warnings;
}

/**
 * ナノ分散評価結果に対する警告を生成
 */
export function getDispersionWarnings(results: SolventDispersibilityResult[]): string[] {
  return getRedBoundaryWarnings(results.map((r) => ({ red: r.red, name: r.solvent.name })));
}

/**
 * RED境界付近（0.8〜1.2）の結果に対する汎用警告を生成
 */
export function getRedBoundaryWarnings(
  results: { red: number; name: string }[]
): string[] {
  const boundaryResults = results.filter((r) => r.red >= 0.8 && r.red <= 1.2);
  if (boundaryResults.length === 0) return [];

  return [
    'RED値が0.8〜1.2の範囲にある結果はHansen球の境界付近です。R₀の設定値によって判定が変わる可能性があります',
  ];
}

/**
 * ナノ粒子の表面修飾・粒子径に関する精度警告を生成
 */
export function getNanoParticleModificationWarnings(particle: NanoParticle): string[] {
  const warnings: string[] = [];

  if (particle.surfaceLigand) {
    warnings.push(
      `表面修飾（${particle.surfaceLigand}）を持つナノ粒子のHSP値は修飾条件に依存します。相互作用半径R₀は文献間で±1.0程度のばらつきがあり、RED≈1.0付近の判定には注意が必要です`,
    );
  }

  if (particle.particleSize !== null && particle.particleSize < 5) {
    warnings.push(
      `粒子径 ${particle.particleSize} nm は量子サイズ効果が表れる領域です。バルクHSP値との乖離が生じる可能性があります`,
    );
  }

  return warnings;
}

/**
 * 分散剤選定結果に対する警告を生成
 */
export function getDispersantSelectionWarnings(): string[] {
  return [
    'アンカー基・溶媒和鎖の分離HSP値には推定値が含まれます。シードデータの出典をnotesで確認し、必要に応じてデータベースエディタで編集してください',
    '分散安定性にはHSP親和性以外の要因（電荷反発、立体効果、溶媒粘度、粒子サイズ・形状等）も影響します。HSPベースの評価は必要条件であり十分条件ではありません',
    '総合スコアは幾何平均√(RED_a×RED_s)で算出しています。片方のREDが極端に大きい場合は、max補正により総合判定が引き下げられます',
  ];
}
