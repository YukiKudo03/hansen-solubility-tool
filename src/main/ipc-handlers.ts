/**
 * IPC ハンドラー — メインプロセスの業務ロジックオーケストレーション
 */
import { ipcMain, dialog } from 'electron';
import fs from 'fs';
import type { PartsRepository, SolventRepository, SettingsRepository } from '../db/repository';
import { calculateRa, calculateRed } from '../core/hsp';
import { classifyRisk } from '../core/risk';
import { validatePartInput, validateSolventInput, validateName, validateThresholds } from '../core/validation';
import type { GroupEvaluationResult, PartEvaluationResult } from '../core/types';

export function registerIpcHandlers(
  partsRepo: PartsRepository,
  solventRepo: SolventRepository,
  settingsRepo: SettingsRepository,
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
}
