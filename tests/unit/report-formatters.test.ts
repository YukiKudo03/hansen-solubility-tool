/**
 * report.ts の未テスト CSV フォーマッター関数のカバレッジ向上テスト
 *
 * 既テスト: formatCsv, formatNanoDispersionCsv, formatContactAngleCsv,
 *   formatSwellingCsv, formatDrugSolubilityCsv, formatChemicalResistanceCsv,
 *   formatPlasticizerCsv, formatCarrierSelectionCsv, formatBlendOptimizationCsv
 */
import { describe, it, expect } from 'vitest';
import {
  formatDispersantSelectionCsv,
  formatESCScreeningCsv,
  formatCocrystalScreeningCsv,
  formatPrinting3dSmoothingCsv,
  formatDielectricFilmCsv,
  formatExcipientCompatibilityCsv,
  formatPolymerBlendCsv,
  formatRecyclingCompatibilityCsv,
  formatCompatibilizerCsv,
  formatCopolymerHspCsv,
  formatAdditiveMigrationCsv,
  formatFlavorScalpingCsv,
  formatFoodPackagingMigrationCsv,
  formatFragranceEncapsulationCsv,
  formatTransdermalEnhancerCsv,
  formatLiposomePermeabilityCsv,
  formatPigmentDispersionCsv,
  formatCNTGrapheneDispersionCsv,
  formatMXeneDispersionCsv,
  formatDrugLoadingCsv,
  formatGasPermeabilityCsv,
  formatMembraneSeparationCsv,
  formatCO2AbsorbentCsv,
  formatHydrogenStorageCsv,
  formatInkSubstrateAdhesionCsv,
  formatMultilayerCoatingCsv,
  formatPSAPeelStrengthCsv,
  formatStructuralAdhesiveJointCsv,
  formatSurfaceTreatmentCsv,
  formatSunscreenUVFilterCsv,
  formatInhalationDrugCsv,
  formatProteinAggregationCsv,
  formatBiologicBufferCsv,
  formatTemperatureHSPCorrectionCsv,
  formatPressureHSPCorrectionCsv,
  formatSCCO2CosolventCsv,
  formatCleaningFormulationCsv,
  formatNaturalDyeExtractionCsv,
  formatEssentialOilExtractionCsv,
  formatSoilRemediationCsv,
  formatResidualSolventCsv,
  formatCoatingDefectCsv,
  formatPhotoresistDeveloperCsv,
  formatPerovskiteSolventCsv,
  formatOSCSolventCsv,
  formatUVInkMonomerCsv,
  formatPrintedElectronicsWettingCsv,
  formatQDLigandExchangeCsv,
  formatUnderfillEncapsulantCsv,
  formatBiofuelCompatibilityCsv,
  formatPCMEncapsulationCsv,
  formatHSPUncertaintyCsv,
  formatSurfaceHSPDeterminationCsv,
  formatIonicLiquidHSPCsv,
  formatMLHSPPredictionCsv,
  formatMDHSPImportCsv,
  formatExtendedGroupContributionCsv,
  formatPolymorphRiskCsv,
  formatAntiGraffitiCsv,
  formatPrimerlessAdhesionCsv,
} from '../../src/core/report';

import { ESCRiskLevel } from '../../src/core/esc-classification';
import { CocrystalLikelihood } from '../../src/core/cocrystal-screening';
import { SmoothingEffectLevel } from '../../src/core/printing3d-smoothing';
import { FilmQualityLevel } from '../../src/core/dielectric-film';
import { CompatibilityLevel } from '../../src/core/excipient-compatibility';
import { DispersantAffinityLevel, DispersibilityLevel } from '../../src/core/types';
import { MigrationLevel } from '../../src/core/additive-migration';
import { ScalpingLevel } from '../../src/core/flavor-scalping';
import { PackagingMigrationLevel } from '../../src/core/food-packaging-migration';
import { EncapsulationLevel } from '../../src/core/fragrance-encapsulation';
import { TransdermalEnhancerLevel } from '../../src/core/transdermal-enhancer';
import { PermeabilityLevel } from '../../src/core/liposome-permeability';
import { StabilityLevel } from '../../src/core/pigment-dispersion-stability';
import { LoadingLevel } from '../../src/core/nanoparticle-drug-loading';
import { GasPermeabilityLevel } from '../../src/core/polymer-membrane-gas-permeability';
import { SelectivityLevel } from '../../src/core/membrane-separation-selectivity';
import { CO2AbsorptionLevel } from '../../src/core/co2-absorbent-selection';
import { H2StorageCompatibilityLevel } from '../../src/core/hydrogen-storage-material';
import { SolubilityLevel } from '../../src/core/sunscreen-uv-filter';
import { FormulationType } from '../../src/core/inhalation-drug-propellant';
import { ProteinStabilityLevel } from '../../src/core/protein-aggregation-risk';
import { BufferStabilityLevel } from '../../src/core/biologic-formulation-buffer';
import { CleaningLevel } from '../../src/core/cleaning-product-formulation';
import { ExtractionLevel } from '../../src/core/natural-dye-extraction';
import { ResidualLevel } from '../../src/core/residual-solvent-prediction';
import { DefectRisk } from '../../src/core/coating-defect-prediction';
import { ContrastQuality } from '../../src/core/dissolution-contrast';
import { MonomerSuitability } from '../../src/core/uv-curable-ink-monomer';
import { UnderfillLevel } from '../../src/core/underfill-encapsulant';
import { SolventRole } from '../../src/core/perovskite-solvent-engineering';
import { FilmFormationLevel } from '../../src/core/organic-semiconductor-film';
import { WettingLevel } from '../../src/core/printed-electronics-wetting';
import { LigandExchangeLevel } from '../../src/core/quantum-dot-ligand-exchange';
import { BiofuelCompatibilityLevel } from '../../src/core/biofuel-material-compatibility';
import { PCMEncapsulationLevel } from '../../src/core/pcm-encapsulation';
import { PolymorphRiskLevel } from '../../src/core/polymorph-solvate-risk';
import { AntiGraffitiLevel } from '../../src/core/anti-graffiti-coating';
import { PrimerlessAdhesionLevel } from '../../src/core/primerless-adhesion';

