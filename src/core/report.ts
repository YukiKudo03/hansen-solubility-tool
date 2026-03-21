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
