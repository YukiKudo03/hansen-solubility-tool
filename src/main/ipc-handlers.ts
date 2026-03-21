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
import { validatePartInput, validateSolventInput, validateName, validateThresholds, validateMixtureInput, validateNanoParticleInput, validateDispersibilityThresholds, validateWettabilityThresholds, validateBlendOptimizationInput, validateSwellingThresholds, validateDrugInput, validateDrugSolubilityThresholds, validateChemicalResistanceThresholds, validatePlasticizerThresholds, validateCarrierThresholds, validateAdhesionThresholds, validateSolventClassifications, validateGreenSolventInput, validateMultiObjectiveInput, validateGroupContributionInput, validateDispersantInput, validateDispersantThresholds, validateESCInput, validateCocrystalInput, validatePrinting3dInput, validateDielectricInput, validateExcipientInput, validatePolymerBlendInput, validateRecyclingInput, validateCompatibilizerInput, validateCopolymerInput, validateAdditiveMigrationInput, validateFlavorScalpingInput, validateFoodPackagingMigrationInput, validateFragranceEncapsulationInput, validateTransdermalEnhancerInput, validateLiposomePermeabilityInput } from '../core/validation';
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
import type { HSPValues } from '../core/types';

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

    if (solvents.length === 0) throw new Error('溶媒が登録されていません');
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
  ipcMain.handle('esc:screen', (_, polymerHSP: HSPValues, r0: number, solventIds: number[]) => {
    const solvents = solventIds.map((id) => {
      const s = solventRepo.getSolventById(id);
      if (!s) throw new Error(`溶媒 (ID: ${id}) が見つかりません`);
      return { name: s.name, hsp: s.hsp };
    });
    const err = validateESCInput(polymerHSP, r0, solvents);
    if (err) throw new Error(err);
    return screenESCRisk(polymerHSP, r0, solvents);
  });

  // --- 共結晶スクリーニング ---
  ipcMain.handle('cocrystal:screen', (_, apiHSP: HSPValues, r0: number, coformerIds: number[]) => {
    const coformers = coformerIds.map((id) => {
      const s = solventRepo.getSolventById(id);
      if (!s) throw new Error(`コフォーマー (ID: ${id}) が見つかりません`);
      return { name: s.name, hsp: s.hsp };
    });
    const err = validateCocrystalInput(apiHSP, r0, coformers);
    if (err) throw new Error(err);
    return screenCocrystals(apiHSP, r0, coformers);
  });

  // --- 3Dプリント溶剤平滑化 ---
  ipcMain.handle('printing3d:screen', (_, filamentHSP: HSPValues, r0: number, solventIds: number[]) => {
    const solvents = solventIds.map((id) => {
      const s = solventRepo.getSolventById(id);
      if (!s) throw new Error(`溶媒 (ID: ${id}) が見つかりません`);
      return { name: s.name, hsp: s.hsp };
    });
    const err = validatePrinting3dInput(filamentHSP, r0, solvents);
    if (err) throw new Error(err);
    return screen3DPrintingSolvents(filamentHSP, r0, solvents);
  });

  // --- 誘電体薄膜品質 ---
  ipcMain.handle('dielectric:screen', (_, polymerHSP: HSPValues, r0: number, solventIds: number[]) => {
    const solvents = solventIds.map((id) => {
      const s = solventRepo.getSolventById(id);
      if (!s) throw new Error(`溶媒 (ID: ${id}) が見つかりません`);
      return { name: s.name, hsp: s.hsp, boilingPoint: s.boilingPoint ?? undefined };
    });
    const err = validateDielectricInput(polymerHSP, r0, solvents);
    if (err) throw new Error(err);
    return screenDielectricSolvents(polymerHSP, r0, solvents);
  });

  // --- 賦形剤適合性 ---
  ipcMain.handle('excipient:evaluate', (_, apiHSP: HSPValues, r0: number, excipientIds: number[]) => {
    const excipients = excipientIds.map((id) => {
      const s = solventRepo.getSolventById(id);
      if (!s) throw new Error(`賦形剤 (ID: ${id}) が見つかりません`);
      return { name: s.name, hsp: s.hsp };
    });
    const err = validateExcipientInput(apiHSP, r0, excipients);
    if (err) throw new Error(err);
    return evaluateExcipientCompatibility(apiHSP, r0, excipients);
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

    // Pairwise Flory-Huggins χ calculation using Ra
    const results: Array<{
      polymer1Name: string; polymer2Name: string;
      polymer1HSP: HSPValues; polymer2HSP: HSPValues;
      ra: number; chiParameter: number; miscibility: string;
    }> = [];

    for (const p1 of group1.parts) {
      for (const p2 of group2.parts) {
        const ra = calculateRa(p1.hsp, p2.hsp);
        // χ = (Vref / RT) * (Ra / 2)^2 simplified: χ ∝ Vref * Ra^2 / (R * T)
        // Using Vref in cm³/mol, R = 8.314 J/(mol·K), T = 298.15 K
        const chiParameter = (params.referenceVolume * ra * ra) / (4 * 8.314 * 298.15);
        const chiCritical = 0.5 * (1 / Math.sqrt(params.degreeOfPolymerization) + 1 / Math.sqrt(params.degreeOfPolymerization));
        let miscibility: string;
        if (chiParameter < chiCritical) miscibility = 'miscible';
        else if (chiParameter < chiCritical * 2) miscibility = 'partial';
        else miscibility = 'immiscible';
        results.push({
          polymer1Name: p1.name, polymer2Name: p2.name,
          polymer1HSP: p1.hsp, polymer2HSP: p2.hsp,
          ra, chiParameter, miscibility,
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

    // N×N matrix (representative part per group = first part)
    const matrix: Array<{
      polymer1Name: string; polymer2Name: string;
      ra: number; chiParameter: number; miscibility: string;
    }> = [];

    for (let i = 0; i < groups.length; i++) {
      for (let j = i + 1; j < groups.length; j++) {
        const p1 = groups[i].parts[0];
        const p2 = groups[j].parts[0];
        if (!p1 || !p2) continue;
        const ra = calculateRa(p1.hsp, p2.hsp);
        const chiParameter = (params.referenceVolume * ra * ra) / (4 * 8.314 * 298.15);
        const chiCritical = 0.5 * (1 / Math.sqrt(params.degreeOfPolymerization) + 1 / Math.sqrt(params.degreeOfPolymerization));
        let miscibility: string;
        if (chiParameter < chiCritical) miscibility = 'miscible';
        else if (chiParameter < chiCritical * 2) miscibility = 'partial';
        else miscibility = 'immiscible';
        matrix.push({
          polymer1Name: groups[i].name, polymer2Name: groups[j].name,
          ra, chiParameter, miscibility,
        });
      }
    }

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

    // Screen all solvents as potential compatibilizers
    const solvents = solventRepo.getAllSolvents();
    const results = solvents.map((s) => {
      const raToP1 = calculateRa(s.hsp, p1.hsp);
      const raToP2 = calculateRa(s.hsp, p2.hsp);
      const overallScore = Math.sqrt(raToP1 * raToP2); // geometric mean
      let compatibility: string;
      if (overallScore < 3) compatibility = 'Excellent';
      else if (overallScore < 5) compatibility = 'Good';
      else if (overallScore < 8) compatibility = 'Fair';
      else compatibility = 'Poor';
      return {
        compatibilizerName: s.name, solventId: s.id,
        raToPolymer1: raToP1, raToPolymer2: raToP2,
        overallScore, compatibility,
      };
    });

    results.sort((a, b) => a.overallScore - b.overallScore);

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

    // Linear mixing rule: δ_copolymer = Σ(φ_i × δ_i)
    let deltaD = 0, deltaP = 0, deltaH = 0;
    for (const m of params.monomers) {
      deltaD += m.fraction * m.deltaD;
      deltaP += m.fraction * m.deltaP;
      deltaH += m.fraction * m.deltaH;
    }

    return {
      monomers: params.monomers,
      estimatedHSP: { deltaD, deltaP, deltaH },
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
}