// ─── 共通ヘルパー ───────────────────────────
const BOM = '\uFEFF';
const hsp = { deltaD: 18, deltaP: 5, deltaH: 7 };
const solvent = { name: 'Toluene', hsp, boilingPoint: 110.6 };
const date = new Date('2026-01-01T00:00:00Z');

function assertBomCsv(csv: string, expectedHeader: string) {
  expect(csv.startsWith(BOM)).toBe(true);
  expect(csv).toContain(expectedHeader);
  expect(csv).toContain('\r\n');
}

function assertEmptyResults(csv: string) {
  const lines = csv.split('\r\n').filter((l) => l.length > 0);
  expect(lines.length).toBe(1); // header only
}

// ─── formatDispersantSelectionCsv ───────────────────────────
describe('formatDispersantSelectionCsv', () => {
  const makeResult = () => ({
    particle: { id: 1, name: 'NP', nameEn: null, category: 'carbon', coreMaterial: 'C', surfaceLigand: null, hsp, r0: 3, particleSize: null, notes: null },
    solvent: { id: 1, name: 'Tol', nameEn: null, casNumber: null, hsp, molarVolume: null, molWeight: null, boilingPoint: null, viscosity: null, specificGravity: null, surfaceTension: null, notes: null },
    results: [{
      dispersant: { id: 1, name: 'Disp1', dispersantType: 'polymeric', anchor: { hsp, r0: 3 }, solvation: { hsp, r0: 4 }, overall: { hsp }, hlb: null, molWeight: null, notes: null },
      particle: { id: 1, name: 'NP', nameEn: null, category: 'carbon', coreMaterial: 'C', surfaceLigand: null, hsp, r0: 3, particleSize: null, notes: null },
      solvent: { id: 1, name: 'Tol', nameEn: null, casNumber: null, hsp, molarVolume: null, molWeight: null, boilingPoint: null, viscosity: null, specificGravity: null, surfaceTension: null, notes: null },
      raAnchor: 1.5, redAnchor: 0.5, affinityAnchor: DispersantAffinityLevel.Good,
      raSolvation: 2.0, redSolvation: 0.5, affinitySolvation: DispersantAffinityLevel.Good,
      compositeScore: 0.5, overallLevel: DispersantAffinityLevel.Good,
    }],
    evaluatedAt: date,
    thresholdsUsed: { excellentMax: 0.3, goodMax: 0.6, fairMax: 0.8, poorMax: 1.2 },
  });
  it('BOM付きCSVを出力する', () => { assertBomCsv(formatDispersantSelectionCsv(makeResult() as any), '分散剤名'); });
  it('空結果でヘッダーのみ', () => { const r = makeResult() as any; r.results = []; assertEmptyResults(formatDispersantSelectionCsv(r)); });
});

// ─── formatESCScreeningCsv ───────────────────────────
describe('formatESCScreeningCsv', () => {
  it('BOM付きCSVを出力', () => {
    const csv = formatESCScreeningCsv([{ solvent, ra: 2, red: 0.5, risk: ESCRiskLevel.Safe }]);
    assertBomCsv(csv, 'ESCリスクレベル');
  });
  it('空配列でヘッダーのみ', () => { assertEmptyResults(formatESCScreeningCsv([])); });
});

// ─── formatCocrystalScreeningCsv ───────────────────────────
describe('formatCocrystalScreeningCsv', () => {
  it('BOM付きCSVを出力', () => {
    const csv = formatCocrystalScreeningCsv([{ coformer: { name: 'CF', hsp }, ra: 1, red: 0.3, likelihood: CocrystalLikelihood.Likely }]);
    assertBomCsv(csv, '形成可能性レベル');
  });
  it('空配列でヘッダーのみ', () => { assertEmptyResults(formatCocrystalScreeningCsv([])); });
});

