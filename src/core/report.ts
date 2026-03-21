/**
 * CSV レポート生成
 * BOM付きUTF-8でExcelでの文字化けを防止
 */
import type { GroupEvaluationResult, NanoDispersionEvaluationResult, GroupContactAngleResult, GroupSwellingResult, DrugSolubilityScreeningResult, BlendOptimizationResult, GroupChemicalResistanceResult, PlasticizerEvaluationResult, CarrierEvaluationResult, DispersantEvaluationResult } from './types';
import { getRiskLevelInfo } from './risk';
import { getDispersibilityLevelInfo } from './dispersibility';
import { getWettabilityLevelInfo } from './wettability';
import { getSwellingLevelInfo } from './swelling';
import { getDrugSolubilityLevelInfo } from './drug-solubility';
import { getChemicalResistanceLevelInfo } from './chemical-resistance';
import { getPlasticizerCompatibilityLevelInfo } from './plasticizer';
import { getCarrierCompatibilityLevelInfo } from './carrier-selection';
import { getDispersantAffinityLevelInfo } from './dispersant-selection';
import type { ESCScreeningResult } from './esc-pipeline';
import { ESCRiskLevel, getESCRiskLevelInfo } from './esc-classification';
import type { CocrystalScreeningResult } from './cocrystal-screening';
import { CocrystalLikelihood } from './cocrystal-screening';
import type { SmoothingScreeningResult } from './printing3d-smoothing';
import { SmoothingEffectLevel } from './printing3d-smoothing';
import type { DielectricScreeningResult } from './dielectric-film';
import { FilmQualityLevel } from './dielectric-film';
import type { ExcipientResult } from './excipient-compatibility';
import { CompatibilityLevel } from './excipient-compatibility';

/** CSVフィールドをエスケープする（カンマ・引用符・改行を含む場合） */
function escapeCsvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** 数値を小数点以下3桁で丸める */
function round3(value: number): string {
  return value.toFixed(3);
}

/**
 * 評価結果をCSV文字列に変換する
 * @returns BOM付きUTF-8 CSV文字列
 */
export function formatCsv(result: GroupEvaluationResult): string {
  const BOM = '\uFEFF';
  const headers = [
    '部品グループ',
    '部品名',
    '材料種別',
    '部品 δD',
    '部品 δP',
    '部品 δH',
    '部品 R₀',
    '溶媒名',
    '溶媒 δD',
    '溶媒 δP',
    '溶媒 δH',
    '溶媒 沸点(°C)',
    '溶媒 粘度(mPa·s)',
    '溶媒 比重',
    '溶媒 表面張力(mN/m)',
    'Ra',
    'RED',
    'リスクレベル',
    'リスク判定',
    '評価日時',
  ];

  const rows = result.results.map((r) => {
    const info = getRiskLevelInfo(r.riskLevel);
    return [
      escapeCsvField(result.partsGroup.name),
      escapeCsvField(r.part.name),
      escapeCsvField(r.part.materialType ?? ''),
      round3(r.part.hsp.deltaD),
      round3(r.part.hsp.deltaP),
      round3(r.part.hsp.deltaH),
      round3(r.part.r0),
      escapeCsvField(r.solvent.name),
      round3(r.solvent.hsp.deltaD),
      round3(r.solvent.hsp.deltaP),
      round3(r.solvent.hsp.deltaH),
      r.solvent.boilingPoint?.toFixed(1) ?? '',
      r.solvent.viscosity?.toFixed(2) ?? '',
      r.solvent.specificGravity?.toFixed(3) ?? '',
      r.solvent.surfaceTension?.toFixed(1) ?? '',
      round3(r.ra),
      round3(r.red),
      `Level ${r.riskLevel}`,
      escapeCsvField(`${info.label}（${info.description}）`),
      result.evaluatedAt.toISOString(),
    ].join(',');
  });

  return BOM + [headers.join(','), ...rows].join('\r\n') + '\r\n';
}

/**
 * ナノ粒子分散評価結果をCSV文字列に変換する
 * @returns BOM付きUTF-8 CSV文字列
 */
export function formatNanoDispersionCsv(result: NanoDispersionEvaluationResult): string {
  const BOM = '\uFEFF';
  const headers = [
    'ナノ粒子名',
    'カテゴリ',
    '母材',
    '表面修飾剤',
    '粒子径(nm)',
    '粒子 δD',
    '粒子 δP',
    '粒子 δH',
    '粒子 R₀',
    '溶媒名',
    '溶媒 δD',
    '溶媒 δP',
    '溶媒 δH',
    '溶媒 沸点(°C)',
    '溶媒 粘度(mPa·s)',
    '溶媒 比重',
    '溶媒 表面張力(mN/m)',
    'Ra',
    'RED',
    '分散性レベル',
    '分散性判定',
    '評価日時',
  ];

  const rows = result.results.map((r) => {
    const info = getDispersibilityLevelInfo(r.dispersibility);
    const np = r.nanoParticle;
    return [
      escapeCsvField(np.name),
      escapeCsvField(np.category),
      escapeCsvField(np.coreMaterial),
      escapeCsvField(np.surfaceLigand ?? ''),
      np.particleSize?.toFixed(1) ?? '',
      round3(np.hsp.deltaD),
      round3(np.hsp.deltaP),
      round3(np.hsp.deltaH),
      round3(np.r0),
      escapeCsvField(r.solvent.name),
      round3(r.solvent.hsp.deltaD),
      round3(r.solvent.hsp.deltaP),
      round3(r.solvent.hsp.deltaH),
      r.solvent.boilingPoint?.toFixed(1) ?? '',
      r.solvent.viscosity?.toFixed(2) ?? '',
      r.solvent.specificGravity?.toFixed(3) ?? '',
      r.solvent.surfaceTension?.toFixed(1) ?? '',
      round3(r.ra),
      round3(r.red),
      `Level ${r.dispersibility}`,
      escapeCsvField(`${info.label}（${info.description}）`),
      result.evaluatedAt.toISOString(),
    ].join(',');
  });

  return BOM + [headers.join(','), ...rows].join('\r\n') + '\r\n';
}

/**
 * 接触角推定結果をCSV文字列に変換する
 * @returns BOM付きUTF-8 CSV文字列
 */
export function formatContactAngleCsv(result: GroupContactAngleResult): string {
  const BOM = '\uFEFF';
  const headers = [
    '部品グループ',
    '部品名',
    '材料種別',
    '部品 δD',
    '部品 δP',
    '部品 δH',
    '溶媒名',
    '溶媒 δD',
    '溶媒 δP',
    '溶媒 δH',
    'γ_LV(mN/m)',
    'γ_SV(mN/m)',
    'γ_SL(mN/m)',
    'cos(θ)',
    '接触角(°)',
    '濡れ性レベル',
    '濡れ性判定',
    '評価日時',
  ];

  const rows = result.results.map((r) => {
    const info = getWettabilityLevelInfo(r.wettability);
    return [
      escapeCsvField(result.partsGroup.name),
      escapeCsvField(r.part.name),
      escapeCsvField(r.part.materialType ?? ''),
      round3(r.part.hsp.deltaD),
      round3(r.part.hsp.deltaP),
      round3(r.part.hsp.deltaH),
      escapeCsvField(r.solvent.name),
      round3(r.solvent.hsp.deltaD),
      round3(r.solvent.hsp.deltaP),
      round3(r.solvent.hsp.deltaH),
      round3(r.surfaceTensionLV),
      round3(r.surfaceEnergySV),
      round3(r.interfacialTension),
      r.cosTheta.toFixed(4),
      r.contactAngle.toFixed(1),
      `Level ${r.wettability}`,
      escapeCsvField(`${info.label}（${info.description}）`),
      result.evaluatedAt.toISOString(),
    ].join(',');
  });

  return BOM + [headers.join(','), ...rows].join('\r\n') + '\r\n';
}

/**
 * 膨潤度予測結果をCSV文字列に変換する
 * @returns BOM付きUTF-8 CSV文字列
 */
