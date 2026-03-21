import { describe, it, expect } from 'vitest';
import {
  validateBlendOptimizationInput,
  validateAdhesionThresholds,
  validateSolventClassifications,
  validateGreenSolventInput,
  validateMultiObjectiveInput,
  validateGroupContributionInput,
  validateDispersantInput,
  validateDispersantThresholds,
  validateESCInput,
  validateCocrystalInput,
  validatePrinting3dInput,
  validateDielectricInput,
  validateExcipientInput,
  validatePolymerBlendInput,
  validateRecyclingInput,
  validateCompatibilizerInput,
  validateCopolymerInput,
  validateAdditiveMigrationInput,
  validateFlavorScalpingInput,
  validateFoodPackagingMigrationInput,
  validateFragranceEncapsulationInput,
  validateTransdermalEnhancerInput,
  validateLiposomePermeabilityInput,
  validateInkSubstrateAdhesionInput,
  validateMultilayerCoatingInput,
  validatePSAPeelStrengthInput,
  validateStructuralAdhesiveJointInput,
  validateSurfaceTreatmentInput,
  validatePigmentDispersionInput,
  validateCNTGrapheneInput,
  validateMXeneDispersionInput,
  validateDrugLoadingInput,
  validateCleaningFormulationInput,
  validateNaturalDyeExtractionInput,
  validateEssentialOilExtractionInput,
  validateSoilRemediationInput,
  validateResidualSolventInput,
  validateTemperatureHSPCorrectionInput,
  validatePressureHSPCorrectionInput,
  validateSCCO2CosolventInput,
  validateAdhesionStrengthThresholds,
  validateSunscreenUVFilterInput,
  validateInhalationDrugInput,
  validateProteinAggregationInput,
  validateBiologicBufferInput,
  validateGasPermeabilityInput,
  validateMembraneSeparationInput,
  validateCO2AbsorbentInput,
  validateHydrogenStorageInput,
  validateCoatingDefectInput,
  validatePhotoresistDeveloperInput,
  validatePerovskiteSolventInput,
  validateOrganicSemiconductorFilmInput,
  validateUVCurableInkMonomerInput,
  validateMultiComponentOptimizationInput,
  validateLiBatteryElectrolyteInput,
  validateSolventSubstitutionInput,
  validateCosmeticEmulsionInput,
  validatePrintedElectronicsWettingInput,
  validateQDLigandExchangeInput,
  validateUnderfillEncapsulantInput,
  validateBiofuelCompatibilityInput,
  validatePCMEncapsulationInput,
  validateHSPUncertaintyInput,
  validateSurfaceHSPDeterminationInput,
  validateIonicLiquidHSPInput,
  validateMLHSPPredictionInput,
  validateMDHSPImportInput,
  validatePolymorphRiskInput,
  validateAntiGraffitiInput,
  validatePrimerlessAdhesionInput,
} from '../../src/core/validation';

// ─── Helper HSP object ───────────────────────────
const validHSP = { deltaD: 18, deltaP: 5, deltaH: 7 };
const validHSPObj = { deltaD: 18, deltaP: 5, deltaH: 7 };

// ─── validateBlendOptimizationInput ───────────────────────────
describe('validateBlendOptimizationInput', () => {
  const valid = { targetDeltaD: 17, targetDeltaP: 5, targetDeltaH: 10, candidateCount: 5, maxComponents: 2 as const, stepSize: 0.1, topN: 10 };
  it('有効な入力でnull', () => { expect(validateBlendOptimizationInput(valid)).toBeNull(); });
  it('ターゲットHSP負でエラー', () => { expect(validateBlendOptimizationInput({ ...valid, targetDeltaD: -1 })).toBeTruthy(); });
  it('stepSize=0でエラー', () => { expect(validateBlendOptimizationInput({ ...valid, stepSize: 0 })).toBeTruthy(); });
  it('stepSize>1でエラー', () => { expect(validateBlendOptimizationInput({ ...valid, stepSize: 1.5 })).toBeTruthy(); });
  it('topN=0でエラー', () => { expect(validateBlendOptimizationInput({ ...valid, topN: 0 })).toBeTruthy(); });
  it('候補不足でエラー', () => { expect(validateBlendOptimizationInput({ ...valid, candidateCount: 1 })).toBeTruthy(); });
});

// ─── validateAdhesionThresholds ───────────────────────────
describe('validateAdhesionThresholds', () => {
  it('有効でnull', () => { expect(validateAdhesionThresholds({ excellentMax: 1, goodMax: 2, fairMax: 3, poorMax: 4 })).toBeNull(); });
  it('nullでエラー', () => { expect(validateAdhesionThresholds(null)).toBeTruthy(); });
  it('非数値でエラー', () => { expect(validateAdhesionThresholds({ excellentMax: 'a', goodMax: 2, fairMax: 3, poorMax: 4 })).toBeTruthy(); });
  it('負値でエラー', () => { expect(validateAdhesionThresholds({ excellentMax: -1, goodMax: 2, fairMax: 3, poorMax: 4 })).toBeTruthy(); });
  it('順序不正でエラー', () => { expect(validateAdhesionThresholds({ excellentMax: 5, goodMax: 2, fairMax: 3, poorMax: 4 })).toBeTruthy(); });
});

// ─── validateSolventClassifications ───────────────────────────
describe('validateSolventClassifications', () => {
  it('有効でnull', () => {
    expect(validateSolventClassifications([
      { solventId: 1, isGood: true },
      { solventId: 2, isGood: false },
    ])).toBeNull();
  });
  it('非配列でエラー', () => { expect(validateSolventClassifications('bad')).toBeTruthy(); });
  it('空配列でエラー', () => { expect(validateSolventClassifications([])).toBeTruthy(); });
  it('solventIdが不正でエラー', () => { expect(validateSolventClassifications([{ solventId: -1, isGood: true }, { solventId: 2, isGood: false }])).toBeTruthy(); });
  it('isGoodが非ブーリアンでエラー', () => { expect(validateSolventClassifications([{ solventId: 1, isGood: 'yes' }, { solventId: 2, isGood: false }])).toBeTruthy(); });
  it('良溶媒なしでエラー', () => { expect(validateSolventClassifications([{ solventId: 1, isGood: false }, { solventId: 2, isGood: false }])).toBeTruthy(); });
  it('貧溶媒なしでエラー', () => { expect(validateSolventClassifications([{ solventId: 1, isGood: true }, { solventId: 2, isGood: true }])).toBeTruthy(); });
  it('null要素でエラー', () => { expect(validateSolventClassifications([null, { solventId: 2, isGood: false }])).toBeTruthy(); });
});

