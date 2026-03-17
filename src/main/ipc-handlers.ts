/**
 * IPC ハンドラー — メインプロセスの業務ロジックオーケストレーション
 */
import { ipcMain, dialog } from 'electron';
import fs from 'fs';
import type { PartsRepository, SolventRepository, SettingsRepository, NanoParticleRepository, DrugRepository } from '../db/repository';
import { calculateRa, calculateRed } from '../core/hsp';
import { classifyRisk } from '../core/risk';
import { classifyDispersibility, DEFAULT_DISPERSIBILITY_THRESHOLDS } from '../core/dispersibility';
import { screenSolvents, filterByConstraints } from '../core/solvent-finder';
import { validatePartInput, validateSolventInput, validateName, validateThresholds, validateMixtureInput, validateNanoParticleInput, validateDispersibilityThresholds, validateWettabilityThresholds, validateBlendOptimizationInput, validateSwellingThresholds, validateDrugInput, validateDrugSolubilityThresholds, validateChemicalResistanceThresholds, validatePlasticizerThresholds, validateCarrierThresholds } from '../core/validation';
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
  bookmarkRepo?: SqliteBookmarkRepository,
  historyRepo?: SqliteHistoryRepository,
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

    const result: GroupContactAngleResult = {
      partsGroup: group,
      solvent: solvents[0],
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
  if (bookmarkRepo) {
    ipcMain.handle('bookmarks:getAll', () => bookmarkRepo.getAll());
    ipcMain.handle('bookmarks:create', (_, dto: CreateBookmarkDto) => bookmarkRepo.create(dto));
    ipcMain.handle('bookmarks:delete', (_, id: number) => bookmarkRepo.delete(id));
  }

  // --- 評価履歴 ---
  if (historyRepo) {
    ipcMain.handle('history:getAll', () => historyRepo.getAll());
    ipcMain.handle('history:getByPipeline', (_, pipeline: string) => historyRepo.getByPipeline(pipeline));
    ipcMain.handle('history:save', (_, entry: SerializedHistoryEntry, note?: string) => historyRepo.create(entry, note));
    ipcMain.handle('history:delete', (_, id: number) => historyRepo.delete(id));
    ipcMain.handle('history:deleteOlderThan', (_, days: number) => historyRepo.deleteOlderThan(days));
  }
}