// ─── formatPrinting3dSmoothingCsv ───────────────────────────
describe('formatPrinting3dSmoothingCsv', () => {
  it('BOM付きCSVを出力', () => {
    const csv = formatPrinting3dSmoothingCsv([{ solvent, ra: 1, red: 0.5, effect: SmoothingEffectLevel.GoodSmoothing }]);
    assertBomCsv(csv, '平滑化効果レベル');
  });
  it('空配列でヘッダーのみ', () => { assertEmptyResults(formatPrinting3dSmoothingCsv([])); });
});

// ─── formatDielectricFilmCsv ───────────────────────────
describe('formatDielectricFilmCsv', () => {
  it('BOM付きCSVを出力', () => {
    const csv = formatDielectricFilmCsv([{ solvent, ra: 1, red: 0.5, filmQuality: FilmQualityLevel.Good }]);
    assertBomCsv(csv, '薄膜品質レベル');
  });
  it('空配列でヘッダーのみ', () => { assertEmptyResults(formatDielectricFilmCsv([])); });
});

// ─── formatExcipientCompatibilityCsv ───────────────────────────
describe('formatExcipientCompatibilityCsv', () => {
  it('BOM付きCSVを出力', () => {
    const csv = formatExcipientCompatibilityCsv([{ excipient: { name: 'Ex', hsp }, ra: 1, red: 0.3, compatibility: CompatibilityLevel.Compatible }]);
    assertBomCsv(csv, '適合性レベル');
  });
  it('空配列でヘッダーのみ', () => { assertEmptyResults(formatExcipientCompatibilityCsv([])); });
});

// ─── formatPolymerBlendCsv ───────────────────────────
describe('formatPolymerBlendCsv', () => {
  it('BOM付きCSVを出力', () => {
    const csv = formatPolymerBlendCsv([{ polymer1Name: 'P1', polymer2Name: 'P2', polymer1HSP: hsp, polymer2HSP: hsp, ra: 2, chiParameter: 0.5, miscibility: 'miscible' }]);
    assertBomCsv(csv, 'χパラメータ');
  });
  it('空配列でヘッダーのみ', () => { assertEmptyResults(formatPolymerBlendCsv([])); });
  it('未定義miscibilityでもフォールバック', () => {
    const csv = formatPolymerBlendCsv([{ polymer1Name: 'P1', polymer2Name: 'P2', polymer1HSP: hsp, polymer2HSP: hsp, ra: 2, chiParameter: 0.5, miscibility: 'unknown' }]);
    expect(csv).toContain('unknown');
  });
});

// ─── formatRecyclingCompatibilityCsv ───────────────────────────
describe('formatRecyclingCompatibilityCsv', () => {
  it('BOM付きCSVを出力', () => {
    const csv = formatRecyclingCompatibilityCsv([{ polymer1Name: 'P1', polymer2Name: 'P2', ra: 2, chiParameter: 0.5, miscibility: 'immiscible' }]);
    assertBomCsv(csv, '相溶性判定');
  });
  it('空配列でヘッダーのみ', () => { assertEmptyResults(formatRecyclingCompatibilityCsv([])); });
});

// ─── formatCompatibilizerCsv ───────────────────────────
describe('formatCompatibilizerCsv', () => {
  it('BOM付きCSVを出力', () => {
    const csv = formatCompatibilizerCsv([{ compatibilizerName: 'C1', raToPolymer1: 2, raToPolymer2: 3, overallScore: 2.5, compatibility: 'good' }]);
    assertBomCsv(csv, '相溶化剤名');
  });
  it('空配列でヘッダーのみ', () => { assertEmptyResults(formatCompatibilizerCsv([])); });
});

// ─── formatCopolymerHspCsv ───────────────────────────
describe('formatCopolymerHspCsv', () => {
  it('BOM付きCSVを出力', () => {
    const csv = formatCopolymerHspCsv({
      monomers: [{ name: 'A', deltaD: 18, deltaP: 5, deltaH: 7, fraction: 0.6 }, { name: 'B', deltaD: 15, deltaP: 8, deltaH: 10, fraction: 0.4 }],
      estimatedHSP: hsp,
    });
    assertBomCsv(csv, 'モノマー名');
    expect(csv).toContain('【推定HSP】');
  });
});

// ─── 添加剤移行系 ───────────────────────────
describe('formatAdditiveMigrationCsv', () => {
  it('BOM付きCSVを出力', () => {
    const csv = formatAdditiveMigrationCsv([{ additive: { name: 'Add', hsp }, polymer: { name: 'Pol', hsp, r0: 5 }, ra: 2, red: 0.4, migrationLevel: MigrationLevel.Stable }]);
    assertBomCsv(csv, '移行リスクレベル');
  });
  it('空配列でヘッダーのみ', () => { assertEmptyResults(formatAdditiveMigrationCsv([])); });
});