export function formatSwellingCsv(result: GroupSwellingResult): string {
  const BOM = '\uFEFF';
  const headers = [
    '部品グループ',
    '部品名',
    '材料種別',
    '部品 δD',
    '部品 δP',
    '部品 δH',
    '部品 R₀',
    '溶媒名',
    '溶媒 δD',
    '溶媒 δP',
    '溶媒 δH',
    'Ra',
    'RED',
    '膨潤レベル',
    '膨潤判定',
    '評価日時',
  ];

  const rows = result.results.map((r) => {
    const info = getSwellingLevelInfo(r.swellingLevel);
    return [
      escapeCsvField(result.partsGroup.name),
      escapeCsvField(r.part.name),
      escapeCsvField(r.part.materialType ?? ''),
      round3(r.part.hsp.deltaD),
      round3(r.part.hsp.deltaP),
      round3(r.part.hsp.deltaH),
      round3(r.part.r0),
      escapeCsvField(r.solvent.name),
      round3(r.solvent.hsp.deltaD),
      round3(r.solvent.hsp.deltaP),
      round3(r.solvent.hsp.deltaH),
      round3(r.ra),
      round3(r.red),
      `Level ${r.swellingLevel}`,
      escapeCsvField(`${info.label}（${info.description}）`),
      result.evaluatedAt.toISOString(),
    ].join(',');
  });

  return BOM + [headers.join(','), ...rows].join('\r\n') + '\r\n';
}

/**
 * 薬物溶解性スクリーニング結果をCSV文字列に変換する
 * @returns BOM付きUTF-8 CSV文字列
 */
export function formatDrugSolubilityCsv(result: DrugSolubilityScreeningResult): string {
  const BOM = '\uFEFF';
  const headers = [
    '薬物名',
    '薬物 δD',
    '薬物 δP',
    '薬物 δH',
    '薬物 R₀',
    '治療カテゴリ',
    '溶媒名',
    '溶媒 δD',
    '溶媒 δP',
    '溶媒 δH',
    'Ra',
    'RED',
    '溶解性レベル',
    '溶解性判定',
    '評価日時',
  ];

  const rows = result.results.map((r) => {
    const info = getDrugSolubilityLevelInfo(r.solubility);
    return [
      escapeCsvField(r.drug.name),
      round3(r.drug.hsp.deltaD),
      round3(r.drug.hsp.deltaP),
      round3(r.drug.hsp.deltaH),
      round3(r.drug.r0),
      escapeCsvField(r.drug.therapeuticCategory ?? ''),
      escapeCsvField(r.solvent.name),
      round3(r.solvent.hsp.deltaD),
      round3(r.solvent.hsp.deltaP),
      round3(r.solvent.hsp.deltaH),
      round3(r.ra),
      round3(r.red),
      `Level ${r.solubility}`,
      escapeCsvField(`${info.label}（${info.description}）`),
      result.evaluatedAt.toISOString(),
    ].join(',');
  });

  return BOM + [headers.join(','), ...rows].join('\r\n') + '\r\n';
}

/**
 * 耐薬品性予測結果をCSV文字列に変換する
 * @returns BOM付きUTF-8 CSV文字列
 */
export function formatChemicalResistanceCsv(result: GroupChemicalResistanceResult): string {
  const BOM = '\uFEFF';
  const headers = [
    '部品グループ',
    '塗膜名',
    '材料種別',
    'δD',
    'δP',
    'δH',
    'R₀',
    '溶媒名',
    '溶媒 δD',
    '溶媒 δP',
    '溶媒 δH',
    'Ra',
    'RED',
    '耐薬品性レベル',
    '耐薬品性判定',
    '評価日時',
  ];

  const rows = result.results.map((r) => {
    const info = getChemicalResistanceLevelInfo(r.resistanceLevel);
    return [
      escapeCsvField(result.partsGroup.name),
      escapeCsvField(r.part.name),
      escapeCsvField(r.part.materialType ?? ''),
      round3(r.part.hsp.deltaD),
      round3(r.part.hsp.deltaP),
      round3(r.part.hsp.deltaH),
      round3(r.part.r0),
      escapeCsvField(r.solvent.name),
      round3(r.solvent.hsp.deltaD),
      round3(r.solvent.hsp.deltaP),
      round3(r.solvent.hsp.deltaH),
      round3(r.ra),
      round3(r.red),
      `Level ${r.resistanceLevel}`,
      escapeCsvField(`${info.label}（${info.description}）`),
      result.evaluatedAt.toISOString(),
    ].join(',');
  });

  return BOM + [headers.join(','), ...rows].join('\r\n') + '\r\n';
}

/**
 * 可塑剤スクリーニング結果をCSV文字列に変換する
 * @returns BOM付きUTF-8 CSV文字列
 */
export function formatPlasticizerCsv(result: PlasticizerEvaluationResult): string {
  const BOM = '\uFEFF';
  const headers = [
    'ポリマー名',
    'ポリマー δD',
    'ポリマー δP',
    'ポリマー δH',
    'ポリマー R₀',
    '可塑剤名',
    '可塑剤 δD',
    '可塑剤 δP',
    '可塑剤 δH',
    'Ra',
    'RED',
    '相溶性レベル',
    '相溶性判定',
    '評価日時',
  ];

  const rows = result.results.map((r) => {
    const info = getPlasticizerCompatibilityLevelInfo(r.compatibility);
    return [
      escapeCsvField(r.part.name),
      round3(r.part.hsp.deltaD),
      round3(r.part.hsp.deltaP),
      round3(r.part.hsp.deltaH),
      round3(r.part.r0),
      escapeCsvField(r.solvent.name),
      round3(r.solvent.hsp.deltaD),
      round3(r.solvent.hsp.deltaP),
      round3(r.solvent.hsp.deltaH),
      round3(r.ra),
      round3(r.red),
      `Level ${r.compatibility}`,
      escapeCsvField(`${info.label}（${info.description}）`),
      result.evaluatedAt.toISOString(),
    ].join(',');
  });

  return BOM + [headers.join(','), ...rows].join('\r\n') + '\r\n';
}

/**
 * キャリア選定スクリーニング結果をCSV文字列に変換する
 * @returns BOM付きUTF-8 CSV文字列
 */
export function formatCarrierSelectionCsv(result: CarrierEvaluationResult): string {
  const BOM = '\uFEFF';
  const headers = [
    '薬物名',
    '薬物 δD',
    '薬物 δP',
    '薬物 δH',
    '薬物 R₀',
    'キャリア名',
    'キャリア δD',
    'キャリア δP',
    'キャリア δH',
    'キャリア R₀',
    'Ra',
    'RED',
    '適合性レベル',
    '適合性判定',
    '評価日時',
  ];

  const rows = result.results.map((r) => {
    const info = getCarrierCompatibilityLevelInfo(r.compatibility);
    return [
      escapeCsvField(r.drug.name),
      round3(r.drug.hsp.deltaD),
      round3(r.drug.hsp.deltaP),
      round3(r.drug.hsp.deltaH),
      round3(r.drug.r0),
      escapeCsvField(r.carrier.name),
      round3(r.carrier.hsp.deltaD),
      round3(r.carrier.hsp.deltaP),
      round3(r.carrier.hsp.deltaH),
      round3(r.carrier.r0),
      round3(r.ra),
      round3(r.red),
      `Level ${r.compatibility}`,
      escapeCsvField(`${info.label}（${info.description}）`),
      result.evaluatedAt.toISOString(),
    ].join(',');
  });

  return BOM + [headers.join(','), ...rows].join('\r\n') + '\r\n';
}

/**
 * ブレンド最適化結果をCSV文字列に変換する
 * @returns BOM付きUTF-8 CSV文字列
 */
