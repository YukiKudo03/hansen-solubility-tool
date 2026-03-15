/**
 * CSV レポート生成
 * BOM付きUTF-8でExcelでの文字化けを防止
 */
import type { GroupEvaluationResult, NanoDispersionEvaluationResult, GroupContactAngleResult, GroupSwellingResult, DrugSolubilityScreeningResult, BlendOptimizationResult } from './types';
import { getRiskLevelInfo } from './risk';
import { getDispersibilityLevelInfo } from './dispersibility';
import { getWettabilityLevelInfo } from './wettability';
import { getSwellingLevelInfo } from './swelling';
import { getDrugSolubilityLevelInfo } from './drug-solubility';

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