describe('formatFlavorScalpingCsv', () => {
  it('BOM付きCSVを出力', () => {
    const csv = formatFlavorScalpingCsv([{ aroma: { name: 'Ar', hsp }, packaging: { name: 'Pk', hsp, r0: 5 }, ra: 2, red: 0.4, scalpingLevel: ScalpingLevel.LowScalping }]);
    assertBomCsv(csv, 'スカルピングレベル');
  });
  it('空配列でヘッダーのみ', () => { assertEmptyResults(formatFlavorScalpingCsv([])); });
});

describe('formatFoodPackagingMigrationCsv', () => {
  it('BOM付きCSVを出力', () => {
    const csv = formatFoodPackagingMigrationCsv([{ migrantName: 'Mg', migrantHSP: hsp, ra: 2, red: 0.4, migrationLevel: PackagingMigrationLevel.LowRisk }]);
    assertBomCsv(csv, '溶出リスクレベル');
  });
  it('空配列でヘッダーのみ', () => { assertEmptyResults(formatFoodPackagingMigrationCsv([])); });
});

describe('formatFragranceEncapsulationCsv', () => {
  it('BOM付きCSVを出力', () => {
    const csv = formatFragranceEncapsulationCsv([{ fragranceName: 'Fr', fragranceHSP: hsp, ra: 2, red: 0.4, encapsulationLevel: EncapsulationLevel.Good }]);
    assertBomCsv(csv, 'カプセル化適合性レベル');
  });
  it('空配列でヘッダーのみ', () => { assertEmptyResults(formatFragranceEncapsulationCsv([])); });
});

describe('formatTransdermalEnhancerCsv', () => {
  it('BOM付きCSVを出力', () => {
    const csv = formatTransdermalEnhancerCsv([{ enhancerName: 'Enh', enhancerHSP: hsp, raDrugEnhancer: 2, raSkinEnhancer: 1, compositeScore: 1.5, level: TransdermalEnhancerLevel.Good }]);
    assertBomCsv(csv, '適合性レベル');
  });
  it('空配列でヘッダーのみ', () => { assertEmptyResults(formatTransdermalEnhancerCsv([])); });
});

describe('formatLiposomePermeabilityCsv', () => {
  it('BOM付きCSVを出力', () => {
    const csv = formatLiposomePermeabilityCsv([{ drugName: 'Dr', drugHSP: hsp, ra: 2, red: 0.4, permeabilityLevel: PermeabilityLevel.HighPermeability }]);
    assertBomCsv(csv, '透過性レベル');
  });
  it('空配列でヘッダーのみ', () => { assertEmptyResults(formatLiposomePermeabilityCsv([])); });
});

// ─── ナノ材料分散群 ───────────────────────────
describe('formatPigmentDispersionCsv', () => {
  it('BOM付きCSVを出力', () => {
    const csv = formatPigmentDispersionCsv([{ vehicle: { name: 'V', hsp }, ra: 1, red: 0.3, stability: StabilityLevel.Stable }]);
    assertBomCsv(csv, '安定性レベル');
  });
  it('空配列でヘッダーのみ', () => { assertEmptyResults(formatPigmentDispersionCsv([])); });
});

describe('formatCNTGrapheneDispersionCsv', () => {
  it('BOM付きCSVを出力', () => {
    const csv = formatCNTGrapheneDispersionCsv([{ solvent: { name: 'S', hsp }, ra: 1, red: 0.3, dispersibility: DispersibilityLevel.Excellent }]);
    assertBomCsv(csv, '分散性レベル');
  });
  it('空配列でヘッダーのみ', () => { assertEmptyResults(formatCNTGrapheneDispersionCsv([])); });
});

describe('formatMXeneDispersionCsv', () => {
  it('BOM付きCSVを出力', () => {
    const csv = formatMXeneDispersionCsv([{ solvent: { name: 'S', hsp }, ra: 1, red: 0.3, dispersibility: DispersibilityLevel.Good }]);
    assertBomCsv(csv, '分散性レベル');
  });
  it('空配列でヘッダーのみ', () => { assertEmptyResults(formatMXeneDispersionCsv([])); });
});

describe('formatDrugLoadingCsv', () => {
  it('BOM付きCSVを出力', () => {
    const csv = formatDrugLoadingCsv([{ drug: { name: 'D', hsp }, ra: 1, red: 0.3, loadingLevel: LoadingLevel.High }]);
    assertBomCsv(csv, 'ローディングレベル');
  });
  it('空配列でヘッダーのみ', () => { assertEmptyResults(formatDrugLoadingCsv([])); });
});

// ─── Gas-Solubility群 ───────────────────────────
describe('formatGasPermeabilityCsv', () => {
  it('BOM付きCSVを出力', () => {
    const csv = formatGasPermeabilityCsv({
      polymerHSP: hsp,
      results: [{ gasName: 'O2', ra2: 10, relativePermeability: 0.5, selectivity: 2.0 }],
      evaluatedAt: date,
    });
    assertBomCsv(csv, '透過性レベル');
  });
  it('Infinity値の処理', () => {
    const csv = formatGasPermeabilityCsv({
      polymerHSP: hsp,
      results: [{ gasName: 'O2', ra2: 0, relativePermeability: Infinity, selectivity: Infinity }],
      evaluatedAt: date,
    });
    expect(csv).toContain('Inf');
  });
});