export function formatBlendOptimizationCsv(result: BlendOptimizationResult): string {
  const BOM = '\uFEFF';
  const headers = [
    '順位',
    'ターゲット δD',
    'ターゲット δP',
    'ターゲット δH',
    '成分1(名前)',
    '成分1(分率)',
    '成分2(名前)',
    '成分2(分率)',
    '成分3(名前)',
    '成分3(分率)',
    'ブレンド δD',
    'ブレンド δP',
    'ブレンド δH',
    'Ra',
    '評価日時',
  ];

  const rows = result.topResults.map((r, index) => {
    const comp1 = r.components[0];
    const comp2 = r.components[1];
    const comp3 = r.components[2];
    return [
      String(index + 1),
      round3(result.targetHSP.deltaD),
      round3(result.targetHSP.deltaP),
      round3(result.targetHSP.deltaH),
      escapeCsvField(comp1?.solvent.name ?? ''),
      comp1?.volumeFraction.toFixed(3) ?? '',
      escapeCsvField(comp2?.solvent.name ?? ''),
      comp2?.volumeFraction.toFixed(3) ?? '',
      escapeCsvField(comp3?.solvent.name ?? ''),
      comp3?.volumeFraction.toFixed(3) ?? '',
      round3(r.blendHSP.deltaD),
      round3(r.blendHSP.deltaP),
      round3(r.blendHSP.deltaH),
      round3(r.ra),
      result.evaluatedAt.toISOString(),
    ].join(',');
  });

  return BOM + [headers.join(','), ...rows].join('\r\n') + '\r\n';
}

/**
 * 分散剤選定結果をCSV文字列に変換する
 * @returns BOM付きUTF-8 CSV文字列
 */
export function formatDispersantSelectionCsv(result: DispersantEvaluationResult): string {
  const BOM = '\uFEFF';
  const headers = [
    '分散剤名',
    '分散剤タイプ',
    '粒子名',
    '溶媒名',
    'アンカー基 Ra',
    'アンカー基 RED',
    'アンカー基 判定',
    '溶媒和鎖 Ra',
    '溶媒和鎖 RED',
    '溶媒和鎖 判定',
    '総合スコア',
    '総合レベル',
    '総合判定',
    '評価日時',
  ];

  const rows = result.results.map((r) => {
    const anchorInfo = getDispersantAffinityLevelInfo(r.affinityAnchor);
    const solvInfo = getDispersantAffinityLevelInfo(r.affinitySolvation);
    const overallInfo = getDispersantAffinityLevelInfo(r.overallLevel);
    return [
      escapeCsvField(r.dispersant.name),
      r.dispersant.dispersantType,
      escapeCsvField(r.particle.name),
      escapeCsvField(r.solvent.name),
      round3(r.raAnchor),
      round3(r.redAnchor),
      escapeCsvField(anchorInfo.label),
      round3(r.raSolvation),
      round3(r.redSolvation),
      escapeCsvField(solvInfo.label),
      round3(r.compositeScore),
      `Level ${r.overallLevel}`,
      escapeCsvField(`${overallInfo.label}（${overallInfo.description}）`),
      result.evaluatedAt.toISOString(),
    ].join(',');
  });

  return BOM + [headers.join(','), ...rows].join('\r\n') + '\r\n';
}

// ─── 共結晶形成可能性ラベル ───────────────────────────
const COCRYSTAL_LABELS: Record<CocrystalLikelihood, { label: string; description: string }> = {
  [CocrystalLikelihood.Likely]: { label: 'Likely', description: '形成しやすい' },
  [CocrystalLikelihood.Possible]: { label: 'Possible', description: '可能性あり' },
  [CocrystalLikelihood.Unlikely]: { label: 'Unlikely', description: '形成しにくい' },
};

// ─── 平滑化効果ラベル ───────────────────────────
const SMOOTHING_LABELS: Record<SmoothingEffectLevel, { label: string; description: string }> = {
  [SmoothingEffectLevel.Dissolves]: { label: 'Dissolves', description: '溶解（過剰）' },
  [SmoothingEffectLevel.GoodSmoothing]: { label: 'Good Smoothing', description: '良好な平滑化' },
  [SmoothingEffectLevel.MildSmoothing]: { label: 'Mild Smoothing', description: '軽度の平滑化' },
  [SmoothingEffectLevel.NoEffect]: { label: 'No Effect', description: '効果なし' },
};

// ─── 薄膜品質ラベル ───────────────────────────
const FILM_QUALITY_LABELS: Record<FilmQualityLevel, { label: string; description: string }> = {
  [FilmQualityLevel.Good]: { label: 'Good', description: '良好な膜品質' },
  [FilmQualityLevel.Moderate]: { label: 'Moderate', description: '中程度の膜品質' },
  [FilmQualityLevel.Poor]: { label: 'Poor', description: '不良な膜品質' },
};

// ─── 賦形剤適合性ラベル ───────────────────────────
const COMPATIBILITY_LABELS: Record<CompatibilityLevel, { label: string; description: string }> = {
  [CompatibilityLevel.Compatible]: { label: 'Compatible', description: '適合' },
  [CompatibilityLevel.Caution]: { label: 'Caution', description: '要注意' },
  [CompatibilityLevel.Incompatible]: { label: 'Incompatible', description: '不適合' },
};

/**
 * ESCスクリーニング結果をCSV文字列に変換する
 * @returns BOM付きUTF-8 CSV文字列
 */
export function formatESCScreeningCsv(results: ESCScreeningResult[]): string {
  const BOM = '\uFEFF';
  const headers = [
    '溶媒名',
    '溶媒 δD',
    '溶媒 δP',
    '溶媒 δH',
    'Ra',
    'RED',
    'ESCリスクレベル',
    'ESCリスク判定',
  ];

  const rows = results.map((r) => {
    const info = getESCRiskLevelInfo(r.risk);
    return [
      escapeCsvField(r.solvent.name),
      round3(r.solvent.hsp.deltaD),
      round3(r.solvent.hsp.deltaP),
      round3(r.solvent.hsp.deltaH),
      round3(r.ra),
      round3(r.red),
      `Level ${r.risk}`,
      escapeCsvField(`${info.labelJa}（${info.description}）`),
    ].join(',');
  });

  return BOM + [headers.join(','), ...rows].join('\r\n') + '\r\n';
}

/**
 * 共結晶スクリーニング結果をCSV文字列に変換する
 * @returns BOM付きUTF-8 CSV文字列
 */
export function formatCocrystalScreeningCsv(results: CocrystalScreeningResult[]): string {
  const BOM = '\uFEFF';
  const headers = [
    'コフォーマー名',
    'コフォーマー δD',
    'コフォーマー δP',
    'コフォーマー δH',
    'Ra',
    'RED',
    '形成可能性レベル',
    '形成可能性判定',
  ];

  const rows = results.map((r) => {
    const info = COCRYSTAL_LABELS[r.likelihood];
    return [
      escapeCsvField(r.coformer.name),
      round3(r.coformer.hsp.deltaD),
      round3(r.coformer.hsp.deltaP),
      round3(r.coformer.hsp.deltaH),
      round3(r.ra),
      round3(r.red),
      `Level ${r.likelihood}`,
      escapeCsvField(`${info.label}（${info.description}）`),
    ].join(',');
  });

  return BOM + [headers.join(','), ...rows].join('\r\n') + '\r\n';
}

/**
 * 3Dプリント溶剤平滑化スクリーニング結果をCSV文字列に変換する
 * @returns BOM付きUTF-8 CSV文字列
 */
export function formatPrinting3dSmoothingCsv(results: SmoothingScreeningResult[]): string {
  const BOM = '\uFEFF';
  const headers = [
    '溶媒名',
    '溶媒 δD',
    '溶媒 δP',
    '溶媒 δH',
    'Ra',
    'RED',
    '平滑化効果レベル',
    '平滑化効果判定',
  ];

  const rows = results.map((r) => {
    const info = SMOOTHING_LABELS[r.effect];
    return [
      escapeCsvField(r.solvent.name),
      round3(r.solvent.hsp.deltaD),
      round3(r.solvent.hsp.deltaP),
      round3(r.solvent.hsp.deltaH),
      round3(r.ra),
      round3(r.red),
      `Level ${r.effect}`,
      escapeCsvField(`${info.label}（${info.description}）`),
    ].join(',');
  });

  return BOM + [headers.join(','), ...rows].join('\r\n') + '\r\n';
}