// ─── validateGreenSolventInput ───────────────────────────
describe('validateGreenSolventInput', () => {
  it('有効でnull', () => { expect(validateGreenSolventInput(1)).toBeNull(); });
  it('maxResultsありで有効', () => { expect(validateGreenSolventInput(1, 10)).toBeNull(); });
  it('非整数でエラー', () => { expect(validateGreenSolventInput(1.5)).toBeTruthy(); });
  it('0でエラー', () => { expect(validateGreenSolventInput(0)).toBeTruthy(); });
  it('maxResultsが不正でエラー', () => { expect(validateGreenSolventInput(1, -1)).toBeTruthy(); });
});

// ─── validateMultiObjectiveInput ───────────────────────────
describe('validateMultiObjectiveInput', () => {
  it('有効でnull', () => { expect(validateMultiObjectiveInput({ targetDeltaD: 18, targetDeltaP: 5, targetDeltaH: 7, r0: 5 })).toBeNull(); });
  it('nullでエラー', () => { expect(validateMultiObjectiveInput(null)).toBeTruthy(); });
  it('HSP負でエラー', () => { expect(validateMultiObjectiveInput({ targetDeltaD: -1, targetDeltaP: 5, targetDeltaH: 7, r0: 5 })).toBeTruthy(); });
  it('r0=0でエラー', () => { expect(validateMultiObjectiveInput({ targetDeltaD: 18, targetDeltaP: 5, targetDeltaH: 7, r0: 0 })).toBeTruthy(); });
  it('非数値でエラー', () => { expect(validateMultiObjectiveInput({ targetDeltaD: 'a', targetDeltaP: 5, targetDeltaH: 7, r0: 5 })).toBeTruthy(); });
});

// ─── validateGroupContributionInput ───────────────────────────
describe('validateGroupContributionInput', () => {
  it('有効でnull', () => { expect(validateGroupContributionInput({ firstOrderGroups: [{ groupId: 'CH3', count: 2 }] })).toBeNull(); });
  it('nullでエラー', () => { expect(validateGroupContributionInput(null)).toBeTruthy(); });
  it('firstOrderGroupsが非配列でエラー', () => { expect(validateGroupContributionInput({ firstOrderGroups: 'bad' })).toBeTruthy(); });
  it('空firstOrderGroupsでエラー', () => { expect(validateGroupContributionInput({ firstOrderGroups: [] })).toBeTruthy(); });
  it('groupIdが空文字でエラー', () => { expect(validateGroupContributionInput({ firstOrderGroups: [{ groupId: '', count: 1 }] })).toBeTruthy(); });
  it('countが0でエラー', () => { expect(validateGroupContributionInput({ firstOrderGroups: [{ groupId: 'CH3', count: 0 }] })).toBeTruthy(); });
  it('secondOrderGroupsありで有効', () => {
    expect(validateGroupContributionInput({
      firstOrderGroups: [{ groupId: 'CH3', count: 1 }],
      secondOrderGroups: [{ groupId: 'ring', count: 1 }],
    })).toBeNull();
  });
  it('secondOrderGroupsが非配列でエラー', () => {
    expect(validateGroupContributionInput({
      firstOrderGroups: [{ groupId: 'CH3', count: 1 }],
      secondOrderGroups: 'bad',
    })).toBeTruthy();
  });
  it('secondOrderGroupsのnull要素でエラー', () => {
    expect(validateGroupContributionInput({
      firstOrderGroups: [{ groupId: 'CH3', count: 1 }],
      secondOrderGroups: [null],
    })).toBeTruthy();
  });
  it('firstOrderGroupsのnull要素でエラー', () => {
    expect(validateGroupContributionInput({ firstOrderGroups: [null] })).toBeTruthy();
  });
});

// ─── validateDispersantInput ───────────────────────────
describe('validateDispersantInput', () => {
  const valid = {
    name: 'テスト分散剤', dispersantType: 'polymeric',
    anchorDeltaD: 18, anchorDeltaP: 5, anchorDeltaH: 7, anchorR0: 3,
    solvationDeltaD: 15, solvationDeltaP: 8, solvationDeltaH: 10, solvationR0: 4,
    overallDeltaD: 17, overallDeltaP: 6, overallDeltaH: 8,
  };
  it('有効でnull', () => { expect(validateDispersantInput(valid)).toBeNull(); });
  it('名前空でエラー', () => { expect(validateDispersantInput({ ...valid, name: '' })).toBeTruthy(); });
  it('無効タイプでエラー', () => { expect(validateDispersantInput({ ...valid, dispersantType: 'invalid' })).toBeTruthy(); });
  it('anchorHSP負でエラー', () => { expect(validateDispersantInput({ ...valid, anchorDeltaD: -1 })).toBeTruthy(); });
  it('anchorR0=0でエラー', () => { expect(validateDispersantInput({ ...valid, anchorR0: 0 })).toBeTruthy(); });
  it('solvationHSP負でエラー', () => { expect(validateDispersantInput({ ...valid, solvationDeltaP: -1 })).toBeTruthy(); });
  it('solvationR0=0でエラー', () => { expect(validateDispersantInput({ ...valid, solvationR0: 0 })).toBeTruthy(); });
  it('overallHSP負でエラー', () => { expect(validateDispersantInput({ ...valid, overallDeltaH: -1 })).toBeTruthy(); });
  it('HLB負でエラー', () => { expect(validateDispersantInput({ ...valid, hlb: -1 })).toBeTruthy(); });
  it('molWeight=0でエラー', () => { expect(validateDispersantInput({ ...valid, molWeight: 0 })).toBeTruthy(); });
  it('有効なHLBとmolWeight', () => { expect(validateDispersantInput({ ...valid, hlb: 12, molWeight: 5000 })).toBeNull(); });
});

// ─── validateDispersantThresholds ───────────────────────────
describe('validateDispersantThresholds', () => {
  it('有効でnull', () => { expect(validateDispersantThresholds({ excellentMax: 1, goodMax: 2, fairMax: 3, poorMax: 4 })).toBeNull(); });
  it('負値でエラー', () => { expect(validateDispersantThresholds({ excellentMax: -1, goodMax: 2, fairMax: 3, poorMax: 4 })).toBeTruthy(); });
  it('順序不正でエラー', () => { expect(validateDispersantThresholds({ excellentMax: 5, goodMax: 2, fairMax: 3, poorMax: 4 })).toBeTruthy(); });
});