describe('formatMembraneSeparationCsv', () => {
  it('BOM付きCSVを出力', () => {
    const csv = formatMembraneSeparationCsv({
      targetName: 'T', impurityName: 'I',
      targetRa: 2, targetRa2: 4, impurityRa: 5, impurityRa2: 25,
      selectivityRatio: 6.25, selectivityLevel: SelectivityLevel.Good,
      evaluatedAt: date,
    } as any);
    assertBomCsv(csv, '選択性レベル');
  });
  it('Infinity selectivityRatio', () => {
    const csv = formatMembraneSeparationCsv({
      targetName: 'T', impurityName: 'I',
      targetRa: 2, targetRa2: 4, impurityRa: 5, impurityRa2: 25,
      selectivityRatio: Infinity, selectivityLevel: SelectivityLevel.Excellent,
      evaluatedAt: date,
    } as any);
    expect(csv).toContain('Inf');
  });
});

describe('formatCO2AbsorbentCsv', () => {
  it('BOM付きCSVを出力', () => {
    const csv = formatCO2AbsorbentCsv({
      results: [{ absorbent: 'Ab', absorbentHSP: hsp, ra: 2, red: 0.4, absorptionLevel: CO2AbsorptionLevel.Good }],
      evaluatedAt: date,
    } as any);
    assertBomCsv(csv, '吸収性レベル');
  });
});

describe('formatHydrogenStorageCsv', () => {
  it('BOM付きCSVを出力', () => {
    const csv = formatHydrogenStorageCsv({
      results: [{ solventName: 'S', solventHSP: hsp, ra: 2, red: 0.4, compatibilityLevel: H2StorageCompatibilityLevel.Good }],
      evaluatedAt: date,
    } as any);
    assertBomCsv(csv, '適合性レベル');
  });
});

// ─── Work-of-Adhesion群 ───────────────────────────
describe('formatInkSubstrateAdhesionCsv', () => {
  it('BOM付きCSVを出力', () => {
    const csv = formatInkSubstrateAdhesionCsv({ inkHSP: hsp, substrateHSP: hsp, wa: 60, ra: 2, level: 1, evaluatedAt: date } as any);
    assertBomCsv(csv, '密着レベル');
  });
});

describe('formatMultilayerCoatingCsv', () => {
  it('BOM付きCSVを出力', () => {
    const csv = formatMultilayerCoatingCsv({
      interfaces: [{ layer1Name: 'L1', layer2Name: 'L2', wa: 50, ra: 2, level: 2 }],
      weakestIndex: 0, evaluatedAt: date,
    } as any);
    assertBomCsv(csv, '最弱界面');
    expect(csv).toContain('Yes');
  });
});

describe('formatPSAPeelStrengthCsv', () => {
  it('BOM付きCSVを出力', () => {
    const csv = formatPSAPeelStrengthCsv({ psaHSP: hsp, adherendHSP: hsp, wa: 60, ra: 2, estimatedPeelForce: 5, peelLevel: 1, evaluatedAt: date } as any);
    assertBomCsv(csv, '推定剥離力');
  });
});

describe('formatStructuralAdhesiveJointCsv', () => {
  it('BOM付きCSVを出力', () => {
    const csv = formatStructuralAdhesiveJointCsv({
      adhesiveHSP: hsp, adherend1HSP: hsp, adherend2HSP: hsp,
      wa1: 50, wa2: 40, ra1: 2, ra2: 3, bottleneckSide: 2, evaluatedAt: date,
    } as any);
    assertBomCsv(csv, 'ボトルネック');
  });
});

describe('formatSurfaceTreatmentCsv', () => {
  it('BOM付きCSVを出力', () => {
    const csv = formatSurfaceTreatmentCsv({
      beforeHSP: hsp, afterHSP: hsp, targetHSP: hsp,
      waBefore: 40, waAfter: 60, raBefore: 5, raAfter: 2, improvementRatio: 50, evaluatedAt: date,
    } as any);
    assertBomCsv(csv, '改善率');
  });
});

// ─── 医薬品・化粧品群 ───────────────────────────
describe('formatSunscreenUVFilterCsv', () => {
  it('BOM付きCSVを出力', () => {
    const csv = formatSunscreenUVFilterCsv([{ uvFilter: { name: 'UV', hsp }, ra: 1, red: 0.3, solubility: SolubilityLevel.Excellent }]);
    assertBomCsv(csv, '溶解性レベル');
  });
  it('空配列でヘッダーのみ', () => { assertEmptyResults(formatSunscreenUVFilterCsv([])); });
});

describe('formatInhalationDrugCsv', () => {
  it('BOM付きCSVを出力', () => {
    const csv = formatInhalationDrugCsv({
      drugHSP: hsp, propellantHSP: hsp, ra: 2, red: 0.5,
      formulation: FormulationType.Solution, evaluatedAt: date,
    } as any);
    assertBomCsv(csv, '製剤形態');
  });
});

