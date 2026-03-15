/**
 * Preload API 型定義 — window.api の型
 */
import type { PartsGroup, Solvent, RiskThresholds, GroupEvaluationResult, NanoParticle, NanoParticleCategory, NanoDispersionEvaluationResult, DispersibilityThresholds, SolventConstraints } from './core/types';
import type { CreatePartsGroupDto, CreatePartDto, CreateSolventDto, CreateNanoParticleDto } from './db/repository';

export interface ElectronAPI {
  // 部品グループ
  getAllGroups(): Promise<PartsGroup[]>;
  getGroupById(id: number): Promise<PartsGroup | null>;
  createGroup(dto: CreatePartsGroupDto): Promise<PartsGroup>;
  updateGroup(id: number, dto: Partial<CreatePartsGroupDto>): Promise<PartsGroup | null>;
  deleteGroup(id: number): Promise<boolean>;

  // 部品
  createPart(dto: CreatePartDto): Promise<import('./core/types').Part>;
  updatePart(id: number, dto: Partial<CreatePartDto>): Promise<import('./core/types').Part | null>;
  deletePart(id: number): Promise<boolean>;

  // 溶媒
  getAllSolvents(): Promise<Solvent[]>;
  getSolventById(id: number): Promise<Solvent | null>;
  searchSolvents(query: string): Promise<Solvent[]>;
  createSolvent(dto: CreateSolventDto): Promise<Solvent>;
  updateSolvent(id: number, dto: Partial<CreateSolventDto>): Promise<Solvent | null>;
  deleteSolvent(id: number): Promise<boolean>;
  createMixtureSolvent(dto: { components: { solventId: number; volumeRatio: number }[]; name: string }): Promise<Solvent>;

  // 評価
  evaluate(partsGroupId: number, solventId: number): Promise<GroupEvaluationResult>;

  // 設定
  getThresholds(): Promise<RiskThresholds>;
  setThresholds(thresholds: RiskThresholds): Promise<void>;

  // CSV保存
  saveCsv(csvContent: string): Promise<{ saved: boolean; filePath?: string }>;

  // ナノ粒子
  getAllNanoParticles(): Promise<NanoParticle[]>;
  getNanoParticleById(id: number): Promise<NanoParticle | null>;
  getNanoParticlesByCategory(category: string): Promise<NanoParticle[]>;
  searchNanoParticles(query: string): Promise<NanoParticle[]>;
  createNanoParticle(dto: CreateNanoParticleDto): Promise<NanoParticle>;
  updateNanoParticle(id: number, dto: Partial<CreateNanoParticleDto>): Promise<NanoParticle | null>;
  deleteNanoParticle(id: number): Promise<boolean>;

  // ナノ粒子分散評価
  evaluateNanoDispersion(particleId: number, solventId: number): Promise<NanoDispersionEvaluationResult>;
  screenAllSolvents(particleId: number): Promise<NanoDispersionEvaluationResult>;
  screenFilteredSolvents(particleId: number, constraints: SolventConstraints): Promise<NanoDispersionEvaluationResult>;

  // 分散性閾値設定
  getDispersibilityThresholds(): Promise<DispersibilityThresholds>;
  setDispersibilityThresholds(thresholds: DispersibilityThresholds): Promise<void>;
}

declare global {
  interface Window {
    api: ElectronAPI;
  }
}
