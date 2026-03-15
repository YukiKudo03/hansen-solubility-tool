/**
 * IPC ハンドラー — メインプロセスの業務ロジックオーケストレーション
 */
import { ipcMain, dialog } from 'electron';
import fs from 'fs';
import type { PartsRepository, SolventRepository, SettingsRepository, NanoParticleRepository } from '../db/repository';
import { calculateRa, calculateRed } from '../core/hsp';
import { classifyRisk } from '../core/risk';
import { classifyDispersibility, DEFAULT_DISPERSIBILITY_THRESHOLDS } from '../core/dispersibility';
import { screenSolvents, filterByConstraints } from '../core/solvent-finder';
import { validatePartInput, validateSolventInput, validateName, validateThresholds, validateMixtureInput, validateNanoParticleInput, validateDispersibilityThresholds, validateWettabilityThresholds } from '../core/validation';
import { calculateMixture } from '../core/mixture';
import { estimateContactAngle } from '../core/contact-angle';
import { DEFAULT_WETTABILITY_THRESHOLDS, classifyWettability } from '../core/wettability';
import type { GroupEvaluationResult, PartEvaluationResult, MixtureComponent, NanoDispersionEvaluationResult, SolventDispersibilityResult, DispersibilityThresholds, SolventConstraints, ContactAngleResult, GroupContactAngleResult, WettabilityThresholds } from '../core/types';

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
}