/**
 * 誘電体薄膜品質スクリーニング結果をCSV文字列に変換する
 * @returns BOM付きUTF-8 CSV文字列
 */
export function formatDielectricFilmCsv(results: DielectricScreeningResult[]): string {
  const BOM = '\uFEFF';
  const headers = [
    '溶媒名',
    '溶媒 δD',
    '溶媒 δP',
    '溶媒 δH',
    '沸点(°C)',
    'Ra',
    'RED',
    '薄膜品質レベル',
    '薄膜品質判定',
  ];

  const rows = results.map((r) => {
    const info = FILM_QUALITY_LABELS[r.filmQuality];
    return [
      escapeCsvField(r.solvent.name),
      round3(r.solvent.hsp.deltaD),
      round3(r.solvent.hsp.deltaP),
      round3(r.solvent.hsp.deltaH),
      r.solvent.boilingPoint?.toFixed(1) ?? '',
      round3(r.ra),
      round3(r.red),
      `Level ${r.filmQuality}`,
      escapeCsvField(`${info.label}（${info.description}）`),
    ].join(',');
  });

  return BOM + [headers.join(','), ...rows].join('\r\n') + '\r\n';
}

/**
 * 賦形剤適合性評価結果をCSV文字列に変換する
 * @returns BOM付きUTF-8 CSV文字列
 */
// ─── ブレンド相溶性ラベル ───────────────────────────
const MISCIBILITY_LABELS: Record<string, { label: string; description: string }> = {
  miscible: { label: 'Miscible', description: '相溶' },
  partial: { label: 'Partial', description: '部分相溶' },
  immiscible: { label: 'Immiscible', description: '非相溶' },
};

/**
 * ポリマーブレンド相溶性評価結果をCSV文字列に変換する
 * @returns BOM付きUTF-8 CSV文字列
 */
export function formatPolymerBlendCsv(results: Array<{
  polymer1Name: string; polymer2Name: string;
  polymer1HSP: { deltaD: number; deltaP: number; deltaH: number };
  polymer2HSP: { deltaD: number; deltaP: number; deltaH: number };
  ra: number; chiParameter: number; miscibility: string;
}>): string {
  const BOM = '\uFEFF';
  const headers = [
    'ポリマー1', 'ポリマー1 δD', 'ポリマー1 δP', 'ポリマー1 δH',
    'ポリマー2', 'ポリマー2 δD', 'ポリマー2 δP', 'ポリマー2 δH',
    'Ra', 'χパラメータ', '相溶性判定',
  ];

  const rows = results.map((r) => {
    const info = MISCIBILITY_LABELS[r.miscibility] ?? { label: r.miscibility, description: '' };
    return [
      escapeCsvField(r.polymer1Name),
      round3(r.polymer1HSP.deltaD), round3(r.polymer1HSP.deltaP), round3(r.polymer1HSP.deltaH),
      escapeCsvField(r.polymer2Name),
      round3(r.polymer2HSP.deltaD), round3(r.polymer2HSP.deltaP), round3(r.polymer2HSP.deltaH),
      round3(r.ra), r.chiParameter.toFixed(4),
      escapeCsvField(`${info.label}（${info.description}）`),
    ].join(',');
  });

  return BOM + [headers.join(','), ...rows].join('\r\n') + '\r\n';
}

/**
 * リサイクル相溶性N×Nマトリクス結果をCSV文字列に変換する
 * @returns BOM付きUTF-8 CSV文字列
 */
export function formatRecyclingCompatibilityCsv(matrix: Array<{
  polymer1Name: string; polymer2Name: string;
  ra: number; chiParameter: number; miscibility: string;
}>): string {
  const BOM = '\uFEFF';
  const headers = ['ポリマー1', 'ポリマー2', 'Ra', 'χパラメータ', '相溶性判定'];

  const rows = matrix.map((r) => {
    const info = MISCIBILITY_LABELS[r.miscibility] ?? { label: r.miscibility, description: '' };
    return [
      escapeCsvField(r.polymer1Name),
      escapeCsvField(r.polymer2Name),
      round3(r.ra), r.chiParameter.toFixed(4),
      escapeCsvField(`${info.label}（${info.description}）`),
    ].join(',');
  });

  return BOM + [headers.join(','), ...rows].join('\r\n') + '\r\n';
}

/**
 * 相溶化剤選定結果をCSV文字列に変換する
 * @returns BOM付きUTF-8 CSV文字列
 */
export function formatCompatibilizerCsv(results: Array<{
  compatibilizerName: string;
  raToPolymer1: number; raToPolymer2: number;
  overallScore: number; compatibility: string;
}>): string {
  const BOM = '\uFEFF';
  const headers = ['相溶化剤名', 'ポリマー1とのRa', 'ポリマー2とのRa', '総合スコア', '適合性判定'];

  const rows = results.map((r) => [
    escapeCsvField(r.compatibilizerName),
    round3(r.raToPolymer1), round3(r.raToPolymer2),
    round3(r.overallScore), escapeCsvField(r.compatibility),
  ].join(','));

  return BOM + [headers.join(','), ...rows].join('\r\n') + '\r\n';
}

/**
 * コポリマーHSP推定結果をCSV文字列に変換する
 * @returns BOM付きUTF-8 CSV文字列
 */
export function formatCopolymerHspCsv(result: {
  monomers: Array<{ name: string; deltaD: number; deltaP: number; deltaH: number; fraction: number }>;
  estimatedHSP: { deltaD: number; deltaP: number; deltaH: number };
}): string {
  const BOM = '\uFEFF';
  const headers = ['モノマー名', 'δD', 'δP', 'δH', '分率'];

  const rows = result.monomers.map((m) => [
    escapeCsvField(m.name),
    round3(m.deltaD), round3(m.deltaP), round3(m.deltaH),
    m.fraction.toFixed(3),
  ].join(','));

  // 推定結果行
  rows.push([
    escapeCsvField('【推定HSP】'),
    round3(result.estimatedHSP.deltaD),
    round3(result.estimatedHSP.deltaP),
    round3(result.estimatedHSP.deltaH),
    '1.000',
  ].join(','));

  return BOM + [headers.join(','), ...rows].join('\r\n') + '\r\n';
}

// ─── 添加剤移行ラベル ───────────────────────────
import type { AdditiveMigrationResult } from './additive-migration';
import { MigrationLevel, getMigrationLevelInfo } from './additive-migration';
import type { FlavorScalpingResult } from './flavor-scalping';
import { ScalpingLevel, getScalpingLevelInfo } from './flavor-scalping';
import type { PackagingMigrationResult } from './food-packaging-migration';
import { PackagingMigrationLevel, getPackagingMigrationLevelInfo } from './food-packaging-migration';
import type { EncapsulationResult } from './fragrance-encapsulation';
import { EncapsulationLevel, getEncapsulationLevelInfo } from './fragrance-encapsulation';
import type { TransdermalResult } from './transdermal-enhancer';
import { TransdermalEnhancerLevel, getTransdermalLevelInfo } from './transdermal-enhancer';
import type { DrugPermeabilityResult } from './liposome-permeability';
import { PermeabilityLevel, getPermeabilityLevelInfo } from './liposome-permeability';

/**
 * 添加剤移行評価結果をCSV文字列に変換する
 * @returns BOM付きUTF-8 CSV文字列
 */
