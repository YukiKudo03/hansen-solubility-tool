/**
 * IPC ハンドラー — メインプロセスの業務ロジックオーケストレーション
 */
import { ipcMain, dialog } from 'electron';
import fs from 'fs';
import type { PartsRepository, SolventRepository, SettingsRepository, NanoParticleRepository, DrugRepository, DispersantRepository } from '../db/repository';
import { calculateRa, calculateRed } from '../core/hsp';
import { classifyRisk } from '../core/risk';
import { classifyDispersibility, DEFAULT_DISPERSIBILITY_THRESHOLDS } from '../core/dispersibility';
import { screenSolvents, filterByConstraints } from '../core/solvent-finder';
import { validatePartInput, validateSolventInput, validateName, validateThresholds, validateMixtureInput, validateNanoParticleInput, validateDispersibilityThresholds, validateWettabilityThresholds, validateBlendOptimizationInput, validateSwellingThresholds, validateDrugInput, validateDrugSolubilityThresholds, validateChemicalResistanceThresholds, validatePlasticizerThresholds, validateCarrierThresholds, validateAdhesionThresholds, validateSolventClassifications, validateGreenSolventInput, validateMultiObjectiveInput, validateGroupContributionInput, validateDispersantInput, validateDispersantThresholds, validateESCInput, validateCocrystalInput, validatePrinting3dInput, validateDielectricInput, validateExcipientInput, validatePolymerBlendInput, validateRecyclingInput, validateCompatibilizerInput, validateCopolymerInput, validateAdditiveMigrationInput, validateFlavorScalpingInput, validateFoodPackagingMigrationInput, validateFragranceEncapsulationInput, validateTransdermalEnhancerInput, validateLiposomePermeabilityInput, validateInkSubstrateAdhesionInput, validateMultilayerCoatingInput, validatePSAPeelStrengthInput, validateStructuralAdhesiveJointInput, validateSurfaceTreatmentInput, validateAdhesionStrengthThresholds, validatePigmentDispersionInput, validateCNTGrapheneInput, validateMXeneDispersionInput, validateDrugLoadingInput, validateGasPermeabilityInput, validateMembraneSeparationInput, validateCO2AbsorbentInput, validateHydrogenStorageInput, validateCleaningFormulationInput, validateNaturalDyeExtractionInput, validateEssentialOilExtractionInput, validateSoilRemediationInput, validateResidualSolventInput, validateMultiComponentOptimizationInput, validateLiBatteryElectrolyteInput, validateSolventSubstitutionInput, validateCosmeticEmulsionInput } from '../core/validation';
import { classifyChemicalResistance, DEFAULT_CHEMICAL_RESISTANCE_THRESHOLDS } from '../core/chemical-resistance';
import { classifyPlasticizerCompatibility, DEFAULT_PLASTICIZER_THRESHOLDS, screenPlasticizers } from '../core/plasticizer';
import { classifyCarrierCompatibility, DEFAULT_CARRIER_THRESHOLDS, screenCarriers } from '../core/carrier-selection';
import { classifySwelling, DEFAULT_SWELLING_THRESHOLDS } from '../core/swelling';
import { classifyDrugSolubility, DEFAULT_DRUG_SOLUBILITY_THRESHOLDS, screenDrugSolvents } from '../core/drug-solubility';
import { optimizeBlend } from '../core/blend-optimizer';
import { calculateMixture } from '../core/mixture';
import { estimateContactAngle } from '../core/contact-angle';
import { DEFAULT_WETTABILITY_THRESHOLDS, classifyWettability } from '../core/wettability';
import type { GroupEvaluationResult, PartEvaluationResult, MixtureComponent, NanoDispersionEvaluationResult, SolventDispersibilityResult, DispersibilityThresholds, SolventConstraints, ContactAngleResult, GroupContactAngleResult, WettabilityThresholds, SwellingThresholds, SwellingResult, GroupSwellingResult, DrugSolubilityThresholds, DrugSolubilityResult, DrugSolubilityScreeningResult, ChemicalResistanceThresholds, ChemicalResistanceResult, GroupChemicalResistanceResult, PlasticizerCompatibilityThresholds, CarrierCompatibilityThresholds } from '../core/types';
import type { SqliteBookmarkRepository, CreateBookmarkDto } from '../db/bookmark-repository';
import type { SqliteHistoryRepository } from '../db/history-repository';
import type { SerializedHistoryEntry } from '../core/evaluation-history';
import { isValidHistoryPipeline } from '../core/evaluation-history';
import { validateBookmark } from '../core/bookmark';
import { parseSolventCsv, parsePartCsv } from '../core/csv-import';
import { classifyAdhesion, DEFAULT_ADHESION_THRESHOLDS } from '../core/adhesion';
import { screenDispersants, screenSolventsForDispersant, screenDispersantsFallback, DEFAULT_DISPERSANT_THRESHOLDS } from '../core/dispersant-selection';
import type { DispersantAffinityThresholds } from '../core/types';
import { fitHSPSphere } from '../core/sphere-fitting';
import { findGreenAlternatives } from '../core/green-solvent';
import { screenMultiObjective } from '../core/multi-objective';
import { buildTeasPlotData } from '../core/teas-plot';
import { buildBagleyPlotData } from '../core/bagley-plot';
import { buildProjection2DData } from '../core/projection-2d';
import { estimateHSPStefanisPanayiotou, getAvailableFirstOrderGroups, getAvailableSecondOrderGroups } from '../core/group-contribution';
import { screenESCRisk } from '../core/esc-pipeline';
import { screenCocrystals } from '../core/cocrystal-screening';
import { screen3DPrintingSolvents } from '../core/printing3d-smoothing';
import { screenDielectricSolvents } from '../core/dielectric-film';
import { evaluateExcipientCompatibility } from '../core/excipient-compatibility';
import { screenAdditiveMigration, DEFAULT_MIGRATION_THRESHOLDS } from '../core/additive-migration';
import type { MigrationThresholds } from '../core/additive-migration';
import { screenFlavorScalping, DEFAULT_SCALPING_THRESHOLDS } from '../core/flavor-scalping';
import type { ScalpingThresholds } from '../core/flavor-scalping';
import { screenPackagingMigration, DEFAULT_PACKAGING_MIGRATION_THRESHOLDS } from '../core/food-packaging-migration';
import type { PackagingMigrationThresholds } from '../core/food-packaging-migration';
import { screenFragranceEncapsulation, DEFAULT_ENCAPSULATION_THRESHOLDS } from '../core/fragrance-encapsulation';
import type { EncapsulationThresholds } from '../core/fragrance-encapsulation';
import { screenTransdermalEnhancers, DEFAULT_TRANSDERMAL_THRESHOLDS } from '../core/transdermal-enhancer';
import type { TransdermalThresholds } from '../core/transdermal-enhancer';
import { screenDrugPermeability, DEFAULT_PERMEABILITY_THRESHOLDS } from '../core/liposome-permeability';
import type { PermeabilityThresholds } from '../core/liposome-permeability';
import type { HSPValues, AdhesionStrengthLevel, AdhesionStrengthThresholds, PeelStrengthLevel } from '../core/types';
import { AdhesionStrengthLevel as ASL, PeelStrengthLevel as PSL } from '../core/types';
import { calculateWorkOfAdhesionFromHSP } from '../core/work-of-adhesion';
import { screenPigmentDispersion } from '../core/pigment-dispersion-stability';
import { screenCNTGrapheneDispersion } from '../core/cnt-graphene-dispersion';
import { screenMXeneDispersion } from '../core/mxene-dispersion';
import { screenDrugLoading } from '../core/nanoparticle-drug-loading';
import { screenMembranePermeability } from '../core/polymer-membrane-gas-permeability';
import { evaluateSeparationSelectivity } from '../core/membrane-separation-selectivity';
import { screenCO2Absorbents } from '../core/co2-absorbent-selection';
import type { CO2Absorbent } from '../core/co2-absorbent-selection';
import { screenHydrogenStorageMaterials } from '../core/hydrogen-storage-material';
import { screenCleaningSolvents } from '../core/cleaning-product-formulation';
import { screenDyeExtractionSolvents } from '../core/natural-dye-extraction';
import { screenEssentialOilSolvents } from '../core/essential-oil-extraction';
import { screenRemediationSolvents } from '../core/soil-contaminant-extraction';
import { predictResidualSolvent } from '../core/residual-solvent-prediction';
import { screenUVFilterCompatibility } from '../core/sunscreen-uv-filter';
import { evaluateInhalationCompatibility } from '../core/inhalation-drug-propellant';
import { evaluateProteinAggregationRisk } from '../core/protein-aggregation-risk';
import { screenBiologicBuffers } from '../core/biologic-formulation-buffer';
import { validateSunscreenUVFilterInput, validateInhalationDrugInput, validateProteinAggregationInput, validateBiologicBufferInput, validateTemperatureHSPCorrectionInput, validatePressureHSPCorrectionInput, validateSCCO2CosolventInput } from '../core/validation';
import { correctHSPForTemperature } from '../core/temperature-hsp';
import { correctHSPForPressure, estimateCO2HSP } from '../core/pressure-hsp';
import { correctDeltaHAssociating, isAssociatingLiquid } from '../core/associating-liquid-correction';
import { screenSCCO2Cosolvents } from '../core/supercritical-co2-cosolvent';
import type { CosolventCandidate } from '../core/supercritical-co2-cosolvent';
import { validateCoatingDefectInput, validatePhotoresistDeveloperInput, validatePerovskiteSolventInput, validateOrganicSemiconductorFilmInput, validateUVCurableInkMonomerInput } from '../core/validation';
import { predictCoatingDefects } from '../core/coating-defect-prediction';
import { evaluatePhotoresistDeveloper } from '../core/photoresist-developer';
import { screenPerovskiteSolvents } from '../core/perovskite-solvent-engineering';
import { screenOSCSolvents } from '../core/organic-semiconductor-film';
import { screenUVInkMonomers } from '../core/uv-curable-ink-monomer';
import { calculatePolymerDissolutionTemp } from '../core/crystalline-polymer-dissolution';
import type { CrystallinePolymerParams } from '../core/crystalline-polymer-dissolution';
import { calculateHydrogelSwelling } from '../core/hydrogel-swelling-equilibrium';
import { evaluateRubberCompound } from '../core/rubber-compounding-design';
import type { FillerInfo, SwellingSolventInfo } from '../core/rubber-compounding-design';
import { screenCuringAgents } from '../core/thermoset-curing-agent';
import type { CuringAgent } from '../core/thermoset-curing-agent';
import { screenDyeability } from '../core/fiber-dyeability';
import type { Dye } from '../core/fiber-dyeability';
import { optimizeMultiComponentBlend, type SolventCandidate } from '../core/multicomponent-optimizer';
import { screenElectrolyteSolvents } from '../core/li-ion-battery-electrolyte';
import { findSolventSubstitutes } from '../core/solvent-substitution-design';
import { evaluateEmulsionStability } from '../core/cosmetic-emulsion-stability';
import { estimateHSPFromDescriptors } from '../core/ml-hsp-prediction';
import type { MolecularDescriptors } from '../core/ml-hsp-prediction';
import { importMDResults } from '../core/md-hsp-import';
import type { CEDComponents } from '../core/md-hsp-import';
import { estimateHSPExtended, getAvailableFirstOrderGroupsExtended, getAvailableSecondOrderGroupsExtended } from '../core/group-contribution-updates';
import { evaluatePolymorphRisk } from '../core/polymorph-solvate-risk';
import { screenAntiGraffitiCoatings } from '../core/anti-graffiti-coating';
import { optimizePrimerlessAdhesion } from '../core/primerless-adhesion';
import { validateMLHSPPredictionInput, validateMDHSPImportInput, validatePolymorphRiskInput, validateAntiGraffitiInput, validatePrimerlessAdhesionInput, validatePrintedElectronicsWettingInput, validateQDLigandExchangeInput, validateUnderfillEncapsulantInput, validateBiofuelCompatibilityInput, validatePCMEncapsulationInput, validateHSPUncertaintyInput, validateSurfaceHSPDeterminationInput, validateIonicLiquidHSPInput } from '../core/validation';
import { evaluatePrintedElectronicsWetting } from '../core/printed-electronics-wetting';
import { screenQDLigandExchangeSolvents } from '../core/quantum-dot-ligand-exchange';
import { evaluateUnderfillCompatibility } from '../core/underfill-encapsulant';
import { screenBiofuelCompatibility } from '../core/biofuel-material-compatibility';
import { screenPCMEncapsulation } from '../core/pcm-encapsulation';
import { bootstrapHSPUncertainty } from '../core/hsp-uncertainty-quantification';
import { estimateSurfaceHSPFromContactAngles } from '../core/surface-hsp-determination';
import type { ContactAngleTestInput } from '../core/surface-hsp-determination';
import { estimateILHSP } from '../core/ionic-liquid-des-hsp';
import { evaluatePolymerBlendMiscibility } from '../core/polymer-blend-miscibility';
import { evaluateRecyclingCompatibilityMatrix } from '../core/polymer-recycling-compatibility';
import { screenCompatibilizers } from '../core/compatibilizer-selection';
import { estimateCopolymerHSP } from '../core/copolymer-hsp-estimation';