// ─── HSP+R0+Array系パイプライン(共通パターン) ───────────────────────────
describe('validateESCInput', () => {
  it('有効でnull', () => { expect(validateESCInput(validHSP, 5, [1])).toBeNull(); });
  it('HSP範囲外でエラー', () => { expect(validateESCInput({ deltaD: 51, deltaP: 5, deltaH: 7 }, 5, [1])).toBeTruthy(); });
  it('R0=0でエラー', () => { expect(validateESCInput(validHSP, 0, [1])).toBeTruthy(); });
  it('空配列でエラー', () => { expect(validateESCInput(validHSP, 5, [])).toBeTruthy(); });
});

describe('validateCocrystalInput', () => {
  it('有効でnull', () => { expect(validateCocrystalInput(validHSP, 5, [1])).toBeNull(); });
  it('空配列でエラー', () => { expect(validateCocrystalInput(validHSP, 5, [])).toBeTruthy(); });
});

describe('validatePrinting3dInput', () => {
  it('有効でnull', () => { expect(validatePrinting3dInput(validHSP, 5, [1])).toBeNull(); });
  it('空配列でエラー', () => { expect(validatePrinting3dInput(validHSP, 5, [])).toBeTruthy(); });
});

describe('validateDielectricInput', () => {
  it('有効でnull', () => { expect(validateDielectricInput(validHSP, 5, [1])).toBeNull(); });
  it('R0負でエラー', () => { expect(validateDielectricInput(validHSP, -1, [1])).toBeTruthy(); });
});

describe('validateExcipientInput', () => {
  it('有効でnull', () => { expect(validateExcipientInput(validHSP, 5, [1])).toBeNull(); });
  it('空配列でエラー', () => { expect(validateExcipientInput(validHSP, 5, [])).toBeTruthy(); });
});

// ─── Flory-Huggins群 ───────────────────────────
describe('validatePolymerBlendInput', () => {
  const valid = { groupId1: 1, groupId2: 2, degreeOfPolymerization: 100, referenceVolume: 100 };
  it('有効でnull', () => { expect(validatePolymerBlendInput(valid)).toBeNull(); });
  it('nullでエラー', () => { expect(validatePolymerBlendInput(null)).toBeTruthy(); });
  it('groupId1不正でエラー', () => { expect(validatePolymerBlendInput({ ...valid, groupId1: 0 })).toBeTruthy(); });
  it('groupId2不正でエラー', () => { expect(validatePolymerBlendInput({ ...valid, groupId2: -1 })).toBeTruthy(); });
  it('重合度=0でエラー', () => { expect(validatePolymerBlendInput({ ...valid, degreeOfPolymerization: 0 })).toBeTruthy(); });
  it('参照体積=0でエラー', () => { expect(validatePolymerBlendInput({ ...valid, referenceVolume: 0 })).toBeTruthy(); });
});

describe('validateRecyclingInput', () => {
  const valid = { groupIds: [1, 2], degreeOfPolymerization: 100, referenceVolume: 100 };
  it('有効でnull', () => { expect(validateRecyclingInput(valid)).toBeNull(); });
  it('nullでエラー', () => { expect(validateRecyclingInput(null)).toBeTruthy(); });
  it('groupIds非配列でエラー', () => { expect(validateRecyclingInput({ ...valid, groupIds: 'bad' })).toBeTruthy(); });
  it('groupIds1個でエラー', () => { expect(validateRecyclingInput({ ...valid, groupIds: [1] })).toBeTruthy(); });
  it('groupIds不正値でエラー', () => { expect(validateRecyclingInput({ ...valid, groupIds: [1, -2] })).toBeTruthy(); });
  it('重合度=0でエラー', () => { expect(validateRecyclingInput({ ...valid, degreeOfPolymerization: 0 })).toBeTruthy(); });
  it('参照体積=0でエラー', () => { expect(validateRecyclingInput({ ...valid, referenceVolume: 0 })).toBeTruthy(); });
});

describe('validateCompatibilizerInput', () => {
  it('有効でnull', () => { expect(validateCompatibilizerInput({ groupId1: 1, groupId2: 2 })).toBeNull(); });
  it('nullでエラー', () => { expect(validateCompatibilizerInput(null)).toBeTruthy(); });
  it('groupId1=0でエラー', () => { expect(validateCompatibilizerInput({ groupId1: 0, groupId2: 2 })).toBeTruthy(); });
  it('groupId2=0でエラー', () => { expect(validateCompatibilizerInput({ groupId1: 1, groupId2: 0 })).toBeTruthy(); });
});

describe('validateCopolymerInput', () => {
  const valid = { monomers: [
    { name: 'A', deltaD: 18, deltaP: 5, deltaH: 7, fraction: 0.6 },
    { name: 'B', deltaD: 15, deltaP: 8, deltaH: 10, fraction: 0.4 },
  ] };
  it('有効でnull', () => { expect(validateCopolymerInput(valid)).toBeNull(); });
  it('nullでエラー', () => { expect(validateCopolymerInput(null)).toBeTruthy(); });
  it('monomers非配列でエラー', () => { expect(validateCopolymerInput({ monomers: 'bad' })).toBeTruthy(); });
  it('monomers1個でエラー', () => { expect(validateCopolymerInput({ monomers: [valid.monomers[0]] })).toBeTruthy(); });
  it('名前空でエラー', () => {
    expect(validateCopolymerInput({ monomers: [
      { name: '', deltaD: 18, deltaP: 5, deltaH: 7, fraction: 0.5 },
      { name: 'B', deltaD: 15, deltaP: 8, deltaH: 10, fraction: 0.5 },
    ] })).toBeTruthy();
  });
  it('fraction合計≠1でエラー', () => {
    expect(validateCopolymerInput({ monomers: [
      { name: 'A', deltaD: 18, deltaP: 5, deltaH: 7, fraction: 0.3 },
      { name: 'B', deltaD: 15, deltaP: 8, deltaH: 10, fraction: 0.3 },
    ] })).toBeTruthy();
  });
  it('HSP負でエラー', () => {
    expect(validateCopolymerInput({ monomers: [
      { name: 'A', deltaD: -1, deltaP: 5, deltaH: 7, fraction: 0.5 },
      { name: 'B', deltaD: 15, deltaP: 8, deltaH: 10, fraction: 0.5 },
    ] })).toBeTruthy();
  });
  it('fraction=0でエラー', () => {
    expect(validateCopolymerInput({ monomers: [
      { name: 'A', deltaD: 18, deltaP: 5, deltaH: 7, fraction: 0 },
      { name: 'B', deltaD: 15, deltaP: 8, deltaH: 10, fraction: 1 },
    ] })).toBeTruthy();
  });
  it('null要素でエラー', () => {
    expect(validateCopolymerInput({ monomers: [null, valid.monomers[1]] })).toBeTruthy();
  });
});