export function formatAdditiveMigrationCsv(results: AdditiveMigrationResult[]): string {
  const BOM = '\uFEFF';
  const headers = [
    '添加剤名', '添加剤 δD', '添加剤 δP', '添加剤 δH',
    'ポリマー名', 'ポリマー δD', 'ポリマー δP', 'ポリマー δH', 'ポリマー R₀',
    'Ra', 'RED', '移行リスクレベル', '移行リスク判定',
  ];

  const rows = results.map((r) => {
    const info = getMigrationLevelInfo(r.migrationLevel);
    return [
      escapeCsvField(r.additive.name),
      round3(r.additive.hsp.deltaD), round3(r.additive.hsp.deltaP), round3(r.additive.hsp.deltaH),
      escapeCsvField(r.polymer.name),
      round3(r.polymer.hsp.deltaD), round3(r.polymer.hsp.deltaP), round3(r.polymer.hsp.deltaH),
      round3(r.polymer.r0),
      round3(r.ra), round3(r.red),
      r.migrationLevel,
      escapeCsvField(`${info.label}（${info.description}）`),
    ].join(',');
  });

  return BOM + [headers.join(','), ...rows].join('\r\n') + '\r\n';
}

/**
 * フレーバースカルピング評価結果をCSV文字列に変換する
 * @returns BOM付きUTF-8 CSV文字列
 */
export function formatFlavorScalpingCsv(results: FlavorScalpingResult[]): string {
  const BOM = '\uFEFF';
  const headers = [
    'アロマ成分名', 'アロマ δD', 'アロマ δP', 'アロマ δH',
    '包装材名', '包装材 δD', '包装材 δP', '包装材 δH', '包装材 R₀',
    'Ra', 'RED', 'スカルピングレベル', 'スカルピング判定',
  ];

  const rows = results.map((r) => {
    const info = getScalpingLevelInfo(r.scalpingLevel);
    return [
      escapeCsvField(r.aroma.name),
      round3(r.aroma.hsp.deltaD), round3(r.aroma.hsp.deltaP), round3(r.aroma.hsp.deltaH),
      escapeCsvField(r.packaging.name),
      round3(r.packaging.hsp.deltaD), round3(r.packaging.hsp.deltaP), round3(r.packaging.hsp.deltaH),
      round3(r.packaging.r0),
      round3(r.ra), round3(r.red),
      r.scalpingLevel,
      escapeCsvField(`${info.label}（${info.description}）`),
    ].join(',');
  });

  return BOM + [headers.join(','), ...rows].join('\r\n') + '\r\n';
}

/**
 * 包装材溶出評価結果をCSV文字列に変換する
 * @returns BOM付きUTF-8 CSV文字列
 */
export function formatFoodPackagingMigrationCsv(results: PackagingMigrationResult[]): string {
  const BOM = '\uFEFF';
  const headers = [
    '溶出物質名', '溶出物質 δD', '溶出物質 δP', '溶出物質 δH',
    'Ra', 'RED', '溶出リスクレベル', '溶出リスク判定',
  ];

  const rows = results.map((r) => {
    const info = getPackagingMigrationLevelInfo(r.migrationLevel);
    return [
      escapeCsvField(r.migrantName),
      round3(r.migrantHSP.deltaD), round3(r.migrantHSP.deltaP), round3(r.migrantHSP.deltaH),
      round3(r.ra), round3(r.red),
      `Level ${r.migrationLevel}`,
      escapeCsvField(`${info.label}（${info.description}）`),
    ].join(',');
  });

  return BOM + [headers.join(','), ...rows].join('\r\n') + '\r\n';
}

/**
 * 香料カプセル化評価結果をCSV文字列に変換する
 * @returns BOM付きUTF-8 CSV文字列
 */
export function formatFragranceEncapsulationCsv(results: EncapsulationResult[]): string {
  const BOM = '\uFEFF';
  const headers = [
    '香料名', '香料 δD', '香料 δP', '香料 δH',
    'Ra', 'RED', 'カプセル化適合性レベル', 'カプセル化適合性判定',
  ];

  const rows = results.map((r) => {
    const info = getEncapsulationLevelInfo(r.encapsulationLevel);
    return [
      escapeCsvField(r.fragranceName),
      round3(r.fragranceHSP.deltaD), round3(r.fragranceHSP.deltaP), round3(r.fragranceHSP.deltaH),
      round3(r.ra), round3(r.red),
      `Level ${r.encapsulationLevel}`,
      escapeCsvField(`${info.label}（${info.description}）`),
    ].join(',');
  });

  return BOM + [headers.join(','), ...rows].join('\r\n') + '\r\n';
}

/**
 * 経皮吸収促進剤評価結果をCSV文字列に変換する
 * @returns BOM付きUTF-8 CSV文字列
 */
export function formatTransdermalEnhancerCsv(results: TransdermalResult[]): string {
  const BOM = '\uFEFF';
  const headers = [
    '促進剤名', '促進剤 δD', '促進剤 δP', '促進剤 δH',
    'Ra(薬物-促進剤)', 'Ra(皮膚-促進剤)', '総合スコア',
    '適合性レベル', '適合性判定',
  ];

  const rows = results.map((r) => {
    const info = getTransdermalLevelInfo(r.level);
    return [
      escapeCsvField(r.enhancerName),
      round3(r.enhancerHSP.deltaD), round3(r.enhancerHSP.deltaP), round3(r.enhancerHSP.deltaH),
      round3(r.raDrugEnhancer), round3(r.raSkinEnhancer), round3(r.compositeScore),
      `Level ${r.level}`,
      escapeCsvField(`${info.label}（${info.description}）`),
    ].join(',');
  });

  return BOM + [headers.join(','), ...rows].join('\r\n') + '\r\n';
}

/**
 * リポソーム透過性評価結果をCSV文字列に変換する
 * @returns BOM付きUTF-8 CSV文字列
 */
export function formatLiposomePermeabilityCsv(results: DrugPermeabilityResult[]): string {
  const BOM = '\uFEFF';
  const headers = [
    '薬物名', '薬物 δD', '薬物 δP', '薬物 δH',
    'Ra', 'RED', '透過性レベル', '透過性判定',
  ];

  const rows = results.map((r) => {
    const info = getPermeabilityLevelInfo(r.permeabilityLevel);
    return [
      escapeCsvField(r.drugName),
      round3(r.drugHSP.deltaD), round3(r.drugHSP.deltaP), round3(r.drugHSP.deltaH),
      round3(r.ra), round3(r.red),
      `Level ${r.permeabilityLevel}`,
      escapeCsvField(`${info.label}（${info.description}）`),
    ].join(',');
  });

  return BOM + [headers.join(','), ...rows].join('\r\n') + '\r\n';
}

export function formatExcipientCompatibilityCsv(results: ExcipientResult[]): string {
  const BOM = '\uFEFF';
  const headers = [
    '賦形剤名',
    '賦形剤 δD',
    '賦形剤 δP',
    '賦形剤 δH',
    'Ra',
    'RED',
    '適合性レベル',
    '適合性判定',
  ];

  const rows = results.map((r) => {
    const info = COMPATIBILITY_LABELS[r.compatibility];
    return [
      escapeCsvField(r.excipient.name),
      round3(r.excipient.hsp.deltaD),
      round3(r.excipient.hsp.deltaP),
      round3(r.excipient.hsp.deltaH),
      round3(r.ra),
      round3(r.red),
      `Level ${r.compatibility}`,
      escapeCsvField(`${info.label}（${info.description}）`),
    ].join(',');
  });

  return BOM + [headers.join(','), ...rows].join('\r\n') + '\r\n';
}

// ─── ナノ材料分散群 CSV ───────────────────────────

import type { PigmentDispersionResult } from './pigment-dispersion-stability';
import { StabilityLevel, getStabilityLevelInfo } from './pigment-dispersion-stability';
import type { CNTGrapheneDispersionResult } from './cnt-graphene-dispersion';
import type { MXeneDispersionResult } from './mxene-dispersion';
import type { DrugLoadingResult } from './nanoparticle-drug-loading';
import { LoadingLevel, getLoadingLevelInfo } from './nanoparticle-drug-loading';

/**
 * 顔料分散安定性結果をCSV文字列に変換する
 * @returns BOM付きUTF-8 CSV文字列
 */