/** CSVインポートの最大サイズ (10MB) */
const MAX_CSV_SIZE = 10 * 1024 * 1024;

/** JSON.parseの安全なラッパー — パース失敗時はfallbackを返す */
function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

export function registerIpcHandlers(
  partsRepo: PartsRepository,
  solventRepo: SolventRepository,
  settingsRepo: SettingsRepository,
  nanoParticleRepo: NanoParticleRepository,
  drugRepo: DrugRepository,
  bookmarkRepo: SqliteBookmarkRepository,
  historyRepo: SqliteHistoryRepository,
  dispersantRepo: DispersantRepository,
): void {
  // --- 部品グループ ---
  ipcMain.handle('parts:getAllGroups', () => partsRepo.getAllGroups());
  ipcMain.handle('parts:getGroupById', (_, id: number) => partsRepo.getGroupById(id));
  ipcMain.handle('parts:createGroup', (_, dto) => {
    const err = validateName(dto.name);
    if (err) throw new Error(err);
    return partsRepo.createGroup(dto);
  });
  ipcMain.handle('parts:updateGroup', (_, id, dto) => partsRepo.updateGroup(id, dto));
  ipcMain.handle('parts:deleteGroup', (_, id: number) => partsRepo.deleteGroup(id));

  // --- 部品 ---
  ipcMain.handle('parts:createPart', (_, dto) => {
    const err = validatePartInput(dto);
    if (err) throw new Error(err);
    return partsRepo.createPart(dto);
  });
  ipcMain.handle('parts:updatePart', (_, id, dto) => partsRepo.updatePart(id, dto));
  ipcMain.handle('parts:deletePart', (_, id: number) => partsRepo.deletePart(id));

  // --- 溶媒 ---
  ipcMain.handle('solvents:getAll', () => solventRepo.getAllSolvents());
  ipcMain.handle('solvents:getById', (_, id: number) => solventRepo.getSolventById(id));
  ipcMain.handle('solvents:search', (_, query: string) => solventRepo.searchSolvents(query));
  ipcMain.handle('solvents:create', (_, dto) => {
    const err = validateSolventInput(dto);
    if (err) throw new Error(err);
    return solventRepo.createSolvent(dto);
  });
  ipcMain.handle('solvents:update', (_, id, dto) => solventRepo.updateSolvent(id, dto));
  ipcMain.handle('solvents:delete', (_, id: number) => solventRepo.deleteSolvent(id));

  // --- 混合溶媒登録 ---
  ipcMain.handle('solvents:createMixture', (_, dto: { components: { solventId: number; volumeRatio: number }[]; name: string }) => {
    const err = validateMixtureInput(dto.components) ?? validateName(dto.name);
    if (err) throw new Error(err);

    const mixtureComponents: MixtureComponent[] = dto.components.map((c) => {
      const solvent = solventRepo.getSolventById(c.solventId);
      if (!solvent) throw new Error(`溶媒 (ID: ${c.solventId}) が見つかりません`);
      return { solvent, volumeRatio: c.volumeRatio };
    });

    const result = calculateMixture(mixtureComponents);
    return solventRepo.createSolvent({
      name: dto.name,
      deltaD: result.hsp.deltaD,
      deltaP: result.hsp.deltaP,
      deltaH: result.hsp.deltaH,
      molarVolume: result.molarVolume ?? undefined,
      molWeight: result.molWeight ?? undefined,
      boilingPoint: result.boilingPoint ?? undefined,
      viscosity: result.viscosity ?? undefined,
      specificGravity: result.specificGravity ?? undefined,
      surfaceTension: result.surfaceTension ?? undefined,
      notes: result.compositionNote,
    });
  });

  // --- 評価実行 ---
  ipcMain.handle('evaluate', (_, partsGroupId: number, solventId: number) => {
    const group = partsRepo.getGroupById(partsGroupId);
    if (!group) throw new Error(`部品グループ (ID: ${partsGroupId}) が見つかりません`);

    const solvent = solventRepo.getSolventById(solventId);
    if (!solvent) throw new Error(`溶媒 (ID: ${solventId}) が見つかりません`);

    const thresholds = settingsRepo.getThresholds();

    const results: PartEvaluationResult[] = group.parts.map((part) => {
      const ra = calculateRa(part.hsp, solvent.hsp);
      const red = calculateRed(part.hsp, solvent.hsp, part.r0);
      const riskLevel = classifyRisk(red, thresholds);
      return { part, solvent, ra, red, riskLevel };
    });

    const result: GroupEvaluationResult = {
      partsGroup: group,
      solvent,
      results,
      evaluatedAt: new Date(),
      thresholdsUsed: thresholds,
    };

    return result;
  });

  // --- 設定 ---
  ipcMain.handle('settings:getThresholds', () => settingsRepo.getThresholds());
  ipcMain.handle('settings:setThresholds', (_, thresholds) => {
    const err = validateThresholds(thresholds);
    if (err) throw new Error(err);
    return settingsRepo.setThresholds(thresholds);
  });

  // --- CSV保存 ---
  ipcMain.handle('csv:save', async (_, csvContent: string) => {
    const result = await dialog.showSaveDialog({
      title: 'CSV保存',
      defaultPath: `Hansen評価結果_${new Date().toISOString().slice(0, 10)}.csv`,
      filters: [{ name: 'CSV Files', extensions: ['csv'] }],
    });

    if (result.canceled || !result.filePath) {
      return { saved: false };
    }

    fs.writeFileSync(result.filePath, csvContent, 'utf-8');
    return { saved: true, filePath: result.filePath };
  });

  // --- ナノ粒子 CRUD ---
  ipcMain.handle('nanoParticles:getAll', () => nanoParticleRepo.getAll());
  ipcMain.handle('nanoParticles:getById', (_, id: number) => nanoParticleRepo.getById(id));
  ipcMain.handle('nanoParticles:getByCategory', (_, category: string) => nanoParticleRepo.getByCategory(category as import('../core/types').NanoParticleCategory));
  ipcMain.handle('nanoParticles:search', (_, query: string) => nanoParticleRepo.search(query));
  ipcMain.handle('nanoParticles:create', (_, dto) => {
    const err = validateNanoParticleInput(dto);
    if (err) throw new Error(err);
    return nanoParticleRepo.create(dto);
  });
  ipcMain.handle('nanoParticles:update', (_, id, dto) => {
    if (dto.name !== undefined) { const err = validateName(dto.name); if (err) throw new Error(err); }
    if (dto.deltaD !== undefined || dto.deltaP !== undefined || dto.deltaH !== undefined) {
      const existing = nanoParticleRepo.getById(id);
      if (!existing) throw new Error(`ナノ粒子 (ID: ${id}) が見つかりません`);
      const err = validateNanoParticleInput({
        name: dto.name ?? existing.name,
        category: dto.category ?? existing.category,
        coreMaterial: dto.coreMaterial ?? existing.coreMaterial,
        deltaD: dto.deltaD ?? existing.hsp.deltaD,
        deltaP: dto.deltaP ?? existing.hsp.deltaP,
        deltaH: dto.deltaH ?? existing.hsp.deltaH,
        r0: dto.r0 ?? existing.r0,
        particleSize: dto.particleSize,
      });
      if (err) throw new Error(err);
    }
    return nanoParticleRepo.update(id, dto);
  });
  ipcMain.handle('nanoParticles:delete', (_, id: number) => nanoParticleRepo.delete(id));

  // --- ナノ粒子分散評価 ---
  ipcMain.handle('nanoDispersion:evaluate', (_, particleId: number, solventId: number) => {
    const particle = nanoParticleRepo.getById(particleId);
    if (!particle) throw new Error(`ナノ粒子 (ID: ${particleId}) が見つかりません`);

    const solvent = solventRepo.getSolventById(solventId);
    if (!solvent) throw new Error(`溶媒 (ID: ${solventId}) が見つかりません`);

    const thresholdsJson = settingsRepo.getSetting('dispersibility_thresholds');
    const thresholds: DispersibilityThresholds = thresholdsJson
      ? safeJsonParse(thresholdsJson, DEFAULT_DISPERSIBILITY_THRESHOLDS)
      : { ...DEFAULT_DISPERSIBILITY_THRESHOLDS };

    const ra = calculateRa(particle.hsp, solvent.hsp);
    const red = calculateRed(particle.hsp, solvent.hsp, particle.r0);
    const dispersibility = classifyDispersibility(red, thresholds);

    const singleResult: SolventDispersibilityResult = { nanoParticle: particle, solvent, ra, red, dispersibility };
    const result: NanoDispersionEvaluationResult = {
      nanoParticle: particle,
      results: [singleResult],
      evaluatedAt: new Date(),
      thresholdsUsed: thresholds,
    };
    return result;
  });

  ipcMain.handle('nanoDispersion:screenAll', (_, particleId: number) => {
    const particle = nanoParticleRepo.getById(particleId);
    if (!particle) throw new Error(`ナノ粒子 (ID: ${particleId}) が見つかりません`);

    const solvents = solventRepo.getAllSolvents();
    const thresholdsJson = settingsRepo.getSetting('dispersibility_thresholds');
    const thresholds: DispersibilityThresholds = thresholdsJson
      ? safeJsonParse(thresholdsJson, DEFAULT_DISPERSIBILITY_THRESHOLDS)
      : { ...DEFAULT_DISPERSIBILITY_THRESHOLDS };

    const results = screenSolvents(particle, solvents, thresholds);
    const evalResult: NanoDispersionEvaluationResult = {
      nanoParticle: particle,
      results,
      evaluatedAt: new Date(),
      thresholdsUsed: thresholds,
    };
    return evalResult;
  });

  ipcMain.handle('nanoDispersion:screenFiltered', (_, particleId: number, constraints: SolventConstraints) => {
    const particle = nanoParticleRepo.getById(particleId);
    if (!particle) throw new Error(`ナノ粒子 (ID: ${particleId}) が見つかりません`);

    const solvents = solventRepo.getAllSolvents();
    const thresholdsJson = settingsRepo.getSetting('dispersibility_thresholds');
    const thresholds: DispersibilityThresholds = thresholdsJson
      ? safeJsonParse(thresholdsJson, DEFAULT_DISPERSIBILITY_THRESHOLDS)
      : { ...DEFAULT_DISPERSIBILITY_THRESHOLDS };

    const allResults = screenSolvents(particle, solvents, thresholds);
    const filtered = filterByConstraints(allResults, constraints);
    const evalResult: NanoDispersionEvaluationResult = {
      nanoParticle: particle,
      results: filtered,
      evaluatedAt: new Date(),
      thresholdsUsed: thresholds,
    };
    return evalResult;
  });

  // --- 分散性閾値設定 ---
  ipcMain.handle('settings:getDispersibilityThresholds', () => {
    const json = settingsRepo.getSetting('dispersibility_thresholds');
    if (!json) return { ...DEFAULT_DISPERSIBILITY_THRESHOLDS };
    return safeJsonParse(json, { ...DEFAULT_DISPERSIBILITY_THRESHOLDS });
  });
  ipcMain.handle('settings:setDispersibilityThresholds', (_, thresholds: DispersibilityThresholds) => {
    const err = validateDispersibilityThresholds(thresholds);
    if (err) throw new Error(err);
    settingsRepo.setSetting('dispersibility_thresholds', JSON.stringify(thresholds));
  });

  // --- 接触角推定 ---
  ipcMain.handle('contactAngle:evaluate', (_, partsGroupId: number, solventId: number) => {
    const group = partsRepo.getGroupById(partsGroupId);
    if (!group) throw new Error(`部品グループ (ID: ${partsGroupId}) が見つかりません`);

    const solvent = solventRepo.getSolventById(solventId);
    if (!solvent) throw new Error(`溶媒 (ID: ${solventId}) が見つかりません`);

    const thresholdsJson = settingsRepo.getSetting('wettability_thresholds');
    const thresholds: WettabilityThresholds = thresholdsJson
      ? safeJsonParse(thresholdsJson, { ...DEFAULT_WETTABILITY_THRESHOLDS })
      : { ...DEFAULT_WETTABILITY_THRESHOLDS };

    const results: ContactAngleResult[] = group.parts.map((part) => {
      const base = estimateContactAngle(part, solvent);
      const wettability = classifyWettability(base.contactAngle, thresholds);
      return { ...base, wettability };
    });

    const result: GroupContactAngleResult = {
      partsGroup: group,
      solvent,
      results,
      evaluatedAt: new Date(),
    };
    return result;
  });

  ipcMain.handle('contactAngle:screenSolvents', (_, partId: number, groupId: number) => {
    const group = partsRepo.getGroupById(groupId);
    if (!group) throw new Error(`部品グループ (ID: ${groupId}) が見つかりません`);

    const part = group.parts.find((p) => p.id === partId);
    if (!part) throw new Error(`部品 (ID: ${partId}) が見つかりません`);

    const solvents = solventRepo.getAllSolvents();
    if (solvents.length === 0) throw new Error('溶媒が登録されていません');
    const thresholdsJson = settingsRepo.getSetting('wettability_thresholds');
    const thresholds: WettabilityThresholds = thresholdsJson
      ? safeJsonParse(thresholdsJson, { ...DEFAULT_WETTABILITY_THRESHOLDS })
      : { ...DEFAULT_WETTABILITY_THRESHOLDS };

    const results: ContactAngleResult[] = solvents.map((solvent) => {
      const base = estimateContactAngle(part, solvent);
      const wettability = classifyWettability(base.contactAngle, thresholds);
      return { ...base, wettability };
    });

    // 接触角昇順でソート
    results.sort((a, b) => a.contactAngle - b.contactAngle);
    const result: GroupContactAngleResult = {
      partsGroup: group,
      solvent: results[0]?.solvent ?? solvents[0],
      results,
      evaluatedAt: new Date(),
    };
    return result;
  });

  // --- 濡れ性閾値設定 ---
  ipcMain.handle('settings:getWettabilityThresholds', () => {
    const json = settingsRepo.getSetting('wettability_thresholds');
    if (!json) return { ...DEFAULT_WETTABILITY_THRESHOLDS };
    return safeJsonParse(json, { ...DEFAULT_WETTABILITY_THRESHOLDS });
  });
  ipcMain.handle('settings:setWettabilityThresholds', (_, thresholds: WettabilityThresholds) => {
    const err = validateWettabilityThresholds(thresholds);
    if (err) throw new Error(err);
    settingsRepo.setSetting('wettability_thresholds', JSON.stringify(thresholds));
  });

  // --- 膨潤度予測 ---
  ipcMain.handle('swelling:evaluate', (_, partsGroupId: number, solventId: number) => {
    const group = partsRepo.getGroupById(partsGroupId);
    if (!group) throw new Error(`部品グループ (ID: ${partsGroupId}) が見つかりません`);
    const solvent = solventRepo.getSolventById(solventId);
    if (!solvent) throw new Error(`溶媒 (ID: ${solventId}) が見つかりません`);

    const thresholdsJson = settingsRepo.getSetting('swelling_thresholds');
    const thresholds: SwellingThresholds = thresholdsJson
      ? safeJsonParse(thresholdsJson, { ...DEFAULT_SWELLING_THRESHOLDS })
      : { ...DEFAULT_SWELLING_THRESHOLDS };

    const results: SwellingResult[] = group.parts.map((part) => {
      const ra = calculateRa(part.hsp, solvent.hsp);
      const red = calculateRed(part.hsp, solvent.hsp, part.r0);
      const swellingLevel = classifySwelling(red, thresholds);
      return { part, solvent, ra, red, swellingLevel };
    });

    const result: GroupSwellingResult = {
      partsGroup: group,
      solvent,
      results,
      evaluatedAt: new Date(),
      thresholdsUsed: thresholds,
    };
    return result;
  });

  // --- 膨潤度閾値設定 ---
  ipcMain.handle('settings:getSwellingThresholds', () => {
    const json = settingsRepo.getSetting('swelling_thresholds');
    if (!json) return { ...DEFAULT_SWELLING_THRESHOLDS };
    return safeJsonParse(json, { ...DEFAULT_SWELLING_THRESHOLDS });
  });
  ipcMain.handle('settings:setSwellingThresholds', (_, thresholds: SwellingThresholds) => {
    const err = validateSwellingThresholds(thresholds);
    if (err) throw new Error(err);
    settingsRepo.setSetting('swelling_thresholds', JSON.stringify(thresholds));
  });

  // --- 薬物 CRUD ---
  ipcMain.handle('drugs:getAll', () => drugRepo.getAll());
  ipcMain.handle('drugs:getById', (_, id: number) => drugRepo.getById(id));
  ipcMain.handle('drugs:getByCategory', (_, category: string) => drugRepo.getByTherapeuticCategory(category));
  ipcMain.handle('drugs:search', (_, query: string) => drugRepo.search(query));
  ipcMain.handle('drugs:create', (_, dto) => {
    const err = validateDrugInput(dto);
    if (err) throw new Error(err);
    return drugRepo.create(dto);
  });
  ipcMain.handle('drugs:update', (_, id, dto) => drugRepo.update(id, dto));
  ipcMain.handle('drugs:delete', (_, id: number) => drugRepo.delete(id));

  // --- 薬物溶解性評価 ---
  ipcMain.handle('drugSolubility:evaluate', (_, drugId: number, solventId: number) => {
    const drug = drugRepo.getById(drugId);
    if (!drug) throw new Error(`薬物 (ID: ${drugId}) が見つかりません`);
    const solvent = solventRepo.getSolventById(solventId);
    if (!solvent) throw new Error(`溶媒 (ID: ${solventId}) が見つかりません`);

    const thresholdsJson = settingsRepo.getSetting('drug_solubility_thresholds');
    const thresholds: DrugSolubilityThresholds = thresholdsJson
      ? safeJsonParse(thresholdsJson, { ...DEFAULT_DRUG_SOLUBILITY_THRESHOLDS })
      : { ...DEFAULT_DRUG_SOLUBILITY_THRESHOLDS };

    const ra = calculateRa(drug.hsp, solvent.hsp);
    const red = calculateRed(drug.hsp, solvent.hsp, drug.r0);
    const solubility = classifyDrugSolubility(red, thresholds);
    const singleResult: DrugSolubilityResult = { drug, solvent, ra, red, solubility };
    const result: DrugSolubilityScreeningResult = {
      drug,
      results: [singleResult],
      evaluatedAt: new Date(),
      thresholdsUsed: thresholds,
    };
    return result;
  });

  ipcMain.handle('drugSolubility:screenAll', (_, drugId: number) => {
    const drug = drugRepo.getById(drugId);
    if (!drug) throw new Error(`薬物 (ID: ${drugId}) が見つかりません`);
    const solvents = solventRepo.getAllSolvents();
    const thresholdsJson = settingsRepo.getSetting('drug_solubility_thresholds');
    const thresholds: DrugSolubilityThresholds = thresholdsJson
      ? safeJsonParse(thresholdsJson, { ...DEFAULT_DRUG_SOLUBILITY_THRESHOLDS })
      : { ...DEFAULT_DRUG_SOLUBILITY_THRESHOLDS };
    return screenDrugSolvents(drug, solvents, thresholds);
  });

  // --- 薬物溶解性閾値設定 ---
  ipcMain.handle('settings:getDrugSolubilityThresholds', () => {
    const json = settingsRepo.getSetting('drug_solubility_thresholds');
    if (!json) return { ...DEFAULT_DRUG_SOLUBILITY_THRESHOLDS };
    return safeJsonParse(json, { ...DEFAULT_DRUG_SOLUBILITY_THRESHOLDS });
  });
  ipcMain.handle('settings:setDrugSolubilityThresholds', (_, thresholds: DrugSolubilityThresholds) => {
    const err = validateDrugSolubilityThresholds(thresholds);
    if (err) throw new Error(err);
    settingsRepo.setSetting('drug_solubility_thresholds', JSON.stringify(thresholds));
  });

  // --- ブレンド最適化 ---
  ipcMain.handle('blend:optimize', (_, params: {
    targetDeltaD: number; targetDeltaP: number; targetDeltaH: number;
    candidateSolventIds: number[]; maxComponents: 2 | 3; stepSize: number; topN: number;
  }) => {
    const err = validateBlendOptimizationInput({
      targetDeltaD: params.targetDeltaD,
      targetDeltaP: params.targetDeltaP,
      targetDeltaH: params.targetDeltaH,
      candidateCount: params.candidateSolventIds.length,
      maxComponents: params.maxComponents,
      stepSize: params.stepSize,
      topN: params.topN,
    });
    if (err) throw new Error(err);

    const candidateSolvents = params.candidateSolventIds.map((id) => {
      const solvent = solventRepo.getSolventById(id);
      if (!solvent) throw new Error(`溶媒 (ID: ${id}) が見つかりません`);
      return solvent;
    });

    return optimizeBlend({
      targetHSP: { deltaD: params.targetDeltaD, deltaP: params.targetDeltaP, deltaH: params.targetDeltaH },
      candidateSolvents,
      maxComponents: params.maxComponents,
      stepSize: params.stepSize,
      topN: params.topN,
    });
  });

  // --- 耐薬品性評価 ---
  ipcMain.handle('chemicalResistance:evaluate', (_, partsGroupId: number, solventId: number) => {
    const group = partsRepo.getGroupById(partsGroupId);
    if (!group) throw new Error(`部品グループ (ID: ${partsGroupId}) が見つかりません`);
    const solvent = solventRepo.getSolventById(solventId);
    if (!solvent) throw new Error(`溶媒 (ID: ${solventId}) が見つかりません`);

    const thresholdsJson = settingsRepo.getSetting('chemical_resistance_thresholds');
    const thresholds: ChemicalResistanceThresholds = thresholdsJson
      ? safeJsonParse(thresholdsJson, { ...DEFAULT_CHEMICAL_RESISTANCE_THRESHOLDS })
      : { ...DEFAULT_CHEMICAL_RESISTANCE_THRESHOLDS };

    const results: ChemicalResistanceResult[] = group.parts.map((part) => {
      const ra = calculateRa(part.hsp, solvent.hsp);
      const red = calculateRed(part.hsp, solvent.hsp, part.r0);
      const resistanceLevel = classifyChemicalResistance(red, thresholds);
      return { part, solvent, ra, red, resistanceLevel };
    });

    const result: GroupChemicalResistanceResult = {
      partsGroup: group,
      solvent,
      results,
      evaluatedAt: new Date(),
      thresholdsUsed: thresholds,
    };
    return result;
  });

  // --- 耐薬品性閾値設定 ---
  ipcMain.handle('settings:getChemicalResistanceThresholds', () => {
    const json = settingsRepo.getSetting('chemical_resistance_thresholds');
    if (!json) return { ...DEFAULT_CHEMICAL_RESISTANCE_THRESHOLDS };
    return safeJsonParse(json, { ...DEFAULT_CHEMICAL_RESISTANCE_THRESHOLDS });
  });
  ipcMain.handle('settings:setChemicalResistanceThresholds', (_, thresholds: ChemicalResistanceThresholds) => {
    const err = validateChemicalResistanceThresholds(thresholds);
    if (err) throw new Error(err);
    settingsRepo.setSetting('chemical_resistance_thresholds', JSON.stringify(thresholds));
  });

  // --- 可塑剤選定 ---
  ipcMain.handle('solvents:getPlasticizers', () => solventRepo.getPlasticizers());

  ipcMain.handle('plasticizer:screen', (_, partId: number, groupId: number) => {
    const group = partsRepo.getGroupById(groupId);
    if (!group) throw new Error(`部品グループ (ID: ${groupId}) が見つかりません`);
    const part = group.parts.find((p) => p.id === partId);
    if (!part) throw new Error(`部品 (ID: ${partId}) が見つかりません`);

    const plasticizers = solventRepo.getPlasticizers();
    const thresholdsJson = settingsRepo.getSetting('plasticizer_thresholds');
    const thresholds: PlasticizerCompatibilityThresholds = thresholdsJson
      ? safeJsonParse(thresholdsJson, { ...DEFAULT_PLASTICIZER_THRESHOLDS })
      : { ...DEFAULT_PLASTICIZER_THRESHOLDS };

    return screenPlasticizers(part, plasticizers, thresholds);
  });

  // --- 可塑剤閾値設定 ---
  ipcMain.handle('settings:getPlasticizerThresholds', () => {
    const json = settingsRepo.getSetting('plasticizer_thresholds');
    if (!json) return { ...DEFAULT_PLASTICIZER_THRESHOLDS };
    return safeJsonParse(json, { ...DEFAULT_PLASTICIZER_THRESHOLDS });
  });
  ipcMain.handle('settings:setPlasticizerThresholds', (_, thresholds: PlasticizerCompatibilityThresholds) => {
    const err = validatePlasticizerThresholds(thresholds);
    if (err) throw new Error(err);
    settingsRepo.setSetting('plasticizer_thresholds', JSON.stringify(thresholds));
  });

  // --- キャリア選定（DDS） ---
  ipcMain.handle('carrier:evaluate', (_, drugId: number, carrierId: number, carrierGroupId: number) => {
    const drug = drugRepo.getById(drugId);
    if (!drug) throw new Error(`薬物 (ID: ${drugId}) が見つかりません`);

    const group = partsRepo.getGroupById(carrierGroupId);
    if (!group) throw new Error(`キャリアグループ (ID: ${carrierGroupId}) が見つかりません`);
    const carrier = group.parts.find((p) => p.id === carrierId);
    if (!carrier) throw new Error(`キャリア (ID: ${carrierId}) が見つかりません`);

    const thresholdsJson = settingsRepo.getSetting('carrier_thresholds');
    const thresholds: CarrierCompatibilityThresholds = thresholdsJson
      ? safeJsonParse(thresholdsJson, { ...DEFAULT_CARRIER_THRESHOLDS })
      : { ...DEFAULT_CARRIER_THRESHOLDS };

    const ra = calculateRa(drug.hsp, carrier.hsp);
    // r0 belongs to carrier (HSP sphere owner), NOT drug
    const red = calculateRed(drug.hsp, carrier.hsp, carrier.r0);
    const compatibility = classifyCarrierCompatibility(red, thresholds);

    return {
      drug,
      results: [{ drug, carrier, ra, red, compatibility }],
      evaluatedAt: new Date(),
      thresholdsUsed: thresholds,
    };
  });

  ipcMain.handle('carrier:screenAll', (_, drugId: number, carrierGroupId: number) => {
    const drug = drugRepo.getById(drugId);
    if (!drug) throw new Error(`薬物 (ID: ${drugId}) が見つかりません`);

    const group = partsRepo.getGroupById(carrierGroupId);
    if (!group) throw new Error(`キャリアグループ (ID: ${carrierGroupId}) が見つかりません`);

    const thresholdsJson = settingsRepo.getSetting('carrier_thresholds');
    const thresholds: CarrierCompatibilityThresholds = thresholdsJson
      ? safeJsonParse(thresholdsJson, { ...DEFAULT_CARRIER_THRESHOLDS })
      : { ...DEFAULT_CARRIER_THRESHOLDS };

    return screenCarriers(drug, group.parts, thresholds);
  });

  // --- キャリア閾値設定 ---
  ipcMain.handle('settings:getCarrierThresholds', () => {
    const json = settingsRepo.getSetting('carrier_thresholds');
    if (!json) return { ...DEFAULT_CARRIER_THRESHOLDS };
    return safeJsonParse(json, { ...DEFAULT_CARRIER_THRESHOLDS });
  });
  ipcMain.handle('settings:setCarrierThresholds', (_, thresholds: CarrierCompatibilityThresholds) => {
    const err = validateCarrierThresholds(thresholds);
    if (err) throw new Error(err);
    settingsRepo.setSetting('carrier_thresholds', JSON.stringify(thresholds));
  });

  // --- ブックマーク ---
  ipcMain.handle('bookmarks:getAll', () => bookmarkRepo.getAll());
  ipcMain.handle('bookmarks:create', (_, dto: CreateBookmarkDto) => {
    const err = validateBookmark(dto.name, dto.pipeline, safeJsonParse(dto.paramsJson, {}));
    if (err) throw new Error(err);
    return bookmarkRepo.create(dto);
  });
  ipcMain.handle('bookmarks:delete', (_, id: number) => bookmarkRepo.delete(id));

  // --- 評価履歴 ---
  ipcMain.handle('history:getAll', () => historyRepo.getAll());
  ipcMain.handle('history:getByPipeline', (_, pipeline: string) => {
    if (!isValidHistoryPipeline(pipeline)) throw new Error(`不正なパイプライン名です: ${pipeline}`);
    return historyRepo.getByPipeline(pipeline);
  });
  ipcMain.handle('history:save', (_, entry: SerializedHistoryEntry, note?: string) => historyRepo.create(entry, note));
  ipcMain.handle('history:delete', (_, id: number) => historyRepo.delete(id));
  ipcMain.handle('history:deleteOlderThan', (_, days: number) => {
    if (!Number.isFinite(days) || days < 1) throw new Error('日数は1以上の整数を指定してください');
    return historyRepo.deleteOlderThan(Math.floor(days));
  });

  // --- CSVインポート ---
  ipcMain.handle('import:parseSolventCsv', (_, csv: string) => {
    if (csv.length > MAX_CSV_SIZE) throw new Error(`CSVファイルが大きすぎます（上限: ${MAX_CSV_SIZE / 1024 / 1024}MB）`);
    return parseSolventCsv(csv);
  });
  ipcMain.handle('import:parsePartCsv', (_, csv: string) => {
    if (csv.length > MAX_CSV_SIZE) throw new Error(`CSVファイルが大きすぎます（上限: ${MAX_CSV_SIZE / 1024 / 1024}MB）`);
    return parsePartCsv(csv);
  });
  ipcMain.handle('import:openFile', async () => {
    const result = await dialog.showOpenDialog({
      filters: [{ name: 'CSV', extensions: ['csv'] }],
      properties: ['openFile'],
    });
    if (result.canceled || result.filePaths.length === 0) return null;
    return fs.readFileSync(result.filePaths[0], 'utf-8');
  });

  // --- 接着性予測 ---
  ipcMain.handle('adhesion:evaluate', (_, partsGroupId: number, solventId: number) => {
    const group = partsRepo.getGroupById(partsGroupId);
    if (!group) throw new Error(`部品グループ (ID: ${partsGroupId}) が見つかりません`);
    const solvent = solventRepo.getSolventById(solventId);
    if (!solvent) throw new Error(`溶媒 (ID: ${solventId}) が見つかりません`);

    const thresholdsJson = settingsRepo.getSetting('adhesion_thresholds');
    const thresholds = thresholdsJson
      ? safeJsonParse(thresholdsJson, { ...DEFAULT_ADHESION_THRESHOLDS })
      : { ...DEFAULT_ADHESION_THRESHOLDS };

    const results = group.parts.map((part) => {
      const ra = calculateRa(part.hsp, solvent.hsp);
      const adhesionLevel = classifyAdhesion(ra, thresholds);
      return { part, solvent, ra, adhesionLevel };
    });

    return {
      partsGroup: group,
      solvent,
      results,
      evaluatedAt: new Date(),
      thresholdsUsed: thresholds,
    };
  });

  // --- 接着性閾値設定 ---
  ipcMain.handle('settings:getAdhesionThresholds', () => {
    const json = settingsRepo.getSetting('adhesion_thresholds');
    if (!json) return { ...DEFAULT_ADHESION_THRESHOLDS };
    return safeJsonParse(json, { ...DEFAULT_ADHESION_THRESHOLDS });
  });
  ipcMain.handle('settings:setAdhesionThresholds', (_, thresholds) => {
    const err = validateAdhesionThresholds(thresholds);
    if (err) throw new Error(err);
    settingsRepo.setSetting('adhesion_thresholds', JSON.stringify(thresholds));
  });

  // --- HSP球フィッティング ---
  ipcMain.handle('sphereFitting:fit', (_, classifications: Array<{solventId: number; isGood: boolean}>) => {
    const classErr = validateSolventClassifications(classifications);
    if (classErr) throw new Error(classErr);
    const data = classifications.map((c) => {
      const solvent = solventRepo.getSolventById(c.solventId);
      if (!solvent) throw new Error(`溶媒 (ID: ${c.solventId}) が見つかりません`);
      return { solvent: { hsp: solvent.hsp, name: solvent.name }, isGood: c.isGood };
    });
    return fitHSPSphere(data);
  });

  // --- グリーン溶媒代替 ---
  ipcMain.handle('greenSolvent:find', (_, targetSolventId: number, maxResults?: number) => {
    const greenErr = validateGreenSolventInput(targetSolventId, maxResults);
    if (greenErr) throw new Error(greenErr);
    const target = solventRepo.getSolventById(targetSolventId);
    if (!target) throw new Error(`溶媒 (ID: ${targetSolventId}) が見つかりません`);
    const allSolvents = solventRepo.getAllSolvents();
    return findGreenAlternatives(target, allSolvents, maxResults ?? 20);
  });

  // --- 多目的溶媒選定 ---
  ipcMain.handle('multiObjective:screen', (_, params: {
    targetDeltaD: number; targetDeltaP: number; targetDeltaH: number;
    r0: number; weights?: import('../core/multi-objective').ObjectiveWeights;
    preferredBoilingPointRange?: { min: number; max: number };
    maxViscosity?: number; maxSurfaceTension?: number;
  }) => {
    const moErr = validateMultiObjectiveInput(params);
    if (moErr) throw new Error(moErr);
    const solvents = solventRepo.getAllSolvents();
    return screenMultiObjective(
      {
        targetHSP: { deltaD: params.targetDeltaD, deltaP: params.targetDeltaP, deltaH: params.targetDeltaH },
        r0: params.r0,
        preferredBoilingPointRange: params.preferredBoilingPointRange,
        maxViscosity: params.maxViscosity,
        maxSurfaceTension: params.maxSurfaceTension,
      },
      solvents,
      params.weights,
    );
  });

  // --- Teas/Bagley/2D射影データ ---
  ipcMain.handle('visualization:teasPlot', () => {
    const solvents = solventRepo.getAllSolvents();
    const groups = partsRepo.getAllGroups();
    const parts = groups.flatMap((g) => g.parts);
    return buildTeasPlotData(solvents, parts);
  });

  ipcMain.handle('visualization:bagleyPlot', () => {
    const solvents = solventRepo.getAllSolvents();
    const groups = partsRepo.getAllGroups();
    const parts = groups.flatMap((g) => g.parts);
    return buildBagleyPlotData(solvents, parts);
  });

  ipcMain.handle('visualization:projection2d', () => {
    const solvents = solventRepo.getAllSolvents();
    const groups = partsRepo.getAllGroups();
    const parts = groups.flatMap((g) => g.parts);
    return buildProjection2DData(solvents, parts);
  });

  // --- 族寄与法 ---
  ipcMain.handle('groupContribution:estimate', (_, input: import('../core/group-contribution').GroupContributionInput) => {
    const gcErr = validateGroupContributionInput(input);
    if (gcErr) throw new Error(gcErr);
    return estimateHSPStefanisPanayiotou(input);
  });

  ipcMain.handle('groupContribution:getGroups', () => {
    return {
      firstOrder: getAvailableFirstOrderGroups(),
      secondOrder: getAvailableSecondOrderGroups(),
    };
  });

  // --- 分散剤CRUD ---
  ipcMain.handle('dispersants:getAll', () => dispersantRepo.getAll());
  ipcMain.handle('dispersants:getById', (_, id: number) => dispersantRepo.getById(id));
  ipcMain.handle('dispersants:getByType', (_, type: string) => dispersantRepo.getByType(type as import('../core/types').DispersantType));
  ipcMain.handle('dispersants:search', (_, query: string) => dispersantRepo.search(query));
  ipcMain.handle('dispersants:create', (_, dto) => {
    const err = validateDispersantInput(dto);
    if (err) throw new Error(err);
    return dispersantRepo.create(dto);
  });
  ipcMain.handle('dispersants:update', (_, id, dto) => {
    if (dto.name !== undefined) { const err = validateName(dto.name); if (err) throw new Error(err); }
    return dispersantRepo.update(id, dto);
  });
  ipcMain.handle('dispersants:delete', (_, id: number) => dispersantRepo.delete(id));

  // --- 分散剤選定: 分散剤スクリーニング ---
  ipcMain.handle('dispersantSelection:screen', (_, particleId: number, solventId: number) => {
    const particle = nanoParticleRepo.getById(particleId);
    if (!particle) throw new Error(`ナノ粒子 (ID: ${particleId}) が見つかりません`);
    const solvent = solventRepo.getSolventById(solventId);
    if (!solvent) throw new Error(`溶媒 (ID: ${solventId}) が見つかりません`);

    const thresholdsJson = settingsRepo.getSetting('dispersant_thresholds');
    const thresholds: DispersantAffinityThresholds = thresholdsJson
      ? safeJsonParse(thresholdsJson, DEFAULT_DISPERSANT_THRESHOLDS)
      : { ...DEFAULT_DISPERSANT_THRESHOLDS };

    const dispersants = dispersantRepo.getAll();
    return screenDispersants(particle, solvent, dispersants, thresholds);
  });

  // --- 分散剤選定: 逆引き溶媒スクリーニング ---
  ipcMain.handle('dispersantSelection:screenSolvents', (_, particleId: number, dispersantId: number) => {
    const particle = nanoParticleRepo.getById(particleId);
    if (!particle) throw new Error(`ナノ粒子 (ID: ${particleId}) が見つかりません`);
    const dispersant = dispersantRepo.getById(dispersantId);
    if (!dispersant) throw new Error(`分散剤 (ID: ${dispersantId}) が見つかりません`);

    const thresholdsJson = settingsRepo.getSetting('dispersant_thresholds');
    const thresholds: DispersantAffinityThresholds = thresholdsJson
      ? safeJsonParse(thresholdsJson, DEFAULT_DISPERSANT_THRESHOLDS)
      : { ...DEFAULT_DISPERSANT_THRESHOLDS };

    const solvents = solventRepo.getAllSolvents();
    return screenSolventsForDispersant(particle, dispersant, solvents, thresholds);
  });

  // --- 分散剤選定: フォールバック（全体HSPのみ） ---
  ipcMain.handle('dispersantSelection:screenFallback', (_, particleId: number) => {
    const particle = nanoParticleRepo.getById(particleId);
    if (!particle) throw new Error(`ナノ粒子 (ID: ${particleId}) が見つかりません`);

    const thresholdsJson = settingsRepo.getSetting('dispersant_thresholds');
    const thresholds: DispersantAffinityThresholds = thresholdsJson
      ? safeJsonParse(thresholdsJson, DEFAULT_DISPERSANT_THRESHOLDS)
      : { ...DEFAULT_DISPERSANT_THRESHOLDS };

    const dispersants = dispersantRepo.getAll();
    return screenDispersantsFallback(particle, dispersants, thresholds);
  });

  // --- 分散剤選定: 閾値設定 ---
  ipcMain.handle('settings:getDispersantThresholds', () => {
    const json = settingsRepo.getSetting('dispersant_thresholds');
    return json ? safeJsonParse(json, DEFAULT_DISPERSANT_THRESHOLDS) : { ...DEFAULT_DISPERSANT_THRESHOLDS };
  });

  ipcMain.handle('settings:setDispersantThresholds', (_, thresholds: DispersantAffinityThresholds) => {
    const err = validateDispersantThresholds(thresholds);
    if (err) throw new Error(err);
    settingsRepo.setSetting('dispersant_thresholds', JSON.stringify(thresholds));
    return thresholds;
  });

  // --- ESCパイプライン ---
  ipcMain.handle('esc:screen', (_, groupId: number) => {
    const group = partsRepo.getGroupById(groupId);
    if (!group) throw new Error(`部品グループ (ID: ${groupId}) が見つかりません`);
    if (group.parts.length === 0) throw new Error(`部品グループ (ID: ${groupId}) に部品がありません`);
    const firstPart = group.parts[0];
    const polymerHSP = firstPart.hsp;
    const r0 = firstPart.r0;
    const allSolvents = solventRepo.getAllSolvents();
    const solvents = allSolvents.map((s) => ({ name: s.name, hsp: s.hsp }));
    const err = validateESCInput(polymerHSP, r0, solvents);
    if (err) throw new Error(err);
    const rawResults = screenESCRisk(polymerHSP, r0, solvents);
    const results = rawResults.map((r) => ({ ...r, riskLevel: r.risk }));
    return { partsGroup: group, results, evaluatedAt: new Date() };
  });

  // --- 共結晶スクリーニング ---
  ipcMain.handle('cocrystal:screen', (_, drugId: number) => {
    const drug = drugRepo.getById(drugId);
    if (!drug) throw new Error(`薬物 (ID: ${drugId}) が見つかりません`);
    const apiHSP = drug.hsp;
    const r0 = drug.r0;
    const allSolvents = solventRepo.getAllSolvents();
    const coformers = allSolvents.map((s) => ({ name: s.name, hsp: s.hsp }));
    const err = validateCocrystalInput(apiHSP, r0, coformers);
    if (err) throw new Error(err);
    const results = screenCocrystals(apiHSP, r0, coformers);
    return { drug, results, evaluatedAt: new Date() };
  });

  // --- 3Dプリント溶剤平滑化 ---
  ipcMain.handle('printing3d:screen', (_, groupId: number) => {
    const group = partsRepo.getGroupById(groupId);
    if (!group) throw new Error(`部品グループ (ID: ${groupId}) が見つかりません`);
    if (group.parts.length === 0) throw new Error(`部品グループ (ID: ${groupId}) に部品がありません`);
    const firstPart = group.parts[0];
    const filamentHSP = firstPart.hsp;
    const r0 = firstPart.r0;
    const allSolvents = solventRepo.getAllSolvents();
    const solvents = allSolvents.map((s) => ({ name: s.name, hsp: s.hsp }));
    const err = validatePrinting3dInput(filamentHSP, r0, solvents);
    if (err) throw new Error(err);
    const rawResults = screen3DPrintingSolvents(filamentHSP, r0, solvents);
    const results = rawResults.map((r) => ({ ...r, effectLevel: r.effect }));
    return { partsGroup: group, results, evaluatedAt: new Date() };
  });

  // --- 誘電体薄膜品質 ---
  ipcMain.handle('dielectric:screen', (_, groupId: number) => {
    const group = partsRepo.getGroupById(groupId);
    if (!group) throw new Error(`部品グループ (ID: ${groupId}) が見つかりません`);
    if (group.parts.length === 0) throw new Error(`部品グループ (ID: ${groupId}) に部品がありません`);
    const firstPart = group.parts[0];
    const polymerHSP = firstPart.hsp;
    const r0 = firstPart.r0;
    const allSolvents = solventRepo.getAllSolvents();
    const solvents = allSolvents.map((s) => ({ name: s.name, hsp: s.hsp, boilingPoint: s.boilingPoint ?? undefined }));
    const err = validateDielectricInput(polymerHSP, r0, solvents);
    if (err) throw new Error(err);
    const rawResults = screenDielectricSolvents(polymerHSP, r0, solvents);
    const results = rawResults.map((r) => ({ ...r, qualityLevel: r.filmQuality }));
    return { partsGroup: group, results, evaluatedAt: new Date() };
  });

  // --- 賦形剤適合性 ---
  ipcMain.handle('excipient:evaluate', (_, drugId: number) => {
    const drug = drugRepo.getById(drugId);
    if (!drug) throw new Error(`薬物 (ID: ${drugId}) が見つかりません`);
    const apiHSP = drug.hsp;
    const r0 = drug.r0;
    const allSolvents = solventRepo.getAllSolvents();
    const excipients = allSolvents.map((s) => ({ name: s.name, hsp: s.hsp }));
    const err = validateExcipientInput(apiHSP, r0, excipients);
    if (err) throw new Error(err);
    const rawResults = evaluateExcipientCompatibility(apiHSP, r0, excipients);
    const results = rawResults.map((r) => ({ ...r, compatibilityLevel: r.compatibility }));
    return { drug, results, evaluatedAt: new Date() };
  });

  // --- ポリマーブレンド相溶性 ---
  ipcMain.handle('polymerBlend:evaluate', (_, params: {
    groupId1: number; groupId2: number;
    degreeOfPolymerization: number; referenceVolume: number;
  }) => {
    const err = validatePolymerBlendInput(params);
    if (err) throw new Error(err);

    const group1 = partsRepo.getGroupById(params.groupId1);
    if (!group1) throw new Error(`部品グループ (ID: ${params.groupId1}) が見つかりません`);
    const group2 = partsRepo.getGroupById(params.groupId2);
    if (!group2) throw new Error(`部品グループ (ID: ${params.groupId2}) が見つかりません`);

    // Pairwise Flory-Huggins χ calculation using core module
    const results: Array<{
      polymer1Name: string; polymer2Name: string;
      polymer1HSP: HSPValues; polymer2HSP: HSPValues;
      ra: number; chiParameter: number; miscibility: string;
    }> = [];

    for (const p1 of group1.parts) {
      for (const p2 of group2.parts) {
        const blend = evaluatePolymerBlendMiscibility(
          { name: p1.name, hsp: p1.hsp, degreeOfPolymerization: params.degreeOfPolymerization },
          { name: p2.name, hsp: p2.hsp, degreeOfPolymerization: params.degreeOfPolymerization },
          params.referenceVolume
        );
        results.push({
          polymer1Name: p1.name, polymer2Name: p2.name,
          polymer1HSP: p1.hsp, polymer2HSP: p2.hsp,
          ra: blend.ra, chiParameter: blend.chi, miscibility: blend.miscibility,
        });
      }
    }

    return { group1Name: group1.name, group2Name: group2.name, results, evaluatedAt: new Date() };
  });

  // --- リサイクル相溶性 ---
  ipcMain.handle('polymerRecycling:evaluate', (_, params: {
    groupIds: number[];
    degreeOfPolymerization: number; referenceVolume: number;
  }) => {
    const err = validateRecyclingInput(params);
    if (err) throw new Error(err);

    const groups = params.groupIds.map((id) => {
      const g = partsRepo.getGroupById(id);
      if (!g) throw new Error(`部品グループ (ID: ${id}) が見つかりません`);
      return g;
    });

    // N×N matrix using core module (representative part per group = first part)
    const polymers = groups
      .filter((g) => g.parts[0] !== undefined)
      .map((g) => ({
        name: g.name,
        hsp: g.parts[0]!.hsp,
        degreeOfPolymerization: params.degreeOfPolymerization,
      }));

    const coreMatrix = evaluateRecyclingCompatibilityMatrix(polymers, params.referenceVolume);

    const matrix = coreMatrix.map((r) => ({
      polymer1Name: r.polymer1Name, polymer2Name: r.polymer2Name,
      ra: r.ra, chiParameter: r.chi, miscibility: r.miscibility,
    }));

    return { groupNames: groups.map((g) => g.name), matrix, evaluatedAt: new Date() };
  });

  // --- 相溶化剤選定 ---
  ipcMain.handle('compatibilizer:screen', (_, params: {
    groupId1: number; groupId2: number;
  }) => {
    const err = validateCompatibilizerInput(params);
    if (err) throw new Error(err);

    const group1 = partsRepo.getGroupById(params.groupId1);
    if (!group1) throw new Error(`部品グループ (ID: ${params.groupId1}) が見つかりません`);
    const group2 = partsRepo.getGroupById(params.groupId2);
    if (!group2) throw new Error(`部品グループ (ID: ${params.groupId2}) が見つかりません`);

    // Representative parts
    const p1 = group1.parts[0];
    const p2 = group2.parts[0];
    if (!p1) throw new Error(`グループ ${group1.name} に部品がありません`);
    if (!p2) throw new Error(`グループ ${group2.name} に部品がありません`);

    // Screen all solvents as potential compatibilizers using core module
    const solvents = solventRepo.getAllSolvents();
    const candidates = solvents.map((s) => ({
      name: s.name,
      blockA_hsp: s.hsp,
      blockB_hsp: s.hsp,
      _solventId: s.id,
    }));
    const coreResults = screenCompatibilizers(
      { hsp: p1.hsp, r0: p1.r0 },
      { hsp: p2.hsp, r0: p2.r0 },
      candidates
    );
    const results = coreResults.map((r) => {
      const solventId = candidates.find((c) => c.name === r.compatibilizer.name)?._solventId ?? 0;
      let compatibility: string;
      if (r.effectivenessScore < 3) compatibility = 'Excellent';
      else if (r.effectivenessScore < 5) compatibility = 'Good';
      else if (r.effectivenessScore < 8) compatibility = 'Fair';
      else compatibility = 'Poor';
      return {
        compatibilizerName: r.compatibilizer.name, solventId,
        raToPolymer1: r.raBlockA_Polymer1, raToPolymer2: r.raBlockB_Polymer2,
        overallScore: r.effectivenessScore, compatibility,
      };
    });

    return {
      polymer1Name: group1.name, polymer2Name: group2.name,
      results, evaluatedAt: new Date(),
    };
  });

  // --- コポリマーHSP推定 ---
  ipcMain.handle('copolymerHsp:estimate', (_, params: {
    monomers: Array<{ name: string; deltaD: number; deltaP: number; deltaH: number; fraction: number }>;
  }) => {
    const err = validateCopolymerInput(params);
    if (err) throw new Error(err);

    // Linear mixing rule via core module
    const mappedMonomers = params.monomers.map((m) => ({
      name: m.name,
      hsp: { deltaD: m.deltaD, deltaP: m.deltaP, deltaH: m.deltaH },
      fraction: m.fraction,
    }));
    const copolymerResult = estimateCopolymerHSP(mappedMonomers);

    return {
      monomers: params.monomers,
      estimatedHSP: copolymerResult.blendHSP,
      evaluatedAt: new Date(),
    };
  });

  // --- 添加剤移行予測 ---
  ipcMain.handle('additiveMigration:screen', (_, partId: number, groupId: number) => {
    const err = validateAdditiveMigrationInput({ partId, groupId });
    if (err) throw new Error(err);

    const group = partsRepo.getGroupById(groupId);
    if (!group) throw new Error(`部品グループ (ID: ${groupId}) が見つかりません`);
    const part = group.parts.find((p) => p.id === partId);
    if (!part) throw new Error(`部品 (ID: ${partId}) が見つかりません`);

    const additives = solventRepo.getAllSolvents();
    const thresholdsJson = settingsRepo.getSetting('migration_thresholds');
    const thresholds: MigrationThresholds = thresholdsJson
      ? safeJsonParse(thresholdsJson, { ...DEFAULT_MIGRATION_THRESHOLDS })
      : { ...DEFAULT_MIGRATION_THRESHOLDS };

    return screenAdditiveMigration(part, additives, thresholds);
  });

  // --- フレーバースカルピング ---
  ipcMain.handle('flavorScalping:screen', (_, partId: number, groupId: number) => {
    const err = validateFlavorScalpingInput({ partId, groupId });
    if (err) throw new Error(err);

    const group = partsRepo.getGroupById(groupId);
    if (!group) throw new Error(`部品グループ (ID: ${groupId}) が見つかりません`);
    const part = group.parts.find((p) => p.id === partId);
    if (!part) throw new Error(`部品 (ID: ${partId}) が見つかりません`);

    const aromas = solventRepo.getAllSolvents();
    const thresholdsJson = settingsRepo.getSetting('scalping_thresholds');
    const thresholds: ScalpingThresholds = thresholdsJson
      ? safeJsonParse(thresholdsJson, { ...DEFAULT_SCALPING_THRESHOLDS })
      : { ...DEFAULT_SCALPING_THRESHOLDS };

    return screenFlavorScalping(part, aromas, thresholds);
  });

  // --- 包装材溶出 ---
  ipcMain.handle('foodPackagingMigration:screen', (_, packagingHSP: HSPValues, r0: number, substanceIds: number[]) => {
    const substances = substanceIds.map((id) => {
      const s = solventRepo.getSolventById(id);
      if (!s) throw new Error(`溶出物質 (ID: ${id}) が見つかりません`);
      return { name: s.name, hsp: s.hsp };
    });
    const err = validateFoodPackagingMigrationInput(packagingHSP, r0, substances);
    if (err) throw new Error(err);

    const thresholdsJson = settingsRepo.getSetting('packaging_migration_thresholds');
    const thresholds: PackagingMigrationThresholds = thresholdsJson
      ? safeJsonParse(thresholdsJson, { ...DEFAULT_PACKAGING_MIGRATION_THRESHOLDS })
      : { ...DEFAULT_PACKAGING_MIGRATION_THRESHOLDS };

    return screenPackagingMigration(packagingHSP, r0, substances, thresholds);
  });

  // --- 香料カプセル化 ---
  ipcMain.handle('fragranceEncapsulation:screen', (_, wallHSP: HSPValues, r0: number, fragranceIds: number[]) => {
    const fragrances = fragranceIds.map((id) => {
      const s = solventRepo.getSolventById(id);
      if (!s) throw new Error(`香料 (ID: ${id}) が見つかりません`);
      return { name: s.name, hsp: s.hsp };
    });
    const err = validateFragranceEncapsulationInput(wallHSP, r0, fragrances);
    if (err) throw new Error(err);

    const thresholdsJson = settingsRepo.getSetting('encapsulation_thresholds');
    const thresholds: EncapsulationThresholds = thresholdsJson
      ? safeJsonParse(thresholdsJson, { ...DEFAULT_ENCAPSULATION_THRESHOLDS })
      : { ...DEFAULT_ENCAPSULATION_THRESHOLDS };

    return screenFragranceEncapsulation(wallHSP, r0, fragrances, thresholds);
  });

  // --- 経皮吸収促進剤 ---
  ipcMain.handle('transdermalEnhancer:screen', (_, params: {
    drugId: number; skinHSP: HSPValues;
  }) => {
    const err = validateTransdermalEnhancerInput(params);
    if (err) throw new Error(err);

    const drug = drugRepo.getById(params.drugId);
    if (!drug) throw new Error(`薬物 (ID: ${params.drugId}) が見つかりません`);

    const enhancers = solventRepo.getAllSolvents().map((s) => ({
      name: s.name, hsp: s.hsp,
    }));

    const thresholdsJson = settingsRepo.getSetting('transdermal_thresholds');
    const thresholds: TransdermalThresholds = thresholdsJson
      ? safeJsonParse(thresholdsJson, { ...DEFAULT_TRANSDERMAL_THRESHOLDS })
      : { ...DEFAULT_TRANSDERMAL_THRESHOLDS };

    return screenTransdermalEnhancers(drug.hsp, params.skinHSP, enhancers, thresholds);
  });

  // --- リポソーム透過性 ---
  ipcMain.handle('liposomePermeability:screen', (_, params: {
    drugId: number; lipidHSP: HSPValues; lipidR0: number;
  }) => {
    const err = validateLiposomePermeabilityInput(params);
    if (err) throw new Error(err);

    const drug = drugRepo.getById(params.drugId);
    if (!drug) throw new Error(`薬物 (ID: ${params.drugId}) が見つかりません`);

    const drugs = [{ name: drug.name, hsp: drug.hsp }];

    const thresholdsJson = settingsRepo.getSetting('permeability_thresholds');
    const thresholds: PermeabilityThresholds = thresholdsJson
      ? safeJsonParse(thresholdsJson, { ...DEFAULT_PERMEABILITY_THRESHOLDS })
      : { ...DEFAULT_PERMEABILITY_THRESHOLDS };

    return screenDrugPermeability(drugs, params.lipidHSP, params.lipidR0, thresholds);
  });

  // ─── Work-of-Adhesion群 ─────────────────────────────────

  /** 密着強度閾値のデフォルト値 */
  const DEFAULT_ADHESION_STRENGTH_THRESHOLDS: AdhesionStrengthThresholds = {
    excellentMin: 80,
    goodMin: 60,
    fairMin: 40,
  };

  /** Wa値から密着強度レベルを分類 */
  function classifyAdhesionStrength(wa: number, t: AdhesionStrengthThresholds): AdhesionStrengthLevel {
    if (wa >= t.excellentMin) return ASL.Excellent;
    if (wa >= t.goodMin) return ASL.Good;
    if (wa >= t.fairMin) return ASL.Fair;
    return ASL.Poor;
  }

  /** Wa値から剥離強度レベルを分類 */
  function classifyPeelStrength(wa: number): PeelStrengthLevel {
    // PSA特有: Wa→推定剥離力変換後にレベル分類
    const peelForce = wa * 0.15; // 簡易変換: N/25mm ≈ Wa * 0.15
    if (peelForce >= 15) return PSL.Strong;
    if (peelForce >= 8) return PSL.Medium;
    if (peelForce >= 3) return PSL.Weak;
    return PSL.VeryWeak;
  }

  /** 閾値取得ヘルパー */
  function getAdhesionStrengthThresholds(): AdhesionStrengthThresholds {
    const json = settingsRepo.getSetting('adhesion_strength_thresholds');
    return json
      ? safeJsonParse(json, { ...DEFAULT_ADHESION_STRENGTH_THRESHOLDS })
      : { ...DEFAULT_ADHESION_STRENGTH_THRESHOLDS };
  }

  // --- 密着強度閾値設定 ---
  ipcMain.handle('settings:getAdhesionStrengthThresholds', () => getAdhesionStrengthThresholds());
  ipcMain.handle('settings:setAdhesionStrengthThresholds', (_, thresholds) => {
    const err = validateAdhesionStrengthThresholds(thresholds);
    if (err) throw new Error(err);
    settingsRepo.setSetting('adhesion_strength_thresholds', JSON.stringify(thresholds));
  });

  // --- インク-基材密着 ---
  ipcMain.handle('inkSubstrateAdhesion:evaluate', (_, params: {
    inkHSP: HSPValues; substrateHSP: HSPValues;
  }) => {
    const err = validateInkSubstrateAdhesionInput(params);
    if (err) throw new Error(err);

    const wa = calculateWorkOfAdhesionFromHSP(params.inkHSP, params.substrateHSP);
    const ra = calculateRa(params.inkHSP, params.substrateHSP);
    const thresholds = getAdhesionStrengthThresholds();
    const level = classifyAdhesionStrength(wa, thresholds);

    return {
      inkHSP: params.inkHSP,
      substrateHSP: params.substrateHSP,
      wa, ra, level,
      evaluatedAt: new Date(),
    };
  });

  // --- 多層コーティング密着 ---
  ipcMain.handle('multilayerCoatingAdhesion:evaluate', (_, params: {
    layers: Array<{ name: string; hsp: HSPValues }>;
  }) => {
    const err = validateMultilayerCoatingInput(params);
    if (err) throw new Error(err);

    const thresholds = getAdhesionStrengthThresholds();
    const interfaces: Array<{
      layer1Name: string; layer2Name: string;
      layer1HSP: HSPValues; layer2HSP: HSPValues;
      wa: number; ra: number; level: AdhesionStrengthLevel;
    }> = [];

    let weakestIndex = 0;
    let minWa = Infinity;

    for (let i = 0; i < params.layers.length - 1; i++) {
      const l1 = params.layers[i];
      const l2 = params.layers[i + 1];
      const wa = calculateWorkOfAdhesionFromHSP(l1.hsp, l2.hsp);
      const ra = calculateRa(l1.hsp, l2.hsp);
      const level = classifyAdhesionStrength(wa, thresholds);
      interfaces.push({
        layer1Name: l1.name, layer2Name: l2.name,
        layer1HSP: l1.hsp, layer2HSP: l2.hsp,
        wa, ra, level,
      });
      if (wa < minWa) {
        minWa = wa;
        weakestIndex = i;
      }
    }

    return { interfaces, weakestIndex, evaluatedAt: new Date() };
  });

  // --- PSA剥離強度 ---
  ipcMain.handle('psaPeelStrength:evaluate', (_, params: {
    psaHSP: HSPValues; adherendHSP: HSPValues;
  }) => {
    const err = validatePSAPeelStrengthInput(params);
    if (err) throw new Error(err);

    const wa = calculateWorkOfAdhesionFromHSP(params.psaHSP, params.adherendHSP);
    const ra = calculateRa(params.psaHSP, params.adherendHSP);
    const estimatedPeelForce = wa * 0.15; // N/25mm
    const peelLevel = classifyPeelStrength(wa);

    return {
      psaHSP: params.psaHSP, adherendHSP: params.adherendHSP,
      wa, ra, estimatedPeelForce, peelLevel,
      evaluatedAt: new Date(),
    };
  });

  // --- 構造接着設計 ---
  ipcMain.handle('structuralAdhesiveJoint:evaluate', (_, params: {
    adhesiveHSP: HSPValues; adherend1HSP: HSPValues; adherend2HSP: HSPValues;
  }) => {
    const err = validateStructuralAdhesiveJointInput(params);
    if (err) throw new Error(err);

    const thresholds = getAdhesionStrengthThresholds();
    const wa1 = calculateWorkOfAdhesionFromHSP(params.adhesiveHSP, params.adherend1HSP);
    const wa2 = calculateWorkOfAdhesionFromHSP(params.adhesiveHSP, params.adherend2HSP);
    const ra1 = calculateRa(params.adhesiveHSP, params.adherend1HSP);
    const ra2 = calculateRa(params.adhesiveHSP, params.adherend2HSP);
    const level1 = classifyAdhesionStrength(wa1, thresholds);
    const level2 = classifyAdhesionStrength(wa2, thresholds);
    const bottleneckSide: 1 | 2 = wa1 <= wa2 ? 1 : 2;

    return {
      adhesiveHSP: params.adhesiveHSP,
      adherend1HSP: params.adherend1HSP,
      adherend2HSP: params.adherend2HSP,
      wa1, wa2, ra1, ra2, level1, level2, bottleneckSide,
      evaluatedAt: new Date(),
    };
  });

  // --- 表面処理効果 ---
  ipcMain.handle('surfaceTreatmentQuantification:evaluate', (_, params: {
    beforeHSP: HSPValues; afterHSP: HSPValues; targetHSP: HSPValues;
  }) => {
    const err = validateSurfaceTreatmentInput(params);
    if (err) throw new Error(err);

    const thresholds = getAdhesionStrengthThresholds();
    const waBefore = calculateWorkOfAdhesionFromHSP(params.beforeHSP, params.targetHSP);
    const waAfter = calculateWorkOfAdhesionFromHSP(params.afterHSP, params.targetHSP);
    const raBefore = calculateRa(params.beforeHSP, params.targetHSP);
    const raAfter = calculateRa(params.afterHSP, params.targetHSP);
    const improvementRatio = waBefore > 0 ? ((waAfter - waBefore) / waBefore) * 100 : 0;
    const levelBefore = classifyAdhesionStrength(waBefore, thresholds);
    const levelAfter = classifyAdhesionStrength(waAfter, thresholds);

    return {
      beforeHSP: params.beforeHSP, afterHSP: params.afterHSP, targetHSP: params.targetHSP,
      waBefore, waAfter, raBefore, raAfter, improvementRatio,
      levelBefore, levelAfter,
      evaluatedAt: new Date(),
    };
  });

  // ─── ナノ材料分散群 ─────────────────────────────────

  // --- 顔料分散安定性 ---
  ipcMain.handle('pigmentDispersion:screen', (_, pigmentHSP: HSPValues, r0: number, vehicleIds: number[]) => {
    const vehicles = vehicleIds.map((id) => {
      const s = solventRepo.getSolventById(id);
      if (!s) throw new Error(`ビヒクル (ID: ${id}) が見つかりません`);
      return { name: s.name, hsp: s.hsp };
    });
    const err = validatePigmentDispersionInput(pigmentHSP, r0, vehicles);
    if (err) throw new Error(err);
    return screenPigmentDispersion(pigmentHSP, r0, vehicles);
  });

  // --- CNT/グラフェン分散 ---
  ipcMain.handle('cntGrapheneDispersion:screen', (_, nanomaterialHSP: HSPValues, r0: number, solventIds: number[]) => {
    const solvents = solventIds.map((id) => {
      const s = solventRepo.getSolventById(id);
      if (!s) throw new Error(`溶媒 (ID: ${id}) が見つかりません`);
      return { name: s.name, hsp: s.hsp };
    });
    const err = validateCNTGrapheneInput(nanomaterialHSP, r0, solvents);
    if (err) throw new Error(err);
    return screenCNTGrapheneDispersion(nanomaterialHSP, r0, solvents);
  });

  // --- MXene分散 ---
  ipcMain.handle('mxeneDispersion:screen', (_, mxeneHSP: HSPValues, r0: number, solventIds: number[]) => {
    const solvents = solventIds.map((id) => {
      const s = solventRepo.getSolventById(id);
      if (!s) throw new Error(`溶媒 (ID: ${id}) が見つかりません`);
      return { name: s.name, hsp: s.hsp };
    });
    const err = validateMXeneDispersionInput(mxeneHSP, r0, solvents);
    if (err) throw new Error(err);
    return screenMXeneDispersion(mxeneHSP, r0, solvents);
  });

  // --- ナノ粒子薬物ローディング ---
  ipcMain.handle('nanoparticleDrugLoading:screen', (_, carrierHSP: HSPValues, carrierR0: number, drugIds: number[]) => {
    const drugs = drugIds.map((id) => {
      const s = solventRepo.getSolventById(id);
      if (!s) throw new Error(`薬物 (ID: ${id}) が見つかりません`);
      return { name: s.name, hsp: s.hsp };
    });
    const err = validateDrugLoadingInput(carrierHSP, carrierR0, drugs);
    if (err) throw new Error(err);
    return screenDrugLoading(carrierHSP, carrierR0, drugs);
  });

  // ─── Gas-Solubility群 ─────────────────────────────────

  // --- ガス透過性 ---
  ipcMain.handle('gasPermeability:screen', (_, params: {
    polymerHSP: HSPValues; gasNames: string[]; referenceGas?: string;
  }) => {
    const err = validateGasPermeabilityInput(params);
    if (err) throw new Error(err);
    return screenMembranePermeability(params.polymerHSP, params.gasNames, params.referenceGas);
  });

  // --- 膜分離選択性 ---
  ipcMain.handle('membraneSeparation:evaluate', (_, params: {
    membraneHSP: HSPValues; targetHSP: HSPValues; targetName: string;
    impurityHSP: HSPValues; impurityName: string;
  }) => {
    const err = validateMembraneSeparationInput(params);
    if (err) throw new Error(err);
    return evaluateSeparationSelectivity(
      params.membraneHSP, params.targetHSP, params.targetName,
      params.impurityHSP, params.impurityName,
    );
  });

  // --- CO2吸収材選定 ---
  ipcMain.handle('co2Absorbent:screen', (_, params: {
    absorbents: Array<{ name: string; hsp: HSPValues; r0: number }>;
  }) => {
    const err = validateCO2AbsorbentInput(params);
    if (err) throw new Error(err);
    return screenCO2Absorbents(params.absorbents);
  });

  // --- 水素貯蔵材料 ---
  ipcMain.handle('hydrogenStorage:screen', (_, params: {
    carrierHSP: HSPValues; r0: number; solventIds: number[];
  }) => {
    const err = validateHydrogenStorageInput(params);
    if (err) throw new Error(err);
    const solvents = params.solventIds.map((id) => {
      const s = solventRepo.getSolventById(id);
      if (!s) throw new Error(`溶媒 (ID: ${id}) が見つかりません`);
      return { name: s.name, hsp: s.hsp };
    });
    return screenHydrogenStorageMaterials(params.carrierHSP, params.r0, solvents);
  });

  // ─── 抽出・洗浄群 ─────────────────────────────────

  // --- 洗浄剤配合設計 ---
  ipcMain.handle('cleaningFormulation:screen', (_, soilHSP: HSPValues, r0: number, solventIds: number[]) => {
    const solvents = solventIds.map((id) => {
      const s = solventRepo.getSolventById(id);
      if (!s) throw new Error(`溶媒 (ID: ${id}) が見つかりません`);
      return { name: s.name, hsp: s.hsp };
    });
    const err = validateCleaningFormulationInput(soilHSP, r0, solvents);
    if (err) throw new Error(err);
    return screenCleaningSolvents(soilHSP, r0, solvents);
  });

  // --- 天然色素抽出 ---
  ipcMain.handle('naturalDyeExtraction:screen', (_, dyeHSP: HSPValues, r0: number, solventIds: number[]) => {
    const solvents = solventIds.map((id) => {
      const s = solventRepo.getSolventById(id);
      if (!s) throw new Error(`溶媒 (ID: ${id}) が見つかりません`);
      return { name: s.name, hsp: s.hsp };
    });
    const err = validateNaturalDyeExtractionInput(dyeHSP, r0, solvents);
    if (err) throw new Error(err);
    return screenDyeExtractionSolvents(dyeHSP, r0, solvents);
  });

  // --- 精油抽出 ---
  ipcMain.handle('essentialOilExtraction:screen', (_, oilHSP: HSPValues, r0: number, solventIds: number[]) => {
    const solvents = solventIds.map((id) => {
      const s = solventRepo.getSolventById(id);
      if (!s) throw new Error(`溶媒 (ID: ${id}) が見つかりません`);
      return { name: s.name, hsp: s.hsp };
    });
    const err = validateEssentialOilExtractionInput(oilHSP, r0, solvents);
    if (err) throw new Error(err);
    return screenEssentialOilSolvents(oilHSP, r0, solvents);
  });

  // --- 土壌汚染物質抽出 ---
  ipcMain.handle('soilRemediation:screen', (_, contaminantHSP: HSPValues, r0: number, solventIds: number[]) => {
    const solvents = solventIds.map((id) => {
      const s = solventRepo.getSolventById(id);
      if (!s) throw new Error(`溶媒 (ID: ${id}) が見つかりません`);
      return { name: s.name, hsp: s.hsp };
    });
    const err = validateSoilRemediationInput(contaminantHSP, r0, solvents);
    if (err) throw new Error(err);
    return screenRemediationSolvents(contaminantHSP, r0, solvents);
  });

  // --- 残留溶媒予測 ---
  ipcMain.handle('residualSolvent:screen', (_, filmHSP: HSPValues, r0: number, solventIds: number[]) => {
    const solvents = solventIds.map((id) => {
      const s = solventRepo.getSolventById(id);
      if (!s) throw new Error(`溶媒 (ID: ${id}) が見つかりません`);
      return { name: s.name, hsp: s.hsp };
    });
    const err = validateResidualSolventInput(filmHSP, r0, solvents);
    if (err) throw new Error(err);
    return predictResidualSolvent(filmHSP, r0, solvents);
  });

  // ─── 医薬品・化粧品群 ─────────────────────────────────

  // --- UVフィルター適合性 ---
  ipcMain.handle('sunscreenUVFilter:screen', (_, vehicleHSP: HSPValues, r0: number, uvFilterIds: number[]) => {
    const uvFilters = uvFilterIds.map((id) => {
      const s = solventRepo.getSolventById(id);
      if (!s) throw new Error(`UVフィルター (ID: ${id}) が見つかりません`);
      return { name: s.name, hsp: s.hsp };
    });
    const err = validateSunscreenUVFilterInput(vehicleHSP, r0, uvFilters);
    if (err) throw new Error(err);
    return screenUVFilterCompatibility(vehicleHSP, r0, uvFilters);
  });

  // --- 吸入薬プロペラント適合性 ---
  ipcMain.handle('inhalationDrug:evaluate', (_, params: {
    drugHSP: HSPValues; propellantHSP: HSPValues; propellantR0: number;
  }) => {
    const err = validateInhalationDrugInput(params);
    if (err) throw new Error(err);
    return evaluateInhalationCompatibility(params.drugHSP, params.propellantHSP, params.propellantR0);
  });

  // --- タンパク質凝集リスク ---
  ipcMain.handle('proteinAggregation:evaluate', (_, params: {
    proteinSurfaceHSP: HSPValues; bufferHSP: HSPValues; bufferR0: number;
  }) => {
    const err = validateProteinAggregationInput(params);
    if (err) throw new Error(err);
    return evaluateProteinAggregationRisk(params.proteinSurfaceHSP, params.bufferHSP, params.bufferR0);
  });

  // --- バイオ製剤バッファー選定 ---
  ipcMain.handle('biologicBuffer:screen', (_, proteinHSP: HSPValues, r0: number, bufferIds: number[], temperature?: number) => {
    const buffers = bufferIds.map((id) => {
      const s = solventRepo.getSolventById(id);
      if (!s) throw new Error(`バッファー (ID: ${id}) が見つかりません`);
      return { name: s.name, hsp: s.hsp };
    });
    const err = validateBiologicBufferInput(proteinHSP, r0, buffers);
    if (err) throw new Error(err);
    return screenBiologicBuffers(proteinHSP, r0, buffers, temperature);
  });

  // --- 温度HSP補正 ---
  ipcMain.handle('temperatureHspCorrection:evaluate', (_, params: {
    hsp: HSPValues;
    temperature: number;
    referenceTemp?: number;
    alpha: number;
    solventName?: string;
  }) => {
    const err = validateTemperatureHSPCorrectionInput(params);
    if (err) throw new Error(err);
    const refTemp = params.referenceTemp ?? 25;
    const corrected = correctHSPForTemperature(params.hsp, params.temperature, refTemp, params.alpha);
    // 会合性液体のdH補正統合
    let associatingCorrectionApplied = false;
    if (params.solventName && isAssociatingLiquid(params.solventName)) {
      const tempK = params.temperature + 273.15;
      const refK = refTemp + 273.15;
      corrected.deltaH = correctDeltaHAssociating(params.hsp.deltaH, tempK, refK, params.solventName);
      associatingCorrectionApplied = true;
    }
    return {
      original: params.hsp,
      corrected,
      temperature: params.temperature,
      referenceTemp: refTemp,
      alpha: params.alpha,
      solventName: params.solventName,
      associatingCorrectionApplied,
      evaluatedAt: new Date(),
    };
  });

  // --- 圧力HSP補正 ---
  ipcMain.handle('pressureHspCorrection:evaluate', (_, params: {
    hsp: HSPValues;
    pressureRef?: number;
    pressureTarget: number;
    temperature: number;
    isothermalCompressibility?: number;
  }) => {
    const err = validatePressureHSPCorrectionInput(params);
    if (err) throw new Error(err);
    const pressureRef = params.pressureRef ?? 0.1;
    const beta = params.isothermalCompressibility ?? 1e-3;
    const corrected = correctHSPForPressure(params.hsp, pressureRef, params.pressureTarget, params.temperature, beta);
    return {
      original: params.hsp,
      corrected,
      pressureRef,
      pressureTarget: params.pressureTarget,
      temperature: params.temperature,
      isothermalCompressibility: beta,
      evaluatedAt: new Date(),
    };
  });

  // --- 超臨界CO2共溶媒選定 ---
  ipcMain.handle('supercriticalCO2:screen', (_, params: {
    targetHSP: HSPValues;
    targetR0: number;
    pressure: number;
    temperature: number;
    cosolvents: Array<{ name: string; hsp: HSPValues }>;
    fractions?: number[];
  }) => {
    const err = validateSCCO2CosolventInput(params);
    if (err) throw new Error(err);
    return screenSCCO2Cosolvents(
      params.targetHSP,
      params.targetR0,
      params.pressure,
      params.temperature,
      params.cosolvents,
      params.fractions,
    );
  });

  // ─── dissolution-contrast群 ─────────────────────────────────

  // --- コーティング欠陥予測 ---
  ipcMain.handle('coatingDefect:predict', (_, params: {
    coatingHSP: HSPValues; substrateHSP: HSPValues; solventHSP: HSPValues;
  }) => {
    const err = validateCoatingDefectInput(params);
    if (err) throw new Error(err);
    return predictCoatingDefects(params.coatingHSP, params.substrateHSP, params.solventHSP);
  });

  // --- フォトレジスト現像液適合性 ---
  ipcMain.handle('photoresistDeveloper:evaluate', (_, params: {
    unexposedHSP: HSPValues; exposedHSP: HSPValues; developerHSP: HSPValues;
  }) => {
    const err = validatePhotoresistDeveloperInput(params);
    if (err) throw new Error(err);
    return evaluatePhotoresistDeveloper(params.unexposedHSP, params.exposedHSP, params.developerHSP);
  });

  // --- ペロブスカイト溶媒設計 ---
  ipcMain.handle('perovskiteSolvent:screen', (_, precursorHSP: HSPValues, r0: number, solventIds: number[]) => {
    const solvents = solventIds.map((id) => {
      const s = solventRepo.getSolventById(id);
      if (!s) throw new Error(`溶媒 (ID: ${id}) が見つかりません`);
      return { name: s.name, hsp: s.hsp };
    });
    const err = validatePerovskiteSolventInput(precursorHSP, r0, solvents);
    if (err) throw new Error(err);
    return screenPerovskiteSolvents(precursorHSP, r0, solvents);
  });

  // --- 有機半導体薄膜形成 ---
  ipcMain.handle('organicSemiconductorFilm:screen', (_, oscHSP: HSPValues, r0: number, solventIds: number[]) => {
    const solvents = solventIds.map((id) => {
      const s = solventRepo.getSolventById(id);
      if (!s) throw new Error(`溶媒 (ID: ${id}) が見つかりません`);
      return { name: s.name, hsp: s.hsp, boilingPoint: s.boilingPoint };
    });
    const err = validateOrganicSemiconductorFilmInput(oscHSP, r0, solvents);
    if (err) throw new Error(err);
    return screenOSCSolvents(oscHSP, r0, solvents);
  });

  // --- UV硬化インクモノマー選定 ---
  ipcMain.handle('uvCurableInk:screen', (_, oligomerHSP: HSPValues, r0: number, monomerIds: number[]) => {
    const monomers = monomerIds.map((id) => {
      const s = solventRepo.getSolventById(id);
      if (!s) throw new Error(`モノマー (ID: ${id}) が見つかりません`);
      return { name: s.name, hsp: s.hsp };
    });
    const err = validateUVCurableInkMonomerInput(oligomerHSP, r0, monomers);
    if (err) throw new Error(err);
    return screenUVInkMonomers(oligomerHSP, r0, monomers);
  });

  // --- 結晶性ポリマー溶解温度 ---
  ipcMain.handle('crystallineDissolution:evaluate', (_, polymerHSP: HSPValues, solventHSP: HSPValues, params: CrystallinePolymerParams) => {
    return calculatePolymerDissolutionTemp(polymerHSP, solventHSP, params);
  });

  // --- ハイドロゲル膨潤平衡 ---
  ipcMain.handle('hydrogelSwelling:evaluate', (_, gelHSP: HSPValues, solventHSP: HSPValues, crosslinkDensity: number, vs: number) => {
    return calculateHydrogelSwelling(gelHSP, solventHSP, crosslinkDensity, vs);
  });

  // --- ゴム配合設計 ---
  ipcMain.handle('rubberCompounding:evaluate', (_, rubberHSP: HSPValues, filler: FillerInfo, crosslinkDensity: number, solventIds: number[]) => {
    const solvents: SwellingSolventInfo[] = solventIds.map((id) => {
      const s = solventRepo.getSolventById(id);
      if (!s) throw new Error(`溶媒 (ID: ${id}) が見つかりません`);
      if (!s.molarVolume) throw new Error(`溶媒 ${s.name} のモル体積が未設定です`);
      return { name: s.name, hsp: s.hsp, molarVolume: s.molarVolume };
    });
    return evaluateRubberCompound(rubberHSP, filler, crosslinkDensity, solvents);
  });

  // --- 熱硬化性樹脂硬化剤選定 ---
  ipcMain.handle('thermosetCuring:screen', (_, resinHSP: HSPValues, resinR0: number, agents: CuringAgent[]) => {
    return screenCuringAgents(resinHSP, resinR0, agents);
  });

  // --- 繊維染色性予測 ---
  ipcMain.handle('fiberDyeability:screen', (_, fiberHSP: HSPValues, fiberR0: number, dyes: Dye[]) => {
    return screenDyeability(fiberHSP, fiberR0, dyes);
  });

  // ─── Phase 11: 高度最適化群 ─────────────────────────────────

  // --- 多成分溶媒最適化 ---
  ipcMain.handle('multicomponentOptimization:optimize', (_, targetHSP: HSPValues, solventIds: number[], numComponents: number) => {
    const err = validateMultiComponentOptimizationInput(targetHSP, solventIds, numComponents);
    if (err) throw new Error(err);
    const candidates: SolventCandidate[] = solventIds.map((id) => {
      const s = solventRepo.getSolventById(id);
      if (!s) throw new Error(`溶媒 (ID: ${id}) が見つかりません`);
      return { id: s.id, name: s.name, hsp: s.hsp, molarVolume: s.molarVolume ?? 100 };
    });
    return optimizeMultiComponentBlend({ targetHSP, candidates, numComponents });
  });

  // --- LiB電解液設計 ---
  ipcMain.handle('liBatteryElectrolyte:screen', (_, saltHSP: HSPValues, r0: number, solventIds: number[]) => {
    const solvents = solventIds.map((id) => {
      const s = solventRepo.getSolventById(id);
      if (!s) throw new Error(`溶媒 (ID: ${id}) が見つかりません`);
      return { name: s.name, hsp: s.hsp };
    });
    const err = validateLiBatteryElectrolyteInput(saltHSP, r0, solvents);
    if (err) throw new Error(err);
    return screenElectrolyteSolvents(saltHSP, r0, solvents);
  });

  // --- 溶媒代替設計 ---
  ipcMain.handle('solventSubstitution:screen', (_, bannedHSP: HSPValues, solventIds: number[]) => {
    const candidates = solventIds.map((id) => {
      const s = solventRepo.getSolventById(id);
      if (!s) throw new Error(`溶媒 (ID: ${id}) が見つかりません`);
      return { name: s.name, hsp: s.hsp, casNumber: s.casNumber };
    });
    const err = validateSolventSubstitutionInput(bannedHSP, candidates);
    if (err) throw new Error(err);
    return findSolventSubstitutes(bannedHSP, candidates);
  });

  // --- 化粧品エマルション安定性 ---
  ipcMain.handle('cosmeticEmulsion:evaluate', (_, params: { oilHSP: HSPValues; emulsifierHSP: HSPValues; waterHSP: HSPValues }) => {
    const err = validateCosmeticEmulsionInput(params);
    if (err) throw new Error(err);
    return evaluateEmulsionStability(params.oilHSP, params.emulsifierHSP, params.waterHSP);
  });

  // ─── Phase 15: ML・計算科学+残り機能群 ─────────────────────────────────

  // --- ML HSP予測(QSPR) ---
  ipcMain.handle('mlHspPrediction:estimate', (_, descriptors: MolecularDescriptors) => {
    const err = validateMLHSPPredictionInput(descriptors);
    if (err) throw new Error(err);
    return estimateHSPFromDescriptors(descriptors);
  });

  // --- MD HSPインポート ---
  ipcMain.handle('mdHspImport:import', (_, ced: CEDComponents, molarVolume: number) => {
    const err = validateMDHSPImportInput({ ...ced, molarVolume });
    if (err) throw new Error(err);
    return importMDResults(ced, molarVolume);
  });

  // --- 族寄与法(拡張) ---
  ipcMain.handle('groupContributionUpdates:getFirstOrderGroups', () => {
    return getAvailableFirstOrderGroupsExtended();
  });

  ipcMain.handle('groupContributionUpdates:getSecondOrderGroups', () => {
    return getAvailableSecondOrderGroupsExtended();
  });

  ipcMain.handle('groupContributionUpdates:estimate', (_, input: { firstOrderGroups: { groupId: string; count: number }[]; secondOrderGroups?: { groupId: string; count: number }[] }) => {
    const err = validateGroupContributionInput(input);
    if (err) throw new Error(err);
    return estimateHSPExtended(input);
  });

  // --- 多形/溶媒和物リスク評価 ---
  ipcMain.handle('polymorphRisk:evaluate', (_, apiHSP: HSPValues, r0: number, solventIds: number[]) => {
    const solvents = solventIds.map((id) => {
      const s = solventRepo.getSolventById(id);
      if (!s) throw new Error(`溶媒 (ID: ${id}) が見つかりません`);
      return { name: s.name, hsp: s.hsp };
    });
    const err = validatePolymorphRiskInput(apiHSP, r0, solvents);
    if (err) throw new Error(err);
    return evaluatePolymorphRisk(apiHSP, r0, solvents);
  });

  // --- 防落書きコーティング設計 ---
  ipcMain.handle('antiGraffitiCoating:screen', (_, coatingHSP: HSPValues, r0: number, materials: Array<{ name: string; hsp: HSPValues }>) => {
    const err = validateAntiGraffitiInput(coatingHSP, r0, materials);
    if (err) throw new Error(err);
    return screenAntiGraffitiCoatings(coatingHSP, r0, materials);
  });

  // --- プライマーレス接着設計 ---
  ipcMain.handle('primerlessAdhesion:optimize', (_, params: { adhesiveHSP: HSPValues; substrateHSP: HSPValues }) => {
    const err = validatePrimerlessAdhesionInput(params);
    if (err) throw new Error(err);
    return optimizePrimerlessAdhesion(params.adhesiveHSP, params.substrateHSP);
  });

  // ─── Phase 13+14: 先端デバイス群 + HSP逆問題群 ─────────────────────────────────

  // --- 印刷電子濡れ性 ---
  ipcMain.handle('printedElectronics:evaluate', (_, params: { inkHSP: HSPValues; substrateHSP: HSPValues }) => {
    const err = validatePrintedElectronicsWettingInput(params);
    if (err) throw new Error(err);
    return evaluatePrintedElectronicsWetting(params.inkHSP, params.substrateHSP);
  });

  // --- QDリガンド交換溶媒スクリーニング ---
  ipcMain.handle('quantumDotLigand:screen', (_, qdHSP: HSPValues, qdR0: number, solventIds: number[]) => {
    const solvents = solventIds.map((id) => {
      const s = solventRepo.getSolventById(id);
      if (!s) throw new Error(`溶媒 (ID: ${id}) が見つかりません`);
      return { name: s.name, hsp: s.hsp };
    });
    const err = validateQDLigandExchangeInput(qdHSP, qdR0, solvents);
    if (err) throw new Error(err);
    return screenQDLigandExchangeSolvents(qdHSP, qdR0, solvents);
  });

  // --- アンダーフィル/封止材適合性 ---
  ipcMain.handle('underfillEncapsulant:evaluate', (_, params: { encapsulantHSP: HSPValues; chipSurfaceHSP: HSPValues; substrateHSP: HSPValues }) => {
    const err = validateUnderfillEncapsulantInput(params);
    if (err) throw new Error(err);
    return evaluateUnderfillCompatibility(params.encapsulantHSP, params.chipSurfaceHSP, params.substrateHSP);
  });

  // --- バイオ燃料材料適合性 ---
  ipcMain.handle('biofuelCompatibility:screen', (_, fuelHSP: HSPValues, fuelR0: number, materialIds: number[]) => {
    const materials = materialIds.map((id) => {
      const s = solventRepo.getSolventById(id);
      if (!s) throw new Error(`材料 (ID: ${id}) が見つかりません`);
      return { name: s.name, hsp: s.hsp };
    });
    const err = validateBiofuelCompatibilityInput(fuelHSP, fuelR0, materials);
    if (err) throw new Error(err);
    return screenBiofuelCompatibility(fuelHSP, fuelR0, materials);
  });

  // --- PCMカプセル化 ---
  ipcMain.handle('pcmEncapsulation:screen', (_, pcmHSP: HSPValues, pcmR0: number, shellMaterialIds: number[]) => {
    const shellMaterials = shellMaterialIds.map((id) => {
      const s = solventRepo.getSolventById(id);
      if (!s) throw new Error(`シェル材 (ID: ${id}) が見つかりません`);
      return { name: s.name, hsp: s.hsp };
    });
    const err = validatePCMEncapsulationInput(pcmHSP, pcmR0, shellMaterials);
    if (err) throw new Error(err);
    return screenPCMEncapsulation(pcmHSP, pcmR0, shellMaterials);
  });

  // --- HSP不確かさ定量化 ---
  ipcMain.handle('hspUncertainty:bootstrap', (_, params: { classifications: Array<{ solventId: number; isGood: boolean }>; numSamples?: number }) => {
    const err = validateHSPUncertaintyInput(params);
    if (err) throw new Error(err);
    const classifications = params.classifications.map((c) => {
      const s = solventRepo.getSolventById(c.solventId);
      if (!s) throw new Error(`溶媒 (ID: ${c.solventId}) が見つかりません`);
      return { solvent: { hsp: s.hsp, name: s.name }, isGood: c.isGood };
    });
    return bootstrapHSPUncertainty(classifications, params.numSamples ?? 100);
  });

  // --- 表面HSP決定 ---
  ipcMain.handle('surfaceHspDetermination:estimate', (_, params: { testData: ContactAngleTestInput[] }) => {
    const err = validateSurfaceHSPDeterminationInput(params);
    if (err) throw new Error(err);
    return estimateSurfaceHSPFromContactAngles(params.testData);
  });

  // --- IL/DES HSP推定 ---
  ipcMain.handle('ionicLiquidHsp:estimate', (_, params: {
    cationHSP: HSPValues; anionHSP: HSPValues;
    ratio?: [number, number]; temperature?: number; referenceTemp?: number;
  }) => {
    const err = validateIonicLiquidHSPInput(params);
    if (err) throw new Error(err);
    return estimateILHSP(params.cationHSP, params.anionHSP, params.ratio, params.temperature, params.referenceTemp);
  });
}