// ─── Partition-Coefficient群 ───────────────────────────
describe('validateAdditiveMigrationInput', () => {
  it('有効でnull', () => { expect(validateAdditiveMigrationInput({ partId: 1, groupId: 1 })).toBeNull(); });
  it('nullでエラー', () => { expect(validateAdditiveMigrationInput(null)).toBeTruthy(); });
  it('partId=0でエラー', () => { expect(validateAdditiveMigrationInput({ partId: 0, groupId: 1 })).toBeTruthy(); });
  it('groupId=0でエラー', () => { expect(validateAdditiveMigrationInput({ partId: 1, groupId: 0 })).toBeTruthy(); });
});

describe('validateFlavorScalpingInput', () => {
  it('有効でnull', () => { expect(validateFlavorScalpingInput({ partId: 1, groupId: 1 })).toBeNull(); });
  it('nullでエラー', () => { expect(validateFlavorScalpingInput(null)).toBeTruthy(); });
  it('partId=0でエラー', () => { expect(validateFlavorScalpingInput({ partId: 0, groupId: 1 })).toBeTruthy(); });
});

describe('validateFoodPackagingMigrationInput', () => {
  it('有効でnull', () => { expect(validateFoodPackagingMigrationInput(validHSP, 5, [1])).toBeNull(); });
  it('空配列でエラー', () => { expect(validateFoodPackagingMigrationInput(validHSP, 5, [])).toBeTruthy(); });
});

describe('validateFragranceEncapsulationInput', () => {
  it('有効でnull', () => { expect(validateFragranceEncapsulationInput(validHSP, 5, [1])).toBeNull(); });
  it('空配列でエラー', () => { expect(validateFragranceEncapsulationInput(validHSP, 5, [])).toBeTruthy(); });
});

describe('validateTransdermalEnhancerInput', () => {
  it('有効でnull', () => { expect(validateTransdermalEnhancerInput({ drugId: 1, skinHSP: validHSPObj })).toBeNull(); });
  it('nullでエラー', () => { expect(validateTransdermalEnhancerInput(null)).toBeTruthy(); });
  it('drugId=0でエラー', () => { expect(validateTransdermalEnhancerInput({ drugId: 0, skinHSP: validHSPObj })).toBeTruthy(); });
  it('skinHSP欠落でエラー', () => { expect(validateTransdermalEnhancerInput({ drugId: 1 })).toBeTruthy(); });
  it('skinHSP範囲外でエラー', () => { expect(validateTransdermalEnhancerInput({ drugId: 1, skinHSP: { deltaD: 51, deltaP: 5, deltaH: 7 } })).toBeTruthy(); });
});

describe('validateLiposomePermeabilityInput', () => {
  it('有効でnull', () => { expect(validateLiposomePermeabilityInput({ drugId: 1, lipidHSP: validHSPObj, lipidR0: 5 })).toBeNull(); });
  it('nullでエラー', () => { expect(validateLiposomePermeabilityInput(null)).toBeTruthy(); });
  it('drugId=0でエラー', () => { expect(validateLiposomePermeabilityInput({ drugId: 0, lipidHSP: validHSPObj, lipidR0: 5 })).toBeTruthy(); });
  it('lipidHSP欠落でエラー', () => { expect(validateLiposomePermeabilityInput({ drugId: 1, lipidR0: 5 })).toBeTruthy(); });
  it('lipidR0=0でエラー', () => { expect(validateLiposomePermeabilityInput({ drugId: 1, lipidHSP: validHSPObj, lipidR0: 0 })).toBeTruthy(); });
});

// ─── Work-of-Adhesion群 ───────────────────────────
describe('validateInkSubstrateAdhesionInput', () => {
  it('有効でnull', () => { expect(validateInkSubstrateAdhesionInput({ inkHSP: validHSPObj, substrateHSP: validHSPObj })).toBeNull(); });
  it('nullでエラー', () => { expect(validateInkSubstrateAdhesionInput(null)).toBeTruthy(); });
  it('inkHSP欠落でエラー', () => { expect(validateInkSubstrateAdhesionInput({ substrateHSP: validHSPObj })).toBeTruthy(); });
  it('substrateHSP欠落でエラー', () => { expect(validateInkSubstrateAdhesionInput({ inkHSP: validHSPObj })).toBeTruthy(); });
});

describe('validateMultilayerCoatingInput', () => {
  const valid = { layers: [
    { name: 'L1', hsp: validHSPObj },
    { name: 'L2', hsp: validHSPObj },
  ] };
  it('有効でnull', () => { expect(validateMultilayerCoatingInput(valid)).toBeNull(); });
  it('nullでエラー', () => { expect(validateMultilayerCoatingInput(null)).toBeTruthy(); });
  it('layers非配列でエラー', () => { expect(validateMultilayerCoatingInput({ layers: 'bad' })).toBeTruthy(); });
  it('layers1個でエラー', () => { expect(validateMultilayerCoatingInput({ layers: [valid.layers[0]] })).toBeTruthy(); });
  it('名前空でエラー', () => { expect(validateMultilayerCoatingInput({ layers: [{ name: '', hsp: validHSPObj }, valid.layers[1]] })).toBeTruthy(); });
  it('null要素でエラー', () => { expect(validateMultilayerCoatingInput({ layers: [null, valid.layers[1]] })).toBeTruthy(); });
});

describe('validatePSAPeelStrengthInput', () => {
  it('有効でnull', () => { expect(validatePSAPeelStrengthInput({ psaHSP: validHSPObj, adherendHSP: validHSPObj })).toBeNull(); });
  it('nullでエラー', () => { expect(validatePSAPeelStrengthInput(null)).toBeTruthy(); });
  it('psaHSP欠落でエラー', () => { expect(validatePSAPeelStrengthInput({ adherendHSP: validHSPObj })).toBeTruthy(); });
});

describe('validateStructuralAdhesiveJointInput', () => {
  it('有効でnull', () => { expect(validateStructuralAdhesiveJointInput({ adhesiveHSP: validHSPObj, adherend1HSP: validHSPObj, adherend2HSP: validHSPObj })).toBeNull(); });
  it('nullでエラー', () => { expect(validateStructuralAdhesiveJointInput(null)).toBeTruthy(); });
  it('adhesiveHSP欠落でエラー', () => { expect(validateStructuralAdhesiveJointInput({ adherend1HSP: validHSPObj, adherend2HSP: validHSPObj })).toBeTruthy(); });
  it('adherend2HSP欠落でエラー', () => { expect(validateStructuralAdhesiveJointInput({ adhesiveHSP: validHSPObj, adherend1HSP: validHSPObj })).toBeTruthy(); });
});