describe('formatProteinAggregationCsv', () => {
  it('BOM付きCSVを出力', () => {
    const csv = formatProteinAggregationCsv({
      proteinSurfaceHSP: hsp, bufferHSP: hsp, ra: 2, red: 0.5,
      stability: ProteinStabilityLevel.Stable, evaluatedAt: date,
    } as any);
    assertBomCsv(csv, '安定性レベル');
  });
});

describe('formatBiologicBufferCsv', () => {
  it('BOM付きCSVを出力', () => {
    const csv = formatBiologicBufferCsv([{ buffer: { name: 'Buf', hsp }, ra: 1, red: 0.3, stability: BufferStabilityLevel.Excellent, associatingCorrectionApplied: true }]);
    assertBomCsv(csv, '会合液体補正');
    expect(csv).toContain('適用');
  });
  it('空配列でヘッダーのみ', () => { assertEmptyResults(formatBiologicBufferCsv([])); });
});

// ─── 温度・圧力補正群 ───────────────────────────
describe('formatTemperatureHSPCorrectionCsv', () => {
  it('BOM付きCSVを出力', () => {
    const csv = formatTemperatureHSPCorrectionCsv({
      original: hsp, corrected: hsp, temperature: 50, referenceTemp: 25, alpha: 0.001,
      solventName: 'Tol', associatingCorrectionApplied: false,
    });
    assertBomCsv(csv, '体積膨張係数');
  });
  it('solventName省略時は空文字', () => {
    const csv = formatTemperatureHSPCorrectionCsv({
      original: hsp, corrected: hsp, temperature: 50, referenceTemp: 25, alpha: 0.001,
      associatingCorrectionApplied: true,
    });
    expect(csv).toContain('適用');
  });
});

describe('formatPressureHSPCorrectionCsv', () => {
  it('BOM付きCSVを出力', () => {
    const csv = formatPressureHSPCorrectionCsv({
      original: hsp, corrected: hsp, pressureRef: 0.1, pressureTarget: 10, temperature: 300, isothermalCompressibility: 0.001,
    });
    assertBomCsv(csv, '等温圧縮率');
  });
});

describe('formatSCCO2CosolventCsv', () => {
  it('BOM付きCSVを出力', () => {
    const csv = formatSCCO2CosolventCsv({
      co2HSP: hsp, targetHSP: hsp, targetR0: 5,
      results: [{ cosolventName: 'EtOH', volumeFraction: 0.1, blendHSP: hsp, ra: 2, red: 0.4 }],
      evaluatedAt: date,
    } as any);
    assertBomCsv(csv, '共溶媒名');
  });
});

// ─── 抽出・洗浄群 ───────────────────────────
describe('formatCleaningFormulationCsv', () => {
  it('BOM付きCSVを出力', () => {
    const csv = formatCleaningFormulationCsv([{ solvent: { name: 'S', hsp }, ra: 1, red: 0.3, cleaningLevel: CleaningLevel.Excellent }]);
    assertBomCsv(csv, '洗浄効果レベル');
  });
  it('空配列でヘッダーのみ', () => { assertEmptyResults(formatCleaningFormulationCsv([])); });
});

describe('formatNaturalDyeExtractionCsv', () => {
  it('BOM付きCSVを出力', () => {
    const csv = formatNaturalDyeExtractionCsv([{ solvent: { name: 'S', hsp }, ra: 1, red: 0.3, extractionLevel: ExtractionLevel.Excellent }]);
    assertBomCsv(csv, '抽出効率レベル');
  });
  it('空配列でヘッダーのみ', () => { assertEmptyResults(formatNaturalDyeExtractionCsv([])); });
});

describe('formatEssentialOilExtractionCsv', () => {
  it('BOM付きCSVを出力', () => {
    const csv = formatEssentialOilExtractionCsv([{ solvent: { name: 'S', hsp }, ra: 1, red: 0.3, extractionLevel: ExtractionLevel.Good }]);
    assertBomCsv(csv, '抽出効率レベル');
  });
  it('空配列でヘッダーのみ', () => { assertEmptyResults(formatEssentialOilExtractionCsv([])); });
});

describe('formatSoilRemediationCsv', () => {
  it('BOM付きCSVを出力', () => {
    const csv = formatSoilRemediationCsv([{ solvent: { name: 'S', hsp }, ra: 1, red: 0.3, extractionLevel: ExtractionLevel.Good }]);
    assertBomCsv(csv, '抽出効率レベル');
  });
  it('空配列でヘッダーのみ', () => { assertEmptyResults(formatSoilRemediationCsv([])); });
});

describe('formatResidualSolventCsv', () => {
  it('BOM付きCSVを出力', () => {
    const csv = formatResidualSolventCsv([{ solvent: { name: 'S', hsp }, ra: 1, red: 0.3, residualLevel: ResidualLevel.LowResidual }]);
    assertBomCsv(csv, '残留リスクレベル');
  });
  it('空配列でヘッダーのみ', () => { assertEmptyResults(formatResidualSolventCsv([])); });
});