export function formatPigmentDispersionCsv(results: PigmentDispersionResult[]): string {
  const BOM = '\uFEFF';
  const headers = [
    'ビヒクル名', 'ビヒクル δD', 'ビヒクル δP', 'ビヒクル δH',
    'Ra', 'RED', '安定性レベル', '安定性判定',
  ];

  const rows = results.map((r) => {
    const info = getStabilityLevelInfo(r.stability);
    return [
      escapeCsvField(r.vehicle.name),
      round3(r.vehicle.hsp.deltaD), round3(r.vehicle.hsp.deltaP), round3(r.vehicle.hsp.deltaH),
      round3(r.ra), round3(r.red),
      r.stability,
      escapeCsvField(`${info.label}（${info.description}）`),
    ].join(',');
  });

  return BOM + [headers.join(','), ...rows].join('\r\n') + '\r\n';
}

/**
 * CNT/グラフェン分散結果をCSV文字列に変換する
 * @returns BOM付きUTF-8 CSV文字列
 */
export function formatCNTGrapheneDispersionCsv(results: CNTGrapheneDispersionResult[]): string {
  const BOM = '\uFEFF';
  const headers = [
    '溶媒名', '溶媒 δD', '溶媒 δP', '溶媒 δH',
    'Ra', 'RED', '分散性レベル', '分散性判定',
  ];

  const rows = results.map((r) => {
    const info = getDispersibilityLevelInfo(r.dispersibility);
    return [
      escapeCsvField(r.solvent.name),
      round3(r.solvent.hsp.deltaD), round3(r.solvent.hsp.deltaP), round3(r.solvent.hsp.deltaH),
      round3(r.ra), round3(r.red),
      `Level ${r.dispersibility}`,
      escapeCsvField(`${info.label}（${info.description}）`),
    ].join(',');
  });

  return BOM + [headers.join(','), ...rows].join('\r\n') + '\r\n';
}

/**
 * MXene分散結果をCSV文字列に変換する
 * @returns BOM付きUTF-8 CSV文字列
 */
export function formatMXeneDispersionCsv(results: MXeneDispersionResult[]): string {
  const BOM = '\uFEFF';
  const headers = [
    '溶媒名', '溶媒 δD', '溶媒 δP', '溶媒 δH',
    'Ra', 'RED', '分散性レベル', '分散性判定',
  ];

  const rows = results.map((r) => {
    const info = getDispersibilityLevelInfo(r.dispersibility);
    return [
      escapeCsvField(r.solvent.name),
      round3(r.solvent.hsp.deltaD), round3(r.solvent.hsp.deltaP), round3(r.solvent.hsp.deltaH),
      round3(r.ra), round3(r.red),
      `Level ${r.dispersibility}`,
      escapeCsvField(`${info.label}（${info.description}）`),
    ].join(',');
  });

  return BOM + [headers.join(','), ...rows].join('\r\n') + '\r\n';
}

/**
 * ナノ粒子薬物ローディング結果をCSV文字列に変換する
 * @returns BOM付きUTF-8 CSV文字列
 */
export function formatDrugLoadingCsv(results: DrugLoadingResult[]): string {
  const BOM = '\uFEFF';
  const headers = [
    '薬物名', '薬物 δD', '薬物 δP', '薬物 δH',
    'Ra', 'RED', 'ローディングレベル', 'ローディング判定',
  ];

  const rows = results.map((r) => {
    const info = getLoadingLevelInfo(r.loadingLevel);
    return [
      escapeCsvField(r.drug.name),
      round3(r.drug.hsp.deltaD), round3(r.drug.hsp.deltaP), round3(r.drug.hsp.deltaH),
      round3(r.ra), round3(r.red),
      r.loadingLevel,
      escapeCsvField(`${info.label}（${info.description}）`),
    ].join(',');
  });

  return BOM + [headers.join(','), ...rows].join('\r\n') + '\r\n';
}

// ─── Gas-Solubility群 CSV ───────────────────────────

import type { MembranePermeabilityScreeningResult } from './polymer-membrane-gas-permeability';
import { classifyGasPermeability, getGasPermeabilityLevelInfo } from './polymer-membrane-gas-permeability';
import type { SeparationSelectivityResult } from './membrane-separation-selectivity';
import { getSelectivityLevelInfo } from './membrane-separation-selectivity';
import type { CO2AbsorbentScreeningResult } from './co2-absorbent-selection';
import { getCO2AbsorptionLevelInfo } from './co2-absorbent-selection';
import type { H2StorageScreeningResult } from './hydrogen-storage-material';
import { getH2StorageCompatibilityLevelInfo } from './hydrogen-storage-material';

export function formatGasPermeabilityCsv(result: MembranePermeabilityScreeningResult): string {
  const BOM = '\uFEFF';
  const headers = [
    'ガス名', 'Ra²', '相対透過性', '選択性(vs基準ガス)', '透過性レベル', '透過性判定',
  ];

  const rows = result.results.map((r) => {
    const level = classifyGasPermeability(r.ra2);
    const info = getGasPermeabilityLevelInfo(level);
    return [
      escapeCsvField(r.gasName),
      r.ra2.toFixed(3),
      r.relativePermeability === Infinity ? 'Inf' : r.relativePermeability.toFixed(3),
      r.selectivity === Infinity ? 'Inf' : r.selectivity.toFixed(3),
      `Level ${level}`,
      escapeCsvField(`${info.label}（${info.description}）`),
    ].join(',');
  });

  return BOM + [headers.join(','), ...rows].join('\r\n') + '\r\n';
}

export function formatMembraneSeparationCsv(result: SeparationSelectivityResult): string {
  const BOM = '\uFEFF';
  const headers = [
    'ターゲット名', 'ターゲット Ra', 'ターゲット Ra²',
    '不純物名', '不純物 Ra', '不純物 Ra²',
    '選択性比', '選択性レベル', '選択性判定', '評価日時',
  ];

  const info = getSelectivityLevelInfo(result.selectivityLevel);
  const row = [
    escapeCsvField(result.targetName),
    round3(result.targetRa), result.targetRa2.toFixed(3),
    escapeCsvField(result.impurityName),
    round3(result.impurityRa), result.impurityRa2.toFixed(3),
    result.selectivityRatio === Infinity ? 'Inf' : result.selectivityRatio.toFixed(3),
    `Level ${result.selectivityLevel}`,
    escapeCsvField(`${info.label}（${info.description}）`),
    result.evaluatedAt.toISOString(),
  ].join(',');

  return BOM + [headers.join(','), row].join('\r\n') + '\r\n';
}

export function formatCO2AbsorbentCsv(result: CO2AbsorbentScreeningResult): string {
  const BOM = '\uFEFF';
  const headers = [
    '吸収材名', '吸収材 δD', '吸収材 δP', '吸収材 δH',
    'Ra', 'RED', '吸収性レベル', '吸収性判定',
  ];

  const rows = result.results.map((r) => {
    const info = getCO2AbsorptionLevelInfo(r.absorptionLevel);
    return [
      escapeCsvField(r.absorbent),
      round3(r.absorbentHSP.deltaD), round3(r.absorbentHSP.deltaP), round3(r.absorbentHSP.deltaH),
      round3(r.ra), round3(r.red),
      `Level ${r.absorptionLevel}`,
      escapeCsvField(`${info.label}（${info.description}）`),
    ].join(',');
  });

  return BOM + [headers.join(','), ...rows].join('\r\n') + '\r\n';
}

export function formatHydrogenStorageCsv(result: H2StorageScreeningResult): string {
  const BOM = '\uFEFF';
  const headers = [
    '溶媒名', '溶媒 δD', '溶媒 δP', '溶媒 δH',
    'Ra', 'RED', '適合性レベル', '適合性判定',
  ];

  const rows = result.results.map((r) => {
    const info = getH2StorageCompatibilityLevelInfo(r.compatibilityLevel);
    return [
      escapeCsvField(r.solventName),
      round3(r.solventHSP.deltaD), round3(r.solventHSP.deltaP), round3(r.solventHSP.deltaH),
      round3(r.ra), round3(r.red),
      `Level ${r.compatibilityLevel}`,
      escapeCsvField(`${info.label}（${info.description}）`),
    ].join(',');
  });

  return BOM + [headers.join(','), ...rows].join('\r\n') + '\r\n';
}