describe('validateSurfaceTreatmentInput', () => {
  it('有効でnull', () => { expect(validateSurfaceTreatmentInput({ beforeHSP: validHSPObj, afterHSP: validHSPObj, targetHSP: validHSPObj })).toBeNull(); });
  it('nullでエラー', () => { expect(validateSurfaceTreatmentInput(null)).toBeTruthy(); });
  it('beforeHSP欠落でエラー', () => { expect(validateSurfaceTreatmentInput({ afterHSP: validHSPObj, targetHSP: validHSPObj })).toBeTruthy(); });
});

// ─── ナノ材料分散群 ───────────────────────────
describe('validatePigmentDispersionInput', () => {
  it('有効でnull', () => { expect(validatePigmentDispersionInput(validHSP, 5, [1])).toBeNull(); });
  it('空配列でエラー', () => { expect(validatePigmentDispersionInput(validHSP, 5, [])).toBeTruthy(); });
});

describe('validateCNTGrapheneInput', () => {
  it('有効でnull', () => { expect(validateCNTGrapheneInput(validHSP, 5, [1])).toBeNull(); });
  it('空配列でエラー', () => { expect(validateCNTGrapheneInput(validHSP, 5, [])).toBeTruthy(); });
});

describe('validateMXeneDispersionInput', () => {
  it('有効でnull', () => { expect(validateMXeneDispersionInput(validHSP, 5, [1])).toBeNull(); });
  it('R0=0でエラー', () => { expect(validateMXeneDispersionInput(validHSP, 0, [1])).toBeTruthy(); });
});

describe('validateDrugLoadingInput', () => {
  it('有効でnull', () => { expect(validateDrugLoadingInput(validHSP, 5, [1])).toBeNull(); });
  it('空配列でエラー', () => { expect(validateDrugLoadingInput(validHSP, 5, [])).toBeTruthy(); });
});

// ─── 抽出・洗浄群 ───────────────────────────
describe('validateCleaningFormulationInput', () => {
  it('有効でnull', () => { expect(validateCleaningFormulationInput(validHSP, 5, [1])).toBeNull(); });
  it('空配列でエラー', () => { expect(validateCleaningFormulationInput(validHSP, 5, [])).toBeTruthy(); });
});

describe('validateNaturalDyeExtractionInput', () => {
  it('有効でnull', () => { expect(validateNaturalDyeExtractionInput(validHSP, 5, [1])).toBeNull(); });
  it('空配列でエラー', () => { expect(validateNaturalDyeExtractionInput(validHSP, 5, [])).toBeTruthy(); });
});

describe('validateEssentialOilExtractionInput', () => {
  it('有効でnull', () => { expect(validateEssentialOilExtractionInput(validHSP, 5, [1])).toBeNull(); });
  it('空配列でエラー', () => { expect(validateEssentialOilExtractionInput(validHSP, 5, [])).toBeTruthy(); });
});

describe('validateSoilRemediationInput', () => {
  it('有効でnull', () => { expect(validateSoilRemediationInput(validHSP, 5, [1])).toBeNull(); });
  it('空配列でエラー', () => { expect(validateSoilRemediationInput(validHSP, 5, [])).toBeTruthy(); });
});

describe('validateResidualSolventInput', () => {
  it('有効でnull', () => { expect(validateResidualSolventInput(validHSP, 5, [1])).toBeNull(); });
  it('空配列でエラー', () => { expect(validateResidualSolventInput(validHSP, 5, [])).toBeTruthy(); });
});

// ─── 温度・圧力・超臨界 ───────────────────────────
describe('validateTemperatureHSPCorrectionInput', () => {
  it('有効でnull', () => { expect(validateTemperatureHSPCorrectionInput({ hsp: validHSPObj, temperature: 50, alpha: 0.001 })).toBeNull(); });
  it('nullでエラー', () => { expect(validateTemperatureHSPCorrectionInput(null)).toBeTruthy(); });
  it('温度非数値でエラー', () => { expect(validateTemperatureHSPCorrectionInput({ hsp: validHSPObj, temperature: 'bad', alpha: 0.001 })).toBeTruthy(); });
  it('alpha=0でエラー', () => { expect(validateTemperatureHSPCorrectionInput({ hsp: validHSPObj, temperature: 50, alpha: 0 })).toBeTruthy(); });
});

describe('validatePressureHSPCorrectionInput', () => {
  it('有効でnull', () => { expect(validatePressureHSPCorrectionInput({ hsp: validHSPObj, pressureTarget: 10, temperature: 300 })).toBeNull(); });
  it('nullでエラー', () => { expect(validatePressureHSPCorrectionInput(null)).toBeTruthy(); });
  it('圧力=0でエラー', () => { expect(validatePressureHSPCorrectionInput({ hsp: validHSPObj, pressureTarget: 0, temperature: 300 })).toBeTruthy(); });
  it('温度=0でエラー', () => { expect(validatePressureHSPCorrectionInput({ hsp: validHSPObj, pressureTarget: 10, temperature: 0 })).toBeTruthy(); });
});

describe('validateSCCO2CosolventInput', () => {
  const valid = { targetHSP: validHSPObj, targetR0: 5, pressure: 10, temperature: 300, cosolvents: [{ name: 'EtOH', hsp: validHSPObj }] };
  it('有効でnull', () => { expect(validateSCCO2CosolventInput(valid)).toBeNull(); });
  it('nullでエラー', () => { expect(validateSCCO2CosolventInput(null)).toBeTruthy(); });
  it('targetR0=0でエラー', () => { expect(validateSCCO2CosolventInput({ ...valid, targetR0: 0 })).toBeTruthy(); });
  it('圧力=0でエラー', () => { expect(validateSCCO2CosolventInput({ ...valid, pressure: 0 })).toBeTruthy(); });
  it('温度=0でエラー', () => { expect(validateSCCO2CosolventInput({ ...valid, temperature: 0 })).toBeTruthy(); });
  it('cosolvents空でエラー', () => { expect(validateSCCO2CosolventInput({ ...valid, cosolvents: [] })).toBeTruthy(); });
  it('cosolvent名前空でエラー', () => { expect(validateSCCO2CosolventInput({ ...valid, cosolvents: [{ name: '', hsp: validHSPObj }] })).toBeTruthy(); });
  it('cosolventがnull要素でエラー', () => { expect(validateSCCO2CosolventInput({ ...valid, cosolvents: [null] })).toBeTruthy(); });
});