// ─── dissolution-contrast群 ───────────────────────────
describe('formatCoatingDefectCsv', () => {
  it('BOM付きCSVを出力', () => {
    const csv = formatCoatingDefectCsv({
      raCoatingSubstrate: 2, raCoatingSolvent: 3, adhesionRisk: true, marangoniRisk: false, defectRisk: DefectRisk.Moderate, evaluatedAt: date,
    } as any);
    assertBomCsv(csv, '欠陥リスク');
    expect(csv).toContain('あり');
    expect(csv).toContain('なし');
  });
});

describe('formatPhotoresistDeveloperCsv', () => {
  it('BOM付きCSVを出力', () => {
    const csv = formatPhotoresistDeveloperCsv({ contrast: 3.5, quality: ContrastQuality.Good, evaluatedAt: date } as any);
    assertBomCsv(csv, '品質');
  });
  it('contrast=Infinity', () => {
    const csv = formatPhotoresistDeveloperCsv({ contrast: Infinity, quality: ContrastQuality.Good, evaluatedAt: date } as any);
    expect(csv).toContain('Infinity');
  });
});

describe('formatPerovskiteSolventCsv', () => {
  it('BOM付きCSVを出力', () => {
    const csv = formatPerovskiteSolventCsv([{ solvent: { name: 'S', hsp }, ra: 1, red: 0.3, role: SolventRole.ProcessingSolvent }]);
    assertBomCsv(csv, '溶媒役割');
  });
  it('空配列でヘッダーのみ', () => { assertEmptyResults(formatPerovskiteSolventCsv([])); });
});

describe('formatOSCSolventCsv', () => {
  it('BOM付きCSVを出力', () => {
    const csv = formatOSCSolventCsv([{ solvent, ra: 1, red: 0.3, filmFormation: FilmFormationLevel.Good }]);
    assertBomCsv(csv, '薄膜形成レベル');
  });
  it('空配列でヘッダーのみ', () => { assertEmptyResults(formatOSCSolventCsv([])); });
});

describe('formatUVInkMonomerCsv', () => {
  it('BOM付きCSVを出力', () => {
    const csv = formatUVInkMonomerCsv([{ monomer: { name: 'M', hsp }, ra: 1, red: 0.3, suitability: MonomerSuitability.Excellent }]);
    assertBomCsv(csv, '適合性レベル');
  });
  it('空配列でヘッダーのみ', () => { assertEmptyResults(formatUVInkMonomerCsv([])); });
});

// ─── Phase 13+14群 ───────────────────────────
describe('formatPrintedElectronicsWettingCsv', () => {
  it('BOM付きCSVを出力', () => {
    const csv = formatPrintedElectronicsWettingCsv({
      inkHSP: hsp, substrateHSP: hsp, wa: 60, contactAngle: 30, ra: 2,
      wettingLevel: WettingLevel.Good, evaluatedAt: date,
    } as any);
    assertBomCsv(csv, '濡れ性レベル');
  });
});

describe('formatQDLigandExchangeCsv', () => {
  it('BOM付きCSVを出力', () => {
    const csv = formatQDLigandExchangeCsv([{ solventName: 'S', solventHSP: hsp, ra: 1, red: 0.3, level: LigandExchangeLevel.Excellent }]);
    assertBomCsv(csv, '適合性レベル');
  });
  it('空配列でヘッダーのみ', () => { assertEmptyResults(formatQDLigandExchangeCsv([])); });
});

describe('formatUnderfillEncapsulantCsv', () => {
  it('BOM付きCSVを出力', () => {
    const csv = formatUnderfillEncapsulantCsv({
      encapsulantHSP: hsp, chipSurfaceHSP: hsp, substrateHSP: hsp,
      waChip: 50, waSubstrate: 45, raChip: 2, raSubstrate: 3,
      bottleneck: 'chip', level: UnderfillLevel.Good, evaluatedAt: date,
    } as any);
    assertBomCsv(csv, 'ボトルネック');
    expect(csv).toContain('チップ側');
  });
  it('基板側ボトルネック', () => {
    const csv = formatUnderfillEncapsulantCsv({
      encapsulantHSP: hsp, chipSurfaceHSP: hsp, substrateHSP: hsp,
      waChip: 50, waSubstrate: 45, raChip: 2, raSubstrate: 3,
      bottleneck: 'substrate', level: UnderfillLevel.Good, evaluatedAt: date,
    } as any);
    expect(csv).toContain('基板側');
  });
});

describe('formatBiofuelCompatibilityCsv', () => {
  it('BOM付きCSVを出力', () => {
    const csv = formatBiofuelCompatibilityCsv([{ materialName: 'M', materialHSP: hsp, ra: 1, red: 0.3, level: BiofuelCompatibilityLevel.Safe }]);
    assertBomCsv(csv, '適合性レベル');
  });
  it('空配列でヘッダーのみ', () => { assertEmptyResults(formatBiofuelCompatibilityCsv([])); });
});