// ─── Work-of-Adhesion群 CSV ───────────────────────────

import type { InkSubstrateAdhesionResult, MultilayerCoatingResult, PSAPeelStrengthResult, StructuralAdhesiveJointResult, SurfaceTreatmentResult } from './types';

const ADHESION_STRENGTH_LABELS: Record<number, { label: string; description: string }> = {
  1: { label: 'Excellent', description: '優秀な密着性' },
  2: { label: 'Good', description: '良好な密着性' },
  3: { label: 'Fair', description: '可能（境界付近）' },
  4: { label: 'Poor', description: '不良' },
};

const PEEL_STRENGTH_LABELS: Record<number, { label: string; description: string }> = {
  1: { label: 'Strong', description: '高剥離強度' },
  2: { label: 'Medium', description: '中程度' },
  3: { label: 'Weak', description: '低剥離強度' },
  4: { label: 'Very Weak', description: '非常に低い' },
};

export function formatInkSubstrateAdhesionCsv(result: InkSubstrateAdhesionResult): string {
  const BOM = '\uFEFF';
  const headers = ['インク δD', 'インク δP', 'インク δH', '基材 δD', '基材 δP', '基材 δH', 'Wa(mJ/m²)', 'Ra', '密着レベル', '判定', '評価日時'];
  const info = ADHESION_STRENGTH_LABELS[result.level];
  const row = [
    round3(result.inkHSP.deltaD), round3(result.inkHSP.deltaP), round3(result.inkHSP.deltaH),
    round3(result.substrateHSP.deltaD), round3(result.substrateHSP.deltaP), round3(result.substrateHSP.deltaH),
    round3(result.wa), round3(result.ra),
    `Level ${result.level}`, escapeCsvField(`${info.label}（${info.description}）`),
    result.evaluatedAt.toISOString(),
  ].join(',');
  return BOM + [headers.join(','), row].join('\r\n') + '\r\n';
}

export function formatMultilayerCoatingCsv(result: MultilayerCoatingResult): string {
  const BOM = '\uFEFF';
  const headers = ['層1', '層2', 'Wa(mJ/m²)', 'Ra', '密着レベル', '判定', '最弱界面'];
  const rows = result.interfaces.map((r, i) => {
    const info = ADHESION_STRENGTH_LABELS[r.level];
    return [
      escapeCsvField(r.layer1Name), escapeCsvField(r.layer2Name),
      round3(r.wa), round3(r.ra),
      `Level ${r.level}`, escapeCsvField(`${info.label}（${info.description}）`),
      i === result.weakestIndex ? 'Yes' : '',
    ].join(',');
  });
  return BOM + [headers.join(','), ...rows].join('\r\n') + '\r\n';
}

export function formatPSAPeelStrengthCsv(result: PSAPeelStrengthResult): string {
  const BOM = '\uFEFF';
  const headers = ['PSA δD', 'PSA δP', 'PSA δH', '被着体 δD', '被着体 δP', '被着体 δH', 'Wa(mJ/m²)', 'Ra', '推定剥離力(N/25mm)', '剥離レベル', '判定', '評価日時'];
  const info = PEEL_STRENGTH_LABELS[result.peelLevel];
  const row = [
    round3(result.psaHSP.deltaD), round3(result.psaHSP.deltaP), round3(result.psaHSP.deltaH),
    round3(result.adherendHSP.deltaD), round3(result.adherendHSP.deltaP), round3(result.adherendHSP.deltaH),
    round3(result.wa), round3(result.ra), round3(result.estimatedPeelForce),
    `Level ${result.peelLevel}`, escapeCsvField(`${info.label}（${info.description}）`),
    result.evaluatedAt.toISOString(),
  ].join(',');
  return BOM + [headers.join(','), row].join('\r\n') + '\r\n';
}

export function formatStructuralAdhesiveJointCsv(result: StructuralAdhesiveJointResult): string {
  const BOM = '\uFEFF';
  const headers = ['接着剤 δD', '接着剤 δP', '接着剤 δH', '被着体1 δD', '被着体1 δP', '被着体1 δH', '被着体2 δD', '被着体2 δP', '被着体2 δH', 'Wa1(mJ/m²)', 'Wa2(mJ/m²)', 'Ra1', 'Ra2', 'ボトルネック', '評価日時'];
  const row = [
    round3(result.adhesiveHSP.deltaD), round3(result.adhesiveHSP.deltaP), round3(result.adhesiveHSP.deltaH),
    round3(result.adherend1HSP.deltaD), round3(result.adherend1HSP.deltaP), round3(result.adherend1HSP.deltaH),
    round3(result.adherend2HSP.deltaD), round3(result.adherend2HSP.deltaP), round3(result.adherend2HSP.deltaH),
    round3(result.wa1), round3(result.wa2), round3(result.ra1), round3(result.ra2),
    `被着体${result.bottleneckSide}`, result.evaluatedAt.toISOString(),
  ].join(',');
  return BOM + [headers.join(','), row].join('\r\n') + '\r\n';
}

export function formatSurfaceTreatmentCsv(result: SurfaceTreatmentResult): string {
  const BOM = '\uFEFF';
  const headers = ['処理前 δD', '処理前 δP', '処理前 δH', '処理後 δD', '処理後 δP', '処理後 δH', 'ターゲット δD', 'ターゲット δP', 'ターゲット δH', 'Wa(処理前)', 'Wa(処理後)', 'Ra(処理前)', 'Ra(処理後)', '改善率(%)', '評価日時'];
  const row = [
    round3(result.beforeHSP.deltaD), round3(result.beforeHSP.deltaP), round3(result.beforeHSP.deltaH),
    round3(result.afterHSP.deltaD), round3(result.afterHSP.deltaP), round3(result.afterHSP.deltaH),
    round3(result.targetHSP.deltaD), round3(result.targetHSP.deltaP), round3(result.targetHSP.deltaH),
    round3(result.waBefore), round3(result.waAfter), round3(result.raBefore), round3(result.raAfter),
    result.improvementRate.toFixed(1), result.evaluatedAt.toISOString(),
  ].join(',');
  return BOM + [headers.join(','), row].join('\r\n') + '\r\n';
}

// ─── 医薬品・化粧品群 CSV ───────────────────────────

import type { UVFilterResult } from './sunscreen-uv-filter';
import { getSolubilityLevelInfo } from './sunscreen-uv-filter';
import type { InhalationCompatibilityResult } from './inhalation-drug-propellant';
import { getFormulationLevelInfo } from './inhalation-drug-propellant';
import type { ProteinAggregationResult } from './protein-aggregation-risk';
import { getProteinStabilityLevelInfo } from './protein-aggregation-risk';
import type { BufferScreeningResult } from './biologic-formulation-buffer';
import { getBufferStabilityLevelInfo } from './biologic-formulation-buffer';

/**
 * UVフィルター適合性結果をCSV文字列に変換する
 */
export function formatSunscreenUVFilterCsv(results: UVFilterResult[]): string {
  const BOM = '\uFEFF';
  const headers = [
    'UVフィルター名', 'UVフィルター δD', 'UVフィルター δP', 'UVフィルター δH',
    'Ra', 'RED', '溶解性レベル', '溶解性判定',
  ];

  const rows = results.map((r) => {
    const info = getSolubilityLevelInfo(r.solubility);
    return [
      escapeCsvField(r.uvFilter.name),
      round3(r.uvFilter.hsp.deltaD), round3(r.uvFilter.hsp.deltaP), round3(r.uvFilter.hsp.deltaH),
      round3(r.ra), round3(r.red),
      r.solubility,
      escapeCsvField(`${info.label}（${info.description}）`),
    ].join(',');
  });

  return BOM + [headers.join(','), ...rows].join('\r\n') + '\r\n';
}

/**
 * 吸入薬適合性結果をCSV文字列に変換する
 */