// ─── AdhesionStrengthThresholds ───────────────────────────
describe('validateAdhesionStrengthThresholds', () => {
  it('有効でnull', () => { expect(validateAdhesionStrengthThresholds({ excellentMin: 10, goodMin: 5, fairMin: 2 })).toBeNull(); });
  it('nullでエラー', () => { expect(validateAdhesionStrengthThresholds(null)).toBeTruthy(); });
  it('非数値でエラー', () => { expect(validateAdhesionStrengthThresholds({ excellentMin: 'a', goodMin: 5, fairMin: 2 })).toBeTruthy(); });
  it('負値でエラー', () => { expect(validateAdhesionStrengthThresholds({ excellentMin: -1, goodMin: 5, fairMin: 2 })).toBeTruthy(); });
  it('順序不正でエラー', () => { expect(validateAdhesionStrengthThresholds({ excellentMin: 2, goodMin: 5, fairMin: 10 })).toBeTruthy(); });
});

// ─── Gas-Solubility群 ───────────────────────────
describe('validateSunscreenUVFilterInput', () => {
  it('有効でnull', () => { expect(validateSunscreenUVFilterInput(validHSP, 5, [1])).toBeNull(); });
  it('空配列でエラー', () => { expect(validateSunscreenUVFilterInput(validHSP, 5, [])).toBeTruthy(); });
});

describe('validateInhalationDrugInput', () => {
  it('有効でnull', () => { expect(validateInhalationDrugInput({ drugHSP: validHSPObj, propellantHSP: validHSPObj, propellantR0: 5 })).toBeNull(); });
  it('nullでエラー', () => { expect(validateInhalationDrugInput(null)).toBeTruthy(); });
  it('propellantR0=0でエラー', () => { expect(validateInhalationDrugInput({ drugHSP: validHSPObj, propellantHSP: validHSPObj, propellantR0: 0 })).toBeTruthy(); });
});

describe('validateProteinAggregationInput', () => {
  it('有効でnull', () => { expect(validateProteinAggregationInput({ proteinSurfaceHSP: validHSPObj, bufferHSP: validHSPObj, bufferR0: 5 })).toBeNull(); });
  it('nullでエラー', () => { expect(validateProteinAggregationInput(null)).toBeTruthy(); });
  it('bufferR0=0でエラー', () => { expect(validateProteinAggregationInput({ proteinSurfaceHSP: validHSPObj, bufferHSP: validHSPObj, bufferR0: 0 })).toBeTruthy(); });
});

describe('validateBiologicBufferInput', () => {
  it('有効でnull', () => { expect(validateBiologicBufferInput(validHSP, 5, [1])).toBeNull(); });
  it('空配列でエラー', () => { expect(validateBiologicBufferInput(validHSP, 5, [])).toBeTruthy(); });
});

describe('validateGasPermeabilityInput', () => {
  it('有効でnull', () => { expect(validateGasPermeabilityInput({ polymerHSP: validHSPObj, gasNames: ['O2'] })).toBeNull(); });
  it('nullでエラー', () => { expect(validateGasPermeabilityInput(null)).toBeTruthy(); });
  it('gasNames空でエラー', () => { expect(validateGasPermeabilityInput({ polymerHSP: validHSPObj, gasNames: [] })).toBeTruthy(); });
});

describe('validateMembraneSeparationInput', () => {
  it('有効でnull', () => {
    expect(validateMembraneSeparationInput({
      membraneHSP: validHSPObj, targetHSP: validHSPObj, impurityHSP: validHSPObj,
      targetName: 'T', impurityName: 'I',
    })).toBeNull();
  });
  it('nullでエラー', () => { expect(validateMembraneSeparationInput(null)).toBeTruthy(); });
  it('ターゲット名空でエラー', () => {
    expect(validateMembraneSeparationInput({
      membraneHSP: validHSPObj, targetHSP: validHSPObj, impurityHSP: validHSPObj,
      targetName: '', impurityName: 'I',
    })).toBeTruthy();
  });
  it('不純物名空でエラー', () => {
    expect(validateMembraneSeparationInput({
      membraneHSP: validHSPObj, targetHSP: validHSPObj, impurityHSP: validHSPObj,
      targetName: 'T', impurityName: '',
    })).toBeTruthy();
  });
});

describe('validateCO2AbsorbentInput', () => {
  it('有効でnull', () => {
    expect(validateCO2AbsorbentInput({ absorbents: [{ name: 'A', hsp: validHSPObj, r0: 5 }] })).toBeNull();
  });
  it('nullでエラー', () => { expect(validateCO2AbsorbentInput(null)).toBeTruthy(); });
  it('absorbents空でエラー', () => { expect(validateCO2AbsorbentInput({ absorbents: [] })).toBeTruthy(); });
  it('absorbent名前空でエラー', () => { expect(validateCO2AbsorbentInput({ absorbents: [{ name: '', hsp: validHSPObj, r0: 5 }] })).toBeTruthy(); });
  it('absorbentのr0=0でエラー', () => { expect(validateCO2AbsorbentInput({ absorbents: [{ name: 'A', hsp: validHSPObj, r0: 0 }] })).toBeTruthy(); });
  it('absorbentがnull要素でエラー', () => { expect(validateCO2AbsorbentInput({ absorbents: [null] })).toBeTruthy(); });
});

describe('validateHydrogenStorageInput', () => {
  it('有効でnull', () => { expect(validateHydrogenStorageInput({ carrierHSP: validHSPObj, r0: 5, solventIds: [1] })).toBeNull(); });
  it('nullでエラー', () => { expect(validateHydrogenStorageInput(null)).toBeTruthy(); });
  it('r0=0でエラー', () => { expect(validateHydrogenStorageInput({ carrierHSP: validHSPObj, r0: 0, solventIds: [1] })).toBeTruthy(); });
  it('solventIds空でエラー', () => { expect(validateHydrogenStorageInput({ carrierHSP: validHSPObj, r0: 5, solventIds: [] })).toBeTruthy(); });
});

// ─── dissolution-contrast群 ───────────────────────────
describe('validateCoatingDefectInput', () => {
  it('有効でnull', () => { expect(validateCoatingDefectInput({ coatingHSP: validHSPObj, substrateHSP: validHSPObj, solventHSP: validHSPObj })).toBeNull(); });
  it('nullでエラー', () => { expect(validateCoatingDefectInput(null)).toBeTruthy(); });
  it('coatingHSP欠落でエラー', () => { expect(validateCoatingDefectInput({ substrateHSP: validHSPObj, solventHSP: validHSPObj })).toBeTruthy(); });
});