describe('formatPCMEncapsulationCsv', () => {
  it('BOM付きCSVを出力', () => {
    const csv = formatPCMEncapsulationCsv([{ shellMaterialName: 'Sh', shellMaterialHSP: hsp, ra: 1, red: 0.3, level: PCMEncapsulationLevel.Excellent }]);
    assertBomCsv(csv, '安定性レベル');
  });
  it('空配列でヘッダーのみ', () => { assertEmptyResults(formatPCMEncapsulationCsv([])); });
});

describe('formatHSPUncertaintyCsv', () => {
  it('BOM付きCSVを出力', () => {
    const csv = formatHSPUncertaintyCsv({
      center: hsp, r0: 5,
      confidence95: {
        deltaD: { low: 17, high: 19 },
        deltaP: { low: 4, high: 6 },
        deltaH: { low: 6, high: 8 },
        r0: { low: 4, high: 6 },
      },
      numSamples: 100, evaluatedAt: date,
    } as any);
    assertBomCsv(csv, '95%CI下限');
  });
});

describe('formatSurfaceHSPDeterminationCsv', () => {
  it('BOM付きCSVを出力', () => {
    const csv = formatSurfaceHSPDeterminationCsv({
      surfaceHSP: hsp,
      surfaceEnergy: { gammaD: 20, gammaP: 5, gammaH: 3, gammaTotal: 28 },
      numDataPoints: 5, residualError: 0.1, evaluatedAt: date,
    } as any);
    assertBomCsv(csv, '推定 δD');
  });
});

describe('formatIonicLiquidHSPCsv', () => {
  it('BOM付きCSVを出力', () => {
    const csv = formatIonicLiquidHSPCsv({
      cationHSP: hsp, anionHSP: hsp, cationRatio: 0.5, anionRatio: 0.5,
      blendHSP: hsp, temperatureCorrected: true, evaluatedAt: date,
    } as any);
    assertBomCsv(csv, 'カチオン δD');
    expect(csv).toContain('適用');
  });
  it('温度補正なし', () => {
    const csv = formatIonicLiquidHSPCsv({
      cationHSP: hsp, anionHSP: hsp, cationRatio: 0.5, anionRatio: 0.5,
      blendHSP: hsp, temperatureCorrected: false, evaluatedAt: date,
    } as any);
    expect(csv).not.toContain('適用');
  });
});

// ─── Phase 15群 ───────────────────────────
describe('formatMLHSPPredictionCsv', () => {
  it('BOM付きCSVを出力', () => {
    const csv = formatMLHSPPredictionCsv({
      descriptors: { molarVolume: 100, logP: 1.5, numHBDonors: 1, numHBAcceptors: 2, aromaticRings: 1 },
      hsp, confidence: 'high', evaluatedAt: date,
    } as any);
    assertBomCsv(csv, 'モル体積');
  });
});

describe('formatMDHSPImportCsv', () => {
  it('BOM付きCSVを出力', () => {
    const csv = formatMDHSPImportCsv({
      ced: { totalCED: 100, dispersionCED: 50, polarCED: 30, hbondCED: 20 },
      molarVolume: 100, hsp, totalSolubilityParameter: 22, consistency: 95, evaluatedAt: date,
    } as any);
    assertBomCsv(csv, '整合性');
  });
});

describe('formatExtendedGroupContributionCsv', () => {
  it('BOM付きCSVを出力', () => {
    const csv = formatExtendedGroupContributionCsv({
      inputGroups: [{ groupId: 'CH3', name: 'メチル基', count: 2 }],
      hsp, method: 'VanKrevelen', confidence: 'high', evaluatedAt: date,
    } as any);
    assertBomCsv(csv, '基グループID');
    expect(csv).toContain('【推定HSP】');
  });
});

describe('formatPolymorphRiskCsv', () => {
  it('BOM付きCSVを出力', () => {
    const csv = formatPolymorphRiskCsv([{ solvent: { name: 'S', hsp }, ra: 1, red: 0.3, riskLevel: PolymorphRiskLevel.LowRisk }]);
    assertBomCsv(csv, 'リスクレベル');
  });
  it('空配列でヘッダーのみ', () => { assertEmptyResults(formatPolymorphRiskCsv([])); });
});

describe('formatAntiGraffitiCsv', () => {
  it('BOM付きCSVを出力', () => {
    const csv = formatAntiGraffitiCsv([{ graffitiMaterial: { name: 'G', hsp }, ra: 1, red: 0.3, level: AntiGraffitiLevel.Excellent }]);
    assertBomCsv(csv, '防落書き効果レベル');
  });
  it('空配列でヘッダーのみ', () => { assertEmptyResults(formatAntiGraffitiCsv([])); });
});

describe('formatPrimerlessAdhesionCsv', () => {
  it('BOM付きCSVを出力', () => {
    const csv = formatPrimerlessAdhesionCsv({
      adhesiveHSP: hsp, substrateHSP: hsp, wa: 60, ra: 2,
      level: PrimerlessAdhesionLevel.Good,
      optimalAdhesiveHSP: hsp, optimalWa: 80, improvementPotential: 33.3, evaluatedAt: date,
    } as any);
    assertBomCsv(csv, '最適Wa');
  });
});