export function formatInhalationDrugCsv(result: InhalationCompatibilityResult): string {
  const BOM = '\uFEFF';
  const headers = [
    '薬物 δD', '薬物 δP', '薬物 δH',
    'プロペラント δD', 'プロペラント δP', 'プロペラント δH',
    'Ra', 'RED', '製剤形態', '製剤形態判定', '評価日時',
  ];
  const info = getFormulationLevelInfo(result.formulation);
  const row = [
    round3(result.drugHSP.deltaD), round3(result.drugHSP.deltaP), round3(result.drugHSP.deltaH),
    round3(result.propellantHSP.deltaD), round3(result.propellantHSP.deltaP), round3(result.propellantHSP.deltaH),
    round3(result.ra), round3(result.red),
    result.formulation,
    escapeCsvField(`${info.label}（${info.description}）`),
    result.evaluatedAt.toISOString(),
  ].join(',');
  return BOM + [headers.join(','), row].join('\r\n') + '\r\n';
}

/**
 * タンパク質凝集リスク結果をCSV文字列に変換する
 */
export function formatProteinAggregationCsv(result: ProteinAggregationResult): string {
  const BOM = '\uFEFF';
  const headers = [
    'タンパク質表面 δD', 'タンパク質表面 δP', 'タンパク質表面 δH',
    '緩衝液 δD', '緩衝液 δP', '緩衝液 δH',
    'Ra', 'RED', '安定性レベル', '安定性判定', '評価日時',
  ];
  const info = getProteinStabilityLevelInfo(result.stability);
  const row = [
    round3(result.proteinSurfaceHSP.deltaD), round3(result.proteinSurfaceHSP.deltaP), round3(result.proteinSurfaceHSP.deltaH),
    round3(result.bufferHSP.deltaD), round3(result.bufferHSP.deltaP), round3(result.bufferHSP.deltaH),
    round3(result.ra), round3(result.red),
    result.stability,
    escapeCsvField(`${info.label}（${info.description}）`),
    result.evaluatedAt.toISOString(),
  ].join(',');
  return BOM + [headers.join(','), row].join('\r\n') + '\r\n';
}

/**
 * バイオ製剤バッファー選定結果をCSV文字列に変換する
 */
export function formatBiologicBufferCsv(results: BufferScreeningResult[]): string {
  const BOM = '\uFEFF';
  const headers = [
    'バッファー名', 'バッファー δD', 'バッファー δP', 'バッファー δH',
    'Ra', 'RED', '安定性レベル', '安定性判定', '会合液体補正',
  ];

  const rows = results.map((r) => {
    const info = getBufferStabilityLevelInfo(r.stability);
    return [
      escapeCsvField(r.buffer.name),
      round3(r.buffer.hsp.deltaD), round3(r.buffer.hsp.deltaP), round3(r.buffer.hsp.deltaH),
      round3(r.ra), round3(r.red),
      r.stability,
      escapeCsvField(`${info.label}（${info.description}）`),
      r.associatingCorrectionApplied ? '適用' : '',
    ].join(',');
  });

  return BOM + [headers.join(','), ...rows].join('\r\n') + '\r\n';
}

// ─── 抽出・洗浄群 CSV ───────────────────────────

import type { CleaningScreeningResult } from './cleaning-product-formulation';
import { getCleaningLevelInfo } from './cleaning-product-formulation';
import type { DyeExtractionResult } from './natural-dye-extraction';
import { getExtractionLevelInfo } from './natural-dye-extraction';
import type { EssentialOilExtractionResult } from './essential-oil-extraction';
import type { RemediationScreeningResult } from './soil-contaminant-extraction';
import type { ResidualSolventResult } from './residual-solvent-prediction';
import { getResidualLevelInfo } from './residual-solvent-prediction';

export function formatCleaningFormulationCsv(results: CleaningScreeningResult[]): string {
  const BOM = '\uFEFF';
  const headers = [
    '溶媒名', '溶媒 δD', '溶媒 δP', '溶媒 δH',
    'Ra', 'RED', '洗浄効果レベル', '洗浄効果判定',
  ];
  const rows = results.map((r) => {
    const info = getCleaningLevelInfo(r.cleaningLevel);
    return [
      escapeCsvField(r.solvent.name),
      round3(r.solvent.hsp.deltaD), round3(r.solvent.hsp.deltaP), round3(r.solvent.hsp.deltaH),
      round3(r.ra), round3(r.red),
      r.cleaningLevel,
      escapeCsvField(`${info.label}（${info.description}）`),
    ].join(',');
  });
  return BOM + [headers.join(','), ...rows].join('\r\n') + '\r\n';
}

export function formatNaturalDyeExtractionCsv(results: DyeExtractionResult[]): string {
  const BOM = '\uFEFF';
  const headers = [
    '溶媒名', '溶媒 δD', '溶媒 δP', '溶媒 δH',
    'Ra', 'RED', '抽出効率レベル', '抽出効率判定',
  ];
  const rows = results.map((r) => {
    const info = getExtractionLevelInfo(r.extractionLevel);
    return [
      escapeCsvField(r.solvent.name),
      round3(r.solvent.hsp.deltaD), round3(r.solvent.hsp.deltaP), round3(r.solvent.hsp.deltaH),
      round3(r.ra), round3(r.red),
      r.extractionLevel,
      escapeCsvField(`${info.label}（${info.description}）`),
    ].join(',');
  });
  return BOM + [headers.join(','), ...rows].join('\r\n') + '\r\n';
}

export function formatEssentialOilExtractionCsv(results: EssentialOilExtractionResult[]): string {
  const BOM = '\uFEFF';
  const headers = [
    '溶媒名', '溶媒 δD', '溶媒 δP', '溶媒 δH',
    'Ra', 'RED', '抽出効率レベル', '抽出効率判定',
  ];
  const rows = results.map((r) => {
    const info = getExtractionLevelInfo(r.extractionLevel);
    return [
      escapeCsvField(r.solvent.name),
      round3(r.solvent.hsp.deltaD), round3(r.solvent.hsp.deltaP), round3(r.solvent.hsp.deltaH),
      round3(r.ra), round3(r.red),
      r.extractionLevel,
      escapeCsvField(`${info.label}（${info.description}）`),
    ].join(',');
  });
  return BOM + [headers.join(','), ...rows].join('\r\n') + '\r\n';
}

export function formatSoilRemediationCsv(results: RemediationScreeningResult[]): string {
  const BOM = '\uFEFF';
  const headers = [
    '溶媒名', '溶媒 δD', '溶媒 δP', '溶媒 δH',
    'Ra', 'RED', '抽出効率レベル', '抽出効率判定',
  ];
  const rows = results.map((r) => {
    const info = getExtractionLevelInfo(r.extractionLevel);
    return [
      escapeCsvField(r.solvent.name),
      round3(r.solvent.hsp.deltaD), round3(r.solvent.hsp.deltaP), round3(r.solvent.hsp.deltaH),
      round3(r.ra), round3(r.red),
      r.extractionLevel,
      escapeCsvField(`${info.label}（${info.description}）`),
    ].join(',');
  });
  return BOM + [headers.join(','), ...rows].join('\r\n') + '\r\n';
}

export function formatResidualSolventCsv(results: ResidualSolventResult[]): string {
  const BOM = '\uFEFF';
  const headers = [
    '溶媒名', '溶媒 δD', '溶媒 δP', '溶媒 δH',
    'Ra', 'RED', '残留リスクレベル', '残留リスク判定',
  ];
  const rows = results.map((r) => {
    const info = getResidualLevelInfo(r.residualLevel);
    return [
      escapeCsvField(r.solvent.name),
      round3(r.solvent.hsp.deltaD), round3(r.solvent.hsp.deltaP), round3(r.solvent.hsp.deltaH),
      round3(r.ra), round3(r.red),
      r.residualLevel,
      escapeCsvField(`${info.label}（${info.description}）`),
    ].join(',');
  });
  return BOM + [headers.join(','), ...rows].join('\r\n') + '\r\n';
}