describe('validatePhotoresistDeveloperInput', () => {
  it('有効でnull', () => { expect(validatePhotoresistDeveloperInput({ unexposedHSP: validHSPObj, exposedHSP: validHSPObj, developerHSP: validHSPObj })).toBeNull(); });
  it('nullでエラー', () => { expect(validatePhotoresistDeveloperInput(null)).toBeTruthy(); });
});

describe('validatePerovskiteSolventInput', () => {
  it('有効でnull', () => { expect(validatePerovskiteSolventInput(validHSP, 5, [1])).toBeNull(); });
  it('空配列でエラー', () => { expect(validatePerovskiteSolventInput(validHSP, 5, [])).toBeTruthy(); });
});

describe('validateOrganicSemiconductorFilmInput', () => {
  it('有効でnull', () => { expect(validateOrganicSemiconductorFilmInput(validHSP, 5, [1])).toBeNull(); });
  it('空配列でエラー', () => { expect(validateOrganicSemiconductorFilmInput(validHSP, 5, [])).toBeTruthy(); });
});

describe('validateUVCurableInkMonomerInput', () => {
  it('有効でnull', () => { expect(validateUVCurableInkMonomerInput(validHSP, 5, [1])).toBeNull(); });
  it('空配列でエラー', () => { expect(validateUVCurableInkMonomerInput(validHSP, 5, [])).toBeTruthy(); });
});

// ─── Phase 11: 高度最適化群 ───────────────────────────
describe('validateMultiComponentOptimizationInput', () => {
  it('有効でnull', () => { expect(validateMultiComponentOptimizationInput(validHSP, [1, 2], 2)).toBeNull(); });
  it('HSP範囲外でエラー', () => { expect(validateMultiComponentOptimizationInput({ deltaD: 51, deltaP: 5, deltaH: 7 }, [1, 2], 2)).toBeTruthy(); });
  it('solventIds空でエラー', () => { expect(validateMultiComponentOptimizationInput(validHSP, [], 2)).toBeTruthy(); });
  it('numComponents<2でエラー', () => { expect(validateMultiComponentOptimizationInput(validHSP, [1, 2], 1)).toBeTruthy(); });
  it('numComponents>10でエラー', () => { expect(validateMultiComponentOptimizationInput(validHSP, [1, 2], 11)).toBeTruthy(); });
});

describe('validateLiBatteryElectrolyteInput', () => {
  it('有効でnull', () => { expect(validateLiBatteryElectrolyteInput(validHSP, 5, [1])).toBeNull(); });
  it('空配列でエラー', () => { expect(validateLiBatteryElectrolyteInput(validHSP, 5, [])).toBeTruthy(); });
});

describe('validateSolventSubstitutionInput', () => {
  it('有効でnull', () => { expect(validateSolventSubstitutionInput(validHSP, [1])).toBeNull(); });
  it('HSP範囲外でエラー', () => { expect(validateSolventSubstitutionInput({ deltaD: -1, deltaP: 5, deltaH: 7 }, [1])).toBeTruthy(); });
  it('空配列でエラー', () => { expect(validateSolventSubstitutionInput(validHSP, [])).toBeTruthy(); });
});

describe('validateCosmeticEmulsionInput', () => {
  it('有効でnull', () => { expect(validateCosmeticEmulsionInput({ oilHSP: validHSPObj, emulsifierHSP: validHSPObj, waterHSP: validHSPObj })).toBeNull(); });
  it('nullでエラー', () => { expect(validateCosmeticEmulsionInput(null)).toBeTruthy(); });
  it('oilHSP欠落でエラー', () => { expect(validateCosmeticEmulsionInput({ emulsifierHSP: validHSPObj, waterHSP: validHSPObj })).toBeTruthy(); });
});

// ─── Phase 13+14 ───────────────────────────
describe('validatePrintedElectronicsWettingInput', () => {
  it('有効でnull', () => { expect(validatePrintedElectronicsWettingInput({ inkHSP: validHSPObj, substrateHSP: validHSPObj })).toBeNull(); });
  it('nullでエラー', () => { expect(validatePrintedElectronicsWettingInput(null)).toBeTruthy(); });
});

describe('validateQDLigandExchangeInput', () => {
  it('有効でnull', () => { expect(validateQDLigandExchangeInput(validHSP, 5, [1])).toBeNull(); });
  it('空配列でエラー', () => { expect(validateQDLigandExchangeInput(validHSP, 5, [])).toBeTruthy(); });
});

describe('validateUnderfillEncapsulantInput', () => {
  it('有効でnull', () => { expect(validateUnderfillEncapsulantInput({ encapsulantHSP: validHSPObj, chipSurfaceHSP: validHSPObj, substrateHSP: validHSPObj })).toBeNull(); });
  it('nullでエラー', () => { expect(validateUnderfillEncapsulantInput(null)).toBeTruthy(); });
  it('chipSurfaceHSP欠落でエラー', () => { expect(validateUnderfillEncapsulantInput({ encapsulantHSP: validHSPObj, substrateHSP: validHSPObj })).toBeTruthy(); });
});

describe('validateBiofuelCompatibilityInput', () => {
  it('有効でnull', () => { expect(validateBiofuelCompatibilityInput(validHSP, 5, [1])).toBeNull(); });
  it('空配列でエラー', () => { expect(validateBiofuelCompatibilityInput(validHSP, 5, [])).toBeTruthy(); });
});

describe('validatePCMEncapsulationInput', () => {
  it('有効でnull', () => { expect(validatePCMEncapsulationInput(validHSP, 5, [1])).toBeNull(); });
  it('空配列でエラー', () => { expect(validatePCMEncapsulationInput(validHSP, 5, [])).toBeTruthy(); });
});

describe('validateHSPUncertaintyInput', () => {
  const validClassifications = [{ solventId: 1, isGood: true }, { solventId: 2, isGood: false }];
  it('有効でnull', () => { expect(validateHSPUncertaintyInput({ classifications: validClassifications })).toBeNull(); });
  it('nullでエラー', () => { expect(validateHSPUncertaintyInput(null)).toBeTruthy(); });
  it('numSamplesありで有効', () => { expect(validateHSPUncertaintyInput({ classifications: validClassifications, numSamples: 100 })).toBeNull(); });
  it('numSamples=0でエラー', () => { expect(validateHSPUncertaintyInput({ classifications: validClassifications, numSamples: 0 })).toBeTruthy(); });
});

describe('validateSurfaceHSPDeterminationInput', () => {
  const valid = { testData: [
    { liquidName: 'Water', liquidHSP: validHSPObj, contactAngleDeg: 60 },
    { liquidName: 'DIM', liquidHSP: validHSPObj, contactAngleDeg: 30 },
  ] };
  it('有効でnull', () => { expect(validateSurfaceHSPDeterminationInput(valid)).toBeNull(); });
  it('nullでエラー', () => { expect(validateSurfaceHSPDeterminationInput(null)).toBeTruthy(); });
  it('testData非配列でエラー', () => { expect(validateSurfaceHSPDeterminationInput({ testData: 'bad' })).toBeTruthy(); });
  it('testData1個でエラー', () => { expect(validateSurfaceHSPDeterminationInput({ testData: [valid.testData[0]] })).toBeTruthy(); });
  it('名前空でエラー', () => { expect(validateSurfaceHSPDeterminationInput({ testData: [{ liquidName: '', liquidHSP: validHSPObj, contactAngleDeg: 60 }, valid.testData[1]] })).toBeTruthy(); });
  it('接触角>180でエラー', () => { expect(validateSurfaceHSPDeterminationInput({ testData: [{ liquidName: 'W', liquidHSP: validHSPObj, contactAngleDeg: 200 }, valid.testData[1]] })).toBeTruthy(); });
  it('null要素でエラー', () => { expect(validateSurfaceHSPDeterminationInput({ testData: [null, valid.testData[1]] })).toBeTruthy(); });
});

describe('validateIonicLiquidHSPInput', () => {
  it('有効でnull', () => { expect(validateIonicLiquidHSPInput({ cationHSP: validHSPObj, anionHSP: validHSPObj })).toBeNull(); });
  it('nullでエラー', () => { expect(validateIonicLiquidHSPInput(null)).toBeTruthy(); });
  it('ratioありで有効', () => { expect(validateIonicLiquidHSPInput({ cationHSP: validHSPObj, anionHSP: validHSPObj, ratio: [1, 1] })).toBeNull(); });
  it('ratio要素が3個でエラー', () => { expect(validateIonicLiquidHSPInput({ cationHSP: validHSPObj, anionHSP: validHSPObj, ratio: [1, 1, 1] })).toBeTruthy(); });
  it('ratio負でエラー', () => { expect(validateIonicLiquidHSPInput({ cationHSP: validHSPObj, anionHSP: validHSPObj, ratio: [1, -1] })).toBeTruthy(); });
  it('temperatureありで有効', () => { expect(validateIonicLiquidHSPInput({ cationHSP: validHSPObj, anionHSP: validHSPObj, temperature: 300 })).toBeNull(); });
  it('temperature=0でエラー', () => { expect(validateIonicLiquidHSPInput({ cationHSP: validHSPObj, anionHSP: validHSPObj, temperature: 0 })).toBeTruthy(); });
});

// ─── Phase 15 ───────────────────────────
describe('validateMLHSPPredictionInput', () => {
  const valid = { molarVolume: 100, logP: 1.5, numHBDonors: 1, numHBAcceptors: 2, aromaticRings: 1 };
  it('有効でnull', () => { expect(validateMLHSPPredictionInput(valid)).toBeNull(); });
  it('nullでエラー', () => { expect(validateMLHSPPredictionInput(null)).toBeTruthy(); });
  it('molarVolume=0でエラー', () => { expect(validateMLHSPPredictionInput({ ...valid, molarVolume: 0 })).toBeTruthy(); });
  it('logP非数値でエラー', () => { expect(validateMLHSPPredictionInput({ ...valid, logP: NaN })).toBeTruthy(); });
  it('numHBDonors=-1でエラー', () => { expect(validateMLHSPPredictionInput({ ...valid, numHBDonors: -1 })).toBeTruthy(); });
  it('numHBAcceptors=-1でエラー', () => { expect(validateMLHSPPredictionInput({ ...valid, numHBAcceptors: -1 })).toBeTruthy(); });
  it('aromaticRings=-1でエラー', () => { expect(validateMLHSPPredictionInput({ ...valid, aromaticRings: -1 })).toBeTruthy(); });
});

describe('validateMDHSPImportInput', () => {
  const valid = { totalCED: 100, dispersionCED: 50, polarCED: 30, hbondCED: 20, molarVolume: 100 };
  it('有効でnull', () => { expect(validateMDHSPImportInput(valid)).toBeNull(); });
  it('nullでエラー', () => { expect(validateMDHSPImportInput(null)).toBeTruthy(); });
  it('totalCED=-1でエラー', () => { expect(validateMDHSPImportInput({ ...valid, totalCED: -1 })).toBeTruthy(); });
  it('molarVolume=0でエラー', () => { expect(validateMDHSPImportInput({ ...valid, molarVolume: 0 })).toBeTruthy(); });
  it('dispersionCED=-1でエラー', () => { expect(validateMDHSPImportInput({ ...valid, dispersionCED: -1 })).toBeTruthy(); });
  it('polarCED=-1でエラー', () => { expect(validateMDHSPImportInput({ ...valid, polarCED: -1 })).toBeTruthy(); });
  it('hbondCED=-1でエラー', () => { expect(validateMDHSPImportInput({ ...valid, hbondCED: -1 })).toBeTruthy(); });
});

describe('validatePolymorphRiskInput', () => {
  it('有効でnull', () => { expect(validatePolymorphRiskInput(validHSP, 5, [1])).toBeNull(); });
  it('空配列でエラー', () => { expect(validatePolymorphRiskInput(validHSP, 5, [])).toBeTruthy(); });
});

describe('validateAntiGraffitiInput', () => {
  it('有効でnull', () => { expect(validateAntiGraffitiInput(validHSP, 5, [1])).toBeNull(); });
  it('空配列でエラー', () => { expect(validateAntiGraffitiInput(validHSP, 5, [])).toBeTruthy(); });
});

describe('validatePrimerlessAdhesionInput', () => {
  it('有効でnull', () => { expect(validatePrimerlessAdhesionInput({ adhesiveHSP: validHSPObj, substrateHSP: validHSPObj })).toBeNull(); });
  it('nullでエラー', () => { expect(validatePrimerlessAdhesionInput(null)).toBeTruthy(); });
  it('adhesiveHSP欠落でエラー', () => { expect(validatePrimerlessAdhesionInput({ substrateHSP: validHSPObj })).toBeTruthy(); });
});
